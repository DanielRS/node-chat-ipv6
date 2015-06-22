// This file contain all the messages constructors
// used by both the server and the client

var
	inherits = require('util').inherits,
	Enum = require('./util').Enum;

// ----------------
// Message types
// ----------------
// All the message types

var types = new Enum([
	'UNDEFINED',

	// General messages
	'CLIENT_ONLINE',
	'CLIENT_OFFLINE',
	'CLIENT_CHANGE',
	'CLIENT_SOLICITATION',
	'CLIENT_REPORT',
	'CLIENT_ADVERTISEMENT',

	// All-to-Group/Group-to-All messages
	'GROUP_SOLICITATION',
	'GROUP_ADVERTISEMENT',

	// Group-to-Single/Single-to-Group messages
	'GROUP_CREATE',
	'GROUP_DELETE',
	'GROUP_JOIN',
	'GROUP_LEAVE',
	'GROUP_MESSAGE',

	'GROUP_JOIN_OK',

	'GROUP_JOIN_ERR',

	// Unicast messages
	'SINGLE_MESSAGE'
]);

// ----------------
// Subtypes
// ----------------
// Subtypes are used to validate the connection type
// argument in the constructors

var connect_types = [
	types.CLIENT_ONLINE,
	types.CLIENT_OFFLINE,
	types.CLIENT_CHANGE
];

var group_types = [
	types.GROUP_CREATE,
	types.GROUP_DELETE,
	types.GROUP_JOIN,
	types.GROUP_LEAVE,
	types.GROUP_MESSAGE,

	types.GROUP_JOIN_OK,

	types.GROUP_JOIN_ERR
];

// ----------------
// Constructors
// ----------------
// Creates a message of a given type

function Message(type, sender_uuid, extras) {

	// Argument validation
	if (sender_uuid === undefined)
		throw Error("Sender ID must be specified");

	// Value validation
	if (type === undefined)
		type = types.UNDEFINED;
	if (extras === undefined)
		extras = {};

	this.type = type;
	this.sender = sender_uuid;
	this.extras = extras;
}

Message.prototype.toString = function() {
	return JSON.stringify(this);
};

// ----------------
// Connect message

function ConnectMessage(type, sender_uuid) {
	Message.call(this, type, sender_uuid);

	// Value validation
	if (!(type in connect_types))
		type = types.CLIENT_OFFLINE;

	this.type = type;
}
inherits(ConnectMessage, Message);

// ----------------
// Group message

function GroupMessage(type, sender_uuid, group_uuid, extras) {
	Message.call(this, type, sender_uuid, extras);

	if (group_uuid === undefined)
		throw Error('Group ID must be specified!');

	if (!type in group_types)
		type = types.UNDEFINED;

	this.type = type;
	this.group = group_uuid;
}
inherits(GroupMessage, Message);

// ----------------
// Exports
// ----------------

exports.types = types;
exports.Message = Message;
exports.ConnectMessage = ConnectMessage;
exports.GroupMessage = GroupMessage;