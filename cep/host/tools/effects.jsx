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

})();
