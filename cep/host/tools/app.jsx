/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/*

---------------------------------------------------------------
> PROMO GNEWS · CEP tools · app tab
---------------------------------------------------------------

  port of 'source/layout/contents/app tab.js'.
  ('install fonts' is now the fonts window → windows.jsx fonts.*)

*/

// batchVNDBtn.onClick → 'vinheta nunca desliga' batch...
PGN.register('batch', function (args) {
	var footageArray = app.project.importFileWithDialog();

	if (footageArray == null || footageArray.length == 0) return 'nenhum arquivo importado';

	var count = 0;
	var errArray = [];

	app.beginUndoGroup('batch...');

	for (var i = 0; i < footageArray.length; i++) {
		try {
			var footage = footageArray[i];

			var compN = 'vinheta nunca desliga ' + (i + 1);
			var compW = 1920;
			var compH = 1080;
			var compAspect = 1;
			var compDuration = 6;
			var compFPS = 29.97;

			var comp = app.project.items.addComp(compN, compW, compH, compAspect, compDuration, compFPS);
			comp.layers.add(footage);

			layersVND(comp);
			comp.bgColor = [0, 0, 0];
			comp.hideShyLayers = true;
			comp.comment = 'export';
			count++;

		} catch (err) {
			errArray.push(err.message);
		}
	}
	app.endUndoGroup();

	// projOrgBtn.notify() → organize project...
	if (typeof PGN.tools.org == 'function') PGN.tools.org({});

	var msg = PGN.n(count, 'vinheta criada', 'vinhetas criadas');

	if (errArray.length > 0) msg += ' · ' + PGN.n(errArray.length, 'erro') + ': ' + errArray[0];
	return msg;
});

//---------------------------------------------------------

// copyAMEPresetsBtn: left click → install | right click → open presets folder...
PGN.register('ame', function (args) {
	if (!netAccess()) PGN.fail(netConfigName + ' desativado nas preferências do AE');

	var unzipPath = scriptPreferencesPath + '/AME presets';

	if (args.alt === true) {
		var templatesAMEFolder = new Folder(unzipPath);

		if (!templatesAMEFolder.exists) templatesAMEFolder.create();
		openFolder(unzipPath);

		return 'Pasta de presets aberta';
	}
	var url = repoURL + '/raw/main/downloads/AME.zip';
	var tmpPath = scriptPreferencesPath + '/temp';
	var tmpFolder = new Folder(tmpPath);
	var amePath = '~/Documents/Adobe/Adobe Media Encoder';
	var ameFolder = new Folder(amePath);
	var vFolders = ameFolder.getFiles();
	var zipPath = tmpPath + '/AME.zip';
	var installed = 0;

	if (!tmpFolder.exists) tmpFolder.create();

	getURLContent([url], [tmpPath]);
	unzipContent(zipPath, unzipPath);

	for (var i = 0; i < vFolders.length; i++) {
		var presetsAMEPath = decodeURI(vFolders[i]).toString() + '/Presets';
		var presetsAMEFolder = new Folder(presetsAMEPath);

		if (presetsAMEFolder.exists) {
			try {
				copyFolderContentContent(unzipPath, presetsAMEPath);
				installed++;
			} catch (err) { }
		}
	}
	removeFolder(tmpFolder); // → delete temp folder

	if (installed == 0) PGN.fail('nenhuma versão do Media Encoder encontrada');
	return 'Presets do AME instalados';
});

//---------------------------------------------------------

// setupProjBtn.onClick...
PGN.register('psetup', function (args) {
	app.beginUndoGroup('setup project');

	app.project.bitsPerChannel = 8;
	app.project.expressionEngine = 'javascript-1.0';
	app.project.linearBlending = true;
	app.project.timeDisplayType = TimeDisplayType.TIMECODE;
	app.project.workingSpace = 'Rec.709 Gamma 2.4';

	app.endUndoGroup();

	return 'Projeto configurado';
});

//---------------------------------------------------------

// setupLabsBtn.onClick...
PGN.register('labels', function (args) {
	var prefFile = PREFType.PREF_Type_MACHINE_INDEPENDENT;

	app.beginUndoGroup('setup layer labels');

	for (var i = 1; i < 17; i++) {
		var color = labelsObj['l' + i].color;
		var name = labelsObj['l' + i].name;

		var sectionName = 'Label Preference Color Section 5';
		var keyName = 'Label Color ID 2 # ' + i;
		app.preferences.savePrefAsString(sectionName, keyName, color, prefFile);

		sectionName = 'Label Preference Text Section 7';
		keyName = 'Label Text ID 2 # ' + i;
		app.preferences.savePrefAsString(sectionName, keyName, name, prefFile);
	}
	app.preferences.saveToDisk();
	app.preferences.reload();

	app.endUndoGroup();

	// refresh UI ?!...
	var aItem = app.project.activeItem;

	if (aItem instanceof CompItem) {
		var st = aItem.workAreaStart;
		aItem.workAreaStart = st;

		for (var l = 1; l <= aItem.numLayers; l++) {
			var aLayer = aItem.layer(l);
			var sl = aLayer.selected;
			aLayer.selected = sl;
		}
	}
	return 'Labels configurados';
});

//---------------------------------------------------------

// setupCompBtn: left click → horizontal 1920x1080 | right click → vertical 606x1080...
PGN.register('csetup', function (args) {
	var aItem = app.project.activeItem;

	if (!(aItem instanceof CompItem)) PGN.fail('nenhuma comp ativa');

	var vertical = args.alt === true || args.vertical === true;

	app.beginUndoGroup('setup comp');

	aItem.height = 1080;
	aItem.width = vertical ? 606 : 1920;
	aItem.frameRate = 29.97;
	aItem.pixelAspect = 1;
	aItem.bgColor = [0, 0, 0];
	aItem.preserveNestedFrameRate = true;
	aItem.displayStartTime = 0;
	aItem.workAreaStart = 0;
	aItem.workAreaDuration = aItem.duration;

	app.endUndoGroup();

	return 'Comp configurada (' + (vertical ? 'vertical' : 'horizontal') + ')';
});
