/*

---------------------------------------------------------------
> ⚙️ preferences tab events
---------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061
//  jscs:disable maximumLineLength

lDrop.onChange = function () {
  layerType = lDrop.selection.index;
  savePreferences();
};

projTemplateDrop.onChange = function () {
  projectModel = projTemplateDrop.selection.index;
  savePreferences();
};

colorDrop.onChange = function () {
  var c = tabColors[colorDrop.selection.index];
  setBtnColor(tabColorBtn, c);
  tabColorBtn.notify('onDraw');
};

tabColorBtn.onClick = function () {
  var c = tabColors[colorDrop.selection.index];
  var binColor = eval(rgbToHex(c));
  var configColor = $.colorPicker(binColor);

  if (configColor != -1) {
    configColor = rgbStr(configColor);
    setBtnColor(tabColorBtn, eval(configColor));
    tabColors[colorDrop.selection.index] = eval(configColor);
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
    openWebSite(repoURL);
  }
});

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

  if (!downFolder.exists) {
    downFolder.create();
  }
  getURLContent(codeURLArray, pathArray);

  for (var p = 0; p < destPathArray.length; p++) {
    try {
      copyFolderContent(downPath, destPathArray[p]);
    } catch (error) {}
  }

  showTabProg('and run the script  ヽ(✿ﾟ▽ﾟ)ノ');
};
