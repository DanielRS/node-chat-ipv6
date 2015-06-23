var
	dgram = require('dgram'),
	EventEmitter = require('events').EventEmitter,
	inherits = require('util').inherits,
	uuid = require('uuid');

// ----------------
// Profile
// ----------------

function Profile(uuid, alias, channel) {
	this.uuid = uuid;
	this.alias = alias;
	this.channel = channel;
}

// ----------------
// Base class
// ----------------
// Main client class
// Inherits from: EventEmitter

// ----------------
// Events

// listening
// close

// ----------------
// Class declaration

function Base(chan) {

	this._uuid = uuid.v1();
	this.alias = this._uuid;
	this._channel = chan;
	this._listening = false;

	this._sock = dgram.createSocket({
		type: 'udp6',
		reuseAddr: true
	});

	// Tries to connect
	this.start(chan);
};
inherits(Base, EventEmitter);

// ----------------
// Public methods

// function connect
// connects to server
Base.prototype.start = function(chan) {
	var self = this;

	// Close anything used before
	this.close();
		
	// Binding
	this._sock.bind(chan.port, function() {
		self._sock.addMembership(chan.address);
	});

	// Multicast socket events
	this._sock.on('listening', function() {
		self._channel = chan;
		self._listening = true;
		self.emit('listening', arguments);
	});

	this._sock.on('message', function(message, remote) {
		self._messageHandler(message, remote);
	});
}

// ----------------

Base.prototype.close = function() {
	if (this.isListening())
		this._sock.close();
	this._listening = false;
	this.emit('close');
}

// ----------------

Base.prototype.isListening = function() {
	return this._listening;
};

// ----------------

Base.prototype.getProfile = function() {
	return new Profile(this._uuid, this.alias, this._channel);
}

// function send
// @param chan the Channel to which send the message
// @param message the message
// @returns undefined
Base.prototype.sendUDP = function(chan, message) {
	if (this.isListening()) {
		var buff = new Buffer(message);
		this._sock.send(buff, 0, buff.length, chan.port, chan.address);
	} else {
		console.log('sendUDP: agent is not listening');
	}
}

// ----------------
// Private methods

// function _messageHandler
// @param message buffer of the message
// @remote object that contains the address and port of the sender
// @returns undefined
Base.prototype._messageHandler = function(message, remote) {
	// STUB BODY
} // messageHandler

// ----------------
// Exports
// ----------------

module.exports = Base;