var
	dgram = require('dgram');

var ca = dgram.createSocket({
	type: 'udp6',
	reuseAddr: true
});

ca.bind(25000, function() {
	ca.addMembership('ff02:c4a1::0');
});

ca.on('message', function(message, remote) {
	console.log();
	console.log(message.toString());
	console.log(remote);
});

// ----------------

ca.on('listening', function() {
	var buff = new Buffer('MAMALO B');
	ca.send(buff, 0, buff.length, 25000, 'ff02:c4a1::0');
});