/*
---------------------------------------------------------------
> PROMO GNEWS · preferences · 'paleta' editor
---------------------------------------------------------------
  the color groups of the bar's 'Marca' section, kept simple:
  each group has a name and a list of hex codes typed as text, with a
  small preview of the color and its name beside it: automatic (pt-BR,
  shown as the placeholder) until the user types one; clearing the
  field brings the automatic name back. + cor / + grupo / × to remove. Every change saves (debounced) and
  tells the bar (PGN.emit('palette')).
  host: palette.get · palette.set { groups } · palette.reset
*/
(function () {
	'use strict';

	var h = UI.h;
	function X() { return UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path('M7 7l10 10M17 7L7 17')]); }
	function PLUS() { return UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path('M12 6v12M6 12h12')]); }
	function norm(v) {
		var s = String(v || '').trim().replace(/^#/, '').toUpperCase();
		if (/^[0-9A-F]{3}$/.test(s)) s = s.replace(/(.)/g, '$1$1');
		return /^[0-9A-F]{6}$/.test(s) ? '#' + s : null;
	}

	window.PaletteEditor = function (note, version) {
		var G = [];
		var root = h('div.paled');
		var list = h('div.plist');

		var push = UI.debounce(function () {
			var groups = G.map(function (g) {
				var colors = [], nm = [];
				g.colors.forEach(function (c, i) { if (norm(c)) { colors.push(norm(c)); nm.push(String(g.names[i] || '').trim()); } });
				return { name: g.name, colors: colors, names: nm };
			});
			PGN.run('palette.set', { groups: groups }).then(function (r) {
				if (r.ok && r.data) PGN.emit('palette', r.data);
				UI.note(note, r.ok ? r.msg : r.error, r.ok, version);
			});
		}, 500);

		// automatic names, unique in the whole palette (same as the bar);
		// they are the placeholder of the name field, a typed name wins
		function names() {
			var taken = [];
			root.querySelectorAll('.pc').forEach(function (row) {
				var hex = norm(row.querySelector('.phx').value);
				var fld = row.querySelector('.pnm');
				var own = fld.value.trim();
				var n = own || (hex && window.PalNames ? PalNames.pick(hex, taken) : '');
				if (n) taken.push(n);
				fld.placeholder = hex ? (own ? '' : n) : 'hex inválido';
				if (!own) fld.dataset.auto = hex ? n : '';
			});
		}

		function colorRow(g, i) {
			var hex = g.colors[i];
			var pv = h('i.ppv');
			var inp = h('input.phx', { type: 'text', value: hex, maxlength: 7, spellcheck: 'false', 'aria-label': 'Cor em hex', placeholder: '#RRGGBB' });
			var nm = h('input.pnm', { type: 'text', value: g.names[i] || '', maxlength: 40, spellcheck: 'false', 'aria-label': 'Nome da cor', title: 'nome da cor · vazio = automático' });
			nm.addEventListener('input', function () { g.names[i] = nm.value; row.classList.toggle('own', !!nm.value.trim()); names(); push(); });
			nm.addEventListener('keydown', function (e) {
				if (e.key === 'Enter') nm.blur();
				// Esc: back to the automatic name
				if (e.key === 'Escape' && nm.value) { nm.value = ''; g.names[i] = ''; row.classList.remove('own'); names(); push(); }
			});
			var row = h('div.pc', { 'data-hex': hex }, [pv, inp, nm, h('button.ox', { title: 'remover cor', 'aria-label': 'Remover cor', onclick: function () {
				g.colors.splice(i, 1);
				g.names.splice(i, 1);
				render(); push();
			} }, X())]);
			function show() {
				var v = norm(inp.value);
				pv.style.background = v || 'transparent';
				row.classList.toggle('bad', !v && inp.value.length > 0);
				row.setAttribute('data-hex', v || '');
			}
			inp.addEventListener('input', function () { g.colors[i] = inp.value.trim(); show(); names(); if (norm(inp.value)) push(); });
			inp.addEventListener('blur', function () { var v = norm(inp.value); if (v) { inp.value = v; g.colors[i] = v; } });
			inp.addEventListener('keydown', function (e) {
				if (e.key !== 'Enter') return;
				// Enter on the last color adds the next one
				if (i === g.colors.length - 1 && norm(inp.value)) { g.colors.push(''); g.names.push(''); render(); var all = root.querySelectorAll('.pgrp')[G.indexOf(g)].querySelectorAll('.phx'); all[all.length - 1].focus(); }
				else inp.blur();
			});
			row.classList.toggle('own', !!(g.names[i] || '').trim());
			show();
			return row;
		}

		function groupEl(g) {
			var name = h('input.pgn', { type: 'text', value: g.name, spellcheck: 'false', 'aria-label': 'Nome do grupo' });
			name.addEventListener('input', function () { g.name = name.value; push(); });
			name.addEventListener('keydown', function (e) { if (e.key === 'Enter') name.blur(); });
			var del = h('button.ox', { title: 'remover grupo', 'aria-label': 'Remover grupo', onclick: function () {
				// two clicks for a group with colors
				if (g.colors.length && !grp.classList.contains('arm')) { grp.classList.add('arm'); setTimeout(function () { grp.classList.remove('arm'); }, 2200); return; }
				G.splice(G.indexOf(g), 1);
				render(); push();
			} }, X());
			var rows = h('div.prows');
			g.colors.forEach(function (c, i) { rows.appendChild(colorRow(g, i)); });
			var add = h('button.padd', { onclick: function () {
				g.colors.push('');
				g.names.push('');
				render();
				var all = root.querySelectorAll('.pgrp')[G.indexOf(g)].querySelectorAll('.phx');
				all[all.length - 1].focus();
			} }, [PLUS(), 'cor']);
			var grp = h('div.pgrp', null, [h('div.pgh', null, [name, h('span.ogc', { text: g.colors.filter(norm).length }), del]), rows, add]);
			return grp;
		}

		function render() {
			// names[] follows colors[] ('' = automatic)
			G.forEach(function (g) { g.names = g.colors.map(function (c, i) { return (g.names && g.names[i]) || ''; }); });
			list.textContent = '';
			G.forEach(function (g) { list.appendChild(groupEl(g)); });
			names();
		}

		var addGroup = h('button.padd.pnew', { onclick: function () {
			G.push({ name: 'novo grupo', colors: [''] });
			render();
			var gs = root.querySelectorAll('.pgn');
			gs[gs.length - 1].focus(); gs[gs.length - 1].select();
			push();
		} }, [PLUS(), 'grupo']);
		var reset = h('button.mini', { title: 'paleta padrão', 'aria-label': 'Restaurar paleta padrão', onclick: function () {
			PGN.run('palette.reset', {}).then(function (r) {
				if (r.ok && r.data) { G = r.data.groups; render(); PGN.emit('palette', r.data); }
				UI.note(note, r.ok ? r.msg : r.error, r.ok, version);
			});
		} }, UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path('M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4', 'spinme')]));

		root.appendChild(list);
		root.appendChild(h('div.pfoot', null, [addGroup, h('span.grow'), reset]));

		// right click on a swatch in the bar: scroll to that color
		var ready = false, pending = null;
		function focus(f) {
			if (!f) return;
			if (!ready) { pending = f; return; }
			var row = root.querySelector('.pc[data-hex="' + String(f.key || f.hex).toUpperCase() + '"]');
			if (!row) return;
			row.scrollIntoView({ block: 'center', behavior: 'smooth' });
			row.classList.remove('flash'); void row.offsetWidth; row.classList.add('flash');
			setTimeout(function () { var i = row.querySelector('.phx'); i.focus(); i.select(); }, 450);
		}
		root.focusItem = focus;   // called by settings.js (focusRouter)

		PGN.run('palette.get', {}).then(function (r) {
			if (!r.ok || !r.data) { UI.note(note, r.error || 'paleta indisponível', false, version); return; }
			G = r.data.groups || [];
			render();
			ready = true;
			if (pending) { var p = pending; pending = null; setTimeout(function () { focus(p); }, 350); }
		});
		return root;
	};
})();
