var
	dgram = require('dgram'),
	EventEmitter = require('events').EventEmitter,
	inherits = require('util').inherits,
	net = require('net'),
	uuid = require('uuid'),

	addrs = require('./addresses'),
	msgs = require('./messages'),
	neigh = require('./neigh');

// ----------------
// Profile container
// ----------------
// Container for neighbor cache

function Profile(uuid, alias, chan) {
	this.uuid = uuid;
	this.alias = alias;
	this.channel = chan;
}

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

	this._uuid = uuid.v1();
	this.alias = this._uuid;
	this._channel = chan;
	this._listening = false;

	// Client cache
	this._client_cache = new neigh.NeighborManager();

	// Sockets
	this._sock = dgram.createSocket({
		type: 'udp6',
		reuseAddr: true
	});
	this._server_sock = new net.Socket();

	// Tries to connect
	this.connect();
};
inherits(Client, EventEmitter);

// ----------------
// Public methods

// function connect
// connects to server
Client.prototype.start = function() {
	var self = this;

	// Close anything used before
	this.close();

	this._server_sock.connect(addrs.SERVER_PORT, addrs.SERVER_ADDRESS);

	// ----------------
	// Connect

	this._server_sock.on('connect', function() {
		
		self._sock.bind(chan.port, function() {
			self._sock.addMembership(chan.address);
		});

		// Multicast socket events
		self._sock.on('listening', function() {
			self._channel = chan;
			self._listening = true;

			self.emit('listening', arguments);
		});

		self._sock.on('message', function(message, remote) {
			self._messageHandler(message, remote);
		});

		self._sock.on('close', function() {
			self._listening = false;
			self.emit('close', arguments);
		});
	});

	// ----------------
	// Error and data

	this._server_sock.on('error', function(err) {
		console.log('Error connecting to server: ', err.stack);
		self.close();
		process.exit(1);
	});

	this._server_sock.on('data', function(data) {
		self._serverMessageHandler(data);
	});
}

// ----------------

Client.prototype.close = function() {
	this._sock.close();
	this._server_sock.end();
	this._listening = false;
}

// ----------------

Client.prototype.joinChannel = function(channel) {
	if (this.isListening) {
		this._sock.addMembership(channel.address);
	}
}

Client.prototype.leaveChannel = function(channel) {
	if (this.isListening) {
		this._sock.dropMembership(channel.address);
	}
}

// ----------------

Client.prototype.isListening = function() {
	return this._listening;
};

// ----------------

Client.prototype.getProfile = function() {
	return new Profile(this._uuid, this.alias, this._channel);
}

// function send
// @param chan the Channel to which send the message
// @param message the message
// @returns undefined
Client.prototype.send = function(chan, message) {
	if (this.isListening()) {
		var buff = new Buffer(message);
		this._sock.send(buff, 0, buff.length, chan.port, chan.address);
	} else {
		console.log('Client.send: client is not listening');
	}
}

// ----------------

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

	this.send(this._channel, message.toString());
}

// function updateGroupCache
// Sends a GROUP_SOLICITATION message to the
// channel to which this client is connected
Client.prototype.updateGroupCache = function() {
	var message = new msgs.Message(
		msgs.types.GROUP_SOLICITATION,
		this.getProfile()
	);

	this.send(this._channel, message.toString());
}

// ----------------
// Private methods

// function _serverMessageHandler
// handles the messages comming from the server
// @param data the data received
// @returns undefined
Client.prototype._serverMessageHandler = function(data) {

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
		// General messages handling

		case msgs.types.CLIENT_ONLINE:
		case msgs.types.CLIENT_REPORT:
		case msgs.types.CLIENT_ADVERTISEMENT:
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
			this.send(sender.channel, message.toString());
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
			// We received an unicast message
			break;
	} // switch	

} // messageHandler

// ----------------
// Exports
// ----------------

module.exports = Client;