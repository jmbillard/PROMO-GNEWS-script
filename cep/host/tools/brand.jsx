/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/*

---------------------------------------------------------------
> PROMO GNEWS · CEP tools · brand
---------------------------------------------------------------

  ported from the classic ScriptUI 'brand' tab.

    palettes  returns the GNEWS palettes as hex strings
                data: { main: [...], mono: [...], sec: [...] }
              built from the globals GNEWS_mainColors1 / GNEWS_mainColors2 /
              GNEWS_secColors with rgbToHEX, exactly like the classic
              color buttons (createColorButtons).
    color     args.hex ('#E53131' or 'E53131') → adds an 'ADBE Fill' effect
              named after the hex (uppercase, with '#') to every selected
              layer (batchFill). requires a layer selection.
    pal       the palette of the preferences as a guide shape layer
              ('paleta - GNEWS', locked): one column per group, a swatch per
              color, named 'name · #HEX'.
                args.groups → [{ name, colors: [{ hex, name }] }] (the bar
                              sends them with the names it shows); without
                              it, the saved palette (hex only).
    onair     on-air arrow shape layer (shp_arrow)
    logo      GNEWS static logo shape layer (shpMarcaGnewsStatic)
    logoa     GNEWS logo 3s animation: shape layer 'marca_gnews 3s' starting
              at the current time + 'marca_3s' pseudo effect preset.
    ren       rename layers (README 'renomear / sequenciar layers', no
              classic implementation left: reconstructed from the docs)
                args.types → array of 'ftg' | 'sol' | 'shp' | 'txt' | 'cam'
                             | 'lgt' (default: all)
              selected layers, or every layer when nothing is selected.
              new name = prefix + lower case name without special
              characters; text layers use their own content.
    iso       isolate (README 'isolar', reconstructed): every layer NOT
              selected becomes shy and the comp hides shy layers.
                args.alt → undo isolation (all layers un-shy, show shy).

*/

(function () {

	PGN.register('palettes', function (args) {
		function toHex(colorArray) {
			var hexArray = [];

			for (var c = 0; c < colorArray.length; c++) {
				hexArray.push(rgbToHEX(colorArray[c]));
			}
			return hexArray;
		}

		return {
			msg: '',
			data: {
				main: toHex(GNEWS_mainColors1),
				mono: toHex(GNEWS_mainColors2),
				sec: toHex(GNEWS_secColors)
			}
		};
	});

	//---------------------------------------------------------

	PGN.register('color', function (args) {
		var hex = String(args.hex || '').replace(/^#/, '').toUpperCase();

		if (!/^[0-9A-F]{6}$/.test(hex)) PGN.fail('cor inv\u00E1lida');
		hex = '#' + hex;

		var selLayers = PGN.layers(1);
		var count = selLayers.length;

		batchFill(hex, hexToRGB(hex));

		return 'Fill ' + hex + ' aplicado em ' + PGN.n(count, 'layer');
	});

	//---------------------------------------------------------

	PGN.register('pal', function (args) {
		var comp = PGN.comp();
		var groups = [];
		var src = args.groups instanceof Array ? args.groups : null;

		// [{ name, colors: [{ hex, name }] }] from the bar, or the saved palette
		if (src) {
			for (var g = 0; g < src.length; g++) {
				var list = [];
				var cs = src[g] && src[g].colors instanceof Array ? src[g].colors : [];

				for (var c = 0; c < cs.length; c++) {
					var hx = String(cs[c] && cs[c].hex || '').replace(/^#/, '').toUpperCase();

					if (/^[0-9A-F]{6}$/.test(hx)) list.push({ hex: '#' + hx, name: String(cs[c].name || '') });
				}
				if (list.length) groups.push({ name: String(src[g].name || 'grupo'), colors: list });
			}
		} else {
			var saved = PGN.palette.load();

			for (var s = 0; s < saved.length; s++) {
				var l2 = [];

				for (var k = 0; k < saved[s].colors.length; k++) {
					l2.push({ hex: saved[s].colors[k], name: saved[s].names ? saved[s].names[k] || '' : '' });
				}
				if (l2.length) groups.push({ name: saved[s].name, colors: l2 });
			}
		}
		if (!groups.length) PGN.fail('a paleta das prefer\u00EAncias est\u00E1 vazia');

		// swatch size: 50 px with a 10 px gap, smaller when a column would not fit the comp
		var most = 0;

		for (var m = 0; m < groups.length; m++) most = Math.max(most, groups[m].colors.length);
		var gap = 10;
		var sz = Math.max(8, Math.min(50, Math.floor((comp.height - 40) / most) - gap));
		var step = sz + gap;
		var total = 0;

		app.beginUndoGroup('paleta GNEWS');

		var layer = comp.layers.addShape();
		var contents = layer.property('ADBE Root Vectors Group');

		for (var i = 0; i < groups.length; i++) {
			var gr = groups[i];
			var col = contents.addProperty('ADBE Vector Group');
			var top = -((gr.colors.length - 1) * step) / 2;

			col.name = gr.name;
			for (var j = 0; j < gr.colors.length; j++) {
				var it = gr.colors[j];
				var label = (it.name ? it.name + ' \u00B7 ' : '') + it.hex;
				var sw = col.property('ADBE Vectors Group').addProperty('ADBE Vector Group');
				var rect = sw.property('ADBE Vectors Group').addProperty('ADBE Vector Shape - Rect');

				rect.property('ADBE Vector Rect Size').setValue([sz, sz]);
				rect.property('ADBE Vector Rect Position').setValue([0, top + j * step]);
				var fill = sw.property('ADBE Vectors Group').addProperty('ADBE Vector Graphic - Fill');

				fill.property('ADBE Vector Fill Color').setValue(hexToRGB(it.hex));
				fill.name = label;
				sw.name = label;
				total++;
			}
			// columns from the left edge of the comp, vertically centered
			col.property('ADBE Vector Transform Group').property('ADBE Vector Position')
				.setValue([20 + sz / 2 + i * step, comp.height / 2]);
		}

		// locked like the classic palette: transforms by expression, guide, locked
		var tr = layer.property('ADBE Transform Group');

		tr.property('ADBE Anchor Point').expression = '// locked...\n[0,0];';
		tr.property('ADBE Position').expression = '// locked...\n[0,0];';
		tr.property('ADBE Scale').expression = '// locked...\n[100,100];';
		tr.property('ADBE Rotate Z').expression = '// locked...\n0;';
		tr.property('ADBE Opacity').expression = '// locked...\n100;';
		layer.name = 'paleta - GNEWS';
		layer.guideLayer = true;
		layer.selected = false;
		layer.locked = true;

		app.endUndoGroup();

		return 'Paleta criada (' + PGN.n(total, 'cor', 'cores') + ')';
	});

	//---------------------------------------------------------

	PGN.register('onair', function (args) {
		PGN.comp();

		app.beginUndoGroup('logo GNEWS');
		shp_arrow();
		app.endUndoGroup();

		return 'Seta on-air criada';
	});

	PGN.register('logo', function (args) {
		PGN.comp();

		app.beginUndoGroup('logo GNEWS');
		shpMarcaGnewsStatic();
		app.endUndoGroup();

		return 'Logo GNEWS criado';
	});

	PGN.register('logoa', function (args) {
		var aItem = PGN.comp();

		app.beginUndoGroup('logo GNEWS 3s');

		var layer = aItem.layers.addShape();

		layer.startTime = aItem.time;
		layer.name = 'marca_gnews 3s';

		addPseudoEffect('marca_3s', toolMarca3s);
		app.endUndoGroup();

		return 'Logo GNEWS animado criado';
	});

	//---------------------------------------------------------



})();
