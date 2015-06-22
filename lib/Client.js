var
	EventEmitter = require('events').EventEmitter,
	dgram = require('dgram'),
	inherits = require('util').inherits,
	uuid = require('uuid'),

	addrs = require('./addresses'),
	msgs = require('./messages'),
	neigh = require('./neigh');

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
	var self = this;
	
	this._uuid = uuid.v1();
	this.alias = this._uuid;
	this._channel = chan;
	this._listening = false;

	// Neighbors
	this._neigh_clients = new neigh.NeighborManager();
	this._neigh_groups = new neigh.NeighborManager();

	// Tries to connect
	this.start(chan);
};
inherits(Client, EventEmitter);

// ----------------
// Public methods

Client.prototype.start = function(chan) {
	var self = this;

	// Tries to close the current client
	this.close();

	// ----------------
	// Socket initialization

	this._sock = dgram.createSocket({
		type: 'udp6',
		reuseAddr: true
	});

	this._sock.bind(chan.port, function() {
		self._sock.addMembership(chan.address);
	});

	// ----------------
	// Sockets events

	this._sock.on('listening', function() {
		self._channel = chan;
		self._listening = true;

		self.emit('listening', arguments);
	});

	this._sock.on('message', function(message, remote) {
		self._messageHandler(message, remote);
	});

	this._sock.on('close', function() {
		self._listening = false;
		self.emit('close', arguments);
	});
}

// ----------------

Client.prototype.close = function() {
	if (this._sock !== undefined && 'close' in this._sock)
		this._sock.close();
	this._listening = false;
}

// ----------------

Client.prototype.isListening = function() {
	return this.listening;
};

// ----------------

// function send
// @param chan the Channel to which send the message
// @param message the message
// @returns undefined
Client.prototype.send = function(chan, message) {
	var buff = new Buffer(message);
	this._sock.send(buff, 0, buff.length, chan.port, chan.address);
}

// ----------------

Client.prototype.createGroup = function(group_name) {
}

Client.prototype.updateNeighborClients = function() {
	var message = new msgs.Message(
		msgs.types.CLIENT_SOLICITATION,
		this._uuid
	);

	this.send(addrs.channels.everyone, message.toString());
}

// ----------------
// Private methods

// function _messageHandler
// @param message buffer of the message
// @remote object that contains the address and port of the sender
// @returns undefined
Client.prototype._messageHandler = function(message, remote) {

	try {
		sender_chan = new addrs.Channel(remote.address, remote.port);
		
		var data = JSON.parse(message.toString());

		// Checks that this message isn't comming from us
		if (data.sender == this._uuid) return;

		switch(data.type) {

			// ----------------
			// General messages handling

			case msgs.types.CLIENT_ONLINE:
			case msgs.types.CLIENT_REPORT:
			case msgs.types.CLIENT_ADVERTISEMENT:
				// Save client in list of neighbors
				console.log('Somebody is around!');
				break;
			case msgs.types.CLIENT_CHANGE:
				// Update client data
				break;
			case msgs.types.CLIENT_SOLICITATION:
				// Tell client we are online
				var message = new msgs.Message(
					msgs.types.CLIENT_REPORT,
					this._uuid
				);
				this.send(sender_chan, message.toString());
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

	} catch (err) {
		console.log(err);
	}

} // messageHandler

// ----------------
// Exports
// ----------------

module.exports = Client;