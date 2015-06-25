var
	Client = require('../lib/Agents/Client'),
	addrs = require('../lib/Misc/addresses');

var client = new Client(addrs.channels.everyone);

// ----------------

client.on('server-connect', function() {
	console.log('Connected to server');
	console.log('Trying to create a group...');

	client.createGroup('Test 0');
	client.createGroup('Test 1');
	client.createGroup('Test 2');

	client.on('group-created', function(group) {
		console.log('Group created: ' + group.name);
	});
});

client.on('server-close', function() {
	console.log('Disconnected from server');
});

client.on('server-error', function(err) {
	console.log('Error from server: ' + err);
});