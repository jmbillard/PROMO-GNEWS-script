
/*
 
---------------------------------------------------------------
> 🔗 links tab
---------------------------------------------------------------
 
*/

currentGrp = tabsGrp.links;

var linksSubGrp2 = currentGrp.add('group');

var linkTxt1 = linksSubGrp2.add('statictext', undefined, 'sites:', { name: 'label' });
linkTxt1.maximumSize.width = 30;

var oneDriveBtn = linksSubGrp2.add('iconbutton', undefined, oneDriveIcon, { name: 'btn', style: 'toolbutton' });
oneDriveBtn.helpTip = 'OneDrive globo';

//---------------------------------------------------------

linksSubGrp2.add('image', undefined, hSpacer);

// var linksSubGrp3 = currentGrp.add('group');
var trelloBtn = linksSubGrp2.add('iconbutton', undefined, trelloIcon, { name: 'btn', style: 'toolbutton' });
trelloBtn.helpTip = 'trello promo GNEWS';

var typeFormBtn = linksSubGrp2.add('iconbutton', undefined, typeFormIcon, { name: 'btn', style: 'toolbutton' });
typeFormBtn.helpTip = 'type form globo';

var plannerBtn = linksSubGrp2.add('iconbutton', undefined, plannerIcon, { name: 'btn', style: 'toolbutton' });
plannerBtn.helpTip = 'planner globo';

//---------------------------------------------------------

currentGrp.add('image', undefined, vSpacer, { name: 'div' });
var linksSubGrp1 = currentGrp.add('group');

var linkTxt2 = linksSubGrp1.add('statictext', undefined, 'folders:', { name: 'label' });
linkTxt2.maximumSize.width = 40;

var mamArteBtn = linksSubGrp1.add('iconbutton', undefined, arteFolderIcon, { name: 'btn', style: 'toolbutton' });
mamArteBtn.helpTip = 'MAM Para Arte | set custom folder';
var mamMagBtn = linksSubGrp1.add('iconbutton', undefined, magazineFolderIcon, { name: 'btn', style: 'toolbutton' });
mamMagBtn.helpTip = 'upload MAM Magazine | set custom folder';

//---------------------------------------------------------

linksSubGrp1.add('image', undefined, hSpacer);

var mamHardNewsBtn = linksSubGrp1.add('iconbutton', undefined, hardNewsFolderIcon, { name: 'btn', style: 'toolbutton' });
mamHardNewsBtn.helpTip = 'upload MAM Hard News';
mamHardNewsBtn.enabled = !homeOffice;

var nUtilsBtn = linksSubGrp1.add('iconbutton', undefined, utilsFolderIcon, { name: 'btn', style: 'toolbutton' });
nUtilsBtn.helpTip = 'N: Utilidades';
nUtilsBtn.enabled = !homeOffice;

var baseJorBtn = linksSubGrp1.add('iconbutton', undefined, baseFolderIcon, { name: 'btn', style: 'toolbutton' });
baseJorBtn.helpTip = 'Bases Jornais';
baseJorBtn.enabled = !homeOffice;

var dayBtn = linksSubGrp1.add('iconbutton', undefined, dayFolderIcon, { name: 'btn', style: 'toolbutton' });
dayBtn.helpTip = 'HOJE - dia a dia';
dayBtn.enabled = !homeOffice;

/*
  
---------------------------------------------------------------
> 🔗 links tab events
---------------------------------------------------------------

*/

oneDriveBtn.onClick = function () {
	// error...
	if (!netAccess()) {
		showTabErr(netConfigName + ' not checked');
		return;
	}
	var site = 'https://tvglobocorp-my.sharepoint.com/';

	openWebSite(site);
};

//---------------------------------------------------------

trelloBtn.onClick = function () {
	// error...
	if (!netAccess()) {
		showTabErr(netConfigName + ' not checked');
		return;
	}
	var site = 'https://trello.com/promo126/home';

	openWebSite(site);
};

//---------------------------------------------------------

typeFormBtn.onClick = function () {
	// error...
	if (!netAccess()) {
		showTabErr(netConfigName + ' not checked');
		return;
	}
	var site = 'https://tvglobo.typeform.com/to/wiqX4z0X';

	openWebSite(site);
};

//---------------------------------------------------------

plannerBtn.onClick = function () {
	// error...
	if (!netAccess()) {
		showTabErr(netConfigName + ' not checked');
		return;
	}
	var site = 'https://tasks.office.com/tvglobocorp.onmicrosoft.com/en-US/Home/Planner/#/userboard';

	openWebSite(site);
};

//---------------------------------------------------------

mamHardNewsBtn.onClick = function () {
	// error...
	if (!netAccess()) {
		showTabErr(netConfigName + ' not checked');
		return;
	}
	var fld = new Folder(hnPath);
	if (!fld.exists) {
		showTabErr('this folder is not accessible...');
		return;
	}
	openFolder(hnPath);
};

//---------------------------------------------------------

// right click -> configure 'MAM - magazine' path...
mamMagBtn.addEventListener('click', function (c) {
	if (c.button == 2) {
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
	}
});

//---------------------------------------------------------

mamMagBtn.onClick = function () {
	// error...
	if (!netAccess()) {
		showTabErr(netConfigName + ' not checked');
		return;
	}
	openFolder(magazinePath);
};

//---------------------------------------------------------

// right click -> configure 'MAM - para arte' path...
mamArteBtn.addEventListener('click', function (c) {
	if (c.button == 2) {
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
	}
});

//---------------------------------------------------------

mamArteBtn.onClick = function () {
	// error...
	if (!netAccess()) {
		showTabErr(netConfigName + ' not checked');
		return;
	}
	openFolder(artePath);
};

//---------------------------------------------------------

nUtilsBtn.onClick = function () {
	// error...
	if (!netAccess()) {
		showTabErr(netConfigName + ' not checked');
		return;
	}
	var fld = new Folder(utiPath);
	if (!fld.exists) {
		showTabErr('this folder is not accessible...');
		return;
	}
	openFolder(utiPath);
};

//---------------------------------------------------------

baseJorBtn.onClick = function () {
	// error...
	if (!netAccess()) {
		showTabErr(netConfigName + ' not checked');
		return;
	}
	var basesPath = arcPath + '/Jornalismo/Jornais/_Bases Jornais';
	var fld = new Folder(basesPath);

	if (!fld.exists) {
		showTabErr('this folder is not accessible...');
		return;
	}
	openFolder(basesPath);
};

//---------------------------------------------------------

dayBtn.onClick = function () {
	// error...
	if (!netAccess()) {
		showTabErr(netConfigName + ' not checked');
		return;
	}
	var fld = PRODUCAO_DIA_A_DIA ();

	if (!fld.exists) {
		showTabErr('this folder is not accessible...');
		return;
	}
	openFolder(todayPath);
};
