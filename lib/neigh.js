// Various utilities for managing objects that are
// valid only on a give timeframe

var
	Enum = require('./util').Enum;

// ----------------
// Neighbor state
// ----------------
// Neighbor states used in the Neighbor class

var states = new Enum(['ACTIVE', 'STALE']);

// ----------------
// Neighbor class
// ----------------
// Class used to represent a neighbor node (Client or Group)

// Creates a new Neighbor object
// @param id the unique id of the object
// @param data the data to be contained within
// @param max_age the maximum age in milliseconds of validness
// of the object
function Neighbor(id, data, max_age) {
	this.id = id;
	this.data = data;

	if (max_age === undefined)
		max_age = 5000;

	this._max_age = max_age; // five seconds
	this._update_time = Date.now();
}

Neighbor.prototype.update = function() {
	this._update_time = Date.now();
};

Neighbor.prototype.isActive = function() {
	return Date.now() < this._update_time + this._max_age;
}

Neighbor.prototype.isStale = function() {
	return !this.isActive();
}

// ----------------
// Neighbor manager class
// ----------------

function NeighborManager() {
	this.neighbors = {}
}

// function clean
// removes all the stale neighbors
NeighborManager.prototype.clean = function() {
	for (key in this.neighbors) {
		if (this.neighbors[key].isStale()) {
			delete this.neighbors[key];
		}
	}
};

// function addNeighbor
// adds a neighbor to the list
NeighborManager.prototype.addNeighbor = function(neighbor) {
	if (this.neighbors.hasOwnProperty(neighbor.id))
		this.update(neighbor.id);
	else
		this.neighbors[neighbor.id] = neighbor;
}

// function updateNeighbor
// updates the active/stale state of the given neighbor
NeighborManager.prototype.updateNeighbor = function(key) {
	if  (this.neighbors.hasOwnProperty(key))
		this.neighbors[key].update();
}

// function getNeighbors
// @returns the object of CLEANED neighbors
NeighborManager.prototype.getNeighbors = function() {
	this.clean();
	return this.neighbors;
}

// ----------------
// Exports
// ----------------

exports.states = states;
exports.Neighbor = Neighbor;
exports.NeighborManager = NeighborManager;