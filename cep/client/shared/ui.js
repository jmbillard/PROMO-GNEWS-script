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

	// debounced calls still waiting run right away when the window closes or hides
	// (a change typed just before closing the preferences would be lost otherwise)
	var pending = [];
	function flushPending() {
		var list = pending.splice(0);
		list.forEach(function (p) { clearTimeout(p.t); p.run(); });
	}
	window.addEventListener('beforeunload', flushPending);
	window.addEventListener('pagehide', flushPending);
	document.addEventListener('visibilitychange', function () { if (document.hidden) flushPending(); });

	function debounce(fn, ms) {
		var p = null;
		return function () {
			var a = arguments, self = this;
			if (p) { clearTimeout(p.t); pending.splice(pending.indexOf(p), 1); }
			p = { run: function () { p = null; fn.apply(self, a); } };
			var mine = p;
			mine.t = setTimeout(function () { var i = pending.indexOf(mine); if (i >= 0) pending.splice(i, 1); mine.run(); }, ms);
			pending.push(mine);
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

	/* ---------- tooltips ----------
	   every [title] becomes a custom tip: a small yellow square rises from below,
	   opens into the dark box and the text types in. The title moves to data-tip so
	   the native one stays quiet; code may set .title again, it is picked up on the
	   next hover. When the page is too small for any placement (the narrow vertical
	   bar), the native tooltip is kept: it can leave the panel, ours can't. */
	var tip = null, tipT = 0, typeT = 0, tipFor = null, lastHide = 0;
	var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

	function tipText(el) {
		if (el.hasAttribute('title')) {
			var t = el.getAttribute('title');
			if (t) el.setAttribute('data-tip', t);
			el.removeAttribute('title');
		}
		return el.getAttribute('data-tip') || '';
	}
	function hideTip() {
		clearTimeout(tipT); clearTimeout(typeT);
		if (tipFor) { lastHide = Date.now(); tipFor = null; }
		if (!tip) return;
		var old = tip;
		tip = null;
		old.classList.add('out');
		setTimeout(function () { old.remove(); }, 120);
	}
	function placeTip(box, r, w, ht) {
		var W = window.innerWidth, H = window.innerHeight, m = 4, gap = 6;
		var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
		var spots = [
			{ x: cx - w / 2, y: r.top - gap - ht },
			{ x: cx - w / 2, y: r.bottom + gap },
			{ x: r.right + gap, y: cy - ht / 2 },
			{ x: r.left - gap - w, y: cy - ht / 2 }
		];
		for (var i = 0; i < spots.length; i++) {
			var s = spots[i];
			if (i < 2) s.x = Math.max(m, Math.min(W - m - w, s.x));
			else s.y = Math.max(m, Math.min(H - m - ht, s.y));
			if (s.x >= m && s.y >= m && s.x + w <= W - m && s.y + ht <= H - m) {
				box.style.left = Math.round(s.x) + 'px';
				box.style.top = Math.round(s.y) + 'px';
				return true;
			}
		}
		return false;
	}
	function showTip(el) {
		var text = tipText(el);
		if (!text) return;
		var box = h('div.tip', { role: 'tooltip' }, h('span.tx'));
		var tx = box.firstChild;
		tx.textContent = text;
		document.body.appendChild(box);
		// measured at the corner, rounded up: a rounded-down width would wrap the last word
		box.style.left = '0px'; box.style.top = '0px';
		// (never wider than the window: a long name in the narrow bar wraps, see .tip max-width)
		var rb = box.getBoundingClientRect(), w = Math.min(Math.ceil(rb.width) + 1, window.innerWidth - 8), ht = Math.ceil(rb.height);
		if (!placeTip(box, el.getBoundingClientRect(), w, ht)) {
			// no room anywhere: give the native tooltip back
			box.remove();
			el.setAttribute('title', text);
			return;
		}
		box.style.width = w + 'px';
		box.style.height = ht + 'px';
		tx.textContent = '';
		tip = box;
		if (REDUCED) { box.classList.add('s1', 's2'); tx.textContent = text; return; }
		// square rises → opens → text types (≈ 0.45s in all)
		requestAnimationFrame(function () {
			box.classList.add('s1');
			typeT = setTimeout(function () {
				if (tip !== box) return;
				box.classList.add('s2');
				var i = 0, step = Math.max(1, Math.ceil(text.length / 22));
				typeT = setTimeout(function type() {
					if (tip !== box) return;
					i = Math.min(text.length, i + step);
					tx.textContent = text.slice(0, i);
					if (i < text.length) typeT = setTimeout(type, 11);
				}, 150);
			}, 110);
		});
	}
	document.addEventListener('mouseover', function (e) {
		var el = e.target.closest && e.target.closest('[title], [data-tip]');
		if (el && el.closest('[data-notip]')) { tipText(el); el = null; }   // the page shows the name itself
		if (el === tipFor) return;
		hideTip();
		if (!el) return;
		tipFor = el;
		tipText(el);
		// right after another tip: no wait, it reads as one moving tip
		tipT = setTimeout(function () { if (tipFor === el) showTip(el); }, Date.now() - lastHide < 400 ? 60 : 420);
	});
	// a click (either button) hides the tip, and it stays away until the mouse goes out and
	// back: it would sit on top of what the click just opened (the inline stepper, a result)
	document.addEventListener('mousedown', function () {
		var keep = tipFor;
		hideTip();
		tipFor = keep;
	}, true);
	document.addEventListener('wheel', hideTip, { passive: true, capture: true });
	document.addEventListener('keydown', hideTip, true);
	window.addEventListener('blur', hideTip);

	// a window that could not load its data: the error in the middle, plus 'tentar de novo'
	// (instead of an empty window once the footer note fades)
	function failState(holder, msg, retry) {
		holder.textContent = '';
		holder.appendChild(h('div.fail', null, [
			h('i', null, icon('M12 7v6M12 17h.01')),
			h('p', { text: msg || 'falha ao falar com o After Effects' }),
			h('button.btn.btn-2', { onclick: function () { if (window.PGN && PGN.retryHost) PGN.retryHost(); holder.textContent = ''; retry(); } }, h('span', { text: 'tentar de novo' }))
		]));
	}

	/* ---------- dropdown ----------
	   every <select class="fld"> in the windows becomes this: the field stretches down
	   (up when there is no room) into a list, and typing filters it (accent-insensitive).
	   The native select stays underneath as the source of truth: picking sets its value and
	   fires 'change', so the pages keep their code. Options/value changed by code are
	   picked up (MutationObserver + a check on open). Keys: ↑ ↓ Enter Esc. */
	function dropdown(sel) {
		if (sel._dd) return;
		var wrap = sel.parentNode.classList.contains('sel-wrap') ? sel.parentNode : null;
		var box = h('div.dd');
		var btn = h('button.dd-btn', { type: 'button', 'aria-haspopup': 'listbox', 'aria-label': sel.getAttribute('aria-label') || '' });
		var lbl = h('span.dd-lbl');
		var q = h('input.dd-q', { type: 'text', spellcheck: 'false', 'aria-label': 'buscar', placeholder: 'buscar…' });
		var pop = h('div.dd-pop', { role: 'listbox' });
		btn.appendChild(lbl);
		btn.appendChild(h('i.dd-chev'));
		box.appendChild(btn);
		box.appendChild(q);
		box.appendChild(pop);
		sel.parentNode.insertBefore(box, sel);
		box.appendChild(sel);
		sel.classList.add('dd-native');
		sel.tabIndex = -1;
		if (wrap) wrap.classList.add('has-dd');
		sel._dd = box;

		var items = [], act = -1;
		function label() {
			var o = sel.options[sel.selectedIndex];
			var empty = !o || o.value === '';
			lbl.textContent = o ? o.text : '';
			if (empty) { var ph = [].filter.call(sel.options, function (x) { return x.value === ''; })[0]; lbl.textContent = ph ? ph.text : ''; }
			box.classList.toggle('ph', empty);
		}
		function build(filter) {
			pop.textContent = '';
			items = [];
			var f = strip(filter || '').toLowerCase().trim();
			[].forEach.call(sel.children, function (node) {
				var group = node.tagName === 'OPTGROUP' ? node : null;
				var opts = group ? [].slice.call(node.children) : [node];
				var shown = opts.filter(function (o) { return o.value !== '' && !o.disabled && (!f || strip(o.text).toLowerCase().indexOf(f) >= 0); });
				if (!shown.length) return;
				if (group) pop.appendChild(h('div.dd-grp', { text: group.label }));
				shown.forEach(function (o) {
					var it = h('div.dd-it' + (o.selected && o.value !== '' ? '.sel' : ''), { role: 'option', text: o.text });
					it.addEventListener('mousedown', function (e) { e.preventDefault(); pick(o); });
					it.addEventListener('mousemove', function () { focusItem(items.indexOf(it)); });
					it._o = o;
					items.push(it);
					pop.appendChild(it);
				});
			});
			if (!items.length) pop.appendChild(h('div.dd-none', { text: 'nada encontrado' }));
			focusItem(Math.max(0, items.findIndex(function (x) { return x.classList.contains('sel'); })));
		}
		function focusItem(i) {
			if (act >= 0 && items[act]) items[act].classList.remove('act');
			act = i;
			var it = items[act];
			if (!it) return;
			it.classList.add('act');
			var top = it.offsetTop, bottom = top + it.offsetHeight;
			if (top < pop.scrollTop) pop.scrollTop = top - 4;
			else if (bottom > pop.scrollTop + pop.clientHeight) pop.scrollTop = bottom - pop.clientHeight + 4;
		}
		function pick(o) {
			sel.value = o.value;
			label();
			close();
			sel.dispatchEvent(new Event('change', { bubbles: true }));
		}
		function openIt() {
			if (box.classList.contains('open')) return;
			// a long list filled only when first opened (sel._fill: see the effects editor)
			if (typeof sel._fill === 'function') { var fill = sel._fill; sel._fill = null; fill(); }
			label();
			q.value = '';
			build('');
			// down by default — the scroll area scrolls to show it; up only when not even scrolling
			// gives the room (e.g. a fixed footer)
			var r = box.getBoundingClientRect(), need = Math.min(232, items.length * 26 + 12) + 8;
			var sc = box.parentNode, room = window.innerHeight - r.bottom, top = r.top;
			while (sc && sc !== document.body) {
				var ov = getComputedStyle(sc).overflowY;
				if (ov === 'auto' || ov === 'scroll') {
					var sr = sc.getBoundingClientRect();
					room = sr.bottom - r.bottom + (sc.scrollHeight - sc.scrollTop - sc.clientHeight);
					top = r.top - sr.top + sc.scrollTop;
					break;
				}
				sc = sc.parentNode;
			}
			box.classList.toggle('up', room < need && top > room);
			box.classList.add('open');
			setTimeout(function () {
				q.focus();
				if (!box.classList.contains('up') && pop.scrollIntoView) pop.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
			}, 30);
			document.addEventListener('mousedown', outside, true);
		}
		function close() {
			box.classList.remove('open');
			document.removeEventListener('mousedown', outside, true);
		}
		function outside(e) { if (!box.contains(e.target)) close(); }

		btn.addEventListener('click', function () { if (box.classList.contains('open')) close(); else openIt(); });
		btn.addEventListener('keydown', function (e) {
			if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openIt(); }
			else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey) { openIt(); q.value = e.key; build(q.value); e.preventDefault(); }
		});
		q.addEventListener('input', function () { build(q.value); });
		q.addEventListener('keydown', function (e) {
			if (e.key === 'ArrowDown') { e.preventDefault(); focusItem(Math.min(items.length - 1, act + 1)); }
			else if (e.key === 'ArrowUp') { e.preventDefault(); focusItem(Math.max(0, act - 1)); }
			else if (e.key === 'Enter') { e.preventDefault(); if (items[act]) pick(items[act]._o); }
			else if (e.key === 'Escape' || e.key === 'Tab') { close(); btn.focus(); }
		});
		new MutationObserver(function () { label(); if (box.classList.contains('open')) build(q.value); })
			.observe(sel, { childList: true, subtree: true, attributes: true, attributeFilter: ['selected'] });
		sel.addEventListener('change', label);
		// value set by code (no event): keep the label honest — one shared timer for every
		// dropdown, and only while the mouse is over this window (see 'presence' below)
		ddSync.push(function () { if (!box.classList.contains('open') && document.body.contains(sel)) label(); });
		label();
	}
	/* ---------- presence ----------
	   is the mouse over this panel / window? Everything that runs by itself (polls to
	   After Effects, looping animations, label sync) slows down or stops while it is away:
	   each host call runs on After Effects' own UI thread, and a looping animation keeps the
	   embedded browser repainting. html.away marks it for the CSS. */
	var here = false, hereCbs = [], ddSync = [];
	function setHere(v) {
		if (v === here) return;
		here = v;
		document.documentElement.classList.toggle('away', !v);
		hereCbs.forEach(function (fn) { fn(v); });
	}
	document.documentElement.classList.add('away');
	document.documentElement.addEventListener('mouseenter', function () { setHere(true); });
	document.documentElement.addEventListener('mouseleave', function () { setHere(false); });
	document.addEventListener('mousemove', function () { setHere(true); }, true);
	document.addEventListener('keydown', function () { setHere(true); }, true);
	window.addEventListener('blur', function () { setHere(false); });
	setInterval(function () { if (here) ddSync.forEach(function (fn) { fn(); }); }, 800);
	hereCbs.push(function (v) { if (v) ddSync.forEach(function (fn) { fn(); }); });

	function upgradeSelects(root) {
		[].forEach.call((root || document).querySelectorAll('select.fld'), dropdown);
	}
	if (!document.body || !document.body.classList.contains('panel-page')) {
		var startDD = function () {
			upgradeSelects(document);
			new MutationObserver(function (ms) {
				ms.forEach(function (m) { [].forEach.call(m.addedNodes, function (n) { if (n.nodeType !== 1) return; if (n.matches && n.matches('select.fld')) dropdown(n); else if (n.querySelectorAll) upgradeSelects(n); }); });
			}).observe(document.body, { childList: true, subtree: true });
		};
		if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startDD); else startDD();
	}

	window.UI = { here: function () { return here; }, onHere: function (fn) { hereCbs.push(fn); }, dropdown: dropdown, failState: failState, h: h, set: set, add: add, icon: icon, path: path, svg: svg, svgEl: svgEl, I: I, store: store, debounce: debounce, note: note, strip: strip };
})();
