var
	everyone = require('./Misc/addresses').channels.everyone,
	Client = require('./Agents/Client');

ca = new Client(everyone);

ca.on('single-message', function(sender, message) {
	console.log('Received message from: '+ sender.uuid);
	console.log('Message: ' + message);
	console.log();
});