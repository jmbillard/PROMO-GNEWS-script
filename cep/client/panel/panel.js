/*
---------------------------------------------------------------
> PROMO GNEWS · accordion panel
---------------------------------------------------------------
  sections from tools.js → one icon each; the open section
  expands in place and lists its tools in as many 36px columns
  as the panel width allows (or as labelled rows when 'labels'
  is on and the panel is wide).

  tool fields (tools.js):
    id      host tool id (PGN.run)          win     open a window instead
    name    tooltip / label                 toggle  local on/off modifier
    sel     'layers' | 'comp' | undefined   alt     right-click description
    d, a    icon paths, anim → hover anim   glyph   text icon instead of svg
    args    () → extra args for the host
*/
(function () {
	'use strict';

	var h = UI.h, icon = UI.icon;
	var app = document.getElementById('app');
	var nav = document.getElementById('sections');
	var foot = document.getElementById('foot');
	var msgLine = document.getElementById('msg');

	var state = {
		open: UI.store('open') || null,
		toggles: UI.store('toggles') || { keys: false, exp: false },
		status: null,          // { comp, layers } from host polling
		busy: null,            // running tool id
		labels: UI.store('labels') !== false,
		dev: !!UI.store('dev'),
		reduced: !!UI.store('reduced'),
		width: 0
	};

	var tileById = {};
	var selBtn, selTimer;

	/* ---------- layout ---------- */

	// short and wide (docked along the top or bottom of the workspace): everything in one row,
	// the open section unfolds to the right, its tools in one row (two when the bar is tall enough)
	function metrics() {
		var w = window.innerWidth, hgt = window.innerHeight;
		var horiz = hgt < 260 && w > hgt * 1.4;
		state.width = w;
		app.classList.toggle('horiz', horiz);
		app.classList.toggle('wide', !horiz && w >= 150);
		app.classList.toggle('roomy', !horiz && w >= 110);
		app.classList.toggle('list', !horiz && state.labels && w >= 150);
		app.classList.toggle('reduced', state.reduced);
		var cols = Math.max(1, Math.floor((w - 20 + 2) / 38));
		var rows = hgt >= 100 ? 2 : 1;   // horizontal: one or two rows of tools
		nav.querySelectorAll('.grid').forEach(function (g) {
			var list = app.classList.contains('list') && !g.classList.contains('swatches');
			g.style.gridTemplateColumns = horiz ? '' : (list ? '1fr' : 'repeat(' + cols + ', 36px)');
			g.style.gridTemplateRows = horiz ? 'repeat(' + rows + ', 36px)' : '';
		});
	}

	/* ---------- sections ---------- */

	function render() {
		nav.textContent = '';
		tileById = {};
		SECTIONS.forEach(function (sec) {
			if (sec.dev && !state.dev) return;
			var isOpen = state.open === sec.id;
			var head = h('button.k', {
				title: sec.name,
				'aria-label': sec.name,
				'aria-expanded': String(isOpen),
				onclick: function () { toggleSection(sec.id); }
			}, icon(sec.d, sec.a));
			var block = h('div.sec' + (isOpen ? '.open' : ''), {
				style: isOpen ? { background: rgba(sec.acc, .12), color: sec.acc } : null
			}, h('div.head', null, [head, h('span.name', { text: sec.name })]));
			if (isOpen) { block.style.setProperty('--sa', sec.acc); block.style.setProperty('--sa-ink', ink(sec.acc)); }

			if (isOpen && sec.fields) block.appendChild(buildFields(sec));
			if (isOpen) block.appendChild(buildGrid(sec));
			nav.appendChild(block);
		});
		metrics();
		refreshGates();
	}

	function buildGrid(sec) {
		var wrap = h('div.groups');
		var delay = 40;
		sec.groups.forEach(function (group, gi) {
			if (gi > 0) wrap.appendChild(h('span.sep', { style: { animationDelay: (delay += 20) + 'ms' } }));
			var grid = h('div.grid' + (group[0] && group[0].swatch ? '.swatches' : ''));
			group.forEach(function (tool) {
				var el = tool.swatch ? swatch(tool, sec) : tile(tool, sec);
				el.style.animationDelay = (delay += 24) + 'ms';
				grid.appendChild(el);
			});
			wrap.appendChild(grid);
		});
		return wrap;
	}

	function tile(tool, sec) {
		var tip = tool.name + (tool.alt ? '\n◗ ' + tool.alt : '') + (tool.param ? '\n◗ ajustar ' + PARAMS[tool.param].name + ' (' + PARAMS[tool.param].get() + ')' : '');
		var ico = h('span.ico', null, tool.glyph ? h('span.glyph', { text: tool.glyph }) : icon(tool.d, tool.a, tool.anim));
		var el = h('button.t', {
			title: tip,
			'aria-label': tool.name,
			onclick: function () { activate(tool, sec, false); },
			oncontextmenu: function (e) {
				e.preventDefault();
				if (tool.param) toggleParam(tool, el);
				else if (tool.alt) activate(tool, sec, true);
			}
		}, [ico, h('span.lbl', { text: tool.name })]);
		if (tool.toggle) {
			el.setAttribute('aria-pressed', String(!!state.toggles[tool.toggle]));
			el.classList.toggle('tg-on', !!state.toggles[tool.toggle]);
		}
		tileById[tool.id] = { el: el, tool: tool };
		return el;
	}

	function swatch(tool, sec) {
		var el = h('button.sw', {
			title: tool.name + (tool.alt ? '\n◗ ' + tool.alt : ''),
			'aria-label': tool.name,
			onclick: function () { activate(tool, sec, false); },
			oncontextmenu: function (e) { e.preventDefault(); if (tool.alt) activate(tool, sec, true); }
		}, h('i', { style: { background: tool.hex } }));
		tileById[tool.id] = { el: el, tool: tool };
		return el;
	}

	function toggleSection(id) {
		state.open = state.open === id ? null : id;
		UI.store('open', state.open);
		render();
		// keep the opened block in view
		if (state.open) {
			var el = nav.querySelector('.sec.open');
			if (el && el.scrollIntoView) setTimeout(function () { el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' }); }, 60);
		}
	}

	/* ---------- long tasks: progress embedded in the bar ---------- */

	var jobBar = h('div.jobbar', null, [h('i')]);

	function runJob(tool, sec, entry, args) {
		state.busy = tool.id;
		var el = entry.el;
		var C = 2 * Math.PI * 15;
		var ring = UI.svg('0 0 36 36', { class: 'pring', 'aria-hidden': 'true' }, [
			UI.svgEl('circle', { cx: 18, cy: 18, r: 15, class: 'track' }),
			UI.svgEl('circle', { cx: 18, cy: 18, r: 15, class: 'bar', 'stroke-dasharray': C, 'stroke-dashoffset': C })
		]);
		el.classList.add('is-job');
		el.appendChild(ring);
		el.setAttribute('aria-busy', 'true');
		var oldTitle = el.title;
		el.title = tool.name + '\nclique para cancelar';

		app.classList.add('jobbing');
		foot.appendChild(jobBar);
		jobBar.style.setProperty('--acc', sec.acc);
		selBtn.classList.remove('err');
		selBtn.textContent = '';
		var pctEl = h('span.pct.mono', { text: '' });
		selBtn.appendChild(pctEl);
		msgLine.textContent = '';
		var lbl = h('span.joblbl', { text: tool.name });
		msgLine.appendChild(lbl);

		function progress(r) {
			var total = r.total || 0, done = r.done || 0;
			var f = total ? Math.min(1, done / total) : null;
			app.classList.toggle('indet', f === null);
			if (f !== null) {
				ring.lastChild.setAttribute('stroke-dashoffset', String(C * (1 - f)));
				jobBar.firstChild.style.transform = 'scaleX(' + f + ')';
				pctEl.textContent = Math.round(f * 100) + '%';
			} else {
				pctEl.textContent = '…';
			}
			if (r.label) { lbl.textContent = r.label; selBtn.title = r.label; }
		}

		var p = PGN.job(tool.hostId || tool.id, args, progress);
		state.job = { id: tool.id, p: p };
		p.then(function (res) {
			state.job = null;
			state.busy = null;
			el.classList.remove('is-job');
			el.removeAttribute('aria-busy');
			el.title = oldTitle;
			if (ring.parentNode) ring.remove();
			app.classList.remove('jobbing', 'indet');
			if (res.ok) jobBar.firstChild.style.transform = 'scaleX(1)';
			setTimeout(function () { if (!state.job && jobBar.parentNode) jobBar.remove(); jobBar.firstChild.style.transform = ''; }, 500);
			var ringStub = h('span');
			if (res.cancelled) { feedback('cancelado', false); renderSel(); return; }
			finish(entry, ringStub, res, sec);
		});
	}

	/* ---------- inline parameter (right-click on tools with 'param') ---------- */

	function toggleParam(tool, tileEl) {
		var open = nav.querySelector('.param');
		var same = open && open.dataset.tool === tool.id;
		if (open) open.remove();
		if (same) return;
		var p = PARAMS[tool.param];
		var val = h('span.pv.mono', { text: p.get() + p.unit });
		function step(d) {
			var v = p.set(p.get() + d * p.step);
			val.textContent = v + p.unit;
			tileEl.title = tool.name + '\n◗ ajustar ' + p.name + ' (' + v + ')';
		}
		function hold(d) {
			var t, i;
			return {
				onmousedown: function () { step(d); t = setTimeout(function () { i = setInterval(function () { step(d * 5); }, 90); }, 380); },
				onmouseup: function () { clearTimeout(t); clearInterval(i); },
				onmouseleave: function () { clearTimeout(t); clearInterval(i); }
			};
		}
		var box = h('div.param', { 'data-tool': tool.id, title: tool.name + ' · ' + p.name }, [
			h('button.pb', Object.assign({ 'aria-label': 'menos ' + p.name }, hold(-1)), icon('M6 12h12')),
			val,
			h('button.pb', Object.assign({ 'aria-label': 'mais ' + p.name }, hold(1)), icon('M12 6v12M6 12h12'))
		]);
		box.addEventListener('wheel', function (e) { e.preventDefault(); step(e.deltaY < 0 ? 1 : -1); });
		tileEl.parentNode.insertBefore(box, tileEl.nextSibling);
	}

	/* ---------- project id / name (only when the panel is roomy) ---------- */

	function buildFields(sec) {
		var idF = h('input.fld.mono', { type: 'text', placeholder: 'ID', 'aria-label': 'ID do projeto', spellcheck: 'false' });
		var nameF = h('input.fld', { type: 'text', placeholder: 'retranca', 'aria-label': 'Nome do projeto', spellcheck: 'false' });
		function bind(input, id, key) {
			input.addEventListener('change', function () {
				var a = {}; a[key] = input.value;
				PGN.run(id, a).then(function (r) {
					if (r.ok && r.data && r.data[key] != null) input.value = r.data[key];
					feedback(r.ok ? r.msg : r.error, r.ok, sec.acc);
				});
			});
			input.addEventListener('keydown', function (e) { if (e.key === 'Enter') input.blur(); });
		}
		bind(idF, 'proj.setId', 'id');
		bind(nameF, 'proj.setName', 'name');
		PGN.run('proj.info', {}).then(function (r) {
			if (!r.ok || !r.data) return;
			idF.value = r.data.id || '';
			nameF.value = r.data.name || '';
			idF.placeholder = r.data.idLabel || 'ID';
			if (r.data.user) idF.title = 'usuário: ' + r.data.user;
		});
		return h('div.fields', null, [idF, nameF]);
	}

	/* ---------- running tools ---------- */

	function gated(tool) {
		var st = state.status;
		if (!st || !tool.sel) return false;
		if (tool.sel === 'comp') return !st.comp;
		return !st.comp || st.layers < (tool.min || 1);
	}

	function refreshGates() {
		Object.keys(tileById).forEach(function (id) {
			var t = tileById[id];
			t.el.classList.toggle('is-off', gated(t.tool));
		});
	}

	function activate(tool, sec, alt) {
		if (tool.toggle) {
			state.toggles[tool.toggle] = !state.toggles[tool.toggle];
			UI.store('toggles', state.toggles);
			var t = tileById[tool.id].el;
			t.classList.toggle('tg-on', state.toggles[tool.toggle]);
			t.setAttribute('aria-pressed', String(state.toggles[tool.toggle]));
			return;
		}
		if (tool.win && !(alt && tool.altRun)) { PGN.open(tool.win); return; }
		if (alt && tool.altWin) { PGN.open(tool.altWin); return; }
		// clicking a running job again cancels it
		if (state.job && state.job.id === tool.id) { state.job.p.cancel(); return; }
		if (state.busy) return;

		var entry = tileById[tool.id];
		if (gated(tool)) {
			shake(entry.el);
			nudgeSel();
			return;
		}
		var args = tool.args ? tool.args(state) : {};
		if (alt) args.alt = true;
		if (tool.job) { runJob(tool, sec, entry, args); return; }

		state.busy = tool.id;
		entry.el.classList.add('is-run');
		var ring = h('span.ring');
		if (!tool.swatch) entry.el.appendChild(ring);

		var t0 = Date.now();
		PGN.run(tool.hostId || tool.id, args).then(function (res) {
			// keep the spinner visible long enough to read as feedback
			var wait = Math.max(0, 350 - (Date.now() - t0));
			setTimeout(function () { finish(entry, ring, res, sec); }, wait);
		});
	}

	function finish(entry, ring, res, sec) {
		state.busy = null;
		entry.el.classList.remove('is-run');
		if (ring.parentNode) ring.parentNode.removeChild(ring);

		if (res.ok) {
			if (entry.tool.swatch) {
				var c = UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path(UI.I.check)]);
				c.style.stroke = ink(entry.tool.hex);
				entry.el.appendChild(c);
				setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, 1200);
			} else {
				entry.el.classList.add('is-done');
				var chk = UI.svg('0 0 24 24', { class: 'chk', 'aria-hidden': 'true' }, [UI.path(UI.I.check)]);
				entry.el.appendChild(chk);
				setTimeout(function () {
					entry.el.classList.remove('is-done');
					if (chk.parentNode) chk.parentNode.removeChild(chk);
				}, 1300);
			}
			feedback(res.msg, true, sec.acc);
		} else {
			entry.el.classList.add('is-err');
			shake(entry.el);
			setTimeout(function () { entry.el.classList.remove('is-err'); }, 1400);
			feedback(res.error, false);
		}
		pollStatus();
	}

	function shake(el) {
		el.classList.remove('is-shake');
		void el.offsetWidth;
		el.classList.add('is-shake');
		setTimeout(function () { el.classList.remove('is-shake'); }, 450);
	}

	/* ---------- feedback: selection chip + message line ---------- */

	var flashTimer;

	function feedback(text, ok, acc) {
		clearTimeout(flashTimer);
		selBtn.classList.remove('err');
		selBtn.textContent = '';
		if (ok) {
			var c = UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path(UI.I.check)]);
			c.style.stroke = acc || 'var(--ok)';
			selBtn.appendChild(c);
		} else {
			selBtn.classList.add('err');
			selBtn.appendChild(h('span', { text: '!' }));
		}
		selBtn.title = text || '';
		if (text) {
			msgLine.textContent = '';
			var n = h('span.note' + (ok ? '' : '.err'), null, [h('i', { style: ok && acc ? { background: acc } : null }, icon(ok ? UI.I.check : 'M12 7v6M12 17h.01')), text]);
			msgLine.appendChild(n);
		}
		flashTimer = setTimeout(function () {
			msgLine.textContent = '';
			renderSel();
		}, ok ? 1600 : 4000);
	}

	function nudgeSel() {
		selBtn.classList.remove('nudge');
		void selBtn.offsetWidth;
		selBtn.classList.add('nudge');
		setTimeout(function () { selBtn.classList.remove('nudge'); }, 450);
	}

	function renderSel() {
		var st = state.status;
		selBtn.classList.remove('err');
		selBtn.textContent = '';
		var n = st ? st.layers : 0;
		selBtn.appendChild(h('span.dot' + (state.netOff ? '.off' : (st && st.comp && n > 0 ? '.live' : ''))));
		selBtn.appendChild(h('span', { text: st && st.comp ? String(n) : '–' }));
		selBtn.title = (st && st.comp ? st.comp + ' · ' + n + (n === 1 ? ' layer' : ' layers') : 'nenhuma comp ativa') + (state.netOff ? '\n' + state.netOff : '');
	}

	function pollStatus() {
		PGN.status().then(function (st) {
			if (!st) return;
			var changed = !state.status || st.comp !== state.status.comp || st.layers !== state.status.layers;
			state.status = st;
			if (changed) {
				refreshGates();
				if (!flashTimer || !selBtn.querySelector('svg, span:only-child')) renderSel();
			}
		});
	}

	/* ---------- footer ---------- */

	function buildFooter() {
		foot.textContent = '';
		FOOTER.forEach(function (f) {
			var b = h('button.k', {
				title: f.name + (f.alt ? '\n◗ ' + f.alt : ''),
				'aria-label': f.name,
				onclick: function () { footerAction(f, false, b); },
				oncontextmenu: function (e) { e.preventDefault(); if (f.alt) footerAction(f, true, b); }
			}, icon(f.d, f.a, f.anim));
			foot.appendChild(b);
		});
		selBtn = h('button.sel', { 'aria-label': 'Seleção atual', onclick: pollStatus });
		foot.appendChild(selBtn);
		renderSel();
	}

	function footerAction(f, alt, btn) {
		if (f.win) { PGN.open(f.win); return; }
		if (!f.id || state.busy) return;
		state.busy = f.id;
		btn.classList.add('on');
		PGN.run(f.id, alt ? { alt: true } : {}).then(function (res) {
			state.busy = null;
			btn.classList.remove('on');
			feedback(res.ok ? res.msg : res.error, res.ok, 'var(--brand)');
		});
	}

	/* ---------- helpers ---------- */

	function rgba(hex, a) {
		var n = parseInt(hex.slice(1), 16);
		return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')';
	}

	function ink(hex) {
		var n = parseInt(hex.slice(1), 16);
		return (0.299 * (n >> 16 & 255) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) > 140 ? '#141416' : '#F2F2F4';
	}

	/* ---------- events ---------- */

	// toasts sent by the windows (curves, search, templates...)
	PGN.on('toast', function (d) { if (d) feedback(d.msg, d.ok !== false, d.acc); });
	// preferences changed in the settings window
	PGN.on('prefs', function (p) {
		if (!p) return;
		if (p.showLabels != null) { state.labels = !!p.showLabels; UI.store('labels', state.labels); }
		if (p.reduced != null) { state.reduced = !!p.reduced; UI.store('reduced', state.reduced); }
		if (p.devMode != null) { state.dev = !!p.devMode; UI.store('dev', state.dev); render(); }
		metrics();
	});

	window.addEventListener('resize', metrics);
	// horizontal bar: the mouse wheel scrolls sideways
	document.getElementById('scroll').addEventListener('wheel', function (e) {
		if (!app.classList.contains('horiz') || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
		e.preventDefault();
		this.scrollLeft += e.deltaY;
	}, { passive: false });
	document.addEventListener('visibilitychange', function () { if (!document.hidden) pollStatus(); });
	document.getElementById('logo').addEventListener('click', function () { PGN.openURL('https://github.com/jmbillard/PROMO-GNEWS-script'); });

	/* ---------- GNEWS logo + opening animation ---------- */

	var logoBtn = document.getElementById('logo');
	if (window.PGN_LOGO_SVG) { logoBtn.appendChild(PGN_LOGO_SVG('globo')); logoBtn.appendChild(PGN_LOGO_SVG('full')); }

	// network share offline: the selection chip's dot turns red, the message goes in its tooltip
	// (no popup, no toast)
	function netDot(msg) {
		state.netOff = msg || '';
		renderSel();
	}

	function intro() {
		if (!window.PGN_LOGO_DRAW || state.reduced || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
		var W = window.innerWidth, H = window.innerHeight, dpr = window.devicePixelRatio || 1;
		var horiz = app.classList.contains('horiz'), narrow = !horiz && W < 150;
		// logo units: the whole move spans x −694…324, y ±202; the final logo is centered at x ≈ −21.
		// The narrow bar only frames the globe (the lettering would be a few pixels tall)
		var view = narrow ? { cx: -287, cy: 13, w: 560, h: 420 } : { cx: -21, cy: 13, w: 1380, h: 420 };
		var k = Math.min((W - 16) / view.w, (H - 16) / view.h, 0.34);
		var cw = Math.round(view.w * k), ch = Math.round(view.h * k);
		var box = h('div.intro', { 'aria-hidden': 'true' });
		var cv = h('canvas');
		cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
		cv.style.width = cw + 'px'; cv.style.height = ch + 'px';
		box.appendChild(cv);
		document.body.appendChild(box);
		var ctx = cv.getContext('2d'), color = getComputedStyle(document.documentElement).getPropertyValue('--tx').trim() || '#ECECEF';
		var t0 = 0, last = -1, end = window.PGN_LOGO_END;
		(function frame(now) {
			if (!t0) t0 = now;
			var t = (now - t0) / 1000, f = Math.min(Math.floor(t * 30), Math.ceil(end * 30));
			if (f !== last) { last = f; PGN_LOGO_DRAW(ctx, f / 30, color, { cx: view.cx, cy: view.cy, scale: k * dpr }); }
			if (t < end + 0.3) { requestAnimationFrame(frame); return; }
			box.classList.add('out');
			setTimeout(function () { box.remove(); }, 400);
		})(performance.now());
		// in case requestAnimationFrame is throttled (panel hidden): never leave the cover on
		setTimeout(function () { if (box.parentNode) { box.classList.add('out'); setTimeout(function () { box.remove(); }, 400); } }, 4000);
	}

	buildFooter();
	render();
	intro();

	// read the real 'show labels' preference once the host is up
	PGN.run('prefs.get', {}).then(function (r) {
		if (!r || !r.ok) { if (r && r.error) feedback(r.error, false); return; }
		if (!r.data) return;
		// network share offline (home office suggested): warn once, without blocking
		netDot(r.data.netOffline);
		if (r.data.showLabels != null && UI.store('labels') === undefined) {
			state.labels = !!r.data.showLabels;
			metrics();
		}
		if (!!r.data.devMode !== state.dev) {
			state.dev = !!r.data.devMode;
			UI.store('dev', state.dev);
			render();
		}
	});

	pollStatus();
	selTimer = setInterval(function () { if (!document.hidden && !state.busy) pollStatus(); }, 1200);
})();
