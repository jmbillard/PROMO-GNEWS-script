/* eslint-disable no-with */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
/*

---------------------------------------------------------------
> ⚙️ preferences ui
---------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061
//  jshint -W043
//  jscs:disable maximumLineLength

function prefsDialog() {
	var layerTypeArray = ['shape layer', 'solid layer'];
	var projectModeDropArray = ['PROMO', 'custom'];
	var ckbGrpSpacing = 20;
	var btnGrpSpacing = 10;
	var drpGrpSpacing = 2;
	var txtSize = [120, 30];
	var dropSize = [85, 24];

	//---------------------------------------------------------

	var wPref = new Window('dialog', 'script preferences...');
	wPref.alignChildren = ['left', 'top'];
	wPref.spacing = 10;

	//

	var userGrp = wPref.add('group');
	userGrp.spacing = 2;

	var userTxt = userGrp.add('statictext', undefined, 'user prefix');
	userTxt.helpTip = 'user prefix';
	userTxt.preferredSize = txtSize;

	var projUserTxt = userGrp.add('edittext', undefined, userPrefix);
	projUserTxt.preferredSize = dropSize;
	projUserTxt.helpTip = 'user prefix';

	//---------------------------------------------------------

	var divider0 = wPref.add('panel');
	divider0.alignment = 'fill';

	var layerGrp = wPref.add('group');
	layerGrp.orientation = 'column';
	layerGrp.alignChildren = ['left', 'center'];
	layerGrp.spacing = 2;

	var layerGrpTxt = layerGrp.add('statictext', undefined, 'layer types:');
	setTxtColor(layerGrpTxt, sTxtColor.light);

	//

	var nullGrp = layerGrp.add('group');
	nullGrp.spacing = drpGrpSpacing;

	var nullTypeTxt = nullGrp.add('statictext', undefined, 'new null');
	nullTypeTxt.helpTip = 'null type';
	nullTypeTxt.preferredSize = txtSize;

	var nullTypeDrop = nullGrp.add('dropdownlist', undefined, layerTypeArray);
	nullTypeDrop.selection = nullType;
	nullTypeDrop.preferredSize = dropSize;

	//

	var adjGrp = layerGrp.add('group');
	adjGrp.spacing = drpGrpSpacing;

	var adjTypeTxt = adjGrp.add('statictext', undefined, 'adj. layer');
	adjTypeTxt.helpTip = 'adjustment layer type';
	adjTypeTxt.preferredSize = txtSize;

	var adjTypeDrop = adjGrp.add('dropdownlist', undefined, layerTypeArray);
	adjTypeDrop.selection = adjType;
	adjTypeDrop.preferredSize = dropSize;

	//---------------------------------------------------------

	var divider1 = wPref.add('panel');
	divider1.alignment = 'fill';

	var projectGrp = wPref.add('group');
	projectGrp.orientation = 'column';
	projectGrp.alignChildren = ['left', 'center'];
	projectGrp.spacing = 2;

	var projectGrpTxt = projectGrp.add('statictext', undefined, 'project:');
	setTxtColor(projectGrpTxt, sTxtColor.light);

	//

	var v22Grp = projectGrp.add('group');
	v22Grp.spacing = ckbGrpSpacing;

	var v22Txt = v22Grp.add('statictext', undefined, 'save as v22.x');
	v22Txt.helpTip = 'save as v22.x window\n\
> opens the save as window if the AE version is higher than v22';
	v22Txt.preferredSize = txtSize;

	var v22Ckb = v22Grp.add('checkbox', [8, 4, 24, 18]);
	v22Ckb.value = saveAsV22;

	//

	var missGrp = projectGrp.add('group');
	missGrp.spacing = ckbGrpSpacing;

	var missTxt = missGrp.add('statictext', undefined, 'ignore missing files');
	missTxt.helpTip = 'ignore missing footage files\n\
> no missing footage alerts during project organization';
	missTxt.preferredSize = txtSize;

	var missCkb = missGrp.add('checkbox', [8, 4, 24, 18]);
	missCkb.value = ignoreMissing;

	//

	var projOrgGrp = projectGrp.add('group');
	projOrgGrp.spacing = drpGrpSpacing;

	var projModelTxt = projOrgGrp.add('statictext', undefined, 'org. model');
	projModelTxt.helpTip = 'project organization model';
	projModelTxt.preferredSize = txtSize;

	var projectModeDrop = projOrgGrp.add('dropdownlist', undefined, projectModeDropArray);
	projectModeDrop.selection = projectMode;
	projectModeDrop.preferredSize = dropSize;

	//

	var orgFoldersGrp = projectGrp.add('group');
	orgFoldersGrp.spacing = ckbGrpSpacing;

	var orgFoldersTxt = orgFoldersGrp.add('statictext', undefined, 'organization folders');
	orgFoldersTxt.helpTip = 'use PROMO organization folders with collect files\n\
> ex: proj id: \'DOC120723\' → \'Projects/PROGRAMAS/documentario/DOC120723 doc name\'\n\
> only available with \'hard news\' mode disabled\n\
> current folders:\n' + formatObjTxt(promoSubPath);
	orgFoldersTxt.preferredSize = txtSize;

	var orgFoldersCkb = orgFoldersGrp.add('checkbox', [8, 4, 24, 18]);
	orgFoldersCkb.value = orgFolders;

	var resetOrgFoldersBtn = orgFoldersGrp.add('iconbutton', iconTogSize, resetIcon.light, { style: 'toolbutton' });
	resetOrgFoldersBtn.helpTip = 'reset PROMO organization folders';
	resetOrgFoldersBtn.enabled = orgFolders;

	orgFoldersGrp.enabled = !hardNews;

	//

	var projFldGrp = projectGrp.add('group');
	projFldGrp.spacing = btnGrpSpacing;

	var fldProjTxt = projFldGrp.add('statictext', undefined, 'proj. folder');
	fldProjTxt.helpTip = '\'save project\' button default folder\n(\'PRODUCAO DIA-A-DIA\' on \'hard news\' mode)';
	fldProjTxt.preferredSize = txtSize;

	var fldProjBtn = projFldGrp.add('iconbutton', iconSize, projFolderIcon.light, { style: 'toolbutton' });
	fldProjBtn.helpTip = 'map folder\n\n' + '> \'' + projPath + '\'';

	var resetFldProjBtn = projFldGrp.add('iconbutton', iconTogSize, resetIcon.light, { style: 'toolbutton' });
	resetFldProjBtn.helpTip = 'reset \'save project\' default folder';
	//resetFldProjBtn.enabled = false;

	projFldGrp.enabled = homeOffice ? true : !hardNews;

	//---------------------------------------------------------

	var divider2 = wPref.add('panel');
	divider2.alignment = 'fill';

	var themeGrp = wPref.add('group');
	themeGrp.orientation = 'column';
	themeGrp.alignChildren = ['left', 'center'];
	themeGrp.spacing = 2;

	var themeGrpTxt = themeGrp.add('statictext', undefined, 'theme:');
	setTxtColor(themeGrpTxt, sTxtColor.light);

	//

	var iconThemeGrp = themeGrp.add('group');
	iconThemeGrp.spacing = 60;
	iconThemeGrp.margins = [0, 8, 0, 4];

	var lightRdo = iconThemeGrp.add('radiobutton', undefined, 'light icons');
	lightRdo.helpTip = 'icon theme';
	lightRdo.value = lightRdo.text.split(' ')[0] == iconTheme;

	var darkRdo = iconThemeGrp.add('radiobutton', undefined, 'dark icons');
	darkRdo.helpTip = 'icon theme';
	darkRdo.value = darkRdo.text.split(' ')[0] == iconTheme;

	//

	var tabColorsGrp = themeGrp.add('group');
	tabColorsGrp.spacing = 2;

	var tabTxt = tabColorsGrp.add('statictext', undefined, 'tab colors');
	tabTxt.helpTip = 'tab colors';
	tabTxt.preferredSize = txtSize;

	var colorDrop = tabColorsGrp.add('dropdownlist', undefined, grpNames);
	colorDrop.selection = 0;
	colorDrop.preferredSize = dropSize;

	var tabColorBtn = wPref.add('iconbutton', undefined, undefined, { style: 'toolbutton' });
	tabColorBtn.size = [208, 20];
	setBtnColor(tabColorBtn, tabColors[0]);
	tabColorBtn.onDraw = customDraw;

	//

	var slGrp = wPref.add('group');
	slGrp.spacing = ckbGrpSpacing;

	var slTxt = slGrp.add('statictext', undefined, 'show labels');
	slTxt.helpTip = 'show labels on large screens';
	slTxt.preferredSize = txtSize;

	var slCkb = slGrp.add('checkbox', [8, 4, 24, 18]);
	slCkb.value = showLabels;

	//---------------------------------------------------------

	var divider3 = wPref.add('panel');
	divider3.alignment = 'fill';

	var modeGrp = wPref.add('group');
	modeGrp.orientation = 'column';
	modeGrp.alignChildren = ['left', 'center'];
	modeGrp.spacing = 2;

	var modeGrpTxt = modeGrp.add('statictext', undefined, 'modes:');
	setTxtColor(modeGrpTxt, sTxtColor.light);

	//

	var hoGrp = modeGrp.add('group');
	hoGrp.spacing = ckbGrpSpacing;

	var hoTxt = hoGrp.add('statictext', undefined, 'home office');
	hoTxt.helpTip = 'home office mode\n\
> uses yor local machine... all files and\
templates will be downloaded and stored \
on the script preferences folder\n\
> disables most of the links tab folder shortcuts\
(\'MAM - magazine\' and \'MAM - para arte\' can be mapped)';
	hoTxt.preferredSize = txtSize;

	var hoCkb = hoGrp.add('checkbox', [8, 4, 24, 18]);
	hoCkb.value = homeOffice;

	//

	var hnGrp = modeGrp.add('group');
	hnGrp.spacing = ckbGrpSpacing;

	var hnTxt = hnGrp.add('statictext', undefined, 'hard news');
	hnTxt.helpTip = 'hard news mode\n\
> overwrites the \'save project\' button\
default folder to \'PRODUCAO DIA-A-DIA\'\n\
> overwrites the default naming scheme to\
\'user prefix\' + GNEWS + \'proj name\' + \'client name\'\
ex: \'RTR - GNEWS DESTAQUES J10 - mariana\'\
(only available with \'home office\' mode disabled)\'';
	hnTxt.preferredSize = txtSize;

	var hnCkb = hnGrp.add('checkbox', [8, 4, 24, 18]);
	hnCkb.value = hardNews;

	hnGrp.enabled = !hoCkb.value;

	//---------------------------------------------------------

	var divider4 = wPref.add('panel');
	divider4.alignment = 'fill';

	var networkGrp = wPref.add('group');
	networkGrp.orientation = 'column';
	networkGrp.alignChildren = ['left', 'center'];
	networkGrp.spacing = 2;

	var networkGrpTxt = networkGrp.add('statictext', undefined, 'network:');
	setTxtColor(networkGrpTxt, sTxtColor.light);

	//

	var fldGrp1 = networkGrp.add('group');
	fldGrp1.spacing = btnGrpSpacing;

	var fldMagTxt = fldGrp1.add('statictext', undefined, 'MAM - magazine');
	fldMagTxt.helpTip = 'upload MAM - magazine';
	fldMagTxt.preferredSize = txtSize;

	var fldMagBtn = fldGrp1.add('iconbutton', iconSize, magazineFolderIcon.light, { style: 'toolbutton' });
	fldMagBtn.helpTip = 'map folder\n\n' + '> \'' + magazinePath + '\'';

	var resetFldMagBtn = fldGrp1.add('iconbutton', iconTogSize, resetIcon.light, { style: 'toolbutton' });
	resetFldMagBtn.helpTip = 'reset \'upload MAM - magazine\' folder';
	// resetFldMagBtn.enabled = false;

	//

	var fldGrp2 = networkGrp.add('group');
	fldGrp2.spacing = btnGrpSpacing;

	var fldArteTxt = fldGrp2.add('statictext', undefined, 'MAM - para arte');
	fldArteTxt.helpTip = 'download MAM - para arte';
	fldArteTxt.preferredSize = txtSize;

	var fldArteBtn = fldGrp2.add('iconbutton', iconSize, arteFolderIcon.light, { style: 'toolbutton' });
	fldArteBtn.helpTip = 'map folder\n\n' + '> \'' + artePath + '\'';

	var resetFldArteBtn = fldGrp2.add('iconbutton', iconTogSize, resetIcon.light, { style: 'toolbutton' });
	resetFldArteBtn.helpTip = 'reset \'download MAM - para arte\' folder';
	// resetFldArteBtn.enabled = false;

	//---------------------------------------------------------

	var divider5 = wPref.add('panel');
	divider5.alignment = 'fill';

	var btnGrp = wPref.add('group');
	btnGrp.orientation = 'stack';
	btnGrp.alignment = 'fill';
	// left buttons group...
	var bGrp1 = btnGrp.add('group');
	bGrp1.alignment = 'left';
	bGrp1.spacing = 2;
	// right buttons group...
	var bGrp2 = btnGrp.add('group');
	bGrp2.alignment = 'right';
	bGrp2.spacing = 2;

	//

	var devTogBtn = bGrp1.add('iconbutton', iconTogSize, exprTogIcon.light, { style: 'toolbutton', toggle: 1 });
	devTogBtn.helpTip = 'dev tools';
	devTogBtn.value = devMode;

	var openFldBtn = bGrp1.add('iconbutton', iconSize, folderIcon.light, { style: 'toolbutton' });
	openFldBtn.helpTip = 'open script preferences folder';

	//

	var resetBtn = bGrp2.add('iconbutton', iconSize, resetIcon.light, { style: 'toolbutton' });
	resetBtn.helpTip = 'reset script preferences';

	var updateBtn = bGrp2.add('iconbutton', iconSize, downloadIcon.light, { style: 'toolbutton' });
	updateBtn.helpTip = 'download the latest script version from github';

	/*

	---------------------------------------------------------------
	> ⚙️ preferences events
	---------------------------------------------------------------

	*/

	lightRdo.onClick = darkRdo.onClick = function () {
		iconTheme = this.text.split(' ')[0];
		JSONPrefsObj.iconTheme = iconTheme;
		savePrefs(); // → save preferences.json
		showTabProg('restart the script  ヽ(✿ﾟ▽ﾟ)ノ');
		wPref.close();

	};

	//---------------------------------------------------------

	devTogBtn.onClick = function () {
		devMode = this.value;
		JSONPrefsObj.devMode = devMode;
		setLayout();
		menuSubGrp5.enabled = menuSubGrp5.visible = devMode;
		savePrefs(); // → save preferences.json
	};

	//---------------------------------------------------------

	resetBtn.onClick = function () {
		JSONPrefsObj = defPrefsObj;
		savePrefs(); // → save preferences.json
		showTabProg('restart the script  ヽ(✿ﾟ▽ﾟ)ノ');
		wPref.close();
	};

	//---------------------------------------------------------

	openFldBtn.onClick = function () {
		// alert...
		if (!netAccess()) {
			alert('no access...  Σ(っ °Д °;)っ');
			return;
		}
		if (!fontsFolder.exists) fontsFolder.create();

		openFolder(scriptPreferencesPath);
	};

	//---------------------------------------------------------

	projUserTxt.onEnterKey = projUserTxt.onChange = function () {
		this.text = this.text.toUpperCase();
		userPrefix = this.text;
		JSONPrefsObj.userPrefix = userPrefix;
		savePrefs(); // → save preferences.json
		userTxt.active = true;
	};

	//---------------------------------------------------------

	nullTypeDrop.onChange = function () {
		nullType = this.selection.index; // selected null type...
		JSONPrefsObj.selection.nullType = nullType; // update preferences object...
		savePrefs(); // → save preferences.json
	};

	//---------------------------------------------------------

	adjTypeDrop.onChange = function () {
		adjType = this.selection.index; // selected adj type...
		JSONPrefsObj.selection.adjType = adjType; // update preferences object...
		savePrefs(); // → save preferences.json
	};

	//---------------------------------------------------------

	projectModeDrop.onChange = function () {
		projectMode = this.selection.index; // selected project model...
		JSONPrefsObj.selection.projectMode = projectMode; // update preferences object...
		savePrefs(); // → save preferences.json
	};

	//---------------------------------------------------------

	colorDrop.onChange = function () {
		var c = tabColors[this.selection.index]; // selected tab color...
		setBtnColor(tabColorBtn, c); // update color preview swatch...
		tabColorBtn.notify('onDraw'); // force ui update...
	};

	//---------------------------------------------------------

	tabColorBtn.onClick = function () {
		var c = tabColors[colorDrop.selection.index]; // selected tab color...
		var binColor = eval(rgbToHex(c)); // color converted HEX...
		var configColor = $.colorPicker(binColor); // → system color picker

		if (configColor != -1) {
			configColor = eval(rgbStr(configColor)); // → [1,1,1]
			tabColors[colorDrop.selection.index] = configColor; // update color array...
			JSONPrefsObj.color[colorDrop.selection][iconTheme] = rgbToHEX(configColor); // update preferences object...

			setBtnColor(this, configColor); // update color preview swatch...
			savePrefs(); // → save preferences.json
			bgColor = tabColors[0];
			setBgColor(w, bgColor);
		}
	};

	//---------------------------------------------------------

	// configure 'MAM - magazine' path...
	fldMagBtn.onClick = function () {
		// error...
		if (!netAccess()) {
			alert(netConfigName + ' not checked');
			return;
		}
		var saveFolder = Folder.selectDialog();

		if (saveFolder != null) {
			magazinePath = decodeURI(saveFolder).toString();
			JSONPrefsObj.folders.magazinePath = magazinePath;
			fldMagBtn.helpTip = 'map folder\n\n' + '> \'' + magazinePath + '\'';

			savePrefs();
		}
	};

	resetFldMagBtn.onClick = function () {
		// error...
		if (!netAccess()) {
			alert(netConfigName + ' not checked');
			return;
		}
		magazinePath = defPrefsObj.folders.magazinePath;
		JSONPrefsObj.folders.magazinePath = magazinePath;
		fldMagBtn.helpTip = 'map folder\n\n' + '> \'' + magazinePath + '\'';

		savePrefs();
	};

	//---------------------------------------------------------

	// configure 'MAM - para arte' path...
	fldArteBtn.onClick = function () {
		// error...
		if (!netAccess()) {
			alert(netConfigName + ' not checked');
			return;
		}
		var saveFolder = Folder.selectDialog();

		if (saveFolder != null) {
			artePath = decodeURI(saveFolder).toString();
			JSONPrefsObj.folders.artePath = artePath;
			fldArteBtn.helpTip = 'map folder\n\n' + '> \'' + artePath + '\'';

			savePrefs();
		}
	};

	resetFldArteBtn.onClick = function () {
		// error...
		if (!netAccess()) {
			alert(netConfigName + ' not checked');
			return;
		}
		artePath = defPrefsObj.folders.artePath;
		JSONPrefsObj.folders.artePath = artePath;
		fldArteBtn.helpTip = 'map folder\n\n' + '> \'' + artePath + '\'';
		savePrefs();
	};

	//---------------------------------------------------------

	// configure 'MAM - para arte' path...
	fldProjBtn.onClick = function () {
		// error...
		if (!netAccess()) {
			alert(netConfigName + ' not checked');
			return;
		}
		var saveFolder = Folder.selectDialog();

		if (saveFolder != null) {
			projPath = decodeURI(saveFolder).toString();
			JSONPrefsObj.folders.projPath = projPath;
			savePrefs();
			fldProjBtn.helpTip = 'map folder\n\n' + '> \'' + projPath + '\'';
		}
	};

	resetFldProjBtn.onClick = function () {
		// error...
		if (!netAccess()) {
			alert(netConfigName + ' not checked');
			return;
		}
		projPath = defPrefsObj.folders.projPath;
		JSONPrefsObj.folders.projPath = projPath;
		fldProjBtn.helpTip = 'map folder\n\n' + '> \'' + projPath + '\'';
		savePrefs();
	};

	//---------------------------------------------------------

	// right click -> opens the git repo...
	updateBtn.addEventListener('click', function (c) {
		if (c.button == 2) {
			// error...
			if (!netAccess()) {
				alert(netConfigName + ' not checked');
				return;
			}
			openWebSite(repoURL); // → launch internet browser
		}
	});

	//---------------------------------------------------------

	updateBtn.onClick = function () {
		// error...
		if (!netAccess()) {
			alert(netConfigName + ' not checked');
			return;
		}
		var uiPath = scriptPreferencesPath + '/ScriptUI Panels';
		var pathArray = [];

		for (var i = 0; i < codeURLArray.length; i++) {
			pathArray.push(uiPath);
		}
		var uiFolder = new Folder(uiPath);
		var scriptUIPath = new File($.fileName).path.toString();
		var destPathArray = [
			scriptUIPath, // → Scripts/Script UiPanels
			promoArcPath + '/scripts', // → /arquivamento/GLOBONEWS/On Air 2022/Promo/scripts
			promoInsPath + '/BARRA UTILIDADES PROMO PARA SCRIPT', // → UTILIDADES//FERRAMENTAS/SCRIPTS/SCRIPTS AFX/BARRA UTILIDADES PROMO PARA INSTALAR
		];
		removeFolder(uiFolder); // → delete previous download folder
		uiFolder.create(); // → create new download folder

		getURLContent(codeURLArray, pathArray); // → download files on codeURLArray

		// copy downloaded files...

		if (homeOffice) copyFolderContentContent(uiPath, destPathArray[0]);

		if (!homeOffice) {
			try {
				copyFolderContentContent(uiPath, destPathArray[1]);

			} catch (err) {
				alert('nope... (っ °Д °;)っ \n\n' + err.message);
				copyFolderContentContent(uiPath, destPathArray[0]);
			}
		}
		showTabProg('restart the script  ヽ(✿ﾟ▽ﾟ)ノ');
		wPref.close();
	};

	//---------------------------------------------------------

	v22Ckb.onClick = function () {
		saveAsV22 = this.value;
		JSONPrefsObj.saveAsV22 = saveAsV22;
		
		savePrefs(); // → save preferences.json
	};

	//---------------------------------------------------------

	hoCkb.onClick = function () {
		homeOffice = this.value;
		JSONPrefsObj.homeOffice = homeOffice;
		nUtilsBtn.enabled = !homeOffice;
		mamHardNewsBtn.enabled = !homeOffice;
		dayBtn.enabled = !homeOffice;
		baseJorBtn.enabled = !homeOffice;
		hnGrp.enabled = !homeOffice;
		projFldGrp.enabled = homeOffice ? true : !hardNews;
		aboutTxt.text = !homeOffice ? vStr : vStr + ' HO';

		savePrefs(); // → save preferences.json
		updateFolderPaths(); // → update templates and fonts folder
	};

	//---------------------------------------------------------

	slCkb.onClick = function () {
		showLabels = this.value;
		JSONPrefsObj.showLabels = showLabels;

		setLayout();
		savePrefs(); // → save preferences.json
	};

	//---------------------------------------------------------

	missCkb.onClick = function () {
		ignoreMissing = this.value;
		JSONPrefsObj.ignoreMissing = ignoreMissing;

		savePrefs(); // → save preferences.json
	};

	//---------------------------------------------------------

	hnCkb.onClick = function () {
		hardNews = this.value;
		projIdContent = hardNews ? 'client' : 'PROJ ID';
		JSONPrefsObj.hardNews = hardNews;
		fldProjBtn.helpTip = hardNews ? '> \'PRODUCAO DIA-A-DIA\'' : 'map folder\n\n' + '> \'' + projPath + '\'';

		projFldGrp.enabled = !hardNews;
		orgFoldersGrp.enabled = !hardNews;
		endPagePresetBtn.enabled = !hardNews; // end page presets button > project tab
		aboutTxt.text = !hardNews ? vStr : vStr + ' HN';
		savePrefs(); // → save preferences.json
	};

	//---------------------------------------------------------

	orgFoldersCkb.onClick = function () {
		orgFolders = this.value;
		JSONPrefsObj.orgFolders = orgFolders;		
		resetOrgFoldersBtn.enabled = orgFolders;

		savePrefs(); // → save preferences.json
	};

	resetOrgFoldersBtn.onClick = function () {
		// error...
		if (!netAccess()) {
			alert(netConfigName + ' not checked');
			return;
		}
		var promoSubPath = defPrefsObj.folders.promoSubPath;
		JSONPrefsObj.folders.promoSubPath = promoSubPath;
		orgFoldersTxt.helpTip = 'use PROMO organization folders with collect files\n\
		> ex: proj id: \'DOC120723\' → \'Projects/PROGRAMAS/documentario/DOC120723 doc name\'\n\
		> only available with \'hard news\' mode disabled\n\
		> current folders:\n' + formatObjTxt(promoSubPath);

		savePrefs(); // → save preferences.json
	};

	wPref.show();
}

// prefsDialog();
