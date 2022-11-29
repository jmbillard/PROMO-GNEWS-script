/*
  
---------------------------------------------------------------
> 🔗 links tab events
---------------------------------------------------------------

*/

// emailBtn.onClick = function () {
// 	// error...
// 	if (!netAccess()) {
// 		showTabErr(netConfigName + ' not checked');
// 		return;
// 	}
// 	var site = 'https://outlook.office365.com/mail/';

// 	openWebSite(site);
// };

oneDriveBtn.onClick = function () {
	// error...
	if (!netAccess()) {
		showTabErr(netConfigName + ' not checked');
		return;
	}
	var site = 'https://tvglobocorp-my.sharepoint.com/';

	openWebSite(site);
};

// sharePointBtn.onClick = function () {
// 	// error...
// 	if (!netAccess()) {
// 		showTabErr(netConfigName + ' not checked');
// 		return;
// 	}
// 	var site = 'https://tvglobocorp.sharepoint.com/sites/IlhadeEdioPromo_GNews/Documentos%20Compartilhados/Forms/AllItems.aspx';

// 	openWebSite(site);
// };

trelloBtn.onClick = function () {
	// error...
	if (!netAccess()) {
		showTabErr(netConfigName + ' not checked');
		return;
	}
	var site = 'https://trello.com/promo126/home';

	openWebSite(site);
};

typeFormBtn.onClick = function () {
	// error...
	if (!netAccess()) {
		showTabErr(netConfigName + ' not checked');
		return;
	}
	var site = 'https://tvglobo.typeform.com/to/wiqX4z0X';

	openWebSite(site);
};

plannerBtn.onClick = function () {
	// error...
	if (!netAccess()) {
		showTabErr(netConfigName + ' not checked');
		return;
	}
	var site = 'https://tasks.office.com/tvglobocorp.onmicrosoft.com/en-US/Home/Planner/#/userboard';

	openWebSite(site);
};

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
			savePreferences();
		}
	}
});

mamMagBtn.onClick = function () {
	// error...
	if (!netAccess()) {
		showTabErr(netConfigName + ' not checked');
		return;
	}
	openFolder(magazinePath);
};

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
			savePreferences();
		}
	}
});

mamArteBtn.onClick = function () {
	// error...
	if (!netAccess()) {
		showTabErr(netConfigName + ' not checked');
		return;
	}
	openFolder(artePath);
};

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

dayBtn.onClick = function () {
	// error...
	if (!netAccess()) {
		showTabErr(netConfigName + ' not checked');
		return;
	}
	var date = system.callSystem('cmd.exe /c date /t'); // ->'24/11/2022   '
	var y = date.split('/')[2].trim(); // -> 2022
	var m = date.split('/')[1]; // -> 11
	m += '_' + shortMonthArray[parseInt(m) - 1]; // -> 11_NOV
	var d = date.split('/')[0]; // -> 24
	var todayPath = nAdd + '/PRODUCAO-DIA-A-DIA/' + y + '/' + m + '/' + d + '/GNEWS';
	var fld = new Folder(todayPath);

	if (!fld.exists) {
		showTabErr('this folder is not accessible...');
		return;
	}
	openFolder(todayPath);
};
