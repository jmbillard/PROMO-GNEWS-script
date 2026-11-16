/* from El PALLETERO (github.com/jmbillard/EL-PALETTERO) — kept as is */
/* El PALLETERO · conversões de cor (sem dependências) */
(function (root) {
	'use strict';

	function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

	function normHex(hex) {
		var h = String(hex || '').trim().replace(/^#/, '');
		if (/^[0-9a-f]{3}$/i.test(h)) h = h.replace(/(.)/g, '$1$1');
		if (!/^[0-9a-f]{6}$/i.test(h)) return null;
		return '#' + h.toUpperCase();
	}

	function hexToRgb(hex) {
		var h = normHex(hex) || '#000000';
		return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)];
	}

	function rgbToHex(rgb) {
		return '#' + rgb.map(function (c) {
			var s = Math.round(clamp(c, 0, 255)).toString(16);
			return s.length < 2 ? '0' + s : s;
		}).join('').toUpperCase();
	}

	// HSB/HSV: h 0-360, s 0-100, v 0-100
	function rgbToHsb(rgb) {
		var r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
		var max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min, h = 0;
		if (d) {
			if (max === r) h = ((g - b) / d) % 6;
			else if (max === g) h = (b - r) / d + 2;
			else h = (r - g) / d + 4;
			h *= 60;
			if (h < 0) h += 360;
		}
		return [h, max ? (d / max) * 100 : 0, max * 100];
	}

	function hsbToRgb(hsb) {
		var h = ((hsb[0] % 360) + 360) % 360, s = hsb[1] / 100, v = hsb[2] / 100;
		var c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c, r = 0, g = 0, b = 0;
		if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; } else if (h < 180) { g = c; b = x; }
		else if (h < 240) { g = x; b = c; } else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
		return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
	}

	function rgbToHsl(rgb) {
		var r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
		var max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, h = 0, s = 0, d = max - min;
		if (d) {
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
			else if (max === g) h = (b - r) / d + 2;
			else h = (r - g) / d + 4;
			h /= 6;
		}
		return [h, s, l];
	}

	function luminance(hex) {
		var c = hexToRgb(hex).map(function (v) {
			v /= 255;
			return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
		});
		return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
	}

	// cor de texto legível sobre a amostra
	function ink(hex) { return luminance(hex) > 0.30 ? '#121316' : '#FFFFFF'; }

	function format(hex, fmt) {
		var rgb = hexToRgb(hex);
		if (fmt === 'RGB') return rgb.join(' ');
		if (fmt === 'HSB') return rgbToHsb(rgb).map(Math.round).join(' ');
		return normHex(hex);
	}

	// aceita #RGB, #RRGGBB, "r g b", "rgb(r,g,b)", "h s b" (quando fmt = HSB)
	function parse(str, fmt) {
		var s = String(str || '').trim();
		var hex = normHex(s);
		if (hex && (fmt === 'HEX' || /^#|[a-f]/i.test(s))) return hex;
		var nums = s.match(/-?\d+(\.\d+)?/g);
		if (nums && nums.length >= 3) {
			var n = nums.slice(0, 3).map(Number);
			if (/hs[bv]/i.test(s) || (fmt === 'HSB' && !/rgb/i.test(s))) {
				return rgbToHex(hsbToRgb([n[0], clamp(n[1], 0, 100), clamp(n[2], 0, 100)]));
			}
			return rgbToHex(n);
		}
		return hex;
	}


	// CIELAB (D65) — distâncias que batem com a percepção
	function rgbToLab(rgb) {
		var c = rgb.map(function (v) { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
		var x = (c[0] * 0.4124 + c[1] * 0.3576 + c[2] * 0.1805) / 0.95047;
		var y = (c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722);
		var z = (c[0] * 0.0193 + c[1] * 0.1192 + c[2] * 0.9505) / 1.08883;
		function f(t) { return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116; }
		var fx = f(x), fy = f(y), fz = f(z);
		return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
	}

	function labToRgb(lab) {
		var fy = (lab[0] + 16) / 116, fx = lab[1] / 500 + fy, fz = fy - lab[2] / 200;
		function g(t) { return t * t * t > 0.008856 ? t * t * t : (t - 16 / 116) / 7.787; }
		var x = g(fx) * 0.95047, y = g(fy), z = g(fz) * 1.08883;
		var r = x * 3.2406 + y * -1.5372 + z * -0.4986;
		var gg = x * -0.9689 + y * 1.8758 + z * 0.0415;
		var b = x * 0.0557 + y * -0.2040 + z * 1.0570;
		return [r, gg, b].map(function (v) {
			v = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
			return clamp(v * 255, 0, 255);
		});
	}

	function deltaE(a, b) {
		var d0 = a[0] - b[0], d1 = a[1] - b[1], d2 = a[2] - b[2];
		return Math.sqrt(d0 * d0 + d1 * d1 + d2 * d2);
	}

	// mesmo critério do script: cores por matiz → luminosidade → saturação; cinzas no fim
	function sortSwatches(list) {
		function key(sw) { return rgbToHsl(hexToRgb(sw.color)); }
		function cmp(a, b) {
			var A = key(a), B = key(b);
			return (A[0] - B[0]) || (A[2] - B[2]) || (A[1] - B[1]);
		}
		var colors = [], grays = [];
		list.forEach(function (sw) { (key(sw)[1] < 0.15 ? grays : colors).push(sw); });
		return colors.sort(cmp).concat(grays.sort(cmp));
	}

	root.PalColor = {
		normHex: normHex, hexToRgb: hexToRgb, rgbToHex: rgbToHex, rgbToHsb: rgbToHsb, hsbToRgb: hsbToRgb,
		luminance: luminance, ink: ink, rgbToLab: rgbToLab, labToRgb: labToRgb, deltaE: deltaE, format: format, parse: parse, sortSwatches: sortSwatches, clamp: clamp
	};
})(window);
