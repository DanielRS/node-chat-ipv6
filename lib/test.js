var
	dgram = require('dgram');

// ----------------

var sock = dgram.createSocket({
	type: 'udp6',
	reuseAddr: true
});

sock.bind(25000, function() {
	sock.addMembership('ff02:c4a1::0');
});

sock.on('message', function(message, remote) {
	console.log();
	console.log(message.toString());
	console.log(remote);

	var buff = new Buffer('MAMALO A');
	sock.send(buff, 0, buff.length, remote.port, remote.address);
});