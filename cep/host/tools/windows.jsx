/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/*

---------------------------------------------------------------
> PROMO GNEWS · CEP tools · window backends
---------------------------------------------------------------

  data backends for the HTML windows that replace the classic
  ScriptUI dialogs:

    find.*   → the classic ScriptUI 'find' dialog     + buildFindTree
    tpl.*    → the classic ScriptUI 'template' dialog + buildTree
               (+ importAetBtn bootstrap in 'main ui.js')
    fonts.*  → the classic ScriptUI 'fonts' dialog    + buildFontTree
               (+ installFontsBtn bootstrap in 'app tab.js')
    prefs.*  → the classic ScriptUI 'prefs' dialog

*/

PGN.win = {
	clone: function (obj) {
		return JSON.parse(JSON.stringify(obj));
	},

	inArray: function (arr, val) {
		for (var i = 0; i < arr.length; i++) {
			if (arr[i] == val) return true;
		}
		return false;
	},

	netFail: function () {
		if (!netAccess()) PGN.fail(netConfigName + ' desativado nas preferências do AE');
	},

	itemById: function (id) {
		id = parseInt(id, 10);
		for (var i = 1; i <= app.project.numItems; i++) {
			if (app.project.item(i).id == id) return app.project.item(i);
		}
		return null;
	},

	dateStr: function (d) {
		try {
			return d != null ? d.toString() : '';
		} catch (e) {
			return '';
		}
	}
};

/*

---------------------------------------------------------------
> find
---------------------------------------------------------------

*/

// buildFindTree → plain data...
PGN.register('find.search', function (args) {
	var query = args.query == null ? '' : String(args.query);
	var vis = args.visible !== false; // 'only visible layers' (checked by default)...
	var matchCase = args.matchCase === true;
	var matchAccent = args.accents === true;
	var regExp = args.regex === true;
	var keep = args.invert !== true; // results will not include the keyword when inverted...
	var groups = [];
	var total = 0;

	if (query == '' || app.project.numItems == 0) {
		return { msg: 'nenhum resultado', data: { groups: groups, total: 0 } };
	}
	var sKey = query;

	if (regExp) {
		try {
			// 'diferenciar mai\u00FAsculas' off: the 'i' flag (the regex text itself stays as typed)
			sKey = new RegExp(query, matchCase ? '' : 'i');
		} catch (err) {
			PGN.fail('expressão regular inválida');
		}
	} else {
		sKey = matchCase ? sKey : sKey.toLowerCase();
		sKey = matchAccent ? sKey : sKey.replaceSpecialCharacters();
	}
	var compArray = getComps(); // → [all comps]

	for (var i = 0; i < compArray.length; i++) {
		var comp = compArray[i];
		var group = null;
		var savedTime = comp.time;

		for (var l = 1; l <= comp.numLayers; l++) {
			if (!(comp.layer(l) instanceof TextLayer)) continue; // is not text layer...

			var txtLayer = comp.layer(l);
			var doc = txtLayer
				.property('ADBE Text Properties')
				.property('ADBE Text Document'); // layer source text property...
			var rawArray = []; // text content (as shown)...
			var txtArray = []; // text content (normalized for matching)...
			var k;

			if (doc.numKeys > 0) {
				// source text has keyframes → one entry per keyframe...
				for (k = 1; k <= doc.numKeys; k++) {
					comp.time = doc.keyTime(k);
					rawArray.push(textContent(txtLayer));
				}
			} else {
				// source text has expression → 1 second before the layer out point...
				if (doc.expression != '') comp.time = txtLayer.outPoint - 1;
				rawArray.push(textContent(txtLayer));
			}
			var allCaps = false;

			try {
				allCaps = doc.value.allCaps;
			} catch (e) { }

			for (var m = 0; m < rawArray.length; m++) {
				var t = rawArray[m];

				if (!regExp) {
					// respect ALL CAPS layer toggle...
					if (allCaps) t = t.toUpperCase();
					if (!matchCase) t = t.toLowerCase();
					if (!matchAccent) t = t.replaceSpecialCharacters();
				}
				txtArray.push(t);
			}
			if (vis && txtLayer.enabled == false) continue; // ignore hidden layers...

			for (var f = 0; f < txtArray.length; f++) {
				var r = regExp ? txtArray[f].match(sKey) != null : txtArray[f].indexOf(sKey) >= 0;

				if (r != keep) continue;

				if (group == null) {
					group = { compId: comp.id, comp: comp.name, items: [] };
					groups.push(group);
				}
				group.items.push({
					layerIndex: txtLayer.index,
					layer: txtLayer.name,
					text: rawArray[f],
					hidden: !txtLayer.enabled,
					keyIndex: doc.numKeys > 0 ? f + 1 : 0
				});
				total++;
			}
		}
		comp.time = savedTime;
	}
	var msg = total == 0 ? 'nenhum resultado' : PGN.n(total, 'resultado') + ' em ' + PGN.n(groups.length, 'comp');

	return { msg: msg, data: { groups: groups, total: total } };
});

// resultTree.onChange → open comp, focus (shy) and select layer(s)...
PGN.register('find.select', function (args) {
	var list = args.items instanceof Array ? args.items : [args];
	var byComp = {};
	var order = [];
	var c;

	for (var i = 0; i < list.length; i++) {
		var it = list[i];

		if (it == null || it.compId == null) continue;
		c = String(it.compId);
		if (!byComp.hasOwnProperty(c)) {
			byComp[c] = [];
			order.push(c);
		}
		if (it.layerIndex != null) byComp[c].push(it);
	}
	if (order.length == 0) PGN.fail('nada selecionado');

	var lastComp = null;
	var lastTime = 0;
	var selCount = 0;

	app.beginUndoGroup('find select');

	for (var o = 0; o < order.length; o++) {
		var comp = PGN.win.itemById(order[o]);

		if (!(comp instanceof CompItem)) continue;

		var entries = byComp[order[o]];
		var t = comp.time;

		if (entries.length > 0) {
			var first = true;

			for (var l = 1; l <= comp.numLayers; l++) {
				var aLayer = comp.layer(l);
				var match = null;

				for (var e = 0; e < entries.length; e++) {
					if (parseInt(entries[e].layerIndex, 10) == l) {
						match = entries[e];
						break;
					}
				}
				aLayer.shy = true;
				aLayer.selected = false;

				if (match == null) continue;

				aLayer.shy = false;
				aLayer.selected = true;
				selCount++;

				if (!first) continue;
				first = false;

				var doc = aLayer instanceof TextLayer ? aLayer
					.property('ADBE Text Properties')
					.property('ADBE Text Document') : null;

				t = (aLayer.outPoint - aLayer.inPoint) / 2 + aLayer.inPoint;
				if (doc != null && doc.numKeys > 0) {
					var k = parseInt(match.keyIndex, 10);

					if (!(k >= 1 && k <= doc.numKeys)) k = 1;
					t = doc.keyTime(k);
				}
				t = t < comp.duration ? t : comp.duration;
				t = t < 0 ? 0 : t;
			}
			comp.hideShyLayers = true;
		}
		lastComp = comp;
		lastTime = t;
	}
	app.endUndoGroup();

	if (lastComp == null) PGN.fail('comp não encontrada');

	lastComp.openInViewer();
	lastComp.time = lastTime;

	return selCount > 0 ? PGN.n(selCount, 'layer') + ' selecionado' + (selCount > 1 ? 's' : '') : lastComp.name;
});

/*

---------------------------------------------------------------
> templates
---------------------------------------------------------------

*/

PGN.tpl = {
	fileFilter: ['.aep', '.aet'],

	// templates.zip → local folder (+ network copy outside home office)...
	download: function () {
		var url = repoURL + '/raw/main/downloads/templates.zip';
		var zipPath = tempPath + '/templates.zip'; // → ~AppData\Roaming\PROMO GNEWS script\temp\templates.zip
		var templatesLocalFolder = new Folder(templatesLocalPath);

		removeFolder(templatesLocalFolder); // → delete previous templates folder
		templatesLocalFolder.create();

		if (!tempFolder.exists) tempFolder.create();

		getURLContent([url], [tempPath]); // → download content
		unzipContent(zipPath, templatesLocalPath); // → unzip file
		removeFolder(tempFolder); // → delete temp folder

		// HO preference...
		if (!homeOffice) {
			removeFolder(templatesFolder); // → delete previous templates folder
			templatesFolder.create();
			copyFolderContent(templatesLocalPath, templatesPath);
		}
	},

	// importAetBtn (main ui) → downloads only when the folder is missing or empty...
	ensure: function () {
		var url = repoURL + '/raw/main/downloads/templates.zip';
		var zipPath = tempPath + '/templates.zip';
		var templatesLocalFolder = new Folder(templatesLocalPath);

		if (!tempFolder.exists) tempFolder.create();

		if (!templatesFolder.exists || templatesFolder.getFiles().length == 0) {
			removeFolder(templatesLocalFolder); // → delete previous local templates folder
			templatesLocalFolder.create(); // → new local templates folder

			getURLContent([url], [tempPath]); // → download templates.zip
			unzipContent(zipPath, templatesLocalPath); // → unzip templates
			removeFolder(tempPath); // (as the original: a path string → no-op)

			// HO preference
			if (!homeOffice) {
				removeFolder(templatesFolder); // → delete previous templates folder
				templatesFolder.create();
				copyFolderContent(templatesLocalPath, templatesPath);
			}
		}
	},

	// createHierarchy → flat list...
	walk: function (folder, rel, items) {
		var files = folder.getFiles();

		for (var n = 0; n < files.length; n++) {
			var f = files[n];
			var name = f.displayName;

			if (f instanceof Folder) {
				if (f.getFiles().length > 0) PGN.tpl.walk(f, rel == '' ? name : rel + '/' + name, items);
				continue;
			}
			var ext;

			try {
				ext = getFileExt(name);
			} catch (err) {
				continue;
			}
			if (!PGN.win.inArray(PGN.tpl.fileFilter, ext)) continue;

			var previewFile = new File(f.parent.fsName + '/' + name.replace(/\.[\w]+$/i, ' preview.png'));
			// a preview video next to the template: '<name> preview.mp4' (or .webm / .mov), or '<name>.mp4'
			var videoFile = null;
			var vNames = [' preview.mp4', ' preview.webm', ' preview.mov', '.mp4'];

			for (var v = 0; v < vNames.length && videoFile == null; v++) {
				var vf = new File(f.parent.fsName + '/' + name.replace(/\.[\w]+$/i, vNames[v]));

				if (vf.exists) videoFile = vf;
			}
			var infoFile = new File(f.parent.fsName + '/' + name.replace(/\.[\w]+$/i, ' info.txt'));
			var info = null;

			if (infoFile.exists) {
				try {
					info = readFileContent(infoFile);
				} catch (err) { }
			}
			items.push({
				path: f.fsName,
				name: deleteFileExt(name),
				fileName: name,
				folder: rel,
				ext: ext,
				preview: previewFile.exists ? previewFile.fsName : null,
				video: videoFile != null ? videoFile.fsName : null,
				updated: PGN.win.dateStr(f.created),
				displayPath: decodeURI(f.fullName),
				info: info
			});
		}
	},

	list: function () {
		var items = [];
		var newest = null;

		if (templatesFolder.exists) PGN.tpl.walk(templatesFolder, '', items);

		for (var i = 0; i < items.length; i++) {
			var d = new File(items[i].path).created;

			if (d != null && (newest == null || d.getTime() > newest.getTime())) newest = d;
		}
		return {
			root: templatesFolder.fsName,
			updated: PGN.win.dateStr(newest),
			homeOffice: homeOffice,
			items: items
		};
	}
};

// opening the templates window (importAetBtn) + refreshBtn...
PGN.register('tpl.list', function (args) {
	PGN.win.netFail();
	PGN.tpl.ensure();

	var data = PGN.tpl.list();

	return { msg: PGN.n(data.items.length, 'template'), data: data };
});

// importBtn / templateTree.onDoubleClick...
PGN.register('tpl.import', function (args) {
	if (!args.path) PGN.fail('nenhum template selecionado');

	var templateFile = new File(args.path);

	if (!templateFile.exists) PGN.fail('template não encontrado');

	try {
		var IO = new ImportOptions(templateFile); // import options...

		app.project.importFile(IO); // → import template project
	} catch (err) {
		PGN.fail('falha ao importar: ' + err.message);
	}
	return 'Template importado: ' + deleteFileExt(templateFile.displayName);
});

// downloadBtn...
PGN.register('tpl.download', function (args) {
	if (!netAccess()) PGN.fail('sem rede');

	PGN.tpl.download();

	var data = PGN.tpl.list();

	return { msg: 'Templates atualizados', data: data };
});

// openFldBtn...
PGN.register('tpl.openFolder', function (args) {
	if (!netAccess()) PGN.fail('sem acesso');

	if (!templatesFolder.exists) templatesFolder.create(); // → create template folder
	openFolder(templatesPath); // → open template folder

	return 'Pasta de templates aberta';
});

/*

---------------------------------------------------------------
> fonts
---------------------------------------------------------------

*/

PGN.fonts = {
	fileFilter: ['.ttf', '.otf'],

	// installFontsBtn (app tab) → downloads only when the folder is missing or empty...
	ensure: function () {
		var url = repoURL + '/raw/main/downloads/fonts.zip';
		var zipPath = tempPath + '/fonts.zip';
		var fontsLocalFolder = new Folder(fontsLocalPath);

		if (!tempFolder.exists) tempFolder.create();

		if (!fontsFolder.exists || fontsFolder.getFiles().length == 0) {
			removeFolder(fontsLocalFolder); // → delete previous fonts folder
			fontsLocalFolder.create();

			getURLContent([url], [tempPath]);
			unzipContent(zipPath, fontsPath); // (as the original: unzips straight to fontsPath)

			// HO preference
			if (!homeOffice) {
				removeFolder(fontsFolder); // → delete previous fonts folder
				fontsFolder.create();
				copyFolderContent(fontsLocalPath, fontsPath);
			}
		}
	},

	// fonts dialog downloadBtn...
	download: function () {
		var url = repoURL + '/raw/main/downloads/fonts.zip';
		var zipPath = tempPath + '/fonts.zip';
		var fontsLocalFolder = new Folder(fontsLocalPath);

		removeFolder(fontsLocalFolder); // → delete previous fonts folder
		fontsLocalFolder.create();

		if (!tempFolder.exists) tempFolder.create();

		getURLContent([url], [tempPath]);
		unzipContent(zipPath, fontsLocalPath);
		removeFolder(tempFolder); // → delete temp folder

		// HO preference
		if (!homeOffice) {
			removeFolder(fontsFolder); // → delete previous fonts folder
			fontsFolder.create();
			copyFolderContent(fontsLocalPath, fontsPath);
		}
	},

	// buildFontTree → every non empty sub folder is a font family...
	list: function () {
		var items = [];
		var fontsArray = fontsFolder.exists ? fontsFolder.getFiles() : [];

		for (var n = 0; n < fontsArray.length; n++) {
			if (fontsArray[n] instanceof File) continue;

			var subArray = fontsArray[n].getFiles();

			if (subArray.length == 0) continue;

			var files = [];

			for (var s = 0; s < subArray.length; s++) {
				if (!(subArray[s] instanceof File)) continue;
				try {
					if (PGN.win.inArray(PGN.fonts.fileFilter, getFileExt(subArray[s].displayName))) files.push(subArray[s].displayName);
				} catch (err) { }
			}
			var fName = fontsArray[n].displayName;

			items.push({
				path: fontsArray[n].fsName,
				name: fName,
				family: fName,
				folder: '',
				files: files
			});
		}
		return {
			root: fontsFolder.fsName,
			homeOffice: homeOffice,
			canInstall: true, // Win → Fonts namespace | Mac → ~/Library/Fonts (platform.jsx installFonts)
			items: items
		};
	}
};

// opening the fonts window (installFontsBtn) + refreshBtn...
PGN.register('fonts.list', function (args) {
	PGN.win.netFail();
	PGN.fonts.ensure();

	var data = PGN.fonts.list();

	return { msg: PGN.n(data.items.length, 'família', 'famílias'), data: data };
});

// installBtn (one call per selected family)...
PGN.register('fonts.install', function (args) {
	var paths = args.paths instanceof Array ? args.paths : (args.path ? [args.path] : []);
	var count = 0;

	if (paths.length == 0) PGN.fail('nenhuma fonte selecionada');

	for (var i = 0; i < paths.length; i++) {
		var p = String(paths[i]);
		var fontFamilyFolder = new Folder(PGN.net.local(p));

		// a bare family name → fonts folder sub folder (as the original)...
		if (!fontFamilyFolder.exists) fontFamilyFolder = new Folder(fontsPath + '/' + p);
		if (!fontFamilyFolder.exists) continue;

		installFonts(decodeURI(fontFamilyFolder.fullName).toString());
		count++;
	}
	if (count == 0) PGN.fail('pasta da fonte não encontrada');

	var msg = PGN.n(count, 'família instalada', 'famílias instaladas');

	// macOS: copied to ~/Library/Fonts → AE lists them after a restart...
	if (appOs != 'Win') msg += ' em ~/Library/Fonts \u00B7 reinicie o After Effects';
	return msg;
});

// downloadBtn...
PGN.register('fonts.download', function (args) {
	if (!netAccess()) PGN.fail('sem rede');

	PGN.fonts.download();

	return { msg: 'Fontes atualizadas', data: PGN.fonts.list() };
});

// openFldBtn...
PGN.register('fonts.openFolder', function (args) {
	if (!netAccess()) PGN.fail('sem acesso');

	if (!fontsFolder.exists) fontsFolder.create();
	openFolder(fontsPath);

	return 'Pasta de fontes aberta';
});

/*

---------------------------------------------------------------
> preferences
---------------------------------------------------------------

*/

PGN.prefs = {
	layerTypes: ['shape layer', 'solid layer'],
	projectModes: ['PROMO', 'custom'],
	folderKeys: ['projPath', 'magazinePath', 'artePath'],

	// recursive merge (arrays and values are replaced)...
	merge: function (dst, src) {
		for (var k in src) {
			if (!src.hasOwnProperty(k)) continue;
			var v = src[k];

			if (v != null && typeof v == 'object' && !(v instanceof Array) &&
				dst[k] != null && typeof dst[k] == 'object' && !(dst[k] instanceof Array)) {
				PGN.prefs.merge(dst[k], v);
			} else {
				dst[k] = v;
			}
		}
	},

	// savePrefs + re-apply every global (loadDefaultPrefs re-reads the json)...
	apply: function (prevHomeOffice) {
		savePrefs(); // → save preferences.json
		loadDefaultPrefs();
		projIdContent = hardNews ? 'client' : 'PROJ ID';

		if (prevHomeOffice !== homeOffice) updateFolderPaths(); // → update templates and fonts folder
	},

	// detach JSONPrefsObj from defPrefsObj (loadDefaultPrefs shares default sub objects)...
	detach: function () {
		JSONPrefsObj = PGN.win.clone(JSONPrefsObj);
	},

	keyFail: function (key) {
		if (!PGN.win.inArray(PGN.prefs.folderKeys, key)) PGN.fail('pasta inválida: ' + key);
	},

	setFolder: function (key, path) {
		var localPath = PGN.net.local(path); // macOS: //server/share → /Volumes/share

		if (key == 'projPath') projPath = localPath;
		if (key == 'magazinePath') magazinePath = localPath;
		if (key == 'artePath') artePath = localPath;
		JSONPrefsObj.folders[key] = path;
		savePrefs();
	}
};

// the classic ScriptUI bar still installed? (it shows its own 'drive N' popup at every start)
PGN.win.oldScripts = function () {
	var names = ['PROMO GNEWS.jsxbin', 'PROMO GNEWS.jsx', 'PROMO GNEWS.js', 'PROMO GNEWS DEV.jsx', 'PROMO GNEWS DEV.js'];
	// Windows: Support Files/Scripts · macOS: Scripts sits next to the .app, not inside it
	var appDir = appOs == 'Mac' ? Folder.appPackage.parent.fsName : Folder.appPackage.fsName;
	var dirs = [appDir + '/Scripts/ScriptUI Panels', appDir + '/Scripts/Startup'];
	var found = [];

	try {
		var base = Folder.userData.fsName;

		if (appOs == 'Mac') base = base.replace(/Application Support$/, 'Preferences');
		var ae = new Folder(base + '/Adobe/After Effects').getFiles();

		for (var v = 0; v < ae.length; v++) {
			if (!(ae[v] instanceof Folder)) continue;
			dirs.push(ae[v].fsName + '/Scripts/ScriptUI Panels');
			dirs.push(ae[v].fsName + '/Scripts/Startup');
		}
	} catch (e) { }
	for (var d = 0; d < dirs.length; d++) {
		for (var n = 0; n < names.length; n++) {
			var f = new File(dirs[d] + '/' + names[n]);

			if (f.exists) found.push(f.fsName);
		}
	}
	return found;
};

PGN.register('prefs.get', function (args) {
	var data = PGN.win.clone(JSONPrefsObj);

	data.version = vStr;
	data.defaults = PGN.win.clone(defPrefsObj);
	data.projectModes = PGN.prefs.projectModes.slice(0);
	data.layerTypes = PGN.prefs.layerTypes.slice(0);
	data.tabs = grpNames.slice(0);
	data.prefsPath = new Folder(scriptPreferencesPath).fsName;
	data.templatesPath = new Folder(templatesPath).fsName;
	data.fontsPath = new Folder(fontsPath).fsName;
	data.netAccess = netAccess() ? true : false;
	data.os = appOs;
	data.netOffline = PGN.net.offline || $.global.PGN_BOOT_MSG || '';
	data.oldScripts = PGN.win.oldScripts();

	return { msg: '', data: data };
});

PGN.register('prefs.set', function (args) {
	var patch = args.patch;

	if (patch == null || typeof patch != 'object') PGN.fail('nada para salvar');

	var prevHomeOffice = homeOffice;
	var clean = {};

	// only known preference keys (savePrefs drops the rest anyway)...
	for (var k in patch) {
		if (patch.hasOwnProperty(k) && defPrefsObj.hasOwnProperty(k)) clean[k] = patch[k];
	}
	if (typeof clean.userPrefix == 'string') clean.userPrefix = clean.userPrefix.toUpperCase();

	PGN.prefs.detach();
	PGN.prefs.merge(JSONPrefsObj, clean);
	PGN.prefs.apply(prevHomeOffice);

	return 'Preferências salvas';
});

// resetBtn...
PGN.register('prefs.reset', function (args) {
	var prevHomeOffice = homeOffice;

	JSONPrefsObj = PGN.win.clone(defPrefsObj);
	PGN.prefs.apply(prevHomeOffice);

	return 'Preferências restauradas';
});

// openFldBtn...
PGN.register('prefs.openFolder', function (args) {
	if (!netAccess()) PGN.fail('sem acesso');

	if (!fontsFolder.exists) fontsFolder.create();
	openFolder(scriptPreferencesPath);

	return 'Pasta de preferências aberta';
});

// fldProjBtn / fldMagBtn / fldArteBtn...
PGN.register('prefs.pickFolder', function (args) {
	PGN.prefs.keyFail(args.key);
	PGN.win.netFail();

	var saveFolder = Folder.selectDialog();

	if (saveFolder == null) return { msg: '', data: { path: null, cancelled: true } };

	var path = decodeURI(saveFolder).toString();

	PGN.prefs.detach();
	PGN.prefs.setFolder(args.key, path);

	return { msg: 'Pasta mapeada', data: { path: path, fsName: saveFolder.fsName } };
});

// resetFldProjBtn / resetFldMagBtn / resetFldArteBtn...
PGN.register('prefs.resetFolder', function (args) {
	PGN.prefs.keyFail(args.key);
	PGN.win.netFail();

	var path = defPrefsObj.folders[args.key];

	PGN.prefs.detach();
	PGN.prefs.setFolder(args.key, path);

	return { msg: 'Pasta restaurada', data: { path: path, fsName: new Folder(PGN.net.local(path)).fsName } };
});

// resetOrgFoldersBtn...
PGN.register('prefs.resetOrgFolders', function (args) {

	PGN.prefs.detach();
	JSONPrefsObj.folders.promoSubPath = PGN.win.clone(defPrefsObj.folders.promoSubPath);
	JSONPrefsObj.folders.removedSubPath = [];
	savePrefs(); // → save preferences.json
	promoSubPath = JSONPrefsObj.folders.promoSubPath;

	return { msg: 'Pastas de organiza\u00E7\u00E3o restauradas', data: { promoSubPath: PGN.win.clone(promoSubPath), defaults: PGN.win.clone(defPrefsObj.folders.promoSubPath) } };
});

// org. folders editor (settings window): replaces the whole sigla → sub path map...
// (loadDefaultPrefs puts back any missing default sigla, so defaults can be edited but not removed)
PGN.register('prefs.setOrgFolders', function (args) {
	var map = args.map;
	var clean = {};
	var removed = [];
	var defs = defPrefsObj.folders.promoSubPath;

	if (map == null || typeof map != 'object') PGN.fail('lista inv\u00E1lida');

	// key order = the order shown in the editor...
	for (var k in map) {
		if (!map.hasOwnProperty(k)) continue;
		var key = String(k).toUpperCase().replace(/[^A-Z0-9]/g, '');
		var val = String(map[k]).replace(/\\/g, '/').replace(/^\/+|\/+$/g, '').replace(/\/{2,}/g, '/');

		if (key == '' || val == '') continue;
		clean[key] = val;
	}
	// default siglas missing from the list stay removed (see PGN_dropRemovedSubPaths)...
	for (var d in defs) {
		if (defs.hasOwnProperty(d) && !clean.hasOwnProperty(d)) removed.push(d);
	}
	PGN.prefs.detach();
	JSONPrefsObj.folders.promoSubPath = clean;
	JSONPrefsObj.folders.removedSubPath = removed;
	savePrefs(); // → save preferences.json
	loadDefaultPrefs(); // → defaults back, then the removed ones dropped again

	return { msg: 'Pastas de organiza\u00E7\u00E3o salvas', data: { promoSubPath: PGN.win.clone(promoSubPath), defaults: PGN.win.clone(defs) } };
});

// 'go to this item' between windows: the bar asks the preferences to scroll to a link, a color or an
// effect. Kept here in the host (every window shares it) — localStorage is not shared between the
// extension's windows. set: { kind, key } · take: returns it once (within 20 s) and clears it.
PGN.register('ui.focus', function (args) {
	if (args.set) {
		$.global.PGN_UI_FOCUS = { kind: String(args.set.kind || ''), key: String(args.set.key || ''), list: String(args.set.list || ''), at: new Date().getTime() };
		return { msg: '', data: null };
	}
	var f = $.global.PGN_UI_FOCUS || null;

	$.global.PGN_UI_FOCUS = null;
	if (f && new Date().getTime() - f.at > 20000) f = null;
	return { msg: '', data: f };
});

// network status (platform.jsx): offline message, OS, home office...
PGN.register('net.status', function (args) {
	return { msg: PGN.net.offline || '', data: PGN.net.status() };
});
