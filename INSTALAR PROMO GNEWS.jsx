/*

---------------------------------------------------------------
> PROMO GNEWS · instalador da extensão
---------------------------------------------------------------

  No After Effects: File > Scripts > Run Script File... e escolha este
  arquivo, direto da pasta do PROMO GNEWS na rede. Funciona no macOS e
  no Windows (rodando dentro do After Effects o macOS não bloqueia).

  O código continua na rede: a máquina recebe só um carregador (o
  manifest e uma página por painel/janela que abre a página de verdade,
  na pasta 'cep' da rede). Para atualizar basta trocar os arquivos na
  rede e reabrir o painel; o instalador só precisa rodar de novo quando
  o manifest mudar (uma janela nova, por exemplo).

  Pasta esperada (a mesma estrutura do repositório):
    INSTALAR PROMO GNEWS.jsx
    cep/      → extensão (manifest, client, host, loader)
    source/   → fontes do script (globals, libraries, layout)

  Passos: boas-vindas → checagem → instalar / atualizar / remover → andamento.

  Instalar / atualizar:
    1. grava o carregador na pasta de extensões CEP do usuário;
    2. liga o PlayerDebugMode (extensões sem assinatura só carregam com ele);
    3. (opcional) remove o script ScriptUI antigo das pastas 'ScriptUI Panels'.

  (adaptado do instalador do O PADEIRO)

*/

(function () {
	var EXT_ID = 'com.promognews.cep';
	var IS_MAC = $.os.indexOf('Win') < 0;
	var WIDTH = 340;

	var here = new File($.fileName).parent;
	var src = new Folder(here.fsName + '/cep');
	var sources = new Folder(here.fsName + '/source');
	var userData = Folder.userData.fsName; // macOS: ~/Library/Application Support | Windows: %APPDATA%
	var dest = new Folder(userData + '/Adobe/CEP/extensions/' + EXT_ID);
	var OLD_NAMES = ['PROMO GNEWS.jsxbin', 'PROMO GNEWS.jsx', 'PROMO GNEWS DEV.jsx'];

	/* ---------------------------------------------------------------
	   checagens
	   --------------------------------------------------------------- */

	// "Allow Scripts to Write Files and Access Network"
	function canWriteFiles() {
		try {
			return app.preferences.getPrefAsLong('Main Pref Section', 'Pref_SCRIPTING_FILE_NETWORK_SECURITY') == 1;
		} catch (err) {
			return true; // versões que não expõem a preferência: tenta assim mesmo
		}
	}

	function aeVersionOk() {
		return parseInt(app.version, 10) >= 22; // After Effects 2022
	}

	function extensionOk() {
		return new File(src.fsName + '/CSXS/manifest.xml').exists && new File(src.fsName + '/loader/stub.html').exists;
	}

	function sourcesOk() {
		return new File(sources.fsName + '/globals.js').exists;
	}

	function version() {
		try {
			var m = readText(new File(src.fsName + '/CSXS/manifest.xml')).match(/ExtensionBundleVersion="([^"]+)"/);

			return m ? m[1] : '';
		} catch (err) {
			return '';
		}
	}

	/* ---------------------------------------------------------------
	   arquivos
	   --------------------------------------------------------------- */

	function shellQuote(path) {
		return "'" + String(path).replace(/'/g, "'\\''") + "'";
	}

	function readText(file) {
		file.encoding = 'UTF-8';
		file.open('r');

		var text = file.read();

		file.close();
		return text;
	}

	// literal de string JavaScript (o ExtendScript antigo não tem JSON)
	function jsString(str) {
		return '"' + String(str).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
	}

	function writeText(file, text) {
		file.encoding = 'UTF-8';
		file.open('w');
		file.write(text);
		file.close();
	}

	function createFolders(folder) {
		if (folder.exists) return true;
		if (folder.parent && !folder.parent.exists) createFolders(folder.parent);
		return folder.create();
	}

	// Windows: remoção pelo próprio ExtendScript
	function removeFolder(folder) {
		var items = folder.getFiles();

		for (var i = 0; i < items.length; i++) {
			if (items[i] instanceof Folder) removeFolder(items[i]);
			else items[i].remove();
		}
		folder.remove();
	}

	function removeExtension() {
		if (IS_MAC) {
			// 'rm' sem barra no fim apaga só o link, se a instalação de desenvolvimento for um link
			system.callSystem('rm -rf ' + shellQuote(dest.fsName));
		} else if (dest.exists) {
			removeFolder(dest);
		}
	}

	// o carregador: o manifest da rede e, para cada painel/janela, uma página que abre a página de verdade na rede
	function installExtension() {
		var manifest = new File(src.fsName + '/CSXS/manifest.xml');
		var stub = new File(src.fsName + '/loader/stub.html');

		if (!manifest.exists || !stub.exists) return ['arquivos da extensão não encontrados em ' + src.fsName];

		var xml = readText(manifest);
		var template = readText(stub);
		var pages = xml.match(/<MainPath>\.\/client\/[^<]+<\/MainPath>/g) || [];
		var errors = [];

		removeExtension();
		createFolders(new Folder(dest.fsName + '/CSXS'));
		writeText(new File(dest.fsName + '/CSXS/manifest.xml'), xml);

		var debug = new File(src.fsName + '/.debug');

		if (debug.exists) debug.copy(dest.fsName + '/.debug');

		for (var i = 0; i < pages.length; i++) {
			var page = pages[i].replace(/^<MainPath>\.\/client\//, '').replace(/<\/MainPath>$/, '');
			var html = template
				.replace(/__PGN_ROOT__/g, function () { return jsString(src.fsName); })
				.replace(/__PGN_PAGE__/g, function () { return jsString(page); });
			var out = new File(dest.fsName + '/client/' + page);

			createFolders(out.parent);
			writeText(out, html);
			if (!out.exists) errors.push('não foi possível gravar ' + out.fsName);
		}
		if (!new File(dest.fsName + '/CSXS/manifest.xml').exists) errors.push('não foi possível gravar em ' + dest.fsName);
		return errors;
	}

	function enableDebugMode() {
		for (var v = 7; v <= 13; v++) {
			if (IS_MAC) system.callSystem('defaults write com.adobe.CSXS.' + v + ' PlayerDebugMode 1');
			else system.callSystem('reg add "HKCU\\Software\\Adobe\\CSXS.' + v + '" /v PlayerDebugMode /t REG_SZ /d 1 /f');
		}
	}

	// o script antigo ficava nas pastas 'ScriptUI Panels' (do app e das preferências de cada versão)
	function oldScriptFolders() {
		var list = [new Folder(Folder.appPackage.fsName + '/Scripts/ScriptUI Panels')];
		var prefsBase = IS_MAC ? userData.replace(/Application Support$/, 'Preferences') : userData;
		var aeFolder = new Folder(prefsBase + '/Adobe/After Effects');

		if (aeFolder.exists) {
			var versions = aeFolder.getFiles();

			for (var i = 0; i < versions.length; i++) {
				if (versions[i] instanceof Folder) list.push(new Folder(versions[i].fsName + '/Scripts/ScriptUI Panels'));
			}
		}
		return list;
	}

	function findOldScripts() {
		var found = [];
		var folders = oldScriptFolders();

		for (var f = 0; f < folders.length; f++) {
			for (var n = 0; n < OLD_NAMES.length; n++) {
				var old = new File(folders[f].fsName + '/' + OLD_NAMES[n]);

				if (old.exists) found.push(old);
			}
		}
		return found;
	}

	function removeOldScripts() {
		var olds = findOldScripts();
		var removed = 0, locked = 0;

		for (var i = 0; i < olds.length; i++) {
			if (olds[i].remove()) removed++;
			else locked++;
		}
		return { removed: removed, locked: locked };
	}

	/* ---------------------------------------------------------------
	   interface (passo a passo)
	   --------------------------------------------------------------- */

	var COLOR_OK = [0.36, 0.9, 0.63];
	var COLOR_BAD = [1, 0.42, 0.42];
	var COLOR_WARN = [0.98, 0.76, 0.33];
	var COLOR_LINK = [0.56, 0.72, 1];
	var COLOR_LINK_HOVER = [0.9, 0.18, 0.18];
	var STATE_COLORS = { ok: COLOR_OK, bad: COLOR_BAD, warn: COLOR_WARN };

	function setColor(ctrl, rgb) {
		ctrl.graphics.foregroundColor = ctrl.graphics.newPen(ctrl.graphics.PenType.SOLID_COLOR, rgb, 1);
	}

	function text(parent, value, height) {
		var t = parent.add('statictext', undefined, value, { multiline: true });

		t.preferredSize = [WIDTH, height || -1];
		return t;
	}

	function link(parent, value, onClick) {
		var t = parent.add('statictext', undefined, value);

		t.preferredSize.width = WIDTH;
		setColor(t, COLOR_LINK);
		t.addEventListener('mouseover', function () { setColor(t, COLOR_LINK_HOVER); });
		t.addEventListener('mouseout', function () { setColor(t, COLOR_LINK); });
		t.addEventListener('mousedown', onClick);
		return t;
	}

	var ver = version();
	var win = new Window('window', 'PROMO GNEWS' + (ver ? ' v' + ver : '') + ' · instalador', undefined, { closeButton: false });

	win.orientation = 'column';
	win.alignChildren = ['center', 'top'];
	win.spacing = 14;
	win.margins = [14, 18, 14, 14];

	// logo (o mesmo do README), ou o nome se a imagem não estiver na pasta
	try {
		win.add('image', undefined, new File(here.fsName + '/images/GNEWS_LOGO light.png'));
	} catch (err) {
		var title = win.add('statictext', undefined, 'PROMO GNEWS');

		title.graphics.font = ScriptUI.newFont(title.graphics.font.name, 'BOLD', 18);
	}

	var pages = win.add('group');

	pages.orientation = 'stack';
	pages.alignment = ['fill', 'top'];
	pages.alignChildren = ['fill', 'top'];

	function page() {
		var g = pages.add('group');

		g.orientation = 'column';
		g.alignChildren = ['left', 'top'];
		g.spacing = 10;
		g.visible = false;
		return g;
	}

	// 0 · boas-vindas
	var p0 = page();

	text(p0,
		'olá! vamos instalar a barra PROMO GNEWS no After Effects.\n\n' +
		'depois de instalada ela se atualiza sozinha: basta fechar e abrir o painel. ' +
		'o instalador só precisa rodar de novo quando a equipe avisar.', 92);

	// 1 · checagem
	var p1 = page();

	text(p1, 'conferindo o que a barra precisa:', 18);

	var checks = [
		{ label: 'After Effects 2022 ou mais novo', test: aeVersionOk, required: true, help: 'a barra precisa do After Effects 2022 (22.0) ou mais novo.' },
		{ label: 'acesso à rede e escrita de arquivos', test: canWriteFiles, required: true, help: 'habilite "Allow Scripts to Write Files and Access Network" nas preferências de scripts e expressões.' },
		{ label: 'pasta "cep" ao lado do instalador', test: extensionOk, required: true, help: 'rode o instalador direto da pasta do PROMO GNEWS na rede (a que tem as pastas "cep" e "source").' },
		{ label: 'pasta "source" ao lado do instalador', test: sourcesOk, required: true, help: 'a pasta "source" (fontes do script) precisa estar ao lado da pasta "cep".' }
	];

	for (var c = 0; c < checks.length; c++) {
		var row = p1.add('group');

		row.orientation = 'row';
		row.alignChildren = ['left', 'center'];
		row.spacing = 8;
		// uma bolinha por estado, coloridas antes de abrir a janela (no macOS trocar a cor depois não redesenha)
		var dots = row.add('group');

		dots.orientation = 'stack';
		checks[c].dots = {};

		for (var st in STATE_COLORS) {
			checks[c].dots[st] = dots.add('statictext', undefined, '●');
			setColor(checks[c].dots[st], STATE_COLORS[st]);
			checks[c].dots[st].visible = false;
		}
		checks[c].text = row.add('statictext', undefined, checks[c].label);
		checks[c].text.preferredSize.width = WIDTH - 24;
	}

	var helpText = text(p1, '', 46);
	var prefsLink = link(p1, '› abrir preferências de scripts e expressões', function () {
		app.executeCommand(3131); // Preferences > Scripting & Expressions
		runChecks();
	});

	link(p1, '› verificar de novo', function () { runChecks(); });

	// 2 · ação
	var p2 = page();
	var installed = dest.exists;

	text(p2, installed ? 'a barra já está instalada neste computador. o que você quer fazer?' : 'tudo pronto! o que você quer fazer?', 34);

	var radios = p2.add('group');

	radios.orientation = 'row';
	radios.spacing = 24;

	var installRdo = radios.add('radiobutton', undefined, installed ? 'atualizar' : 'instalar');
	var removeRdo = radios.add('radiobutton', undefined, 'remover');

	installRdo.value = true;
	removeRdo.enabled = installed;

	var oldCkb = p2.add('checkbox', undefined, 'remover o script antigo (ScriptUI)');
	var olds = findOldScripts();

	oldCkb.value = olds.length > 0;
	oldCkb.enabled = olds.length > 0;
	oldCkb.helpTip = olds.length ? 'encontrado em:\n' + (function () {
		var l = [];

		for (var i = 0; i < olds.length; i++) l.push(olds[i].parent.fsName);
		return l.join('\n');
	})() : 'nenhum script antigo encontrado';

	var srcText = p2.add('statictext', undefined, 'origem: ' + src.fsName, { truncate: 'middle' });

	srcText.preferredSize.width = WIDTH;
	srcText.helpTip = src.fsName;

	// 3 · andamento e conclusão
	var p3 = page();
	var resultText = text(p3, '', 110);

	var progressLab = win.add('statictext', undefined, '');
	var progressBar = win.add('progressbar', undefined, 0, 100);

	progressLab.preferredSize = [WIDTH, 18];
	progressBar.preferredSize = [WIDTH, 4];

	var buttons = win.add('group');

	buttons.orientation = 'stack';
	buttons.alignment = ['fill', 'top'];

	var leftBtns = buttons.add('group');
	var rightBtns = buttons.add('group');

	leftBtns.alignment = 'left';
	rightBtns.alignment = 'right';

	var cancelBtn = leftBtns.add('button', undefined, 'cancelar');
	var backBtn = rightBtns.add('button', undefined, 'anterior');
	var nextBtn = rightBtns.add('button', undefined, 'começar');

	/* ---------------------------------------------------------------
	   lógica das páginas
	   --------------------------------------------------------------- */

	var current = 0;
	var allPages = [p0, p1, p2, p3];

	function runChecks() {
		var ok = true;
		var help = [];

		for (var i = 0; i < checks.length; i++) {
			var pass = checks[i].test();
			// sem ternário encadeado: o ExtendScript avalia 'a ? b : c ? d : e' como '(a ? b : c) ? d : e'
			var state = 'ok';

			if (!pass) state = checks[i].required ? 'bad' : 'warn';
			for (var d in checks[i].dots) checks[i].dots[d].visible = d === state;
			if (!pass) help.push(checks[i].help);
			if (!pass && checks[i].required) ok = false;
		}
		helpText.text = help.length ? help.join('\n') : 'tudo certo!';
		prefsLink.visible = !canWriteFiles();
		nextBtn.enabled = ok;
		return ok;
	}

	function showPage(n) {
		for (var i = 0; i < allPages.length; i++) allPages[i].visible = i === n;

		current = n;
		backBtn.visible = n === 1 || n === 2;
		cancelBtn.visible = n < 3;
		progressLab.visible = progressBar.visible = n === 3;
		nextBtn.enabled = true;
		nextBtn.text = 'próximo';

		if (n === 0) nextBtn.text = 'começar';
		if (n === 2) nextBtn.text = removeRdo.value ? 'remover' : installRdo.text;
		if (n === 3) nextBtn.text = 'concluir';
		if (n === 1) runChecks();

		win.layout.layout(true);
	}

	function step(label, value) {
		progressLab.text = label;
		progressBar.value = value;
		win.update();
	}

	function doInstall() {
		var notes = [];

		step('gravando o carregador…', 15);

		var errors = installExtension();

		if (errors.length) {
			step('não foi possível instalar', 100);
			resultText.text = 'não foi possível instalar a barra:\n\n' + errors.slice(0, 3).join('\n');
			return;
		}

		step('liberando extensões sem assinatura…', 50);
		enableDebugMode();

		if (oldCkb.value) {
			step('removendo o script antigo…', 80);

			var r = removeOldScripts();

			if (r.removed) notes.push('o script antigo foi removido (' + r.removed + ').');
			if (r.locked) notes.push('não consegui remover ' + r.locked + ' cópia(s) do script antigo na pasta do After Effects (precisa de permissão de administrador).');
		}

		step('pronto!', 100);
		resultText.text =
			'PROMO GNEWS ' + (installed ? 'atualizado' : 'instalado') + '!\n\n' +
			'reinicie o After Effects e abra a barra em:\nWindow > Extensions > PROMO GNEWS' +
			(IS_MAC ? '\n\nse não aparecer, reinicie o computador (no macOS a liberação das extensões às vezes só vale depois disso).' : '') +
			(notes.length ? '\n\n' + notes.join('\n') : '');
	}

	function doRemove() {
		step('removendo…', 50);
		removeExtension();
		step('pronto!', 100);
		resultText.text = 'a barra PROMO GNEWS foi removida deste computador.\n\nreinicie o After Effects.';
	}

	cancelBtn.onClick = function () { win.close(); };
	backBtn.onClick = function () { showPage(current - 1); };

	nextBtn.onClick = function () {
		if (current === 3) return win.close();

		if (current === 2) {
			showPage(3);
			if (removeRdo.value) doRemove();
			else doInstall();
			return;
		}
		showPage(current + 1);
	};

	installRdo.onClick = removeRdo.onClick = function () {
		nextBtn.text = removeRdo.value ? 'remover' : installRdo.text;
		oldCkb.enabled = installRdo.value && olds.length > 0;
	};

	showPage(0);
	win.center();
	win.show();
})();
