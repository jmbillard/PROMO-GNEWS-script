/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/*

---------------------------------------------------------------
> PROMO GNEWS · CEP tools · app tab
---------------------------------------------------------------

  port of 'source/layout/contents/app tab.js'.
  ('install fonts' is now the fonts window → windows.jsx fonts.*)

*/

/*

  batchVNDBtn.onClick → 'vinheta nunca desliga' batch (job):
    begin → import dialog (app.project.importFileWithDialog)
    steps → one vinheta comp per imported item (time-boxed slices),
            then the organize machine (projOrgBtn.notify() → jobs.jsx)

*/
PGN.registerJob('batch', {
	begin: function (args) {
		var footageArray = app.project.importFileWithDialog();
		var n = footageArray == null ? 0 : footageArray.length;
		var st = { total: n, done: 0, label: 'criando vinhetas 0/' + n, phase: 'comps', files: footageArray, i: 0, count: 0, errs: [] };

		if (n == 0) {
			st.none = true;
			st.finished = true;
		}
		return st;
	},

	step: function (st) {
		if (st.phase == 'org') {
			PGN.jk.orgStep(st);
			if (st.org.finished) st.finished = true;
			return st;
		}
		var t0 = PGN.jk.now();

		try {
			while (st.i < st.files.length) {
				var i = st.i;

				st.i++;
				try {
					var footage = st.files[i];

					var compN = 'vinheta nunca desliga ' + (i + 1);
					var compW = 1920;
					var compH = 1080;
					var compAspect = 1;
					var compDuration = 6;
					var compFPS = 29.97;

					PGN.jk.touch(st, 'batch...');

					var comp = app.project.items.addComp(compN, compW, compH, compAspect, compDuration, compFPS);

					comp.layers.add(footage);

					layersVND(comp);
					comp.bgColor = [0, 0, 0];
					comp.hideShyLayers = true;
					comp.comment = 'export';
					st.count++;

				} catch (err) {
					st.errs.push(err.message);
				}
				st.done = st.i;
				st.label = 'criando vinhetas ' + st.i + '/' + st.total;
				if (!PGN.jk.more(t0)) break;
			}
		} finally {
			PGN.jk.close(st);
		}
		// projOrgBtn.notify() → organize project...
		if (st.i >= st.files.length) {
			st.files = [];
			st.phase = 'org';
			PGN.jk.orgInit(st);
		}
		return st;
	},

	finish: function (st) {
		if (st.none) return 'nenhum arquivo importado';

		var org = PGN.jk.orgMsg(st);
		var msg = PGN.n(st.count, 'vinheta criada', 'vinhetas criadas');

		if (st.errs.length > 0) msg += ' \u00b7 ' + PGN.n(st.errs.length, 'erro') + ': ' + st.errs[0];
		if (org.data.missing.length > 0 && org.msg != 'Projeto organizado') msg += org.msg.replace('Projeto organizado', '');
		return { msg: msg, data: { count: st.count, errors: st.errs, missing: org.data.missing } };
	},

	// undo the organize groups, then the 'batch...' ones...
	cancel: function (st) {
		PGN.jk.rollback(st);
	}
});

//---------------------------------------------------------

// copyAMEPresetsBtn: left click → install | right click → open presets folder...
PGN.register('ame', function (args) {
	if (!netAccess()) PGN.fail(netConfigName + ' desativado nas prefer\u00eancias do AE');

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
	var vFolders = ameFolder.exists ? ameFolder.getFiles() : [];
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

	if (installed == 0) PGN.fail('nenhuma vers\u00e3o do Media Encoder encontrada');
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

// label colors / names: tools/labels.jsx (editor window + PROMO preset)

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
