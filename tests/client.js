var
	Client = require('../lib/Agents/Client'),
	addrs = require('../lib/Misc/addresses');

var client = new Client(addrs.channels.everyone);

// ----------------

client.on('server-connect', function() {
	console.log('Connected to server');
	console.log('Trying to create a group...');

	client.createGroup('Test');

	client.on('group-created', function(group) {
		console.log(group);
	});
});

client.on('server-close', function() {
	console.log('Disconnected from server');
});

client.on('server-error', function(err) {
	console.log('Error from server: ' + err);
});