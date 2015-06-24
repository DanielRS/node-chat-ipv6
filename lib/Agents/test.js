var 
	Client = require('./Client'),

	eone = require('../Misc/addresses').channels.everyone,

	msgs = require('../Misc/messages'),

	ca = new Client(eone);

ca.on('listening', function(){

	ca.updateClientCache();

});

ca.on('client-cache-updated', function(){

	for (key in ca.getClientCache()){

		var data = ca.getClientCache()[key].data;

		console.log(data);

		var message = new msgs.Message(

			msgs.types.SINGLE_MESSAGE,
			ca.getProfile(),
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris eleifend nec lectus ornare venenatis. Morbi a dui quis est ultricies aliquam nec a urna. Sed aliquam, ante ac lacinia porttitor, nisi neque elementum ante, non tempor ex ipsum vitae risus. Quisque et nisl nibh. Nunc ac tellus justo. Pellentesque lobortis arcu dolor, vel posuere magna tempor id. Aenean mollis porta magna quis semper. Donec rutrum pharetra fermentum.Quisque vel ornare urna, ac tincidunt justo. Donec sollicitudin cursus ex, a aliquam nibh dapibus vitae. Integer et felis in libero pharetra pellentesque. Aliquam accumsan, ligula at egestas molestie, elit neque auctor nulla, sed viverra diam urna id arcu. Maecenas vel diam id elit egestas fringilla. Aliquam tincidunt nec quam vel feugiat. Cras facilisis metus ligula, ac molestie sapien aliquam quis. Proin consequat magna id lacus interdum semper. Maecenas posuere luctus felis, ultricies dignissim leo facilisis non. Nullam rutrum aliquet lorem sit amet finibus. Nullam sed faucibus libero, quis viverra odio. Suspendisse aliquam pharetra massa sed porta. Curabitur vestibulum felis velit, sit amet varius justo imperdiet id. Suspendisse egestas, justo at imperdiet accumsan, mi lacus placerat sem, non luctus ligula arcu nec odio. Sed sit amet velit id lectus suscipit egestas at ac arcu.Suspendisse vehicula venenatis nisi sit amet facilisis. Duis mollis et felis sed semper. Curabitur feugiat rhoncus feugiat. Duis vitae ultricies tellus. Donec vehicula quam a molestie ornare. Nunc posuere tellus eu ex tempus venenatis posuere eget felis. In hac habitasse platea dictumst. Aliquam volutpat et orci ut sagittis. Ut ut aliquam nibh, sed fermentum enim. Quisque commodo massa purus.Integer leo libero, venenatis at convallis vel, blandit sed erat. Curabitur in vestibulum libero. Integer pulvinar nulla sit amet dui condimentum condimentum. Ut vehicula ipsum sit amet lectus sodales, non rutrum orci pretium. Morbi sit amet dolor vel eros malesuada pellentesque. Duis convallis, urna vel consectetur faucibus, nibh tortor tristique justo, eget fringilla orci ligula eu ante. Donec nec ullamcorper massa. Sed in blandit tortor, eu tincidunt justo. Aenean sit amet est vestibulum, vestibulum erat in, auctor turpis. Integer fringilla enim justo, id consequat mauris dignissim eget. Lorem ipsum dolor sit amet, consectetur adipiscing elit.Fusce auctor orci sit amet nunc hendrerit varius. Proin tempor sit amet nisl placerat cursus. Donec et orci justo. Aenean tincidunt, lectus id euismod fringilla, elit magna aliquet lorem, ac tincidunt mi nisi at felis. Aenean faucibus, velit vitae porta gravida, turpis est placerat urna, vel ullamcorper nisl turpis vel libero. Integer tempus sollicitudin tempor. Donec fermentum vel enim id porttitor. Praesent elit leo, consectetur sed nibh vel, congue venenatis sapien. Sed est augue, viverra ut suscipit a, cursus feugiat metus. Nam rutrum ultricies augue, at pharetra est vehicula ac. Proin vitae metus massa. Suspendisse pharetra lectus magna, nec scelerisque nulla placerat eget. Duis pretium ante in pulvinar scelerisque. Nullam non lacinia lorem, non facilisis risus.Curabitur neque massa, sagittis sit amet odio vitae, malesuada consectetur ligula. Donec sed auctor neque, a eleifend quam. Praesent rutrum ligula vitae odio aliquam, in rutrum purus tempus. Maecenas. "
		);

		console.log(message)

		ca.sendUDP(data.channel, message.toString());

	}

});


