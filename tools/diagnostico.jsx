/*
---------------------------------------------------------------
> PROMO GNEWS · diagnóstico
---------------------------------------------------------------
  File › Scripts › Run Script File… → este arquivo.

  lista tudo do PROMO GNEWS instalado nesta máquina e diz quais
  cópias ainda trazem o alerta antigo 'drive N: is not available':
    · barra antiga (ScriptUI Panels / Startup, do app e de cada versão)
    · extensões CEP (do usuário e do sistema), com a pasta de fontes
      que cada uma usa (host/src ou a pasta 'source' da rede)
    · o host carregado agora no After Effects (PGN_SRC / PGN_HOST)
  o resultado pode ser copiado da janela.
*/
(function () {
	var IS_MAC = $.os.indexOf('Win') < 0;
	var out = [];
	var ALERT = 'is not available';

	function log(s) { out.push(s); }

	// lê um arquivo de texto (UTF-8 ou UTF-16 com BOM) e diz se tem o alerta antigo
	function hasAlert(file) {
		if (!file.exists) return null;
		var txt = '';

		try {
			file.encoding = 'BINARY';
			file.open('r');
			var raw = file.read();

			file.close();
			if (raw.charCodeAt(0) == 0xFF && raw.charCodeAt(1) == 0xFE) {
				for (var i = 2; i < raw.length - 1; i += 2) txt += String.fromCharCode(raw.charCodeAt(i) | (raw.charCodeAt(i + 1) << 8));
			} else txt = raw;
		} catch (e) { return '?'; }
		// .jsxbin é binário: procura o texto cru também
		return txt.indexOf(ALERT) >= 0 || txt.indexOf('drive N') >= 0;
	}

	function scanScripts(dir) {
		var f = new Folder(dir);

		if (!f.exists) return;
		var items = f.getFiles();

		for (var i = 0; i < items.length; i++) {
			if (!(items[i] instanceof File) || !/promo|gnews/i.test(items[i].name)) continue;
			log('  ' + items[i].fsName + (hasAlert(items[i]) === true ? '   ← TEM O ALERTA' : ''));
		}
	}

	function scanExtensions(dir) {
		var f = new Folder(dir);

		if (!f.exists) return;
		var items = f.getFiles();

		for (var i = 0; i < items.length; i++) {
			if (!(items[i] instanceof Folder) || !/promo|gnews/i.test(items[i].name)) continue;
			var ext = items[i];
			var root = '';

			log('  ' + ext.fsName + (ext.alias ? '  (link)' : ''));
			// instalada pelo instalador: só o carregador, que aponta para a rede
			var stub = new File(ext.fsName + '/client/panel/index.html');

			if (stub.exists) {
				stub.open('r');
				var html = stub.read();

				stub.close();
				var m = html.match(/var ROOT = ([^;]+);/);
				root = m ? m[1].replace(/^['"]|['"]$/g, '').replace(/\\\\/g, '\\') : '';

				if (root) log('     carregador \u2192 ' + root);
			}
			var srcs = [ext.fsName + '/host/src/globals.js', ext.fsName + '/../../source/globals.js'];

			if (root) srcs.push(root + '/host/src/globals.js', root + '/../source/globals.js');

			for (var s = 0; s < srcs.length; s++) {
				var g = new File(srcs[s]);

				if (g.exists) log('     fontes ' + g.parent.fsName + (hasAlert(g) === true ? '   ← TEM O ALERTA (cópia antiga)' : '   ok'));
			}
		}
	}

	log('After Effects ' + app.version + ' · ' + $.os);
	log('');
	log('host carregado agora:');
	log('  PGN_HOST = ' + ($.global.PGN_HOST || '—'));
	log('  PGN_SRC  = ' + ($.global.PGN_SRC || '—') + ($.global.PGN_SRC ? (hasAlert(new File($.global.PGN_SRC + '/globals.js')) === true ? '   ← TEM O ALERTA (cópia antiga)' : '   ok') : ''));
	log('  PGN_BOOT_MSG = ' + ($.global.PGN_BOOT_MSG || '—'));
	log('');

	log('barra antiga (ScriptUI):');
	var app1 = Folder.appPackage.fsName;

	scanScripts(app1 + '/Scripts/ScriptUI Panels');
	scanScripts(app1 + '/Scripts/Startup');
	scanScripts(app1 + '/../Scripts/ScriptUI Panels'); // macOS: Scripts fica ao lado do .app
	scanScripts(app1 + '/../Scripts/Startup');
	var prefsBase = IS_MAC ? Folder.userData.fsName.replace(/Application Support$/, 'Preferences') : Folder.userData.fsName;
	var vers = new Folder(prefsBase + '/Adobe/After Effects').getFiles();

	for (var v = 0; vers && v < vers.length; v++) {
		if (!(vers[v] instanceof Folder)) continue;
		scanScripts(vers[v].fsName + '/Scripts/ScriptUI Panels');
		scanScripts(vers[v].fsName + '/Scripts/Startup');
	}
	log('');

	log('extensões CEP:');
	scanExtensions(Folder.userData.fsName + '/Adobe/CEP/extensions');
	scanExtensions(IS_MAC ? '/Library/Application Support/Adobe/CEP/extensions' : Folder.commonFiles.fsName + '/Adobe/CEP/extensions');

	var w = new Window('dialog', 'PROMO GNEWS · diagnóstico');
	var t = w.add('edittext', undefined, out.join('\n'), { multiline: true, readonly: false, scrollable: true });

	t.preferredSize = [720, 420];
	w.add('button', undefined, 'fechar', { name: 'ok' });
	w.show();
})();
