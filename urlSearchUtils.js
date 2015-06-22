/*global define, module*/

(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define([], factory);
	} else if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like environments that support module.exports,
		// like Node.
		module.exports = factory();
	} else {
		// Browser globals (root is window)
		root.urlSearchUtils = factory();
	}
}(this, function () {

	// Just return a value to define the module export.
	// This example returns an object, but the module
	// can return a function as the exported value.
	var exports = {};

	/**
	 * Converts a URL search query string into an object.
	 * @param {string} [qs=window.location.search] - A query string. Defaults to window.location.search if this parameter is omitted.
	 * @returns {Object.<string, string>}
	 */
	exports.searchToObject = function (qs) {
		if (!qs) {
			qs = window.location.search;
		}
		// Remove leading question mark.
		qs = qs.replace(/^\?/, "");

		var pairs = qs.split("&");

		var output = {};

		var pair, key, value;

		for (var i = 0, l = pairs.length; i < l; i += 1) {
			pair = pairs[i].split("=");
			key = pair[0];
			value = decodeURIComponent(pair[1]);
			output[key] = value;
		}

		return output;
	};

	/**
	 * Converts an object into a query string.
	 * @param {Object} o
	 * @returns {string}
	 */
	exports.objectToSearch = function (o) {
		var output;
		if (o) {
			output = [];
			for (var name in o) {
				if (o.hasOwnProperty(name)) {
					output.push([name, encodeURIComponent(o[name])].join("="));
				}

			}
			output = output.join("&");
		}
		return output;
	};

	return exports;
}));