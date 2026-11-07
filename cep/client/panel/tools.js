/*
---------------------------------------------------------------
> PROMO GNEWS · tool registry (panel)
---------------------------------------------------------------
  ids match PGN.register(...) in host/tools/*.jsx
  sel: 'comp' → needs an active comp · 'layers' → needs selected layers (min)
*/
(function () {
	'use strict';

	var F = 'M3 7v11h18V9h-9l-2-2z';

	function T(id, name, anim, d, a, extra) {
		var t = { id: id, name: name, anim: anim, d: d, a: a };
		return Object.assign(t, extra || {});
	}
	function G(id, name, glyph, extra) {
		return Object.assign({ id: id, name: name, glyph: glyph, anim: 'pop' }, extra || {});
	}
	function S(hex) {
		return { id: 'color:' + hex, hostId: 'color', name: hex, hex: hex, swatch: true, sel: 'layers', args: function () { return { hex: hex }; } };
	}
	function P(key) {
		// value of an inline parameter (right-click stepper)
		return function () { var o = {}; o[key] = PARAMS[key].get(); return o; };
	}

	var COMP = { sel: 'comp' }, LAY = { sel: 'layers' };

	window.PARAMS = {
		frames: { name: 'frames', def: 30, min: 1, max: 600, step: 1, unit: 'f' },
		chars: { name: 'caracteres', def: 60, min: 5, max: 200, step: 1, unit: 'ch' }
	};
	Object.keys(PARAMS).forEach(function (k) {
		var p = PARAMS[k];
		p.key = k;
		p.get = function () { var v = UI.store('param.' + k); return v == null ? p.def : v; };
		p.set = function (v) { return UI.store('param.' + k, Math.max(p.min, Math.min(p.max, Math.round(v)))); };
	});

	window.SECTIONS = [
		{
			id: 'ctrl', name: 'Controles', acc: '#DA6877', d: 'M5 5h14v14H5z', a: 'M12 9v6M9 12h6',
			groups: [
				[
					T('null', 'Null parent', 'spin', 'M5 5h14v14H5z', 'M12 8.5v7M8.5 12h7', Object.assign({ args: function (s) { return { keys: !!s.toggles.keys, exp: !!s.toggles.exp }; } }, COMP)),
					T('nullc', 'Null centralizado', 'pulse', 'M4 4h16v16H4z', 'M12 10a2 2 0 1 0 0 4a2 2 0 1 0 0-4', { sel: 'layers', min: 2 }),
					T('parent', 'Selecionar parent', 'up', 'M5 15h4v4H5zM15 15h4v4h-4zM7 15v-2h10v2M12 13v-3', 'M9 4h6v6H9z', COMP),
					T('child', 'Selecionar children', 'down', 'M9 4h6v6H9zM12 10v3M7 15v-2h10v2', 'M5 15h4v4H5zM15 15h4v4h-4z', COMP)
				],
				[
					T('tg.keys', 'Null: copiar animação', 'pop', 'M12 5l7 7-7 7-7-7z', '', { toggle: 'keys' }),
					T('tg.exp', 'Null: copiar expressões', 'pop', 'M9 5c-2 0-2 1.5-2 3.5S5 12 5 12s2 0 2 3.5S7 19 9 19M15 5c2 0 2 1.5 2 3.5s2 3.5 2 3.5-2 0-2 3.5-0 3.5-2 3.5', '', { toggle: 'exp' })
				]
			]
		},
		{
			id: 'anim', name: 'Animação', acc: '#B7B5E4', d: 'M4 20h16', a: 'M4 18C10 18 11 6 20 6',
			groups: [
				[
					T('inf', 'Influência dos keyframes', 'draw', 'M4 20h16', 'M4 18C10 18 11 6 20 6', { win: 'curves' }),
					T('lock', 'Travar transformações', 'lift', 'M6 11h12v9H6z', 'M9 11V8a3 3 0 0 1 6 0v3', LAY),
					T('rand', 'Randomizar layers', 'shake', 'M4 4h16v16H4z', 'M9 9h.01M15 15h.01M15 9h.01M9 15h.01M12 12h.01', { sel: 'layers', min: 2, param: 'frames', args: P('frames') }),
					T('seq', 'Sequenciar layers', 'slide', 'M4 6h7', 'M7 12h9M10 18h10', { sel: 'layers', min: 2, param: 'frames', args: P('frames') })
				],
				[
					T('cols', 'Guia de colunas', 'grow', 'M4 4h16v16H4z', 'M9 6v12M15 6v12', COMP),
					T('arrow', 'Seta', 'diag', 'M5 19L19 5', 'M10 5h9v9', COMP),
					T('count', 'Contador', 'blink', 'M3 7h18v10H3z', 'M8 10v4M12 10v4M16 10v4', COMP),
					T('type', 'Typewriter', 'blink', 'M5 6h10M10 6v12', 'M18 13v6', COMP),
					T('words', 'Palavras', 'slide', 'M4 8h6M4 12h10M4 16h4', 'M12 8h8M10 16h10', COMP),
					T('box', 'Tarja simples', 'wipe', 'M3 9h18v6H3z', 'M6 12h10', COMP),
					T('wig', 'Wig', 'wiggle', 'M3 19h18', 'M3 12c2-4 4 4 6 0s4 4 6 0 4 4 6 0', LAY),
					T('ik', 'IK simples (3 layers em ordem)', 'swing', 'M4 20h6', 'M7 20l4-8 7-3M11 12h.01M18 9h.01', { sel: 'layers', min: 3 })
				]
			]
		},
		{
			id: 'fx', name: 'Efeitos', acc: '#ACCDEC', d: 'M12 3v4M12 17v4M3 12h4M17 12h4', a: 'M12 9l1.2 1.8L15 12l-1.8 1.2L12 15l-1.2-1.8L9 12l1.8-1.2z',
			groups: [
				[
					T('adj', 'Adjustment layer', 'draw', 'M4 4h16v16H4z', 'M4 20L20 4', COMP),
					T('curves', 'Curves', 'draw', 'M4 20h16M4 20V4', 'M4 20C11 20 12 4 20 4', LAY),
					T('levels', 'Levels', 'grow', 'M4 20h16', 'M7 18v-5M11 18V7M15 18v-8M19 18v-3', LAY),
					T('lumetri', 'Lumetri Color', 'spin', 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18', 'M12 12V5M12 12l5 5', LAY)
				],
				[
					T('gauss', 'Gaussian Blur', 'pulse', 'M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z', 'M9.5 14a2.5 2.5 0 0 0 2.5 2.5', LAY),
					T('compound', 'Compound Blur', 'slide', 'M9 6a6 6 0 1 0 0 12a6 6 0 1 0 0-12', 'M15 6a6 6 0 1 0 0 12a6 6 0 1 0 0-12', LAY),
					T('lens', 'Lens Blur', 'spin', 'M12 4a8 8 0 1 0 0 16a8 8 0 1 0 0-16', 'M12 4l3 8M20 12l-8 3M12 20l-3-8M4 12l8-3', LAY)
				],
				[
					T('fill', 'Fill', 'pop', 'M5 11l6-6 7 7-6 6z', 'M19 15c1 1.5 1.5 2.3 1.5 3a1.5 1.5 0 0 1-3 0c0-.7.5-1.5 1.5-3z', LAY),
					T('3d', '3D Glasses', 'slide', 'M3 10h18M6 10v5h5v-5', 'M13 10v5h5v-5', LAY),
					T('fractal', 'Fractal Noise', 'wiggle', 'M4 4h16v16H4z', 'M4 14c3-3 5 2 8-1s5-4 8-1', LAY),
					T('grain', 'Add Grain', 'blink', 'M4 4h16v16H4z', 'M8 8h.01M12 10h.01M16 8h.01M9 14h.01M15 13h.01M12 17h.01M7 18h.01M17 17h.01', LAY)
				]
			]
		},
		{
			id: 'txt', name: 'Texto', acc: '#F4E76E', d: 'M5 6h14M12 6v13', a: 'M9 19h6',
			groups: [
				[G('up', 'Caixa alta', 'AA', LAY), G('low', 'Caixa baixa', 'aa', LAY), G('tit', 'Title case', 'Aa', LAY)],
				[
					T('clean', 'Limpar espaços e quebras', 'pop', 'M4 7h16M4 12h10M4 17h7', 'M15 15l5 5M20 15l-5 5', LAY),
					T('split', 'Separar colunas', 'slide', 'M4 6h6M4 10h6M4 14h6M4 18h6', 'M14 6h6M14 10h6M14 14h6M14 18h6', LAY),
					T('brk', 'Quebrar linhas', 'slide', 'M19 5v7a3 3 0 0 1-3 3H6', 'M9 11l-4 4 4 4', { sel: 'layers', param: 'chars', args: P('chars') })
				]
			]
		},
		{
			id: 'brand', name: 'Marca', acc: '#BBBBBD', d: 'M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5 1-1.5 2-1.5h2a4 4 0 0 0 4-4c0-4.5-4-8-9-8z', a: 'M8 10h.01M12 7h.01M16 10h.01',
			groups: [
				[
					T('pal', 'Paleta em shape layer', 'pop', 'M4 4h7v7H4zM13 13h7v7h-7z', 'M13 4h7v7h-7zM4 13h7v7H4z', COMP),
					T('onair', 'Seta on-air', 'diag', 'M5 12h11', 'M12 6l6 6-6 6', COMP),
					T('logo', 'Logo estático', 'pulse', 'M12 4a8 8 0 1 0 0 16a8 8 0 1 0 0-16', 'M12 8.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 1 0 0-7', COMP),
					T('logoa', 'Logo animado 3s', 'spin', 'M12 4a8 8 0 1 0 0 16a8 8 0 1 0 0-16', 'M12 4a8 8 0 0 1 8 8', COMP)
				],
				['#E53131', '#EEFF8C', '#231E1E'].map(S),
				['#141414', '#333333', '#4A4A4A', '#B2B2B2', '#F2F2F2'].map(S),
				['#F23333', '#FF4D4D', '#FF674D', '#FF8F4D', '#FFC44E', '#FF5A67', '#FF739A', '#FF8CCD', '#B5ADFF', '#80C0FF', '#5CE6A1'].map(S)
			]
		},
		{
			id: 'proj', name: 'Projeto', acc: '#7CC6FE', d: F, a: 'M3 11h18', fields: true,
			groups: [
				[
					T('id', 'Inserir usuário e ID nas comps', 'pop', 'M8 8a3 3 0 1 0 6 0a3 3 0 1 0-6 0M5 19c0-3 3-5 6-5', 'M17 14v6M14 17h6'),
					T('rename', 'Renomear comps', 'slide', 'M4 7h10M4 12h7', 'M14 17l6-6-2-2-6 6v2z'),
					T('org', 'Organizar projeto', 'up', F, 'M8 14h8', { job: true, alt: 'tags de organização', altWin: 'tags' }),
					T('endp', 'Presets de end page', 'draw', 'M4 5h16v14H4z', 'M8 15h8M8 11h5', { win: 'endpage' })
				],
				[
					T('save', 'Salvar projeto', 'down', 'M5 4h11l3 3v13H5z', 'M8 20v-6h8v6', { job: true, alt: 'salvar em outra pasta' }),
					T('collect', 'Coletar arquivos', 'down', 'M4 14v6h16v-6', 'M12 4v10M8 10l4 4 4-4', { job: true }),
					T('cfonts', 'Coletar fontes', 'pop', 'M5 19l5-14h1l5 14M7 14h7', 'M18 14v5', { job: true }),
					T('open', 'Abrir pasta do projeto', 'lift', F, 'M3 18l3-7h15')
				]
			]
		},
		{
			id: 'links', name: 'Atalhos', acc: '#FFB398', d: 'M10 14a4 4 0 0 0 5.6 0l3-3a4 4 0 0 0-5.6-5.6l-1 1', a: 'M14 10a4 4 0 0 0-5.6 0l-3 3a4 4 0 0 0 5.6 5.6l1-1',
			groups: [
				[G('od', 'OneDrive', 'OD'), G('tr', 'Trello promo', 'TR'), G('ap', 'Apontamento', 'AP'), G('pl', 'Planner', 'PL')],
				[
					T('arte', 'PAM para arte', 'up', F, 'M12 16v-5M9.5 13.5L12 11l2.5 2.5', { alt: 'definir pasta' }),
					T('mag', 'Upload PAM magazine', 'slide', F, 'M8 13h8M8 16h5', { alt: 'definir pasta' }),
					T('hn', 'Upload PAM hard news', 'pulse', F, 'M13 10l-3 4h4l-3 4'),
					T('uti', 'T: utilidades', 'spin', F, 'M12 11.5l1 2 2 .3-1.5 1.4.4 2.1-1.9-1-1.9 1 .4-2.1-1.5-1.4 2-.3z'),
					T('pec', '_PECAS_GRAFICAS', 'grow', F, 'M9 17v-3M12 17v-5M15 17v-2'),
					T('hoje', 'Diários · hoje', 'pulse', F, 'M12 12.5a2 2 0 1 0 0 4a2 2 0 1 0 0-4')
				]
			]
		},
		{
			id: 'app', name: 'Programa', acc: '#FFAFB7', d: 'M4 7l8-4 8 4v10l-8 4-8-4z', a: 'M4 7l8 4 8-4M12 11v10',
			groups: [
				[
					T('fonts', 'Fontes', 'pop', 'M5 19l5-14h1l5 14', 'M7 14h7', { win: 'fonts' }),
					T('ame', 'Presets do Media Encoder', 'pop', 'M4 4h16v16H4z', 'M10 9l5 3-5 3z', { alt: 'abrir pasta de presets' })
				],
				[
					T('psetup', 'Setup do projeto', 'spin', 'M12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6', 'M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1'),
					T('labels', 'Cores de label', 'pop', 'M4 4h7v7H4zM13 13h7v7h-7z', 'M13 4h7v7h-7zM4 13h7v7H4z'),
					T('csetup', 'Setup da comp', 'grow', 'M3 6h18v12H3z', 'M9 9v6M15 9v6', { sel: 'comp', alt: 'vertical' }),
					T('batch', 'Batch nunca desliga', 'slide', 'M4 6h12v9H4z', 'M8 18h12V9', { job: true })
				]
			]
		}
	];

	// only when 'ferramentas de dev' is on in the preferences
	SECTIONS.push({
		id: 'dev', name: 'Dev', acc: '#F4FAFF', dev: true, d: 'M9 7l-5 5 5 5', a: 'M15 7l5 5-5 5',
		groups: [[
			T('dev.bin', 'Conversor binário', 'pop', 'M5 5h14v14H5z', 'M9 10v4M12 10v4M15 10v4'),
			T('dev.dark', 'Ícones .png → tema escuro', 'pulse', 'M12 3a9 9 0 1 0 0 18', 'M12 3a9 9 0 0 1 0 18'),
			T('dev.zipTpl', 'Zipar templates', 'down', 'M6 3h9l3 3v15H6z', 'M11 7h2M11 10h2M11 13h2'),
			T('dev.zipFonts', 'Zipar fontes', 'down', 'M5 19l5-14h1l5 14M7 14h7', 'M18 14v5')
		]]
	});

	window.FOOTER = [
		{ name: 'Templates', win: 'templates', d: 'M4 4h7v7H4zM4 13h7v7H4zM13 13h7v7h-7z', a: 'M13 4h7v7h-7z', anim: 'pop' },
		{ name: 'Buscar texto', win: 'search', d: '', a: 'M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14M20 20l-4-4', anim: 'nudge' },
		{ name: 'Salvar preview .png', id: 'preview', alt: 'salvar junto ao projeto', d: 'M4 8h4l2-2h4l2 2h4v11H4z', a: 'M12 10.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5', anim: 'pulse' },
		{ name: 'Preferências', win: 'settings', d: 'M4 7h16M4 17h16', a: 'M9 5v4M15 15v4', anim: 'slide' }
	];
})();
