/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/*

---------------------------------------------------------------
> PROMO GNEWS · CEP host · platform (Windows + macOS)
---------------------------------------------------------------

  loaded by index.jsx right after the classic sources and before
  core.jsx / tools. the classic helpers were written for Windows
  (cmd.exe, PowerShell, Shell.Application, UNC paths); this file:

    · PGN.sys   → shell quoting, safe callSystem, today's date,
                  ScriptUI Panels folder, user fonts folder
    · PGN.net   → company shares (UNC ⇄ drive letter ⇄ /Volumes),
                  on demand mounting on macOS, offline flag
    · overrides → setClipboard, openFolder, openWebSite,
                  getURLContent, unzipContent, zipContent,
                  installFonts, PRODUCAO_DIA_A_DIA,
                  createPathFolders, filesCollectHN,
                  updateFolderPaths, loadDefaultPrefs (wrapped)

  Windows keeps the classic behavior (same commands) unless the
  classic helper was broken; macOS gets native equivalents.

  nothing here mounts a share at load time: on macOS the network
  globals are only translated to /Volumes form. a tool that needs
  a share mounts it on demand through PGN.net.before(id, args)
  (called by PGN.run) or PGN.net.local(path, true).

  reference: o-padeiro 'file system lib.js' + 'acessorista.js'.

*/

var PGN = PGN || {};

PGN.classic = PGN.classic || {}; // the classic (Windows) functions replaced below...

// keeps the classic function once (a second evaluation must not wrap a wrapper)...
function PGN_override(name, fn) {
	var cur = $.global[name];

	if (typeof cur == 'function' && !cur.pgnPlatform) PGN.classic[name] = cur;
	fn.pgnPlatform = true;
	$.global[name] = fn;
}

/*

---------------------------------------------------------------
> system helpers
---------------------------------------------------------------

*/

PGN.sys = {
	isMac: appOs == 'Mac',

	// POSIX shell single quotes → 'it'\''s'
	q: function (str) {
		return "'" + String(str).replace(/'/g, "'\\''") + "'";
	},

	trim: function (str) {
		return String(str == null ? '' : str).replace(/^\s+|\s+$/g, '');
	},

	// system.callSystem that never throws (network access pref off, missing tool...)...
	run: function (cmd) {
		try {
			var out = system.callSystem(cmd);

			return out == null ? '' : String(out);
		} catch (err) {
			return '';
		}
	},

	pad: function (n) {
		return n < 10 ? '0' + n : String(n);
	},

	// 'dd/mm/yyyy' → what 'cmd.exe /c date /t' printed on the pt-BR machines (trimmed)...
	today: function () {
		var dt = new Date();

		return PGN.sys.pad(dt.getDate()) + '/' + PGN.sys.pad(dt.getMonth() + 1) + '/' + dt.getFullYear();
	},

	ext: function (name) {
		var s = String(name);
		var i = s.lastIndexOf('.');

		return i < 0 ? '' : s.substring(i).toLowerCase();
	},

	// file in the script temp folder (created when missing)...
	tempFile: function (name) {
		var fld = new Folder(tempPath);

		if (!fld.exists) fld.create();
		return new File(fld.fullName + '/' + name);
	},

	// 'Scripts/ScriptUI Panels' of the running AE
	//   Win → <Support Files>/Scripts/ScriptUI Panels (Folder.appPackage = Support Files)
	//   Mac → /Applications/Adobe After Effects <v>/Scripts/ScriptUI Panels
	//         (Folder.appPackage is the .app bundle, Scripts is next to it)
	scriptUIFolder: function () {
		var f = Folder.appPackage;

		for (var i = 0; i < 5 && f != null; i++) {
			if (new Folder(f.fsName + '/Scripts').exists) return f.fsName + '/Scripts/ScriptUI Panels';
			f = f.parent;
		}
		return Folder.appPackage.fsName + '/Scripts/ScriptUI Panels';
	},

	// macOS per user fonts folder (no admin rights, picked up by CoreText)...
	userFontsFolder: function () {
		return Folder('~/Library/Fonts');
	}
};

/*

---------------------------------------------------------------
> network shares
---------------------------------------------------------------

  Windows: //server/share/rest  (or a mapped drive letter)
  macOS:   /Volumes/share/rest  (share mounted by Finder / osascript;
           a share mounted again gets a suffix: share-1 … share-5)

*/

PGN.net = PGN.net || {};

PGN.net.domain = 'corp'; // smb://corp%5Cuser@server/share
PGN.net.offline = ''; // '' → network ok | message → network share unavailable
PGN.net.unc = PGN.net.unc || {}; // classic network globals (original UNC form)...

// share (as mounted on macOS) → server. same company network as o-padeiro...
PGN.net.SHARES = {
	arte_ilha: { server: 'pamjb.servicos.corp.tvglobo.com.br', share: 'Arte_Ilha' }, // pamAdd
	cdesign: { server: 'egcdesign01.servicos.corp.tvglobo.com.br', share: 'cdesign' }, // tAdd
	vfx: { server: 'vfx-ml-sp.servicos.corp.tvglobo.com.br', share: 'VFX' },
	edit_in_place: { server: 'vfx-ml-sp.servicos.corp.tvglobo.com.br', share: 'EDIT_IN_PLACE' }
};

// mapped drive letters (Windows machines of the company network)...
PGN.net.DRIVE_MAP = {
	T: '//egcdesign01.servicos.corp.tvglobo.com.br/cdesign',
	L: '//vfx-ml-sp.servicos.corp.tvglobo.com.br/VFX/imagem/drive_l',
	K: '//vfx-ml-sp.servicos.corp.tvglobo.com.br/VFX/imagem/drive_k',
	V: '//vfx-ml-sp.servicos.corp.tvglobo.com.br/EDIT_IN_PLACE',
	Y: '//vfx-ml-sp.servicos.corp.tvglobo.com.br/VFX',
	P: '//vfx-ml-sp.servicos.corp.tvglobo.com.br/VFX/imagem/drive_p'
};

PGN.net.UNC_TO_DRIVE = {};

(function () {
	for (var d in PGN.net.DRIVE_MAP) {
		if (PGN.net.DRIVE_MAP.hasOwnProperty(d)) PGN.net.UNC_TO_DRIVE[PGN.net.DRIVE_MAP[d]] = d + ':';
	}
	// same globals as o-padeiro (only when nothing defined them)...
	if (typeof DRIVE_MAP == 'undefined') $.global.DRIVE_MAP = PGN.net.DRIVE_MAP;
	if (typeof UNC_TO_DRIVE == 'undefined') $.global.UNC_TO_DRIVE = PGN.net.UNC_TO_DRIVE;
})();

// forward slashes, no quotes / blanks around, smb://[user@] → //
PGN.net.slashes = function (path) {
	return PGN.sys
		.trim(path)
		.replace(/^["']+|["']+$/g, '')
		.replace(/\\/g, '/')
		.replace(/^smb:\/\/([^@\/]+@)?/i, '//');
};

PGN.net.exists = function (path) {
	if (path == null || path === '') return false;
	try {
		return new Folder(path).exists || new File(path).exists;
	} catch (err) {
		return false;
	}
};

// known share by name (macOS suffix '-1'…'-5' ignored)...
PGN.net.shareInfo = function (name) {
	var key = String(name).replace(/-[1-5]$/, '').toLowerCase();

	return PGN.net.SHARES.hasOwnProperty(key) ? PGN.net.SHARES[key] : null;
};

// drive letter / smb / UNC → '//server/share/rest' (null when not a network path)...
PGN.net.toUNC = function (path) {
	var p = PGN.net.slashes(path);
	var m = p.match(/^([a-z]):(\/.*)?$/i); // T:/...

	// '/t/...' → how decodeURI(Folder) writes 'T:/...' on Windows (saved prefs)...
	if (!m && PGN.sys.isMac) m = p.match(/^\/([a-z])(\/.*)?$/i);

	if (m) {
		var unc = PGN.net.DRIVE_MAP[m[1].toUpperCase()];

		return unc ? unc + (m[2] || '') : null;
	}
	return /^\/\/[^\/]+\/[^\/]+/.test(p) ? p.replace(/\/+$/, '') : null;
};

// '//server/share/rest' → { server, share, rest ('' or '/...') }
PGN.net.splitUNC = function (unc) {
	var m = String(unc).match(/^\/\/([^\/]+)\/([^\/]+)(\/.*)?$/);

	if (!m) return null;
	return { server: m[1], share: m[2], rest: (m[3] || '').replace(/\/+$/, '') };
};

// macOS: the /Volumes variant (share, share-1 … share-5) holding the path, or the
// variant holding the deepest part of it (folder still to be created)...
PGN.net.resolveVolume = function (volume, rest) {
	var base = String(volume).replace(/-[1-5]$/, '');
	var parts = String(rest || '').split('/');
	var clean = [];
	var candidates = [volume];
	var i;

	for (i = 0; i < parts.length; i++) {
		if (parts[i] !== '') clean.push(parts[i]);
	}
	for (i = 0; i <= 5; i++) {
		var name = i == 0 ? base : base + '-' + i;

		if (name != volume) candidates.push(name);
	}
	var tail = clean.length > 0 ? '/' + clean.join('/') : '';
	var best = '/Volumes/' + volume + tail;
	var bestDepth = -1;

	for (var c = 0; c < candidates.length; c++) {
		var cur = '/Volumes/' + candidates[c];

		if (!new Folder(cur).exists) continue;

		var depth = 0;

		for (var p = 0; p < clean.length; p++) {
			cur += '/' + clean[p];
			if (!PGN.net.exists(cur)) break;
			depth++;
		}
		if (depth == clean.length) return cur; // full path found...

		if (depth > bestDepth) {
			bestDepth = depth;
			best = '/Volumes/' + candidates[c] + tail;
		}
	}
	return best;
};

// macOS network mounts → [{ host, share, point, type }] (parses /sbin/mount)...
PGN.net.mounts = function () {
	var list = [];

	if (!PGN.sys.isMac) return list;

	var lines = PGN.sys.run('/sbin/mount').split(/\r?\n/);

	for (var i = 0; i < lines.length; i++) {
		var line = lines[i];
		var typeIdx = line.lastIndexOf(' (');

		if (typeIdx < 0) continue;

		var onIdx = line.lastIndexOf(' on ', typeIdx);

		if (onIdx < 0) continue;

		var type = line.substring(typeIdx + 2).split(/[,\)]/)[0].toLowerCase();

		if (type != 'smbfs' && type != 'afpfs' && type != 'webdav' && type != 'nfs') continue;

		var src = line.substring(0, onIdx).replace(/^\/\//, '').replace(/^[^@\/]*@/, '');
		var slash = src.indexOf('/');
		var host = slash < 0 ? src : src.substring(0, slash);
		var share = slash < 0 ? '' : src.substring(slash + 1).split('/')[0];

		try {
			share = decodeURIComponent(share);
		} catch (err) { }

		list.push({
			host: host.toLowerCase(),
			share: share,
			point: line.substring(onIdx + 4, typeIdx).replace(/\\040/g, ' ').replace(/\/+$/, ''),
			type: type
		});
	}
	return list;
};

PGN.net.sameHost = function (a, b) {
	a = String(a).toLowerCase();
	b = String(b).toLowerCase();
	return a == b || a.split('.')[0] == b.split('.')[0];
};

// macOS: mount point of server/share ('' when not mounted)...
PGN.net.mountedRoot = function (server, share) {
	var list = PGN.net.mounts();
	var key = String(share).toLowerCase();

	for (var i = 0; i < list.length; i++) {
		if (list[i].share.toLowerCase() != key) continue;
		if (!PGN.net.sameHost(list[i].host, server)) continue;
		if (list[i].point.indexOf('/Volumes/') == 0) return list[i].point;
	}
	return '';
};

// macOS: mounts smb://corp\user@server/share (Finder asks for the password if needed)...
PGN.net.mountShare = function (server, share) {
	var root = PGN.net.mountedRoot(server, share);

	if (root) return root;

	var user = PGN.sys.trim(PGN.sys.run('id -un'));
	var address = 'smb://' +
		(user ? PGN.net.domain + '%5C' + encodeURIComponent(user) + '@' : '') +
		server + '/' + encodeURIComponent(share);

	PGN.sys.run('osascript -e ' + PGN.sys.q('mount volume "' + address + '"'));

	return PGN.net.mountedRoot(server, share);
};

/*
  usable local path for the current OS:
    Win → drive letters / UNC as they are, /Volumes/<share>/… → //server/share/…
    Mac → UNC / drive letter / smb:// → /Volumes/<share>/… (suffix resolved)
          mount = true → mounts the share when it is not mounted
  anything else → the original path.
*/
PGN.net.local = function (path, mount) {
	if (path == null || path === '') return path;

	var p = PGN.net.slashes(path);
	var info;
	var m;

	if (!PGN.sys.isMac) {
		m = p.match(/^\/Volumes\/([^\/]+)(\/.*)?$/i);
		if (m) {
			info = PGN.net.shareInfo(m[1]);
			if (info) return '//' + info.server + '/' + info.share + (m[2] || '');
		}
		if (/^smb:\/\//i.test(PGN.sys.trim(path))) return p;
		return path;
	}
	var server = null;
	var share;
	var rest;
	var unc = PGN.net.toUNC(p);

	if (unc) {
		var u = PGN.net.splitUNC(unc);

		if (!u) return path;
		server = u.server;
		share = u.share;
		rest = u.rest;
	} else {
		m = p.match(/^\/Volumes\/([^\/]+)(\/.*)?$/);
		if (!m) return path;
		share = m[1];
		rest = (m[2] || '').replace(/\/+$/, '');
		info = PGN.net.shareInfo(share);
		if (info) server = info.server;
	}
	var resolved = PGN.net.resolveVolume(share, rest);

	if (!mount || server == null || PGN.net.exists(resolved)) return resolved;

	var root = PGN.net.mountShare(server, share.replace(/-[1-5]$/, ''));

	return root ? root + rest : resolved;
};

// mounts when needed → the path exists?
PGN.net.ensure = function (path) {
	return PGN.net.exists(PGN.net.local(path, true));
};

// network path (share) on this machine?
PGN.net.isNetwork = function (path, mounts) {
	var p = PGN.net.slashes(path);

	if (PGN.net.toUNC(p)) return true;
	if (!PGN.sys.isMac) return false;

	var m = p.match(/^\/Volumes\/([^\/]+)/);

	if (!m) return false;
	if (PGN.net.shareInfo(m[1])) return true;

	var list = mounts || PGN.net.mounts();

	for (var i = 0; i < list.length; i++) {
		if (p == list[i].point || p.indexOf(list[i].point + '/') == 0) return true;
	}
	return false;
};

// classic globals → local form again (after a mount the volume suffix may change)...
PGN.net.localPrefs = function () {
	if (typeof artePath != 'undefined') artePath = PGN.net.local(artePath);
	if (typeof magazinePath != 'undefined') magazinePath = PGN.net.local(magazinePath);
	if (typeof projPath != 'undefined') projPath = PGN.net.local(projPath);
};

PGN.net.refresh = function () {
	if (PGN.sys.isMac) {
		for (var k in PGN.net.unc) {
			if (PGN.net.unc.hasOwnProperty(k)) $.global[k] = PGN.net.local(PGN.net.unc[k]);
		}
		PGN.net.localPrefs();
	}
	updateFolderPaths();
};

/*

  on demand mounting: PGN.run calls PGN.net.before(id, args) before a tool.
  needs[id] → list of getters (PGN.net.getters key, or a global variable name)
  returning the path to make available (null → nothing needed right now).

*/

PGN.net.getters = {
	cdesign: function () {
		return homeOffice ? null : PGN.net.unc.tAdd;
	},
	hn: function () {
		return homeOffice ? null : PGN.net.unc.hnPath;
	},
	arte: function () {
		return artePath;
	},
	mag: function () {
		return magazinePath;
	},
	proj: function () {
		return projPath;
	},
	templates: function () {
		return homeOffice ? null : PGN.net.unc.templatesArchPath;
	},
	fonts: function () {
		return homeOffice ? null : PGN.net.unc.fontsArchPath;
	},
	archive: function () {
		return homeOffice ? null : PGN.net.unc.promoArcPath;
	},
	// 'PRODUCAO DIA-A-DIA' (hard news) → the share (today's folder may not exist yet)...
	today: function () {
		return hardNews && !homeOffice ? PGN.net.unc.tAdd : null;
	},
	// png preview right click on hard news...
	todayAlt: function (args) {
		return args && args.alt === true && hardNews && !homeOffice ? PGN.net.unc.tAdd : null;
	}
};

PGN.net.needs = {
	// shortcuts...
	hn: ['hn'],
	uti: ['cdesign'],
	pec: ['cdesign'],
	hoje: ['cdesign'],
	arte: ['arte'],
	mag: ['mag'],
	// templates window...
	'tpl.list': ['templates'],
	'tpl.download': ['templates'],
	'tpl.import': ['templates'],
	'tpl.openFolder': ['templates'],
	// end page presets (templatesPath)...
	endp: ['templates'],
	'endp.state': ['templates'],
	'endp.read': ['templates'],
	'endp.apply': ['templates'],
	'endp.load': ['templates'],
	'endp.save': ['templates'],
	'endp.openFolder': ['templates'],
	// dev tab (zip the templates / fonts folders)...
	'dev.zipTpl': ['templates'],
	'dev.zipFonts': ['fonts'],
	// fonts window...
	'fonts.list': ['fonts'],
	'fonts.download': ['fonts'],
	'fonts.install': ['fonts'],
	'fonts.openFolder': ['fonts'],
	// project tab (projPath may be a share | PRODUCAO DIA-A-DIA on hard news)...
	save: ['today', 'proj'],
	collect: ['today', 'proj'],
	cfonts: ['today', 'proj'],
	open: ['today', 'proj'],
	preview: ['todayAlt'],
	// preferences...
	'prefs.update': ['archive']
};

PGN.net.need = function (key, args) {
	var g = PGN.net.getters[key];

	if (typeof key == 'function') return key(args);
	if (typeof g == 'function') return g(args);
	if (PGN.net.unc.hasOwnProperty(key)) return PGN.net.unc[key];
	return typeof $.global[key] == 'string' ? $.global[key] : null;
};

PGN.net.before = function (id, args) {
	var list = PGN.net.needs[id];

	if (!list || list.length == 0) return;

	try {
		var changed = false;

		if (PGN.sys.isMac) {
			for (var i = 0; i < list.length; i++) {
				var path = PGN.net.need(list[i], args);

				if (!path || !PGN.net.isNetwork(path)) continue;
				if (PGN.net.exists(PGN.net.local(path))) continue;

				PGN.net.local(path, true); // → mount
				changed = true;
			}
		}
		// mounted something | share was unavailable (Windows: may be back)...
		if (changed || PGN.net.offline) PGN.net.refresh();
	} catch (err) { }
};

PGN.net.status = function () {
	return { os: appOs, offline: PGN.net.offline, homeOffice: homeOffice };
};

/*

---------------------------------------------------------------
> classic overrides
---------------------------------------------------------------

*/

// clipboard (UTF-8 temp file: quotes, accents, & and # pass intact)...
PGN_override('setClipboard', function (str) {
	var tempFile = PGN.sys.tempFile('clipboard.txt');

	tempFile.encoding = 'UTF-8';

	if (appOs == 'Win') {
		writeFileContent(tempFile, '\uFEFF' + str);
		PGN.sys.run(
			'cmd.exe /c powershell.exe -NoProfile -c "Get-Content -Raw -Encoding UTF8 -LiteralPath \'' +
				tempFile.fsName.replace(/'/g, "''") +
				'\' | Set-Clipboard"'
		);
	} else {
		writeFileContent(tempFile, String(str));
		PGN.sys.run('LANG=en_US.UTF-8 pbcopy < ' + PGN.sys.q(tempFile.fsName));
	}
	try {
		tempFile.remove();
	} catch (err) { }
});

// open system folder (network paths resolved / mounted on macOS)...
PGN_override('openFolder', function (folderPath) {
	if (appOs == 'Win') {
		var winFolder = Folder(PGN.net.local(folderPath));

		system.callSystem('explorer ' + Folder.decode(winFolder.fsName));
		return;
	}
	var folder = new Folder(PGN.net.local(folderPath, true));

	// nearest existing parent (Finder 'open' fails on a missing folder)...
	while (folder != null && !folder.exists) folder = folder.parent;
	if (folder == null) return;

	PGN.sys.run('open ' + PGN.sys.q(folder.fsName));
});

// open url...
PGN_override('openWebSite', function (url) {
	if (appOs == 'Win') {
		system.callSystem('explorer ' + url);
	} else {
		PGN.sys.run('open ' + PGN.sys.q(url));
	}
});

// download urlArray[i] → dstArray[i]/<file name>...
PGN_override('getURLContent', function (urlArray, dstArray) {
	if (appOs == 'Win') return PGN.classic.getURLContent(urlArray, dstArray);

	var cmds = [];

	for (var i = 0; i < urlArray.length; i++) {
		// get only the NOT '\' OR '/' at the end, without '?...'...
		var fileName = decodeURI(String(urlArray[i]).match(/[^\\|\/]*$/i)[0]).replace(/[?].*$/, '');
		var dstFolder = new Folder(PGN.net.local(dstArray[i], true));

		if (!dstFolder.exists) createPath(dstFolder.fullName);
		cmds.push('/usr/bin/curl -L -s -f -o ' + PGN.sys.q(dstFolder.fsName + '/' + fileName) + ' ' + PGN.sys.q(urlArray[i]));
	}
	if (cmds.length > 0) PGN.sys.run(cmds.join(' ; '));
});

// zips made on Windows (Compress-Archive) store 'folder\file' names: macOS
// extracts them as flat files with a backslash in the name → move them into folders...
PGN.sys.fixZipNames = function (dstFsName) {
	var sh = PGN.sys.tempFile('fix zip names.sh');

	sh.encoding = 'UTF-8';
	sh.lineFeed = 'Unix';
	writeFileContent(sh,
		'cd "$1" || exit 0\n' +
		'find . -type f -name \'*\\\\*\' | while IFS= read -r f; do\n' +
		'\tn=$(printf \'%s\' "$f" | tr \'\\\\\' \'/\')\n' +
		'\tmkdir -p "$(dirname "$n")"\n' +
		'\tmv -f "$f" "$n"\n' +
		'done\n' +
		'find . -depth -type d -name \'*\\\\*\' -empty -exec rmdir {} \\; 2>/dev/null\n' +
		'exit 0\n'
	);
	PGN.sys.run('/bin/sh ' + PGN.sys.q(sh.fsName) + ' ' + PGN.sys.q(dstFsName));
	try {
		sh.remove();
	} catch (err) { }
};

// extract (overwrite, as Expand-Archive -Force)...
PGN_override('unzipContent', function (zipPath, dstPath) {
	if (appOs == 'Win') return PGN.classic.unzipContent(zipPath, dstPath);

	var zipFile = new File(PGN.net.local(zipPath));
	var dstFolder = new Folder(PGN.net.local(dstPath, true));

	if (!zipFile.exists) return;
	if (!dstFolder.exists) createPath(dstFolder.fullName);

	PGN.sys.run('/usr/bin/ditto -x -k ' + PGN.sys.q(zipFile.fsName) + ' ' + PGN.sys.q(dstFolder.fsName));
	PGN.sys.fixZipNames(dstFolder.fsName);
});

// compress (as Compress-Archive -Force: every item at the archive root, folders keep their name).
// 'path' may be a PowerShell list: "a', 'b" (dev tab)...
PGN_override('zipContent', function (path, zipPath) {
	if (appOs == 'Win') return PGN.classic.zipContent(path, zipPath);

	var items = String(path).split(/'\s*,\s*'/);
	var zipFile = new File(PGN.net.local(zipPath, true));
	var cmds = [];

	if (zipFile.exists) zipFile.remove();
	if (!zipFile.parent.exists) createPath(zipFile.parent.fullName);

	for (var i = 0; i < items.length; i++) {
		var item = PGN.net.local(PGN.sys.trim(items[i]).replace(/^'+|'+$/g, ''));
		var f = new File(item);

		if (!f.exists) f = new Folder(item);
		if (!f.exists) continue;

		cmds.push('cd ' + PGN.sys.q(f.parent.fsName) + ' && /usr/bin/zip -r -q -X ' + PGN.sys.q(zipFile.fsName) + ' ' + PGN.sys.q(File.decode(f.name)));
	}
	if (cmds.length > 0) PGN.sys.run(cmds.join(' ; '));
});

// install every .ttf / .otf of a folder (recursive)
//   Win → classic Shell.Application 'Fonts' namespace copy
//   Mac → copy into ~/Library/Fonts → number of files copied
PGN_override('installFonts', function (fontsPath) {
	if (appOs == 'Win') return PGN.classic.installFonts(fontsPath);

	var srcFolder = new Folder(PGN.net.local(fontsPath, true));
	var dstFolder = PGN.sys.userFontsFolder();
	var count = 0;

	if (!srcFolder.exists) return 0;
	if (!dstFolder.exists) dstFolder.create();

	function copyFonts(folder) {
		var files = folder.getFiles();

		for (var i = 0; i < files.length; i++) {
			if (files[i] instanceof Folder) {
				copyFonts(files[i]);
				continue;
			}
			var name = File.decode(files[i].name);
			var ext = PGN.sys.ext(name);

			if (ext != '.ttf' && ext != '.otf') continue;
			if (files[i].copy(dstFolder.fsName + '/' + name)) count++;
		}
	}
	copyFonts(srcFolder);

	return count;
});

// today's hard news folder (the classic ran 'cmd.exe /c date /t' and ignored the result)...
PGN_override('PRODUCAO_DIA_A_DIA', function () {
	var dt = new Date();
	var y = dt.getFullYear(); // -> 2021
	var m = dt.getMonth() + 1; // -> 1
	var d = PGN.sys.pad(dt.getDate()); // -> 15

	m = PGN.sys.pad(m) + '_' + shortMonthArray[m - 1]; // -> 11_NOV

	var base = PGN.net.unc.tAdd || tAdd;

	return PGN.net.local(base + '/JORNALISMO/GLOBONEWS/DIARIOS/RJ/' + y + '/' + m + '/' + d);
});

// creates every folder of the path (the classic rebuilt it from '/' and turned
// '~/Desktop' into '/~/Desktop' and '/Volumes/...' into '//Volumes/...')...
PGN_override('createPathFolders', function (path) {
	createPath(path);
	return new Folder(path);
});

// local file? (copied to PRODUCAO DIA-A-DIA by filesCollectHN)...
PGN.sys.isLocalFile = function (filePath, mounts) {
	if (appOs == 'Win') return /^\/(c|d|f|i)\/|^~\//.test(filePath); // local drives C:, D:, F:, I: | user folder

	if (/^~\/|^\/Users\//.test(filePath)) return true; // user folders
	if (/^\/Volumes\//.test(filePath)) return !PGN.net.isNetwork(filePath, mounts); // external disks
	return false;
};

// copy all local files used in the project to PRODUCAO DIA-A-DIA...
PGN_override('filesCollectHN', function (projName, progressWindow) {
	var progressLabel = progressWindow.children[0];
	var progressBar = progressWindow.children[1];
	var mounts = PGN.net.mounts();

	progressBar.maxvalue = app.project.numItems;

	var savePath = PRODUCAO_DIA_A_DIA() + '/_EMAILS'; // collect folder path...
	var saveFolder = createPathFolders(savePath);

	for (var i = 1; i <= app.project.numItems; i++) {
		var aItem = app.project.item(i);
		progressBar.value = i;

		if (!(aItem instanceof FootageItem)) continue;
		if (aItem.file == null) continue;
		if (!aItem.file.exists) continue;

		progressLabel.text = 'collecting: ' + aItem.name;
		progressWindow.update();

		var fileName = decodeURI(aItem.file.name);
		var filePath = decodeURI(aItem.file.fullName);
		var newFilePath = [savePath, projName].join('/');

		// already inside the collect folder | local file (not on a network share)...
		if (filePath.indexOf(savePath) < 0 && !PGN.sys.isLocalFile(filePath, mounts)) continue;

		copyFile(filePath, newFilePath);
		var newFile = new File([newFilePath, fileName].join('/'));
		aItem.replace(newFile);
	}
	return savePath;
});

// templates / fonts folders (same decisions as the classic, no alert: PGN.net.offline)...
PGN_override('updateFolderPaths', function () {
	PGN.net.offline = '';

	templatesPath = !homeOffice ? templatesArchPath : templatesLocalPath;
	fontsPath = !homeOffice ? fontsArchPath : fontsLocalPath;

	if (!homeOffice && !PGN.net.exists(tAdd)) {
		PGN.net.offline = 'rede cdesign (T:) indispon\u00EDvel \u00B7 usando templates e fontes locais (modo home office recomendado)';
		templatesPath = templatesLocalPath;
		fontsPath = fontsLocalPath;
	}
	templatesFolder = new Folder(templatesPath);
	tempFolder = new Folder(tempPath);
	fontsFolder = new Folder(fontsPath);
});

// preferences reload → folder paths in local form...
PGN_override('loadDefaultPrefs', function () {
	PGN.classic.loadDefaultPrefs();
	PGN.net.localPrefs();
});

/*

---------------------------------------------------------------
> load time
---------------------------------------------------------------

*/

(function () {
	var names = ['tAdd', 'hnPath', 'utiPath', 'promoInsPath', 'basesPath', 'promoArcPath', 'templatesArchPath', 'fontsArchPath'];

	for (var i = 0; i < names.length; i++) {
		var v = $.global[names[i]];

		// keep the first (UNC) value: a re-evaluation must not store /Volumes paths...
		if (typeof v == 'string' && (!PGN.net.unc.hasOwnProperty(names[i]) || /^\/\//.test(v))) PGN.net.unc[names[i]] = v;
	}

	if (PGN.sys.isMac) {
		// /Volumes form, no mounting (no login dialog at startup)...
		PGN.net.refresh();
	} else if (!homeOffice && templatesPath == templatesLocalPath) {
		// the classic updateFolderPaths already checked the share (and alerted)...
		PGN.net.offline = 'rede cdesign (T:) indispon\u00EDvel \u00B7 usando templates e fontes locais (modo home office recomendado)';
	}
})();
