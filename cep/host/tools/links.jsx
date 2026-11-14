/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/*

---------------------------------------------------------------
> PROMO GNEWS · CEP tools · atalhos (links)
---------------------------------------------------------------

  the 'Atalhos' section of the bar, now editable in the preferences.
  saved per user in '<script prefs>/shortcuts.json':

    { sites: [{ id, name, url, glyph | icon }],
      dirs:  [{ id, name, path, glyph | icon }] }

  a dir path starting with '@' follows the script's own logic:
    @artePath @magazinePath    PAM folders (set in the preferences)
    @hnPath @utiPath @basesPath  network shares (off in home office)
    @hoje                      DIARIOS · today's folder
  any other path is used as is (macOS: network paths mount on demand).

    links.get                      → { sites, dirs, defaults }  (dirs carry 'shown' + 'net')
    links.set   { sites, dirs }    → saves
    links.reset                    → back to the defaults
    links.pick                     → { path } from a folder dialog (null: cancelled)
    links.open  { kind, id }       → opens the site / folder

*/

(function () {

	var DEFAULTS = {
		sites: [
			{ id: 'od', name: 'OneDrive', url: 'https://tvglobocorp-my.sharepoint.com/', glyph: 'OD' },
			{ id: 'pl', name: 'Planner', url: 'https://tasks.office.com/tvglobocorp.onmicrosoft.com/en-US/Home/Planner/#/userboard', glyph: 'PL' }
		],
		dirs: [
			{ id: 'arte', name: 'PAM para arte', path: '@artePath', icon: 'up' },
			{ id: 'mag', name: 'PAM magazine', path: '@magazinePath', icon: 'slide' },
			{ id: 'hn', name: 'PAM hard news', path: '@hnPath', icon: 'bolt' },
			{ id: 'uti', name: 'T: utilidades', path: '@utiPath', icon: 'star' },
			{ id: 'pec', name: 'peças gráficas', path: '@basesPath', icon: 'bars' },
			{ id: 'hoje', name: 'diários · hoje', path: '@hoje', icon: 'dot' }
		]
	};
	// dynamic paths: getter + whether it lives on the network share (disabled in home office)
	var DYN = {
		'@artePath': { get: function () { return artePath; }, net: false },
		'@magazinePath': { get: function () { return magazinePath; }, net: false },
		'@hnPath': { get: function () { return hnPath; }, net: true },
		'@utiPath': { get: function () { return utiPath; }, net: true },
		'@basesPath': { get: function () { return basesPath; }, net: true },
		'@hoje': { get: function () { return PRODUCAO_DIA_A_DIA(); }, net: true, auto: true }
	};

	function clone(o) { return JSON.parse(JSON.stringify(o)); }
	function isArr(v) { return v != null && typeof v == 'object' && typeof v.length == 'number' && typeof v.splice == 'function'; }

	function file() {
		var folder = new Folder(scriptPreferencesPath);

		if (!folder.exists) folder.create();
		return new File(scriptPreferencesPath + '/shortcuts.json');
	}

	/*
	  the team's list ('config geral', <PROMO GNEWS folder>/config/atalhos.json):
	    { sites: [...], dirs: [...], removed: { sites: [ids], dirs: [ids] } }
	  team list = the defaults above, minus 'removed', plus / replaced by the shared items.

	  the user's list (shortcuts.json) is merged with it at every load:
	    · a team item the user did not change follows the team's version
	    · a team item the user changed ('own') stays as the user left it
	    · a team item the user removed ('gone') does not come back
	    · an item removed for everybody leaves the user's list too (unless 'own')
	    · team items the user never had are added
	*/
	var KINDS = ['sites', 'dirs'];
	var KEY = { sites: 'url', dirs: 'path' };

	function sharedRead() {
		var o = PGN.cfg.readJSON('atalhos.json') || {};
		var rm = o.removed || {};

		return {
			sites: clean(o.sites, 'url'),
			dirs: clean(o.dirs, 'path'),
			removed: { sites: isArr(rm.sites) ? rm.sites : [], dirs: isArr(rm.dirs) ? rm.dirs : [] }
		};
	}

	function indexOfId(list, id) {
		for (var i = 0; i < list.length; i++) {
			if (list[i].id == id) return i;
		}
		return -1;
	}

	function inList(arr, v) {
		for (var i = 0; i < arr.length; i++) {
			if (arr[i] == v) return true;
		}
		return false;
	}

	function team(shared) {
		var sh = shared || sharedRead();
		var out = { sites: [], dirs: [] };

		for (var k = 0; k < KINDS.length; k++) {
			var kind = KINDS[k];
			var list = clone(DEFAULTS[kind]);
			var i;

			for (i = list.length - 1; i >= 0; i--) {
				if (inList(sh.removed[kind], list[i].id)) list.splice(i, 1);
			}
			for (i = 0; i < sh[kind].length; i++) {
				var at = indexOfId(list, sh[kind][i].id);

				if (at >= 0) list[at] = sh[kind][i];
				else list.push(sh[kind][i]);
			}
			out[kind] = list;
		}
		return out;
	}

	function differs(a, b, kind) {
		var key = KEY[kind];

		return String(a.name) != String(b.name) || String(a[key] || '') != String(b[key] || '') ||
			String(a.glyph || '') != String(b.glyph || '') || String(a.glyph ? '' : (a.icon || '')) != String(b.glyph ? '' : (b.icon || ''));
	}

	function readUser() {
		var f = file();

		if (f.exists) {
			try {
				f.encoding = 'UTF-8';
				var o = JSON.parse(readFileContent(f));

				if (o && isArr(o.sites) && isArr(o.dirs)) return o;
			} catch (e) { }
		}
		return null;
	}

	function load(shared) {
		var sh = shared || sharedRead();
		var tm = team(sh);
		var u = readUser();

		if (u == null) return clone(tm);

		var legacy = u.v != 2; // saved before the team list existed
		var gone = u.gone || {};
		var out = { sites: [], dirs: [] };

		for (var k = 0; k < KINDS.length; k++) {
			var kind = KINDS[k];
			var mine = clean(u[kind], KEY[kind], true);
			var g = isArr(gone[kind]) ? gone[kind] : [];
			var i, at;

			for (i = 0; i < mine.length; i++) {
				var it = mine[i];

				at = indexOfId(tm[kind], it.id);
				// a file from before: what differs from the team's version was the user's choice
				if (legacy && at >= 0) it.own = differs(it, tm[kind][at], kind);
				if (at >= 0 && !it.own) { out[kind].push(clone(tm[kind][at])); continue; }
				// removed for everybody: goes away, unless the user made it their own
				if (at < 0 && inList(sh.removed[kind], it.id) && !it.own) continue;
				out[kind].push(it);
			}
			for (i = 0; i < tm[kind].length; i++) {
				var t = tm[kind][i];

				if (indexOfId(out[kind], t.id) >= 0 || inList(g, t.id)) continue;
				// a file from before: a default that is missing was removed by the user
				if (legacy && indexOfId(DEFAULTS[kind], t.id) >= 0) continue;
				out[kind].push(clone(t));
			}
		}
		return out;
	}

	// saves the user's list: marks what differs from the team ('own') and what was left out ('gone')
	function save(o, shared) {
		var tm = team(shared);
		var f = file();
		var out = { v: 2, sites: [], dirs: [], gone: { sites: [], dirs: [] } };

		for (var k = 0; k < KINDS.length; k++) {
			var kind = KINDS[k];
			var i, at;

			for (i = 0; i < o[kind].length; i++) {
				var it = clone(o[kind][i]);

				at = indexOfId(tm[kind], it.id);
				delete it.own;
				if (at >= 0 && differs(it, tm[kind][at], kind)) it.own = true;
				out[kind].push(it);
			}
			for (i = 0; i < tm[kind].length; i++) {
				if (indexOfId(o[kind], tm[kind][i].id) < 0) out.gone[kind].push(tm[kind][i].id);
			}
		}
		f.encoding = 'UTF-8';
		PGN.writeJSON(f, out, true);
	}

	function clean(list, key, keepOwn) {
		var out = [];

		if (!isArr(list)) return out;
		for (var i = 0; i < list.length; i++) {
			var it = list[i];

			if (!it || typeof it != 'object') continue;
			var o = { id: String(it.id || ('l' + new Date().getTime() + i)), name: String(it.name || '').substr(0, 40) };

			o[key] = String(it[key] || '');
			if (it.glyph) o.glyph = String(it.glyph).toUpperCase().substr(0, 2);
			else o.icon = String(it.icon || (key == 'url' ? 'globe' : 'up'));
			if (keepOwn && it.own === true) o.own = true;
			out.push(o);
		}
		return out;
	}

	// what the editor shows for a dir: resolved path + flags
	function describe(o, shared) {
		var r = clone(o);
		var tm = team(shared);

		// team: the item is in the team's list · mine: only this user's, or changed here
		for (var k = 0; k < KINDS.length; k++) {
			for (var n = 0; n < r[KINDS[k]].length; n++) {
				var x = r[KINDS[k]][n];
				var at = indexOfId(tm[KINDS[k]], x.id);

				x.team = at >= 0;
				x.mine = at < 0 || differs(x, tm[KINDS[k]][at], KINDS[k]);
				delete x.own;
			}
		}

		for (var i = 0; i < r.dirs.length; i++) {
			var d = r.dirs[i], dyn = DYN[d.path];

			d.net = !!(dyn && dyn.net);
			d.auto = !!(dyn && dyn.auto);
			try {
				d.shown = dyn ? (dyn.auto ? 'pasta do dia (automático)' : String(dyn.get() || '')) : d.path;
			} catch (e) { d.shown = d.path; }
		}
		return r;
	}

	function checkNet() {
		if (!netAccess()) PGN.fail('habilite ' + netConfigName + ' nas preferências do AE');
	}

	PGN.register('links.get', function (args) {
		var sh = sharedRead();
		var r = describe(load(sh), sh);

		r.defaults = describe(team(sh), sh);
		return { msg: '', data: r };
	});

	PGN.register('links.set', function (args) {
		var sh = sharedRead();
		var o = { sites: clean(args.sites, 'url'), dirs: clean(args.dirs, 'path') };

		save(o, sh);
		return { msg: 'Atalhos salvos', data: describe(o, sh) };
	});

	// back to the team's list
	PGN.register('links.reset', function (args) {
		var f = file();
		var sh = sharedRead();

		if (f.exists) f.remove();
		return { msg: 'Atalhos padr\u00E3o', data: describe(team(sh), sh) };
	});

	// ↑ 'salvar para todos': one shortcut ({ kind: 'sites' | 'dirs', id }) or, without args,
	// every one that is only this user's (new, or changed here). They become the team's.
	PGN.register('links.publish', function (args) {
		var sh = sharedRead();
		var tm = team(sh);
		var cur = load(sh);
		var count = 0;

		for (var k = 0; k < KINDS.length; k++) {
			var kind = KINDS[k];

			if (args.kind && args.kind != kind) continue;
			for (var i = 0; i < cur[kind].length; i++) {
				var it = cur[kind][i];
				var at = indexOfId(tm[kind], it.id);

				if (args.id && args.id != it.id) continue;
				if (at >= 0 && !differs(it, tm[kind][at], kind)) continue; // already the team's
				var copy = clean([it], KEY[kind])[0];
				var sAt = indexOfId(sh[kind], it.id);

				if (sAt >= 0) sh[kind][sAt] = copy;
				else sh[kind].push(copy);
				for (var r = sh.removed[kind].length - 1; r >= 0; r--) {
					if (sh.removed[kind][r] == it.id) sh.removed[kind].splice(r, 1);
				}
				count++;
			}
		}
		if (count == 0) return { msg: 'nenhum atalho novo para salvar', data: describe(cur, sh) };

		PGN.cfg.writeJSON('atalhos.json', sh);
		save(cur, sh); // nothing here is 'own' any more
		return { msg: PGN.n(count, 'atalho salvo', 'atalhos salvos') + ' para todos', data: describe(load(sh), sh) };
	});

	// × twice: removes one shortcut for everybody (and from this user's list)
	PGN.register('links.unpublish', function (args) {
		var kind = args.kind == 'sites' || args.kind == 'dirs' ? args.kind : null;

		if (!kind || !args.id) PGN.fail('atalho inv\u00E1lido');

		var sh = sharedRead();
		var tm = team(sh);

		if (indexOfId(tm[kind], args.id) < 0) PGN.fail('este atalho n\u00E3o est\u00E1 na lista da equipe');

		var at = indexOfId(sh[kind], args.id);

		if (at >= 0) sh[kind].splice(at, 1);
		if (!inList(sh.removed[kind], args.id)) sh.removed[kind].push(args.id);
		PGN.cfg.writeJSON('atalhos.json', sh);

		var cur = load(sh);
		var mine = indexOfId(cur[kind], args.id);

		if (mine >= 0) cur[kind].splice(mine, 1);
		save(cur, sh);
		return { msg: 'atalho exclu\u00EDdo para todos', data: describe(load(sh), sh) };
	});

	PGN.register('links.pick', function (args) {
		var f = Folder.selectDialog('pasta do atalho');

		if (f == null) return { msg: '', data: { path: null } };
		return { msg: '', data: { path: f.fsName } };
	});

	// macOS: mount the share a folder link needs before opening it (PGN.net.before)
	var NET_KEY = { '@artePath': 'arte', '@magazinePath': 'mag', '@hnPath': 'hn', '@utiPath': 'cdesign', '@basesPath': 'cdesign', '@hoje': 'cdesign' };

	if (PGN.net && PGN.net.needs) {
		PGN.net.needs['links.open'] = [function (args) {
			if (!args || args.kind == 'site') return null;
			var dirs = load().dirs;

			for (var i = 0; i < dirs.length; i++) {
				if (dirs[i].id != args.id) continue;
				return NET_KEY[dirs[i].path] ? PGN.net.need(NET_KEY[dirs[i].path], args) : dirs[i].path;
			}
			return null;
		}];
	}

	PGN.register('links.open', function (args) {
		var o = load();
		var list = args.kind == 'site' ? o.sites : o.dirs;
		var it = null;

		for (var i = 0; i < list.length; i++) {
			if (list[i].id == args.id) it = list[i];
		}
		if (it == null) PGN.fail('atalho não encontrado');
		checkNet();

		if (args.kind == 'site') {
			if (!it.url) PGN.fail('atalho sem endereço');
			openWebSite(it.url);
			return it.name + ' aberto';
		}
		var dyn = DYN[it.path];

		if (dyn && dyn.net && homeOffice) PGN.fail('indisponível no modo home office');
		var p = dyn ? dyn.get() : it.path;

		if (!p) PGN.fail('pasta não definida');
		// macOS: //server/share → /Volumes/share (mounted on demand)...
		p = PGN.net.local(p, true);

		// a folder that doesn't exist yet (today's, early in the day) or was moved:
		// open the nearest one that does, and say so
		var fld = new Folder(p);
		var near = fld;

		while (near != null && !near.exists) near = near.parent;
		// nothing found, or only a drive / share root: not worth opening
		if (near == null || (near.fsName != fld.fsName && near.parent == null)) PGN.fail('pasta inacess\u00EDvel: ' + fld.fsName);
		openFolder(near.fsName);

		if (near.fsName != fld.fsName) return it.name + ': a pasta ainda n\u00E3o existe \u00B7 aberta ' + decodeURI(near.name);
		return it.name + ' aberto';
	});

})();
