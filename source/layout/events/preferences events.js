/*

---------------------------------------------------------------
> ⚙️ preferences tab events
---------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061
//  jscs:disable maximumLineLength

layerTypeDrop.onChange = function () {
  layerType = layerTypeDrop.selection.index; // selected layer type...
  JSONObj.selection.layerType = layerType; // update preferences object...
  savePreferences(); // → save preferences.json
};

projectModeDrop.onChange = function () {
  projectMode = projectModeDrop.selection.index; // selected project model...
  JSONObj.selection.projectMode = projectMode; // update preferences object...
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
    JSONObj.color[colorDrop.selection] = rgbToHEX(configColor); // update preferences object...

    setBtnColor(tabColorBtn, configColor); // update color preview swatch...
    savePreferences(); // → save preferences.json
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

  if (downFolder.exists) removeFolder(downFolder); // → delete previous download folder
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
  JSONObj.homeOffice = homeOffice;
  savePreferences(); // → save preferences.json
  updateFolderPaths(); // → update templates and fonts folder
};