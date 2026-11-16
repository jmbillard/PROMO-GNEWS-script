/*
---------------------------------------------------------------
> PROMO GNEWS · icons for the 'Efeitos' section
---------------------------------------------------------------
  key → [base path, accent path, hover animation]. Shared by the bar and
  the effects editor in the preferences (an effect uses an icon or 2 letters).
*/
(function () {
	'use strict';

	window.FX_ICONS = {
		'curves': ['M4 20h16M4 20V4', 'M4 20C11 20 12 4 20 4', 'draw'],
		'levels': ['M4 20h16', 'M7 18v-5M11 18V7M15 18v-8M19 18v-3', 'grow'],
		'lumetri': ['M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18', 'M12 12V5M12 12l5 5', 'spin'],
		'gauss': ['M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z', 'M9.5 14a2.5 2.5 0 0 0 2.5 2.5', 'pulse'],
		'compound': ['M9 6a6 6 0 1 0 0 12a6 6 0 1 0 0-12', 'M15 6a6 6 0 1 0 0 12a6 6 0 1 0 0-12', 'slide'],
		'lens': ['M12 4a8 8 0 1 0 0 16a8 8 0 1 0 0-16', 'M12 4l3 8M20 12l-8 3M12 20l-3-8M4 12l8-3', 'spin'],
		'fill': ['M5 11l6-6 7 7-6 6z', 'M19 15c1 1.5 1.5 2.3 1.5 3a1.5 1.5 0 0 1-3 0c0-.7.5-1.5 1.5-3z', 'pop'],
		'3d': ['M3 10h18M6 10v5h5v-5', 'M13 10v5h5v-5', 'slide'],
		'fractal': ['M4 4h16v16H4z', 'M4 14c3-3 5 2 8-1s5-4 8-1', 'wiggle'],
		'grain': ['M4 4h16v16H4z', 'M8 8h.01M12 10h.01M16 8h.01M9 14h.01M15 13h.01M12 17h.01M7 18h.01M17 17h.01', 'blink'],
		'fx': ['M12 3v4M12 17v4M3 12h4M17 12h4', 'M12 9l1.2 1.8L15 12l-1.8 1.2L12 15l-1.2-1.8L9 12l1.8-1.2z', 'spin'],
		'sliders': ['M4 7h16M4 17h16', 'M9 5v4M15 15v4', 'slide'],
		'light': ['M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4', 'M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8', 'spin'],
		'distort': ['M4 4h16v16H4z', 'M4 12c4-4 8 4 16 0', 'wiggle'],
		'glow': ['M12 4a8 8 0 1 0 0 16a8 8 0 1 0 0-16', 'M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8', 'pulse'],
		'key': ['M4 4h16v16H4z', 'M8 16l8-8M8 8h.01', 'pop'],
		'time': ['M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18', 'M12 7v5l3 3', 'spin'],
		'text': ['M5 6h14M12 6v13', 'M9 19h6', 'pop']
	};
	window.FX_ICON_KEYS = Object.keys(window.FX_ICONS);
})();
