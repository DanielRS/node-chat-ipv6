var 
	Client = require('./Client'),

	eone = require('../Misc/addresses').channels.everyone,

	msgs = require('../Misc/messages'),

	ca = new Client(eone);

ca.on('listening', function(){

	console.log('Myself ${ca._uuid}');

	ca.updateClientCache();

});

ca.on('client-cache-updated', function(){

	for (key in ca.getClientCache()){

		var data = ca.getClientCache()[key].data;

		console.log(key);

		var message = new msgs.Message(

			msgs.types.SINGLE_MESSAGE,
			ca.getProfile(),
			'Hola'
		);

		console.log(message)

		ca.sendUDP(data.channel, message.toString());

	}

	// var data = ca.getClientCache()[uuid].data;

	// console.log(uuid);

	// var message = new msgs.Message(

	// 	msgs.types.SINGLE_MESSAGE,
	// 	ca.getProfile(),
	// 	'Hola'
	// );

	// console.log(message)

	// ca.sendUDP(data.channel, message.toString());

});

ca.on('client-change', function(uuid, message){

	// var data = ca.getClientCache()[key].data;
	console.log();
	console.log('client-change emmit')
	// console.log(data);
	console.log(`uuid ${uuid}, alias ${message.new_name}`);
	// console.log();
	// data.alias = message.new_name;
	// console.log(ca.getClientCache()[key].data);
})


