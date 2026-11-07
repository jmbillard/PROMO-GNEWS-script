/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/*

---------------------------------------------------------------
> PROMO GNEWS · CEP tools · controls tab
---------------------------------------------------------------

  ported from 'source/layout/contents/controls tab.js'

    null    → create parent null   (args.keys, args.exp)
    nullc   → centered null
    parent  → select parent
    child   → select children

*/

(function () {

	// createNull() (layers lib) reads a global 'aItem' when the
	// null type is a regular null layer... make sure it points to the active comp.
	function newNull(comp) {
		$.global.aItem = comp;
		return createNull(nullType);
	}

	// shared selection routine for 'parent' and 'child'...
	function selectLayers(comp, selLayers, targets) {
		var i;

		for (i = 0; i < selLayers.length; i++) {
			selLayers[i].selected = false;
		}
		for (i = 0; i < targets.length; i++) {

			if (targets[i].shy && comp.hideShyLayers) {
				targets[i].shy = false;
			}
			targets[i].selected = true;
		}
	}

	function selectCtrlComp(comp) {
		try {
			comp.layer('ctrl_comp').selected = true;
			return true;
		} catch (err) { }
		return false;
	}

	//---------------------------------------------------------

	PGN.register('null', function (args) {
		var comp = PGN.comp();
		var selLayers = comp.selectedLayers;

		app.beginUndoGroup('create null');

		if (selLayers.length == 0) {
			newNull(comp);
			app.endUndoGroup();
			return 'Null criado';
		}
		for (var l = 0; l < selLayers.length; l++) {
			var selLayer = selLayers[l];
			var nullLayer = newNull(comp);
			nullLayer.moveBefore(selLayer);

			if (selLayer.hasTrackMatte && appV < 23) {
				nullLayer.moveBefore(comp.layer(selLayer.index - 1));
			}

			nullLayer.name += deletePrefix(selLayer.name)
				.replaceSpecialCharacters();

			if (nullLayer.name == selLayer.name) nullLayer.name = nameInc(nullLayer.name);

			setHierarchy(selLayer, nullLayer);
			nullLayer.inPoint = selLayer.inPoint;
			nullLayer.outPoint = selLayer.outPoint;

			if (args.keys === true) cloneKeys(selLayer, nullLayer);
			if (args.exp === true) cloneExpressions(selLayer, nullLayer);
		}
		app.endUndoGroup();

		return selLayers.length == 1 ? 'Null criado' : selLayers.length + ' nulls criados';
	});

	//---------------------------------------------------------

	PGN.register('nullc', function (args) {
		var selLayers = PGN.layers(2);
		var comp = PGN.comp();
		var lIndex = comp.numLayers;

		for (var i = 0; i < selLayers.length; i++) {
			selLayers[i].parent = null;

			if (selLayers[i].index < lIndex) lIndex = i;
		}
		app.beginUndoGroup('create centered null');

		var nullLayer = newNull(comp);

		nullLayer.name += 'center';
		nullLayer.moveBefore(selLayers[lIndex]);
		nullLayer
			.property('ADBE Transform Group')
			.property('ADBE Position')
			.setValue(findCenter(selLayers));

		for (var s = 0; s < selLayers.length; s++) {
			selLayers[s].parent = nullLayer;
		}
		app.endUndoGroup();

		return 'Null centralizado criado';
	});

	//---------------------------------------------------------

	PGN.register('parent', function (args) {
		var comp = PGN.comp();
		var selLayers = comp.selectedLayers;
		var upArray = [];
		var msg = '';

		app.beginUndoGroup('select parent');

		if (selLayers.length > 0) {

			for (var i = 0; i < selLayers.length; i++) {

				if (selLayers[i].parent != null) {
					upArray.push(selLayers[i].parent);
				}
			}
			if (upArray.length > 0) {
				selectLayers(comp, selLayers, upArray);
				msg = PGN.n(upArray.length, 'parent selecionado', 'parents selecionados');
			} else {
				msg = 'nenhum parent encontrado';
			}
		} else {
			msg = selectCtrlComp(comp) ? 'ctrl_comp selecionado' : 'nenhum layer selecionado';
		}
		app.endUndoGroup();

		return msg;
	});

	//---------------------------------------------------------

	PGN.register('child', function (args) {
		var comp = PGN.comp();
		var selLayers = comp.selectedLayers;
		var dwnArray = [];
		var msg = '';

		app.beginUndoGroup('select children');

		if (selLayers.length > 0) {

			for (var i = 0; i < selLayers.length; i++) {

				for (var l = 1; l <= comp.numLayers; l++) {
					var lParent = comp.layer(l).parent;

					if (lParent == selLayers[i]) {
						dwnArray.push(comp.layer(l));
					}
				}
			}
			if (dwnArray.length > 0) {
				selectLayers(comp, selLayers, dwnArray);
				msg = PGN.n(dwnArray.length, 'child selecionado', 'children selecionados');
			} else {
				msg = 'nenhum child encontrado';
			}
		} else {
			msg = selectCtrlComp(comp) ? 'ctrl_comp selecionado' : 'nenhum layer selecionado';
		}
		app.endUndoGroup();

		return msg;
	});

})();
