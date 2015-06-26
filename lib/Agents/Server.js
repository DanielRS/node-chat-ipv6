var
	dgram = require('dgram'),
	inherits = require('util').inherits,
	net = require('net'),
	uuid = require('uuid'),

	Base = require('./Base'),
	addrs = require('../Misc/addresses'),
	msgs = require('../Misc/messages'),
	TCPWrapper = require('../Misc/TCPWrapper');

// ----------------
// Server class
// ----------------
// This server class contains information about
// groups (for example: name)

function Server(chan) {
	Base.call(this, chan);

	var self = this;

	this._server = net.createServer();
	this._server.listen(chan.port);
	
	this._server.on('connection', function(sock) {
		self._connectionHandler(sock);
	});
	
	// The data for the groups (name, connected clients, etc)
	this._groups = {};

	// The groups a client is connected to
	this._sock_groups = {};
}
inherits(Server, Base);

// ----------------
// Server advertisement

// @override
Server.prototype._messageHandler = function(message, remote) {

	console.log('Server received UDP message...');

	var sender_chan = new addrs.Channel(remote.address, remote.port);

	var data = JSON.parse(message);

	switch(data.type) {
		case msgs.types.SERVER_SOLICITATION:
			var message = new msgs.Message(
				msgs.types.SERVER_ADVERTISEMENT,
				this.getProfile(),
				this._server.address()
			);
			this.sendUDP(sender_chan, message.toString());
	}
}

// ----------------
// Server group handling

// function _joinGroup
// @param sock_uuid the socket uuid that wants to join the group
// @param group_uuid the group to join
// @returns true if the join was successful
// false otherwise
Server.prototype._joinGroup = function(sock_uuid, client_uuid, group_uuid) {
	// check if group exists
	if (this._groups[group_uuid]) {

		// Creates new sock group object
		if (!this._sock_groups[sock_uuid]) {
			this._sock_groups[sock_uuid] = {};
		}

		// Does the client already joined the group?
		if (!this._sock_groups[sock_uuid][group_uuid]) {
			this._groups[group_uuid].members[sock_uuid] = client_uuid;
			// Joins the group
			this._sock_groups[sock_uuid][group_uuid] = true;
		}

		return true;
	}

	return false;
}

// function _leaveGroup
// @param sock_uuid the sock that wishes to leave the group
// @param group_uuid the group that the socket wants to leave (heh)
// @returns true on success
// false otherwise (probably the group doesn't exists if false
// is returned)
Server.prototype._leaveGroup = function(sock_uuid, group_uuid) {

	if (this._groups[group_uuid] && this._sock_groups[sock_uuid]) {
		if (this._sock_groups[sock_uuid][group_uuid]) {
			
			// Deletes group association
			delete this._groups[group_uuid].members[sock_uuid];
			delete this._sock_groups[sock_uuid][group_uuid];

			if (Object.keys(this._groups[group_uuid].members).length <= 0)
				delete this._groups[group_uuid];

			return true;
		}
	}

	return false;
}

// function _getRawGroups
// @returns an array of RawChannels
Server.prototype._getRawGroups = function() {
	var array = [];
	for (key in this._groups) {
		array.push(this._groups[key].channel);
	}
	return array;
}

Server.prototype._connectionHandler = function(sock) {

	var self = this;

	// Unique reference to this socket
	var sock_uuid = uuid.v1();
	console.log('> Socket "' + sock_uuid + '" connected...');

	// Handling of data
	var tcp_wrapper = new TCPWrapper(sock);
	tcp_wrapper.on('message', function(message) {
		self._tcpMessageHandler(sock, sock_uuid, message);
	});

	// Handling events
	sock.on('end', function() {
		sock.end();
	});

	sock.on('error', function(err) {
		console.log('> Socket "' + sock_uuid + '" error:');
		console.log(err)
	});

	sock.on('close', function(data) {
		console.log('> Socket "' + sock_uuid + '" disconnected...');
		self._closeHandler(sock, sock_uuid, data);
	});

}

Server.prototype._tcpMessageHandler = function(sock, sock_uuid, data) {
	
	console.log('> Server received TCP message...');
	
	var self = this;

	data = JSON.parse(data.toString());

	// Handle type
	switch(data.type) {

		case msgs.types.GROUP_CREATE:
			// Group creation

			// generates group multicast address
			var new_group_channel = addrs.getMulticast(this._getRawGroups());

			var group_profile = {
				uuid: uuid.v1(),
				name: data.extras.name,
				created_by: data.sender.uuid,
				creation_date: Date.now(),
				members: {},
				channel: new_group_channel
			}
			this._groups[group_profile.uuid] = group_profile;

			// Joins the group
			this._joinGroup(sock_uuid, data.sender.uuid, group_profile.uuid);

			// GROUP_CREATE_OK message
			var message = new msgs.Message(
				msgs.types.GROUP_CREATE_OK,
				this.getProfile(),
				group_profile
			);
			sock.write(message.toString());

			console.log('> Client: ' + data.sender.uuid);
			console.log('  Created group: ' + data.extras.name);
			break;
		
		case msgs.types.GROUP_JOIN:
			var joined = this._joinGroup(sock_uuid, data.sender.uuid, data.extras.uuid);

			if (joined) {
				// Send GROUP_JOIN_OK
				var message = new msgs.Message(
					msgs.types.GROUP_JOIN_OK,
					this.getProfile(),
					this._groups[data.extras.uuid]
				);
				sock.write(message.toString());
				
				console.log('> Client: ' + data.sender.uuid);
				console.log('  Joined group: ' + this._groups[data.extras.uuid].name);
			} else {
				// Send GROUP_JOIN_ERR
				var message = new msgs.Message(
					msgs.types.GROUP_JOIN_ERR,
					"Group with ID " + data.extras.uuid +
					" doesn't exists!"
				);
				sock.write(message.toString());
			}

			break;
		
		case msgs.types.GROUP_LEAVE:
			// Group leave logic
			var group_profile = this._groups[data.extras.uuid];
			var left = this._leaveGroup(sock_uuid, data.extras.uuid);

			if (left) {
				var message = new msgs.Message(
					msgs.types.GROUP_LEAVE_OK,
					this.getProfile(),
					group_profile
				);
				sock.write(message.toString());

				console.log('> Client: ' + data.sender.uuid);
				console.log('  Left group: ' + group_profile.name);
			} else {
				var message = new msgs.Message(
					msgs.types.GROUP_LEAVE_ERR,
					'Unable to leave the group (group doesn\'t exists?)'
				);
				sock.write(message.toString());
			}
			break;

		// ----------------
		// Group solicitation & advertisement

		case msgs.types.GROUP_SOLICITATION:
			var message = new msgs.Message(
				msgs.types.GROUP_ADVERTISEMENT,
				this.getProfile(),
				this._groups
			);
			sock.write(message.toString());
			break;
	} // switch
} // _tcpMessageHandler

Server.prototype._closeHandler = function(sock, sock_uuid, data) {

	// Socket leaves all the groups he joined
	if (this._sock_groups[sock_uuid]) {
		for (group_uuid in this._sock_groups[sock_uuid]) {
			this._leaveGroup(sock_uuid, group_uuid);
		}
	}

	delete this._sock_groups[sock_uuid];
}



// ----------------
// Exports
// ----------------

module.exports = Server