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

  var downPath = scriptPreferencesPath + '/temp';
  var downFolder = new Folder(downPath);
  var amePath = '~/Documents/Adobe/Adobe Media Encoder';
  var ameFolder = new Folder(amePath);
  var vFolders = ameFolder.getFiles();

  var zipPath = downPath + '/AME.zip';
  var unzipPath = scriptPreferencesPath + '/AME presets';

  if (!downFolder.exists) {
    downFolder.create();
  }
  getURLContent([url], [downPath]);
  unzipContent(zipPath, unzipPath);

  for (var i = 0; i < vFolders.length; i++) {
    var presetsAMEPath = decodeURI(vFolders[i]).toString() + '/Presets';
    var presetsAMEFolder = new Folder(presetsAMEPath);

    if (presetsAMEFolder.exists) {
      try {
        copyFolderContent(unzipPath, presetsAMEPath);
      } catch (err) { }
    }
  }
  removeFolder(downFolder); // → delete temp folder
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
  var zipPath = downPath + '/fonts.zip';
  var fontsLocalFolder = new Folder(fontsLocalPath);

  if (!downFolder.exists) {
    downFolder.create();
  }
  if (!fontsFolder.exists || fontsFolder.getFiles().length == 0) {
    removeFolder(fontsLocalFolder); // → delete previous fonts folder
    fontsLocalFolder.create(); // → delete previous fonts folder

    getURLContent([url], [downPath]);
    unzipContent(zipPath, fontsPath);

    // HO preference
    if (!homeOffice) {
      removeFolder(fontsFolder); // → delete previous templates folder
      fontsFolder.create(); // → delete previous templates folder
      copyFolder(fontsLocalPath, fontsPath);
    }
  }
  fontsDialog();
};
