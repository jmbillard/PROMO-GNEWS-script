/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/*

---------------------------------------------------------------
> PROMO GNEWS · CEP tools · end page presets
---------------------------------------------------------------

  data backend for the HTML window that replaces the classic
  'end page preset' dialog (the classic ScriptUI 'endPagePreset' dialog
  → endPagePresetDialog, + defaultEndPageObj / buildFxObj in FUNC lib).

    endp.state       → presets, current, livre, options, schema, target
    endp.read        → refresh button (pull values from the end page comp)
    endp.apply       → { preset, livre }  apply button (push to the comp)
    endp.load        → { path | name, apply }  preset dropdown
    endp.save        → { name, preset }  save button
    endp.openFolder  → open presets folder

  preset object (same keys as the classic JSON files):
    layout_end_page    → ctrl_comp effect 'layout end page'
    servico_end_page   → ctrl_comp effect 'servico end page'
                         (+ titulo / subtitulo from the text layers)
    aparencia_end_page → ctrl_comp effect 'aparencia end page'
  any other ctrl_comp effect is kept as read (buildFxObj).

  colors are '#RRGGBB' strings (the classic JSON format).
  text line breaks are '\n' in the data, '\r' in the comp / files.

*/

PGN.endp = {
	// classic dropdown lists (value = index + 1)...
	modelos: ['livre', 'programa', 'jornal'],

	formatos: [
		'- formato livre -',
		'[dia]  [mes]  \u2014  [hora]  [min]',
		'DIA  [dia]  \u2014  [hora]  [min]',
		'[semana]  \u2014  [hora]  [min]',
		'MAIS  TARDE  \u2014  [hora]  [min]',
		'TODA  [semana]  \u2014  [hora]  [min]',
		'EM  [mes]'
	],

	temas: [
		{ name: 'claro', hint: 'fundo branco, marca vermelho, pattern cinza, texto preto e footage vermelho' },
		{ name: 'cinza', hint: 'fundo cinza, marca branco, pattern branco, texto preto e footage vermelho' },
		{ name: 'escuro', hint: 'fundo cinza escuro, marca vermelho, pattern amarelo, texto branco e footage pb' },
		{ name: 'vermelho', hint: 'fundo vermelho, marca preto, pattern preto, texto branco e footage pb' },
		{ name: '- cores livres -', hint: 'qualquer cor pode ser usada em cada elemento individualmente' }
	],

	colorKeys: ['logo', 'titulo', 'subtitulo', 'apoio', 'horario', 'horario_base', 'footage', 'pattern', 'fundo'],

	colorLabels: {
		logo: 'logo',
		titulo: 't\u00EDtulo',
		subtitulo: 'subt\u00EDtulo',
		apoio: 'apoio',
		horario: 'hor\u00E1rio',
		horario_base: 'hor\u00E1rio base',
		footage: 'footage',
		pattern: 'pattern',
		fundo: 'fundo'
	},

	// comp effect property names of each color key...
	colorProps: {
		logo: 'logo',
		titulo: 'titulo',
		subtitulo: 'subtitulo',
		apoio: 'apoio',
		horario: 'horario',
		horario_base: 'horario base',
		footage: 'footage',
		pattern: 'pattern',
		fundo: 'fundo'
	},

	noLayer: '-------',

	clone: function (obj) {
		return JSON.parse(JSON.stringify(obj));
	},
	livreDefault: 'DIGITE O TEXTO',

	// same values as defaultEndPageObj (FUNC lib)...
	defaults: function () {
		return {
			layout_end_page: {
				modelo: 1,
				logo: true,
				titulo: true,
				auto_title_case: true,
				subtitulo: true,
				data_e_horario: true,
				apoio: false,
				foto: false,
				footage: true,
				pattern: true,
				fundo: true,
				foto_layer: '-------',
				pattern_layer: '-------'
			},
			servico_end_page: {
				titulo: 'Digite O T\u00EDtulo Aqui',
				subtitulo: 'SUBT\u00CDTULO',
				formato: 4,
				semana: 8,
				dia: 10,
				mes: 0,
				a_partir_das: false,
				hora: 16,
				min: 0
			},
			aparencia_end_page: {
				tema: 4,
				logo: '#141414',
				titulo: '#F2F2F2',
				subtitulo: '#F2F2F2',
				apoio: '#F2F2F2',
				horario: '#141414',
				horario_base: '#ECFF8C',
				footage: '#141414',
				pattern: '#141414',
				fundo: '#E53131'
			}
		};
	},

	/*
	  checks done before the classic dialog opens:
	  · button disabled in hard news mode (prefs ui)
	  · netAccess() required (project tab)
	*/
	check: function () {
		if (hardNews) PGN.fail('indispon\u00EDvel no modo hard news');
		if (!netAccess()) PGN.fail(netConfigName + ' desativado nas prefer\u00EAncias do AE');
	},

	presetPath: function () {
		return templatesPath + '/ON-AIR/end page/end page presets';
	},

	// true when the presets are on this computer only (home office, or the network templates
	// folder is unavailable): a preset saved now does not reach the team
	presetsLocal: function () {
		return templatesPath == templatesLocalPath;
	},

	presetFolder: function () {
		var folder = new Folder(PGN.endp.presetPath());

		if (!folder.exists) folder.create();
		return folder;
	},

	// [{ name, path }] sorted by name...
	presetList: function () {
		var folder = PGN.endp.presetFolder();
		var files = folder.exists ? folder.getFiles() : [];
		var list = [];

		for (var f = 0; f < files.length; f++) {
			if (!(files[f] instanceof File)) continue;
			if (!/\.json$/i.test(files[f].displayName)) continue;

			list.push({ name: deleteFileExt(files[f].displayName), path: files[f].fsName });
		}
		list.sort(function (a, b) {
			var x = a.name.toLowerCase();
			var y = b.name.toLowerCase();

			if (x < y) return -1;
			if (x > y) return 1;
			return 0;
		});
		return list;
	},

	//---------------------------------------------------------
	// value helpers...

	clamp: function (val, min, max, def) {
		var n = parseInt(String(val).replace(/\D/g, ''), 10);

		if (isNaN(n)) n = def;
		if (n < min) n = min;
		if (n > max) n = max;
		return n;
	},

	// [r, g, b(, a)] 0-1 → '#RRGGBB'...
	toHex: function (arr) {
		var s = '#';

		for (var i = 0; i < 3; i++) {
			var c = Math.round(Math.max(0, Math.min(1, arr[i])) * 255).toString(16);

			s += c.length == 1 ? '0' + c : c;
		}
		return s.toUpperCase();
	},

	// '#RRGGBB' → [r, g, b] 0-1...
	toRgb: function (hex) {
		hex = String(hex).replace('#', '');

		return [
			parseInt(hex.substring(0, 2), 16) / 255,
			parseInt(hex.substring(2, 4), 16) / 255,
			parseInt(hex.substring(4, 6), 16) / 255
		];
	},

	// any color value → '#RRGGBB' (or null when invalid)...
	normHex: function (val) {
		if (val instanceof Array && val.length >= 3) return PGN.endp.toHex(val);

		var s = String(val).replace(/^\s+|\s+$/g, '');
		var m = s.match(/^#?([0-9a-f]{6})$/i);

		if (m) return '#' + m[1].toUpperCase();

		m = s.match(/^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i);
		if (m) return ('#' + m[1] + m[1] + m[2] + m[2] + m[3] + m[3]).toUpperCase();

		return null;
	},

	txtIn: function (str) {
		return String(str == null ? '' : str).replace(/\r\n|\r/g, '\n');
	},

	txtOut: function (str) {
		return String(str == null ? '' : str).replace(/\r\n|\n/g, '\r');
	},

	/*
	  defaultEndPageObj + data cleanup for the HTML side:
	  missing keys → defaults, layout booleans coerced (classic),
	  numbers as numbers, colors as '#RRGGBB', text breaks as '\n'.
	  (the classic aparencia loop iterated the layout keys by mistake;
	  here every aparencia key gets its default.)
	*/
	normalize: function (obj) {
		var def = PGN.endp.defaults();
		var cat, k;

		obj = obj && typeof obj == 'object' ? obj : {};

		for (cat in def) {
			if (!def.hasOwnProperty(cat)) continue;
			if (obj[cat] == null || typeof obj[cat] != 'object') obj[cat] = {};

			for (k in def[cat]) {
				if (!def[cat].hasOwnProperty(k)) continue;
				if (!obj[cat].hasOwnProperty(k) || obj[cat][k] == null) obj[cat][k] = def[cat][k];
			}
		}
		var lay = obj.layout_end_page;
		var srv = obj.servico_end_page;
		var apr = obj.aparencia_end_page;

		for (k in def.layout_end_page) {
			if (typeof def.layout_end_page[k] == 'boolean') lay[k] = Boolean(lay[k]);
		}
		lay.modelo = PGN.endp.clamp(lay.modelo, 1, PGN.endp.modelos.length, def.layout_end_page.modelo);
		lay.foto_layer = String(lay.foto_layer);
		lay.pattern_layer = String(lay.pattern_layer);

		srv.titulo = PGN.endp.txtIn(srv.titulo);
		srv.subtitulo = PGN.endp.txtIn(srv.subtitulo);
		srv.formato = PGN.endp.clamp(srv.formato, 1, PGN.endp.formatos.length, def.servico_end_page.formato);
		srv.semana = PGN.endp.clamp(srv.semana, 1, fullWeekArray.length, def.servico_end_page.semana);
		srv.mes = PGN.endp.clamp(srv.mes, 0, fullMonthArray.length, 1);
		if (srv.mes == 0) srv.mes = 1; // classic default (0) has no dropdown entry...
		srv.dia = PGN.endp.clamp(srv.dia, 1, 31, 1);
		srv.hora = PGN.endp.clamp(srv.hora, 0, 23, 0);
		srv.min = PGN.endp.clamp(srv.min, 0, 59, 0);
		srv.a_partir_das = Boolean(srv.a_partir_das);

		apr.tema = PGN.endp.clamp(apr.tema, 1, PGN.endp.temas.length, def.aparencia_end_page.tema);
		for (var c = 0; c < PGN.endp.colorKeys.length; c++) {
			k = PGN.endp.colorKeys[c];
			apr[k] = PGN.endp.normHex(apr[k]) || def.aparencia_end_page[k];
		}
		return obj;
	},

	// preset object → JSON file content (classic format)...
	toFile: function (obj) {
		var out = PGN.endp.clone(obj);

		out.servico_end_page.titulo = PGN.endp.txtOut(out.servico_end_page.titulo);
		out.servico_end_page.subtitulo = PGN.endp.txtOut(out.servico_end_page.subtitulo);

		return JSON.stringify(out, null, '\t');
	},

	//---------------------------------------------------------
	// comp helpers...

	layer: function (comp, name) {
		try {
			return comp.layer(name);
		} catch (e) {
			return null;
		}
	},

	ctrlFx: function (comp, fxName) {
		var ctrl = PGN.endp.layer(comp, 'ctrl_comp');

		if (ctrl == null) return null;
		try {
			var fx = ctrl.property('ADBE Effect Parade');

			return fxName ? fx.property(fxName) : fx;
		} catch (e) {
			return null;
		}
	},

	isEndPage: function (item) {
		if (!(item instanceof CompItem)) return false;

		return PGN.endp.ctrlFx(item, 'layout end page') != null;
	},

	// end page comp: active comp → selected precomp layer → selected project comp...
	target: function () {
		var aItem = app.project.activeItem;
		var i;

		if (PGN.endp.isEndPage(aItem)) return aItem;

		if (aItem instanceof CompItem) {
			var sel = aItem.selectedLayers;

			for (i = 0; i < sel.length; i++) {
				try {
					if (PGN.endp.isEndPage(sel[i].source)) return sel[i].source;
				} catch (e) { }
			}
		}
		var pSel = app.project.selection;

		for (i = 0; i < pSel.length; i++) {
			if (PGN.endp.isEndPage(pSel[i])) return pSel[i];
		}
		return null;
	},

	targetOrFail: function () {
		var comp = PGN.endp.target();

		if (comp == null) PGN.fail('nenhuma end page selecionada');
		return comp;
	},

	keyName: function (name) {
		return name.replaceSpecialCharacters().replace(/\s+/g, '_');
	},

	// buildFxObj + fxObj (FUNC lib) with exact color → hex conversion...
	buildFxObj: function (comp) {
		var obj = {};
		var cFx = PGN.endp.ctrlFx(comp);

		if (cFx == null) return obj;

		for (var f = 1; f <= cFx.numProperties; f++) {
			var fx = cFx.property(f);
			var fxData = {};

			for (var p = 1; p <= fx.numProperties; p++) {
				try {
					var prop = fx.property(p);
					var val = prop.value;

					if (val == undefined) continue;
					if (val instanceof Array && val.length > 3) val = PGN.endp.toHex(val);

					fxData[PGN.endp.keyName(prop.name)] = val;
				} catch (err) { }
			}
			obj[PGN.endp.keyName(fx.name)] = fxData;
		}
		return obj;
	},

	// precomp layer names (adjustment layers ignored), '-------' first...
	layerNames: function (comp, compName) {
		var names = [PGN.endp.noLayer];

		try {
			var src = comp.layer(compName).source;

			for (var l = 1; l <= src.numLayers; l++) {
				var n = src.layer(l).name;

				if (n.match(/adj_/)) continue;
				names.push(n);
			}
		} catch (e) { }
		return names;
	},

	// first enabled layer name of a precomp (updateObjLayers)...
	enabledLayer: function (comp, compName, skipAdj) {
		try {
			var src = comp.layer(compName).source;

			for (var l = 1; l <= src.numLayers; l++) {
				if (skipAdj && src.layer(l).name.match(/adj_/)) continue;
				if (src.layer(l).enabled) return src.layer(l).name;
			}
		} catch (e) { }
		return null;
	},

	// uiToComp_updateLayers: only the chosen layer stays enabled...
	setLayer: function (comp, compName, layerName) {
		try {
			var src = comp.layer(compName).source;
			var l;
			var found = layerName == PGN.endp.noLayer;

			for (l = 1; l <= src.numLayers && !found; l++) {
				if (src.layer(l).name == layerName) found = true;
			}
			// unknown layer (preset from another program) → keep the comp as is...
			if (!found) return false;

			for (l = 1; l <= src.numLayers; l++) {
				var n = src.layer(l).name;

				if (n.match(/adj_/)) continue;
				src.layer(l).enabled = n == layerName;
			}
			return true;
		} catch (e) {
			return false;
		}
	},

	setFx: function (comp, fxName, propName, val) {
		try {
			PGN.endp.ctrlFx(comp, fxName).property(propName).setValue(val);
			return true;
		} catch (e) {
			return false;
		}
	},

	setText: function (comp, layerName, str) {
		try {
			comp.layer(layerName)
				.property('ADBE Text Properties')
				.property('ADBE Text Document')
				.setValue(PGN.endp.txtOut(str));
			return true;
		} catch (e) {
			return false;
		}
	},

	// layers hidden when the end page has no background ('fundo' off)
	bgLayers: ['comp_pattern', 'matte_footage animation', 'adj_footage anim', 'adj_footage cc'],

	// the background of the end page is a 'Solid Composite' effect named 'bg' (on the layer
	// 'adj_footage anim' in the templates): off → no background, the end page comes out in alpha
	bgFx: function (comp) {
		var find = function (layer) {
			try {
				var fx = layer.property('ADBE Effect Parade');

				for (var i = 1; i <= fx.numProperties; i++) {
					var e = fx.property(i);

					if (e.matchName == 'ADBE Solid Composite' && String(e.name).toLowerCase() == 'bg') return e;
				}
			} catch (err) { }
			return null;
		};
		var named = PGN.endp.layer(comp, 'adj_footage anim');
		var bg = named != null ? find(named) : null;

		// another layer name in a different template version: look for the effect itself
		for (var l = 1; bg == null && l <= comp.numLayers; l++) bg = find(comp.layer(l));
		return bg;
	},

	// refresh button: comp → preset object...
	readComp: function (comp) {
		var obj = PGN.endp.normalize(PGN.endp.buildFxObj(comp));
		var bg = PGN.endp.bgFx(comp);

		var bgLayer = PGN.endp.layer(comp, 'adj_footage anim');

		if (bgLayer != null) obj.layout_end_page.fundo = bgLayer.enabled !== false && (bg == null || bg.enabled !== false);
		else if (bg != null) obj.layout_end_page.fundo = bg.enabled !== false;
		var pat = PGN.endp.enabledLayer(comp, 'comp_pattern', false);
		var foto = PGN.endp.enabledLayer(comp, 'comp_img apresentador', true);

		obj.servico_end_page.titulo = PGN.endp.txtIn(textContent(PGN.endp.layer(comp, 'txt_titulo')));
		obj.servico_end_page.subtitulo = PGN.endp.txtIn(textContent(PGN.endp.layer(comp, 'txt_subtitulo')));
		if (pat != null) obj.layout_end_page.pattern_layer = pat;
		if (foto != null) obj.layout_end_page.foto_layer = foto;

		return obj;
	},

	readLivre: function (comp) {
		var l = PGN.endp.layer(comp, 'txt_data e horario');

		return l != null ? PGN.endp.txtIn(textContent(l)) : PGN.endp.livreDefault;
	},

	// colors + layout checkboxes + 'a partir das' (uiToComp_colors + uiToComp_updateCompFx)...
	writeColorsAndFx: function (comp, obj) {
		var lay = obj.layout_end_page;
		var apr = obj.aparencia_end_page;

		for (var c = 0; c < PGN.endp.colorKeys.length; c++) {
			var k = PGN.endp.colorKeys[c];

			PGN.endp.setFx(comp, 'aparencia end page', PGN.endp.colorProps[k], PGN.endp.toRgb(apr[k]));
		}
		PGN.endp.setFx(comp, 'layout end page', 'subtitulo', lay.subtitulo);
		PGN.endp.setFx(comp, 'layout end page', 'foto', lay.foto);
		PGN.endp.setFx(comp, 'layout end page', 'footage', lay.footage);
		PGN.endp.setFx(comp, 'layout end page', 'pattern', lay.pattern);
		PGN.endp.setFx(comp, 'servico end page', 'a partir das', obj.servico_end_page.a_partir_das);

		// 'fundo' off: the layers that make the background are hidden (alpha).
		// the 'bg' effect stays on: it sits on one of those layers
		var on = lay.fundo !== false;
		var bg = PGN.endp.bgFx(comp);

		for (var i = 0; i < PGN.endp.bgLayers.length; i++) {
			var bl = PGN.endp.layer(comp, PGN.endp.bgLayers[i]);

			if (bl == null) continue;
			try {
				var wasLocked = bl.locked;

				if (wasLocked) bl.locked = false;
				bl.enabled = on;
				if (wasLocked) bl.locked = true;
			} catch (err) { }
		}
		if (bg != null) {
			try { bg.enabled = true; } catch (err) { }
		}
	},

	// apply button: preset object → comp...
	writeComp: function (comp, obj, livre) {
		var lay = obj.layout_end_page;
		var srv = obj.servico_end_page;

		PGN.endp.setLayer(comp, 'comp_img apresentador', lay.foto_layer);
		PGN.endp.setLayer(comp, 'comp_pattern', lay.pattern_layer);

		PGN.endp.setFx(comp, 'layout end page', 'modelo', lay.modelo);
		PGN.endp.setFx(comp, 'servico end page', 'formato', srv.formato);
		PGN.endp.setFx(comp, 'servico end page', 'mes', srv.mes);
		PGN.endp.setFx(comp, 'servico end page', 'semana', srv.semana);
		PGN.endp.setFx(comp, 'aparencia end page', 'tema', obj.aparencia_end_page.tema);
		PGN.endp.writeColorsAndFx(comp, obj);

		PGN.endp.setText(comp, 'txt_titulo', srv.titulo);
		PGN.endp.setText(comp, 'txt_subtitulo', srv.subtitulo);
		if (livre != null) PGN.endp.setText(comp, 'txt_data e horario', livre);

		// the classic dialog wrote [dia] live from its text field...
		PGN.endp.setFx(comp, 'servico end page', '[dia]', srv.dia);
		PGN.endp.setFx(comp, 'servico end page', '[hora]', srv.hora);
		PGN.endp.setFx(comp, 'servico end page', '[min]', srv.min);
	},

	// presetDrop.onChange: the subset the classic writes on preset selection...
	writeOnSelect: function (comp, obj) {
		var srv = obj.servico_end_page;

		PGN.endp.writeColorsAndFx(comp, obj);
		PGN.endp.setText(comp, 'txt_titulo', srv.titulo);
		PGN.endp.setText(comp, 'txt_subtitulo', srv.subtitulo);
		PGN.endp.setFx(comp, 'servico end page', '[hora]', srv.hora);
		PGN.endp.setFx(comp, 'servico end page', '[min]', srv.min);
	},

	readFile: function (file) {
		if (!file.exists) PGN.fail('preset n\u00E3o encontrado');

		file.encoding = 'UTF-8';
		var str = readFileContent(file);
		var obj;

		try {
			obj = JSON.parse(str);
		} catch (err) {
			PGN.fail('preset inv\u00E1lido: ' + deleteFileExt(file.displayName));
		}
		return PGN.endp.normalize(obj);
	},

	presetFile: function (args) {
		if (args.path) return new File(String(args.path));
		if (args.name) return new File(PGN.endp.presetPath() + '/' + String(args.name) + '.json');

		PGN.fail('nenhum preset escolhido');
	},

	//---------------------------------------------------------
	// every dropdown list + the field schema...

	options: function (comp) {
		var i;
		var modelos = [];
		var formatos = [];
		var semanas = [];
		var meses = [];
		var temas = [];

		for (i = 0; i < PGN.endp.modelos.length; i++) modelos.push({ value: i + 1, name: PGN.endp.modelos[i] });
		for (i = 0; i < PGN.endp.formatos.length; i++) formatos.push({ value: i + 1, name: PGN.endp.formatos[i] });
		for (i = 0; i < fullWeekArray.length; i++) semanas.push({ value: i + 1, name: fullWeekArray[i] });
		for (i = 0; i < fullMonthArray.length; i++) meses.push({ value: i + 1, name: fullMonthArray[i] });
		for (i = 0; i < PGN.endp.temas.length; i++) {
			temas.push({
				value: i + 1,
				name: PGN.endp.temas[i].name,
				hint: PGN.endp.temas[i].hint,
				free: i == PGN.endp.temas.length - 1,
				colors: null // fixed theme colors live in the template expressions...
			});
		}
		var colors = [];

		for (i = 0; i < PGN.endp.colorKeys.length; i++) {
			colors.push({ key: PGN.endp.colorKeys[i], label: PGN.endp.colorLabels[PGN.endp.colorKeys[i]] });
		}
		return {
			modelos: modelos,
			fotos: comp ? PGN.endp.layerNames(comp, 'comp_img apresentador') : [PGN.endp.noLayer],
			patterns: comp ? PGN.endp.layerNames(comp, 'comp_pattern') : [PGN.endp.noLayer],
			formatos: formatos,
			semanas: semanas,
			meses: meses,
			temas: temas,
			colors: colors,
			noLayer: PGN.endp.noLayer
		};
	},

	schema: function () {
		return {
			modes: {
				simple: ['preset', 'buttons'],
				extended: ['preset', 'layout', 'servico', 'aparencia', 'buttons']
			},
			defaultMode: 'simple',
			sections: [
				{
					id: 'layout', label: 'layout', fields: [
						{ key: 'layout_end_page.modelo', label: 'modelo', type: 'select', options: 'modelos' },
						{ key: 'layout_end_page.subtitulo', label: 'subt\u00EDtulo', type: 'checkbox' },
						{ key: 'layout_end_page.foto', label: 'foto', type: 'checkbox' },
						{ key: 'layout_end_page.footage', label: 'footage', type: 'checkbox' },
						{ key: 'layout_end_page.pattern', label: 'pattern', type: 'checkbox' },
						{ key: 'layout_end_page.fundo', label: 'fundo', type: 'checkbox' },
						{ key: 'layout_end_page.foto_layer', label: 'foto', type: 'select', options: 'fotos', by: 'name', enabledIf: 'layout_end_page.foto' },
						{ key: 'layout_end_page.pattern_layer', label: 'pattern', type: 'select', options: 'patterns', by: 'name', enabledIf: 'layout_end_page.pattern' }
					]
				},
				{
					id: 'servico', label: 'servi\u00E7o', fields: [
						{ key: 'servico_end_page.titulo', label: 't\u00EDtulo', type: 'textarea' },
						{ key: 'servico_end_page.subtitulo', label: 'subt\u00EDtulo', type: 'text', enabledIf: 'layout_end_page.subtitulo' },
						{ key: 'servico_end_page.formato', label: 'formato', type: 'select', options: 'formatos' },
						{ key: 'servico_end_page.semana', label: 'semana', type: 'select', options: 'semanas', visibleIn: [4, 6] },
						{ key: 'servico_end_page.mes', label: 'm\u00EAs', type: 'select', options: 'meses', visibleIn: [2, 7] },
						{ key: 'livre', label: 'texto livre', type: 'text', visibleIn: [1] },
						{ key: 'servico_end_page.dia', label: 'dia', type: 'number', min: 1, max: 31, visibleIn: [2, 3, 4, 5, 6], enabledIn: [2, 3] },
						{ key: 'servico_end_page.hora', label: 'hora', type: 'number', min: 0, max: 23, visibleIn: [2, 3, 4, 5, 6], enabledIn: [2, 3, 4, 5, 6] },
						{ key: 'servico_end_page.min', label: 'min', type: 'number', min: 0, max: 59, visibleIn: [2, 3, 4, 5, 6], enabledIn: [2, 3, 4, 5, 6] },
						{ key: 'servico_end_page.a_partir_das', label: 'a partir das', type: 'checkbox', classic: false }
					]
				},
				{
					id: 'aparencia', label: 'apar\u00EAncia', fields: [
						{ key: 'aparencia_end_page.tema', label: 'tema', type: 'select', options: 'temas' },
						{ key: 'aparencia_end_page.*', label: 'cores', type: 'colors', options: 'colors', usedWhen: { 'aparencia_end_page.tema': 5 } }
					]
				}
			],
			// stored in presets, never shown nor written by the dialog...
			hidden: ['layout_end_page.logo', 'layout_end_page.titulo', 'layout_end_page.auto_title_case', 'layout_end_page.data_e_horario', 'layout_end_page.apoio']
		};
	},

	stateData: function () {
		var comp = PGN.endp.target();

		return {
			presets: PGN.endp.presetList(),
			folder: PGN.endp.presetFolder().fsName,
			local: PGN.endp.presetsLocal(),
			current: comp ? PGN.endp.readComp(comp) : PGN.endp.normalize({}),
			livre: comp ? PGN.endp.readLivre(comp) : PGN.endp.livreDefault,
			options: PGN.endp.options(comp),
			schema: PGN.endp.schema(),
			target: comp ? comp.name : null,
			targetId: comp ? comp.id : null
		};
	}
};

//---------------------------------------------------------

PGN.register('endp.state', function (args) {
	PGN.endp.check();

	return { msg: '', data: PGN.endp.stateData() };
});

//---------------------------------------------------------

// refreshBtn.onClick...
PGN.register('endp.read', function (args) {
	PGN.endp.check();

	var comp = PGN.endp.targetOrFail();

	return {
		msg: 'valores lidos de ' + comp.name,
		data: {
			current: PGN.endp.readComp(comp),
			livre: PGN.endp.readLivre(comp),
			options: PGN.endp.options(comp),
			target: comp.name,
			targetId: comp.id
		}
	};
});

//---------------------------------------------------------

// applyBtn.onClick (+ refresh)...
PGN.register('endp.apply', function (args) {
	PGN.endp.check();

	if (!args.preset || typeof args.preset != 'object') PGN.fail('nenhum preset para aplicar');

	var comp = PGN.endp.targetOrFail();
	var obj = PGN.endp.normalize(PGN.endp.clone(args.preset));
	var livre = args.livre != null ? String(args.livre) : null;

	app.beginUndoGroup('apply end page preset');
	PGN.endp.writeComp(comp, obj, livre);
	app.endUndoGroup();

	return {
		msg: 'end page ' + comp.name + ' atualizada',
		data: {
			current: PGN.endp.readComp(comp),
			livre: PGN.endp.readLivre(comp),
			target: comp.name,
			targetId: comp.id
		}
	};
});

//---------------------------------------------------------

// presetDrop.onChange (apply: true → also writes what the classic writes on selection)...
PGN.register('endp.load', function (args) {
	PGN.endp.check();

	var file = PGN.endp.presetFile(args);
	var obj = PGN.endp.readFile(file);
	var name = deleteFileExt(file.displayName);
	var msg = 'preset ' + name + ' carregado';

	if (args.apply === true) {
		var comp = PGN.endp.targetOrFail();

		app.beginUndoGroup('end page preset selection');
		PGN.endp.writeOnSelect(comp, obj);
		app.endUndoGroup();
		msg = 'preset ' + name + ' aplicado em ' + comp.name;
	}
	return { msg: msg, data: { current: obj, name: name, path: file.fsName } };
});

//---------------------------------------------------------

// saveBtn.onClick: preset object (or the end page comp when none is given) → JSON file...
PGN.register('endp.save', function (args) {
	PGN.endp.check();

	var obj;

	if (args.preset) {
		obj = PGN.endp.normalize(PGN.endp.clone(args.preset));
	} else {
		obj = PGN.endp.readComp(PGN.endp.targetOrFail());
	}
	var name = args.name != null && String(args.name) != '' ? String(args.name) : obj.servico_end_page.titulo;

	name = name
		.replace(/[\\\/:*?"<>|]/g, ' ')
		.replace(/\s+/g, ' ')
		.toLowerCase()
		.replace(/^\s+|\s+$/g, '');

	if (name == '') PGN.fail('nome do preset vazio');

	var folder = PGN.endp.presetFolder();

	if (!folder.exists) PGN.fail('pasta de presets indispon\u00EDvel');

	var filePath = folder.fsName + '/' + name + '.json';
	var saved = saveTextFile(PGN.endp.toFile(obj), filePath);

	if (!saved || !saved.exists) PGN.fail('n\u00E3o foi poss\u00EDvel salvar o preset');

	// where it went: the team's folder on the network, or only this computer
	var local = PGN.endp.presetsLocal();

	return {
		msg: 'preset ' + name + (local ? ' salvo s\u00F3 neste computador \u00B7 a pasta de templates da rede est\u00E1 fora' : ' salvo na pasta de templates da rede'),
		data: { presets: PGN.endp.presetList(), name: name, path: saved.fsName, current: obj, local: local }
	};
});

//---------------------------------------------------------

PGN.register('endp.openFolder', function (args) {
	PGN.endp.check();

	openFolder(PGN.endp.presetFolder().fsName);
	return 'pasta de presets aberta';
});
