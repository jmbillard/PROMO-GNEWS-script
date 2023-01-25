/* eslint-disable no-prototype-builtins */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
/*

---------------------------------------------------------------
> 🪄 prototype functions
---------------------------------------------------------------

*/

String.prototype.popLastCharacter = function () {
	return this.replace(/.$/, '');
};

// string to camel case...
String.prototype.toCamelCase = function () {
	return this.toLowerCase()
		.replace(/\s(.)/g, function ($1) { return $1.toUpperCase(); })
		.replace(/\s/g, '')
		.replace(/^(.)/, function ($1) { return $1.toLowerCase(); });
};
// string to camel case...
String.prototype.toTitleCase = function () {
	return this.toLowerCase()
		.replace(/\s(.)/g, function ($1) { return $1.toUpperCase(); })
		.replace(/^(.)/, function ($1) { return $1.toUpperCase(); });
};

// trim...
if (!String.prototype.trim) {
	String.prototype.trim = function () {
		return this.replace(/^\s+|\s+$/gm, '');
	};
}

// replaces most of the special characters...
String.prototype.replaceSpecialCharacters = function () {

	return this.replace(/À|Á|Â|Ã|Ä|\u00C0|\u00C1|\u00C2|\u00C3|\u00C4/g, 'A')
		.replace(/à|á|â|ã|ä|\u00E0|\u00E1|\u00E2|\u00E3|\u00E4/g, 'a')
		.replace(/È|É|Ê|Ë|\u00C8|\u00C9|\u00CA|\u00CB/g, 'E')
		.replace(/è|é|ê|ë|\u00E8|\u00E9|\u00EA|\u00EB/g, 'e')
		.replace(/Ì|Í|Î|Ï|\u00CC|\u00CD|\u00CE|\u00CF/g, 'I')
		.replace(/ì|í|î|ï|\u00EC|\u00ED|\u00EE|\u00EF/g, 'i')
		.replace(/Ò|Ó|Ô|Õ|Ö|\u00D2|\u00D3|\u00D4|\u00D5|\u00D6/g, 'O')
		.replace(/ò|ó|ô|õ|ö|\u00F2|\u00F3|\u00F4|\u00F5|\u00F6/g, 'o')
		.replace(/Ù|Ú|Û|Ü|\u00D9|\u00DA|\u00DB|\u00DC/g, 'U')
		.replace(/ù|ú|û|ü|\u00F9|\u00FA|\u00FB|\u00FC/g, 'u')
		.replace(/Ç|\u00C7/g, 'C')
		.replace(/ç|\u00E7/g, 'c')
		.replace(/\n|\r/g, ' ') // replaces line breaks...
		.replace(/_|-|\|/g, ' ')
		.replace(/\s{2,}/g, ' ') // replaces 2 or more spaces...
		.replace(/[^\w\s—]/ig, '') // replaces any non-word character except space...
		.trim();
};

// date shortener...
String.prototype.toShortDate = function () {

	return this.replaceSpecialCharacters()
		.replace(/SEGUNDA/, 'SEG')
		.replace(/TERCA/, 'TER')
		.replace(/QUARTA/, 'QUA')
		.replace(/QUINTA/, 'QUI')
		.replace(/SEXTA/, 'SEX')
		.replace(/SABADO/, 'SAB')
		.replace(/DOMINGO/, 'DOM')
		.replace(/DE /, '')
		.replace(/JANEIRO/, 'JAN')
		.replace(/FEVEREIRO/, 'FEV')
		.replace(/MARCO/, 'MAR')
		.replace(/ABRIL/, 'ABR')
		.replace(/MAIO/, 'MAI')
		.replace(/JUNHO/, 'JUN')
		.replace(/JULHO/, 'JUL')
		.replace(/AGOSTO/, 'AGO')
		.replace(/SETEMBRO/, 'SET')
		.replace(/OUTUBRO/, 'OUT')
		.replace(/NOVEMBRO/, 'NOV')
		.replace(/DEZEMBRO/, 'DEZ');
};

// image resize to fit dimensions...
Image.prototype.onDraw = function () {

	// 'this' is the container and 'this.image' is the graphic
	if (!this.image) return;
	var WH = this.size,
		wh = this.image.size,
		k = Math.min(WH[0] / wh[0], WH[1] / wh[1]),
		xy;
	// Resize proportionally...
	wh = [k * wh[0], k * wh[1]];
	// Center...
	xy = [(WH[0] - wh[0]) / 2, (WH[1] - wh[1]) / 2];
	this.graphics.drawImage(this.image, xy[0], xy[1], wh[0], wh[1]);
	WH = wh = xy = null;
};

// Array.isArray(obj) definition...
if (typeof Array.isArray === 'undefined') {
	Array.isArray = function (obj) {
		return Object.prototype.toString.call(obj) === '[object Array]';
	};
}

// indexOf() definition...
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function (element, startPoint) {

		var k;

		if (this == null) {
			throw new TypeError('"this" é nulo (null) ou não foi definido (undefined)');
		}
		var O = Object(this);
		var aSize = O.length >>> 0;

		if (aSize === 0) {
			return -1;
		}
		var n = + startPoint || 0;

		if (Math.abs(n) === Infinity) {
			n = 0;
		}
		if (n >= aSize) {
			return -1;
		}
		k = Math.max(n >= 0 ? n : aSize - Math.abs(n), 0);

		while (k < aSize) {
			if (k in O && O[k] === element) {
				return k;
			}
			k++;
		}
		return -1;
	};
}