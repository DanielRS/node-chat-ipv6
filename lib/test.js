var
	dgram = require('dgram');


var ca = dgram.createSocket({
	type: 'udp6',
	reuseAddr: true
});

ca.bind(25000, function() {
	ca.addMembership('ff05::114');
});

ca.on('message', function(message, remote) {
	console.log();
	console.log(message.toString());
	console.log(remote);
});

// ----------------

var cb = dgram.createSocket({
	type: 'udp6',
	reuseAddr: true
});

cb.bind(25000, function() {
	cb.addMembership('ff05::114');
});

cb.on('message', function(message, remote) {
	console.log();
	console.log(message.toString());
	console.log(remote);

	var buff = new Buffer('MAMALO A');
	cb.send(buff, 0, buff.length, remote.port, remote.address);
});

// ----------------

ca.on('listening', function() {
	var buff = new Buffer('MAMALO B');
	ca.send(buff, 0, buff.length, 25000, 'ff05::114');
});

cb.on('listening', function() {});