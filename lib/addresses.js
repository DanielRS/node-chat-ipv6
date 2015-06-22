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
// Channel class
// ----------------

function Channel(address, port) {
	this.address = address;
	this.port = port;
}

// ----------------
// Addresses
// ----------------
// This file content the main channel
// used by all the clients

// Max value of an address constrained to 28 bits value
var MAX_ADDRESSES = 0xffffffff;

// Base address are the first 6 double-octets of an ipv6 address
var BASE_ADDRESS = [0xff02, 0xc4a1, 0x0, 0x0, 0x0, 0x0];

// Port used by all multicast groups
var MAIN_PORT = 32768;

// function that generates a new Multicast IPv6 address
// @param offset the offset of the generated address
// @return string the generated address
function genMulticast(offset) {
	
	var address_suffix = 3 + offset;
	address_suffix = clamp(address_suffix, 0, MAX_ADDRESSES);

	// Constructs the final address appending the last 2 doctets
	doctet1 = (address_suffix >> 16) & 0xffff;
	doctet2 = (address_suffix >> 0) & 0xffff;
	var final_address = BASE_ADDRESS.concat([doctet1, doctet2]);

	return toIPv6(final_address);
}

// ----------------
// Exports
// ----------------

exports.Channel = Channel;
exports.genMulticast = genMulticast;
exports.channels = {
	everyone: new Channel(genMulticast(-3), MAIN_PORT),
	clients: new Channel(genMulticast(-2), MAIN_PORT),
	groups: new Channel(genMulticast(-1), MAIN_PORT)
};