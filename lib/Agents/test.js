var 
	Client = require('./Client'),

	eone = require('../Misc/addresses').channels.everyone,

	msgs = require('../Misc/messages'),

	ca = new Client(eone);

ca.on('listening', function(){

	ca.updateClientCache();

	for (key in ca.getClientCache()){

		var data = ca.getClientCache()[key].data;

		console.log(data);

		// var message = new msgs.Message(

		// 	msgs.types.SINGLE_MESSAGE,
		// 	ca.getProfile(),
		// 	'Hello nigga'

		// );

		// ca.sendUDP(data.channel, message.toString());

	}

});



