/*
---------------------------------------------------------------
> PROMO GNEWS · preferences window
---------------------------------------------------------------
  host: prefs.get · prefs.set { patch } · prefs.reset · prefs.openFolder
        prefs.pickFolder { key } · prefs.resetFolder { key } · prefs.resetOrgFolders
  every change is saved immediately; panel-only options
  (labels, reduced motion) are broadcast with PGN.emit('prefs').
*/
(function () {
	'use strict';

	var h = UI.h, I = UI.I;
	var $ = function (id) { return document.getElementById(id); };
	var body = $('body'), note = $('note');
	var P = null;
	var IC = {
		user: 'M8 8a4 4 0 1 0 8 0a4 4 0 1 0-8 0M4 20c0-4 4-6 8-6s8 2 8 6',
		null: 'M5 5h14v14H5zM12 8.5v7M8.5 12h7',
		adj: 'M4 4h16v16H4zM4 20L20 4',
		org: 'M3 7v11h18V9h-9l-2-2zM8 14h8',
		sub: 'M4 6h6M4 12h10M4 18h8M14 6h6',
		miss: 'M12 8v5M12 16h.01M10.3 3.9L2.5 17.5A2 2 0 0 0 4.2 20.5h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
		save: 'M5 4h11l3 3v13H5zM8 20v-6h8v6',
		folder: I.folder,
		home: 'M4 11l8-7 8 7M6 9.5V20h12V9.5',
		news: 'M5 5h14v14H5zM8 9h8M8 13h8M8 17h5',
		labels: 'M4 6h16M4 12h10M4 18h13',
		motion: 'M3 12c2-4 4 4 6 0s4 4 6 0 4 4 6 0',
		dev: 'M9 7l-5 5 5 5M15 7l5 5-5 5'
	};

	function rowIcon(d) { return UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path(d)]); }

	function save(patch, msg) {
		return PGN.run('prefs.set', { patch: patch }).then(function (r) {
			UI.note(note, r.ok ? (msg || r.msg) : r.error, r.ok, version);
			if (r.ok) {
				Object.keys(patch).forEach(function (k) {
					if (typeof patch[k] === 'object' && !Array.isArray(patch[k]) && P[k]) Object.assign(P[k], patch[k]);
					else P[k] = patch[k];
				});
				PGN.emit('prefs', patch);
			}
			return r;
		});
	}

	function version() { return document.createTextNode(P && P.version ? P.version + ' · CEP' : 'CEP'); }

	// ---- controls ----
	function switchRow(icon, label, sub, get, set, extra) {
		var on = !!get();
		var sw = h('button.sw' + (on ? '.on' : ''), { role: 'switch', 'aria-checked': String(on), 'aria-label': label }, [
			h('span.rail', null, h('i')), h('span.d.a'), h('span.d.b')
		]);
		sw.addEventListener('click', function () {
			var v = !sw.classList.contains('on');
			sw.classList.toggle('on', v);
			sw.setAttribute('aria-checked', String(v));
			set(v);
		});
		return h('div.row', extra, [rowIcon(icon), h('div.lb', null, [label, sub ? h('small', { text: sub }) : null]), sw]);
	}

	function segRow(icon, label, options, value, onPick) {
		var seg = h('div.seg', { role: 'radiogroup', 'aria-label': label });
		var ind = h('span.ind');
		seg.appendChild(ind);
		var btns = options.map(function (o, i) {
			var b = h('button' + (i === value ? '.on' : ''), { role: 'radio', 'aria-checked': String(i === value), text: o });
			b.addEventListener('click', function () {
				btns.forEach(function (x, j) { x.classList.toggle('on', j === i); x.setAttribute('aria-checked', String(j === i)); });
				move(b);
				onPick(i);
			});
			seg.appendChild(b);
			return b;
		});
		function move(b) { ind.style.left = b.offsetLeft + 'px'; ind.style.width = b.offsetWidth + 'px'; }
		requestAnimationFrame(function () { move(btns[value] || btns[0]); });
		return h('div.row', null, [rowIcon(icon), h('div.lb', { text: label }), seg]);
	}

	function folderRow(icon, label, key) {
		var small = h('small', { text: P.folders[key] || '' });
		function upd(r) {
			if (r.ok && r.data && r.data.path) { P.folders[key] = r.data.path; small.textContent = r.data.path; }
			UI.note(note, r.ok ? (r.data && r.data.cancelled ? 'nenhuma pasta escolhida' : 'Pasta definida') : r.error, r.ok && !(r.data && r.data.cancelled), version);
		}
		return h('div.row', { title: P.folders[key] || '' }, [
			rowIcon(icon),
			// the path itself picks a new folder
			h('button.lb.pick', { title: 'escolher pasta', 'aria-label': 'Escolher pasta: ' + label, onclick: function () { PGN.run('prefs.pickFolder', { key: key }).then(upd); } }, [label, small]),
			h('button.mini', { title: 'restaurar', 'aria-label': 'Restaurar pasta: ' + label, onclick: function () { PGN.run('prefs.resetFolder', { key: key }).then(upd); } }, UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path(I.reset, 'spinme')]))
		]);
	}

	// ---- org folders editor: a small tree (pasta → sigla + subpasta) ----
	// rows reorder by dragging the vertical handle (also across folders), new rows/folders, × removes
	function orgEditor() {
		var ed = h('div.orged');
		var inner = h('div.oi');
		ed.appendChild(inner);
		var defs = {};
		var saveT;
		var tree = h('div.olist');

		function split(path) {
			var i = path.indexOf('/');
			return i < 0 ? { cat: path, sub: '' } : { cat: path.slice(0, i), sub: path.slice(i + 1) };
		}
		function clean(v) { return String(v || '').replace(/\\/g, '/').replace(/^\/+|\/+$/g, '').replace(/\/{2,}/g, '/').trim(); }

		// ordered model → DOM
		function fromMap(map) {
			var groups = [], byName = {};
			Object.keys(map).forEach(function (k) {
				var p = split(map[k]);
				if (!byName[p.cat]) { byName[p.cat] = { name: p.cat, rows: [] }; groups.push(byName[p.cat]); }
				byName[p.cat].rows.push({ k: k, sub: p.sub });
			});
			return groups;
		}

		// DOM → ordered map (the order is saved too)
		function toMap() {
			var map = {}, seen = {};
			tree.querySelectorAll('.ogrp').forEach(function (g) {
				var name = clean(g.querySelector('.ogn').value);
				g.querySelectorAll('.oit').forEach(function (r) {
					var k = r.querySelector('.sig').value.trim();
					var sub = clean(r.querySelector('.pth').value);
					r.classList.toggle('dup', !!(k && seen[k]));
					if (!k || !name || seen[k]) return;
					seen[k] = true;
					map[k] = name + (sub ? '/' + sub : '');
				});
			});
			return map;
		}

		function mark() {
			tree.querySelectorAll('.ogrp').forEach(function (g) {
				var name = clean(g.querySelector('.ogn').value);
				var n = g.querySelectorAll('.oit').length;
				g.querySelector('.ogc').textContent = n;
				g.classList.toggle('empty', !n);
				g.querySelectorAll('.oit').forEach(function (r) {
					var k = r.querySelector('.sig').value.trim();
					var sub = clean(r.querySelector('.pth').value);
					var full = name + (sub ? '/' + sub : '');
					r.classList.toggle('custom', !!k && defs[k] == null);
					r.classList.toggle('mod', !!k && defs[k] != null && defs[k] !== full);
				});
			});
			count.textContent = Object.keys(toMap()).length + ' siglas';
		}

		function changed() {
			mark();
			clearTimeout(saveT);
			saveT = setTimeout(function () {
				var map = toMap();
				PGN.run('prefs.setOrgFolders', { map: map }).then(function (r) {
					if (r.ok && r.data) {
						if (r.data.defaults) defs = r.data.defaults;
						P.folders.promoSubPath = Object.assign({}, r.data.promoSubPath);
						mark();
					}
					UI.note(note, r.ok ? r.msg : r.error, r.ok, version);
				});
			}, 500);
		}

		function x(title, fn) {
			return h('button.ox', { title: title, 'aria-label': title, onclick: fn }, UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path(I.close)]));
		}

		function rowEl(r, delay) {
			var sig = h('input.sig', { type: 'text', value: r.k, maxlength: 6, placeholder: 'SIG', 'aria-label': 'Sigla', spellcheck: 'false' });
			var pth = h('input.pth', { type: 'text', value: r.sub, placeholder: '(raiz da pasta)', 'aria-label': 'Subpasta da sigla', spellcheck: 'false' });
			var handle = h('button.oh', { title: 'arrastar para reordenar (Alt + ↑/↓)', 'aria-label': 'Reordenar ' + (r.k || 'linha') }, h('i'));
			var row = h('div.oit', { style: { animationDelay: delay + 'ms' } }, [handle, sig, pth]);
			row.appendChild(x('remover linha', function () {
				row.classList.add('out');
				setTimeout(function () { row.remove(); changed(); }, 200);
			}));
			sig.addEventListener('input', function () { sig.value = sig.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); changed(); });
			pth.addEventListener('change', function () { pth.value = clean(pth.value); changed(); });
			[sig, pth].forEach(function (i) { i.addEventListener('keydown', function (e) { if (e.key === 'Enter') i.blur(); }); });
			handle.addEventListener('mousedown', function (e) { startDrag(row, e); });
			handle.addEventListener('keydown', function (e) {
				if (!e.altKey || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
				e.preventDefault();
				var rows = [].slice.call(tree.querySelectorAll('.oit'));
				var i = rows.indexOf(row), j = i + (e.key === 'ArrowUp' ? -1 : 1);
				if (j < 0 || j >= rows.length) return;
				flip(function () { if (j < i) rows[j].before(row); else rows[j].after(row); });
				handle.focus();
				changed();
			});
			return row;
		}

		function groupEl(g, d) {
			var rows = h('div.orows');
			var name = h('input.ogn', { type: 'text', value: g.name, 'aria-label': 'Nome da pasta', spellcheck: 'false' });
			var armT;
			var del = x('remover pasta (clique duas vezes)', function () {
				if (!grp.classList.contains('arm')) {
					grp.classList.add('arm');
					armT = setTimeout(function () { grp.classList.remove('arm'); }, 2500);
					return;
				}
				clearTimeout(armT);
				grp.classList.add('out');
				setTimeout(function () { grp.remove(); changed(); }, 220);
			});
			var add = h('button.oa', { title: 'nova linha', 'aria-label': 'Nova linha em ' + g.name }, UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path('M12 6v12M6 12h12')]));
			var chev = h('button.oc', { title: 'recolher', 'aria-label': 'Recolher ' + g.name, 'aria-expanded': 'true' }, UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path(I.chev)]));
			var grp = h('div.ogrp', { style: { animationDelay: d + 'ms' } }, [
				h('div.ogh', null, [chev, UI.svg('0 0 24 24', { class: 'ofi', 'aria-hidden': 'true' }, [UI.path(I.folder)]), name, h('span.ogc.mono'), add, del]),
				rows
			]);
			g.rows.forEach(function (r, i) { rows.appendChild(rowEl(r, d + 20 + i * 14)); });
			chev.addEventListener('click', function () {
				var shut = grp.classList.toggle('shut');
				chev.setAttribute('aria-expanded', String(!shut));
			});
			name.addEventListener('change', function () { name.value = clean(name.value).toUpperCase() || g.name; changed(); });
			name.addEventListener('keydown', function (e) { if (e.key === 'Enter') name.blur(); });
			add.addEventListener('click', function () {
				grp.classList.remove('shut');
				var r = rowEl({ k: '', sub: '' }, 0);
				r.classList.add('new');
				rows.appendChild(r);
				r.querySelector('.sig').focus();
				mark();
			});
			return grp;
		}

		function render(map) {
			tree.textContent = '';
			var d = 0;
			fromMap(map).forEach(function (g) { tree.appendChild(groupEl(g, d)); d += 40; });
			mark();
		}

		/* --- drag & drop (pointer based, FLIP animations) --- */
		function flip(mutate) {
			var els = [].slice.call(tree.querySelectorAll('.oit:not(.drag)'));
			var before = els.map(function (e) { return e.getBoundingClientRect().top; });
			mutate();
			els.forEach(function (e, i) {
				var dy = before[i] - e.getBoundingClientRect().top;
				if (!dy) return;
				e.style.transition = 'none';
				e.style.transform = 'translateY(' + dy + 'px)';
				requestAnimationFrame(function () {
					e.style.transition = 'transform .22s cubic-bezier(.3, 1.2, .5, 1)';
					e.style.transform = '';
				});
			});
		}

		function startDrag(row, e) {
			e.preventDefault();
			var grab = e.clientY - row.getBoundingClientRect().top;
			var ty = 0;
			row.classList.add('drag');
			tree.classList.add('dragging');
			var move = function (ev) {
				// auto scroll near the edges
				var tr = tree.getBoundingClientRect();
				if (ev.clientY < tr.top + 24) tree.scrollTop -= 8;
				if (ev.clientY > tr.bottom - 24) tree.scrollTop += 8;
				// where should it go?
				var y = ev.clientY;
				var groups = [].slice.call(tree.querySelectorAll('.ogrp:not(.shut)'));
				var target = null, before = null;
				for (var i = 0; i < groups.length; i++) {
					var gr = groups[i].getBoundingClientRect();
					if (y < gr.bottom || i === groups.length - 1) {
						target = groups[i].querySelector('.orows');
						var rows = [].slice.call(target.querySelectorAll('.oit:not(.drag)'));
						for (var j = 0; j < rows.length; j++) {
							var rr = rows[j].getBoundingClientRect();
							if (y < rr.top + rr.height / 2) { before = rows[j]; break; }
						}
						break;
					}
				}
				if (target && !(before ? row.nextElementSibling === before && row.parentNode === target : row.parentNode === target && !row.nextElementSibling)) {
					flip(function () { if (before) target.insertBefore(row, before); else target.appendChild(row); });
					tree.querySelectorAll('.ogrp').forEach(function (g) { g.classList.toggle('hot', g.contains(row)); });
				}
				// keep the row under the pointer: layout top = visual top - current offset
				var layoutTop = row.getBoundingClientRect().top - ty;
				ty = y - grab - layoutTop;
				row.style.transform = 'translateY(' + ty + 'px)';
			};
			var up = function () {
				window.removeEventListener('mousemove', move);
				window.removeEventListener('mouseup', up);
				row.style.transition = 'transform .25s cubic-bezier(.3, 1.3, .5, 1)';
				row.style.transform = '';
				setTimeout(function () { row.style.transition = ''; }, 260);
				row.classList.remove('drag');
				tree.classList.remove('dragging');
				tree.querySelectorAll('.ogrp.hot').forEach(function (g) { g.classList.remove('hot'); });
				changed();
			};
			window.addEventListener('mousemove', move);
			window.addEventListener('mouseup', up);
		}

		// header: count · new folder · reset (two clicks)
		var count = h('span.cnt.mono');
		var newGrp = h('button.chip', { title: 'nova pasta' }, '+ pasta');
		newGrp.addEventListener('click', function () {
			var g = groupEl({ name: 'NOVA PASTA', rows: [{ k: '', sub: '' }] }, 0);
			tree.appendChild(g);
			var n = g.querySelector('.ogn');
			n.focus(); n.select();
			tree.scrollTop = tree.scrollHeight;
			mark();
		});
		var rst = h('button.rst', { title: 'restaurar a lista padrão' }, [UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path(I.reset)]), h('span', { text: 'padrão' })]);
		var armT;
		rst.addEventListener('click', function () {
			if (!rst.classList.contains('arm')) {
				rst.classList.add('arm'); rst.lastChild.textContent = 'confirmar?';
				armT = setTimeout(function () { rst.classList.remove('arm'); rst.lastChild.textContent = 'padrão'; }, 3000);
				return;
			}
			clearTimeout(armT); rst.classList.remove('arm'); rst.lastChild.textContent = 'padrão';
			PGN.run('prefs.resetOrgFolders', {}).then(function (r) {
				if (r.ok && r.data) {
					if (r.data.defaults) defs = r.data.defaults;
					P.folders.promoSubPath = Object.assign({}, r.data.promoSubPath);
					render(r.data.promoSubPath);
				}
				UI.note(note, r.ok ? r.msg : r.error, r.ok, version);
			});
		});

		UI.add(inner, [h('div.ohead', null, [count, h('span.grow'), newGrp, rst]), tree]);
		ed.render = function () {
			defs = (P.defaults && P.defaults.folders && P.defaults.folders.promoSubPath) || defs;
			render((P.folders && P.folders.promoSubPath) || {});
		};
		return ed;
	}

	function group(title, rows, delay) {
		return h('div.grp', { style: { animationDelay: delay + 'ms' } }, [h('div.glbl', { text: title }), h('div.card', null, rows)]);
	}

	// ---- build ----
	function build() {
		body.textContent = '';
		var layerTypes = (P.layerTypes || ['shape layer', 'solid layer']).map(function (t) { return t.split(' ')[0]; });
		var modes = P.projectModes || ['PROMO', 'custom'];

		var prefix = h('input.fld', { type: 'text', value: P.userPrefix || '', maxlength: 3, 'aria-label': 'Prefixo do usuário', spellcheck: 'false' });
		prefix.addEventListener('change', function () { save({ userPrefix: prefix.value.toUpperCase() }); });
		prefix.addEventListener('keydown', function (e) { if (e.key === 'Enter') prefix.blur(); });

		var hnRow, hoRow;
		hoRow = switchRow(IC.home, 'Home office', 'templates e fontes locais', function () { return P.homeOffice; }, function (v) {
			save({ homeOffice: v }).then(function () { hnRow.classList.toggle('off', v); });
		});
		hnRow = switchRow(IC.news, 'Hard news', 'IDs, pastas e previews do HN', function () { return P.hardNews; }, function (v) {
			save({ hardNews: v }).then(function () {
				orgRow.classList.toggle('off', v);
				if (v && orgEd.classList.contains('open')) orgRow.querySelector('.exp').click();
			});
		}, P.homeOffice ? { class: 'row off' } : null);
		// org folders: toggle + expandable sigla → sub path editor
		var orgRow = switchRow(IC.sub, 'Pastas de organização', 'ao coletar arquivos', function () { return P.orgFolders; }, function (v) { save({ orgFolders: v }); });
		var orgEd = orgEditor();
		var exp = h('button.mini.exp', { title: 'editar siglas e pastas', 'aria-label': 'Editar pastas de organização', 'aria-expanded': 'false' },
			UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path(I.chev)]));
		function toggleEd() {
			var open = !orgEd.classList.contains('open');
			orgEd.classList.toggle('open', open);
			orgRow.classList.toggle('open', open);
			exp.setAttribute('aria-expanded', String(open));
			if (open) orgEd.render();
		}
		exp.addEventListener('click', toggleEd);
		var lb = orgRow.querySelector('.lb');
		lb.classList.add('pick');
		lb.setAttribute('role', 'button');
		lb.setAttribute('tabindex', '0');
		lb.addEventListener('click', toggleEd);
		lb.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleEd(); } });
		orgRow.insertBefore(exp, orgRow.lastChild);
		if (P.hardNews) { orgRow.classList.add('off'); }

		var d = 0;
		UI.add(body, [
			group('usuário', [h('div.row', null, [rowIcon(IC.user), h('div.lb', null, ['Prefixo', h('small', { text: 'usado nos IDs e nomes' })]), prefix])], d += 40),
			group('layers', [
				segRow(IC.null, 'Null', layerTypes, P.selection.nullType, function (i) { save({ selection: { nullType: i } }); }),
				segRow(IC.adj, 'Adjustment', layerTypes, P.selection.adjType, function (i) { save({ selection: { adjType: i } }); })
			], d += 40),
			group('projeto', [
				segRow(IC.org, 'Organização', modes, P.selection.projectMode, function (i) { save({ selection: { projectMode: i } }); }),
				orgRow,
				orgEd,
				switchRow(IC.miss, 'Ignorar arquivos faltando', null, function () { return P.ignoreMissing; }, function (v) { save({ ignoreMissing: v }); }),
				switchRow(IC.save, 'Salvar cópia v22', 'após salvar o projeto', function () { return P.saveAsV22; }, function (v) { save({ saveAsV22: v }); }),
				folderRow(IC.folder, 'Pasta dos projetos', 'projPath')
			], d += 40),
			group('modos', [hoRow, hnRow], d += 40),
			group('rede', [
				folderRow(I.folder, 'PAM magazine', 'magazinePath'),
				folderRow(I.folder, 'PAM para arte', 'artePath')
			], d += 40),
			group('painel', [
				switchRow(IC.labels, 'Rótulos', 'no painel largo', function () { return P.showLabels; }, function (v) { save({ showLabels: v }); }),
				switchRow(IC.motion, 'Movimento reduzido', null, function () { return !!UI.store('reduced'); }, function (v) {
					UI.store('reduced', v);
					document.body.classList.toggle('reduced', v);
					PGN.emit('prefs', { reduced: v });
					UI.note(note, v ? 'Animações reduzidas' : 'Animações completas', true, version);
				}),
				switchRow(IC.dev, 'Ferramentas de dev', null, function () { return P.devMode; }, function (v) { save({ devMode: v }); })
			], d += 40)
		]);
		note.textContent = '';
		note.appendChild(version());
	}

	function load() {
		PGN.run('prefs.get', {}).then(function (r) {
			if (!r.ok) { UI.failState($('body'), r.error, load); return; }
			P = r.data;
			P.folders = P.folders || {};
			P.selection = P.selection || { nullType: 0, adjType: 0, projectMode: 0 };
			build();
		});
	}

	// ---- footer actions ----
	UI.add($('openPrefs'), UI.icon(I.folder, I.folderOpen, 'lift'));
	$('openPrefs').addEventListener('click', function () { PGN.run('prefs.openFolder', {}).then(function (r) { UI.note(note, r.ok ? r.msg : r.error, r.ok, version); }); });

	var rst = $('reset'), armT;
	UI.add(rst, [UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path(I.reset)]), h('span', { text: 'padrões' })]);
	rst.addEventListener('click', function () {
		if (!rst.classList.contains('arm')) {
			rst.classList.add('arm');
			rst.lastChild.textContent = 'confirmar?';
			armT = setTimeout(function () { rst.classList.remove('arm'); rst.lastChild.textContent = 'padrões'; }, 3000);
			return;
		}
		clearTimeout(armT);
		rst.classList.remove('arm');
		rst.lastChild.textContent = 'padrões';
		PGN.run('prefs.reset', {}).then(function (r) {
			UI.note(note, r.ok ? r.msg : r.error, r.ok, version);
			if (r.ok) { load(); PGN.emit('prefs', { showLabels: true }); }
		});
	});

	document.body.classList.toggle('reduced', !!UI.store('reduced'));

	// browser preview data
	var MOCK_ORG = { INS: 'CANAL/institucional', DIG: 'CANAL/digital', PIL: 'CANAL/pilula', MKT: 'CANAL/marketing', NDL: 'VINHETAS/nunca desliga', BIP: 'VINHETAS/bip', ASE: 'VINHETAS/a seguir', EMN: 'JORNAIS/edicao da meia noite', EMP: 'JORNAIS/em ponto', CON: 'JORNAIS/conexao', JDE: 'JORNAIS/jornal das dez', ELE: 'FACTUAIS/eleicoes brasil', MUN: 'FACTUAIS/mundo', INT: 'PROGRAMAS/internacional', DOC: 'PROGRAMAS/documentario', MAC: 'MARCA E COMUNICACAO' };
	PGN.mock('prefs.setOrgFolders', function (a) { var m = Object.assign({}, a.map); Object.keys(MOCK_ORG).forEach(function (k) { if (m[k] == null) m[k] = MOCK_ORG[k]; }); return { msg: 'Pastas de organização salvas', data: { promoSubPath: m, defaults: MOCK_ORG } }; }, 150);
	PGN.mock('prefs.resetOrgFolders', function () { return { msg: 'Pastas de organização restauradas', data: { promoSubPath: Object.assign({}, MOCK_ORG), defaults: MOCK_ORG } }; }, 150);
	PGN.mock('prefs.get', function () {
		return { data: { version: 'v3.0', userPrefix: 'JMB', selection: { nullType: 0, adjType: 1, projectMode: 0 }, orgFolders: true, ignoreMissing: false, saveAsV22: true, homeOffice: false, hardNews: false, showLabels: true, devMode: false, folders: { projPath: '~/Desktop', magazinePath: '//pamjb/UPLOAD_PAM_MAGAZINE', artePath: '//pamjb/PARA_ARTE', promoSubPath: Object.assign({}, MOCK_ORG, { JDE: 'JORNAIS/jornal das 10', XYZ: 'CANAL/especiais' }) }, defaults: { folders: { promoSubPath: MOCK_ORG } }, layerTypes: ['shape layer', 'solid layer'], projectModes: ['PROMO', 'custom'] } };
	}, 200);
	PGN.mock('prefs.set', function () { return { msg: 'Preferências salvas' }; }, 150);

	load();
})();
