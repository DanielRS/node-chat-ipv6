var
	dgram = require('dgram');

var sock = dgram.createSocket({
	type: 'udp6',
	reuseAddr: true
});

sock.bind(25000, function() {
	sock.addMembership('ff05::114');
});

sock.on('listening', function() {
	console.log('TE OYO');
});

sock.on('message', function(message, remote) {

	console.log();
	console.log(message.toString());
	console.log(remote);

	var buff = new Buffer('MAMALO Linux');
	sock.send(buff, 0, buff.length, remote.port, remote.address);

	console.log('Linux told to suck it');
});