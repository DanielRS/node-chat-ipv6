var
	dgram = require('dgram'),
	EventEmitter = require('events').EventEmitter,
	inherits = require('util').inherits,
	net = require('net'),
	uuid = require('uuid'),

	Base = require('./Base'),
	addrs = require('../Misc/addresses'),
	msgs = require('../Misc/messages'),
	neigh = require('../Misc/neigh');

// ----------------
// Client class
// ----------------
// Main client class
// Inherits from: EventEmitter

// ----------------
// Events emitted by this class

// server-connect
// server-close
// sever-error

// client-change
// client-cache-updated

// single-message

// listening
// close


// ----------------
// Class declaration

function Client(chan) {
	Base.call(this, chan);

	var self = this;

	// The groups the client has joined
	this._groups = {};

	// Client and group cache
	this._client_cache = new neigh.NeighborManager();
	this._group_cache = new neigh.NeighborManager();

	// ----------------
	// Server socket

	this._server_sock = new net.Socket();

	// When socket is ready try to find server
	this.on('listening', function(){
		self.findServer();

		var message = new msgs.Message(
			msgs.types.CLIENT_ADVERTISEMENT,
			self.getProfile(),
			"I'm Here..."
		);

		self.sendUDP(self._channel, message.toString());

	});
};
inherits(Client, Base);

// ----------------
// Public methods

// function findServer
// tries to find a server by sending a SERVER_SOLICITATION
// message. Fires server-found event.
Client.prototype.findServer = function() {
	var message = new msgs.Message(
		msgs.types.SERVER_SOLICITATION,
		this.getProfile(),
		"Server solicitation..."
	);
	this.sendUDP(this._channel, message.toString());

	console.log('SERVER_SOLICITATION sent...');
}

// function connect
// stablish a TCP connection to given address and port.
// Used for connecting to a server
Client.prototype.connect = function(address, port) {
	var self = this;
	var addr = address + ':' + port;

	this._server_sock.connect(port, address);
	
	// Data arrives
	this._server_sock.on('data', this._tcpMessageHandler);
	
	// Connection status
	this._server_sock.on('connect', function() {
		self.emit('server-connect');
	});

	this._server_sock.on('close', function() {
		self.emit('server-close');
	});

	this._server_sock.on('error', function(err) {
		self.emit('server-error', err);
	});
}


// @override
Client.prototype.close = function() {
	Base.prototype.close.call(this);
	if (this._server_sock)
		this._server_sock.end();
}


Client.prototype.createGroup = function(group_name) {
	// Sends a GROUP_CREATE message

	if (this._server_sock.writable) {

		var message = new msgs.Message(
			msgs.types.GROUP_CREATE,
			this.getProfile(),
			{
				name: group_name,
				comments: 'let m crat it plz'
			}
		);
		
		this._server_sock.write(message.toString());
	}
}

Client.prototype.joinGroup = function(group_uuid) {
	// Sends a GROUP_JOIN message

	if (this._server_sock.writable) {

		var message = new msgs.Message(
			msgs.types.GROUP_JOIN,
			this.getProfile(),
			{
				uuid: group_uuid,
				comments: 'let me jion plz'
			}
		);

		this._server_sock.write(message.toString());
	}
}

Client.prototype.leaveGroup = function(group_uuid) {
	// Sends GROUP_LEAVE message

	if (this._server_sock.writable) {

		var message = new msgs.Message(
			msgs.types.GROUP_LEAVE,
			this.getProfile(),
			{
				uuid: group_uuid,
				comments: 'let m go plz'
			}
		);

		this._server_sock.write(message.toString());
	}
}

// function updateClientCache
// Sends a CLIENT_SOLICITATION message to the
// channel to which this client is connected
Client.prototype.updateClientCache = function() {
	var message = new msgs.Message(
		msgs.types.CLIENT_SOLICITATION,
		this.getProfile()
	);

	this.sendUDP(this._channel, message.toString());
}

Client.prototype.getClientCache = function() {
	return this._client_cache.getNeighbors();
}

Client.prototype.setAlias = function(alias) {
	var message = new msgs.Message(

		msgs.types.CLIENT_CHANGE,
		this.getProfile(),
		{
			old_name: this.alias,
			new_name: alias
		}

	);

	this.sendUDP(this._channel, message.toString());

	this.alias = alias;
}

// function updateAlias
// @param uuid neighbor id
// @param message sended by neighbor
// @return undefined

Client.prototype.updateAlias = function(uuid, message){

	var neighbor = this.getClientCache()[uuid].data;
	console.log('old alias ${neighbor.alias}');
	console.log();
	neighbor.alias = message.new_name;
	console.log('new alias ${neighbor.alias}');

	this.emit('client-change', uuid, message);

}

// ----------------
// Private methods

// function _tcpMessageHandler
// handles the messages comming from the server
// @param data the data received
// @returns undefined
Client.prototype._tcpMessageHandler = function(data) {

	// JSON parse
	data = JSON.parse(data.toString());

	switch(data.type) {

		// GROUP_*_OK
		case msgs.types.GROUP_CREATE_OK:
			// Tell everyone that we just created a group
			var message = new msgs.Message(
				msgs.types.GROUP_CREATE_OK,
				this.getProfile(),
				data.extras
			);
			this.sendUDP(this._channel, message.toString());
		case msgs.types.GROUP_JOIN_OK:
			this._sock.addMembership(data.extras.channel.address);
			// Tell group that we joined
			var message = new msgs.Message(
				msgs.types.GROUP_JOIN_OK,
				this.getProfile(),
				'Joined!'
			);
			this.sendUDP(data.extras.channel, message.toString());
			break;

		case msgs.types.GROUP_LEAVE_OK:
			// Tell group that we left
			var message = new msgs.Message(
				msgs.types.GROUP_LEAVE_OK,
				this.getProfile(),
				'Left!'
			);
			this.sendUDP(data.extras.channel, message.toString());
			this._sock.dropMembership(data.extras.channel.address);
			break;

		// GROUP_*_ERR
		case msgs.types.GROUP_CREATE_ERR:
			break;
		case msgs.types.GROUP_JOIN_ERR:
			break;
		case msgs.types.GROUP_LEAVE_OK:
			break;
	}
}


// function _messageHandler
// @param message buffer of the message
// @remote object that contains the address and port of the sender
// @returns undefined
Client.prototype._messageHandler = function(message, remote) {

	
	var data = JSON.parse(message.toString());
	console.log(data);

	// Checks that this message isn't comming from us
	if (data.sender.uuid == this._uuid) return;

	// Fixes the channel of the sender
	data.sender.channel = new addrs.Channel(remote.address, remote.port);

	switch(data.type) {

		// ----------------
		// Server messages
		case msgs.types.SERVER_ADVERTISEMENT:
			this.connect(remote.address, remote.port);
			break;

		// ----------------
		// General messages handling

		case msgs.types.CLIENT_ONLINE:
		case msgs.types.CLIENT_ADVERTISEMENT:
			// Save client in cache
			this._client_cache.addNeighbor(new neigh.Neighbor(data.sender.uuid, data.sender));
			this.emit('client-cache-updated');

			break;
		case msgs.types.CLIENT_CHANGE:
			// Update client data

			this.updateAlias(data.sender.uuid, data.extras);

			break;
		case msgs.types.CLIENT_SOLICITATION:
			// Tell client we are online
			var message = new msgs.Message(
				msgs.types.CLIENT_ADVERTISEMENT,
				this.getProfile()
			);

			this.sendUDP(data.sender.channel, message.toString());
			break;
		case msgs.types.CLIENT_OFFLINE:
			// Delete client from list of neighbors
			break;

		// ----------------
		// All / Group messages handling

		case msgs.types.GROUP_SOLICITATION:
			// Tell client of all groups we have
			break;
		case msgs.types.GROUP_ADVERTISEMENT:
			// Save group in neighbor-groups list
			break;

		// ----------------
		// Single / Group messages handling

		case msgs.types.GROUP_CREATE_OK:
			// Group was created, save it in neighbor-group list
			this._group_cache.addNeighbor(new neigh.Neighbor(data.extras.uuid, data.extras));
			break;
		case msgs.types.GROUP_JOIN_OK:
			// Client is trying to join a group
			// Probably a group we joined too!
			break;
		case msgs.types.GROUP_LEAVE_OK:
			// Somebody is leaving a group
			// Probably a group we joined too!
			break;
		
		case msgs.types.GROUP_MESSAGE:
			// Messages to a group
			break;
		case msgs.types.SINGLE_MESSAGE:
			// We received an unicast message
			this.emit('single-message', data.sender, data.extras);
			break;
	} // switch	

} // messageHandler

// ----------------
// Exports
// ----------------

module.exports = Client;