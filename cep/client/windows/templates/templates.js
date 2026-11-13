/*
---------------------------------------------------------------
> PROMO GNEWS · templates window
---------------------------------------------------------------
  host: tpl.list · tpl.import { path } · tpl.download · tpl.openFolder
*/
(function () {
	'use strict';

	var h = UI.h, I = UI.I;
	var $ = function (id) { return document.getElementById(id); };
	var ACC = '#ECFF8C';
	var list = $('list'), foot = $('foot'), prog = $('prog');
	var s = { items: [], cat: 'todos', q: '', sel: null, busy: false, updated: '' };

	// ---- toolbar ----
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
		var btn = id === 'tpl.download' ? $('dl') : null;
		if (btn) btn.classList.add('busy');
		return PGN.run(id || 'tpl.list', {}).then(function (r) {
			loading(false);
			if (btn) btn.classList.remove('busy');
			if (r.ok && r.data) {
				s.items = r.data.items || [];
				s.updated = r.data.updated || '';
				render();
			}
			// nothing to show yet and the host did not answer: say it in the window, with a retry
			if (!r.ok && !s.items.length) UI.failState(list, r.error, function () { load('tpl.list'); });
			footer(r.ok && id === 'tpl.download' ? { msg: r.msg } : (!r.ok ? { err: r.error } : null));
		});
	}

	$('dl').addEventListener('click', function () { if (!this.classList.contains('busy')) load('tpl.download'); });
	$('rf').addEventListener('click', function () {
		var svg = this.querySelector('svg');
		svg.classList.remove('go'); void svg.getBoundingClientRect(); svg.classList.add('go');
		load('tpl.list');
	});
	$('fo').addEventListener('click', function () {
		PGN.run('tpl.openFolder', {}).then(function (r) { footer(r.ok ? { msg: r.msg } : { err: r.error }); });
	});
	$('q').addEventListener('input', function () { s.q = this.value; render(); });

	// ---- list ----
	function cat(it) { return it.folder ? it.folder.split('/')[0] : 'outros'; }

	function fileURL(p) {
		return encodeURI('file:///' + String(p).replace(/\\/g, '/').replace(/^\/+/, '')).replace(/#/g, '%23');
	}

	// generative thumbnail when the template has no preview image
	var PAL = [['#221E1D', '#E52F2E', '#F2F2F2'], ['#E52F2E', '#F2F2F2', '#221E1D'], ['#141414', '#ECFF8C', '#E52F2E'], ['#333333', '#FF5A68', '#ECFF8C'], ['#F2F2F2', '#221E1D', '#E52F2E'], ['#4A4A4A', '#80C0FE', '#F2F2F2']];
	function fakeThumb(name) {
		var n = 0;
		for (var i = 0; i < name.length; i++) n = (n * 31 + name.charCodeAt(i)) >>> 0;
		var p = PAL[n % PAL.length], v = n % 3;
		var t = h('div.thumb', { style: { background: p[0] } });
		var b = function (cls, st) { t.appendChild(h('i.' + cls, { style: st })); };
		if (v === 0) { b('m1', { left: '10px', top: '42px', width: '52%', height: '9px', background: p[1] }); b('m2', { left: '10px', top: '56px', width: '34%', height: '5px', background: p[2] }); b('m3', { right: '12px', top: '10px', width: '14px', height: '14px', borderRadius: '50%', background: p[1] }); }
		if (v === 1) { b('m1', { left: '-10px', top: '30px', width: '70%', height: '12px', background: p[1] }); b('m2', { left: '30%', top: '48px', width: '58%', height: '6px', background: p[2] }); b('m3', { left: 'calc(50% - 18px)', top: '14px', width: '36px', height: '36px', borderRadius: '50%', boxShadow: 'inset 0 0 0 5px ' + p[1] }); }
		if (v === 2) { b('m1', { left: '10px', top: '18px', width: '72%', height: '10px', background: p[1] }); b('m2', { left: '10px', top: '33px', width: '56%', height: '10px', background: p[1] }); b('m3', { left: '10px', top: '54px', width: '12px', height: '12px', borderRadius: '50%', background: p[2] }); }
		return t;
	}

	/* preview video: never plays by itself — the mouse position across the thumbnail picks the frame
	   (like the logo of the bar). Without a preview image, a frame from the middle is the poster. */
	function videoScrub(thumb, url, poster) {
		var v = h('video', { muted: true, preload: poster ? 'none' : 'metadata', playsinline: true, tabindex: '-1', 'aria-hidden': 'true' });
		v.muted = true;
		v.src = url;
		var bar = h('i.vbar', null, h('b'));
		thumb.classList.add('has-video');
		thumb.appendChild(v);
		thumb.appendChild(bar);
		thumb.appendChild(h('span.vbadge', { title: 'preview em vídeo · passe o mouse' }, UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path('M8 5v14l11-7z')])));
		var want = null, busy = false;
		function seek() {
			if (want == null || busy || !v.duration) return;
			busy = true;
			v.currentTime = want;
			want = null;
		}
		v.addEventListener('seeked', function () { busy = false; thumb.classList.add('ready'); seek(); });
		v.addEventListener('loadedmetadata', function () {
			// no image: show a frame from the middle (unless the mouse is already picking one)
			if (!poster && !thumb.classList.contains('scrub')) { want = v.duration * .5; seek(); }
			else seek();
		});
		v.addEventListener('error', function () { thumb.classList.remove('has-video', 'scrub'); });
		thumb.addEventListener('mouseenter', function () {
			if (v.readyState < 1 && v.preload !== 'auto') { v.preload = 'auto'; v.load(); }
			thumb.classList.add('scrub');
		});
		thumb.addEventListener('mousemove', function (e) {
			var r = thumb.getBoundingClientRect();
			var p = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
			bar.firstChild.style.width = (p * 100) + '%';
			if (v.duration) { want = Math.min(v.duration - 0.04, p * v.duration); seek(); }
		});
		thumb.addEventListener('mouseleave', function () { thumb.classList.remove('scrub'); if (poster) thumb.classList.remove('ready'); });
	}

	function render() {
		// categories
		var cats = ['todos'];
		s.items.forEach(function (it) { var c = cat(it); if (cats.indexOf(c) < 0) cats.push(c); });
		if (cats.indexOf(s.cat) < 0) s.cat = 'todos';
		var cbox = $('cats');
		cbox.textContent = '';
		cats.forEach(function (c) {
			cbox.appendChild(h('button.chip' + (s.cat === c ? '.on' : ''), {
				'aria-pressed': String(s.cat === c),
				onclick: function () { s.cat = c; render(); }
			}, c));
		});

		var q = UI.strip(s.q.trim().toLowerCase());
		var items = s.items.filter(function (it) {
			return (s.cat === 'todos' || cat(it) === s.cat) && (!q || UI.strip((it.name + ' ' + it.folder).toLowerCase()).indexOf(q) >= 0);
		});
		list.textContent = '';
		s.shown = items.length;
		if (!s.sel) footer();
		if (!items.length) {
			list.appendChild(h('div.empty', null, [
				UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path(I.grid)]),
				h('p', { text: s.items.length ? 'nada encontrado' : 'nenhum template \u00B7 use baixar' })
			]));
			return;
		}
		var grid = h('div.cards'), d = 30;
		items.forEach(function (it) {
			var thumb;
			if (it.preview) {
				thumb = h('div.thumb', null, h('img', { src: fileURL(it.preview), alt: '', loading: 'lazy' }));
				thumb.firstChild.addEventListener('error', function () { if (!it.video) thumb.replaceWith(fakeThumb(it.name)); });
			} else thumb = it.video ? h('div.thumb') : fakeThumb(it.name);
			if (it.video) videoScrub(thumb, fileURL(it.video), !!it.preview);
			var card = h('button.card' + (s.sel === it ? '.on' : ''), {
				'aria-label': it.name, 'aria-pressed': String(s.sel === it),
				title: it.displayPath || it.fileName || it.name,
				style: { animationDelay: Math.min(d += 30, 500) + 'ms' },
				onclick: function () { s.sel = s.sel === it ? null : it; render(); footer(); },
				ondblclick: function () { s.sel = it; render(); doImport(); }
			}, [thumb, h('div.nm', { text: it.name }), h('div.tag', { text: (it.folder || '') + (it.ext ? ' · ' + it.ext : '') })]);
			grid.appendChild(card);
		});
		list.appendChild(grid);
	}

	// ---- footer: selected template or status ----
	function footer(note) {
		foot.textContent = '';
		if (s.sel) {
			var it = s.sel;
			var btn = h('button.btn.btn-1', { 'aria-label': 'Importar ' + it.name, onclick: doImport }, [
				UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path(I.download)]), h('span', { text: 'importar' })
			]);
			var meta = h('div.meta', null, [h('div.nm', { text: it.name }), h('div.sub', { text: it.updated || it.folder || '' })]);
			if (it.info) meta.appendChild(h('div.info', { text: it.info }));
			UI.add(foot, h('div.foot', null, [meta, btn]));
			return;
		}
		// '2 de 6 templates' while a filter hides some
		var count = (s.shown != null && s.shown < s.items.length ? s.shown + ' de ' : '') + s.items.length + ' templates';
		var st = h('div.status', null, h('span', { text: count + (s.updated ? ' · ' + s.updated : '') }));
		foot.appendChild(st);
		if (note) UI.note(st.firstChild, note.err || note.msg, !note.err, count);
	}

	function doImport() {
		var it = s.sel;
		if (!it || s.busy) return;
		s.busy = true;
		var btn = foot.querySelector('.btn');
		if (btn) { btn.disabled = true; btn.insertBefore(h('span.pf'), btn.firstChild); }
		PGN.run('tpl.import', { path: it.path }).then(function (r) {
			s.busy = false;
			PGN.notify(r.ok ? r.msg : r.error, r.ok, ACC);
			if (r.ok) s.sel = null;
			render();
			footer(r.ok ? { msg: r.msg } : { err: r.error });
		});
	}

	// browser preview data
	PGN.mock('tpl.list', function () {
		var n = function (name, folder) { return { path: '/t/' + name + '.aep', name: name, fileName: name + '.aep', folder: folder, ext: 'aep', preview: null, updated: 'atualizado 03 nov', info: null }; };
		return { data: { updated: '03 nov 2026', items: [n('End page', 'end page'), n('End page vertical', 'end page'), n('Nunca desliga', 'vinhetas'), n('História ao vivo', 'vinhetas'), n('Lettering simples', 'letterings'), n('Tarja ao vivo', 'marca')] } };
	}, 300);
	PGN.mock('tpl.download', function () { return { msg: 'Templates atualizados' }; }, 1200);
	PGN.mock('tpl.import', function (a) { return { msg: 'Template importado' }; }, 1100);

	load('tpl.list');
})();
