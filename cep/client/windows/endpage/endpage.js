/*
---------------------------------------------------------------
> PROMO GNEWS · end page presets window
---------------------------------------------------------------
  host: endp.state · endp.read · endp.apply { preset, livre } · endp.load { path }
        endp.save { name, preset } · endp.openFolder
  preset keys: layout_end_page · servico_end_page · aparencia_end_page
  (the same JSON the classic dialog saved, so old presets keep working)
*/
(function () {
	'use strict';

	var h = UI.h, I = UI.I;
	var $ = function (id) { return document.getElementById(id); };
	var ACC = '#ECFF8C';
	var form = $('form'), note = $('note'), preview = $('preview');
	var S = { cur: null, livre: '', opt: null, presets: [], target: null, mode: UI.store('endp.mode') || 'simple', busy: false };

	var NO = '-------';
	var COLOR_KEYS = [['logo', 'logo'], ['titulo', 'título'], ['subtitulo', 'subtítulo'], ['apoio', 'apoio'], ['horario', 'horário'], ['horario_base', 'horário base'], ['footage', 'footage'], ['pattern', 'pattern'], ['fundo', 'fundo']];
	// approximate theme colors, only for the schematic preview (the template computes the real ones)
	var THEMES = {
		1: { name: 'claro', fundo: '#F2F2F2', titulo: '#141414', subtitulo: '#4A4A4A', horario_base: '#E53131', horario: '#F2F2F2', logo: '#E53131', pattern: '#141414', footage: '#141414' },
		2: { name: 'cinza', fundo: '#4A4A4A', titulo: '#F2F2F2', subtitulo: '#B2B2B2', horario_base: '#ECFF8C', horario: '#141414', logo: '#F2F2F2', pattern: '#F2F2F2', footage: '#F2F2F2' },
		3: { name: 'escuro', fundo: '#141414', titulo: '#F2F2F2', subtitulo: '#B2B2B2', horario_base: '#E53131', horario: '#F2F2F2', logo: '#E53131', pattern: '#F2F2F2', footage: '#F2F2F2' },
		4: { name: 'vermelho', fundo: '#E53131', titulo: '#F2F2F2', subtitulo: '#F2F2F2', horario_base: '#ECFF8C', horario: '#141414', logo: '#141414', pattern: '#141414', footage: '#141414' },
		5: { name: 'livre' }
	};
	var WEEK = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO', 'HOJE'];
	var MONTH = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];

	UI.add($('read'), UI.icon(I.refresh));
	UI.add($('folder'), UI.icon(I.folder, I.folderOpen, 'lift'));
	UI.add($('save'), UI.icon('M5 4h11l3 3v13H5z', 'M8 20v-6h8v6M8 4v4h6'));
	$('apply').insertBefore(UI.svg('0 0 24 24', { 'aria-hidden': 'true' }, [UI.path(I.check)]), $('apply').firstChild);

	function L() { return S.cur.layout_end_page; }
	function V() { return S.cur.servico_end_page; }
	function A() { return S.cur.aparencia_end_page; }

	/* ---------- preview ---------- */

	function hhmm(v) {
		var hh = v.hora == null ? 0 : v.hora, mm = v.min == null ? 0 : v.min;
		return hh + 'H' + (mm ? (mm < 10 ? '0' : '') + mm : '');
	}

	function dateLine() {
		var v = V(), f = +v.formato;
		var wk = WEEK[(v.semana || 1) - 1] || '', mo = MONTH[(v.mes || 1) - 1] || '';
		var when = v.a_partir_das ? 'A PARTIR DAS ' + hhmm(v) : hhmm(v);
		if (f === 1) return S.livre || 'TEXTO LIVRE';
		if (f === 2) return (v.a_partir_das ? '' : v.dia + ' ' + mo + ' — ') + when;
		if (f === 3) return (v.a_partir_das ? '' : 'DIA ' + v.dia + ' — ') + when;
		if (f === 4) return (v.a_partir_das ? '' : wk + ' — ') + when;
		if (f === 5) return (v.a_partir_das ? '' : 'MAIS TARDE — ') + when;
		if (f === 6) return (v.a_partir_das ? '' : (+v.semana === 8 ? 'DE SEGUNDA A SEXTA' : 'TODA ' + wk) + ' — ') + when;
		if (f === 7) return 'EM ' + mo;
		return '';
	}

	function drawPreview() {
		if (!S.cur) return;
		var a = A(), l = L(), v = V();
		var th = THEMES[a.tema] || THEMES[4];
		var col = function (k) { return +a.tema === 5 ? a[k] : (th[k] || a[k]); };
		COLOR_KEYS.forEach(function (c) { preview.style.setProperty('--p-' + c[0], col(c[0])); });
		var modelo = +l.modelo;
		var foto = l.foto && modelo !== 3;
		preview.classList.toggle('nofoto', !foto && !(l.footage && modelo !== 2));
		preview.classList.toggle('nobg', l.fundo === false);   // no background: alpha
		preview.textContent = '';
		UI.add(preview, [
			l.pattern && modelo !== 3 ? h('div.pv-pat') : null,
			// as in the real end page: the footage is the dark rectangle on the right,
			// the photo a light square on top of it
			// (it is a cutout in the background, so without 'fundo' there is nothing to draw)
			l.footage && modelo !== 2 && l.fundo !== false ? h('div.pv-foot') : null,
			foto ? h('div.pv-foto') : null,
			h('div.pv-logo'),
			h('div.pv-txt', null, [
				h('div.pv-t', { text: v.titulo || '' }),
				l.subtitulo ? h('div.pv-s', { text: v.subtitulo || '' }) : null,
				h('div.pv-h', { text: dateLine() })
			]),
			h('span.pv-tag', { text: (['', 'livre', 'programa', 'jornal'][modelo] || '') + ' · ' + (th.name || '') })
		]);
	}

	/* ---------- controls ---------- */

	function field(label, ctrl, extra) { return h('div.f', extra, [h('label', { text: label }), ctrl]); }

	function select(list, value, onPick, aria) {
		var s = h('select.fld', { 'aria-label': aria });
		list.forEach(function (o) {
			var val = typeof o === 'object' ? o.value : o, name = typeof o === 'object' ? o.name : o;
			var op = h('option', { value: String(val), text: name });
			if (String(val) === String(value)) op.selected = true;
			s.appendChild(op);
		});
		s.addEventListener('change', function () { onPick(s.value); });
		return h('div.sel-wrap.grow', null, s);
	}

	function toggle(label, get, set) {
		var b = h('button.tg' + (get() ? '.on' : ''), { 'aria-pressed': String(!!get()) }, [h('i'), label]);
		b.addEventListener('click', function () { set(!get()); b.classList.toggle('on', !!get()); b.setAttribute('aria-pressed', String(!!get())); changed(); });
		return b;
	}

	function num(label, get, set, min, max) {
		var input = h('input', { type: 'text', inputmode: 'numeric', value: String(get()), 'aria-label': label });
		function put(v) {
			v = Math.max(min, Math.min(max, parseInt(v, 10) || 0));
			set(v); input.value = String(v); changed(true);
		}
		input.addEventListener('change', function () { put(input.value); });
		input.addEventListener('wheel', function (e) { e.preventDefault(); put(get() + (e.deltaY < 0 ? 1 : -1)); });
		return h('span.num', null, [
			h('button', { 'aria-label': 'menos', onclick: function () { put(get() - 1); } }, '−'),
			input,
			h('button', { 'aria-label': 'mais', onclick: function () { put(get() + 1); } }, '+')
		]);
	}

	function seg(options, value, onPick, aria) {
		var wrap = h('div.seg', { role: 'radiogroup', 'aria-label': aria });
		var ind = h('span.ind');
		wrap.appendChild(ind);
		var btns = options.map(function (o) {
			var b = h('button' + (String(o.value) === String(value) ? '.on' : ''), { role: 'radio', text: o.name });
			b.addEventListener('click', function () {
				btns.forEach(function (x) { x.classList.toggle('on', x === b); });
				moveInd(ind, b);
				onPick(o.value);
			});
			wrap.appendChild(b);
			return b;
		});
		requestAnimationFrame(function () { moveInd(ind, btns.filter(function (b) { return b.classList.contains('on'); })[0] || btns[0]); });
		return wrap;
	}

	function moveInd(ind, b) { if (b) { ind.style.left = b.offsetLeft + 'px'; ind.style.width = b.offsetWidth + 'px'; } }

	function section(label, kids, delay) {
		return h('div.sec', { style: { animationDelay: delay + 'ms' } }, [h('div.slbl', { text: label }), h('div.card', null, kids)]);
	}

	/* ---------- form ---------- */

	function build() {
		form.textContent = '';
		if (!S.cur) return;
		var l = L(), v = V(), a = A(), o = S.opt || {};

		// título / subtítulo stay visible in both modes (they change every time)
		var titulo = h('textarea.fld', { 'aria-label': 'Título', spellcheck: 'false' });
		titulo.value = v.titulo || '';
		titulo.addEventListener('input', function () { v.titulo = titulo.value; grow(titulo, true); changed(true); });
		requestAnimationFrame(function () { grow(titulo, false); });
		var sub = h('input.fld', { type: 'text', value: v.subtitulo || '', 'aria-label': 'Subtítulo', spellcheck: 'false' });
		sub.addEventListener('input', function () { v.subtitulo = sub.value; changed(true); });
		var subRow = field('subtítulo', sub, l.subtitulo ? null : { class: 'f off' });

		var parts = [section('textos', [field('título', titulo), subRow], 0)];

		if (S.mode === 'extended') {
			// ----- layout -----
			var fotoSel = field('foto', select(o.fotos || [NO], l.foto_layer, function (x) { l.foto_layer = x; changed(); }, 'Layer da foto'), l.foto ? null : { class: 'f off' });
			var patSel = field('pattern', select(o.patterns || [NO], l.pattern_layer, function (x) { l.pattern_layer = x; changed(); }, 'Layer do pattern'), l.pattern ? null : { class: 'f off' });
			parts.push(section('layout', [
				seg(o.modelos || [{ value: 1, name: 'livre' }, { value: 2, name: 'programa' }, { value: 3, name: 'jornal' }], l.modelo, function (x) { l.modelo = +x; changed(); }, 'Modelo'),
				h('div.chips.fill', null, [
					toggle('subtítulo', function () { return l.subtitulo; }, function (x) { l.subtitulo = x; subRow.classList.toggle('off', !x); }),
					toggle('foto', function () { return l.foto; }, function (x) { l.foto = x; fotoSel.classList.toggle('off', !x); }),
					toggle('footage', function () { return l.footage; }, function (x) { l.footage = x; }),
					toggle('pattern', function () { return l.pattern; }, function (x) { l.pattern = x; patSel.classList.toggle('off', !x); }),
					// off: the end page has no background (alpha)
					toggle('fundo', function () { return l.fundo !== false; }, function (x) { l.fundo = x; })
				]),
				fotoSel, patSel
			], 40));

			// ----- serviço -----
			var f = +v.formato;
			var livre = h('input.fld', { type: 'text', value: S.livre || '', placeholder: 'DIGITE O TEXTO', 'aria-label': 'Texto livre', spellcheck: 'false' });
			livre.addEventListener('input', function () { S.livre = livre.value; changed(true); });
			var showSemana = f === 4 || f === 6, showMes = f === 2 || f === 7, showNums = f >= 2 && f <= 6;
			var nums = h('div.nums', null, [
				h('span.nl', { text: 'dia' }), wrapOff(num('dia', function () { return +v.dia || 1; }, function (x) { v.dia = x; }, 1, 31), f === 2 || f === 3),
				h('span.nl', { text: 'hora' }), num('hora', function () { return +v.hora || 0; }, function (x) { v.hora = x; }, 0, 23),
				h('span.nl', { text: 'min' }), num('min', function () { return +v.min || 0; }, function (x) { v.min = x; }, 0, 59)
			]);
			parts.push(section('serviço', [
				field('formato', select(o.formatos || [], v.formato, function (x) { v.formato = +x; build(); changed(); }, 'Formato')),
				f === 1 ? field('texto', livre) : null,
				showSemana ? field('semana', select(o.semanas || WEEK.map(function (n, i) { return { value: i + 1, name: n }; }), v.semana, function (x) { v.semana = +x; changed(); }, 'Dia da semana')) : null,
				showMes ? field('mês', select(o.meses || MONTH.map(function (n, i) { return { value: i + 1, name: n }; }), v.mes, function (x) { v.mes = +x; changed(); }, 'Mês')) : null,
				showNums ? nums : null,
				showNums ? h('div.chips', null, [toggle('a partir das', function () { return !!v.a_partir_das; }, function (x) { v.a_partir_das = x; })]) : null
			], 80));

			// ----- aparência -----
			var colors = h('div.colors' + (+a.tema === 5 ? '' : '.dim'));
			COLOR_KEYS.forEach(function (c) {
				var inp = h('input', { type: 'color', value: a[c[0]] || '#000000', 'aria-label': 'cor ' + c[1] });
				inp.addEventListener('input', function () { a[c[0]] = inp.value.toUpperCase(); changed(true); });
				colors.appendChild(h('label.cl', null, [inp, h('span', { text: c[1] })]));
			});
			var themes = h('div.themes');
			[1, 2, 3, 4, 5].forEach(function (t) {
				var th = THEMES[t];
				var b = h('button.th' + (t === 5 ? '.free' : '') + (+a.tema === t ? '.on' : ''), {
					title: th.name, 'aria-label': 'tema ' + th.name, 'aria-pressed': String(+a.tema === t),
					style: t === 5 ? null : { background: 'linear-gradient(135deg, ' + th.fundo + ' 55%, ' + th.horario_base + ' 55%)' },
					onclick: function () {
						a.tema = t;
						themes.querySelectorAll('.th').forEach(function (x) { x.classList.toggle('on', x === b); });
						colors.classList.toggle('dim', t !== 5);
						changed();
					}
				}, t === 5
					? [h('b.dots', null, [h('i', { style: { background: '#E53131' } }), h('i', { style: { background: '#ECFF8C' } }), h('i', { style: { background: '#F2F2F2' } })]), h('span', { text: th.name })]
					: h('span', { text: th.name }));
				themes.appendChild(b);
			});
			parts.push(section('aparência', [themes, colors], 120));
		}
		UI.add(form, parts);
	}

	// textarea that grows with its lines; the height change is animated so
	// everything below slides down (or up) smoothly instead of jumping
	var GROW_MIN = 52, GROW_MAX = 168;
	function grow(ta, animate) {
		var from = ta.offsetHeight;
		ta.style.transition = 'none';
		ta.style.height = 'auto';
		var to = Math.max(GROW_MIN, Math.min(GROW_MAX, ta.scrollHeight + 2));
		ta.style.overflowY = ta.scrollHeight + 2 > GROW_MAX ? 'auto' : 'hidden';
		ta.style.height = from + 'px';
		void ta.offsetHeight; // commit the start height before animating
		ta.style.transition = animate ? 'height .28s cubic-bezier(.3, 1.15, .45, 1)' : 'none';
		ta.style.height = to + 'px';
	}

	function wrapOff(el, on) { if (!on) el.style.opacity = '.35'; return el; }

	var dirty = false;
	function changed() {
		dirty = true;
		drawPreview();
		note.textContent = 'alterado · aplique para gravar na comp';
	}

	/* ---------- mode ---------- */

	var modeSeg = $('mode'), modeInd = modeSeg.querySelector('.ind');
	modeSeg.querySelectorAll('button').forEach(function (b) {
		b.classList.toggle('on', b.dataset.m === S.mode);
		b.setAttribute('aria-checked', String(b.dataset.m === S.mode));
		b.addEventListener('click', function () {
			S.mode = b.dataset.m;
			UI.store('endp.mode', S.mode);
			modeSeg.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', String(x === b)); });
			moveInd(modeInd, b);
			build();
		});
	});
	requestAnimationFrame(function () { moveInd(modeInd, modeSeg.querySelector('button.on')); });

	/* ---------- data ---------- */

	function setTarget(t) {
		S.target = t;
		$('target').textContent = t || 'nenhuma end page selecionada';
		$('apply').disabled = !t;
	}

	function presetsSelect() {
		var sel = $('preset');
		sel.textContent = '';
		sel.appendChild(h('option', { value: '', text: S.presets.length ? 'escolher preset…' : 'nenhum preset salvo' }));
		S.presets.forEach(function (p) { sel.appendChild(h('option', { value: p.path, text: p.name })); });
	}

	function adopt(d) {
		if (!d) return;   // an answer without data changes nothing
		if (d.current) S.cur = d.current;
		if (d.livre != null) S.livre = d.livre;
		if (d.options) S.opt = d.options;
		if (d.presets) { S.presets = d.presets; presetsSelect(); }
		if (d.target !== undefined) setTarget(d.target);
		dirty = false;
		build();
		drawPreview();
	}

	function msg(r) {
		UI.note(note, r.ok ? r.msg : r.error, r.ok);
		if (r.ok && r.msg) PGN.notify(r.msg, true, ACC);
	}

	function load() {
		PGN.run('endp.state', {}).then(function (r) {
			if (!r.ok) { UI.failState($('form'), r.error, load); UI.note(note, r.error, false); return; }
			adopt(r.data);
			// the folder button tells where the presets live
			$('folder').title = 'abrir pasta de presets' + (r.data && r.data.folder ? '\n' + r.data.folder : '') + (r.data && r.data.local ? '\n(só neste computador: rede fora ou home office)' : '');
			$('folder').removeAttribute('data-tip');
		});
	}

	$('preset').addEventListener('change', function () {
		if (!this.value) return;
		PGN.run('endp.load', { path: this.value }).then(function (r) {
			if (r.ok && r.data && r.data.current) { adopt({ current: r.data.current }); changed(); note.textContent = 'preset ' + r.data.name + ' carregado · aplique para gravar'; }
			else if (r.ok) UI.note(note, 'preset sem dados', false);
			else msg(r);
		});
	});

	$('read').addEventListener('click', function () {
		var svg = this.querySelector('svg');
		svg.classList.remove('go'); void svg.getBoundingClientRect(); svg.classList.add('go');
		PGN.run('endp.read', {}).then(function (r) { if (r.ok) adopt(r.data); msg(r); });
	});

	$('folder').addEventListener('click', function () { PGN.run('endp.openFolder', {}).then(msg); });

	$('save').addEventListener('click', function () {
		var name = (V().titulo || 'preset').replace(/\s+/g, ' ').trim().toLowerCase();
		PGN.run('endp.save', { name: name, preset: S.cur }).then(function (r) {
			if (r.ok && r.data && r.data.presets) { S.presets = r.data.presets; presetsSelect(); $('preset').value = r.data.path || ''; }
			// saved on this computer only (network templates folder away): shown as a warning
			if (r.ok && r.data && r.data.local) { UI.note(note, r.msg, false); return; }
			msg(r);
		});
	});

	$('apply').addEventListener('click', function () {
		if (S.busy) return;
		S.busy = true;
		var btn = this;
		btn.disabled = true;
		btn.insertBefore(h('span.pf'), btn.firstChild);
		PGN.run('endp.apply', { preset: S.cur, livre: S.livre }).then(function (r) {
			S.busy = false;
			btn.disabled = false;
			var pf = btn.querySelector('.pf'); if (pf) pf.remove();
			if (r.ok && r.data) adopt(r.data);
			msg(r);
		});
	});

	// browser preview data
	PGN.mock('endp.state', function () {
		return { data: {
			presets: [{ name: 'jornal das dez', path: '/p/jdd.json' }, { name: 'estúdio i', path: '/p/ei.json' }],
			target: 'comp_end page JDD', livre: 'DIGITE O TEXTO',
			current: {
				layout_end_page: { modelo: 2, subtitulo: true, foto: true, footage: true, pattern: true, fundo: true, foto_layer: 'apresentador', pattern_layer: NO },
				servico_end_page: { titulo: 'Jornal\nDas Dez', subtitulo: 'COM RENATA LO PRETE', formato: 4, semana: 2, mes: 1, dia: 10, hora: 22, min: 0, a_partir_das: false },
				aparencia_end_page: { tema: 4, logo: '#141414', titulo: '#F2F2F2', subtitulo: '#F2F2F2', apoio: '#F2F2F2', horario: '#141414', horario_base: '#ECFF8C', footage: '#141414', pattern: '#141414', fundo: '#E53131' }
			},
			options: {
				modelos: [{ value: 1, name: 'livre' }, { value: 2, name: 'programa' }, { value: 3, name: 'jornal' }],
				fotos: [NO, 'apresentador', 'convidado'], patterns: [NO, 'pattern 1', 'pattern 2'],
				formatos: [{ value: 1, name: '- formato livre -' }, { value: 2, name: '[dia]  [mes]  —  [hora]  [min]' }, { value: 3, name: 'DIA  [dia]  —  [hora]  [min]' }, { value: 4, name: '[semana]  —  [hora]  [min]' }, { value: 5, name: 'MAIS  TARDE  —  [hora]  [min]' }, { value: 6, name: 'TODA  [semana]  —  [hora]  [min]' }, { value: 7, name: 'EM  [mes]' }]
			}
		} };
	}, 200);
	PGN.mock('endp.apply', function () { return { msg: 'end page atualizada' }; }, 700);

	load();
})();
