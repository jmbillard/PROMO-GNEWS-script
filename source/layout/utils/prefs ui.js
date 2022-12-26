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
	var txtSize = [90, 20];
	var dropSize = [85, 20];

	//---------------------------------------------------------

	var wPref = new Window('dialog', 'script preferences...');
	wPref.alignChildren = ['left', 'top'];
	wPref.spacing = 10;

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

	var nullGrp = layerGrp.add('group');
	nullGrp.spacing = 0;

	var nullTypeTxt = nullGrp.add('statictext', undefined, 'new null');
	nullTypeTxt.helpTip = 'null type';
	nullTypeTxt.preferredSize = txtSize;

	var nullTypeDrop = nullGrp.add('dropdownlist', undefined, layerTypeArray);
	nullTypeDrop.selection = nullType;
	nullTypeDrop.preferredSize = dropSize;

	var adjGrp = layerGrp.add('group');
	adjGrp.spacing = 0;

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

	var projOrgGrp = projectGrp.add('group');
	projOrgGrp.spacing = 0;

	var projModelTxt = projOrgGrp.add('statictext', undefined, 'org. model');
	projModelTxt.helpTip = 'project organization model';
	projModelTxt.preferredSize = txtSize;

	var projectModeDrop = projOrgGrp.add('dropdownlist', undefined, projectModeDropArray);
	projectModeDrop.selection = projectMode;
	projectModeDrop.preferredSize = dropSize;

	var projFldGrp = projectGrp.add('group');
	projFldGrp.spacing = 15;

	var fldProjTxt = projFldGrp.add('statictext', undefined, 'proj. folder');
	fldProjTxt.helpTip = '\'save project\' button default folder\n(\'PRODUCAO DIA-A-DIA\' on \'hard news\' mode)';
	fldProjTxt.preferredSize = txtSize;

	var fldProjBtn = projFldGrp.add('iconbutton', undefined, projFolderIcon.light, { style: 'toolbutton' });
	fldProjBtn.helpTip = 'map folder\n\n' + '> \'' + projPath + '\'';

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

	var iconThemeGrp = themeGrp.add('group');
	iconThemeGrp.spacing = 60;
	iconThemeGrp.margins = [0, 8, 0, 4];

	var lightRdo = iconThemeGrp.add('radiobutton', undefined, 'light');
	lightRdo.helpTip = 'icon theme';
	lightRdo.value = lightRdo.text == iconTheme;
	// lightRdo.enabled = false;

	var darkRdo = iconThemeGrp.add('radiobutton', undefined, 'dark');
	darkRdo.helpTip = 'icon theme';
	darkRdo.value = darkRdo.text == iconTheme;
	// darkRdo.enabled = false;

	var tabColorsGrp = themeGrp.add('group');
	tabColorsGrp.spacing = 2;

	var tabTxt = tabColorsGrp.add('statictext', undefined, 'tab colors');
	tabTxt.helpTip = 'tab colors';
	tabTxt.preferredSize = txtSize;

	var colorDrop = tabColorsGrp.add('dropdownlist', undefined, grpNames);
	colorDrop.selection = 0;
	colorDrop.preferredSize = dropSize;

	var tabColorBtn = wPref.add('iconbutton', undefined, undefined, { style: 'toolbutton' });
	tabColorBtn.size = [176, 20];
	setBtnColor(tabColorBtn, tabColors[0]);
	tabColorBtn.onDraw = customDraw;

	//---------------------------------------------------------

	var divider3 = wPref.add('panel');
	divider3.alignment = 'fill';

	var hoGrp = wPref.add('group');
	hoGrp.spacing = 28;

	var hoTxt = hoGrp.add('statictext', undefined, 'home office');
	hoTxt.helpTip = 'home office mode\n\
> uses yor local machine... all files and\
templates will be downloaded and stored \
on the script preferences folder\n\
> disables most of the links tab folder shortcuts\
(\'MAM - magazine\' and \'MAM - para arte\' can be mapped)';
	hoTxt.preferredSize = txtSize;

	var hoCkb = hoGrp.add('checkbox');
	hoCkb.preferredSize.height = 18;
	hoCkb.value = homeOffice;

	var hnGrp = wPref.add('group');
	hnGrp.spacing = 28;

	var hnTxt = hnGrp.add('statictext', undefined, 'hard news');
	hnTxt.helpTip = 'hard news mode\n\
> overwrites the \'save project\' button\
default folder to \'PRODUCAO DIA-A-DIA\'\n\
> overwrites the default naming scheme to\
\'user prefix\' + GNEWS + \'proj. name\' + \'client name\'\
ex: \'RTR - GNEWS DESTAQUES J10 - mariana\'\
(only available with \'home office\' mode disabled)\'';
	hnTxt.preferredSize = txtSize;

	var hnCkb = hnGrp.add('checkbox');
	hnCkb.preferredSize.height = 18;
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

	var fldGrp1 = networkGrp.add('group');
	fldGrp1.spacing = 15;

	var fldMagTxt = fldGrp1.add('statictext', undefined, 'MAM - magazine');
	fldMagTxt.helpTip = 'upload MAM - magazine';
	fldMagTxt.preferredSize = txtSize;

	var fldMagBtn = fldGrp1.add('iconbutton', undefined, magazineFolderIcon.light, { style: 'toolbutton' });
	fldMagBtn.helpTip = 'map folder\n\n' + '> \'' + magazinePath + '\'';

	var fldGrp2 = networkGrp.add('group');
	fldGrp2.spacing = 15;

	var fldArteTxt = fldGrp2.add('statictext', undefined, 'MAM - para arte');
	fldArteTxt.helpTip = 'download MAM - para arte';
	fldArteTxt.preferredSize = txtSize;

	var fldArteBtn = fldGrp2.add('iconbutton', undefined, arteFolderIcon.light, { style: 'toolbutton' });
	fldArteBtn.helpTip = 'map folder\n\n' + '> \'' + artePath + '\'';

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

	var devTogBtn = bGrp1.add('iconbutton', undefined, exprTogIcon.light, { style: 'toolbutton', toggle: 1 });
	devTogBtn.helpTip = 'dev tools';
	devTogBtn.value = devMode;

	var openFldBtn = bGrp1.add('iconbutton', undefined, folderIcon.light, { style: 'toolbutton' });
	openFldBtn.helpTip = 'open script preferences folder';

	var resetBtn = bGrp2.add('iconbutton', undefined, resetIcon.light, { style: 'toolbutton' });
	resetBtn.helpTip = 'reset script preferences';

	var updateBtn = bGrp2.add('iconbutton', undefined, downloadIcon.light, { style: 'toolbutton' });
	updateBtn.helpTip = 'download the latest script version from github';

	/*

	---------------------------------------------------------------
	> ⚙️ preferences events
	---------------------------------------------------------------

	*/

	lightRdo.onClick = darkRdo.onClick = function () {
		iconTheme = this.text;
		JSONPrefsObj.iconTheme = iconTheme;
		savePrefs(); // → save preferences.json
		showTabProg('restart the script  ヽ(✿ﾟ▽ﾟ)ノ');
		wPref.close();

	};

	//---------------------------------------------------------

	devTogBtn.onClick = function () {
		devMode = this.value;
		JSONPrefsObj.devMode = devMode;
		menuSubGrp5.enabled = menuSubGrp5.visible = devMode;
		setLayout();
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
			showTabErr(netConfigName + ' not checked');
			return;
		}
		var saveFolder = Folder.selectDialog();

		if (saveFolder != null) {
			magazinePath = decodeURI(saveFolder).toString();
			JSONPrefsObj.folders.magazinePath = magazinePath;
			savePrefs();
		}
	};

	//---------------------------------------------------------

	// configure 'MAM - para arte' path...
	fldArteBtn.onClick = function () {
		// error...
		if (!netAccess()) {
			showTabErr(netConfigName + ' not checked');
			return;
		}
		var saveFolder = Folder.selectDialog();

		if (saveFolder != null) {
			artePath = decodeURI(saveFolder).toString();
			JSONPrefsObj.folders.artePath = artePath;
			savePrefs();
		}
	};

	//---------------------------------------------------------

	// configure 'MAM - para arte' path...
	fldProjBtn.onClick = function () {
		// error...
		if (!netAccess()) {
			showTabErr(netConfigName + ' not checked');
			return;
		}
		var saveFolder = Folder.selectDialog();

		if (saveFolder != null) {
			projPath = decodeURI(saveFolder).toString();
			JSONPrefsObj.folders.projPath = projPath;
			savePrefs();
		}
	};

	//---------------------------------------------------------

	// right click -> opens the git repo...
	updateBtn.addEventListener('click', function (c) {
		if (c.button == 2) {
			// error...
			if (!netAccess()) {
				showTabErr(netConfigName + ' not checked');
				return;
			}
			openWebSite(repoURL); // → launch internet browser
		}
	});

	//---------------------------------------------------------

	updateBtn.onClick = function () {
		// error...
		if (!netAccess()) {
			showTabErr(netConfigName + ' not checked');
			return;
		}
		var downPath = scriptPreferencesPath + '/ScriptUI Panels';
		var pathArray = [];

		for (var i = 0; i < codeURLArray.length; i++) {
			pathArray.push(downPath);
		}
		var downFolder = new Folder(downPath);
		var scriptUIPath = new File($.fileName).path.toString();
		var destPathArray = [
			scriptUIPath, // → Scripts/Script UiPanels
			promoArcPath + '/scripts', // → /arquivamento/GLOBONEWS/On Air 2022/Promo/scripts
			promoInsPath + '/BARRA UTILIDADES PROMO PARA SCRIPT', // → UTILIDADES//FERRAMENTAS/SCRIPTS/SCRIPTS AFX/BARRA UTILIDADES PROMO PARA INSTALAR
		];
		removeFolder(downFolder); // → delete previous download folder
		downFolder.create(); // → create new download folder

		getURLContent(codeURLArray, pathArray); // → download files on codeURLArray

		// copy downloaded files...

		if (homeOffice) copyFolderContent(downPath, destPathArray[0]);

		if (!homeOffice) {
			try {
				copyFolderContent(downPath, destPathArray[1]);

			} catch (err) {
				alert('nope... (っ °Д °;)っ \n\n' + err.message);
				copyFolderContent(downPath, destPathArray[0]);
			}
		}
		showTabProg('restart the script  ヽ(✿ﾟ▽ﾟ)ノ');
		wPref.close();
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

		savePrefs(); // → save preferences.json
		updateFolderPaths(); // → update templates and fonts folder
	};

	//---------------------------------------------------------

	hnCkb.onClick = function () {
		hardNews = this.value;
		JSONPrefsObj.hardNews = hardNews;
		projFldGrp.enabled = !hardNews;
		fldProjBtn.helpTip = this.value ? '> \'PRODUCAO DIA-A-DIA\'' : 'map folder\n\n' + '> \'' + projPath + '\'';

		savePrefs(); // → save preferences.json
	};

	wPref.show();
}

// prefsDialog();
