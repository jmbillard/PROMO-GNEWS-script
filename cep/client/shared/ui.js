/*
---------------------------------------------------------------
> PROMO GNEWS · tiny DOM helpers shared by panel and windows
---------------------------------------------------------------
*/
(function () {
	'use strict';

	var SVGNS = 'http://www.w3.org/2000/svg';

	// h('button.t.on', { title: 'x', onclick: fn }, [children])
	function h(sel, attrs, kids) {
		var parts = sel.split('.');
		var el = document.createElement(parts[0] || 'div');
		if (parts.length > 1) el.className = parts.slice(1).join(' ');
		set(el, attrs);
		add(el, kids);
		return el;
	}

	function set(el, attrs) {
		if (!attrs) return el;
		Object.keys(attrs).forEach(function (k) {
			var v = attrs[k];
			if (v == null || v === false) return;
			if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
			else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
			else if (k === 'text') el.textContent = v;
			else if (k === 'class') el.className = v;
			else el.setAttribute(k, v === true ? '' : v);
		});
		return el;
	}

	function add(el, kids) {
		if (kids == null) return el;
		(Array.isArray(kids) ? kids : [kids]).forEach(function (c) {
			if (c == null || c === false) return;
			el.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
		});
		return el;
	}

	// stroke icon: base path + animated accent path
	function icon(d, a, anim, cls) {
		var svg = document.createElementNS(SVGNS, 'svg');
		svg.setAttribute('viewBox', '0 0 24 24');
		svg.setAttribute('aria-hidden', 'true');
		svg.setAttribute('class', 'i' + (anim ? ' anim-' + anim : '') + (cls ? ' ' + cls : ''));
		if (d) svg.appendChild(path(d, 'b'));
		if (a) svg.appendChild(path(a, 'a'));
		return svg;
	}

	function path(d, cls) {
		var p = document.createElementNS(SVGNS, 'path');
		p.setAttribute('d', d);
		if (cls) p.setAttribute('class', cls);
		return p;
	}

	function svg(viewBox, attrs, kids) {
		var s = document.createElementNS(SVGNS, 'svg');
		s.setAttribute('viewBox', viewBox);
		Object.keys(attrs || {}).forEach(function (k) { s.setAttribute(k, attrs[k]); });
		(kids || []).forEach(function (k) { s.appendChild(k); });
		return s;
	}

	function svgEl(tag, attrs) {
		var e = document.createElementNS(SVGNS, tag);
		Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
		return e;
	}

	// common window icons (single stroke paths)
	var I = {
		close: 'M6 6l12 12M18 6L6 18',
		check: 'M5 12l5 5 9-10',
		search: 'M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14M20 20l-4-4',
		folder: 'M3 7v11h18V9h-9l-2-2z',
		folderOpen: 'M3 18l3-7h15',
		cloud: 'M7 18a5 5 0 0 1-.6-10A6 6 0 0 1 18 9a4 4 0 0 1-1 9',
		cloudDown: 'M12 11v8M9 16l3 3 3-3',
		refresh: 'M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5',
		chev: 'M6 9l6 6 6-6',
		comp: 'M4 6h16v12H4z',
		text: 'M5 6h14M12 6v13',
		eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5',
		eyeOff: 'M3 3l18 18M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 9 6 9 6a15 15 0 0 1-2.6 3.2M6.6 6.6C4.2 8.1 3 12 3 12s4 6 9 6a8.6 8.6 0 0 0 4.4-1.2',
		download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
		reset: 'M4 12a8 8 0 1 0 2.3-5.7M4 4v5h5',
		grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
		font: 'M5 19l5-14h1l5 14M7 14h7'
	};

	function store(key, val) {
		try {
			if (arguments.length > 1) { localStorage.setItem('pgn.' + key, JSON.stringify(val)); return val; }
			var v = localStorage.getItem('pgn.' + key);
			return v == null ? undefined : JSON.parse(v);
		} catch (e) { return undefined; }
	}

	function debounce(fn, ms) {
		var t;
		return function () {
			var a = arguments, self = this;
			clearTimeout(t);
			t = setTimeout(function () { fn.apply(self, a); }, ms);
		};
	}

	// footer note inside windows: ok / error with auto clear
	function note(holder, msg, ok, fallback) {
		holder.textContent = '';
		var n = h('span.note' + (ok === false ? '.err' : ''), null, [
			h('i', null, icon(ok === false ? 'M12 7v6M12 17h.01' : I.check)),
			msg
		]);
		holder.appendChild(n);
		clearTimeout(holder._t);
		holder._t = setTimeout(function () {
			holder.textContent = '';
			if (fallback) holder.appendChild(typeof fallback === 'function' ? fallback() : document.createTextNode(fallback));
		}, ok === false ? 4200 : 2600);
	}

	// normalize for accent-insensitive comparisons
	function strip(s) {
		return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '');
	}

	window.UI = { h: h, set: set, add: add, icon: icon, path: path, svg: svg, svgEl: svgEl, I: I, store: store, debounce: debounce, note: note, strip: strip };
})();
