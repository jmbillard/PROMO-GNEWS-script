/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/*

---------------------------------------------------------------
> PROMO GNEWS · CEP tools · project tab
---------------------------------------------------------------

  port of 'source/layout/contents/project tab.js'.

  the classic tab kept the project id / name in two edittext
  widgets (globals projId / projName, mirrored in the project
  XMP metadata: dc:identifier / dc:title). here the XMP is the
  source of truth; any tool that uses them also accepts
  args.id / args.name (same sanitizing as the widgets' onChange,
  persisted to the XMP before running).

*/

PGN.proj = {
	namePlaceholder: 'proj name',

	// 'client' (hard news) | 'PROJ ID' (promo)...
	label: function () {
		projIdContent = hardNews ? 'client' : 'PROJ ID';
		return projIdContent;
	},

	netFail: function () {
		if (!netAccess()) PGN.fail(netConfigName + ' desativado nas preferências do AE');
	},

	emptyFail: function () {
		if (app.project.numItems == 0) PGN.fail('projeto vazio');
	},

	// same as projIdTxt.onChange...
	cleanId: function (str) {
		var s = String(str).replaceSpecialCharacters();

		if (hardNews) {
			s = s.toLowerCase();
		} else {
			s = s.replace(/\s/g, '').toUpperCase();
		}
		return s;
	},

	// same as projNameTxt.onChange...
	cleanName: function (str) {
		var s = String(str).replaceSpecialCharacters().toLowerCase();

		if (hardNews) s = s.toUpperCase();
		return s;
	},

	setId: function (str) {
		var label = PGN.proj.label();

		projId = PGN.proj.cleanId(str);
		if (projId != label) setXMPdata('identifier', projId);
		return projId;
	},

	setName: function (str) {
		projName = PGN.proj.cleanName(str);
		setXMPdata('title', projName);
		return projName;
	},

	// same as projBtn.onClick (tab opening) + optional widget edits...
	load: function (args) {
		var label = PGN.proj.label();

		args = args || {};
		if (typeof args.id == 'string') {
			PGN.proj.setId(args.id);
		} else {
			projId = getXMPdata('identifier') == '' ? label : getXMPdata('identifier');
		}
		if (typeof args.name == 'string') {
			PGN.proj.setName(args.name);
		} else {
			projName = getXMPdata('title[1]') == '' ? PGN.proj.namePlaceholder : getXMPdata('title[1]');
		}
		// widgets fall back to their placeholders when empty...
		if (String(projId).trim() == '') projId = label;
		if (String(projName).trim() == '') projName = PGN.proj.namePlaceholder;
	},

	// creator / date metadata stamp used by most project buttons...
	stamp: function () {
		var dateStr = system
			.callSystem('cmd.exe /c date /t')
			.trim();

		setXMPdata('creator', system.userName);
		setXMPdata('date', dateStr);
	},

	// project comps selected in the project panel...
	selectedComps: function () {
		var sel = app.project.selection;
		var count = 0;

		for (var i = 0; i < sel.length; i++) {
			if (sel[i] instanceof CompItem) count++;
		}
		return count;
	},

	// ScriptUI progress window clone (used by organize/collect)...
	runOrganize: function () {
		var done = false;
		var progressWindow = progressDialog('organize project...');
		var enterBtn = progressWindow.children[2].children[0];
		var cancelBtn = progressWindow.children[2].children[1];

		app.beginUndoGroup('organize project');

		progressWindow.onShow = enterBtn.onClick = progressWindow.onEnterKey = function () {
			if (done) return;
			done = true;
			deleteProjectFolders();
			populateProjectFolders(progressWindow);
			deleteEmptyProjectFolders();

			app.endUndoGroup();
			progressWindow.close();
		};

		cancelBtn.onClick = function () {
			progressWindow.close();
			app.endUndoGroup();

			alert('escaping...');
			executeCommandID('Undo organize project');
		};

		progressWindow.show();
		return done;
	}
};

//---------------------------------------------------------

// what the tab displays (projBtn.onClick)...
PGN.register('proj.info', function (args) {
	var label = PGN.proj.label();
	var xmpId = getXMPdata('identifier');
	var xmpName = getXMPdata('title[1]');
	var currentProj = app.project.file;

	return {
		msg: '',
		data: {
			id: xmpId,
			name: xmpName,
			user: userPrefix,
			idLabel: label,
			namePlaceholder: PGN.proj.namePlaceholder,
			hardNews: hardNews,
			homeOffice: homeOffice,
			endPage: !hardNews,
			file: currentProj != null ? currentProj.fsName : null,
			folder: currentProj != null ? currentProj.parent.fsName : new Folder(projPath).fsName,
			creator: getXMPdata('creator'),
			date: getXMPdata('date')
		}
	};
});

// projIdTxt.onChange...
PGN.register('proj.setId', function (args) {
	var v = PGN.proj.setId(args.id == null ? '' : args.id);

	return { msg: v == '' ? 'ID removido' : 'ID: ' + v, data: { id: v } };
});

// projNameTxt.onChange...
PGN.register('proj.setName', function (args) {
	var v = PGN.proj.setName(args.name == null ? '' : args.name);

	return { msg: v == '' ? 'nome removido' : 'nome: ' + v, data: { name: v } };
});

//---------------------------------------------------------

// insertUserIdBtn.onClick...
PGN.register('id', function (args) {
	PGN.proj.emptyFail();
	PGN.proj.load(args);

	var count = PGN.proj.selectedComps();

	if (count == 0) PGN.fail('selecione comps no painel projeto');

	app.beginUndoGroup('insert ID');
	PGN.proj.stamp();

	if (hardNews) {
		insertHnID(projId);
	} else {
		insertPromoID(projId);
	}
	app.endUndoGroup();

	return 'ID inserido em ' + PGN.n(count, 'comp');
});

//---------------------------------------------------------

// renameItemBtn.onClick...
PGN.register('rename', function (args) {
	PGN.proj.emptyFail();
	PGN.proj.load(args);

	app.beginUndoGroup('rename comps');
	PGN.proj.stamp();

	var compArray = app.project.selection;

	if (hardNews) {
		compArray = compArray.length > 0 ? compArray : getComps();
		renameHNComps(projId, projName, compArray);

	} else {
		compArray = compArray.length > 0 ? compArray : getCompsAndTemplates();
		renamePromoComps(projId, projName, compArray);
	}
	app.endUndoGroup();

	return PGN.n(compArray.length, 'item', 'itens') + ' renomeados';
});

//---------------------------------------------------------

// projOrgBtn: left click → organize | right click → tags dialog...
PGN.register('org', function (args) {
	PGN.proj.emptyFail();

	if (args.alt === true) {
		tagDialog();
		return '';
	}
	var done = PGN.proj.runOrganize();

	return done ? 'Projeto organizado' : 'organização cancelada';
});

//---------------------------------------------------------

// endPagePresetBtn.onClick...
PGN.register('endp', function (args) {
	if (hardNews) PGN.fail('indisponível no modo hard news');
	PGN.proj.netFail();

	endPagePresetDialog();
	return '';
});

//---------------------------------------------------------

/*

  saveBtn
    · left click  → save inside the project folder
                    (projPath | 'PRODUCAO DIA-A-DIA' on hard news)
                    args.collect → collect files (collectTogBtn)
                    args.fonts   → collect fonts (collectFontsTogBtn)
    · right click → args.alt: save on the desktop (custom folder)

*/
PGN.register('save', function (args) {
	PGN.proj.emptyFail();
	PGN.proj.load(args);

	var projFile;
	var savePath;
	var projFullName;
	var promoProjectName = [projId, projName].join(' '); // ex: 'COB110423 historia ao vivo'
	var hnProjectName;

	// right click...
	if (args.alt === true) {
		PGN.proj.stamp();
		app.beginUndoGroup('save project');

		savePath = '~/Desktop';
		hnProjectName = [userPrefix, '- GNEWS', projName].join(' '); // ex: 'JBI - GNEWS TWITTER PRESIDENTE'
		projFullName = hardNews ? hnProjectName : promoProjectName; // final project name

		projFile = new File(savePath + '/' + projFullName);
		app.project.save(projFile);
		app.endUndoGroup();

		openFolder(savePath);
		setClipboard(savePath.replace(/^~\//, '').replace(/\//g, '\\'));

		return { msg: 'Projeto salvo', data: { path: app.project.file ? app.project.file.fsName : projFile.fsName } };
	}

	// left click...
	var escape = false;
	var collected = false;
	var todayPath = PRODUCAO_DIA_A_DIA();
	var saveFolder = hardNews ? new Folder(todayPath) : new Folder(projPath);

	PGN.proj.stamp();
	app.beginUndoGroup('save project');

	if (!saveFolder.exists) saveFolder = new Folder('~/Desktop');

	savePath = decodeURI(saveFolder.fullName);
	hnProjectName = [userPrefix, '- GNEWS', projName, '-', projId].join(' '); // ex: 'JBI - GNEWS TWITTER PRESIDENTE - cassia'
	projFullName = hardNews ? hnProjectName : promoProjectName; // final project name

	if (args.collect === true) {
		var progressWindow = progressDialog('collecting files to \'' + saveFolder.name + '\'');
		var enterBtn = progressWindow.children[2].children[0];
		var cancelBtn = progressWindow.children[2].children[1];

		enterBtn.onClick = progressWindow.onEnterKey = function () {
			if (hardNews) {
				filesCollectHN(projName, progressWindow);

			} else {
				savePath = filesCollectPROMO(promoProjectName, progressWindow);
			}
			collected = true;
			progressWindow.close();

			app.endUndoGroup();
		};

		cancelBtn.onClick = function () {
			progressWindow.close();
			app.endUndoGroup();

			alert('escaping...');
			executeCommandID('Undo save project');
			escape = true;
		};
		progressWindow.show();
	}
	if (escape) return 'salvamento cancelado';

	if (args.fonts === true) fontCollect(savePath);

	projFile = new File(savePath + '/' + projFullName);
	app.project.save(projFile);

	if (!collected) {
		try { app.endUndoGroup(); } catch (e) { }
	}
	openFolder(savePath);
	setClipboard(savePath.replace(/^~\//, '').replace(/\//g, '\\'));

	if (appV > 22 && saveAsV22) {
		executeCommandID('Save a Copy As 22.x...');
	}
	return { msg: 'Projeto salvo', data: { path: app.project.file ? app.project.file.fsName : projFile.fsName } };
});

// collect files toggle → save with collect...
PGN.register('collect', function (args) {
	args.collect = true;
	args.alt = false;
	return PGN.tools.save(args);
});

// collect fonts toggle → save with fonts...
PGN.register('cfonts', function (args) {
	args.fonts = true;
	args.alt = false;
	return PGN.tools.save(args);
});

//---------------------------------------------------------

// fldProjBtn2.onClick...
PGN.register('open', function (args) {
	PGN.proj.netFail();

	var todayPath = PRODUCAO_DIA_A_DIA();
	var currentProj = app.project.file;
	var currentProjPath = currentProj != null ? decodeURI(currentProj.path) : projPath;
	var fld = hardNews ? new Folder(todayPath) : new Folder(currentProjPath);

	if (!fld.exists) PGN.fail('pasta inacessível');

	openFolder(decodeURI(fld.fullName));
	return { msg: 'Pasta aberta', data: { path: fld.fsName } };
});
