var
	everyone = require('./Misc/addresses').channels.everyone,
	Client = require('./Agents/Client');

cb = new Client(everyone);

cb.on('listening', function(){

	console.log(cb._uuid);

	console.log();

	cb.setAlias('pupu');

});

cb.on('single-message', function(sender, message) {
	console.log('Received message from: '+ sender.uuid);
	console.log('Message: ' + message);
	console.log();
});