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

(function () {
	var hostFolder = new File($.fileName).parent;
	// classic sources: host/src (package or dev link) or <root>/source (network / repository)...
	var srcFolder = new Folder(hostFolder.fsName + '/src');

	if (!new File(srcFolder.fsName + '/globals.js').exists) srcFolder = new Folder(hostFolder.fsName + '/../../source');
	if (!new File(srcFolder.fsName + '/globals.js').exists) {
		alert('PROMO GNEWS: fontes do script n\u00E3o encontrados (source/)');
		return;
	}
	$.global.PGN_SRC = srcFolder.fsName;
	$.global.PGN_HOST = hostFolder.fsName;

	// no modal popup while the host loads (classic network checks, 'drive N: is not available'…):
	// a popup would freeze After Effects over the panel's opening animation. The message is kept
	// for the panel, which shows a small red dot on the logo instead (PGN.net.offline / PGN_BOOT_MSG)
	var bootAlert = $.global.alert;

	try {
		$.global.alert = function (m) { $.global.PGN_BOOT_MSG = String(m); };
	} catch (e) { }
	try {
		// classic globals + every library (json, functions, expressions, icons, shape templates)...
		$.evalFile(srcFolder.fsName + '/globals.js');

		// Windows + macOS: network shares, shell commands and Windows-only classic helpers...
		$.evalFile(hostFolder.fsName + '/platform.jsx');

		// CEP core + tools...
		$.evalFile(hostFolder.fsName + '/core.jsx');

		var toolFiles = new Folder(hostFolder.fsName + '/tools').getFiles('*.jsx');

		for (var t = 0; t < toolFiles.length; t++) {
			try {
				$.evalFile(toolFiles[t]);
			} catch (err) {
				$.writeln('PGN: failed to load ' + toolFiles[t].name + ' \u2192 ' + err.toString() + ' (line ' + err.line + ')');
			}
		}
	} finally {
		try { $.global.alert = bootAlert; } catch (e) { }
	}
	PGN.ready = true;
})();
