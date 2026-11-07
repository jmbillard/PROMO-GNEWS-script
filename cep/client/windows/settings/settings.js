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

	// ---- org folders editor (sigla → sub path) ----
	function orgEditor() {
		var ed = h('div.orged');
		var inner = h('div.oi');
		ed.appendChild(inner);
		var map = Object.assign({}, (P.folders && P.folders.promoSubPath) || {});
		var defs = (P.defaults && P.defaults.folders && P.defaults.folders.promoSubPath) || {};
		var q = '';
		var saveT;

		function persist() {
			clearTimeout(saveT);
			saveT = setTimeout(function () {
				PGN.run('prefs.setOrgFolders', { map: map }).then(function (r) {
					if (r.ok && r.data) {
						map = Object.assign({}, r.data.promoSubPath);
						if (r.data.defaults) defs = r.data.defaults;
						P.folders.promoSubPath = Object.assign({}, map);
						count.textContent = Object.keys(map).length + ' siglas';
					}
					UI.note(note, r.ok ? r.msg : r.error, r.ok, version);
				});
			}, 450);
		}

		function cat(path) { var i = path.indexOf('/'); return i < 0 ? path : path.slice(0, i); }

		// header: count · filter · reset (two clicks)
		var count = h('span.cnt.mono', { text: Object.keys(map).length + ' siglas' });
		var filter = h('input.fld.mini-fld', { type: 'text', placeholder: 'filtrar', 'aria-label': 'Filtrar siglas', spellcheck: 'false' });
		filter.addEventListener('input', function () { q = UI.strip(filter.value.toLowerCase()); list(); });
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
				if (r.ok && r.data) { map = Object.assign({}, r.data.promoSubPath); P.folders.promoSubPath = Object.assign({}, map); count.textContent = Object.keys(map).length + ' siglas'; list(); }
				UI.note(note, r.ok ? r.msg : r.error, r.ok, version);
			});
		});
		var body = h('div.olist');

		// add row
		var nk = h('input.fld.sig', { type: 'text', placeholder: 'SIG', maxlength: 6, 'aria-label': 'Nova sigla', spellcheck: 'false' });
		var nv = h('input.fld.pth', { type: 'text', placeholder: 'PASTA/subpasta', 'aria-label': 'Caminho da nova sigla', spellcheck: 'false' });
		var add = h('button.mini.add', { title: 'adicionar sigla', 'aria-label': 'Adicionar sigla' }, UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path('M12 6v12M6 12h12')]));
		nk.addEventListener('input', function () { nk.value = nk.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); });
		function doAdd() {
			var k = nk.value.trim(), v = nv.value.trim().replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
			if (!k || !v) { (k ? nv : nk).focus(); nk.parentNode.classList.add('bad'); setTimeout(function () { nk.parentNode.classList.remove('bad'); }, 450); return; }
			var existed = map[k] != null;
			map[k] = v;
			nk.value = ''; nv.value = '';
			persist();
			list(k);
			UI.note(note, existed ? k + ' atualizada' : k + ' adicionada', true, version);
			nk.focus();
		}
		add.addEventListener('click', doAdd);
		[nk, nv].forEach(function (i) { i.addEventListener('keydown', function (e) { if (e.key === 'Enter') doAdd(); }); });

		function item(k, d, flash) {
			var isDef = defs[k] != null;
			var changed = isDef && defs[k] !== map[k];
			var v = h('input.fld.pth', { type: 'text', value: map[k], 'aria-label': 'Pasta da sigla ' + k, spellcheck: 'false' });
			var row = h('div.oit' + (flash ? '.new' : ''), { style: { animationDelay: d + 'ms' } }, [
				h('span.sig.mono' + (isDef ? '' : '.custom'), { text: k, title: isDef ? 'sigla padrão' : 'sigla adicionada' }),
				v
			]);
			var act;
			if (!isDef) {
				act = h('button.mini.del', { title: 'remover ' + k, 'aria-label': 'Remover sigla ' + k }, UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path(I.close)]));
				act.addEventListener('click', function () {
					row.classList.add('out');
					setTimeout(function () { delete map[k]; persist(); list(); }, 220);
				});
			} else {
				act = h('button.mini.rev' + (changed ? '' : '.hide'), { title: 'voltar ao padrão: ' + defs[k], 'aria-label': 'Voltar ' + k + ' ao padrão' }, UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path(I.reset)]));
				act.addEventListener('click', function () { map[k] = defs[k]; v.value = defs[k]; act.classList.add('hide'); row.classList.remove('mod'); persist(); });
			}
			if (changed) row.classList.add('mod');
			v.addEventListener('change', function () {
				var val = v.value.trim().replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
				if (!val) { v.value = map[k]; return; }
				map[k] = val; v.value = val;
				if (isDef) { var c = defs[k] !== val; row.classList.toggle('mod', c); act.classList.toggle('hide', !c); }
				persist();
				if (cat(val) !== row.dataset.cat) list(k);
			});
			v.addEventListener('keydown', function (e) { if (e.key === 'Enter') v.blur(); });
			row.dataset.cat = cat(map[k]);
			row.appendChild(act);
			return row;
		}

		function list(flashKey) {
			body.textContent = '';
			var keys = Object.keys(map).filter(function (k) { return !q || UI.strip((k + ' ' + map[k]).toLowerCase()).indexOf(q) >= 0; });
			var groups = {};
			keys.forEach(function (k) { var c = cat(map[k]); (groups[c] = groups[c] || []).push(k); });
			var d = 0;
			Object.keys(groups).sort().forEach(function (c) {
				body.appendChild(h('div.ocat', { text: c.toLowerCase() }));
				groups[c].sort().forEach(function (k) { body.appendChild(item(k, Math.min(d += 14, 360), k === flashKey)); });
			});
			if (!keys.length) body.appendChild(h('div.oempty', { text: 'nenhuma sigla' }));
			count.textContent = Object.keys(map).length + ' siglas';
		}

		UI.add(inner, [
			h('div.ohead', null, [count, filter, rst]),
			body,
			h('div.oadd', null, [nk, nv, add])
		]);
		ed.render = function () { map = Object.assign({}, (P.folders && P.folders.promoSubPath) || map); list(); };
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
			if (!r.ok) { UI.note(note, r.error, false); return; }
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
