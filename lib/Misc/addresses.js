var
	inherits = require('util').inherits;

// ----------------
// Utility
// ----------------
// Utility functions, classes and variables

// Clamps a value in the given range
function clamp(num, min, max) {
	return Math.min(max, Math.max(num, min));
}

// Converts an array to an ipv6 address
// @param array array of length 8, where each value represents a double-octet
// @returns string the ipv6 address
function toIPv6(array) {

	var address = [];

	for (var i = 0; i < array.length; ++i) {
		address[i] = array[i].toString(16);
	}

	return address.join(':');
}

// ----------------
// Address classes
// ----------------
// Misc classes for holding addresses

function Channel(address, port) {
	this.address = address;
	this.port = port;
}

function RawChannel(address, port, raw) {
	Channel.call(this, address, port);
	this.raw = raw;
}
inherits(RawChannel, Channel);

// ----------------
// Addresses
// ----------------
// This file content the main channel
// used by all the clients

// Reserved addresses (aka Initial offset)
var RESERVED = 10;

// Max value of an address constrained to 28 bits value
var MAX_ADDRESSES = 0xffffffff;

// Base address are the first 6 double-octets of an ipv6 address
var BASE_ADDRESS = [0xff18, 0xc4a1, 0x0, 0x0, 0x0, 0x0];

// Port used by all multicast groups
var MAIN_PORT = 32768;

// function getAddressOffset
// @param RawChannel
// @returns number the offset of the give address
function getAddressOffset(address) {
	var
		doctet1 = address.raw[6],
		doctet2 = address.raw[7];

	var
		address_suffix = (doctet1 << 16) | doctet2;

	return address_suffix - RESERVED;
}

// function that generates a new Multicast IPv6 address
// @param offset the offset of the generated address
// @return string the generated address
function genMulticast(offset, port) {
	
	var address_suffix = RESERVED + offset;
	address_suffix = clamp(address_suffix, 0, MAX_ADDRESSES);

	// Constructs the final address appending the last 2 doctets
	doctet1 = (address_suffix >> 16) & 0xffff;
	doctet2 = (address_suffix >> 0) & 0xffff;
	var final_address = BASE_ADDRESS.concat([doctet1, doctet2]);

	return new RawChannel(toIPv6(final_address), port, final_address);
}

// function getMulticast gets an available IPv6 Multicast address
// @param used RawChannel addresses until now
// @returns RawChannel of the address generated
// undefined if it was unable to generate one
function getMulticast(used) {

	var used_offsets = {};
	for (var i in used) {
		used_offsets[getAddressOffset(used[i])] = true;
	}

	for (var i = 0; i < MAX_ADDRESSES; ++i) {
		if (!used_offsets[i]) return genMulticast(i, MAIN_PORT);
	}

	return undefined;
}

// ----------------
// Exports
// ----------------

exports.Channel = Channel;
exports.getAddressOffset = getAddressOffset;
exports.genMulticast = genMulticast;
exports.getMulticast = getMulticast;
exports.channels = {
	server: genMulticast(-2, MAIN_PORT),
	everyone: genMulticast(-1, MAIN_PORT)
};