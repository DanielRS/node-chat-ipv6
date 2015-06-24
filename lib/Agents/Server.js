var
	dgram = require('dgram'),
	inherits = require('util').inherits,
	net = require('net'),
	uuid = require('uuid'),

	Base = require('./Base'),
	addrs = require('../Misc/addresses'),
	msgs = require('../Misc/messages');

// ----------------
// Server class
// ----------------
// This server class contains information about
// groups (for example: name)

function Server() {
	Base.call(this, addrs.channels.server);

	this._server = net.createServer();
	this._server.on('connection', this.connectionHandler);
	
	// The data for the groups (name, connected clients, etc)
	this._groups = {};

	// The groups a client is connected to
	this._sock_groups = {};
}
inherits(Server, Base);

// function joinGroup
// @param sock_uuid the socket uuid that wants to join the group
// @param group_uuid the group to join
// @returns true if the join was successful
// false otherwise
Server.prototype.joinGroup = function(sock_uuid, group_uuid) {
	// check if group exists
	if (this._groups[group_uuid]) {

		// Creates new sock group object
		if (!this._sock_groups[sock_uuid]) {
			this._sock_groups[sock_uuid] = {};
		}

		// Does the client already joined the group?
		if (!this._sock_groups[sock_uuid][group_uuid]) {
			this._groups[group_uuid].members++;
		}

		// Joins the group
		this._sock_groups[sock_uuid][group_uuid] = true;

		return true;
	}

	return false;
}

// function leaveGroup
// @param sock_uuid the sock that wishes to leave the group
// @param group_uuid the group that the socket wants to leave (heh)
// @returns true on success
// false otherwise (probably the group doesn't exists if false
// is returned)
Server.prototype.leaveGroup = function(sock_uuid, group_uuid) {

	if (this._groups[group_uuid] && this._sock_groups[sock_uuid]) {
		if (this._sock_groups[sock_uuid][group_uuid]) {
			this._groups[group_uuid].members--;
			delete this._sock_groups[sock_uuid][group_uuid];
			return true;
		}
	}

	return false;
}

Server.prototype.getGroups = function() {
	var array = [];
	for (key in this._groups) {
		array.push(this._groups[key].channel);
	}
	return array;
}

Server.prototype.connectionHandler = function(sock) {
	
	var self = this;
	// Unique reference to this socket
	var sock_uuid = uuid.v1();

	sock.on('data', function(data) {
		self.dataHandler(sock, sock_uuid, data);
	});

	sock.on('close', function(data) {
		self.closeHandler(sock, sock_uuid, data);
	});

}

Server.prototype.dataHandler = function(sock, sock_uuid, data) {
	self = this;

	data = JSON.parse(data.toString());

	// Handle type
	switch(data.type) {

		case msgs.types.GROUP_CREATE:
			// Group creation logic
			var group_profile = {
				uuid: uuid.v1(),
				name: data.getGroups.name,
				created_by: sock_uuid,
				creation_date: Date.now(),
				members: 0,
				channel: addrs.getMulticast(this.getGroups())
			}
			this._groups[group_profile.uuid] = group_profile;

			// Joins the group
			joinGroup(sock_uuid, group_profile.uuid);

			// GROUP_CREATE_OK message
			var message = new msgs.GroupMessage(
				msgs.types.GROUP_CREATE_OK,
				this.getProfile(),
				group_profile
			);
			sock.write(message.toString());
			break;
		
		case msgs.types.GROUP_JOIN:
			var joined = joinGroup(sock_uuid, data.extras.uuid);

			if (joined) {
				// Send GROUP_JOIN_OK
				var message = new msgs.GroupMessage(
					msgs.types.GROUP_JOIN_OK,
					this.getProfile(),
					this._groups[data.extras.uuid]
				);
				sock.write(message.toString());
			} else {
				// Send GROUP_JOIN_ERR
				var message = new msgs.GroupMessage(
					msgs.types.GROUP_JOIN_ERR,
					"Group with ID " + data.extras.uuid +
					" doesn't exists!"
				);
				sock.write(message.toString());
			}
			break;
		
		case msgs.types.GROUP_LEAVE:
			// Group leave logic
			var left = leaveGroup(sock_uuid, data.extras.uuid);

			if (left) {
				var message = new msgs.GroupMessage(
					msgs.types.GROUP_LEAVE_OK,
					this.getProfile(),
					this._groups[data.extras.uuid]
				);
				sock.write(message.toString());
			} else {
				var message = new msgs.GroupMessage(
					msgs.types.GROUP_LEAVE_ERR,
					'Unable to leave the group (group doesn\'t exists?)'
				);
				sock.write(message.toString());
			}
			break;
		default:
			break;
	} // switch
}

Server.prototype.closeHandler = function(sock, sock_uuid, data) {

	// Socket leaves all the groups
	if (this._sock_groups[sock_uuid]) {
		for (group in this._sock_groups[sock_uuid]) {
			this._groups[group].members--;	
		}
	}

	delete this._sock_groups[sock_uuid];
}

// ----------------
// Private methods

// @override
Server.prototype._messageHandler = function(message, remote) {

	console.log('Server received a message...');

	var sender_chan = new addrs.Channel(remote.address, remote.port);

	var data = JSON.parse(message);

	switch(data.type) {
		case msgs.types.SERVER_SOLICITATION:
			var message = new msgs.Message(
				msgs.types.SERVER_ADVERTISEMENT,
				this.getProfile(),
				'Server advertisement...'
			);
			this.sendUDP(sender_chan, message.toString());
	}
}

// ----------------
// Exports
// ----------------

module.exports = Server