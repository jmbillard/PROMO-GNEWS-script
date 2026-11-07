/*
---------------------------------------------------------------
> PROMO GNEWS · fonts window
---------------------------------------------------------------
  host: fonts.list · fonts.install { paths } · fonts.download · fonts.openFolder
  every family is previewed with its own font file (FontFace + file://)
*/
(function () {
	'use strict';

	var h = UI.h, I = UI.I;
	var $ = function (id) { return document.getElementById(id); };
	var ACC = '#ECFF8C';
	var list = $('list'), foot = $('foot'), prog = $('prog'), sample = $('sample');
	var s = { items: [], picked: {}, q: '', canInstall: true, busy: false };
	var faces = {};

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
	sample.addEventListener('input', function () {
		list.querySelectorAll('.sample').forEach(function (el) { el.textContent = sample.value || el.dataset.name; });
	});

	function fileURL(p) {
		return encodeURI('file:///' + String(p).replace(/\\/g, '/').replace(/^\/+/, '')).replace(/#/g, '%23');
	}

	// load the family's first font file so the row previews itself
	function preview(it, el) {
		var file = (it.files || [])[0];
		if (!file || !window.FontFace) return;
		var fam = 'pgn-' + it.name.replace(/[^a-z0-9]/gi, '');
		el.style.fontFamily = '"' + fam + '", var(--sans)';
		if (faces[fam]) return;
		el.classList.add('loading');
		faces[fam] = new FontFace(fam, 'url("' + fileURL(it.path + '/' + file) + '")');
		faces[fam].load().then(function (f) {
			document.fonts.add(f);
			el.classList.remove('loading');
		}).catch(function () { el.classList.remove('loading'); });
	}

	function render() {
		var q = UI.strip(s.q.trim().toLowerCase());
		var items = s.items.filter(function (it) { return !q || UI.strip((it.name + ' ' + (it.family || '')).toLowerCase()).indexOf(q) >= 0; });
		list.textContent = '';
		if (!items.length) {
			list.appendChild(h('div.empty', null, UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path(I.font)])));
			return;
		}
		var d = 0;
		items.forEach(function (it) {
			var on = !!s.picked[it.path];
			var smp = h('div.sample', { text: sample.value || it.name, 'data-name': it.name });
			var row = h('button.fam' + (on ? '.on' : ''), {
				'aria-pressed': String(on), title: it.path,
				style: { animationDelay: Math.min(d += 25, 500) + 'ms' },
				onclick: function () {
					if (s.picked[it.path]) delete s.picked[it.path]; else s.picked[it.path] = true;
					render(); footer();
				}
			}, [
				h('span.box', null, on ? UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path(I.check)]) : null),
				h('div.meta', null, [smp, h('div.sub', { text: it.name })]),
				h('span.n', { text: (it.files || []).length })
			]);
			list.appendChild(row);
			preview(it, smp);
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
				h('div.meta', null, [h('div.nm', { text: paths.length + (paths.length === 1 ? ' família' : ' famílias') }), h('div.sub', { text: s.canInstall ? 'selecionadas' : 'só no Windows' })]),
				h('button.ib', { title: 'limpar seleção', 'aria-label': 'Limpar seleção', onclick: function () { s.picked = {}; render(); footer(); } }, UI.icon(I.close)),
				btn
			]));
			return;
		}
		var st = h('div.status', null, h('span', { text: s.items.length + ' famílias' }));
		foot.appendChild(st);
		if (note) UI.note(st.firstChild, note.err || note.msg, !note.err, s.items.length + ' famílias');
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
		return { data: { canInstall: true, items: ['GLOBO TEXTO', 'GLOBO TITULO', 'GLOBONEWS SANS', 'Inter', 'JetBrains Mono'].map(function (n) { return { path: '/f/' + n, name: n, family: n, folder: '', files: ['Regular.otf', 'Bold.otf'] }; }) } };
	}, 300);
	PGN.mock('fonts.install', function (a) { return { msg: a.paths.length + ' famílias instaladas' }; }, 1400);

	load('fonts.list');
})();
