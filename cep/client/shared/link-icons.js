/*
---------------------------------------------------------------
> PROMO GNEWS · icons for the 'Atalhos' links
---------------------------------------------------------------
  key → [base path, accent path, hover animation]. Shared by the bar
  (panel) and the editor in the preferences window. A link uses either
  one of these icons or up to 2 letters (glyph).
*/
(function () {
	'use strict';

	var F = 'M3 7v11h18V9h-9l-2-2z';

	window.LINK_ICONS = {
		up: [F, 'M12 16v-5M9.5 13.5L12 11l2.5 2.5', 'up'],
		slide: [F, 'M8 13h8M8 16h5', 'slide'],
		bolt: [F, 'M13 10l-3 4h4l-3 4', 'pulse'],
		star: [F, 'M12 11.5l1 2 2 .3-1.5 1.4.4 2.1-1.9-1-1.9 1 .4-2.1-1.5-1.4 2-.3z', 'spin'],
		bars: [F, 'M9 17v-3M12 17v-5M15 17v-2', 'grow'],
		dot: [F, 'M12 12.5a2 2 0 1 0 0 4a2 2 0 1 0 0-4', 'pulse'],
		film: [F, 'M9 12v5M15 12v5M9 14.5h6', 'slide'],
		img: [F, 'M8 17l3-3 2 2 3-3', 'up'],
		globe: ['M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z', 'M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18', 'spin'],
		cloud: ['M7 18h10a4 4 0 0 0 0-8a6 6 0 0 0-11.5 2A3 3 0 0 0 7 18z', 'M12 15v-4M10 13l2-2 2 2', 'up'],
		cal: ['M4 6h16v14H4z', 'M4 10h16M8 3v4M16 3v4', 'pop'],
		check: ['M4 5h16v14H4z', 'M8 12l3 3 5-6', 'pop'],
		board: ['M4 4h16v16H4z', 'M9 4v16M15 4v10', 'grow'],
		chat: ['M4 5h16v11H9l-5 4z', 'M8 10h8', 'pop'],
		link: ['M10 14a4 4 0 0 0 5.6 0l3-3a4 4 0 0 0-5.6-5.6l-1 1', 'M14 10a4 4 0 0 0-5.6 0l-3 3a4 4 0 0 0 5.6 5.6l1-1', 'pop'],
		drive: ['M3 13h18v6H3z', 'M3 13l3-8h12l3 8M17 16h.01', 'pop']
	};
	window.LINK_ICON_KEYS = Object.keys(window.LINK_ICONS);
})();
