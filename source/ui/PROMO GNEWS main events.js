/*

---------------------------------------------------------------
> 📟 main menu events
---------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061
//  jscs:disable maximumLineLength


// layouts all the UI
w.onShow = function() {
  setLayout();
};
// layouts all the UI
w.onResizing = w.onResize = function() {
  setLayout();
};

ctrlBtn.onClick = function () {
  currentGrp.visible = false;
  currentGrp = ctrlGrp;
  openTab();
};

animBtn.onClick = function () {
  currentGrp.visible = false;
  currentGrp = animationGrp;
  openTab();
};

fxBtn.onClick = function () {
  currentGrp.visible = false;
  currentGrp = fxGrp;
  openTab();
};

txtBtn.onClick = function () {
  currentGrp.visible = false;
  currentGrp = textGrp;
  openTab();
};

guideBtn.onClick = function () {
  currentGrp.visible = false;
  currentGrp = guideGrp;
  openTab();
};

toolBtn.onClick = function () {
  currentGrp.visible = false;
  currentGrp = toolsGrp;
  openTab();
};

projBtn.onClick = function () {
  projName = getXMPdata('title[1]') == '' ? 'proj name' : getXMPdata('title[1]');
  projId = getXMPdata('identifier') == '' ? 'proj id' : getXMPdata('identifier');

  currentGrp.visible = false;
  currentGrp = projectGrp;
  openTab();
  projUserTxt.text = userPrefix;
  projIdTxt.text = projId;
  projNameTxt.text = projName;
};

appBtn.onClick = function () {
  currentGrp.visible = false;
  currentGrp = appGrp;
  openTab();
};

devBtn.onClick = function () {
  currentGrp.visible = false;
  currentGrp = devGrp;
  openTab();
};

linksBtn.onClick = function () {
  currentGrp.visible = false;
  currentGrp = linksGrp;
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

  if (!downFolder.exists) {
    downFolder.create();
  }
  if (!templatesFolder.exists || templatesFolder.getFiles().length == 0) {
    removeFolder(templatesLocalFolder); // → delete previous templates folder
    templatesLocalFolder.create(); // → delete previous templates folder
    
    getURLContent([url], [downPath]);
    unzipContent(zipPath, templatesLocalPath);

    if (GLOBO_ACCESS) {
      removeFolder(templatesFolder); // → delete previous templates folder
      templatesFolder.create(); // → delete previous templates folder

      alert('copy the templates to the empty folder\nand press the refresh button!');
      
      // wait 3 seconds...
      $.sleep(3000);
      openFolder(templatesLocalPath);
      openFolder(templatesPath);
    }
  }
  templateDialog(templatesPath);
};

/*

---------------------------------------------------------------
> find dialog...
---------------------------------------------------------------

*/

findBtn.onClick = function() {
  findDialog();
};

prefBtn.onClick = function () {
  currentGrp.visible = false;
  currentGrp = preferencesGrp;
  openTab();
};

/* jshint ignore:start */
#include 'events/animation events.js';
#include 'events/app events.js';
#include 'events/color events.js';
#include 'events/ctrl events.js';
#include 'events/dev events.js';
#include 'events/fx events.js';
#include 'events/links events.js';
#include 'events/preferences events.js';
#include 'events/project events.js';
#include 'events/text events.js';
/* jshint ignore:end */

/*

  ---------------------------------------------------------------
  > 🧻 layer tab events
  ---------------------------------------------------------------

  
  renameLayersBtn.onClick = function () {
    var iArray = getComps();
    var assArray = iArray[0];
    var aItem = app.project.activeItem;
    var compArray = [aItem];
    // error...
    if (!(aItem instanceof CompItem)) {
      showTabErr('comp not selected');
      return;
    }
    for (i = 0; i < assArray.length; i++) {
      if (assArray[i] == aItem) {
        compArray = [];
      }
    }
    app.beginUndoGroup('update names');
    
    renameLayers(compArray);
    
    app.endUndoGroup();
};

isolateBtn.onClick = function () {
  var aItem = app.project.activeItem;
  var selLayers = aItem != null ? aItem.selectedLayers : [];
  
  if (aItem instanceof CompItem && selLayers.length > 0) {
    app.beginUndoGroup('isolate layers');
    
    for (i = 1; i <= aItem.numLayers; i++) {
      var l = aItem.layer(i);
      
      l.shy = true;
    }
    
    for (i = 0; i < selLayers.length; i++) {
      var sl = selLayers[i];
      
      sl.shy = false;
    }
    aItem.hideShyLayers = !aItem.hideShyLayers;
    
    app.endUndoGroup();
  }
};

*/

/*

---------------------------------------------------------------
> ❌ close group events
---------------------------------------------------------------

*/

closeBtn.onClick = function () {
  GNEWS_LOGO.visible = true;
  closeBtn.visible = true;
  prefGrp.visible = true;
  closeErrBtn.visible = false;
  menuGrp.visible = true;
  bgColor = tabColors[0];
  errImgGrp.visible = false;

  hideTabs();
  setBgColor(w, bgColor);
};

closeErrBtn.onClick = function () {
  GNEWS_LOGO.visible = true;
  closeBtn.visible = true;
  closeErrBtn.visible = false;
  errImgGrp.visible = false;

  clearOutput();
  hideTabs();
  openTab();
};
