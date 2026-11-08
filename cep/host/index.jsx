/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/*

---------------------------------------------------------------
> PROMO GNEWS · CEP host bootstrap
---------------------------------------------------------------

  loaded once by the panel extension (manifest ScriptPath).
  the modeless windows reuse this same engine: when they find
  PGN not ready they evaluate this file again (see bridge.js).

  the script logic lives in the classic ScriptUI sources
  ('source/' folder), loaded from <extension>/host/src:
    · packaged build → copied by  node tools/build-cep.js
    · dev            → linked by  node tools/build-cep.js --dev

*/

var vStr = 'v3.0';

// everything runs at the top level, on purpose: ExtendScript's $.evalFile evaluates in the
// CALLER's scope, so loading the sources from inside a function kept PGN and the classic
// globals local to it (the loader then saw no PGN, or an old global one)
var PGN_hostDir = $.global.PGN_HOST_PATH ? new Folder($.global.PGN_HOST_PATH) : new File($.fileName).parent;
// sources: <root>/source (network / repository) first, host/src only for a packaged build —
// a stale host/src copy must never win over the live source folder
var PGN_srcDir = new Folder(PGN_hostDir.fsName + '/../../source');

if (!new File(PGN_srcDir.fsName + '/globals.js').exists) PGN_srcDir = new Folder(PGN_hostDir.fsName + '/src');

if (!new File(PGN_srcDir.fsName + '/globals.js').exists) {
	// no popup: the page shows it
	$.global.PGN_BOOT_ERR = 'fontes do script n\u00E3o encontrados: ' + new Folder(PGN_hostDir.fsName + '/../../source').fsName;
} else {
	$.global.PGN_SRC = PGN_srcDir.fsName;
	$.global.PGN_HOST = PGN_hostDir.fsName;

	// no modal popup while the host loads: globals.js keeps its network warning in PGN_BOOT_MSG
	// (the panel turns the selection dot red); alert() is also muted as a fallback
	var PGN_bootAlert = $.global.alert;

	try {
		$.global.alert = function (m) { $.global.PGN_BOOT_MSG = String(m); };
	} catch (e) { }
	try {
		// classic globals + every library (json, functions, expressions, icons, shape templates)...
		$.evalFile(PGN_srcDir.fsName + '/globals.js');

		// Windows + macOS: network shares, shell commands and Windows-only classic helpers...
		$.evalFile(PGN_hostDir.fsName + '/platform.jsx');

		// CEP core + tools...
		$.evalFile(PGN_hostDir.fsName + '/core.jsx');

		var PGN_toolFiles = new Folder(PGN_hostDir.fsName + '/tools').getFiles('*.jsx');

		for (var PGN_t = 0; PGN_t < PGN_toolFiles.length; PGN_t++) {
			try {
				$.evalFile(PGN_toolFiles[PGN_t]);
			} catch (err) {
				$.writeln('PGN: failed to load ' + PGN_toolFiles[PGN_t].name + ' \u2192 ' + err.toString() + ' (line ' + err.line + ')');
			}
		}
	} finally {
		try { $.global.alert = PGN_bootAlert; } catch (e) { }
	}
	PGN.ready = true;
	$.global.PGN = PGN;
}
