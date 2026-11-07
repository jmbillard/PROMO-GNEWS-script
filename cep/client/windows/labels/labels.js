/*
---------------------------------------------------------------
> PROMO GNEWS · layer labels window
---------------------------------------------------------------
  host: labels.get → { colors, names, presets } · labels.set { colors, names }
  colors are plain '#RRGGBB' here; the host converts them to the
  4-byte string After Effects keeps in its preferences.
*/
(function () {
	'use strict';

	var h = UI.h;
	var $ = function (id) { return document.getElementById(id); };
	var list = $('list'), strip = $('strip'), note = $('note'), apply = $('apply');
	var S = { colors: [], names: [], saved: null, presets: [] };

	$('apply').insertBefore(UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path(UI.I.check)]), $('apply').firstChild);

	function hex(v) {
		v = String(v || '').trim().replace(/^#/, '').toUpperCase();
		if (/^[0-9A-F]{3}$/.test(v)) v = v.replace(/(.)/g, '$1$1');
		return /^[0-9A-F]{6}$/.test(v) ? '#' + v : null;
	}

	function dirty() {
		if (!S.saved) return false;
		for (var i = 0; i < 16; i++) {
			if (S.colors[i] !== S.saved.colors[i] || S.names[i] !== S.saved.names[i]) return true;
		}
		return false;
	}

	function sync() {
		var d = dirty();
		apply.disabled = !d;
		list.querySelectorAll('.lr').forEach(function (r, i) {
			r.classList.toggle('mod', !!S.saved && (S.colors[i] !== S.saved.colors[i] || S.names[i] !== S.saved.names[i]));
		});
		if (d) note.textContent = 'alterado · aplique para gravar no After Effects';
	}

	function drawStrip() {
		strip.textContent = '';
		S.colors.forEach(function (c, i) { strip.appendChild(h('i', { style: { background: c }, title: (i + 1) + ' · ' + S.names[i] })); });
	}

	function render() {
		list.textContent = '';
		drawStrip();
		S.colors.forEach(function (c, i) {
			var sw = h('i', { style: { background: c } });
			var pick = h('input', { type: 'color', value: c.toLowerCase(), 'aria-label': 'Cor do label ' + (i + 1) });
			var hx = h('input.hx', { type: 'text', value: c, maxlength: 7, 'aria-label': 'Hex do label ' + (i + 1), spellcheck: 'false' });
			var nm = h('input.nm', { type: 'text', value: S.names[i], 'aria-label': 'Nome do label ' + (i + 1), spellcheck: 'false' });
			function setColor(v, from) {
				S.colors[i] = v;
				sw.style.background = v;
				strip.children[i].style.background = v;
				if (from !== 'pick') pick.value = v.toLowerCase();
				if (from !== 'hex') hx.value = v;
				hx.classList.remove('bad');
				sync();
			}
			pick.addEventListener('input', function () { setColor(pick.value.toUpperCase(), 'pick'); });
			hx.addEventListener('input', function () {
				var v = hex(hx.value);
				hx.classList.toggle('bad', !v && hx.value.length >= 4);
				if (v) setColor(v, 'hex');
			});
			hx.addEventListener('blur', function () { hx.value = S.colors[i]; hx.classList.remove('bad'); });
			nm.addEventListener('input', function () { S.names[i] = nm.value; strip.children[i].title = (i + 1) + ' · ' + nm.value; sync(); });
			[hx, nm].forEach(function (el) { el.addEventListener('keydown', function (e) { if (e.key === 'Enter') el.blur(); }); });
			var row = h('div.lr', {
				style: { animationDelay: i * 18 + 'ms' },
				onmouseenter: function () { strip.children[i].classList.add('hot'); },
				onmouseleave: function () { strip.children[i].classList.remove('hot'); }
			}, [h('span.ix', { text: i + 1 }), h('label.sw', { title: 'escolher cor' }, [sw, pick]), nm, hx]);
			list.appendChild(row);
		});
		sync();
	}

	function presets() {
		var box = $('presets');
		box.textContent = '';
		var all = [{ name: 'atual', colors: S.saved.colors, names: S.saved.names }].concat(S.presets);
		all.forEach(function (p) {
			box.appendChild(h('button.chip', {
				title: p.name === 'atual' ? 'voltar para os labels gravados no After Effects' : 'carregar ' + p.name + ' (aplique para gravar)',
				onclick: function () {
					S.colors = p.colors.slice(0);
					S.names = p.names.slice(0);
					render();
					box.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('on', c.textContent === p.name); });
				}
			}, p.name));
		});
		box.firstChild.classList.add('on');
	}

	function load() {
		PGN.run('labels.get', {}).then(function (r) {
			if (!r.ok) { UI.note(note, r.error, false); return; }
			S.saved = { colors: r.data.colors.slice(0), names: r.data.names.slice(0) };
			S.colors = r.data.colors.slice(0);
			S.names = r.data.names.slice(0);
			S.presets = r.data.presets || [];
			presets();
			render();
			note.textContent = '16 labels';
		});
	}

	apply.addEventListener('click', function () {
		apply.disabled = true;
		apply.insertBefore(h('span.pf'), apply.firstChild);
		PGN.run('labels.set', { colors: S.colors, names: S.names }).then(function (r) {
			var pf = apply.querySelector('.pf'); if (pf) pf.remove();
			if (r.ok && r.data) {
				S.saved = { colors: r.data.colors.slice(0), names: r.data.names.slice(0) };
				S.colors = r.data.colors.slice(0);
				S.names = r.data.names.slice(0);
				presets();
				render();
				PGN.notify(r.msg, true, '#ECFF8C');
			} else {
				sync();
			}
			UI.note(note, r.ok ? r.msg : r.error, r.ok, '16 labels');
		});
	});

	// browser preview data
	var PROMO = { name: 'PROMO GNEWS', colors: ['#F13D3B', '#E71363', '#9A28AE', '#643CB3', '#3F51B3', '#2996EF', '#1BA9F1', '#1EBCD3', '#169688', '#4FAF54', '#8CC351', '#CCDA47', '#FDE94C', '#FBBF2B', '#FD9623', '#FB532D'], names: ['red', 'pink', 'purple', 'deep purple', 'indigo', 'blue', 'light blue', 'cyan', 'teal', 'green', 'light green', 'lime', 'yellow', 'amber', 'orange', 'deep orange'] };
	var ADOBE = { name: 'After Effects', colors: ['#B53838', '#E4D84C', '#A9CBC7', '#E5BCC9', '#A9A9CA', '#E7C19E', '#B3C7B3', '#677DE0', '#4AA44C', '#8E2C9A', '#E8920D', '#7F452A', '#F46DD6', '#3DA2A5', '#A89677', '#1E401E'], names: ['Red', 'Yellow', 'Aqua', 'Pink', 'Lavender', 'Peach', 'Sea Foam', 'Blue', 'Green', 'Purple', 'Orange', 'Brown', 'Fuchsia', 'Cyan', 'Sandstone', 'Dark Green'] };
	PGN.mock('labels.get', function () { return { data: { colors: ADOBE.colors, names: ADOBE.names, presets: [PROMO, ADOBE] } }; }, 150);
	PGN.mock('labels.set', function (a) { return { msg: 'Labels atualizados', data: { colors: a.colors, names: a.names } }; }, 600);

	load();
})();
