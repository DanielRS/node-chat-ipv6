// ----------------
// Utils
// ----------------
// Misc utilities that doens't deserve their own file (because they
// aren't that awesome)

// function Enum
// takes and array and returns an object, where each value
// has a different number assigned. The returned object can then
// be used as an Enum type (similar to other languages)
// @param values the array of values
// @returns object enum-like object
function Enum(values) {
	for (var i = 0; i < values.length; ++i) {
		this[values[i]] = i;
	}
}

// ----------------
// Exports
// ----------------

exports.Enum = Enum;