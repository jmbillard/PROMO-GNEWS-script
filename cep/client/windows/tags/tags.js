/*
---------------------------------------------------------------
> PROMO GNEWS · organization tags window
---------------------------------------------------------------
  host: tags.list · tags.apply { tag, group, alt } · tags.custom { text }
  click = apply · right click = clear the comments of the selected items
*/
(function () {
	'use strict';

	var h = UI.h, I = UI.I;
	var $ = function (id) { return document.getElementById(id); };
	var ACC = '#ECFF8C';
	var box = $('groups'), note = $('note'), sel = $('sel'), custom = $('custom');
	var count = 0;

	var ICONS = {
		ftg: 'M4 6h16v12H4zM8 6v12M16 6v12M4 10h4M16 10h4M4 14h4M16 14h4',
		comp: 'M4 6h16v12H4zM9 10l5 2-5 2z',
		sol: 'M5 5h14v14H5z',
		img: 'M4 5h16v14H4zM4 15l5-5 4 4 2-2 5 5M15 9h.01',
		shp: 'M12 4l8 14H4z',
		matte: 'M4 4h16v16H4zM4 12h16M12 4v16',
		txt: 'M5 6h14M12 6v13',
		sono: 'M9 17V6l10-2v11M9 17a2 2 0 1 1-4 0a2 2 0 1 1 4 0M19 15a2 2 0 1 1-4 0a2 2 0 1 1 4 0'
	};

	UI.add($('customBtn'), UI.icon(I.check));

	function flash(el, ok) {
		el.classList.remove('ok', 'bad');
		void el.offsetWidth;
		el.classList.add(ok ? 'ok' : 'bad');
		setTimeout(function () { el.classList.remove('ok', 'bad'); }, 650);
	}

	function report(r, el) {
		if (el) flash(el, r.ok);
		UI.note(note, r.ok ? r.msg : r.error, r.ok);
		if (r.ok) PGN.notify(r.msg, true, ACC);
		refresh();
	}

	function render(data) {
		box.textContent = '';
		var d = 0;
		data.groups.forEach(function (g, gi) {
			var tags = h('div.tags');
			g.tags.forEach(function (t) {
				var b = h('button.tag', {
					title: t.kind + (t.alt ? '\n◗ ' + t.alt : ''),
					'aria-label': 'tag ' + t.name,
					style: { animationDelay: Math.min(d += 18, 500) + 'ms' },
					onclick: function () { PGN.run('tags.apply', { tag: t.name, group: g.id }).then(function (r) { report(r, b); }); },
					oncontextmenu: function (e) {
						e.preventDefault();
						PGN.run('tags.apply', { tag: t.name, group: g.id, alt: true }).then(function (r) { report(r, b); });
					}
				}, [UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path(ICONS[t.icon] || ICONS.sol)]), t.name]);
				tags.appendChild(b);
			});
			var grp = h('div.grp', { style: { '--c': g.color || ACC, animationDelay: gi * 40 + 'ms' } }, [
				h('div.glbl', null, [h('i'), g.label, g.tags[0] ? h('small', { text: g.tags[0].kind }) : null]),
				tags
			]);
			grp.style.setProperty('--c', g.color || ACC);
			box.appendChild(grp);
		});
	}

	function selection(n) {
		count = n;
		sel.className = 'selinfo' + (n ? ' live' : '');
		sel.textContent = '';
		UI.add(sel, [h('i'), n + (n === 1 ? ' item' : ' itens')]);
		sel.title = 'itens selecionados no painel Project';
	}

	var first = true, failed = false;
	function refresh() {
		PGN.run('tags.list', {}).then(function (r) {
			// first load failed: the reason in the window, with a retry (the poll keeps trying too)
			if (!r.ok) { if (first && !failed) { failed = true; UI.failState($('groups'), r.error, function () { failed = false; refresh(); }); } return; }
			if (first) { $('groups').textContent = ''; render(r.data); first = false; }
			selection(r.data.selection || 0);
		});
	}

	function applyCustom() {
		PGN.run('tags.custom', { text: custom.value.trim() }).then(function (r) { report(r, $('customBtn')); });
	}
	$('customBtn').addEventListener('click', applyCustom);
	custom.addEventListener('keydown', function (e) { if (e.key === 'Enter') applyCustom(); });

	// browser preview data
	PGN.mock('tags.list', function () {
		var k = 'template nas comps · comentário nos footages';
		return { data: { selection: 3, groups: [
			{ id: 'compCommentTags', label: 'comentário de comp', color: '#5CE6A1', tags: ['export', 'edit', 'ignore'].map(function (n, i) { return { name: n, icon: ['ftg', 'comp', 'sol'][i], kind: 'comentário nas comps', alt: 'limpa comentários' }; }) },
			{ id: 'multiTags', label: 'itens', color: '#80C0FF', tags: ['bg', 'ref', 'photo', 'print', 'logo', 'icon', 'tile', 'texture', 'pattern', 'lettering', 'music', 'loc'].map(function (n, i) { return { name: n, icon: ['img', 'img', 'img', 'img', 'shp', 'shp', 'matte', 'matte', 'matte', 'txt', 'sono', 'sono'][i], kind: k, alt: 'limpa comentários' }; }) },
			{ id: 'hardNewsTags', label: 'hard news', color: '#FF4D4D', tags: ['title', 'info', 'map', 'twitter', 'document'].map(function (n) { return { name: n, icon: n === 'map' ? 'matte' : 'txt', kind: k, alt: 'limpa comentários' }; }) },
			{ id: 'compTemplatePromoTags', label: 'template de comp', color: '#B5ADFF', tags: ['end page', 'opening'].map(function (n) { return { name: n, icon: 'comp', kind: 'nome de template nas comps', alt: 'limpa comentários' }; }) }
		] } };
	}, 150);
	PGN.mock('tags.apply', function (a) { return { msg: a.alt ? 'comentários removidos de 3 itens' : 'tag ' + a.tag + ' aplicada em 3 itens' }; }, 200);
	PGN.mock('tags.custom', function (a) { return { msg: a.text ? 'tag ' + a.text + ' aplicada em 3 itens' : 'tag removida de 3 itens' }; }, 200);

	refresh();
	// the selection count is a host call: only while the mouse is over this window
	setInterval(function () { if (!document.hidden && !first && UI.here()) refresh(); }, 1500);
	UI.onHere(function (v) { if (v && !first) refresh(); });
})();
