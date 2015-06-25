var
	EventEmitter = require('events').EventEmitter,
	inherits = require('util').inherits;

// ----------------
// TCPWrapper
// ----------------
// Just a wrapper that processes the stream
// and generates a message event

function TCPWrapper(sock) {
	EventEmitter.call(this);

	var
		self = this,
		buffer = '';

	sock.on('data', function(data) {
		buffer += data;

		var
			boundary = buffer.indexOf('\n');

		while (boundary != -1) {
			input = buffer.substr(0, boundary);
			buffer = buffer.substr(boundary + 1);
			boundary = buffer.indexOf('\n');
			self.emit('message', input);
		}
	});
}
inherits(TCPWrapper, EventEmitter);

// ----------------
// Exports
// ----------------

module.exports = TCPWrapper;