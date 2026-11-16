/*
---------------------------------------------------------------
> PROMO GNEWS · text layer search window
---------------------------------------------------------------
  host: find.search { query, visible, matchCase, accents, invert, regex }
        find.select { compId, layerIndex, keyIndex } | { items: [...] }
*/
(function () {
	'use strict';

	var h = UI.h, I = UI.I;
	var $ = function (id) { return document.getElementById(id); };
	var q = $('q'), res = $('res'), info = $('info'), prog = $('prog'), allBtn = $('all'), clr = $('clr');

	var opts = Object.assign({ visible: true, matchCase: false, accents: false, invert: false, regex: false }, UI.store('find.opts') || {});
	var last = null, seq = 0, picked = {};

	var OPTS = [
		{ key: 'visible', name: 'Só layers visíveis', d: I.eye },
		{ key: 'matchCase', name: 'Diferenciar maiúsculas', label: 'Tt' },
		{ key: 'accents', name: 'Diferenciar acentos', label: 'àê' },
		{ key: 'invert', name: 'Inverter: sem o termo', label: '!=' },
		{ key: 'regex', name: 'Expressão regular', label: '.*' }
	];

	OPTS.forEach(function (o) {
		var b = h('button.op' + (opts[o.key] ? '.on' : ''), {
			title: o.name, 'aria-label': o.name, 'aria-pressed': String(!!opts[o.key]),
			onclick: function () {
				opts[o.key] = !opts[o.key];
				b.classList.toggle('on', opts[o.key]);
				b.setAttribute('aria-pressed', String(opts[o.key]));
				UI.store('find.opts', opts);
				if (q.value) search();
			}
		}, o.d ? UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path(o.d)]) : o.label);
		$('opts').appendChild(b);
	});

	// ---- local highlight (mirrors host matching) ----
	function norm(t) {
		var x = opts.accents ? t : UI.strip(t);
		return opts.matchCase ? x : x.toLowerCase();
	}
	function matcher() {
		var src = q.value;
		if (!src) return null;
		try {
			// a regex keeps its own text (lowercasing it would turn \D into \d): only the flag
			src = opts.regex ? src : norm(src).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			return new RegExp(src, opts.matchCase ? '' : 'i');
		} catch (e) { return false; }
	}
	function highlight(text, re) {
		var span = h('span.tx');
		var m = re && !opts.invert ? norm(text).match(re) : null;
		if (!m || !m[0].length) { span.textContent = text; return span; }
		// accent stripping keeps one char per char for latin text, so indexes line up
		UI.add(span, [text.slice(0, m.index), h('mark', { text: text.slice(m.index, m.index + m[0].length) }), text.slice(m.index + m[0].length)]);
		return span;
	}

	// ---- search ----
	function busy(on) {
		prog.style.opacity = on ? 1 : 0;
		prog.textContent = '';
		if (on) prog.appendChild(h('i'));
		res.classList.toggle('dim', on);
	}

	function search() {
		var re = matcher();
		q.classList.toggle('bad', re === false);
		clr.hidden = !q.value;
		if (re === false) { info.textContent = 'regex inválida'; return; }
		if (!q.value) { res.textContent = ''; info.textContent = 'digite e pressione enter'; allBtn.hidden = true; return; }
		var my = ++seq;
		busy(true);
		info.textContent = 'buscando…';
		PGN.run('find.search', Object.assign({ query: q.value }, opts)).then(function (r) {
			if (my !== seq) return;
			busy(false);
			if (!r.ok) { UI.note(info, r.error, false, ''); return; }
			last = r.data;
			picked = {};
			render(re);
		});
	}

	function render(re) {
		res.textContent = '';
		var groups = (last && last.groups) || [];
		var total = last ? last.total || 0 : 0;
		allBtn.hidden = !total;
		info.textContent = total ? total + ' · ' + groups.length + (groups.length === 1 ? ' comp' : ' comps') : 'nada encontrado';
		if (!total) {
			res.appendChild(h('div.empty', null, UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path(I.search + 'M8.5 11h5')])));
			return;
		}
		var gd = 0, rd = 0;
		groups.forEach(function (g) {
			var rows = h('div.rows');
			var grp = h('div.grp', { style: { animationDelay: (gd += 40) + 'ms' } }, [
				h('button.ghead', {
					'aria-expanded': 'true',
					onclick: function () { grp.classList.toggle('shut'); this.setAttribute('aria-expanded', String(!grp.classList.contains('shut'))); }
				}, [
					UI.svg('0 0 24 24', { class: 'chev', 'aria-hidden': 'true' }, [UI.path(I.chev)]),
					UI.svg('0 0 24 24', { class: 'ci', 'aria-hidden': 'true' }, [UI.path(I.comp)]),
					h('span.nm', { text: g.comp }),
					h('span.cnt', { text: g.items.length })
				]),
				rows
			]);
			g.items.forEach(function (it) {
				var key = g.compId + '/' + it.layerIndex + '/' + (it.keyIndex || 0);
				var row = h('button.r', {
					title: g.comp + ' › ' + it.layer,
					style: { animationDelay: Math.min(rd += 20, 600) + 'ms' },
					onclick: function () { select([{ compId: g.compId, layerIndex: it.layerIndex, keyIndex: it.keyIndex }], row, key); }
				}, [
					highlight(String(it.text).replace(/[\r\n\u0003]+/g, ' ⏎ '), re),
					it.hidden ? UI.svg('0 0 24 24', { class: 'hid', role: 'img', 'aria-label': 'layer oculto' }, [UI.path(I.eyeOff)]) : null,
					h('span.ly', { text: it.layer })
				]);
				rows.appendChild(row);
			});
			res.appendChild(grp);
		});
	}

	function mark(row) {
		res.querySelectorAll('.r.on').forEach(function (r) { r.classList.remove('on'); var p = r.querySelector('.pk'); if (p) p.remove(); });
		[].concat(row).forEach(function (r) {
			r.classList.add('on');
			r.appendChild(UI.svg('0 0 24 24', { class: 'pk', 'aria-hidden': 'true' }, [UI.path(I.check)]));
		});
	}

	function select(items, row) {
		PGN.run('find.select', items.length === 1 ? items[0] : { items: items }).then(function (r) {
			if (r.ok) mark(row);
			UI.note(info, r.ok ? r.msg : r.error, r.ok, info.textContent);
		});
	}

	allBtn.addEventListener('click', function () {
		var items = [];
		(last.groups || []).forEach(function (g) { g.items.forEach(function (it) { items.push({ compId: g.compId, layerIndex: it.layerIndex, keyIndex: it.keyIndex }); }); });
		PGN.run('find.select', { items: items }).then(function (r) {
			if (r.ok) mark([].slice.call(res.querySelectorAll('.r')));
			UI.note(info, r.ok ? r.msg : r.error, r.ok);
			if (r.ok) PGN.notify(r.msg, true, '#ECFF8C');
		});
	});

	q.addEventListener('keydown', function (e) { if (e.key === 'Enter') search(); if (e.key === 'Escape') { q.value = ''; search(); } });
	q.addEventListener('input', UI.debounce(function () { if (q.value.length >= 2 || !q.value) search(); }, 450));
	clr.addEventListener('click', function () { q.value = ''; search(); q.focus(); });

	// browser preview data
	PGN.mock('find.search', function (a) {
		var data = [
			['END PAGE JDD', [['título', 'JORNAL DAS DEZ'], ['chamada', 'ao vivo hoje às 22h'], ['dia', 'HOJE', true]]],
			['TARJA AO VIVO', [['tarja', 'AO VIVO'], ['local', 'Edição das 18h · São Paulo']]],
			['VINHETA ND', [['marca', 'NUNCA DESLIGA'], ['off', 'Ao Vivo 24h', true]]]
		];
		var re = new RegExp(UI.strip(a.query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
		var groups = [], total = 0;
		data.forEach(function (c, ci) {
			var items = c[1].filter(function (l) { return (re.test(UI.strip(l[1])) !== !!a.invert) && !(a.visible && l[2]); })
				.map(function (l, i) { return { layerIndex: i + 1, layer: l[0], text: l[1], hidden: !!l[2], keyIndex: 0 }; });
			if (items.length) { groups.push({ compId: ci, comp: c[0], items: items }); total += items.length; }
		});
		return { data: { groups: groups, total: total } };
	}, 300);
	PGN.mock('find.select', function (a) { return { msg: (a.items ? a.items.length : 1) + ' layer(s) selecionado(s)' }; }, 150);
})();
