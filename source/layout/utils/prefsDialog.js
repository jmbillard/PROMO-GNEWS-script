/*

---------------------------------------------------------------
> ⚙️ preferences ui
---------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061
//  jscs:disable maximumLineLength

function prefsDialog() {
	var layerTypeArray = ['shape layer', 'solid layer'];
	var projectModeDropArray = ['PROMO', 'custom'];
	var txtSize = [90, 20];
	var dropSize = [85, 20];

	var wPref = new Window('dialog', 'script preferences...');
	wPref.alignChildren = ['left', 'top'];
	wPref.spacing = 10;

	// =====
	var userGrp = wPref.add('group');
	userGrp.spacing = 2;

	var userTxt = userGrp.add('statictext', undefined, 'user prefix');
	userTxt.helpTip = 'user prefix';
	userTxt.preferredSize = txtSize;

	var projUserTxt = userGrp.add('edittext', undefined, userPrefix);
	projUserTxt.preferredSize = dropSize;
	projUserTxt.helpTip = 'user prefix';

	// =================
	var divider0 = wPref.add('panel');
	divider0.alignment = 'fill';

	// ========
	var layerGrp = wPref.add('group');
	layerGrp.orientation = 'column';
	layerGrp.alignChildren = ['left', 'center'];
	layerGrp.spacing = 2;

	var layerGrpTxt = layerGrp.add('statictext', undefined, 'layer types:');
	setTxtColor(layerGrpTxt, sTxtColor);

	// =======
	var nullGrp = layerGrp.add('group');
	nullGrp.spacing = 0;

	var nullTypeTxt = nullGrp.add('statictext', undefined, 'new null');
	nullTypeTxt.helpTip = 'null type';
	nullTypeTxt.preferredSize = txtSize;

	var nullTypeDrop = nullGrp.add('dropdownlist', undefined, layerTypeArray);
	nullTypeDrop.selection = nullType;
	nullTypeDrop.preferredSize = dropSize;

	// ======
	var adjGrp = layerGrp.add('group');
	adjGrp.spacing = 0;

	var adjTypeTxt = adjGrp.add('statictext', undefined, 'adj. layer');
	adjTypeTxt.helpTip = 'adjustment layer type';
	adjTypeTxt.preferredSize = txtSize;

	var adjTypeDrop = adjGrp.add('dropdownlist', undefined, layerTypeArray);
	adjTypeDrop.selection = adjType;
	adjTypeDrop.preferredSize = dropSize;

	// =================
	var divider1 = wPref.add('panel');
	divider1.alignment = 'fill';

	// ==========
	var projectGrp = wPref.add('group');
	projectGrp.orientation = 'column';
	projectGrp.alignChildren = ['left', 'center'];
	projectGrp.spacing = 2;

	var projectGrpTxt = projectGrp.add('statictext', undefined, 'project:');
	setTxtColor(projectGrpTxt, sTxtColor);

	// ======
	var orgGrp = projectGrp.add('group');
	orgGrp.spacing = 0;

	var projModelTxt = orgGrp.add('statictext', undefined, 'org. model');
	projModelTxt.helpTip = 'project organization model';
	projModelTxt.preferredSize = txtSize;

	var projectModeDrop = orgGrp.add('dropdownlist', undefined, projectModeDropArray);
	projectModeDrop.selection = projectMode;
	projectModeDrop.preferredSize = dropSize;

	// =================
	var divider2 = wPref.add('panel');
	divider2.alignment = 'fill';

	// ========
	var themeGrp = wPref.add('group');
	themeGrp.orientation = 'column';
	themeGrp.alignChildren = ['left', 'center'];
	themeGrp.spacing = 2;

	var themeGrpTxt = themeGrp.add('statictext', undefined, 'theme:');
	setTxtColor(themeGrpTxt, sTxtColor);

	// ============
	var iconThemeGrp = themeGrp.add('group');
	iconThemeGrp.spacing = 20;
	iconThemeGrp.margins = [0, 8, 0, 4];

	var lightRdo = iconThemeGrp.add('radiobutton', undefined, 'light icons');
	lightRdo.helpTip = 'icon theme';

	var darkRdo = iconThemeGrp.add('radiobutton', undefined, 'dark icons');
	darkRdo.helpTip = 'icon theme';

	// ============
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

	// =================
	var divider3 = wPref.add('panel');
	divider3.alignment = 'fill';

	// =====
	var hoGrp = wPref.add('group');
	hoGrp.spacing = 28;

	var hoTxt = hoGrp.add('statictext', undefined, 'home office');
	hoTxt.helpTip = 'home office mode';
	hoTxt.preferredSize = txtSize;

	var hoCkb = hoGrp.add('checkbox');
	hoCkb.preferredSize.height = 18;
	hoCkb.value = homeOffice;

	// =================
	var divider4 = wPref.add('panel');
	divider4.alignment = 'fill';

	// ==========
	var networkGrp = wPref.add('group');
	networkGrp.orientation = 'column';
	networkGrp.alignChildren = ['left', 'center'];
	networkGrp.spacing = 2;

	var networkGrpTxt = networkGrp.add('statictext', undefined, 'network:');
	setTxtColor(networkGrpTxt, sTxtColor);

	// =======
	var fldGrp1 = networkGrp.add('group');
	fldGrp1.spacing = 15;

	var fldMagTxt = fldGrp1.add('statictext', undefined, 'MAM - magazine');
	fldMagTxt.helpTip = 'null and adjustment layer type';
	fldMagTxt.preferredSize = txtSize;

	var fldMagBtn = fldGrp1.add('iconbutton', undefined, magazineFolderIcon, { style: 'toolbutton' });
	fldMagBtn.helpTip = 'map folder';

	// =======
	var fldGrp2 = networkGrp.add('group');
	fldGrp2.spacing = 15;

	var fldArteTxt = fldGrp2.add('statictext', undefined, 'MAM - para arte');
	fldArteTxt.helpTip = 'null and adjustment layer type';
	fldArteTxt.preferredSize = txtSize;

	var fldArteBtn = fldGrp2.add('iconbutton', undefined, arteFolderIcon, { style: 'toolbutton' });
	fldArteBtn.helpTip = 'map folder';

	// =================
	var divider5 = wPref.add('panel');
	divider5.alignment = 'fill';

	// ======
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

	var devBtn = bGrp1.add('iconbutton', undefined, exprTogIcon, { style: 'toolbutton' });
	devBtn.helpTip = 'dev tools';
	devBtn.enabled = false;

	var openFldBtn = bGrp1.add('iconbutton', undefined, folderIcon, { style: 'toolbutton' });
	openFldBtn.helpTip = 'open script preferences folder';

	var resetBtn = bGrp2.add('iconbutton', undefined, refreshIcon, { style: 'toolbutton' });
	resetBtn.helpTip = 'reset script preferences';

	var updateBtn = bGrp2.add('iconbutton', undefined, downloadIcon, { style: 'toolbutton' });
	updateBtn.helpTip = 'download the latest script version from github';

	/*

	---------------------------------------------------------------
	> ⚙️ preferences tab events
	---------------------------------------------------------------

	*/

	darkRdo.onClick = function () {

		alert(wip);
	};

	resetBtn.onClick = function () {
		JSONPrefsObj = defPrefsObj;
		savePreferences(); // → save preferences.json
		loadDefaultPrefs();

		nullTypeDrop.selection = nullType;
		adjTypeDrop.selection = adjType;
		projectModeDrop.selection = projectMode;

		setBtnColor(tabColorBtn, tabColors[0]);
		tabColorBtn.notify('onDraw'); // force ui update...

		hoCkb.value = homeOffice;
		updateFolderPaths(); // → update templates and fonts folder

		alert('done!');
	};

	openFldBtn.onClick = function () {
		// alert...
		if (!netAccess()) {
			alert('no access...  Σ(っ °Д °;)っ');
			return;
		}
		if (!fontsFolder.exists) {
			fontsFolder.create();
		}
		openFolder(scriptPreferencesPath);
	};

	projUserTxt.onChange = function () {
		userPrefix = projUserTxt.text.toUpperCase();
		JSONPrefsObj.userPrefix = userPrefix;
		savePreferences();
	};

	nullTypeDrop.onChange = function () {
		nullType = nullTypeDrop.selection.index; // selected null type...
		JSONPrefsObj.selection.nullType = nullType; // update preferences object...
		savePreferences(); // → save preferences.json
	};

	adjTypeDrop.onChange = function () {
		adjType = adjTypeDrop.selection.index; // selected adj type...
		JSONPrefsObj.selection.adjType = adjType; // update preferences object...
		savePreferences(); // → save preferences.json
	};

	projectModeDrop.onChange = function () {
		projectMode = projectModeDrop.selection.index; // selected project model...
		JSONPrefsObj.selection.projectMode = projectMode; // update preferences object...
		savePreferences(); // → save preferences.json
	};

	colorDrop.onChange = function () {
		var c = tabColors[colorDrop.selection.index]; // selected tab color...
		setBtnColor(tabColorBtn, c); // update color preview swatch...
		tabColorBtn.notify('onDraw'); // force ui update...
	};

	tabColorBtn.onClick = function () {
		var c = tabColors[colorDrop.selection.index]; // selected tab color...
		var binColor = eval(rgbToHex(c)); // color converted HEX...
		var configColor = $.colorPicker(binColor); // → system color picker

		if (configColor != -1) {
			configColor = eval(rgbStr(configColor)); // → [1,1,1]
			tabColors[colorDrop.selection.index] = configColor; // update color array...
			JSONPrefsObj.color[colorDrop.selection] = rgbToHEX(configColor); // update preferences object...

			setBtnColor(tabColorBtn, configColor); // update color preview swatch...
			savePreferences(); // → save preferences.json
		}
	};

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
			savePreferences();
		}
	};

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
			savePreferences();
		}
	};

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

	// [ ] comment - updateBtn
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
		for (var p = 0; p < destPathArray.length; p++) {
			if (homeOffice && p > 0) break; // only updates local folders
			try {
				copyFolderContent(downPath, destPathArray[p]);
			} catch (error) { }
		}

		showTabProg('and run the script  ヽ(✿ﾟ▽ﾟ)ノ');
	};

	hoCkb.onClick = function () {
		homeOffice = hoCkb.value;
		JSONPrefsObj.homeOffice = homeOffice;
		nUtilsBtn.enabled = !homeOffice;
		mamHardNewsBtn.enabled = !homeOffice;
		dayBtn.enabled = !homeOffice;
		baseJorBtn.enabled = !homeOffice;
		savePreferences(); // → save preferences.json
		updateFolderPaths(); // → update templates and fonts folder
	};

	wPref.onClose = function () {
		bgColor = tabColors[0];

		hideTabs();
		setBgColor(w, bgColor);
	};

	wPref.show();
}

//prefsDialog();
