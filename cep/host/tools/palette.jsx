/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/*

---------------------------------------------------------------
> PROMO GNEWS · CEP tools · paleta (seção Marca)
---------------------------------------------------------------

  the color swatches of the bar's 'Marca' section, editable in the
  preferences. saved per user in '<script prefs>/palette.json':

    [{ name: 'marca', colors: ['#E53131', ...] }, ...]

  names shown in the bar come from the client (automatic, pt-BR).

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
			var list = gr.colors instanceof Array ? gr.colors : [];

			for (var c = 0; c < list.length; c++) {
				var hex = String(list[c] || '').replace(/^\s+|\s+$/g, '').replace(/^#/, '').toUpperCase();

				if (/^[0-9A-F]{3}$/.test(hex)) hex = hex.replace(/(.)/g, '$1$1');
				if (/^[0-9A-F]{6}$/.test(hex)) colors.push('#' + hex);
			}
			out.push({ name: String(gr.name || 'grupo').substr(0, 30), colors: colors });
		}
		return out;
	}

	function load() {
		var f = file();

		if (f.exists) {
			try {
				f.encoding = 'UTF-8';
				var o = clean(JSON.parse(readFileContent(f)));

				if (o.length) return o;
			} catch (e) { }
		}
		return clone(DEFAULTS);
	}

	PGN.register('palette.get', function (args) {
		return { msg: '', data: { groups: load(), defaults: clone(DEFAULTS) } };
	});

	PGN.register('palette.set', function (args) {
		var groups = clean(args.groups);
		var f = file();

		f.encoding = 'UTF-8';
		writeFileContent(f, JSON.stringify(groups, null, '\t'));
		return { msg: 'Paleta salva', data: { groups: groups } };
	});

	PGN.register('palette.reset', function (args) {
		var f = file();

		if (f.exists) f.remove();
		return { msg: 'Paleta padrão', data: { groups: clone(DEFAULTS) } };
	});

})();
