var
	dgram = require('dgram');

// ----------------

var cb = dgram.createSocket({
	type: 'udp6',
	reuseAddr: true
});

cb.bind(25000, function() {
	cb.addMembership('ff02:c4a1::0');
});

cb.on('message', function(message, remote) {
	console.log();
	console.log(message.toString());
	console.log(remote);

	var buff = new Buffer('MAMALO A');
	cb.send(buff, 0, buff.length, remote.port, remote.address);
});