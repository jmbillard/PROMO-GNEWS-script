/* eslint-disable no-prototype-builtins */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */

/*

---------------------------------------------------------------
> ✌️ app tab
---------------------------------------------------------------

*/

currentGrp = tabsGrp.app;
var appSubGrp1 = currentGrp.add('group');

var appUtilTxt = appSubGrp1.add('statictext', undefined, 'utilities:', { name: 'label' , truncate: 'end'});
appUtilTxt.maximumSize.width = 45;

var installFontsBtn = appSubGrp1.add('iconbutton', iconSize, fontsIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
installFontsBtn.helpTip = 'install fonts';

var copyAMEPresetsBtn = appSubGrp1.add('iconbutton', iconSize, eprIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
copyAMEPresetsBtn.helpTip = 'install Encoder presets | open presets folder';

//---------------------------------------------------------

currentGrp.add('panel');
var appSubGrp2 = currentGrp.add('group');

var appProjTxt = appSubGrp2.add('statictext', undefined, 'project:', { name: 'label' , truncate: 'end'});
appProjTxt.maximumSize.width = 40;

var setupProjBtn = appSubGrp2.add('iconbutton', iconSize, setupProjIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
setupProjBtn.helpTip = 'setup project:\n\nbit depth: 8\ncolor space: \'Rec 709\'\nexp. engine: \'javascript\'';

var setupLabsBtn = appSubGrp2.add('iconbutton', iconSize, setupLabIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
setupLabsBtn.helpTip = 'setup project label colors / names';

var appSubGrp3 = currentGrp.add('group');

var appCompTxt = appSubGrp3.add('statictext', undefined, 'comp:', { name: 'label' , truncate: 'end'});
appCompTxt.maximumSize.width = 35;

var setupCompBtn = appSubGrp3.add('iconbutton', iconSize, setupCompIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
setupCompBtn.helpTip = 'setup selected comp:\n\nhorizontal | vertical\nbg color: \'#000000\'\npreserve framerate: true';

/*

---------------------------------------------------------------
> ✌️ app tab events
---------------------------------------------------------------

*/

copyAMEPresetsBtn.addEventListener('click', function (c) {
	if (c.button == 2) {
		// error...
		if (!netAccess()) {
			showTabErr(netConfigName + ' not checked');
			return;
		}
		var templatesAMEPath = scriptPreferencesPath + '/AME presets';
		var templatesAMEFolder = new Folder(templatesAMEPath);

		if (!templatesAMEFolder.exists) {
			templatesAMEFolder.create();
		}
		openFolder(templatesAMEPath);
	}
});

//---------------------------------------------------------

copyAMEPresetsBtn.onClick = function () {
	// error...
	if (!netAccess()) {
		showTabErr(netConfigName + ' not checked');
		return;
	}
	var url = repoURL + '/raw/main/downloads/AME.zip';

	var tempPath = scriptPreferencesPath + '/temp';
	var tempFolder = new Folder(tempPath);
	var amePath = '~/Documents/Adobe/Adobe Media Encoder';
	var ameFolder = new Folder(amePath);
	var vFolders = ameFolder.getFiles();

	var zipPath = tempPath + '/AME.zip';
	var unzipPath = scriptPreferencesPath + '/AME presets';

	if (!tempFolder.exists) {
		tempFolder.create();
	}
	getURLContent([url], [tempPath]);
	unzipContent(zipPath, unzipPath);

	for (var i = 0; i < vFolders.length; i++) {
		var presetsAMEPath = decodeURI(vFolders[i]).toString() + '/Presets';
		var presetsAMEFolder = new Folder(presetsAMEPath);

		if (presetsAMEFolder.exists) {
			try {
				copyFolderContentContent(unzipPath, presetsAMEPath);
			} catch (err) { }
		}
	}
	removeFolder(tempFolder); // → delete temp folder
};

//---------------------------------------------------------

installFontsBtn.onClick = function () {
	// error...
	if (!netAccess()) {
		showTabErr(netConfigName + ' not checked');
		return;
	}
	// github main repo...
	var url = repoURL + '/raw/main/downloads/fonts.zip';
	var zipPath = tempPath + '/fonts.zip';
	var fontsLocalFolder = new Folder(fontsLocalPath);

	if (!tempFolder.exists) {
		tempFolder.create();
	}
	if (!fontsFolder.exists || fontsFolder.getFiles().length == 0) {
		removeFolder(fontsLocalFolder); // → delete previous fonts folder
		fontsLocalFolder.create(); // → delete previous fonts folder

		getURLContent([url], [tempPath]);
		unzipContent(zipPath, fontsPath);

		// HO preference
		if (!homeOffice) {
			removeFolder(fontsFolder); // → delete previous templates folder
			fontsFolder.create(); // → delete previous templates folder
			copyFolderContent(fontsLocalPath, fontsPath);
		}
	}
	fontsDialog();
};

//---------------------------------------------------------

setupCompBtn.addEventListener('click', function (c) {
	if (c.button == 2) {
		var aItem = app.project.activeItem;
		// error...
		if (!(aItem instanceof CompItem)) {
			showTabErr('comp not selected');
			return;
		}
		app.beginUndoGroup('setup comp');

		aItem.height = 1080;
		aItem.width = 606;
		aItem.frameRate = 29.97;
		aItem.pixelAspect = 1;
		aItem.bgColor = [0, 0, 0];
		aItem.preserveNestedFrameRate = true;
		aItem.displayStartTime = 0;
		aItem.workAreaStart = 0;
		aItem.workAreaDuration = aItem.duration;

		app.endUndoGroup();
	}
});

//---------------------------------------------------------

setupProjBtn.onClick = function () {
  
	app.beginUndoGroup('setup project');
  
	app.project.bitsPerChannel = 8;
	app.project.expressionEngine = 'javascript-1.0';
	app.project.linearBlending = true;
	app.project.timeDisplayType = TimeDisplayType.TIMECODE;
	app.project.workingSpace = 'Rec.709 Gamma 2.4';
  
	app.endUndoGroup();
};

//---------------------------------------------------------

setupLabsBtn.onClick = function () {
	var prefFile = PREFType.PREF_Type_MACHINE_INDEPENDENT;

	app.beginUndoGroup('setup layer labels');

	for (var i = 1; i < 17; i++) {
		var color = labelsObj['l' + i].color;
		var name = labelsObj['l' + i].name;

		var sectionName = 'Label Preference Color Section 5';
		var keyName = 'Label Color ID 2 # ' + i;
		app.preferences.savePrefAsString(sectionName, keyName, color, prefFile);

		sectionName = 'Label Preference Text Section 7';
		keyName = 'Label Text ID 2 # ' + i;
		app.preferences.savePrefAsString(sectionName, keyName, name, prefFile);
	}
	app.preferences.saveToDisk();
	app.preferences.reload();
	
	app.endUndoGroup();

	// refresh UI ?!...
	var aItem = app.project.activeItem;
	
	if (!(aItem instanceof CompItem)) return;
	var st = aItem.workAreaStart;
	aItem.workAreaStart = st;
	
	for (var l = 1; l <= aItem.numLayers; l++) {
		var aLayer = aItem.layer(l);
		var sl = aLayer.selected;
		aLayer.selected = sl;
	}
};

//---------------------------------------------------------

setupCompBtn.onClick = function () {
	var aItem = app.project.activeItem;
	// error...
	if (!(aItem instanceof CompItem)) {
		showTabErr('comp not selected');
		return;
	}
	app.beginUndoGroup('setup comp');

	aItem.height = 1080;
	aItem.width = 1920;
	aItem.frameRate = 29.97;
	aItem.pixelAspect = 1;
	aItem.bgColor = [0, 0, 0];
	aItem.preserveNestedFrameRate = true;
	aItem.displayStartTime = 0;
	aItem.workAreaStart = 0;
	aItem.workAreaDuration = aItem.duration;

	app.endUndoGroup();
};