/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/*

---------------------------------------------------------------
> PROMO GNEWS · CEP tools · dev tab (devMode)
---------------------------------------------------------------

  port of 'source/layout/contents/dev tab.js'.
    dev.dark      → convert .png icons to the dark theme (import dialog)
    dev.zipTpl    → zip the templates folder
    dev.zipFonts  → zip the fonts folder
  zips go to '~/PROMO-GNEWS-script' when it exists, else the desktop.

*/

(function () {

	function devDest() {
		var destPath = Folder.myDocuments.parent.fsName + '/PROMO-GNEWS-script';

		if (!new Folder(destPath).exists) destPath = Folder.desktop.fsName;
		return destPath;
	}

	function shq(p) {
		return "'" + String(p).replace(/'/g, "'\\''") + "'";
	}

	// zips the CONTENT of a folder (same result as the classic Compress-Archive of every item)...
	function zipFolderContent(folder, zipPath) {
		var zf = new File(zipPath);

		if (zf.exists) zf.remove();

		if (appOs == 'Win') {
			var cmd = 'Compress-Archive -Path \'' + folder.fsName.replace(/'/g, "''") + '\\*\' -DestinationPath \'' +
				zf.fsName.replace(/'/g, "''") + '\' -CompressionLevel Optimal -Force';

			system.callSystem('cmd.exe /c powershell.exe -NoProfile -c "' + cmd + '"');
		} else {
			system.callSystem('cd ' + shq(folder.fsName) + ' && /usr/bin/zip -r -X -q ' + shq(zf.fsName) + ' . -x ".*"');
		}
		return new File(zipPath).exists;
	}

	function zipTool(getFolder, name) {
		return function (args) {
			if (!netAccess()) PGN.fail(netConfigName + ' desativado nas prefer\u00EAncias do AE');
			var folder = getFolder();

			if (PGN.net && PGN.net.local) folder = new Folder(PGN.net.local(folder.fsName, true));
			if (!folder.exists) PGN.fail('pasta inacess\u00EDvel: ' + folder.fsName);

			var dest = devDest();
			var zipPath = dest + '/' + name + '.zip';

			if (!zipFolderContent(folder, zipPath)) PGN.fail('n\u00E3o foi poss\u00EDvel criar ' + name + '.zip');
			openFolder(dest);
			return { msg: name + '.zip criado', data: { path: zipPath } };
		};
	}

	PGN.register('dev.zipTpl', zipTool(function () { return templatesFolder; }, 'templates'));
	PGN.register('dev.zipFonts', zipTool(function () { return fontsFolder; }, 'fonts'));

	PGN.register('dev.dark', function (args) {
		var iconArray = app.project.importFileWithDialog();

		if (!iconArray || !iconArray.length) return '';
		var folderPath = decodeURI(iconArray[0].file.path);
		var count = 0;

		app.beginUndoGroup('dark icons');

		for (var i = 0; i < iconArray.length; i++) {
			try {
				var icon = iconArray[i];
				var compN = deleteFileExt(icon.name).replace(/\s*(light)$/i, '');
				var comp = app.project.items.addComp(compN, icon.width, icon.height, 1, 1, 1);

				comp.bgColor = sTxtColor.dark;
				var aLayer = comp.layers.add(icon);
				var fill = aLayer.property('ADBE Effect Parade').addProperty('ADBE Fill');

				fill.property('ADBE Fill-0002').setValue(sTxtColor.dark);
				comp.saveFrameToPng(0, new File(folderPath + '/' + compN + ' dark.png'));
				comp.remove();
				icon.remove();
				count++;
			} catch (err) { }
		}
		app.endUndoGroup();
		openFolder(folderPath);
		return PGN.n(count, '\u00EDcone convertido', '\u00EDcones convertidos');
	});

})();
