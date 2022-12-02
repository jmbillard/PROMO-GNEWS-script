/*

---------------------------------------------------------------
> 📟 main menu events
---------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061
//  jscs:disable maximumLineLength


// layouts all the UI
w.onShow = function () {
  setLayout();
};
// layouts all the UI
w.onResizing = w.onResize = function () {
  setLayout();
};

infoBtn.onClick = function () {
  openWebSite(repoURL + readme);
};

ctrlBtn.onClick = function () {
  currentGrp.visible = false;
  currentGrp = tabsGrp.ctrl;
  readme = '#--seção-controles-';
  openTab();
};

animBtn.onClick = function () {
  currentGrp.visible = false;
  currentGrp = tabsGrp.animation;
  readme = '#--seção-animação-';
  openTab();
};

fxBtn.onClick = function () {
  currentGrp.visible = false;
  currentGrp = tabsGrp.fx;
  readme = '#--seção-efeitos-';
  openTab();
};

txtBtn.onClick = function () {
  currentGrp.visible = false;
  currentGrp = tabsGrp.text;
  readme = '#--seção-texto-';
  openTab();
};

guideBtn.onClick = function () {
  currentGrp.visible = false;
  currentGrp = tabsGrp.guide;
  readme = '#--seção-guias-';
  openTab();
};

toolBtn.onClick = function () {
  currentGrp.visible = false;
  currentGrp = tabsGrp.tools;
  readme = '#--subseção-ferramentas-';
  openTab();
};

projBtn.onClick = function () {
  projName = getXMPdata('title[1]') == '' ? 'proj name' : getXMPdata('title[1]');
  projId = getXMPdata('identifier') == '' ? 'proj id' : getXMPdata('identifier');

  currentGrp.visible = false;
  currentGrp = tabsGrp.project;
  readme = '#--seção-projeto-';
  openTab();
  projIdTxt.text = projId;
  projNameTxt.text = projName;
};

appBtn.onClick = function () {
  currentGrp.visible = false;
  currentGrp = tabsGrp.app;
  readme = '#--seção-programa-';
  openTab();
};

devBtn.onClick = function () {
  currentGrp.visible = false;
  currentGrp = tabsGrp.dev;
  openTab();
};

linksBtn.onClick = function () {
  currentGrp.visible = false;
  currentGrp = tabsGrp.links;
  readme = '#--seção-links-';
  openTab();
};

/*

---------------------------------------------------------------
> import templates...
---------------------------------------------------------------

*/

importAetBtn.onClick = function () {
  // error...
  if (!netAccess()) {
    showTabErr(netConfigName + ' not checked');
    return;
  }

  // github main repo...
  var url = repoURL + '/raw/main/downloads/templates.zip';
  var zipPath = downPath + '/templates.zip';
  var templatesLocalFolder = new Folder(fontsLocalPath);

  if (!downFolder.exists) downFolder.create();
  
  if (!templatesFolder.exists || templatesFolder.getFiles().length == 0) {
    // → delete previous local templates folder
    removeFolder(templatesLocalFolder);
    templatesLocalFolder.create(); // → new local templates folder
    
    getURLContent([url], [downPath]); // → download templates.zip
    unzipContent(zipPath, templatesLocalPath); // → unzip templates
    removeFolder(downPath);

    // HO preference
    if (!homeOffice) {
      removeFolder(templatesFolder); // → delete previous templates folder
      templatesFolder.create(); // → delete previous templates folder
      copyFolder(templatesLocalPath, templatesPath); // copy every file and folder
    }
  }
  templateDialog(); // → templates ui
};

/*

---------------------------------------------------------------
> find dialog...
---------------------------------------------------------------

*/

findBtn.onClick = function () {
  findDialog();
};

prefBtn.onClick = function () {
  prefsDialog();
};

/* jshint ignore:start */
#include 'events/animation events.js';
#include 'events/app events.js';
#include 'events/color events.js';
#include 'events/ctrl events.js';
#include 'events/dev events.js';
#include 'events/fx events.js';
#include 'events/links events.js';
#include 'events/project events.js';
#include 'events/text events.js';
/* jshint ignore:end */

/*

---------------------------------------------------------------
> ❌ close group events
---------------------------------------------------------------

*/

closeBtn.onClick = function () {
  GNEWS_LOGO.visible = true;
  aboutTxt.visible = true;
  infoBtn.visible = false;

  closeBtn.visible = true;
  prefGrp.visible = true;
  closeErrBtn.visible = false;
  tabsGrp.menu.visible = true;

  bgColor = tabColors[0];

  hideTabs();
  setBgColor(w, bgColor);
};

closeErrBtn.onClick = function () {
  GNEWS_LOGO.visible = true;
  closeBtn.visible = true;
  closeErrBtn.visible = false;

  clearOutput();
  hideTabs();
  openTab();
};
