/*
---------------------------------------------------------------
> PROMO GNEWS · layer labels window
---------------------------------------------------------------
  host: labels.get → { colors, names, presets } · labels.set { colors, names }
        labels.savePreset { name, colors, names } · labels.deletePreset { name }
  colors are plain '#RRGGBB' here; the host converts them to the
  4-byte string After Effects keeps in its preferences.

  layout (El Palletero): the 16 labels as swatches (color, number, name,
  hex); a click opens the editor over the window — saved color | new
  color with its name, saturation × brightness square, hue bar, hex,
  × / ✓. Changed labels get the yellow keyframe until 'aplicar'.
  presets + apply in the footer.
*/
(function () {
	'use strict';

	var h = UI.h;
	var $ = function (id) { return document.getElementById(id); };
	var note = $('note'), apply = $('apply');
	var S = { colors: [], names: [], saved: null, presets: [], sel: 0, loaded: '', manual: {} };

	/* ---------- color names ----------
	   always pt-BR: El Palletero's list (shared/pal-names.js), nearest in CIELAB and never
	   repeating a name already used by another label */
	function colorName(c) {
		var taken = S.names.filter(function (n, j) { return j !== S.sel; });
		return window.PalNames ? PalNames.pick(c, taken) : '';
	}

	apply.insertBefore(UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path(UI.I.check)]), apply.firstChild);

	function hex(v) {
		v = String(v || '').trim().replace(/^#/, '').toUpperCase();
		if (/^[0-9A-F]{3}$/.test(v)) v = v.replace(/(.)/g, '$1$1');
		return /^[0-9A-F]{6}$/.test(v) ? '#' + v : null;
	}
	function ink(c) {
		var n = parseInt(c.slice(1), 16);
		return (0.299 * (n >> 16 & 255) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) > 140 ? '#141416' : '#F2F2F4';
	}
	function modified(i) { return !!S.saved && (S.colors[i] !== S.saved.colors[i] || S.names[i] !== S.saved.names[i]); }

	function sync() {
		var any = false;
		$('grid').querySelectorAll('.sw').forEach(function (b, i) {
			var m = modified(i);
			any = any || m;
			b.classList.toggle('mod', m);
		});
		apply.disabled = !any;
		if (any) note.textContent = 'alterado · aplique para gravar no After Effects';
	}

	/* ---------- grid: the 16 labels as El Palletero swatches (color, number, name, hex) ---------- */

	function swatches() {
		var g = $('grid');
		g.textContent = '';
		S.colors.forEach(function (c, i) {
			var b = h('button.sw', {
				'aria-label': 'Editar label ' + (i + 1) + ' · ' + S.names[i],
				style: { animationDelay: i * 18 + 'ms' },
				onclick: function () { open(i); }
			}, [h('span.ix', { text: i + 1 }), h('span.nm', { text: S.names[i] || '' }), h('span.hx', { text: c }), h('i.kf')]);
			b.style.setProperty('--c', c);
			b.style.setProperty('--ink', ink(c));
			g.appendChild(b);
		});
		sync();
	}

	/* ---------- editor: takes the window (old color | new color + name, SV square, hue bar) ---------- */

	var lw = $('lw'), sv = $('sv'), ring = $('ring'), hue = $('hue'), knob = $('knob'), edHex = $('edHex'), edName = $('edName');
	var draft = null, hsb = [0, 0, 0];

	function C() { return window.PalColor; }
	function open(i) {
		S.sel = i;
		draft = { hex: S.colors[i], name: S.names[i], manual: !!S.manual[i] };
		hsb = C().rgbToHsb(C().hexToRgb(draft.hex));
		var was = S.saved ? S.saved.colors[i] : draft.hex;
		$('was').style.background = was;
		$('was').style.color = ink(was);
		$('edIx').textContent = i + 1;
		lw.classList.add('editing');
		editor();
		setTimeout(function () { $('ok').focus(); }, 30);
	}
	function close() {
		lw.classList.remove('editing');
		draft = null;
	}
	function editor() {
		if (!draft) return;
		var c = draft.hex;
		var now = $('now');
		now.style.background = c;
		now.style.color = ink(c);
		$('ed').style.setProperty('--c', c);
		$('ed').style.setProperty('--ink', ink(c));
		if (document.activeElement !== edName) edName.value = draft.name;
		if (document.activeElement !== edHex) edHex.value = c;
		$('wand').classList.toggle('on', !draft.manual);
		sv.style.setProperty('--hue', 'hsl(' + hsb[0] + ',100%,50%)');
		ring.style.left = hsb[1] + '%';
		ring.style.top = (100 - hsb[2]) + '%';
		knob.style.left = (hsb[0] / 360 * 100) + '%';
	}
	// a new color: the name follows it unless it was typed by hand
	function setHex(v) {
		draft.hex = v;
		if (!draft.manual) draft.name = colorName(v);
		editor();
	}
	function fromHsb() { setHex(C().rgbToHex(C().hsbToRgb(hsb))); }

	// CEP doesn't deliver pointer events: mouse events, one update per frame
	function dragOn(el, onMove) {
		el.addEventListener('mousedown', function (e) {
			if (e.button !== 0) return;
			e.preventDefault();
			el.classList.add('drag');
			var last = e, raf = 0;
			var go = function () { raf = 0; var r = el.getBoundingClientRect(); onMove(Math.max(0, Math.min(1, (last.clientX - r.left) / r.width)), Math.max(0, Math.min(1, (last.clientY - r.top) / r.height))); };
			var move = function (ev) { last = ev; if (!raf) raf = requestAnimationFrame(go); };
			var up = function () {
				if (raf) { cancelAnimationFrame(raf); go(); }
				el.classList.remove('drag');
				document.removeEventListener('mousemove', move);
				document.removeEventListener('mouseup', up);
			};
			document.addEventListener('mousemove', move);
			document.addEventListener('mouseup', up);
			go();
		});
	}
	dragOn(sv, function (x, y) { hsb[1] = x * 100; hsb[2] = (1 - y) * 100; fromHsb(); });
	dragOn(hue, function (x) { hsb[0] = x * 360; fromHsb(); });

	edHex.addEventListener('input', function () {
		var v = hex(this.value);
		this.classList.toggle('bad', !v && this.value.length >= 4);
		if (v) { hsb = C().rgbToHsb(C().hexToRgb(v)); setHex(v); }
	});
	edHex.addEventListener('blur', function () { if (draft) { this.value = draft.hex; this.classList.remove('bad'); } });
	// typing takes the name over; the wand gives it back to the color
	edName.addEventListener('input', function () { draft.manual = true; draft.name = this.value; $('wand').classList.remove('on'); });
	[edHex, edName].forEach(function (el) { el.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); $('ok').click(); } if (e.key === 'Escape') close(); }); });
	UI.add($('wand'), UI.icon('M4 20L14 10', 'M17 3v4M15 5h4M19 11v2M18 12h2', null));
	$('wand').addEventListener('click', function () {
		draft.manual = false;
		draft.name = colorName(draft.hex);
		var b = this; b.classList.remove('go'); void b.offsetWidth; b.classList.add('go');
		editor();
	});
	// the saved color (left): back to it
	$('was').addEventListener('click', function () {
		if (!S.saved) return;
		var i = S.sel;
		hsb = C().rgbToHsb(C().hexToRgb(S.saved.colors[i]));
		draft.hex = S.saved.colors[i];
		draft.name = S.saved.names[i];
		draft.manual = false;
		edName.value = draft.name;
		editor();
	});
	UI.add($('cancel'), UI.icon(UI.I.close));
	UI.add($('ok'), UI.icon(UI.I.check));
	$('cancel').addEventListener('click', close);
	$('ok').addEventListener('click', function () {
		if (!draft) return;
		var i = S.sel;
		S.colors[i] = draft.hex;
		S.names[i] = draft.name;
		S.manual[i] = draft.manual;
		close();
		swatches();
	});
	document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lw.classList.contains('editing')) close(); });

	/* ---------- presets ---------- */

	function presetsSelect() {
		var sel = $('preset');
		sel.textContent = '';
		sel.appendChild(h('option', { value: '', text: 'carregar preset…' }));
		sel.appendChild(h('option', { value: 'saved', text: 'atual (gravado no After Effects)' }));
		var mine = null;
		S.presets.forEach(function (p, i) {
			var o = h('option', { value: String(i), text: p.name });
			if (!p.user) { sel.appendChild(o); return; }
			if (!mine) { mine = document.createElement('optgroup'); mine.label = 'meus presets'; sel.appendChild(mine); }
			mine.appendChild(o);
		});
	}
	$('preset').addEventListener('change', function () {
		var v = this.value;
		if (!v) return;
		var p = v === 'saved' ? S.saved : S.presets[+v];
		S.colors = p.colors.slice(0);
		S.names = p.names.slice(0);
		while (S.names.length < 16) S.names.push(S.saved ? S.saved.names[S.names.length] : '');
		S.manual = {};
		S.loaded = v === 'saved' ? '' : p.name;
		swatches();
		editor();
		sync();
		note.textContent = v === 'saved' ? '16 labels' : p.name;
		this.value = '';
	});

	/* ---------- save as preset ---------- */

	var save = $('save'), namer = $('namer'), pName = $('pName'), pDel = $('pDel');
	UI.add(save, UI.icon('M5 4h11l3 3v13H5z', 'M8 20v-6h8v6M8 4v4h6'));
	pDel.appendChild(UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path('M6 6l12 12M18 6L6 18')]));

	function userPreset(name) {
		var n = name.replace(/\s+/g, ' ').trim().toLowerCase();
		for (var i = 0; i < S.presets.length; i++) if (S.presets[i].user && S.presets[i].name.toLowerCase() === n) return S.presets[i];
		return null;
	}
	function naming(on) {
		namer.hidden = !on;
		$('selWrap').hidden = on;
		save.classList.toggle('on', on);
		save.title = on ? 'salvar' : 'salvar como preset';
		if (on) {
			pName.value = S.loaded && userPreset(S.loaded) ? S.loaded : '';
			nameCheck();
			pName.focus();
			pName.select();
		}
	}
	function nameCheck() {
		var hit = userPreset(pName.value);
		pDel.hidden = !hit;
		save.title = hit ? 'substituir preset' : 'salvar';
		pName.classList.remove('bad');
	}
	function presetsBack(r) {
		if (r.ok && r.data && r.data.presets) { S.presets = r.data.presets; presetsSelect(); }
	}
	function doSave() {
		var name = pName.value.replace(/\s+/g, ' ').trim();
		if (!name) { pName.classList.add('bad'); pName.focus(); return; }
		save.disabled = true;
		PGN.run('labels.savePreset', { name: name, colors: S.colors, names: S.names }).then(function (r) {
			save.disabled = false;
			presetsBack(r);
			if (r.ok) { S.loaded = r.data.name; naming(false); }
			else pName.classList.add('bad');
			UI.note(note, r.ok ? r.msg + ' · ' + r.data.name : r.error, r.ok, '16 labels');
		});
	}
	save.addEventListener('click', function () { if (namer.hidden) naming(true); else doSave(); });
	pName.addEventListener('input', nameCheck);
	pName.addEventListener('keydown', function (e) {
		if (e.key === 'Enter') { e.preventDefault(); doSave(); }
		if (e.key === 'Escape') { e.preventDefault(); naming(false); }
	});
	pDel.addEventListener('click', function () {
		var p = userPreset(pName.value);
		if (!p) return;
		PGN.run('labels.deletePreset', { name: p.name }).then(function (r) {
			presetsBack(r);
			if (r.ok) { if (S.loaded === p.name) S.loaded = ''; naming(false); }
			UI.note(note, r.ok ? r.msg + ' · ' + p.name : r.error, r.ok, '16 labels');
		});
	});

	/* ---------- load / apply ---------- */

	function adopt(d) {
		S.saved = { colors: d.colors.slice(0), names: d.names.slice(0) };
		S.manual = {};
		S.colors = d.colors.slice(0);
		S.names = d.names.slice(0);
		swatches();
		editor();
		sync();
	}

	function load() {
		PGN.run('labels.get', {}).then(function (r) {
			if (!r.ok) { UI.note(note, r.error, false); return; }
			S.presets = r.data.presets || [];
			presetsSelect();
			adopt(r.data);
			note.textContent = '16 labels';
		});
	}

	apply.addEventListener('click', function () {
		apply.disabled = true;
		apply.insertBefore(h('span.pf'), apply.firstChild);
		PGN.run('labels.set', { colors: S.colors, names: S.names }).then(function (r) {
			var pf = apply.querySelector('.pf'); if (pf) pf.remove();
			if (r.ok && r.data) { adopt(r.data); PGN.notify(r.msg, true, '#ECFF8C'); }
			else sync();
			UI.note(note, r.ok ? r.msg : r.error, r.ok, '16 labels');
		});
	});

	// browser preview data
	var PROMO = { name: 'PROMO GNEWS', colors: ['#F13D3B', '#E71363', '#9A28AE', '#643CB3', '#3F51B3', '#2996EF', '#1BA9F1', '#1EBCD3', '#169688', '#4FAF54', '#8CC351', '#CCDA47', '#FDE94C', '#FBBF2B', '#FD9623', '#FB532D'], names: ['vermelho', 'morango', 'púrpura', 'uva', 'cobalto', 'denim', 'céu', 'piscina', 'lagoa', 'bandeira', 'pistache', 'limão', 'banana', 'gema', 'tangerina', 'tomate'] };
	var ADOBE = { name: 'After Effects', colors: ['#B53838', '#E4D84C', '#A9CBC7', '#E5BCC9', '#A9A9CA', '#E7C19E', '#B3C7B3', '#677DE0', '#4AA44C', '#8E2C9A', '#E8920D', '#7F452A', '#F46DD6', '#3DA2A5', '#A89677', '#1E401E'], names: ['Vermelho', 'Amarelo', 'Água', 'Rosa', 'Lavanda', 'Pêssego', 'Verde-mar', 'Azul', 'Verde', 'Roxo', 'Laranja', 'Marrom', 'Fúcsia', 'Ciano', 'Arenito', 'Verde-escuro'] };
	PGN.mock('labels.get', function () { return { data: { colors: PROMO.colors, names: PROMO.names, presets: [PROMO, ADOBE] } }; }, 150);
	var MINE = [];
	function mockList() { return [PROMO, ADOBE].concat(MINE.map(function (p) { return { name: p.name, colors: p.colors, names: p.names, user: true }; })); }
	PGN.mock('labels.savePreset', function (a) {
		var n = a.name.replace(/\s+/g, ' ').trim(), hit = false;
		MINE = MINE.map(function (p) { if (p.name.toLowerCase() !== n.toLowerCase()) return p; hit = true; return { name: n, colors: a.colors.slice(0), names: a.names.slice(0) }; });
		if (!hit) MINE.push({ name: n, colors: a.colors.slice(0), names: a.names.slice(0) });
		return { msg: hit ? 'Preset substituído' : 'Preset salvo', data: { name: n, presets: mockList() } };
	}, 250);
	PGN.mock('labels.deletePreset', function (a) {
		MINE = MINE.filter(function (p) { return p.name.toLowerCase() !== a.name.toLowerCase(); });
		return { msg: 'Preset removido', data: { presets: mockList() } };
	}, 250);
	PGN.mock('labels.set', function (a) { return { msg: 'Labels atualizados', data: { colors: a.colors, names: a.names } }; }, 600);

	load();
})();
