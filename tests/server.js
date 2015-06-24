var
	Server = require('../lib/Agents/Server'),
	addrs = require('../lib/Misc/addresses');

var server = new Server(addrs.channels.server);

server.on('listening', function() {
	console.log('Server listening for connections...');
});

server.on('message', function(message, remote) {
	console.log(JSON.parse(message));
});