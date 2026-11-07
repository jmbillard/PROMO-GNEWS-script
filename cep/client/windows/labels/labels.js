/*
---------------------------------------------------------------
> PROMO GNEWS · layer labels window
---------------------------------------------------------------
  host: labels.get → { colors, names, presets } · labels.set { colors, names }
  colors are plain '#RRGGBB' here; the host converts them to the
  4-byte string After Effects keeps in its preferences.

  layout: 16 swatches on top · the selected label (name, hex and the
  color control) below · presets + apply in the footer.
  the color control is a slot (renderPicker) meant for the control
  adapted from O PADEIRO.
*/
(function () {
	'use strict';

	var h = UI.h;
	var $ = function (id) { return document.getElementById(id); };
	var note = $('note'), apply = $('apply');
	var S = { colors: [], names: [], saved: null, presets: [], sel: 0 };

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
		$('swatches').querySelectorAll('.sw').forEach(function (b, i) {
			var m = modified(i);
			any = any || m;
			b.classList.toggle('mod', m);
		});
		apply.disabled = !any;
		if (any) note.textContent = 'alterado · aplique para gravar no After Effects';
	}

	/* ---------- swatches ---------- */

	function swatches() {
		var box = $('swatches');
		box.textContent = '';
		S.colors.forEach(function (c, i) {
			box.appendChild(h('button.sw' + (i === S.sel ? '.on' : ''), {
				role: 'radio', 'aria-checked': String(i === S.sel), 'aria-label': (i + 1) + ' · ' + S.names[i],
				title: (i + 1) + ' · ' + S.names[i] + ' · ' + c,
				style: { background: c, animationDelay: i * 16 + 'ms' },
				onclick: function () { select(i); }
			}));
		});
	}

	function select(i) {
		S.sel = i;
		$('swatches').querySelectorAll('.sw').forEach(function (b, j) {
			b.classList.toggle('on', j === i);
			b.setAttribute('aria-checked', String(j === i));
		});
		editor();
	}

	/* ---------- selected label ---------- */

	function setColor(v, from) {
		var i = S.sel;
		S.colors[i] = v;
		var sw = $('swatches').children[i];
		sw.style.background = v;
		sw.title = (i + 1) + ' · ' + S.names[i] + ' · ' + v;
		if (from !== 'hex') $('edHex').value = v;
		if (from !== 'picker') renderPicker();
		else updatePicker();
		sync();
	}

	function editor() {
		var i = S.sel;
		$('edIx').textContent = i + 1;
		$('edName').value = S.names[i];
		$('edHex').value = S.colors[i];
		$('edHex').classList.remove('bad');
		renderPicker();
	}

	$('edName').addEventListener('input', function () {
		S.names[S.sel] = this.value;
		$('swatches').children[S.sel].title = (S.sel + 1) + ' · ' + this.value + ' · ' + S.colors[S.sel];
		sync();
	});
	$('edHex').addEventListener('input', function () {
		var v = hex(this.value);
		this.classList.toggle('bad', !v && this.value.length >= 4);
		if (v) setColor(v, 'hex');
	});
	$('edHex').addEventListener('blur', function () { this.value = S.colors[S.sel]; this.classList.remove('bad'); });
	[$('edHex'), $('edName')].forEach(function (el) { el.addEventListener('keydown', function (e) { if (e.key === 'Enter') el.blur(); }); });

	/* ---------- color control slot (provisional: system picker) ---------- */

	var pick, big, lbl;
	function renderPicker() {
		var box = $('picker');
		box.textContent = '';
		pick = h('input', { type: 'color', value: S.colors[S.sel].toLowerCase(), 'aria-label': 'Escolher cor' });
		lbl = h('span', { text: 'clique para escolher' });
		big = h('label.big', null, [pick, lbl]);
		pick.addEventListener('input', function () { setColor(pick.value.toUpperCase(), 'picker'); });
		box.appendChild(big);
		updatePicker();
	}
	function updatePicker() {
		big.style.background = S.colors[S.sel];
		lbl.style.color = ink(S.colors[S.sel]);
	}

	/* ---------- presets ---------- */

	function presetsSelect() {
		var sel = $('preset');
		sel.textContent = '';
		sel.appendChild(h('option', { value: '', text: 'carregar preset…' }));
		sel.appendChild(h('option', { value: 'saved', text: 'atual (gravado no After Effects)' }));
		S.presets.forEach(function (p, i) { sel.appendChild(h('option', { value: String(i), text: p.name })); });
	}
	$('preset').addEventListener('change', function () {
		var v = this.value;
		if (!v) return;
		var p = v === 'saved' ? S.saved : S.presets[+v];
		S.colors = p.colors.slice(0);
		S.names = p.names.slice(0);
		swatches();
		editor();
		sync();
		if (v === 'saved') note.textContent = '16 labels';
		this.value = '';
	});

	/* ---------- load / apply ---------- */

	function adopt(d) {
		S.saved = { colors: d.colors.slice(0), names: d.names.slice(0) };
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
	var PROMO = { name: 'PROMO GNEWS', colors: ['#F13D3B', '#E71363', '#9A28AE', '#643CB3', '#3F51B3', '#2996EF', '#1BA9F1', '#1EBCD3', '#169688', '#4FAF54', '#8CC351', '#CCDA47', '#FDE94C', '#FBBF2B', '#FD9623', '#FB532D'], names: ['red', 'pink', 'purple', 'deep purple', 'indigo', 'blue', 'light blue', 'cyan', 'teal', 'green', 'light green', 'lime', 'yellow', 'amber', 'orange', 'deep orange'] };
	var ADOBE = { name: 'After Effects', colors: ['#B53838', '#E4D84C', '#A9CBC7', '#E5BCC9', '#A9A9CA', '#E7C19E', '#B3C7B3', '#677DE0', '#4AA44C', '#8E2C9A', '#E8920D', '#7F452A', '#F46DD6', '#3DA2A5', '#A89677', '#1E401E'], names: ['Red', 'Yellow', 'Aqua', 'Pink', 'Lavender', 'Peach', 'Sea Foam', 'Blue', 'Green', 'Purple', 'Orange', 'Brown', 'Fuchsia', 'Cyan', 'Sandstone', 'Dark Green'] };
	PGN.mock('labels.get', function () { return { data: { colors: PROMO.colors, names: PROMO.names, presets: [PROMO, ADOBE] } }; }, 150);
	PGN.mock('labels.set', function (a) { return { msg: 'Labels atualizados', data: { colors: a.colors, names: a.names } }; }, 600);

	load();
})();
