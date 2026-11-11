/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/*

---------------------------------------------------------------
> PROMO GNEWS · CEP tools · project tab
---------------------------------------------------------------

  port of the classic ScriptUI 'project' tab.

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
		if (!netAccess()) PGN.fail(netConfigName + ' desativado nas prefer\u00eancias do AE');
	},

	emptyFail: function () {
		if (app.project.numItems == 0) PGN.fail('projeto vazio');
	},

	// the fields still showing their placeholders would end up in file and comp names
	// ('PROJ ID proj name'): ask for them instead (after load)
	requireFields: function (needName) {
		var noId = String(projId) == PGN.proj.label();
		var noName = needName && String(projName) == PGN.proj.namePlaceholder;

		if (noId && noName) PGN.fail('preencha o ID e o nome do projeto (se\u00E7\u00E3o Projeto)');
		if (noId) PGN.fail('preencha o ID do projeto (se\u00E7\u00E3o Projeto)');
		if (noName) PGN.fail('preencha o nome do projeto (se\u00E7\u00E3o Projeto)');
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
		var dateStr = PGN.sys.today();

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
	PGN.proj.requireFields(false);

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
	PGN.proj.requireFields(true);

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

// projOrgBtn: left click → organize (job) | right click → tags window (panel side)...
PGN.registerJob('org', {
	begin: function (args) {
		args = args || {};
		PGN.proj.emptyFail();

		// the panel opens its own tags window (tags.jsx)...
		if (args.alt === true) PGN.fail('use a janela de tags');

		return PGN.jk.orgInit({});
	},

	step: function (st) {
		PGN.jk.orgStep(st);
		if (st.org.finished) st.finished = true;
		return st;
	},

	finish: function (st) {
		return PGN.jk.orgMsg(st);
	},

	// classic cancel → 'Undo organize project'...
	cancel: function (st) {
		PGN.jk.rollback(st);
	}
});

//---------------------------------------------------------

// end page presets: the panel opens the end page window (tools/endpage.jsx)

//---------------------------------------------------------

/*

  saveBtn  (job: see jobs.jsx)
    · left click  → save inside the project folder
                    (projPath | 'PRODUCAO DIA-A-DIA' on hard news)
                    args.collect → collect files (collectTogBtn)
                    args.fonts   → collect fonts (collectFontsTogBtn)
    · right click → args.alt: save on the desktop (custom folder)

  plain / alt saves have no steps (begin returns finished, finish
  saves), so PGN.run('save') and PGN.jobStart('save') both work.
  collect / fonts run step by step, then finish saves the project.

*/
PGN.proj.saveJob = {
	begin: function (args) {
		args = args || {};
		PGN.proj.emptyFail();
		PGN.proj.load(args);
		PGN.proj.requireFields(true);

		var st = { total: 0, done: 0, label: 'salvando', alt: args.alt === true };

		st.promoProjectName = [projId, projName].join(' '); // ex: 'COB110423 historia ao vivo'
		PGN.proj.stamp();

		// right click...
		if (st.alt) {
			// the real desktop (Folder.desktop follows a OneDrive-redirected one on Windows)
			st.savePath = decodeURI(Folder.desktop.fullName);
			st.projFullName = hardNews ? [userPrefix, '- GNEWS', projName].join(' ') : st.promoProjectName; // ex: 'JBI - GNEWS TWITTER PRESIDENTE'
			st.finished = true;
			return st;
		}

		// left click...
		var saveFolder = hardNews ? new Folder(PRODUCAO_DIA_A_DIA()) : new Folder(projPath);

		// hard news: today's folder may not exist yet (first save of the day) — create it
		// instead of falling back to the desktop
		if (hardNews && !saveFolder.exists) createPath(saveFolder.fsName);
		if (!saveFolder.exists) saveFolder = Folder.desktop;

		st.savePath = decodeURI(saveFolder.fullName);
		st.projFullName = hardNews ? [userPrefix, '- GNEWS', projName, '-', projId].join(' ') : st.promoProjectName; // ex: 'JBI - GNEWS TWITTER PRESIDENTE - cassia'
		st.fonts = args.fonts === true;

		if (args.collect === true) {
			st.phase = 'collect';
			PGN.jk.colInit(st, hardNews ? projName : st.promoProjectName);

		} else if (st.fonts) {
			st.phase = 'fonts';
			PGN.jk.fntInit(st, st.savePath);

		} else {
			st.finished = true;
		}
		return st;
	},

	step: function (st) {
		if (st.phase == 'collect') {
			PGN.jk.colStep(st);
			if (!st.col.finished) return st;

			// filesCollectPROMO returns the collect folder (HN keeps the day folder)...
			if (!st.col.hn) st.savePath = st.col.savePath;

			if (st.fonts) {
				st.phase = 'fonts';
				PGN.jk.fntInit(st, st.savePath);
			} else {
				st.finished = true;
			}
			return st;
		}
		if (st.phase == 'fonts') {
			PGN.jk.fntStep(st);
			if (st.fnt.finished) st.finished = true;
			return st;
		}
		st.finished = true;
		return st;
	},

	finish: function (st) {
		var savePath = st.savePath;
		var base = savePath + '/' + st.projFullName;
		var projFile = new File(base + '.aep');
		var data = {};
		var msg = 'Projeto salvo';
		var cur = app.project.file;

		// another project with this name already there: a number instead of overwriting it
		// (saving the open project again over its own file is fine)
		for (var n = 2; projFile.exists && !(cur && cur.fsName == projFile.fsName) && n < 1000; n++) {
			projFile = new File(base + ' ' + n + '.aep');
		}
		if (n > 2) msg += ' como ' + decodeURI(projFile.name) + ' (j\u00E1 havia um com esse nome)';

		app.project.save(projFile);

		openFolder(savePath);
		// the system form of the path on both systems ('~' and '/d/...' resolved)
		setClipboard(new Folder(savePath).fsName);

		// the copy for older versions: never turns a saved project into an error
		if (!st.alt && appV > 22 && saveAsV22) {
			try { executeCommandID('Save a Copy As 22.x...'); } catch (e) { }
		}
		data.path = app.project.file ? app.project.file.fsName : projFile.fsName;

		if (st.col) {
			data.collected = st.col.copied;
			msg += ' \u00b7 ' + PGN.n(st.col.copied, 'arquivo coletado', 'arquivos coletados');
			if (st.col.failed) msg += ' \u00b7 ' + st.col.failed + ' n\u00E3o copiados (ficaram no lugar original)';
		}
		if (st.fnt) {
			data.fonts = st.fnt.fonts;
			data.fontsFailed = st.fnt.fail;
			msg += ' \u00b7 ' + PGN.n(st.fnt.fonts.length, 'fonte coletada', 'fontes coletadas');

			// classic: alert(fails + ' cant be copied')...
			if (st.fnt.fail.length > 0) msg += ' (' + PGN.n(st.fnt.fail.length, 'falha', 'falhas') + ': ' + st.fnt.fail.join(', ') + ')';
		}
		return { msg: msg, data: data };
	},

	// classic cancel → 'Undo save project' (footage replaced by the collect)...
	cancel: function (st) {
		PGN.jk.rollback(st);
	}
};

PGN.registerJob('save', PGN.proj.saveJob);

// collect files toggle → save with collect...
PGN.registerJob('collect', {
	begin: function (args) {
		args = args || {};
		args.collect = true;
		args.alt = false;
		return PGN.proj.saveJob.begin(args);
	},
	step: PGN.proj.saveJob.step,
	finish: PGN.proj.saveJob.finish,
	cancel: PGN.proj.saveJob.cancel
});

// collect fonts toggle → save with fonts...
PGN.registerJob('cfonts', {
	begin: function (args) {
		args = args || {};
		args.fonts = true;
		args.alt = false;
		return PGN.proj.saveJob.begin(args);
	},
	step: PGN.proj.saveJob.step,
	finish: PGN.proj.saveJob.finish,
	cancel: PGN.proj.saveJob.cancel
});

//---------------------------------------------------------

// fldProjBtn2.onClick...
PGN.register('open', function (args) {
	PGN.proj.netFail();

	var todayPath = PRODUCAO_DIA_A_DIA();
	var currentProj = app.project.file;
	var currentProjPath = currentProj != null ? decodeURI(currentProj.path) : projPath;
	var fld = hardNews ? new Folder(todayPath) : new Folder(currentProjPath);

	if (!fld.exists) PGN.fail('pasta inacess\u00edvel');

	openFolder(decodeURI(fld.fullName));
	return { msg: 'Pasta aberta', data: { path: fld.fsName } };
});
