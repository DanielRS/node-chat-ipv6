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
		console.log('Start');
		console.log(data);
		console.log('End');
		this._addMessage(data.sender.uuid, new ChatMessage(data.sender, data.time, data.extras));
		self.emit('chat-message', data.sender.uuid);
	});

	this.on('group-message', function(data) {
		this._addMessage(data.extras.group_uuid, new ChatMessage(data.sender, data.time, data.extras.message));
		self.emit('chat-message', data.extras.group.uuid);
	});
}
inherits(Chat.Client, Client);

// function _addMessage
// adds chat_message to history of chat_uuids
Chat.Client.prototype._addMessage = function(chat_uuid, chat_message) {
	if (!this.message_history[chat_uuid]) this.message_history[chat_uuid] = [];
	this.message_history[chat_uuid].push(chat_message);
}

Chat.Client.prototype.sendMessage = function(uuid, message) {

	var m = new msgs.Message(
		msgs.types.SINGLE_MESSAGE,
		this.getProfile(),
		message
	);
	this.sendUDP(this.getClientCache()[uuid].data.channel, m.toString());

	// Adds the message to history
	var chat_message = new ChatMessage(m.sender, m.time, message);
	this._addMessage(uuid, chat_message);
}

Chat.Client.prototype.sendGroupMessage = function(uuid, message) {
	var m = new msgs.Message(
		msgs.types.GROUP_MESSAGE,
		this.getProfile(),
		{
			group_uuid: uuid,
			message: message
		}
	);
	this.sendUDP(this.getClientCache()[uuid].data.channel, m.toString());

	// Adds the message to history
	var chat_message = new ChatMessage(m.sender, m.time, message);
	this._addMessage(uuid, chat_message);
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