/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/*

---------------------------------------------------------------
> PROMO GNEWS · CEP tools · job kit
---------------------------------------------------------------

  step-friendly versions of the classic long helpers that used
  to drive the ScriptUI progressDialog window:

    PGN.jk.org*    → deleteProjectFolders + populateProjectFolders
                     + deleteEmptyProjectFolders   ('FUNC lib.js')
    PGN.jk.col*    → filesCollectHN / filesCollectPROMO
    PGN.jk.fnt*    → fontCollect               ('file system lib.js')

  same algorithms (folder structure, naming, copied files, prefs
  globals) split into time-boxed slices: every step works until
  PGN.jk.ms milliseconds have passed (always at least one unit).

  undo: a step opens its undo group lazily, right before the first
  real change, and closes it before returning (no group stays open
  between steps). every opened group name is stacked on the state;
  PGN.jk.rollback undoes them (cancel / failure), like the classic
  'escaping...' → executeCommandID('Undo ...').

  the jobs themselves are registered in project.jsx (org, save,
  collect, cfonts) and app.jsx (batch).

*/

PGN.jk = {
	ms: 250,

	now: function () {
		return new Date().getTime();
	},

	// true while the current slice still has time...
	more: function (t0) {
		return PGN.jk.now() - t0 < PGN.jk.ms;
	},

	// opens the step undo group before the first change...
	touch: function (st, name) {
		if (st._ug) return;
		app.beginUndoGroup(name);
		st._ug = name;
		if (!st.undo) st.undo = [];
		st.undo.push(name);
	},

	// closes the step undo group (end of every step)...
	close: function (st) {
		if (!st._ug) return;
		st._ug = null;
		app.endUndoGroup();
	},

	// the Edit menu item that undoes the group 'name', when it is the last one done
	// (0 otherwise) — 'Undo …' in English, 'Desfazer …' in Portuguese
	undoCmd: function (name) {
		var labels = ['Undo ', 'Desfazer '];

		for (var i = 0; i < labels.length; i++) {
			var cmd = 0;

			try { cmd = app.findMenuCommandId(labels[i] + name); } catch (e) { }
			if (cmd) return cmd;
		}
		return 0;
	},

	// undoes the groups (newest first) while they are still on top of the undo list;
	// stops at anything done after them. returns how many were undone
	undoList: function (u) {
		var n = 0;

		for (var k = u.length - 1; k >= 0; k--) {
			var cmd = PGN.jk.undoCmd(u[k]);

			if (!cmd) break; // undo menu no longer shows our group...
			app.executeCommand(cmd);
			n++;
		}
		return n;
	},

	// undo every group this job created (newest first)...
	rollback: function (st) {
		if (!st) return;
		if (st._ug) {
			st._ug = null;
			try { app.endUndoGroup(); } catch (e) { }
		}
		PGN.jk.undoList(st.undo || []);
		st.undo = [];
	},

	// ascending scan of the project items (cursor sc = { i, n })...
	scan: function (sc, t0, fn) {
		while (sc.i <= sc.n) {
			fn(app.project.item(sc.i));
			sc.i++;
			if (!PGN.jk.more(t0)) break;
		}
		return sc.i > sc.n;
	},

	// descending removal of empty folders (cursor o.i)... → deleteEmptyProjectFolders
	cleanStep: function (st, o, t0) {
		if (o.i > app.project.numItems) o.i = app.project.numItems;

		while (o.i >= 1) {
			var aItem = app.project.item(o.i);

			o.i--;
			if (aItem instanceof FolderItem && aItem.numItems == 0) {
				PGN.jk.touch(st, o.undoName);
				aItem.remove();
			}
			if (!PGN.jk.more(t0)) break;
		}
		return o.i < 1;
	},

	// template / footage comment → subfolder name (classic rule)...
	compSubName: function (templateName) {
		var set = templateName;
		var subFolderName = set;

		if (set.split(/\s/).length == 1) {
			subFolderName = (set[set.length - 1] == 's' ? set : set + 's')
				.replaceSpecialCharacters();
		}
		return subFolderName;
	}
};

/*

---------------------------------------------------------------
> organize project
---------------------------------------------------------------

  phases:
    snap    → list project folders                    (indeterminate)
    unfold  → move every folder child to the root     (deleteProjectFolders)
    clean   → remove empty folders                    (deleteEmptyProjectFolders)
    scan    → getComps + getFootage
    tag     → getCompsAndTemplates 'export' tagging
    folders → projectTemplateFolders(projectMode)
    place   → populateFootageItemFolders x4 + populateCompItemFolders
              (+ 'missing' folder when ignoreMissing)  (total = items)
    clean2  → deleteEmptyProjectFolders

*/

// undoes the whole last long task (every slice), while nothing else was done after it
PGN.register('job.undo', function (args) {
	var last = PGN.lastJobUndo;

	if (!last || !last.undo.length) PGN.fail('nada para desfazer');
	PGN.lastJobUndo = null;
	var n = PGN.jk.undoList(last.undo);

	if (n == 0) PGN.fail('n\u00E3o d\u00E1 mais para desfazer: houve outras altera\u00E7\u00F5es depois');
	if (n < last.undo.length) return 'desfeito em parte (' + n + ' de ' + last.undo.length + ' passos) \u00B7 o resto j\u00E1 saiu da lista de desfazer';
	return 'tarefa desfeita';
});

PGN.jk.orgInit = function (st) {
	st.org = {
		phase: 'snap',
		undoName: 'organize project',
		sc: { i: 1, n: app.project.numItems },
		folders: [],
		f: 0,
		i: 0,
		comps: [],
		c: 0,
		footage: {
			stillArray: [],
			videoArray: [],
			sonoArray: [],
			solidArray: [],
			missingArray: [],
			missingNames: []
		},
		queues: [],
		q: 0,
		k: 0,
		placed: 0,
		finished: false
	};
	st.total = 0;
	st.done = 0;
	st.label = 'limpando pastas';
	return st;
};

// one slice of the organize machine...
PGN.jk.orgStep = function (st) {
	var o = st.org;
	var t0 = PGN.jk.now();
	var root = app.project.rootFolder;

	try {
		// list every project folder...
		if (o.phase == 'snap') {
			var snapDone = PGN.jk.scan(o.sc, t0, function (aItem) {
				if (aItem instanceof FolderItem) o.folders.push(aItem);
			});

			if (snapDone) o.phase = 'unfold';
			return st;
		}

		// deleteProjectFolders: every folder child → root...
		if (o.phase == 'unfold') {
			while (o.f < o.folders.length) {
				var fld = o.folders[o.f];

				if (fld.numItems == 0) {
					o.f++;
					continue;
				}
				PGN.jk.touch(st, o.undoName);
				fld.item(1).parentFolder = root;
				if (!PGN.jk.more(t0)) break;
			}
			if (o.f >= o.folders.length) {
				o.folders = [];
				o.i = app.project.numItems;
				o.phase = 'clean';
			}
			return st;
		}

		// deleteEmptyProjectFolders...
		if (o.phase == 'clean') {
			if (PGN.jk.cleanStep(st, o, t0)) {
				o.sc = { i: 1, n: app.project.numItems };
				o.phase = 'scan';
			}
			return st;
		}

		// getComps (ascending) + getFootage...
		if (o.phase == 'scan') {
			var ftg = o.footage;

			st.label = 'analisando itens ' + Math.min(o.sc.i, o.sc.n) + '/' + o.sc.n;

			var scanDone = PGN.jk.scan(o.sc, t0, function (aItem) {
				if (aItem instanceof CompItem) {
					o.comps.push(aItem);
					return;
				}
				try {
					if (!(aItem instanceof FootageItem)) return;

					if (aItem.footageMissing) {
						ftg.missingNames.push(aItem.name);
						ftg.missingArray.push(aItem);
						return;
					}
					if (aItem.mainSource instanceof SolidSource) {
						ftg.solidArray.push(aItem);
						return;
					}
					if (!(aItem.mainSource instanceof FileSource)) return;

					if (aItem.mainSource.isStill) {
						ftg.stillArray.push(aItem);
						return;
					}
					if (aItem.hasVideo) {
						ftg.videoArray.push(aItem);
						return;
					}
					ftg.sonoArray.push(aItem);
				} catch (err) { }
			});

			if (scanDone) {
				// classic getFootage walked the items backwards...
				for (var a in ftg) {
					if (ftg.hasOwnProperty(a)) ftg[a].reverse();
				}
				o.phase = 'tag';
			}
			return st;
		}

		// getCompsAndTemplates: 'export' tags...
		if (o.phase == 'tag') {
			while (o.c < o.comps.length) {
				st.label = 'analisando comps ' + (o.c + 1) + '/' + o.comps.length;
				PGN.jk.orgTag(st, o.comps[o.c]);
				o.c++;
				if (!PGN.jk.more(t0)) break;
			}
			if (o.c >= o.comps.length) o.phase = 'folders';
			return st;
		}

		// projectTemplateFolders + work queues...
		if (o.phase == 'folders') {
			PGN.jk.touch(st, o.undoName);

			var folders = projectTemplateFolders(projectMode);
			var f = o.footage;

			o.folders = folders;
			o.queues = [
				{ items: f.videoArray, folder: folders[1] },
				{ items: f.stillArray, folder: folders[2] },
				{ items: f.sonoArray, folder: folders[3] },
				{ items: f.solidArray, folder: folders[4] },
				{ items: o.comps, comps: true }
			];
			if (ignoreMissing) o.queues.push({ items: f.missingArray, missing: true });

			var count = 0;

			for (var q = 0; q < o.queues.length; q++) {
				o.queues[q].subs = {};
				count += o.queues[q].items.length;
			}
			o.q = 0;
			o.k = 0;
			st.total = count;
			st.done = 0;
			st.label = 'organizando 0/' + count;
			o.phase = 'place';
			return st;
		}

		// populate*ItemFolders...
		if (o.phase == 'place') {
			while (o.q < o.queues.length) {
				var qu = o.queues[o.q];

				// classic: the 'missing' folder is created after the comps...
				if (qu.missing && !qu.folder) {
					PGN.jk.touch(st, o.undoName);
					qu.folder = app.project.items.addFolder('missing');
				}
				if (o.k >= qu.items.length) {
					o.q++;
					o.k = 0;
					continue;
				}
				var aItem = qu.items[o.k];

				if (qu.comps) {
					PGN.jk.orgPlaceComp(st, aItem, o.folders, qu.subs);
				} else {
					PGN.jk.orgPlaceFootage(st, aItem, qu.folder, qu.subs);
				}
				o.k++;
				o.placed++;
				st.done = o.placed;
				st.label = 'organizando ' + o.placed + '/' + st.total;
				if (!PGN.jk.more(t0)) break;
			}
			if (o.q >= o.queues.length) {
				o.i = app.project.numItems;
				o.phase = 'clean2';
				st.label = 'removendo pastas vazias';
			}
			return st;
		}

		// deleteEmptyProjectFolders...
		if (o.phase == 'clean2') {
			if (PGN.jk.cleanStep(st, o, t0)) {
				o.phase = 'done';
				o.finished = true;
				o.queues = [];
				o.comps = [];
				o.folders = [];
			}
			return st;
		}
	} finally {
		PGN.jk.close(st);
	}
	return st;
};

// getCompsAndTemplates loop body...
PGN.jk.orgTag = function (st, comp) {
	var undoName = st.org.undoName;

	function mark() {
		if (comp.comment == 'export') return;
		PGN.jk.touch(st, undoName);
		comp.comment = 'export'; // → export tag
	}

	try {
		// essential graphics template name
		var templateName = comp.motionGraphicsTemplateName;

		// item is end page template...
		if (templateName == 'end page') {
			mark();
			return;
		}
		// item is not end page template...
		for (var l = 1; l <= comp.numLayers; l++) {
			var service = comp.layer(l)
				.property('ADBE Effect Parade')
				.property('servico');
			var epService = comp.layer(l)
				.property('ADBE Effect Parade')
				.property('servico end page');

			if (service != undefined || epService != undefined) {
				// has a layer with date and time information...
				mark();
				break;
			}
			if (!(comp.layer(l).source instanceof CompItem)) break; // layer is not comp...

			// layer is comp...
			var preComp = comp.layer(l).source;

			templateName = preComp.motionGraphicsTemplateName;

			var isEp = false;

			try {
				epService = preComp.layer('ctrl_comp')
					.property('ADBE Effect Parade')
					.property('servico end page'); // effect named 'servico end page'...

				if (epService != undefined) {
					// precomp is end page...
					mark();
					isEp = true;
				}
			} catch (err) { }
			if (isEp) break;

			// has a end page precomp layer...
			if (templateName == 'end page') mark();
		}
	} catch (err) { }
};

// populateFootageItemFolders loop body...
PGN.jk.orgPlaceFootage = function (st, aItem, folder, subs) {
	var undoName = st.org.undoName;
	var itemComment = aItem.comment;

	PGN.jk.touch(st, undoName);

	if (itemComment == '') {
		aItem.parentFolder = folder;
		return;
	}
	var set = itemComment.split(':')[0];
	var subFolderName = set.replaceSpecialCharacters();
	var subFolderObjName = subFolderName.replace(/\s/g, '_');

	if (subs.hasOwnProperty(subFolderObjName)) {
		aItem.parentFolder = subs[subFolderObjName];
		return;
	}
	var subFolder = app.project.items.addFolder(subFolderName);

	subFolder.parentFolder = folder; // subfolder...
	aItem.parentFolder = subFolder; // subfolder...
	subs[subFolderObjName] = subFolder;
};

// populateCompItemFolders loop body (subs is shared by every comp, as in the classic)...
PGN.jk.orgPlaceComp = function (st, comp, folders, subs) {
	var undoName = st.org.undoName;
	var rndFolder = folders[0]; // render comps folder...
	var compsFolder = folders[5]; // comps folder...
	var edtFolder = folders[6]; // editable comps folder...
	var epFolder = folders[7]; // end page comps folder...
	// essential graphics template name...
	var templateName = comp.motionGraphicsTemplateName;
	var parent;
	var subFolderName;
	var subFolderObjName;
	var subFolder;

	PGN.jk.touch(st, undoName);

	try {
		var epService = comp.layer('ctrl_comp')
			.property('ADBE Effect Parade')
			.property('servico end page'); // effect named 'servico end page'...

		if (epService != undefined) {
			// is end page...
			comp.parentFolder = epFolder; // → end page folder
			return;
		}
	} catch (err) { }

	if (comp.comment.match('export')) {
		comp.parentFolder = rndFolder; // → render folder
		if (templateName == 'Untitled') return;
		parent = rndFolder;

	} else if (comp.comment.match('edit')) {
		comp.parentFolder = edtFolder; // → edit folder
		return;

	} else {
		comp.parentFolder = compsFolder; // → comps folder
		if (comp.comment.match('ignore') || templateName == 'Untitled') return;
		parent = compsFolder;
	}
	subFolderName = PGN.jk.compSubName(templateName);
	subFolderObjName = subFolderName.replace(/\s/g, '_');

	if (subs.hasOwnProperty(subFolderObjName)) {
		comp.parentFolder = subs[subFolderObjName];
		return;
	}
	subFolder = app.project.items.addFolder(subFolderName);
	subFolder.parentFolder = parent; // subfolder...
	comp.parentFolder = subFolder; // subfolder...
	subs[subFolderObjName] = subFolder;
};

// classic alert('some files are missing...') → finish message / data...
PGN.jk.orgMsg = function (st) {
	var miss = st.org ? st.org.footage.missingNames : [];
	var msg = 'Projeto organizado';

	if (!ignoreMissing && miss.length > 0) {
		msg += ' \u00b7 ' + PGN.n(miss.length, 'arquivo ausente', 'arquivos ausentes') + ': ' + miss.slice(0, 3).join(', ');
		if (miss.length > 3) msg += '...';
	}
	return { msg: msg, data: { missing: miss } };
};

/*

---------------------------------------------------------------
> collect files (filesCollectHN / filesCollectPROMO)
---------------------------------------------------------------

  phases: scan (footage items, indeterminate) → copy (total = footage items)
  returns the classic collect path in st.col.savePath.

*/

PGN.jk.colInit = function (st, projName) {
	var savePath;

	if (hardNews) {
		savePath = PRODUCAO_DIA_A_DIA() + '/_EMAILS'; // collect folder path...
	} else {
		if (orgFolders) {
			var objId = projId.substring(0, 3);

			if (promoSubPath.hasOwnProperty(objId)) projName = promoSubPath[objId] + '/' + projName;
		}
		savePath = projPath + '/' + projName; // collect folder path...
	}
	createPathFolders(savePath);
	// the same form as the items' paths (decodeURI(fullName)): 'D:/x' and '/d/x' compare equal
	savePath = decodeURI(new Folder(savePath).fullName);

	st.col = {
		phase: 'scan',
		hn: hardNews,
		projName: projName,
		savePath: savePath,
		mounts: PGN.net && PGN.net.mounts ? PGN.net.mounts() : null,
		sc: { i: 1, n: app.project.numItems },
		items: [],
		k: 0,
		copied: 0,
		failed: 0,
		finished: false
	};
	st.total = 0;
	st.done = 0;
	st.label = 'coletando arquivos';
	return st;
};

PGN.jk.colStep = function (st) {
	var c = st.col;
	var t0 = PGN.jk.now();

	try {
		if (c.phase == 'scan') {
			var scanDone = PGN.jk.scan(c.sc, t0, function (aItem) {
				if (aItem instanceof FootageItem) c.items.push(aItem);
			});

			if (scanDone) {
				c.phase = 'copy';
				st.total = c.items.length;
				st.done = 0;
				st.label = 'coletando 0/' + st.total;
				if (st.total == 0) c.finished = true;
			}
			return st;
		}
		while (c.k < c.items.length) {
			var aItem = c.items[c.k];

			c.k++;
			st.done = c.k;
			st.label = 'coletando ' + c.k + '/' + st.total;
			if (c.hn) {
				PGN.jk.colHN(st, aItem);
			} else {
				PGN.jk.colPROMO(st, aItem);
			}
			if (!PGN.jk.more(t0)) break;
		}
		if (c.k >= c.items.length) {
			c.finished = true;
			c.items = [];
		}
	} finally {
		PGN.jk.close(st);
	}
	return st;
};

// copies a file into a folder for the collect: returns the copy, or null when it failed
// (the item is then left pointing at its original file). A file of the same name already
// there is reused only when it is the same size (the same footage imported twice);
// otherwise the copy gets a number ('logo 2.png') instead of overwriting it.
PGN.jk.copyInto = function (srcPath, destDir) {
	var src = new File(srcPath);

	if (!src.exists || !createPath(destDir)) return null;

	// a folder (bundle) — the classic copy, no renaming
	if (src.length < 0) return copyFile(srcPath, destDir) ? new File(destDir + '/' + src.name) : null;

	var name = decodeURI(src.name);
	var dot = name.lastIndexOf('.');
	var base = dot > 0 ? name.substring(0, dot) : name;
	var ext = dot > 0 ? name.substring(dot) : '';
	var target = new File(destDir + '/' + name);

	for (var n = 2; target.exists && target.length != src.length && n < 1000; n++) {
		target = new File(destDir + '/' + base + ' ' + n + ext);
	}
	if (!target.exists && !src.copy(target.fsName)) return null;
	return target.exists ? target : null;
};

// an image sequence (footage made of numbered frames): the whole sequence goes to a
// subfolder named after it and the item is replaced as a sequence again — copying only
// the first frame turned it into a still
PGN.jk.isSequence = function (aItem) {
	try {
		var src = aItem.mainSource;

		return src instanceof FileSource && !src.isStill && /\d+\.(png|jpe?g|tiff?|tga|exr|dpx|psd|bmp|gif|cin|hdr|iff|sgi|pic|webp)$/i.test(decodeURI(aItem.file.name));
	} catch (e) { }
	return false;
};

PGN.jk.copySequence = function (aItem, destDir) {
	var first = aItem.file;
	var name = decodeURI(first.name);
	var m = /^(.*?)(\d+)(\.[^.]+)$/.exec(name);

	if (!m) return null;
	var prefix = m[1];
	var ext = m[3].toLowerCase();
	var seqName = (prefix.replace(/[\s._-]+$/, '') || 'sequencia');
	var target = destDir + '/' + seqName;

	if (!createPath(target)) return null;
	var all = first.parent.getFiles();
	var copied = 0;

	for (var i = 0; i < all.length; i++) {
		if (!(all[i] instanceof File)) continue;
		var fn = decodeURI(all[i].name);
		var fm = /^(.*?)(\d+)(\.[^.]+)$/.exec(fn);

		if (!fm || fm[1] != prefix || fm[3].toLowerCase() != ext) continue;
		var dest = new File(target + '/' + fn);

		if (dest.exists || all[i].copy(dest.fsName)) copied++;
		else return null;
	}
	var newFirst = new File(target + '/' + name);

	return copied && newFirst.exists ? newFirst : null;
};

// collects one footage item into destDir: a sequence as a sequence, a file as a file.
// returns false when the copy failed (the item keeps its original file)
PGN.jk.collectItem = function (st, aItem, filePath, destDir) {
	var seq = PGN.jk.isSequence(aItem);
	var newFile = seq ? PGN.jk.copySequence(aItem, destDir) : PGN.jk.copyInto(filePath, destDir);

	if (!newFile) return false;
	PGN.jk.touch(st, 'save project');
	if (seq) aItem.replaceWithSequence(newFile, false);
	else aItem.replace(newFile);
	return true;
};

// filesCollectHN loop body...
PGN.jk.colHN = function (st, aItem) {
	var c = st.col;
	var savePath = c.savePath;

	if (aItem.file == null) return;
	if (!aItem.file.exists) return;

	var fileName = decodeURI(aItem.file.name);
	var filePath = decodeURI(aItem.file.fullName);
	var newFilePath = [savePath, c.projName].join('/');

	// local drives C:, D:, F:, I: | local user folders...
	var regExp = /^\/(c|d|f|i)\/|^~\//;

	if (filePath.indexOf(savePath) != 0 && !filePath.match(regExp) && !(PGN.sys && PGN.sys.isLocalFile && PGN.sys.isLocalFile(filePath, c.mounts))) return;

	if (!PGN.jk.collectItem(st, aItem, filePath, newFilePath)) { c.failed++; return; }
	c.copied++;
};

// filesCollectPROMO loop body...
PGN.jk.colPROMO = function (st, aItem) {
	var c = st.col;
	var savePath = c.savePath;

	if (aItem.file == null) return;
	if (!aItem.file.exists) return;

	var itemPath = '';
	var itemFolder = aItem.parentFolder;

	while (itemFolder != app.project.rootFolder) {
		itemPath = itemFolder.name + '/' + itemPath;
		itemFolder = itemFolder.parentFolder;
	}
	var fileName = decodeURI(aItem.file.name);
	var filePath = decodeURI(aItem.file.fullName);
	var newFilePath = [savePath, 'project files', itemPath].join('/');

	if (filePath.indexOf(savePath) == 0) return;

	if (!PGN.jk.collectItem(st, aItem, filePath, newFilePath)) { c.failed++; return; }
	c.copied++;
};

/*

---------------------------------------------------------------
> collect fonts (fontCollect)
---------------------------------------------------------------

  phases: scan (getComps, indeterminate) → layers (total = comps)
  failed fonts end up in st.fnt.fail (classic: alert).

*/

PGN.jk.fntInit = function (st, savePath) {
	savePath += '/fonts'; // collect folder path...
	var saveFolder = new Folder(savePath); // collect folder...

	if (!saveFolder.exists) createPath(savePath);

	st.fnt = {
		phase: 'scan',
		savePath: savePath,
		folder: saveFolder,
		sc: { i: 1, n: app.project.numItems },
		comps: [],
		c: 0,
		l: 1,
		fonts: [], // copied fonts array...
		fail: [], // failed copy array...
		finished: false
	};
	st.total = 0;
	st.done = 0;
	st.label = 'coletando fontes';
	return st;
};

PGN.jk.fntStep = function (st) {
	var f = st.fnt;
	var t0 = PGN.jk.now();

	if (f.phase == 'scan') {
		var scanDone = PGN.jk.scan(f.sc, t0, function (aItem) {
			if (aItem instanceof CompItem) f.comps.push(aItem);
		});

		if (scanDone) {
			f.phase = 'layers';
			st.total = f.comps.length;
			st.done = 0;
			st.label = 'coletando fontes 0/' + st.total;
		}
		return st;
	}
	while (f.c < f.comps.length) {
		var comp = f.comps[f.c]; // current comp...

		if (f.l > comp.numLayers) {
			f.c++;
			f.l = 1;
			st.done = f.c;
			st.label = 'coletando fontes ' + f.c + '/' + st.total;
			continue;
		}
		var aLayer = comp.layer(f.l); // current layer...

		f.l++;
		if (aLayer instanceof TextLayer) PGN.jk.fntLayer(f, aLayer);
		if (!PGN.jk.more(t0)) break;
	}
	if (f.c >= f.comps.length) {
		var left = f.folder.exists ? f.folder.getFiles() : null;

		if (left && left.length == 0) f.folder.remove();
		f.comps = [];
		f.finished = true;
	}
	return st;
};

// fontCollect inner loop body...
PGN.jk.fntLayer = function (f, aLayer) {
	var textDoc = aLayer
		.property('ADBE Text Properties')
		.property('ADBE Text Document').value;
	var fontName = textDoc.font; // font name...
	var fontSrcFile = new File(decodeURI(textDoc.fontLocation)); // font file...

	if (!fontSrcFile.exists) {
		if (f.fail.indexOf(fontName) < 0) f.fail.push(fontName); // no font file...
		return;
	}
	if (f.fonts.indexOf(fontName) >= 0) return; // already copied...

	var fontCopyFile = new File(f.savePath + '/' + fontSrcFile.displayName);

	// a font that could not be copied goes to the failed list, not to the collected one
	if (fontCopyFile.exists || fontSrcFile.copy(fontCopyFile)) f.fonts.push(fontName);
	else if (f.fail.indexOf(fontName) < 0) f.fail.push(fontName);
};
