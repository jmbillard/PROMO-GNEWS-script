/*
---------------------------------------------------------------
> PROMO GNEWS · fonts window
---------------------------------------------------------------
  host: fonts.list · fonts.install { paths } · fonts.download · fonts.openFolder
  every family (folder) is a group; open it to see each style previewed with its own file
  (FontFace + file://). The preview text is edited in the field on top or right in any
  sample (all follow; empty = the style's name), size S/M/L; both are remembered.
*/
(function () {
	'use strict';

	var h = UI.h, I = UI.I;
	var $ = function (id) { return document.getElementById(id); };
	var ACC = '#ECFF8C';
	var list = $('list'), foot = $('foot'), prog = $('prog'), sample = $('sample');
	var s = { items: [], picked: {}, open: UI.store('fonts.open') || {}, q: '', canInstall: true, busy: false };
	var faces = {};
	var text = UI.store('fonts.text');
	if (text == null) text = 'GLOBONEWS AO VIVO';
	sample.value = text;

	UI.add($('dl'), UI.icon(I.cloud, I.cloudDown, 'down'));
	UI.add($('rf'), UI.icon(I.refresh));
	UI.add($('fo'), UI.icon(I.folder, I.folderOpen, 'lift'));

	function loading(on) {
		prog.style.opacity = on ? 1 : 0;
		prog.textContent = '';
		if (on) prog.appendChild(h('i'));
	}

	function load(id) {
		loading(true);
		var btn = id === 'fonts.download' ? $('dl') : null;
		if (btn) btn.classList.add('busy');
		PGN.run(id, {}).then(function (r) {
			loading(false);
			if (btn) btn.classList.remove('busy');
			if (r.ok && r.data) {
				s.items = r.data.items || [];
				s.canInstall = r.data.canInstall !== false;
				s.picked = {};
				render();
			}
			if (!r.ok && !s.items.length) UI.failState(list, r.error, function () { load('fonts.list'); });
			footer(r.ok ? (id === 'fonts.download' ? { msg: r.msg } : null) : { err: r.error });
		});
	}

	$('dl').addEventListener('click', function () { if (!this.classList.contains('busy')) load('fonts.download'); });
	$('rf').addEventListener('click', function () {
		var svg = this.querySelector('svg');
		svg.classList.remove('go'); void svg.getBoundingClientRect(); svg.classList.add('go');
		load('fonts.list');
	});
	$('fo').addEventListener('click', function () {
		PGN.run('fonts.openFolder', {}).then(function (r) { footer(r.ok ? { msg: r.msg } : { err: r.error }); });
	});
	$('q').addEventListener('input', function () { s.q = this.value; render(); });
	/* ---------- preview text + size ---------- */

	// the same text everywhere: from the field or typed in any sample
	function setText(v, from) {
		text = v;
		UI.store('fonts.text', v);
		if (from !== sample) sample.value = v;
		$('clr').classList.toggle('on', !!v);
		list.querySelectorAll('.st .s').forEach(function (el) { if (el !== from) el.textContent = v || el.dataset.st; });
	}
	sample.addEventListener('input', function () { setText(sample.value, sample); });
	UI.add($('clr'), UI.icon(I.close));
	$('clr').addEventListener('click', function () { setText('', null); sample.focus(); });
	$('clr').classList.toggle('on', !!text);
	list.addEventListener('input', function (e) { if (e.target.classList.contains('s')) setText(e.target.textContent, e.target); });
	list.addEventListener('keydown', function (e) { if (e.target.classList.contains('s') && e.key === 'Enter') { e.preventDefault(); e.target.blur(); } });
	function size(v) {
		list.classList.remove('size-s', 'size-m', 'size-l');
		list.classList.add('size-' + v);
		$('sizes').querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.s === v); b.setAttribute('aria-checked', String(b.dataset.s === v)); });
		UI.store('fonts.size', v);
	}
	$('sizes').querySelectorAll('button').forEach(function (b) { b.addEventListener('click', function () { size(b.dataset.s); }); });
	size(UI.store('fonts.size') || 'm');

	function fileURL(p) {
		return encodeURI('file:///' + String(p).replace(/\\/g, '/').replace(/^\/+/, '')).replace(/#/g, '%23');
	}

	// 'Degular-BoldItalic.otf' → 'Bold Italic' (the family's own name is dropped)
	function styleName(file, family) {
		var n = String(file).replace(/\.[^.]+$/, '');
		var fam = String(family || '').replace(/[\s_-]+/g, '').toLowerCase();
		if (n.indexOf('-') >= 0) n = n.slice(n.lastIndexOf('-') + 1);
		else if (fam && n.replace(/[\s_-]+/g, '').toLowerCase().indexOf(fam) === 0) n = n.slice(fam.length);
		n = n.replace(/[_]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').trim();
		return n || 'Regular';
	}

	// one FontFace per file: each sample is drawn with its own file
	function face(it, file, el) {
		if (!window.FontFace) return;
		var fam = 'pgn-' + (it.name + '-' + file).replace(/[^a-z0-9]/gi, '');
		el.style.fontFamily = '"' + fam + '", var(--sans)';
		if (faces[fam]) { if (faces[fam] === 'err') el.classList.add('miss'); return; }
		el.classList.add('loading');
		faces[fam] = new FontFace(fam, 'url("' + fileURL(it.path + '/' + file) + '")');
		faces[fam].load().then(function (f) {
			document.fonts.add(f);
			el.classList.remove('loading');
		}).catch(function () { faces[fam] = 'err'; el.classList.remove('loading'); el.classList.add('miss'); });
	}

	function render() {
		var q = UI.strip(s.q.trim().toLowerCase());
		var items = s.items.filter(function (it) { return !q || UI.strip((it.name + ' ' + (it.family || '')).toLowerCase()).indexOf(q) >= 0; });
		list.textContent = '';
		s.shown = items.length;
		if (!Object.keys(s.picked).length) footer();
		if (!items.length) {
			list.appendChild(h('div.empty', null, [
				UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path(I.font)]),
				h('p', { text: s.items.length ? 'nada encontrado' : 'nenhuma fonte \u00B7 use baixar' })
			]));
			return;
		}
		var d = 0;
		items.forEach(function (it) {
			var on = !!s.picked[it.path], isOpen = !!s.open[it.name];
			var files = it.files || [];
			var nm = h('div.nm', { text: it.name });
			var box = h('span.box', { title: 'selecionar para instalar', role: 'checkbox', 'aria-checked': String(on), 'aria-label': 'Selecionar ' + it.name });
			var head = h('div.fh', { title: it.path }, [
				box,
				h('div.meta', null, [nm, h('div.sub', { text: files.length + (files.length === 1 ? ' estilo' : ' estilos') })]),
				h('span.n', { text: files.length }),
				UI.svg('0 0 24 24', { 'aria-hidden': 'true', 'class': 'chev' }, [UI.path('M6 9l6 6 6-6')])
			]);
			var inner = h('div');
			var grp = h('div.fam' + (on ? '.on' : '') + (isOpen ? '.open' : ''), { style: { animationDelay: Math.min(d += 25, 500) + 'ms' } }, [head, h('div.styles', null, inner)]);
			function fill() {
				if (inner.childNodes.length) return;
				files.forEach(function (f) {
					var st = styleName(f, it.name);
					var smp = h('div.s', { contenteditable: 'true', spellcheck: 'false', text: text || st, 'data-st': st, 'aria-label': 'Texto de preview · ' + st });
					inner.appendChild(h('div.st', null, [h('div.lb', null, [h('span', { text: st }), h('span.file', { text: f })]), smp]));
					face(it, f, smp);
				});
			}
			head.addEventListener('click', function (e) {
				if (e.target === box) {
					if (s.picked[it.path]) delete s.picked[it.path]; else s.picked[it.path] = true;
					grp.classList.toggle('on', !!s.picked[it.path]);
					box.setAttribute('aria-checked', String(!!s.picked[it.path]));
					footer();
					return;
				}
				s.open[it.name] = !s.open[it.name];
				if (!s.open[it.name]) delete s.open[it.name];
				UI.store('fonts.open', s.open);
				if (s.open[it.name]) fill();
				grp.classList.toggle('open', !!s.open[it.name]);
			});
			if (isOpen) fill();
			list.appendChild(grp);
			// the family name in its first file
			if (files[0]) face(it, files[0], nm);
		});
	}

	function footer(note) {
		foot.textContent = '';
		var paths = Object.keys(s.picked);
		if (paths.length) {
			var btn = h('button.btn.btn-1', { onclick: install, disabled: !s.canInstall, title: s.canInstall ? '' : 'instalação automática só no Windows' }, [
				UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path(I.download)]), h('span', { text: 'instalar' })
			]);
			UI.add(foot, h('div.foot', null, [
				h('div.meta', null, [h('div.nm', { text: paths.length + (paths.length === 1 ? ' família' : ' famílias') }), h('div.sub', { text: s.canInstall ? (paths.length === 1 ? 'selecionada' : 'selecionadas') : 'só no Windows' })]),
				h('button.ib', { title: 'limpar seleção', 'aria-label': 'Limpar seleção', onclick: function () { s.picked = {}; render(); footer(); } }, UI.icon(I.close)),
				btn
			]));
			return;
		}
		var nStyles = s.items.reduce(function (a, it) { return a + (it.files || []).length; }, 0);
		var label = (s.shown != null && s.shown < s.items.length ? s.shown + ' de ' : '') + s.items.length + ' famílias · ' + nStyles + ' estilos';
		var st = h('div.status', null, h('span', { text: label }));
		foot.appendChild(st);
		if (note) UI.note(st.firstChild, note.err || note.msg, !note.err, label);
	}

	function install() {
		if (s.busy) return;
		s.busy = true;
		var btn = foot.querySelector('.btn');
		if (btn) { btn.disabled = true; btn.insertBefore(h('span.pf'), btn.firstChild); }
		PGN.run('fonts.install', { paths: Object.keys(s.picked) }).then(function (r) {
			s.busy = false;
			PGN.notify(r.ok ? r.msg : r.error, r.ok, ACC);
			if (r.ok) s.picked = {};
			render();
			footer(r.ok ? { msg: r.msg } : { err: r.error });
		});
	}

	// browser preview data
	PGN.mock('fonts.list', function () {
		return { data: { canInstall: true, items: [
			{ n: 'GLOBO TEXTO', f: ['GloboTexto-Regular.otf', 'GloboTexto-Italic.otf', 'GloboTexto-Bold.otf'] },
			{ n: 'GLOBO TITULO', f: ['GloboTitulo-Light.otf', 'GloboTitulo-Regular.otf', 'GloboTitulo-Black.otf'] },
			{ n: 'GLOBONEWS SANS', f: ['GlobonewsSans-Regular.otf', 'GlobonewsSans-SemiBold.otf', 'GlobonewsSans-ExtraBoldItalic.otf'] },
			{ n: 'Inter', f: ['Inter-Regular.ttf', 'Inter-Bold.ttf'] },
			{ n: 'JetBrains Mono', f: ['JetBrainsMono-Regular.ttf'] }
		].map(function (x) { return { path: '/f/' + x.n, name: x.n, family: x.n, folder: '', files: x.f }; }) } };
	}, 300);
	PGN.mock('fonts.install', function (a) { return { msg: a.paths.length + ' famílias instaladas' }; }, 1400);

	load('fonts.list');
})();
