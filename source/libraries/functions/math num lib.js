/*

---------------------------------------------------------------
> 🖌️ math
---------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061
//  jshint -W085
//  jshint -W043

// returns a random integer...
function randomInteger(min, max) {
	return Math.floor(Math.random() * (max - min)) + min; // → 17
}

// returns a random gauss number...
function gaussRnd(samples) {
	var r = 0;

	for (var i = 0; i < samples; i++) {
		r += Math.random();
	}

	return r / samples; // → 0 - 1
}

// simple timer...
function timer() {
	return ($.hiresTimer / 1000000).toFixed(2); // → 1.27 (in seconds)
}
