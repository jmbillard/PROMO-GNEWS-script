/*
---------------------------------------------------------------
> PROMO GNEWS · preferences · 'efeitos' editor
---------------------------------------------------------------
  the effect groups of the bar's 'Efeitos' section (the adjustment
  layer stays fixed there). Each group has a name and a list of
  effects: icon (or 2 letters) + the effect, picked in a searchable
  list of every effect installed in this After Effects (fx.list).
  + efeito / + grupo / × to remove. Every change saves (debounced) and
  tells the bar (PGN.emit('fx')).
  host: fx.list · fx.get · fx.set { groups } · fx.reset
*/
(function () {
	'use strict';

	var h = UI.h;
	function svgIcon(key) {
		var ic = FX_ICONS[key] || FX_ICONS.fx;
		var kids = [UI.path(ic[0])];
		if (ic[1]) kids.push(UI.path(ic[1]));
		return UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, kids);
	}
	function face(it) { return it.glyph ? h('span.glyph', { text: it.glyph }) : svgIcon(it.icon); }
	function X() { return UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path('M7 7l10 10M17 7L7 17')]); }
	function PLUS() { return UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path('M12 6v12M6 12h12')]); }

	window.FxEditor = function (note, version) {
		var G = [], ALL = [], byMatch = {};
		var open = null;   // { g, i, tab }
		var root = h('div.fxed');
		var list = h('div.plist');

		var push = UI.debounce(function () {
			var groups = G.map(function (g) { return { name: g.name, items: g.items.filter(function (it) { return it.m; }) }; });
			PGN.run('fx.set', { groups: groups }).then(function (r) {
				if (r.ok && r.data) PGN.emit('fx', r.data);
				UI.note(note, r.ok ? r.msg : r.error, r.ok, version);
			});
		}, 500);

		// the searchable list of installed effects (one <select>, upgraded to the shared dropdown)
		function effectSelect(it, onPick) {
			var s = h('select.fld.fxsel', { 'aria-label': 'Efeito' });
			s.appendChild(h('option', { value: '', text: 'escolher efeito…' }));
			var cat = null, grp = null, found = false;
			ALL.forEach(function (e) {
				if (e.c !== cat) { cat = e.c; grp = document.createElement('optgroup'); grp.label = cat || 'outros'; s.appendChild(grp); }
				var o = h('option', { value: e.m, text: e.n });
				if (e.m === it.m) { o.selected = true; found = true; }
				grp.appendChild(o);
			});
			// an effect not installed here (plugin missing): keep it in the list
			if (it.m && !found) { var o = h('option', { value: it.m, text: (it.name || it.m) + ' (não instalado)' }); o.selected = true; s.appendChild(o); }
			s.addEventListener('change', function () { onPick(s.value); });
			var wrap = h('div.sel-wrap.grow', null, s);
			if (UI.dropdown) UI.dropdown(s);   // now, so '+ efeito' can open its search right away
			return wrap;
		}

		function picker(g, i) {
			var it = g.items[i];
			var box = h('div.lpick');
			box.appendChild(h('div.tabs', null, [
				h('button' + (open.tab === 'icon' ? '.on' : ''), { text: 'ícone', onclick: function () { open.tab = 'icon'; render(); } }),
				h('button' + (open.tab === 'txt' ? '.on' : ''), { text: 'letras', onclick: function () { open.tab = 'txt'; render(); } })
			]));
			if (open.tab === 'txt') {
				var inp = h('input.fld', { type: 'text', maxlength: 2, value: it.glyph || '', 'aria-label': 'Letras', spellcheck: 'false' });
				inp.addEventListener('input', function () {
					var v = inp.value.toUpperCase().replace(/\s/g, '').slice(0, 2);
					if (!v) return;
					it.glyph = v; delete it.icon;
					var ic = root.querySelector('.fxr.on .ic'); if (ic) { ic.textContent = ''; ic.appendChild(face(it)); }
					push();
				});
				inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { open = null; render(); } });
				box.appendChild(h('div.txt', null, [inp, h('small', { text: 'até 2 letras' })]));
				setTimeout(function () { inp.focus(); inp.select(); }, 0);
			} else {
				box.appendChild(h('div.grid', null, FX_ICON_KEYS.map(function (k) {
					return h('button' + (!it.glyph && it.icon === k ? '.on' : ''), { 'aria-label': k, onclick: function () { it.icon = k; delete it.glyph; render(); push(); } }, svgIcon(k));
				})));
			}
			return box;
		}

		function itemRow(g, i) {
			var it = g.items[i];
			var isOpen = open && open.g === g && open.i === i;
			var ic = h('button.ic' + (isOpen ? '.on' : ''), { title: 'trocar ícone', 'aria-label': 'Trocar ícone', onclick: function () {
				open = isOpen ? null : { g: g, i: i, tab: it.glyph ? 'txt' : 'icon' };
				render();
			} }, face(it));
			var sel = effectSelect(it, function (m) {
				it.m = m;
				it.name = byMatch[m] ? byMatch[m].n : m;
				push();
			});
			var del = h('button.ox', { title: 'remover efeito', 'aria-label': 'Remover efeito', onclick: function () {
				g.items.splice(i, 1);
				open = null;
				render(); push();
			} }, X());
			return h('div.fxr' + (isOpen ? '.on' : ''), { 'data-m': it.m }, [ic, sel, del]);
		}

		function groupEl(g) {
			var name = h('input.pgn', { type: 'text', value: g.name, spellcheck: 'false', 'aria-label': 'Nome do grupo' });
			name.addEventListener('input', function () { g.name = name.value; push(); });
			name.addEventListener('keydown', function (e) { if (e.key === 'Enter') name.blur(); });
			var grp;
			var del = h('button.ox', { title: 'remover grupo', 'aria-label': 'Remover grupo', onclick: function () {
				if (g.items.length && !grp.classList.contains('arm')) { grp.classList.add('arm'); setTimeout(function () { grp.classList.remove('arm'); }, 2200); return; }
				G.splice(G.indexOf(g), 1);
				render(); push();
			} }, X());
			var rows = h('div.prows');
			g.items.forEach(function (it, i) {
				rows.appendChild(itemRow(g, i));
				if (open && open.g === g && open.i === i) rows.appendChild(picker(g, i));
			});
			var add = h('button.padd', { onclick: function () {
				g.items.push({ m: '', name: '', icon: 'fx' });
				open = null;
				render();
				// open the search of the new row right away
				var all = root.querySelectorAll('.pgrp')[G.indexOf(g)].querySelectorAll('.dd-btn');
				if (all.length) { var b = all[all.length - 1]; setTimeout(function () { b.click(); }, 30); }
			} }, [PLUS(), 'efeito']);
			grp = h('div.pgrp', null, [h('div.pgh', null, [name, h('span.ogc', { text: g.items.filter(function (x) { return x.m; }).length }), del]), rows, add]);
			return grp;
		}

		function render() {
			list.textContent = '';
			G.forEach(function (g) { list.appendChild(groupEl(g)); });
		}

		var addGroup = h('button.padd.pnew', { onclick: function () {
			G.push({ name: 'novo grupo', items: [] });
			render();
			var gs = root.querySelectorAll('.pgn');
			gs[gs.length - 1].focus(); gs[gs.length - 1].select();
			push();
		} }, [PLUS(), 'grupo']);
		var reset = h('button.mini', { title: 'efeitos padrão', 'aria-label': 'Restaurar efeitos padrão', onclick: function () {
			PGN.run('fx.reset', {}).then(function (r) {
				if (r.ok && r.data) { G = r.data.groups; open = null; render(); PGN.emit('fx', r.data); }
				UI.note(note, r.ok ? r.msg : r.error, r.ok, version);
			});
		} }, UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path('M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4', 'spinme')]));

		root.appendChild(h('p.fxhint', { text: 'a camada de ajuste fica fixa na barra; aqui, os efeitos e seus grupos.' }));
		root.appendChild(list);
		root.appendChild(h('div.pfoot', null, [addGroup, h('span.grow'), reset]));

		// right click on an effect in the bar: scroll to it
		var ready = false, pending = null;
		function focus(f) {
			if (!f) return;
			if (!ready) { pending = f; return; }
			var row = [].filter.call(root.querySelectorAll('.fxr'), function (r) { return r.getAttribute('data-m') === f.key; })[0];
			if (!row) return;
			row.scrollIntoView({ block: 'center', behavior: 'smooth' });
			row.classList.remove('flash'); void row.offsetWidth; row.classList.add('flash');
		}
		root.focusItem = focus;   // called by settings.js (focusRouter)

		Promise.all([PGN.run('fx.list', {}), PGN.run('fx.get', {})]).then(function (rs) {
			ALL = (rs[0].ok && rs[0].data && rs[0].data.effects) || [];
			ALL.forEach(function (e) { byMatch[e.m] = e; });
			if (!rs[1].ok || !rs[1].data) { UI.note(note, rs[1].error || 'efeitos indisponíveis', false, version); return; }
			G = rs[1].data.groups || [];
			render();
			ready = true;
			if (pending) { var p = pending; pending = null; setTimeout(function () { focus(p); }, 350); }
		});
		return root;
	};
})();
