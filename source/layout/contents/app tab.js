
/*

---------------------------------------------------------------
> ✌️ app tab
---------------------------------------------------------------

*/

currentGrp = tabsGrp.app;

var installFontsBtn = currentGrp.add('iconbutton', iconSize, fontsIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
installFontsBtn.helpTip = 'install fonts | open fonts folder';

//---------------------------------------------------------

currentGrp.add('panel', undefined, undefined, { name: 'div'});
 

var copyAMEPresetsBtn = currentGrp.add('iconbutton', iconSize, eprIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
copyAMEPresetsBtn.helpTip = 'install Encoder presets | open presets folder';

//---------------------------------------------------------

currentGrp.add('panel', undefined, undefined, { name: 'div'});
 

var templatesLocalBtn = currentGrp.add('iconbutton', iconSize, aetIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
templatesLocalBtn.helpTip = 'install templates locally';
templatesLocalBtn.enabled = false;

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
