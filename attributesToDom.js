
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
		root.attributesToDom = factory();
	}
}(this, function () {

	var dateTimeFormatOptions = {
		year: 'numeric', month: 'numeric', day: 'numeric',
		timeZone: "UTC" // "America/Los_Angeles"
	};
	var dateTimeFormat = this.Intl ? new this.Intl.DateTimeFormat("en-us", dateTimeFormatOptions) : null;


	function getTimeElement(date) {
		var time;
		var dateString = dateTimeFormat ? dateTimeFormat.format(date) : String(date);
		try {
			time = document.createElement("time");
		} catch (e) {
			time = null;
		}
		if (time) {
			time.setAttribute("dateTime", dateString);
			time.textContent = dateString;
		} else {
			time = document.createTextNode(dateString);
		}
		return time;
	}

	var exports = {
		/**
		 * Converts feature attributes object into a table.
		 * @param {Object} attributes
		 * @returns {HTMLTableElement}
		 */
		objectToTable: function (attributes) {
			var table = document.createElement("table");
			var row, cell, value;

			for (var name in attributes) {
				if (attributes.hasOwnProperty(name)) {
					value = attributes[name];

					row = document.createElement("tr");
					cell = document.createElement("th");
					cell.textContent = name;
					row.appendChild(cell);

					cell = document.createElement("td");

					if (value instanceof Date) {
						cell.appendChild(getTimeElement(value));
					} else {
						cell.textContent = value;

					}
					row.appendChild(cell);


					table.appendChild(row);
				}
			}
			return table;
		},

		/**
		 * Converts feature attributes object into a definition list.
		 * @param {Object} attributes
		 * @returns {HTMLDListElement}
		 */
		objectToDL: function (attributes) {
			var dl, dt, dd, value;

			dl = document.createElement("dl");

			for (var name in attributes) {
				if (attributes.hasOwnProperty(name)) {
					value = attributes[name];

					dt = document.createElement("dt");
					dt.textContent = name;
					dl.appendChild(dt);

					dd = document.createElement("dd");
					dd.textContent = value;
					dl.appendChild(dd);
				}

			}

			return dl;
		}
	};

	// Just return a value to define the module export.
	// This example returns an object, but the module
	// can return a function as the exported value.
	return exports;
}));