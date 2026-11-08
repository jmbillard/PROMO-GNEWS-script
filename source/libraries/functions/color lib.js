/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/*

---------------------------------------------------------------
> 🖌️ color and conversions
---------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061
//  jshint -W085
//  jshint -W043

// returns a random color from de color preferences...
function randomColor(colorArray) {
	return colorArray[randomInteger(0, colorArray.length)];
}

// converts rgb color to a simple array...
function rgb(r, g, b) {
	r = r / 255;
	g = g / 255;
	b = b / 255;

	return [r, g, b];
}

function componentToHex(c) {
	var hexStr = c.toString(16);
	hexStr = hexStr.length == 1 ? '0' + hexStr : hexStr;

	return hexStr;
}

function rgbToHEX(rgbArray) {
	r = rgbArray[0] * 255;
	g = rgbArray[1] * 255;
	b = rgbArray[2] * 255;

	return (
		'#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
	).toUpperCase();
}
function rgbToHex(rgbArray) {
	r = rgbArray[0] * 255;
	g = rgbArray[1] * 255;
	b = rgbArray[2] * 255;

	return (
		'0x' + componentToHex(r) + componentToHex(g) + componentToHex(b)
	);
}

function hexToRGB(hex) {
	hex = hex.replace('#', '');

	var r = ('0x' + hex[0] + hex[1]) | 0;
	var g = ('0x' + hex[2] + hex[3]) | 0;
	var b = ('0x' + hex[4] + hex[5]) | 0;

	return [r / 255, g / 255, b / 255];
}
