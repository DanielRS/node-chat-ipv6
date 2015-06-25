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

	// Server messages
	'SERVER_SOLICITATION',
	'SERVER_ADVERTISEMENT',

	// General messages
	'CLIENT_ONLINE',
	'CLIENT_OFFLINE',
	'CLIENT_CHANGE',
	'CLIENT_SOLICITATION',
	'CLIENT_ADVERTISEMENT',

	// Group messages
	'GROUP_SOLICITATION',
	'GROUP_ADVERTISEMENT',

	'GROUP_CREATE',
	'GROUP_JOIN',
	'GROUP_LEAVE',

	'GROUP_CREATE_OK',
	'GROUP_JOIN_OK',
	'GROUP_LEAVE_OK',

	'GROUP_CREATE_ERR',
	'GROUP_JOIN_ERR',
	'GROUP_LEAVE_ERR',

	'GROUP_MEMBER_SOLICITATION',
	'GROUP_MEMBER_ADVERTISEMENT',
	'GROUP_MESSAGE',

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
	types.GROUP_JOIN,
	types.GROUP_LEAVE,
	types.GROUP_MESSAGE,

	types.GROUP_CREATE_OK,
	types.GROUP_JOIN_OK,
	types.GROUP_LEAVE_OK,

	types.GROUP_CREATE_ERR,
	types.GROUP_JOIN_ERR,
	types.GROUP_LEAVE_ERR
];

// ----------------
// Constructors
// ----------------
// Creates a message of a given type

function Message(type, sender, extras) {

	// Argument validation
	if (sender === undefined)
		throw Error('Sender must be specified');

	// Value validation
	if (type === undefined)
		type = types.UNDEFINED;
	if (extras === undefined)
		extras = {};

	this.type = type;
	this.sender = sender;
	this.extras = extras;
	this.time = Date.now();
}

Message.prototype.toString = function() {
	return JSON.stringify(this) + '\n';
};

// ----------------
// Exports
// ----------------

exports.types = types;
exports.Message = Message;