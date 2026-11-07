/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/*

---------------------------------------------------------------
> PROMO GNEWS · CEP tools · brand
---------------------------------------------------------------

  ported from 'source/layout/contents/brand tab.js'.

    palettes  returns the GNEWS palettes as hex strings
                data: { main: [...], mono: [...], sec: [...] }
              built from the globals GNEWS_mainColors1 / GNEWS_mainColors2 /
              GNEWS_secColors with rgbToHEX, exactly like the classic
              color buttons (createColorButtons).
    color     args.hex ('#E53131' or 'E53131') → adds an 'ADBE Fill' effect
              named after the hex (uppercase, with '#') to every selected
              layer (batchFill). requires a layer selection.
    pal       color palette as a guide shape layer ('pallet - GNEWS', locked)
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
		PGN.comp();

		app.beginUndoGroup('pallet');

		// colorPallet() already locks transforms with expressions,
		// sets guide layer and locks the layer...
		var palletLayer = colorPallet();

		palletLayer.name = 'pallet - GNEWS';
		palletLayer.guideLayer = true;
		palletLayer.locked = true;

		app.endUndoGroup();

		return 'Paleta criada';
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
