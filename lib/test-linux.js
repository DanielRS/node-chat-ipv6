var
	dgram = require('dgram');

var sock = dgram.createSocket({
	type: 'udp6',
	reuseAddr: true
});

sock.bind(25000, function() {
	sock.addMembership('ff05::114');
});

sock.on('message', function(message, remote) {
	console.log();
	console.log(message.toString());
	console.log(remote);
});

// ----------------

sock.on('listening', function() {
	var buff = new Buffer('MAMALO Windows');
	sock.send(buff, 0, buff.length, 25000, 'ff05::114');
});