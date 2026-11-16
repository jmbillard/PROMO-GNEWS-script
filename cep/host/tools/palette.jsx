/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/*

---------------------------------------------------------------
> PROMO GNEWS · CEP tools · paleta (seção Marca)
---------------------------------------------------------------

  the color swatches of the bar's 'Marca' section, editable in the
  preferences. saved per user in '<script prefs>/palette.json':

    [{ name: 'marca', colors: ['#E53131', ...], names: ['', ...] }, ...]

  names[i] is the name the user gave to colors[i]; '' (or no 'names')
  means automatic: the client names it from the hex (pt-BR).

    palette.get                → { groups, defaults }
    palette.set  { groups }    → saves (only valid #RRGGBB kept)
    palette.reset              → back to the defaults

*/

(function () {

	var DEFAULTS = [
		{ name: 'marca', colors: ['#E53131', '#EEFF8C', '#231E1E'] },
		{ name: 'neutros', colors: ['#141414', '#333333', '#4A4A4A', '#B2B2B2', '#F2F2F2'] },
		{ name: 'apoio', colors: ['#F23333', '#FF4D4D', '#FF674D', '#FF8F4D', '#FFC44E', '#FF5A67', '#FF739A', '#FF8CCD', '#B5ADFF', '#80C0FF', '#5CE6A1'] }
	];

	function clone(o) { return JSON.parse(JSON.stringify(o)); }

	function file() {
		var folder = new Folder(scriptPreferencesPath);

		if (!folder.exists) folder.create();
		return new File(scriptPreferencesPath + '/palette.json');
	}

	function clean(groups) {
		var out = [];

		if (!(groups instanceof Array)) return out;
		for (var g = 0; g < groups.length; g++) {
			var gr = groups[g];

			if (!gr || typeof gr != 'object') continue;
			var colors = [];
			var names = [];
			var list = gr.colors instanceof Array ? gr.colors : [];
			var given = gr.names instanceof Array ? gr.names : [];

			for (var c = 0; c < list.length; c++) {
				var hex = String(list[c] || '').replace(/^\s+|\s+$/g, '').replace(/^#/, '').toUpperCase();

				if (/^[0-9A-F]{3}$/.test(hex)) hex = hex.replace(/(.)/g, '$1$1');
				if (!/^[0-9A-F]{6}$/.test(hex)) continue;
				colors.push('#' + hex);
				names.push(String(given[c] || '').replace(/^\s+|\s+$/g, '').substr(0, 40));
			}
			out.push({ name: String(gr.name || 'grupo').substr(0, 30), colors: colors, names: names });
		}
		return out;
	}

	function load() {
		var f = file();

		if (f.exists) {
			try {
				f.encoding = 'UTF-8';
				var raw = JSON.parse(readFileContent(f));
				var o = clean(raw);

				// a saved empty list is a choice (every group deleted), not 'use the defaults'
				if (raw != null && typeof raw == 'object' && typeof raw.length == 'number' && raw.length == 0) return o;

				if (o.length) return o;
			} catch (e) { }
		}
		return clone(DEFAULTS);
	}

	// the saved palette, for other tools (brand.jsx · pal)
	PGN.palette = { load: load, clean: clean };

	PGN.register('palette.get', function (args) {
		return { msg: '', data: { groups: load(), defaults: clone(DEFAULTS) } };
	});

	PGN.register('palette.set', function (args) {
		var groups = clean(args.groups);
		var f = file();

		f.encoding = 'UTF-8';
		PGN.writeJSON(f, groups, true);
		return { msg: 'Paleta salva', data: { groups: groups } };
	});

	PGN.register('palette.reset', function (args) {
		var f = file();

		if (f.exists) f.remove();
		return { msg: 'Paleta padrão', data: { groups: clone(DEFAULTS) } };
	});

})();
