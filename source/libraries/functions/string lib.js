/* eslint-disable no-prototype-builtins */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
/*

---------------------------------------------------------------
> 🖌️ string manipulation
---------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061
//  jshint -W085
//  jshint -W043

function nameInc(aName) {
	var name = aName.replace(/\s*[0-9]+$/, '');
	var num = aName.match(/\s*[0-9]+$/);
	var numStr = (num == null) ? 2 : parseInt(num) + 1;

	return name + ' ' + numStr.toString();
}

function deleteFileExt(str) {
	return str.replace(/\.[0-9a-z]+$/i, '');
}

function getFileExt(str) {
	return str
		.match(/\.[0-9a-z]+$/i)
		.toString()
		.toLowerCase();
}

function deletePrefix(name) {
	var prefixArray = getPrefixes();

	for (var p = 0; p < prefixArray.length; p++) {
		var pattern = eval('new RegExp(/^' + prefixArray[p] + '/)');
		if (name.match(pattern) != null) name = name.replace(pattern, '');
	}

	return name;
}

// format short date and time → SHORT DATE TIME
function formatShortDateAndTime(str) {
	return str
		.toString()
		.trim()
		.toUpperCase()
		.toShortDate()
		.split(/\s+—\s+|[\n\r]+|\s+\|\s+/)
		.join(' ');
}

