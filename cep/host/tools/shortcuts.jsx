/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/*

---------------------------------------------------------------
> PROMO GNEWS · CEP tools · shortcuts
---------------------------------------------------------------

  ported from 'source/layout/contents/shortcuts tab.js'.

  every tool requires the AE preference
  "Allow Scripts to Write Files and Access Network" (netAccess).

    sites:
      od     OneDrive globo
      tr     trello promo GNEWS
      ap     apontamento globo
      pl     planner globo
    folders:
      arte   PAM Para Arte (global 'artePath')
               args.alt → pick a custom folder (Folder.selectDialog) and
               save it to JSONPrefsObj.folders.artePath + savePrefs().
      mag    upload PAM Magazine (global 'magazinePath')
               args.alt → same, saved to JSONPrefsObj.folders.magazinePath.
      hn     upload PAM Hard News (hnPath)          ┐ disabled in home
      uti    T: Utilidades (utiPath)                │ office mode, fail
      pec    _PECAS_GRAFICAS (basesPath)            │ if the folder is
      hoje   DIARIOS - HOJE (PRODUCAO_DIA_A_DIA())  ┘ not accessible.

*/

(function () {

	function checkNet() {
		if (!netAccess()) PGN.fail('habilite ' + netConfigName + ' nas prefer\u00EAncias do AE');
	}

	function site(url, label) {
		return function (args) {
			checkNet();
			openWebSite(url);

			return label + ' aberto';
		};
	}

	// network folders (buttons disabled in home office mode)...
	function netFolder(getPath, label) {
		return function (args) {
			if (homeOffice) PGN.fail('indispon\u00EDvel no modo home office');
			checkNet();

			// macOS: //server/share → /Volumes/share (mounted on demand)...
			var path = PGN.net.local(getPath(), true);
			var fld = new Folder(path);

			if (!fld.exists) PGN.fail('pasta inacess\u00EDvel');
			openFolder(path);

			return label + ' aberto';
		};
	}

	//---------------------------------------------------------

	PGN.register('od', site('https://tvglobocorp-my.sharepoint.com/', 'OneDrive'));
	PGN.register('tr', site('https://trello.com/promo126/home', 'Trello'));
	PGN.register('ap', site('https://gglobo-pea-hdg-prd.web.app/#card_view', 'Apontamento'));
	PGN.register('pl', site('https://tasks.office.com/tvglobocorp.onmicrosoft.com/en-US/Home/Planner/#/userboard', 'Planner'));

	//---------------------------------------------------------

	PGN.register('arte', function (args) {
		checkNet();

		// right click → configure 'MAM - para arte' path...
		if (args.alt === true) {
			var saveFolder = Folder.selectDialog();

			if (saveFolder == null) return 'nenhuma pasta selecionada';
			artePath = decodeURI(saveFolder).toString();
			JSONPrefsObj.folders.artePath = artePath;
			savePrefs();

			return { msg: 'pasta PAM Para Arte definida', data: { path: artePath } };
		}
		openFolder(artePath);

		return 'PAM Para Arte aberto';
	});

	PGN.register('mag', function (args) {
		checkNet();

		// right click → configure 'MAM - magazine' path...
		if (args.alt === true) {
			var saveFolder = Folder.selectDialog();

			if (saveFolder == null) return 'nenhuma pasta selecionada';
			magazinePath = decodeURI(saveFolder).toString();
			JSONPrefsObj.folders.magazinePath = magazinePath;
			savePrefs();

			return { msg: 'pasta PAM Magazine definida', data: { path: magazinePath } };
		}
		openFolder(magazinePath);

		return 'PAM Magazine aberto';
	});

	//---------------------------------------------------------

	PGN.register('hn', netFolder(function () { return hnPath; }, 'PAM Hard News'));
	PGN.register('uti', netFolder(function () { return utiPath; }, 'T: Utilidades'));
	PGN.register('pec', netFolder(function () { return basesPath; }, '_PECAS_GRAFICAS'));
	PGN.register('hoje', netFolder(function () { return PRODUCAO_DIA_A_DIA(); }, 'DIARIOS - HOJE'));

})();
