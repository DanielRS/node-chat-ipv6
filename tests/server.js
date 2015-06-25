var
	Server = require('../lib/Agents/Server'),
	addrs = require('../lib/Misc/addresses');

var server = new Server(addrs.channels.server);

server.on('listening', function() {
	console.log('Server is listening...');
	// server.closeHandler();
	// console.log(server);
});