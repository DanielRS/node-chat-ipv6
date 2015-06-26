var
	Chat = require('./Chat'),
	ca = new Chat.Client();

ca.on('listening', function(){
	ca.updateClientCache();
	console.log(ca._uuid);
})

ca.on('chat-message', function(uuid){

	messages = ca.message_history[uuid];

	console.log(uuid);

});