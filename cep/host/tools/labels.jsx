/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/*

---------------------------------------------------------------
> PROMO GNEWS · CEP tools · layer label colors
---------------------------------------------------------------

  how After Effects stores a label color (prefs, machine independent):

    section 'Label Preference Color Section 5' · key 'Label Color ID 2 # 1..16'
    value   4 bytes: alpha, red, green, blue  (alpha is always FF)

  getPrefAsString / savePrefAsString move those 4 bytes as a 4 character
  string decoded with the Windows-1252 code page, so #F13D3B is written
  as  'ÿ' (FF) 'ñ' (F1) '=' (3D) ';' (3B). Bytes 0x80..0x9F are the
  only ones that don't map to the same unicode number (0x96 → '–'
  U+2013, 0x9A → 'š' U+0161...), hence the strange strings in the
  classic 'labelsObj'. Names live in 'Label Preference Text Section 7'
  · 'Label Text ID 2 # 1..16' as plain text.

  here colors are always '#RRGGBB'; the code page detail stays inside
  PGN.labels.encode / decode.

    labels.get                      → { colors, names, presets }
    labels.set   { colors, names }  → writes the 16 labels (read back to verify)
    labels       (panel button)     → PROMO preset, same as before

*/

PGN.labels = {
	COLOR_SECTION: 'Label Preference Color Section 5',
	TEXT_SECTION: 'Label Preference Text Section 7',

	// Windows-1252 bytes 0x80..0x9F → unicode (undefined bytes keep their own number)
	CP1252: {
		0x80: 0x20AC, 0x82: 0x201A, 0x83: 0x0192, 0x84: 0x201E, 0x85: 0x2026, 0x86: 0x2020, 0x87: 0x2021,
		0x88: 0x02C6, 0x89: 0x2030, 0x8A: 0x0160, 0x8B: 0x2039, 0x8C: 0x0152, 0x8E: 0x017D,
		0x91: 0x2018, 0x92: 0x2019, 0x93: 0x201C, 0x94: 0x201D, 0x95: 0x2022, 0x96: 0x2013, 0x97: 0x2014,
		0x98: 0x02DC, 0x99: 0x2122, 0x9A: 0x0161, 0x9B: 0x203A, 0x9C: 0x0153, 0x9E: 0x017E, 0x9F: 0x0178
	},

	byteToChar: function (b) {
		var u = PGN.labels.CP1252[b];

		return String.fromCharCode(u == null ? b : u);
	},

	charToByte: function (ch) {
		var code = ch.charCodeAt(0);

		if (code <= 0xFF) return code;
		for (var b in PGN.labels.CP1252) {
			if (PGN.labels.CP1252[b] == code) return parseInt(b, 10);
		}
		return 0x3F; // '?': unknown character
	},

	// '#F13D3B' → 'ÿñ=;'
	encode: function (hex) {
		hex = String(hex).replace(/[^0-9A-Fa-f]/g, '');
		if (hex.length == 3) hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
		if (hex.length != 6) PGN.fail('cor inválida: ' + hex);

		var str = PGN.labels.byteToChar(0xFF);

		for (var i = 0; i < 6; i += 2) str += PGN.labels.byteToChar(parseInt(hex.substr(i, 2), 16));
		return str;
	},

	// 'ÿñ=;' → '#F13D3B'
	decode: function (str) {
		var hex = '#';

		str = String(str || '');
		for (var i = str.length - 3; i < str.length; i++) {
			if (i < 0) { hex += '00'; continue; }
			var h = PGN.labels.charToByte(str.charAt(i)).toString(16).toUpperCase();

			hex += h.length == 1 ? '0' + h : h;
		}
		return hex;
	},

	read: function () {
		var file = PREFType.PREF_Type_MACHINE_INDEPENDENT;
		var colors = [], names = [];

		for (var i = 1; i <= 16; i++) {
			var c = '', n = '';

			try { c = app.preferences.getPrefAsString(PGN.labels.COLOR_SECTION, 'Label Color ID 2 # ' + i, file); } catch (e) { }
			try { n = app.preferences.getPrefAsString(PGN.labels.TEXT_SECTION, 'Label Text ID 2 # ' + i, file); } catch (e) { }
			colors.push(PGN.labels.decode(c));
			names.push(n);
		}
		return { colors: colors, names: names };
	},

	write: function (colors, names) {
		var file = PREFType.PREF_Type_MACHINE_INDEPENDENT;

		for (var i = 1; i <= 16; i++) {
			if (colors && colors[i - 1]) app.preferences.savePrefAsString(PGN.labels.COLOR_SECTION, 'Label Color ID 2 # ' + i, PGN.labels.encode(colors[i - 1]), file);
			if (names && names[i - 1] != null) app.preferences.savePrefAsString(PGN.labels.TEXT_SECTION, 'Label Text ID 2 # ' + i, String(names[i - 1]), file);
		}
		app.preferences.saveToDisk();
		app.preferences.reload();
		PGN.labels.refresh();
	},

	// nudges the timeline so the new colors show up without reopening the comp...
	refresh: function () {
		var aItem = app.project.activeItem;

		if (!(aItem instanceof CompItem)) return;
		try {
			aItem.workAreaStart = aItem.workAreaStart;
			for (var l = 1; l <= aItem.numLayers; l++) aItem.layer(l).selected = aItem.layer(l).selected;
		} catch (e) { }
	},

	// the classic PROMO set ('labelsObj' in globals.js), as hex...
	promo: function () {
		var colors = [], names = [];

		for (var i = 1; i <= 16; i++) {
			colors.push(PGN.labels.decode(labelsObj['l' + i].color));
			names.push(labelsObj['l' + i].name);
		}
		return { name: 'PROMO GNEWS', colors: colors, names: names };
	},

	// After Effects default labels (CC 2014+)...
	adobe: function () {
		return {
			name: 'After Effects',
			colors: ['#B53838', '#E4D84C', '#A9CBC7', '#E5BCC9', '#A9A9CA', '#E7C19E', '#B3C7B3', '#677DE0', '#4AA44C', '#8E2C9A', '#E8920D', '#7F452A', '#F46DD6', '#3DA2A5', '#A89677', '#1E401E'],
			names: ['Red', 'Yellow', 'Aqua', 'Pink', 'Lavender', 'Peach', 'Sea Foam', 'Blue', 'Green', 'Purple', 'Orange', 'Brown', 'Fuchsia', 'Cyan', 'Sandstone', 'Dark Green']
		};
	}
};

PGN.register('labels.get', function (args) {
	var cur = PGN.labels.read();

	return { msg: '', data: { colors: cur.colors, names: cur.names, presets: [PGN.labels.promo(), PGN.labels.adobe()] } };
});

PGN.register('labels.set', function (args) {
	var colors = args.colors, names = args.names;

	if (!(colors instanceof Array) || colors.length != 16) PGN.fail('são 16 cores');
	PGN.labels.write(colors, names);

	// read back: the round trip proves the encoding worked on this system
	var back = PGN.labels.read();
	var bad = 0;

	for (var i = 0; i < 16; i++) {
		if (back.colors[i].toUpperCase() != String(colors[i]).toUpperCase()) bad++;
	}
	if (bad) PGN.fail(bad + ' cor(es) não gravaram como esperado');

	return { msg: 'Labels atualizados', data: { colors: back.colors, names: back.names } };
});

// panel button: PROMO preset in one click (same result as the classic button)...
PGN.register('labels', function (args) {
	var p = PGN.labels.promo();

	PGN.labels.write(p.colors, p.names);
	return 'Labels PROMO aplicados';
});
