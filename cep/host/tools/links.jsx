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
			{ id: 'tr', name: 'Trello promo', url: 'https://trello.com/promo126/home', glyph: 'TR' },
			{ id: 'ap', name: 'Apontamento', url: 'https://gglobo-pea-hdg-prd.web.app/#card_view', glyph: 'AP' },
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

	function file() {
		var folder = new Folder(scriptPreferencesPath);

		if (!folder.exists) folder.create();
		return new File(scriptPreferencesPath + '/shortcuts.json');
	}

	function load() {
		var f = file();

		if (f.exists) {
			try {
				f.encoding = 'UTF-8';
				var o = JSON.parse(readFileContent(f));

				if (o && o.sites instanceof Array && o.dirs instanceof Array) return o;
			} catch (e) { }
		}
		return clone(DEFAULTS);
	}

	function save(o) {
		var f = file();

		f.encoding = 'UTF-8';
		PGN.writeJSON(f, o, true);
	}

	function clean(list, key) {
		var out = [];

		if (!(list instanceof Array)) return out;
		for (var i = 0; i < list.length; i++) {
			var it = list[i];

			if (!it || typeof it != 'object') continue;
			var o = { id: String(it.id || ('l' + new Date().getTime() + i)), name: String(it.name || '').substr(0, 40) };

			o[key] = String(it[key] || '');
			if (it.glyph) o.glyph = String(it.glyph).toUpperCase().substr(0, 2);
			else o.icon = String(it.icon || (key == 'url' ? 'globe' : 'up'));
			out.push(o);
		}
		return out;
	}

	// what the editor shows for a dir: resolved path + flags
	function describe(o) {
		var r = clone(o);

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
		var r = describe(load());

		r.defaults = describe(clone(DEFAULTS));
		return { msg: '', data: r };
	});

	PGN.register('links.set', function (args) {
		var o = { sites: clean(args.sites, 'url'), dirs: clean(args.dirs, 'path') };

		save(o);
		return { msg: 'Atalhos salvos', data: describe(o) };
	});

	PGN.register('links.reset', function (args) {
		var f = file();

		if (f.exists) f.remove();
		return { msg: 'Atalhos padrão', data: describe(clone(DEFAULTS)) };
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
