/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/*

---------------------------------------------------------------
> PROMO GNEWS · CEP tools · effects
---------------------------------------------------------------

  ported from the classic ScriptUI 'effects' tab.

    adj       adjustment layer (shape or solid → global 'adjType' pref)
    curves    ADBE CurvesCustom
    levels    ADBE Pro Levels2
    lumetri   ADBE Lumetri
    gauss     ADBE Gaussian Blur 2
    compound  ADBE Compound Blur
    lens      ADBE Camera Lens Blur
    fill      ADBE Fill (random label color)
    3d        ADBE 3D Glasses2 (left/right view = the layer itself, 3d view = 12)
    fractal   ADBE Fractal Noise
    grain     VISINF Grain Implant

  no args.

*/

(function () {

	// adds an effect to every selected layer (classic loop)...
	// 'setup' receives (effect, layer) for effects with extra settings.
	function addFx(fxName, undoName, label, setup) {
		var aItem = app.project.activeItem;
		var selLayers = aItem instanceof CompItem ? aItem.selectedLayers : [];
		var count = 0;

		// error...
		if (selLayers.length == 0) PGN.fail('nenhum layer selecionado');

		app.beginUndoGroup(undoName);

		for (var i = 0; i < selLayers.length; i++) {
			var fxParade = selLayers[i].property('ADBE Effect Parade');

			// cameras / lights have no effects...
			if (fxParade == null || !fxParade.canAddProperty(fxName)) continue;

			var effect = fxParade.addProperty(fxName);

			if (typeof setup == 'function') setup(effect, selLayers[i]);
			count++;
		}
		app.endUndoGroup();

		if (count == 0) PGN.fail(label + ' n\u00E3o pode ser aplicado nos layers selecionados');

		return label + ' aplicado em ' + PGN.n(count, 'layer');
	}

	//---------------------------------------------------------

	PGN.register('adj', function (args) {
		var aItem = PGN.comp();
		var selLayer = aItem.selectedLayers[0] || null;
		var adjLayer;

		app.beginUndoGroup('create adj layer');

		var adjC = rgb(255, 255, 255);
		var adjW = aItem.width;
		var adjH = aItem.height;

		if (adjType == 0) {
			adjLayer = shpAdjustment(aItem);
		} else {
			adjLayer = aItem.layers.addSolid(adjC, '', adjW, adjH, 1.0);
		}
		if (selLayer != null) {
			adjLayer.moveBefore(selLayer);
			adjLayer.inPoint = selLayer.inPoint;
			adjLayer.outPoint = selLayer.outPoint;
		}
		adjLayer.name = adjPrefix;
		adjLayer.adjustmentLayer = true;
		adjLayer.label = 5;

		if (adjLayer instanceof AVLayer) {
			var expStr = scaleToCompSize();

			adjLayer.property('ADBE Transform Group')
				.property('ADBE Scale').expression = expStr;
		}
		app.endUndoGroup();

		return 'Adjustment layer criado';
	});

	//---------------------------------------------------------

	PGN.register('curves', function (args) {
		return addFx('ADBE CurvesCustom', 'curves', 'Curves');
	});

	PGN.register('levels', function (args) {
		return addFx('ADBE Pro Levels2', 'levels', 'Levels');
	});

	PGN.register('lumetri', function (args) {
		return addFx('ADBE Lumetri', 'lumetri color', 'Lumetri Color');
	});

	PGN.register('gauss', function (args) {
		return addFx('ADBE Gaussian Blur 2', 'gaussian blur', 'Gaussian Blur');
	});

	PGN.register('compound', function (args) {
		return addFx('ADBE Compound Blur', 'compound blur', 'Compound Blur');
	});

	PGN.register('lens', function (args) {
		return addFx('ADBE Camera Lens Blur', 'lens blur', 'Lens Blur');
	});

	PGN.register('fill', function (args) {
		return addFx('ADBE Fill', 'fill', 'Fill', function (effect, layer) {
			effect.property(3).setValue(randomColor(labelColors)); // color
		});
	});

	PGN.register('3d', function (args) {
		return addFx('ADBE 3D Glasses2', '3d glasses', '3D Glasses', function (effect, layer) {
			effect.property(1).setValue(layer.index); // left view
			effect.property(2).setValue(layer.index); // right view
			effect.property(7).setValue(12); // 3d view
		});
	});

	PGN.register('fractal', function (args) {
		return addFx('ADBE Fractal Noise', 'fractal noise', 'Fractal Noise');
	});

	PGN.register('grain', function (args) {
		return addFx('VISINF Grain Implant', 'add grain', 'Add Grain');
	});

	//---------------------------------------------------------
	// editable 'Efeitos' (preferences): groups of effects, saved in '<script prefs>/effects.json'
	//   [{ name, items: [{ m: matchName, name, icon | glyph }] }]
	//   fx.list   → effects installed in this After Effects (for the editor's search)
	//   fx.get / fx.set { groups } / fx.reset · fx.apply { m, name }

	var FX_DEFAULTS = [
		{ name: 'cor', items: [
			{ m: 'ADBE CurvesCustom', name: 'Curves', icon: 'curves' },
			{ m: 'ADBE Pro Levels2', name: 'Levels', icon: 'levels' },
			{ m: 'ADBE Lumetri', name: 'Lumetri Color', icon: 'lumetri' }] },
		{ name: 'blur', items: [
			{ m: 'ADBE Gaussian Blur 2', name: 'Gaussian Blur', icon: 'gauss' },
			{ m: 'ADBE Compound Blur', name: 'Compound Blur', icon: 'compound' },
			{ m: 'ADBE Camera Lens Blur', name: 'Lens Blur', icon: 'lens' }] },
		{ name: 'outros', items: [
			{ m: 'ADBE Fill', name: 'Fill', icon: 'fill' },
			{ m: 'ADBE 3D Glasses2', name: '3D Glasses', icon: '3d' },
			{ m: 'ADBE Fractal Noise', name: 'Fractal Noise', icon: 'fractal' },
			{ m: 'VISINF Grain Implant', name: 'Add Grain', icon: 'grain' }] }
	];
	// effects that need a little setup after being added (same as the classic buttons)
	var FX_SETUP = {
		'ADBE Fill': function (effect, layer) { effect.property(3).setValue(randomColor(labelColors)); },
		'ADBE 3D Glasses2': function (effect, layer) { effect.property(1).setValue(layer.index); effect.property(2).setValue(layer.index); effect.property(7).setValue(12); }
	};

	function fxFile() {
		var folder = new Folder(scriptPreferencesPath);

		if (!folder.exists) folder.create();
		return new File(scriptPreferencesPath + '/effects.json');
	}
	function fxClean(groups) {
		var out = [];

		if (!(groups instanceof Array)) return out;
		for (var g = 0; g < groups.length; g++) {
			var gr = groups[g];

			if (!gr || !(gr.items instanceof Array)) continue;
			var items = [];

			for (var i = 0; i < gr.items.length; i++) {
				var it = gr.items[i];

				if (!it || !it.m) continue;
				var o = { m: String(it.m), name: String(it.name || it.m).substr(0, 60) };

				if (it.glyph) o.glyph = String(it.glyph).toUpperCase().substr(0, 2);
				else o.icon = String(it.icon || 'fx');
				items.push(o);
			}
			out.push({ name: String(gr.name || 'grupo').substr(0, 30), items: items });
		}
		return out;
	}
	function fxLoad() {
		var f = fxFile();

		if (f.exists) {
			try {
				f.encoding = 'UTF-8';
				var raw = JSON.parse(readFileContent(f));
				var o = fxClean(raw);

				// a saved empty list is a choice (every group deleted), not 'use the defaults'
				if (raw != null && typeof raw == 'object' && typeof raw.length == 'number' && raw.length == 0) return o;

				if (o.length) return o;
			} catch (e) { }
		}
		return JSON.parse(JSON.stringify(FX_DEFAULTS));
	}

	PGN.register('fx.list', function (args) {
		var list = [];

		for (var i = 0; i < app.effects.length; i++) {
			var e = app.effects[i];

			if (!e.displayName || !e.matchName) continue;
			list.push({ n: e.displayName, m: e.matchName, c: e.category || '' });
		}
		list.sort(function (a, b) {
			if (a.c != b.c) return a.c < b.c ? -1 : 1;
			return a.n.toLowerCase() < b.n.toLowerCase() ? -1 : 1;
		});
		return { msg: '', data: { effects: list } };
	});

	PGN.register('fx.get', function (args) {
		return { msg: '', data: { groups: fxLoad() } };
	});

	PGN.register('fx.set', function (args) {
		var groups = fxClean(args.groups);
		var f = fxFile();

		f.encoding = 'UTF-8';
		PGN.writeJSON(f, groups, true);
		return { msg: 'Efeitos salvos', data: { groups: groups } };
	});

	PGN.register('fx.reset', function (args) {
		var f = fxFile();

		if (f.exists) f.remove();
		return { msg: 'Efeitos padrão', data: { groups: JSON.parse(JSON.stringify(FX_DEFAULTS)) } };
	});

	PGN.register('fx.apply', function (args) {
		if (!args.m) PGN.fail('efeito não definido');
		return addFx(String(args.m), String(args.name || args.m).toLowerCase(), String(args.name || args.m), FX_SETUP[args.m]);
	});
})();
