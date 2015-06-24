var
	Server = require('../lib/Agents/Server'),
	addrs = require('../lib/Misc/addresses');

var server = new Server(addrs.channels.everyone);

server.on('listening', function() {
	console.log('Server listening for connections...');
});