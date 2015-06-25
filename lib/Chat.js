var
	inherits = require('util').inherits,

	addrs = require('./Misc/addresses'),
	msgs = require('./Misc/messages'),
	Client = require('./Agents/Client'),
	Server = require('./Agents/Server');

// ----------------
// Chat component
// ----------------
// This component adds a layer of abstraction
// over the Client and Server components. It essentially adds
// message history

function ChatMessage(sender, time, message) {
	this.sender = sender;
	this.time = time;
	this.message = message;
}

Chat = {};

// ----------------
// Client
// ----------------

Chat.Client = function() {
	Client.call(this, addrs.channels.everyone);

	var self = this;
	this.message_history = {};

	this.on('client-message', function(data) {
		if (!message_history[data.sender.uuid]) message_history[data.sender.uuid] = [];
		message_history[sender.uuid].push(new ChatMessage(data.sender, data.time, data.extras));
		self.emit('chat-message', sender.uuid);
	});

	this.on('group-message', function(data) {
		if (!message_history[data.extras.group.uuid]) message_history[data.extras.group.uuid] = [];
		message_history[data.extras.group.uuid].push(new ChatMessage(data.sender, data.time, data.extras.message));
		self.emit('chat-message', data.extras.group.uuid);
	});
}
inherits(Chat.Client, Client);

Chat.Client.prototype.sendMessage = function(uuid, message) {
	var m = new msgs.Message(
		msgs.types.SINGLE_MESSAGE,
		this.getProfile(),
		message
	);

	this.sendUDP(this.getClientCache()[uuid].data.channel, m.toString());
}

// function getMessages
// @param group_uuid uuid of the person or group
// @returns an array of messages, sorted by time
Chat.Client.prototype.getMessages = function(group_uuid) {

	// Sorts the messages in ascending order
	function compare(a, b) {
		return a.time - b.time;
	}

	this.message_history[group_uuid].sort(compare);
}

// ----------------
// Server
// ----------------

Chat.Server = function() {
	Server.call(this, addrs.channels.server);
}
inherits(Chat.Server, Server);

// ----------------
// Exports
// ----------------

module.exports = Chat;