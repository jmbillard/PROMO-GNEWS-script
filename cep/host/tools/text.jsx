/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/*

---------------------------------------------------------------
> PROMO GNEWS · CEP tools · text
---------------------------------------------------------------

  ported from the classic ScriptUI 'text' tab.

    up      UPPER CASE
    low     lower case
    tit     Title Case (String.prototype.toTitleCase)
    clean   deletes consecutive spaces and line breaks (cleanText)
    split   divides consecutive spaces / line breaks / '---' in columns
            (columnText) → source layer disabled, columns placed side
            by side with a 50px gap.
    brk     line breaker (lineBreak)
              args.chars → character limit per line (default 60).
              classic UI: slider 5–100 (default 60), or a typed value
              via double-click on the label (min 5, no max).
              values < 5 become 5. a word longer than the limit raises
              the limit to (word length + 1), as in the original.

  only text layers are changed; other selected layers are skipped.

*/

(function () {

	function textLayers() {
		var aItem = app.project.activeItem;
		var selLayers = aItem instanceof CompItem ? aItem.selectedLayers : [];

		// error...
		if (selLayers.length == 0) PGN.fail('nenhum layer de texto selecionado');
		return selLayers;
	}

	// changes the text of the document (keeps its style) — on every keyframe when
	// Source Text is animated (setValue throws 'has keyframes' there)
	function editText(layer, fn) {
		var src = layer.property('ADBE Text Properties').property('ADBE Text Document');
		var doc;

		if (src.numKeys == 0) {
			doc = src.value;
			doc.text = fn(String(doc.text));
			src.setValue(doc);
			return;
		}
		for (var k = 1; k <= src.numKeys; k++) {
			doc = src.keyValue(k);
			doc.text = fn(String(doc.text));
			src.setValueAtKey(k, doc);
		}
	}

	// Source Text with keyframes: the classic routines (clean, break) only set one value
	function animatedText(layer) {
		return layer.property('ADBE Text Properties').property('ADBE Text Document').numKeys > 0;
	}

	function setCase(undoName, fn) {
		var selLayers = textLayers();
		var count = 0;

		app.beginUndoGroup(undoName);

		for (var i = 0; i < selLayers.length; i++) {
			if (!(selLayers[i] instanceof TextLayer)) continue;
			if (textContent(selLayers[i]) == '' && !animatedText(selLayers[i])) continue;
			editText(selLayers[i], fn);
			count++;
		}
		app.endUndoGroup();

		if (count == 0) PGN.fail('nenhum layer de texto selecionado');
		return count;
	}

	//---------------------------------------------------------

	PGN.register('up', function (args) {
		var count = setCase('text to upper case', function (txt) {
			return txt.toUpperCase();
		});

		return PGN.n(count, 'layer') + ' em caixa alta';
	});

	PGN.register('low', function (args) {
		var count = setCase('text to lower case', function (txt) {
			return txt.toLowerCase();
		});

		return PGN.n(count, 'layer') + ' em caixa baixa';
	});

	PGN.register('tit', function (args) {
		var count = setCase('text to title case', function (txt) {
			return txt.toTitleCase();
		});

		return PGN.n(count, 'layer') + ' em title case';
	});

	//---------------------------------------------------------

	PGN.register('clean', function (args) {
		var selLayers = textLayers();
		var count = 0;

		app.beginUndoGroup('clean text');

		var skipped = 0;

		for (var i = 0; i < selLayers.length; i++) {
			if (!(selLayers[i] instanceof TextLayer)) continue;
			if (animatedText(selLayers[i])) { skipped++; continue; }
			cleanText(selLayers[i]);
			count++;
		}
		app.endUndoGroup();

		if (count == 0) PGN.fail(skipped ? 'texto com keyframes: limpe sem os keyframes do Source Text' : 'nenhum layer de texto selecionado');
		return PGN.n(count, 'texto limpo', 'textos limpos') + (skipped ? ' \u00B7 ' + skipped + ' com keyframes (pulados)' : '');
	});

	//---------------------------------------------------------

	PGN.register('split', function (args) {
		var selLayers = textLayers();
		var count = 0;

		app.beginUndoGroup('break text columns');

		for (var i = 0; i < selLayers.length; i++) {
			var selLayer = selLayers[i];

			if (!(selLayer instanceof TextLayer)) continue;

			var colPos = selLayer.position.value;
			var col = columnText(selLayer);

			// nothing to split (classic handler stopped here)...
			if (col.length < 2) continue;
			selLayer.enabled = false;
			// the source's position is in its parent's space: the columns share that parent
			col[0].parent = selLayer.parent;
			col[0].position.setValue(colPos);

			for (var c = 1; c < col.length; c++) {
				var exp = '[parent.sourceRectAtTime().width / 2 + 50 + sourceRectAtTime().width / 2, 0];';

				col[c].parent = col[c - 1];
				col[c].position.expression = exp;
				var cPos = col[c].position.value;

				col[c].position.expression = '';
				col[c].position.setValue(cPos);
				col[c].parent = selLayer.parent; // keeps its place (AE compensates)
			}
			count += col.length;
		}
		app.endUndoGroup();

		if (count == 0) PGN.fail('nenhuma coluna encontrada no texto');
		return PGN.n(count, 'coluna') + ' criadas';
	});

	//---------------------------------------------------------

	PGN.register('brk', function (args) {
		var aItem = PGN.comp();
		var selLayers = aItem.selectedLayers;
		var chars = parseInt(args.chars, 10);
		var count = 0;

		if (isNaN(chars)) chars = 60;
		if (chars < 5) chars = 5;

		if (selLayers.length == 0) PGN.fail('nenhum layer de texto selecionado');

		app.beginUndoGroup('break text');

		var skipped = 0;

		for (var i = 0; i < selLayers.length; i++) {
			if (!(selLayers[i] instanceof TextLayer)) continue;
			if (animatedText(selLayers[i])) { skipped++; continue; }
			lineBreak(selLayers[i], chars);
			count++;
		}
		app.endUndoGroup();

		if (count == 0) PGN.fail(skipped ? 'texto com keyframes: quebre sem os keyframes do Source Text' : 'nenhum layer de texto selecionado');
		return { msg: 'texto quebrado em ' + chars + ' caracteres' + (skipped ? ' \u00B7 ' + skipped + ' com keyframes (pulados)' : ''), data: { chars: chars } };
	});

})();
