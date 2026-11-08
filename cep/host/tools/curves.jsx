/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/*

---------------------------------------------------------------
> PROMO GNEWS · CEP tools · curve as an expression
---------------------------------------------------------------

  the curves window draws a cubic bezier from (0,0) to (1,1) with
  the control points (out, 0) and (1 - in, 1) — out / in are the
  influence percentages. 'inf.expr' writes an expression that
  evaluates exactly that curve between every pair of keyframes:

    t (time between the two keys, 0..1)  →  solve x(u) = t  →  y(u)
    value = linear(y, key(n).value, key(n + 1).value)

  y stays inside 0..1 (control points on y = 0 and y = 1), so linear()
  never clamps it and works for 1D, 2D, 3D and color properties.
  the keyframes stay untouched; the expression only reshapes the timing.

    inf.expr        { out, in }  → selected properties with 2+ keys
    inf.exprRemove                → removes only this script's expression

  the window's curve presets, saved per user in '<script prefs>/curves.json':

    inf.presets.get               → { presets: [[out, in], ...] }
    inf.presets.set { presets }   → saves (1..100, no repeats, max 24)
    inf.presets.reset             → back to the defaults

*/

(function () {

	var MARK = '// PROMO GNEWS · curva';

	function num(v, def) {
		v = parseFloat(v);
		if (isNaN(v)) v = def;
		return Math.max(0, Math.min(100, v));
	}

	function curveExpression(outInf, inInf) {
		var x1 = (outInf / 100).toFixed(4);
		var x2 = (1 - inInf / 100).toFixed(4);

		return [
			MARK + ' · saída ' + Math.round(outInf) + '% · entrada ' + Math.round(inInf) + '%',
			'var x1 = ' + x1 + ', x2 = ' + x2 + ';',
			'function bz(a, b, u) { var v = 1 - u; return 3 * v * v * u * a + 3 * v * u * u * b + u * u * u; }',
			'function ease(t) {',
			'\tvar lo = 0, hi = 1, u = t;',
			'\tfor (var i = 0; i < 24; i++) {',
			'\t\tvar x = bz(x1, x2, u);',
			'\t\tif (Math.abs(x - t) < 1e-6) break;',
			'\t\tif (x < t) lo = u; else hi = u;',
			'\t\tu = (lo + hi) / 2;',
			'\t}',
			'\treturn bz(0, 1, u);',
			'}',
			'if (numKeys < 2) {',
			'\tvalue;',
			'} else {',
			'\tvar n = nearestKey(time).index;',
			'\tif (key(n).time > time) n--;',
			'\tif (n < 1) {',
			'\t\tkey(1).value;',
			'\t} else if (n >= numKeys) {',
			'\t\tkey(numKeys).value;',
			'\t} else {',
			'\t\tvar k1 = key(n), k2 = key(n + 1);',
			'\t\tlinear(ease((time - k1.time) / (k2.time - k1.time)), k1.value, k2.value);',
			'\t}',
			'}'
		].join('\n');
	}

	// selected properties (not groups) with at least 2 keyframes...
	function targets(min) {
		var comp = PGN.comp();
		var layers = comp.selectedLayers;
		var list = [];

		for (var l = 0; l < layers.length; l++) {
			var props = layers[l].selectedProperties;

			for (var p = 0; p < props.length; p++) {
				var prop = props[p];

				if (prop.propertyType != PropertyType.PROPERTY) continue;
				if (!prop.canSetExpression) continue;
				if (prop.numKeys < min) continue;
				list.push(prop);
			}
		}
		return list;
	}

	PGN.register('inf.expr', function (args) {
		var outInf = num(args.out, 33);
		var inInf = num(args['in'], 33);
		var props = targets(2);

		if (!props.length) PGN.fail('selecione propriedades com 2 keyframes ou mais');

		var expr = curveExpression(outInf, inInf);
		var skipped = 0;

		app.beginUndoGroup('curve expression');

		for (var i = 0; i < props.length; i++) {
			// never overwrite someone else's expression...
			if (props[i].expression != '' && props[i].expression.indexOf(MARK) != 0) {
				skipped++;
				continue;
			}
			props[i].expression = expr;
		}
		app.endUndoGroup();

		var done = props.length - skipped;

		if (!done) PGN.fail('as propriedades já têm outra expressão');
		return PGN.n(done, 'curva aplicada', 'curvas aplicadas') + ' como expressão' + (skipped ? ' · ' + skipped + ' com outra expressão' : '');
	});

	PGN.register('inf.exprRemove', function (args) {
		var props = targets(0);
		var count = 0;

		app.beginUndoGroup('remove curve expression');

		for (var i = 0; i < props.length; i++) {
			if (props[i].expression.indexOf(MARK) == 0) {
				props[i].expression = '';
				count++;
			}
		}
		app.endUndoGroup();

		if (!count) PGN.fail('nenhuma curva por expressão nas propriedades selecionadas');
		return PGN.n(count, 'expressão removida', 'expressões removidas');
	});

	//---------------------------------------------------------

	// curve presets of the window ([out, in] influence pairs)
	var PRESETS = [[33, 33], [66, 66], [90, 90], [85, 15], [15, 85], [100, 50]];

	function presetFile() {
		var folder = new Folder(scriptPreferencesPath);

		if (!folder.exists) folder.create();
		return new File(scriptPreferencesPath + '/curves.json');
	}

	function cleanPresets(list) {
		var out = [];
		var seen = {};

		if (list == null || typeof list != 'object' || typeof list.length != 'number') return out;
		for (var i = 0; i < list.length && out.length < 24; i++) {
			var p = list[i];

			if (p == null || typeof p != 'object' || !(p.length >= 2)) continue;
			var o = Math.round(num(p[0], 33));
			var n = Math.round(num(p[1], 33));

			if (o < 1) o = 1;
			if (n < 1) n = 1;
			if (seen[o + '/' + n]) continue;
			seen[o + '/' + n] = true;
			out.push([o, n]);
		}
		return out;
	}

	function loadPresets() {
		var f = presetFile();

		if (f.exists) {
			try {
				f.encoding = 'UTF-8';
				var o = JSON.parse(readFileContent(f));

				// an empty list is a choice too (all deleted)
				if (o != null && typeof o == 'object' && typeof o.length == 'number') return cleanPresets(o);
			} catch (e) { }
		}
		return cleanPresets(PRESETS);
	}

	PGN.register('inf.presets.get', function (args) {
		return { msg: '', data: { presets: loadPresets(), defaults: cleanPresets(PRESETS) } };
	});

	PGN.register('inf.presets.set', function (args) {
		var list = cleanPresets(args.presets);
		var f = presetFile();

		f.encoding = 'UTF-8';
		writeFileContent(f, JSON.stringify(list));
		return { msg: args.msg ? String(args.msg) : 'Presets salvos', data: { presets: list } };
	});

	PGN.register('inf.presets.reset', function (args) {
		var f = presetFile();

		if (f.exists) f.remove();
		return { msg: 'Presets padr\u00E3o', data: { presets: cleanPresets(PRESETS) } };
	});

})();
