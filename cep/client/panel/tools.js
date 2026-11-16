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
	// right click 'editar…': the preferences open scrolled to that item. The request goes through the
	// host (shared by every window; localStorage is not) and as an event for an already open window.
	window.focusPrefs = function (f) {
		PGN.run('ui.focus', { set: f }).then(function () {
			PGN.open('settings');
			setTimeout(function () { PGN.emit('uiFocus', f); }, 250);
		});
	};

	// 'Efeitos': groups from the preferences (host fx.get) → tiles
	window.fxGroups = function (data) {
		return (data.groups || []).filter(function (g) { return g.items && g.items.length; }).map(function (g, gi) {
			return g.items.map(function (it, i) {
				// group and position in the id: the same effect twice still makes two tiles
				var base = { id: 'fx:' + gi + '.' + i + ':' + it.m, hostId: 'fx.apply', name: it.name, sel: 'layers', alt: 'editar efeito',
					args: function () { return { m: it.m, name: it.name }; },
					onAlt: function () { window.focusPrefs({ kind: 'fx', key: it.m }); } };
				if (it.glyph) return Object.assign(base, { glyph: it.glyph, anim: 'pop' });
				var ic = (window.FX_ICONS || {})[it.icon] || FX_ICONS.fx;
				return Object.assign(base, { d: ic[0], a: ic[1], anim: ic[2] });
			});
		});
	};

	// 'Atalhos': sites + folders from the preferences (host links.get) → tiles
	window.linksGroups = function (data) {
		function tile(kind, it) {
			var base = { id: 'link:' + kind + ':' + it.id, hostId: 'links.open', name: it.name, alt: 'editar atalho', args: function () { return { kind: kind, id: it.id }; },
				// right click: the preferences open scrolled to this link (pending focus for a window
				// that is still loading + an event for one already open)
				onAlt: function () { window.focusPrefs({ kind: 'link', list: kind === 'site' ? 'sites' : 'dirs', key: it.id }); } };
			if (it.glyph) return Object.assign(base, { glyph: it.glyph, anim: 'pop' });
			var ic = LINK_ICONS[it.icon] || LINK_ICONS[kind === 'site' ? 'globe' : 'up'];
			return Object.assign(base, { d: ic[0], a: ic[1], anim: ic[2] });
		}
		return [(data.sites || []).map(function (s) { return tile('site', s); }), (data.dirs || []).map(function (d) { return tile('dir', d); })]
			.filter(function (g) { return g.length; });
	};

	function S(hex, name, pos) {
		// position in the id: the same color twice still makes two swatches
		return { id: 'color:' + (pos || '') + hex, hostId: 'color', name: name ? name + ' · ' + hex : hex, label: name || '', hex: hex, swatch: true, sel: 'layers', alt: 'editar paleta', args: function () { return { hex: hex }; },
			onAlt: function () { window.focusPrefs({ kind: 'color', key: hex }); } };
	}

	// 'Marca': the palette groups from the preferences (host palette.get) → swatches, named in pt-BR
	// the palette as the bar shows it (names resolved), sent to 'pal'
	window.PALETTE_NAMED = null;
	window.paletteGroups = function (data) {
		var taken = [];
		var named = [];
		var out = (data.groups || []).filter(function (g) { return g.colors && g.colors.length; }).map(function (g, gi) {
			var cols = [];
			named.push({ name: g.name, colors: cols });
			return g.colors.map(function (hex, i) {
				// a name given in the preferences, else the automatic one
				var n = (g.names && g.names[i]) || (window.PalNames ? PalNames.pick(hex, taken) : '');
				taken.push(n);
				cols.push({ hex: hex, name: n });
				return S(hex, n, gi + '.' + i + ':');
			});
		});
		window.PALETTE_NAMED = named;
		return out;
	};
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
					T('null', 'Null pai', 'spin', 'M5 5h14v14H5z', 'M12 8.5v7M8.5 12h7', Object.assign({ args: function (s) { return { keys: !!s.toggles.keys, exp: !!s.toggles.exp }; } }, COMP)),
					T('nullc', 'Null centralizado', 'pulse', 'M4 4h16v16H4z', 'M12 10a2 2 0 1 0 0 4a2 2 0 1 0 0-4', { sel: 'layers', min: 2 }),
					T('parent', 'Selecionar pai', 'up', 'M5 15h4v4H5zM15 15h4v4h-4zM7 15v-2h10v2M12 13v-3', 'M9 4h6v6H9z', COMP),
					T('child', 'Selecionar filhos', 'down', 'M9 4h6v6H9zM12 10v3M7 15v-2h10v2', 'M5 15h4v4H5zM15 15h4v4h-4z', COMP)
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
					// layer bars scattered on the timeline (no staircase: that is 'Sequenciar')
					T('rand', 'Randomizar layers', 'shake', 'M12 5h8M4 10h7M9 19h6', 'M14 14.5h6', { sel: 'layers', min: 2, param: 'frames', args: P('frames') }),
					T('seq', 'Sequenciar layers', 'slide', 'M4 6h7', 'M7 12h9M10 18h10', { sel: 'layers', min: 2, param: 'frames', args: P('frames') })
				],
				[
					T('cols', 'Guia de colunas', 'grow', 'M4 4h16v16H4z', 'M9 6v12M15 6v12', COMP),
					T('arrow', 'Seta', 'diag', 'M5 19L19 5', 'M10 5h9v9', COMP),
					T('count', 'Contador', 'blink', 'M3 7h18v10H3z', 'M8 10v4M12 10v4M16 10v4', COMP),
					T('type', 'Digitação', 'blink', 'M5 6h10M10 6v12', 'M18 13v6', COMP),
					T('words', 'Palavras', 'slide', 'M4 8h6M4 12h10M4 16h4', 'M12 8h8M10 16h10', COMP),
					T('box', 'Tarja simples', 'wipe', 'M3 9h18v6H3z', 'M6 12h10', COMP),
					T('wig', 'Wiggle', 'wiggle', 'M3 19h18', 'M3 12c2-4 4 4 6 0s4 4 6 0 4 4 6 0', LAY),
					T('ik', 'IK (3 layers)', 'swing', 'M4 20h6', 'M7 20l4-8 7-3M11 12h.01M18 9h.01', { sel: 'layers', min: 3 })
				]
			]
		},
		{
			id: 'fx', name: 'Efeitos', acc: '#ACCDEC', d: 'M12 3v4M12 17v4M3 12h4M17 12h4', a: 'M12 9l1.2 1.8L15 12l-1.8 1.2L12 15l-1.2-1.8L9 12l1.8-1.2z',
			// the adjustment layer stays; the effects come from the preferences (fx.get) — see fxGroups()
			groups: [
				[
					T('adj', 'Camada de ajuste', 'draw', 'M4 4h16v16H4z', 'M4 20L20 4', COMP)
				]
			],
			fx: true
		},
		{
			id: 'txt', name: 'Texto', acc: '#F4E76E', d: 'M5 6h14M12 6v13', a: 'M9 19h6',
			groups: [
				[G('up', 'Caixa alta', 'AA', LAY), G('low', 'Caixa baixa', 'aa', LAY), G('tit', 'Primeiras maiúsculas', 'Aa', LAY)],
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
					// the palette of the preferences (the same groups, colors and names as the bar)
					T('pal', 'Paleta em shape layer', 'pop', 'M4 4h7v7H4zM13 13h7v7h-7z', 'M13 4h7v7h-7zM4 13h7v7H4z', { sel: 'comp', args: function () { return window.PALETTE_NAMED ? { groups: window.PALETTE_NAMED } : {}; } }),
					T('onair', 'Seta on-air', 'diag', 'M5 12h11', 'M12 6l6 6-6 6', COMP),
					// GNEWS: the globe (circle) and 'news' (rectangle)
					T('logo', 'Logo estática', '', 'M6.5 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8', 'M13 9.5h8v5h-8z', COMP),
					// the opening: a square passes over 'news' revealing it (hover: the square slides on)
					T('logoa', 'Logo animada 3s', 'slide', 'M11 9.5h10v5H11', 'M3 7h8v10H3z', COMP)
				],
				// + the palette groups (palette.get) — see paletteGroups()
			],
			palette: true
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
					T('save', 'Salvar projeto', 'down', 'M5 4h11l3 3v13H5z', 'M8 20v-6h8v6', { job: true, alt: 'salvar na área de trabalho' }),
					T('collect', 'Coletar arquivos', 'down', 'M4 14v6h16v-6', 'M12 4v10M8 10l4 4 4-4', { job: true }),
					T('cfonts', 'Coletar fontes', 'pop', 'M5 19l5-14h1l5 14M7 14h7', 'M18 14v5', { job: true }),
					T('open', 'Abrir pasta do projeto', 'lift', F, 'M3 18l3-7h15')
				]
			]
		},
		{
			id: 'links', name: 'Atalhos', acc: '#FFB398', d: 'M10 14a4 4 0 0 0 5.6 0l3-3a4 4 0 0 0-5.6-5.6l-1 1', a: 'M14 10a4 4 0 0 0-5.6 0l-3 3a4 4 0 0 0 5.6 5.6l1-1',
			// filled from the user's shortcuts (links.get) — see linksGroups()
			links: true,
			groups: []
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
					T('labels', 'Cores de label', 'pop', 'M4 4h7v7H4zM13 13h7v7h-7z', 'M13 4h7v7h-7zM4 13h7v7H4z', { win: 'labels', alt: 'aplicar o padrão PROMO direto', altRun: true }),
					T('csetup', 'Setup da comp', 'grow', 'M3 6h18v12H3z', 'M9 9v6M15 9v6', { sel: 'comp', alt: 'vertical' }),
					T('batch', 'Lote nunca desliga', 'slide', 'M4 6h12v9H4z', 'M8 18h12V9', { job: true })
				]
			]
		}
	];

	// only when 'ferramentas de dev' is on in the preferences
	SECTIONS.push({
		id: 'dev', name: 'Dev', acc: '#F4FAFF', dev: true, d: 'M9 7l-5 5 5 5', a: 'M15 7l5 5-5 5',
		groups: [[
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
