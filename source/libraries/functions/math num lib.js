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
function getRndInteger(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function gaussRnd(samples) {
	var r = 0;

	for (var i = 0; i < samples; i++) {
		r += Math.random();
	}

	return r / samples;
}

// [x] timer - create...
function timer() {
	return ($.hiresTimer / 1000000).toFixed(2);
}
