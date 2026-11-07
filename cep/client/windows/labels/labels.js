/*
---------------------------------------------------------------
> PROMO GNEWS · layer labels window
---------------------------------------------------------------
  host: labels.get → { colors, names, presets } · labels.set { colors, names }
  colors are plain '#RRGGBB' here; the host converts them to the
  4-byte string After Effects keeps in its preferences.

  layout: 16 swatches on top · the selected label (name, hex and the
  color control) below · presets + apply in the footer.
  the color control is adapted from O PADEIRO (aparência): hue and
  saturation on a square wheel, brightness on a slider.
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
		if (from !== 'picker') { hueMem[S.sel] = null; satMem[S.sel] = null; }
		updatePicker();
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

	/* ---------- color control (adapted from O PADEIRO · aparência) ----------
	   the tile: hue is the angle around the center (0° on top = red, clockwise),
	   saturation is the distance from the center measured "square" (the larger of
	   x and y), so the whole edge, corners included, is full saturation.
	   brightness has its own slider. CEP doesn't deliver pointer events: mouse events. */

	var SPAN = 40; // center → where the dot touches the edge of the inner tile
	var hueMem = {}, satMem = {};

	function hexToHsv(hex) {
		var r = parseInt(hex.substr(1, 2), 16) / 255, g = parseInt(hex.substr(3, 2), 16) / 255, b = parseInt(hex.substr(5, 2), 16) / 255;
		var max = Math.max(r, g, b), d = max - Math.min(r, g, b), hh = 0;
		if (d) {
			if (max === r) hh = ((g - b) / d) % 6;
			else if (max === g) hh = (b - r) / d + 2;
			else hh = (r - g) / d + 4;
			hh = (hh * 60 + 360) % 360;
		}
		return { h: hh, s: max ? d / max * 100 : 0, v: max * 100 };
	}

	function hsvToHex(hh, sat, val) {
		var s = sat / 100, v = val / 100, c = v * s, x = c * (1 - Math.abs(((hh / 60) % 2) - 1)), m = v - c, rgb;
		if (hh < 60) rgb = [c, x, 0];
		else if (hh < 120) rgb = [x, c, 0];
		else if (hh < 180) rgb = [0, c, x];
		else if (hh < 240) rgb = [0, x, c];
		else if (hh < 300) rgb = [x, 0, c];
		else rgb = [c, 0, x];
		return '#' + rgb.map(function (n) { var t = Math.round((n + m) * 255); return (t < 16 ? '0' : '') + t.toString(16); }).join('').toUpperCase();
	}

	// grey / black colors have no hue (or saturation): keep the last one per label
	function hueOf(i) {
		var hsv = hexToHsv(S.colors[i]);
		if (hsv.s > 0 && hsv.v > 0) hueMem[i] = hsv.h;
		return hueMem[i] != null ? hueMem[i] : hsv.h;
	}
	function satOf(i) {
		var hsv = hexToHsv(S.colors[i]);
		if (hsv.v > 0) satMem[i] = hsv.s;
		return satMem[i] != null ? satMem[i] : hsv.s;
	}

	var tile, dot, bright, brightVal, was, now;

	function renderPicker() {
		var box = $('picker');
		box.textContent = '';
		dot = h('span.pk-dot');
		tile = h('div.pk-tile', { title: 'arraste para escolher matiz e saturação' }, [dot]);
		bright = h('input.pk-range', { type: 'range', min: 0, max: 100, step: 1, 'aria-label': 'Brilho' });
		brightVal = h('span.pk-val.mono');
		was = h('button.pk-was', { title: 'voltar para a cor gravada', 'aria-label': 'Voltar para a cor gravada' });
		now = h('i.pk-now');
		box.appendChild(tile);
		box.appendChild(h('div.pk-side', null, [
			h('div.pk-cmp', null, [was, now]),
			h('label.pk-row', null, [h('span', { text: 'brilho' }), brightVal]),
			bright
		]));
		bright.addEventListener('input', function () {
			setColor(hsvToHex(hueOf(S.sel), satOf(S.sel), +bright.value), 'picker');
		});
		was.addEventListener('click', function () { if (S.saved) setColor(S.saved.colors[S.sel], 'revert'); });
		bindDrag();
		updatePicker();
	}

	function placeDot(hh, sat) {
		var a = hh * Math.PI / 180, sx = Math.sin(a), sy = -Math.cos(a);
		var k = SPAN * Math.max(0, Math.min(100, sat)) / 100 / Math.max(Math.abs(sx), Math.abs(sy), 1e-6);
		dot.style.left = 'calc(50% + ' + (k * sx).toFixed(1) + 'px)';
		dot.style.top = 'calc(50% + ' + (k * sy).toFixed(1) + 'px)';
	}

	function updatePicker() {
		var i = S.sel, c = S.colors[i], hsv = hexToHsv(c), hh = hueOf(i);
		dot.style.background = c;
		placeDot(hh, satOf(i));
		if (document.activeElement !== bright) bright.value = Math.round(hsv.v);
		brightVal.textContent = Math.round(hsv.v);
		bright.style.setProperty('--track', 'linear-gradient(to right, #000, ' + hsvToHex(hh, satOf(i), 100) + ')');
		// the inner wheel at the current brightness: hues around, grey in the middle
		var stops = [];
		for (var a = 0; a <= 360; a += 30) stops.push(hsvToHex(a % 360, 100, hsv.v));
		var gray = hsvToHex(0, 0, hsv.v), gv = parseInt(gray.substr(1, 2), 16);
		tile.style.setProperty('--wheel', 'radial-gradient(circle at center, ' + gray + ' 0, ' + gray + ' 6%, rgba(' + gv + ',' + gv + ',' + gv + ',0) 72%), conic-gradient(' + stops.join(', ') + ')');
		if (S.saved) { was.style.background = S.saved.colors[i]; was.style.setProperty('--ink', ink(S.saved.colors[i])); }
		now.style.background = c;
		was.classList.toggle('same', !S.saved || S.saved.colors[i] === c);
	}

	function bindDrag() {
		var drag = false;
		function at(e) {
			var b = tile.getBoundingClientRect();
			var dx = Math.max(-SPAN, Math.min(SPAN, e.clientX - (b.left + b.width / 2)));
			var dy = Math.max(-SPAN, Math.min(SPAN, e.clientY - (b.top + b.height / 2)));
			return { h: dx || dy ? (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360 : null, s: Math.max(Math.abs(dx), Math.abs(dy)) / SPAN * 100 };
		}
		function apply(e) {
			var i = S.sel, hsv = hexToHsv(S.colors[i]), p = at(e);
			var hh = p.h == null ? hueOf(i) : p.h;
			hueMem[i] = hh;
			satMem[i] = p.s;
			// no brightness = no color: bring some back
			setColor(hsvToHex(hh, p.s, hsv.v < 8 ? 80 : hsv.v), 'picker');
		}
		function move(e) { if (drag) apply(e); }
		function up() {
			drag = false;
			tile.classList.remove('drag');
			document.removeEventListener('mousemove', move);
			document.removeEventListener('mouseup', up);
		}
		tile.addEventListener('mousedown', function (e) {
			if (e.button !== 0) return;
			e.preventDefault();
			drag = true;
			tile.classList.add('drag');
			document.addEventListener('mousemove', move);
			document.addEventListener('mouseup', up);
			apply(e);
		});
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
