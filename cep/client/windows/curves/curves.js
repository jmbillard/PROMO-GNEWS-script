/*
---------------------------------------------------------------
> PROMO GNEWS · keyframe influence window
---------------------------------------------------------------
  host: inf.stats (poll) · inf.read (copiar) · inf.apply { out, in }
        inf.presets.get / .set { presets } / .reset (+ salva a curva atual, × exclui)
  ao vivo: with keys selected (mode 'keyframes'), every change of the curve is
  applied right away (inf.apply { live }), one request at a time, always the latest values
*/
(function () {
	'use strict';

	var $ = function (id) { return document.getElementById(id); };
	var el = UI.svgEl;
	var ACC = '#ECFF8C';
	var plot = $('plot'), ball = $('ball'), note = $('note');
	var s = { out: UI.store('inf.out') || 33, in: UI.store('inf.in') || 66, linked: false, drag: null, busy: false };

	// ---- plot ---------------------------------------------------
	for (var i = 1; i < 10; i++) plot.appendChild(el('line', { x1: 20 + i * 24, y1: 16, x2: 20 + i * 24, y2: 144, stroke: '#232328', 'stroke-width': 1 }));
	plot.appendChild(el('line', { x1: 20, y1: 144, x2: 260, y2: 144, stroke: '#34343A' }));
	plot.appendChild(el('line', { x1: 20, y1: 16, x2: 260, y2: 16, stroke: '#34343A', 'stroke-dasharray': '2 4' }));
	plot.appendChild(el('path', { d: 'M20 144L260 16', stroke: '#34343A', 'stroke-dasharray': '3 5', fill: 'none' }));
	var h1 = plot.appendChild(el('line', { y1: 144, y2: 144, x1: 20, stroke: '#6A6A74', 'stroke-width': 1.4 }));
	var h2 = plot.appendChild(el('line', { y1: 16, y2: 16, x1: 260, stroke: '#6A6A74', 'stroke-width': 1.4 }));
	var curve = plot.appendChild(el('path', { fill: 'none', stroke: 'currentColor', 'stroke-width': 3, 'stroke-linecap': 'round' }));
	plot.appendChild(el('circle', { cx: 20, cy: 144, r: 4, fill: '#D8D8DE' }));
	plot.appendChild(el('circle', { cx: 260, cy: 16, r: 4, fill: '#D8D8DE' }));
	var hit1 = plot.appendChild(el('circle', { class: 'hit', cy: 144, r: 16 }));
	var hit2 = plot.appendChild(el('circle', { class: 'hit', cy: 16, r: 16 }));
	var k1 = plot.appendChild(el('circle', { class: 'knob k-out', cy: 144, r: 6, fill: '#1F1F23', stroke: 'currentColor', 'stroke-width': 2.4 }));
	var k2 = plot.appendChild(el('circle', { class: 'knob k-in', cy: 16, r: 6, fill: '#1F1F23', stroke: 'currentColor', 'stroke-width': 2.4 }));

	function draw() {
		var p1 = +(20 + s.out * 2.4).toFixed(1), p2 = +(260 - s.in * 2.4).toFixed(1);
		h1.setAttribute('x2', p1); h2.setAttribute('x2', p2);
		[hit1, k1].forEach(function (c) { c.setAttribute('cx', p1); });
		[hit2, k2].forEach(function (c) { c.setAttribute('cx', p2); });
		curve.setAttribute('d', 'M20 144C' + p1 + ' 144 ' + p2 + ' 16 260 16');
		ball.style.animationTimingFunction = 'cubic-bezier(' + (s.out / 100).toFixed(2) + ', 0, ' + (1 - s.in / 100).toFixed(2) + ', 1)';
		$('out').value = s.out; $('in').value = s.in;
		$('outV').textContent = s.out + '%'; $('inV').textContent = s.in + '%';
		plot.setAttribute('aria-label', 'Curva de influência: saída ' + s.out + '%, entrada ' + s.in + '%');
		var saved = false;
		document.querySelectorAll('.pre[data-o]').forEach(function (b) {
			var on = +b.dataset.o === s.out && +b.dataset.i === s.in;
			b.classList.toggle('on', on);
			if (on) saved = true;
		});
		var add = $('preAdd');
		if (add) add.classList.toggle('dim', saved);
		UI.store('inf.out', s.out); UI.store('inf.in', s.in);
	}

	function set(which, v) {
		v = Math.max(1, Math.min(100, Math.round(v)));
		if (s.linked) { s.out = v; s.in = v; } else s[which] = v;
		draw();
		liveApply();
	}

	// ---- ao vivo: the selected keys follow the curve -----------------
	var live = { on: UI.store('inf.live') !== false, inflight: false, sent: '' };
	function liveApply() {
		if (!live.on || mode !== 'keys' || $('apply').dataset.nokeys !== '0') return;
		var want = s.out + '/' + s.in;
		if (live.inflight || want === live.sent) return;
		live.inflight = true;
		live.sent = want;
		$('live').classList.remove('sending'); void $('live').offsetWidth; $('live').classList.add('sending');
		PGN.run('inf.apply', { out: s.out, 'in': s.in, live: true }).then(function (r) {
			live.inflight = false;
			UI.note(note, r.ok ? r.msg : r.error, r.ok);
			// the curve moved again while this one was running: send the latest
			if (r.ok && s.out + '/' + s.in !== live.sent) liveApply();
		});
	}
	function setLive(on) {
		live.on = on;
		UI.store('inf.live', on);
		$('live').classList.toggle('on', on);
		$('live').setAttribute('aria-pressed', String(on));
		live.sent = '';
		if (on) liveApply();
	}
	$('live').addEventListener('click', function () { setLive(!live.on); });

	function startDrag(which, e) {
		e.preventDefault();
		s.drag = which;
		plot.classList.add('drag-' + which);
		var mv = function (ev) {
			var r = plot.getBoundingClientRect();
			var x = (ev.clientX - r.left) / r.width * 280;
			set(which, which === 'out' ? (x - 20) / 2.4 : (260 - x) / 2.4);
		};
		var up = function () {
			window.removeEventListener('mousemove', mv);
			window.removeEventListener('mouseup', up);
			plot.classList.remove('drag-' + which);
			s.drag = null;
		};
		window.addEventListener('mousemove', mv);
		window.addEventListener('mouseup', up);
	}
	hit1.addEventListener('mousedown', function (e) { startDrag('out', e); });
	hit2.addEventListener('mousedown', function (e) { startDrag('in', e); });
	$('out').addEventListener('input', function () { set('out', +this.value); });
	$('in').addEventListener('input', function () { set('in', +this.value); });

	$('link').addEventListener('click', function () {
		s.linked = !s.linked;
		this.classList.toggle('on', s.linked);
		this.setAttribute('aria-pressed', String(s.linked));
		if (s.linked) { s.in = s.out; draw(); liveApply(); }
	});

	// ---- presets ------------------------------------------------
	// saved on the host (curves.json): + saves the current curve, × (on hover) deletes,
	// right click on + brings the default presets back
	var PRE = [];

	function preIcon(o, i) {
		var d = 'M3 19C' + (3 + o * .3).toFixed(1) + ' 19 ' + (33 - i * .3).toFixed(1) + ' 3 33 3';
		return UI.svg('0 0 36 22', { 'aria-hidden': 'true' }, [UI.path(d)]);
	}
	function savePresets(list, msg) {
		PGN.run('inf.presets.set', { presets: list, msg: msg }).then(function (r) {
			if (r.ok && r.data) { PRE = r.data.presets; renderPresets(); }
			UI.note(note, r.ok ? r.msg : r.error, r.ok);
		});
	}
	function renderPresets(animate) {
		var box = $('presets');
		box.textContent = '';
		var pd = 40;
		PRE.forEach(function (p, idx) {
			var b = UI.h('button.pre', {
				title: p[0] + ' / ' + p[1], 'aria-label': 'Preset ' + p[0] + '% / ' + p[1] + '%',
				'data-o': p[0], 'data-i': p[1],
				style: animate ? { animationDelay: (pd += 30) + 'ms' } : { animation: 'none' },
				onclick: function () { s.linked = false; $('link').classList.remove('on'); s.out = p[0]; s.in = p[1]; draw(); liveApply(); }
			}, preIcon(p[0], p[1]));
			var del = UI.h('span.pdel', {
				role: 'button', title: 'excluir preset', 'aria-label': 'Excluir preset ' + p[0] + ' / ' + p[1],
				onclick: function (e) {
					e.stopPropagation();
					var list = PRE.slice(); list.splice(idx, 1);
					b.classList.add('gone');
					setTimeout(function () { savePresets(list, 'Preset ' + p[0] + ' / ' + p[1] + ' exclu\u00EDdo'); }, 160);
				}
			}, UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path('M7 7l10 10M17 7L7 17')]));
			b.appendChild(del);
			box.appendChild(b);
		});
		var add = UI.h('button.pre.padd', {
			id: 'preAdd', title: 'salvar a curva atual como preset\n\u25D7 bot\u00E3o direito: presets padr\u00E3o', 'aria-label': 'Salvar a curva atual como preset',
			style: animate ? { animationDelay: (pd += 30) + 'ms' } : { animation: 'none' },
			onclick: function () {
				if (PRE.length >= 24) { UI.note(note, 'at\u00E9 24 presets', false); return; }
				savePresets(PRE.concat([[s.out, s.in]]), 'Preset ' + s.out + ' / ' + s.in + ' salvo');
			},
			oncontextmenu: function (e) {
				e.preventDefault();
				PGN.run('inf.presets.reset', {}).then(function (r) {
					if (r.ok && r.data) { PRE = r.data.presets; renderPresets(true); }
					UI.note(note, r.ok ? r.msg : r.error, r.ok);
				});
			}
		}, UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path('M12 6v12M6 12h12')]));
		box.appendChild(add);
		draw();
	}
	function loadPresets() {
		PGN.run('inf.presets.get', {}).then(function (r) {
			PRE = r.ok && r.data ? r.data.presets : [];
			renderPresets(true);
		});
	}

	// ---- keyframe stats -------------------------------------------
	var KEY = 'M12 4l8 8-8 8-8-8z', EASE = 'M4 18c4 0 6-12 16-12';
	var lastStats = '';

	function stat(d, txt) {
		return UI.h('span.stat', null, [UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path(d)]), txt]);
	}

	function pollStats(force) {
		// only while the mouse is over this window (and once when it comes in): the stats
		// are a host call, and nobody reads them while working in the timeline
		if (document.hidden || s.busy || s.drag || (!force && !UI.here())) return;
		PGN.run('inf.stats', {}).then(function (r) {
			if (!r.ok || !r.data) return;
			var d = r.data;
			var key = JSON.stringify(d);
			if (key === lastStats) return;
			lastStats = key;
			var box = $('stats');
			box.textContent = '';
			box.appendChild(stat(KEY, (d.keys || 0) + ' kf'));
			if (d.out != null) box.appendChild(stat(EASE, Math.round(d.out) + ' · ' + Math.round(d['in'])));
			if (d.outSpeed != null) box.appendChild(stat('M4 12h12M12 8l4 4-4 4', (+d.outSpeed).toFixed(1)));
			$('apply').dataset.nokeys = d.keys ? '0' : '1';
			live.sent = '';
			$('apply').disabled = mode === 'keys' && !d.keys;
		});
	}

	// ---- actions ------------------------------------------------
	function busy(btn, on) {
		s.busy = on;
		btn.disabled = on;
		var sp = btn.querySelector('.spin');
		if (on && !sp) btn.insertBefore(UI.h('span.spin'), btn.firstChild);
		if (!on && sp) sp.remove();
	}

	function report(r) {
		UI.note(note, r.ok ? r.msg : r.error, r.ok);
		PGN.notify(r.ok ? r.msg : r.error, r.ok, ACC);
	}

	$('copy').addEventListener('click', function () {
		var btn = this;
		busy(btn, true);
		PGN.run('inf.read', {}).then(function (r) {
			busy(btn, false);
			if (r.ok && r.data && r.data.out != null) {
				s.linked = false; $('link').classList.remove('on');
				s.out = Math.max(1, Math.round(r.data.out));
				s.in = Math.max(1, Math.round(r.data['in']));
				draw();
			}
			UI.note(note, r.ok ? r.msg : r.error, r.ok);
		});
	});

	// ---- apply as keyframe influence or as an expression (same curve, computed per frame) ----
	var mode = UI.store('inf.mode') || 'keys';
	var seg = $('mode'), ind = seg.querySelector('.ind');
	function setMode(m, animate) {
		mode = m;
		UI.store('inf.mode', m);
		// show / hide the remove button first: it changes the segment width
		$('unexpr').hidden = m !== 'expr';
		$('live').hidden = m === 'expr';
		seg.querySelectorAll('button').forEach(function (b) {
			var on = b.dataset.m === m;
			b.classList.toggle('on', on);
			b.setAttribute('aria-checked', String(on));
			if (on) { ind.style.left = b.offsetLeft + 'px'; ind.style.width = b.offsetWidth + 'px'; }
		});
		$('apply').title = m === 'expr' ? 'aplicar a curva como expressão nas propriedades selecionadas (2+ keyframes)' : 'aplicar nos keyframes selecionados';
		$('apply').disabled = m === 'keys' && $('apply').dataset.nokeys === '1';
	}
	seg.querySelectorAll('button').forEach(function (b) { b.addEventListener('click', function () { setMode(b.dataset.m); }); });
	requestAnimationFrame(function () { setMode(mode); });

	UI.add($('unexpr'), UI.icon(UI.I.close));
	$('unexpr').addEventListener('click', function () {
		PGN.run('inf.exprRemove', {}).then(report);
	});

	$('apply').addEventListener('click', function () {
		var btn = this;
		busy(btn, true);
		PGN.run(mode === 'expr' ? 'inf.expr' : 'inf.apply', { out: s.out, 'in': s.in }).then(function (r) {
			busy(btn, false);
			report(r);
			lastStats = '';
			pollStats(true);
		});
	});

	// browser preview data
	var MOCKPRE = [[33, 33], [66, 66], [90, 90], [85, 15], [15, 85], [100, 50]];
	PGN.mock('inf.presets.get', function () { return { data: { presets: MOCKPRE.slice() } }; }, 60);
	PGN.mock('inf.presets.set', function (a) { MOCKPRE = a.presets; return { msg: a.msg || 'Presets salvos', data: { presets: a.presets } }; }, 60);
	PGN.mock('inf.presets.reset', function () { MOCKPRE = [[33, 33], [66, 66], [90, 90], [85, 15], [15, 85], [100, 50]]; return { msg: 'Presets padr\u00E3o', data: { presets: MOCKPRE.slice() } }; }, 60);
	PGN.mock('inf.stats', function () { return { data: { keys: 2, out: 33, 'in': 66, outSpeed: 0 } }; }, 80);
	PGN.mock('inf.read', function () { return { msg: 'Influência copiada', data: { out: 75, 'in': 40, keys: 1 } }; });
	PGN.mock('inf.apply', function (a) { return { msg: 'Influência aplicada em 2 keyframes' }; });
	PGN.mock('inf.expr', function (a) { return { msg: '2 curvas aplicadas como expressão' }; });
	PGN.mock('inf.exprRemove', function () { return { msg: '2 expressões removidas' }; });

	draw();
	setLive(live.on);
	loadPresets();
	pollStats(true);   // first read, wherever the mouse is
	setInterval(function () { pollStats(); }, 1500);
	UI.onHere(function (v) { if (v) pollStats(); });
})();
