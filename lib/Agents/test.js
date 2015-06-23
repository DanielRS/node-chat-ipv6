var 
	Client = require('./Client'),

	eone = require('../Misc/addresses').channels.everyone,

	msgs = require('../messages'),

	ca = new Client(eone);

ca.updateClientCache();

for (key in ca.getClientCache()){

	var data = ca.getClientCache()[key].data;

	var message = new msgs.Message(

		msgs.types.SINGLE_MESSAGE,
		ca.getProfile(),
		'Hello nigga'

	);

	ca.sendUDP(data.channel, message.toString());

}

