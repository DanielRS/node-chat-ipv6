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
// Events

// listening
// close

// ----------------
// Class declaration

function Client(chan) {
	Base.call(this, chan);

	var self = this;

	// Client cache
	this._client_cache = new neigh.NeighborManager();

	// ----------------
	// Server socket

	this._server_sock = new net.Socket();

	// When socket is ready try to find server
	this.on('listening', function(){

		self.findServer;

		var message = new msgs.Message(
			msgs.types.CLIENT_ADVERTISEMENT,
			self.getProfile(),
			"I'm Here ..."
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
}

// function connect
// stablish a TCP connection to given address and port.
// Used for connecting to a server
Client.prototype.connect = function(address, port) {

	var addr = address + ':' + port;

	this._server_sock.connect(port, address);
	
	// Data arrives
	this._server_sock.on('data', this._tcpMessageHandler);
	
	// Connection status
	this._server_sock.on('connect', function() {
		console.log('Connected to server: ' + addr);
	});

	this._server_sock.on('close', function() {
		console.log('Disconnected from server: ' + addr);
	});

	this._server_sock.on('error', function() {
		console.log('Unable to conect to server: ' + addr)
	});
}


// @override
Client.prototype.close = function() {
	Base.prototype.close.call(this);
	if (this._server_sock)
		this._server_sock.end();
}

Client.prototype.createGroup = function(group_name) {
	// Gets Multicast address from server
	// Creates group socket
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

		case msgs.types.GROUP_CREATE_OK:
			break;
		case msgs.types.GROUP_JOIN_OK:
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

	// Checks that this message isn't comming from us
	if (data.sender.uuid == this._uuid) return;

	switch(data.type) {

		// ----------------
		// Server messages
		case msgs.types.SERVER_ADVERTISEMENT:
			this.connect(remote.address, remote.port);
			break;

		// ----------------
		// General messages handling

		case msgs.types.CLIENT_ONLINE:
		case msgs.types.CLIENT_REPORT:
		case msgs.types.CLIENT_ADVERTISEMENT:

			this._client_cache.addNeighbor(new neigh.Neighbor(data.sender.uuid, data.sender));

			// Save client in cache

			break;
		case msgs.types.CLIENT_CHANGE:
			// Update client data
			break;
		case msgs.types.CLIENT_SOLICITATION:
			// Tell client we are online
			var message = new msgs.Message(
				msgs.types.CLIENT_REPORT,
				this.getProfile()
			);
			this.sendUDP(this._channel, message.toString());
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

		case msgs.types.GROUP_CREATE:
			// Group was created, save it in neighbor-group list
			break;
		case msgs.types.GROUP_DELETE:
			// Group deleted, remove it from neighbor-group list
			break;
		case msgs.types.GROUP_JOIN:
			// Client is trying to join a group (maybe of ours)
			break;
		case msgs.types.GROUP_LEAVE:
			// Somebody is leaving a group
			break;
		case msgs.types.GROUP_MESSAGE:
			// Messages to a group
			break;
		case msgs.types.GROUP_JOIN_OK:
			// We were able to join a group
			break;
		case msgs.types.GROUP_JOIN_ERR:
			// We weren't able to join a group
			break;
		case msgs.types.SINGLE_MESSAGE:

			this.emit('single-message', data.sender, data.extras);
			// We received an unicast message
			break;
	} // switch	

} // messageHandler

// ----------------
// Exports
// ----------------

module.exports = Client;