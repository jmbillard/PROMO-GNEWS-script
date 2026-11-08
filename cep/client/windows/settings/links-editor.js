/*
---------------------------------------------------------------
> PROMO GNEWS · preferences · 'atalhos' editor
---------------------------------------------------------------
  sites and folders of the bar's 'Atalhos' section: icon (or 2 letters),
  name and target; drag by the handle to reorder, + to add, × to remove.
  host: links.get · links.set { sites, dirs } · links.reset · links.pick
  every change saves (debounced) and tells the bar (PGN.emit('links')).
*/
(function () {
	'use strict';

	var h = UI.h;

	function svgIcon(key) {
		var ic = LINK_ICONS[key] || LINK_ICONS.up;
		var kids = [UI.path(ic[0])];
		if (ic[1]) kids.push(UI.path(ic[1]));
		return UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, kids);
	}
	function face(it) { return it.glyph ? h('span.glyph', { text: it.glyph }) : svgIcon(it.icon); }
	function X() { return UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path('M7 7l10 10M17 7L7 17')]); }
	function PLUS() { return UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path('M12 6v12M6 12h12')]); }
	function CHEV() { return UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path('M6 9l6 6 6-6')]); }

	window.LinksEditor = function (note, version) {
		var S = { sites: [], dirs: [] };
		var open = null;   // { list, idx, tab }
		var root = h('div.lked');
		var prev = h('div.lprev', { 'aria-label': 'Prévia na barra' });
		var lists = {};

		var push = UI.debounce(function () {
			PGN.run('links.set', { sites: S.sites, dirs: S.dirs }).then(function (r) {
				if (r.ok && r.data) { mergeShown(r.data); PGN.emit('links', r.data); }
				UI.note(note, r.ok ? r.msg : r.error, r.ok, version);
			});
		}, 450);

		function mergeShown(d) {
			// keep what the host resolved for '@' folders (shown / net / auto)
			(d.dirs || []).forEach(function (x, i) { if (S.dirs[i] && S.dirs[i].id === x.id) { S.dirs[i].shown = x.shown; S.dirs[i].net = x.net; S.dirs[i].auto = x.auto; } });
			renderList('dirs');
		}

		function preview() {
			prev.textContent = '';
			S.sites.forEach(function (it, i) { prev.appendChild(h('span.t' + (open && open.list === 'sites' && open.idx === i ? '.hot' : ''), { title: it.name }, face(it))); });
			if (S.sites.length && S.dirs.length) prev.appendChild(h('span.vs'));
			S.dirs.forEach(function (it, i) { prev.appendChild(h('span.t' + (open && open.list === 'dirs' && open.idx === i ? '.hot' : ''), { title: it.name }, face(it))); });
		}

		function picker(list, idx) {
			var it = S[list][idx];
			var box = h('div.lpick');
			var tabs = h('div.tabs', null, [
				h('button' + (open.tab === 'icon' ? '.on' : ''), { text: 'ícone', onclick: function () { open.tab = 'icon'; renderList(list); } }),
				h('button' + (open.tab === 'txt' ? '.on' : ''), { text: 'letras', onclick: function () { open.tab = 'txt'; renderList(list); } })
			]);
			box.appendChild(tabs);
			if (open.tab === 'txt') {
				var inp = h('input.fld', { type: 'text', maxlength: 2, value: it.glyph || '', 'aria-label': 'Letras', spellcheck: 'false' });
				inp.addEventListener('input', function () {
					var v = inp.value.toUpperCase().replace(/\s/g, '').slice(0, 2);
					if (!v) return;
					it.glyph = v; delete it.icon;
					var ic = root.querySelector('.lk[data-list="' + list + '"][data-i="' + idx + '"] .ic');
					if (ic) { ic.textContent = ''; ic.appendChild(face(it)); }
					preview(); push();
				});
				inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { open = null; renderList(list); } });
				box.appendChild(h('div.txt', null, [inp, h('small', { text: 'até 2 letras' })]));
				setTimeout(function () { inp.focus(); inp.select(); }, 0);
			} else {
				box.appendChild(h('div.grid', null, LINK_ICON_KEYS.map(function (k) {
					return h('button' + (!it.glyph && it.icon === k ? '.on' : ''), { 'aria-label': k, onclick: function () { it.icon = k; delete it.glyph; renderList(list); preview(); push(); } }, svgIcon(k));
				})));
			}
			return box;
		}

		function rowEl(list, it, i) {
			var isOpen = open && open.list === list && open.idx === i;
			var ic = h('button.ic' + (isOpen ? '.on' : ''), { title: 'trocar ícone', 'aria-label': 'Trocar ícone', onclick: function () {
				open = isOpen ? null : { list: list, idx: i, tab: it.glyph ? 'txt' : 'icon' };
				renderList('sites'); renderList('dirs');
			} }, face(it));
			var nm = h('input.nm', { type: 'text', value: it.name, 'aria-label': 'Nome', spellcheck: 'false' });
			nm.addEventListener('input', function () { it.name = nm.value; push(); });
			nm.addEventListener('keydown', function (e) { if (e.key === 'Enter') nm.blur(); });
			var tg;
			if (list === 'sites') {
				tg = h('input.tg', { type: 'text', value: it.url || '', placeholder: 'https://…', 'aria-label': 'Endereço', spellcheck: 'false' });
				tg.addEventListener('input', function () { it.url = tg.value.trim(); push(); });
				tg.addEventListener('keydown', function (e) { if (e.key === 'Enter') tg.blur(); });
			} else {
				var shown = it.shown != null ? it.shown : it.path;
				tg = h('button.tg.dir', { title: (shown || 'clique para escolher a pasta') + '\nclique para escolher outra pasta', text: shown || 'escolher pasta…', onclick: function () {
					PGN.run('links.pick', {}).then(function (r) {
						if (!r.ok || !r.data || !r.data.path) return;
						it.path = r.data.path; it.shown = r.data.path; it.net = false; it.auto = false;
						renderList('dirs'); push();
					});
				} });
			}
			var flag = list === 'dirs' && (it.auto || it.net) ? h('span.flag', { text: it.auto ? 'auto' : 'rede' }) : null;
			var del = h('button.ox', { title: 'remover', 'aria-label': 'Remover', onclick: function () {
				S[list].splice(i, 1);
				if (open && open.list === list) open = null;
				renderList(list); preview(); push();
			} }, X());
			var handle = h('span.oh', { title: 'arrastar' }, h('i'));
			var row = h('div.lk', { 'data-list': list, 'data-i': i }, [handle, ic, nm, tg, flag, del].filter(Boolean));
			handle.addEventListener('mousedown', function (e) { drag(list, row, e); });
			return row;
		}

		function renderList(list) {
			var box = lists[list].rows;
			box.textContent = '';
			S[list].forEach(function (it, i) {
				box.appendChild(rowEl(list, it, i));
				if (open && open.list === list && open.idx === i) box.appendChild(picker(list, i));
			});
			lists[list].count.textContent = S[list].length;
			preview();
		}

		function groupEl(list, title) {
			var rows = h('div.orows');
			var count = h('span.ogc');
			var grp = h('div.ogrp');
			var add = h('button.oa', { title: list === 'sites' ? 'novo site' : 'nova pasta', 'aria-label': list === 'sites' ? 'Novo site' : 'Nova pasta', onclick: function () {
				var it = list === 'sites' ? { id: 's' + Date.now(), name: 'novo site', url: '', icon: 'globe' } : { id: 'd' + Date.now(), name: 'nova pasta', path: '', icon: 'up' };
				S[list].push(it);
				grp.classList.remove('shut');
				open = null;
				renderList(list);
				var r = rows.querySelector('.lk:last-of-type .nm');
				if (r) { r.focus(); r.select(); }
				push();
			} }, PLUS());
			var head = h('div.ogh', null, [h('button.oc', { 'aria-label': 'Recolher', onclick: function () { grp.classList.toggle('shut'); } }, CHEV()), h('span.ogn.lbl', { text: title }), count, add]);
			grp.appendChild(head);
			grp.appendChild(rows);
			lists[list] = { rows: rows, count: count };
			return grp;
		}

		/* drag by the handle: reorder inside its own list */
		function drag(list, row, e) {
			e.preventDefault();
			var box = lists[list].rows;
			open = null;
			box.querySelectorAll('.lpick').forEach(function (p) { p.remove(); });
			row.classList.add('drag');
			var move = function (ev) {
				var rows = [].slice.call(box.querySelectorAll('.lk:not(.drag)'));
				var before = null;
				for (var j = 0; j < rows.length; j++) {
					var rr = rows[j].getBoundingClientRect();
					if (ev.clientY < rr.top + rr.height / 2) { before = rows[j]; break; }
				}
				if (before !== row.nextElementSibling) { if (before) box.insertBefore(row, before); else box.appendChild(row); }
			};
			var up = function () {
				document.removeEventListener('mousemove', move);
				document.removeEventListener('mouseup', up);
				row.classList.remove('drag');
				var order = [].slice.call(box.querySelectorAll('.lk')).map(function (r) { return S[list][+r.getAttribute('data-i')]; });
				S[list] = order;
				renderList(list); push();
			};
			document.addEventListener('mousemove', move);
			document.addEventListener('mouseup', up);
		}

		var reset = h('button.mini', { title: 'atalhos padrão', 'aria-label': 'Restaurar atalhos padrão', onclick: function () {
			PGN.run('links.reset', {}).then(function (r) {
				if (r.ok && r.data) { S = { sites: r.data.sites, dirs: r.data.dirs }; open = null; renderList('sites'); renderList('dirs'); PGN.emit('links', r.data); }
				UI.note(note, r.ok ? r.msg : r.error, r.ok, version);
			});
		} }, UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path('M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4', 'spinme')]));

		root.appendChild(h('div.lprow', null, [prev, reset]));
		root.appendChild(groupEl('sites', 'SITES'));
		root.appendChild(groupEl('dirs', 'PASTAS'));

		PGN.run('links.get', {}).then(function (r) {
			if (!r.ok || !r.data) { UI.note(note, r.error || 'atalhos indisponíveis', false, version); return; }
			S = { sites: r.data.sites || [], dirs: r.data.dirs || [] };
			renderList('sites'); renderList('dirs');
		});
		return root;
	};
})();
