
/*

---------------------------------------------------------------
> 🗃️ project tab
---------------------------------------------------------------

*/

currentGrp = tabsGrp.project;
var projSubGrp1 = currentGrp.add('group');

var projIdContent = hardNews ? 'client' : 'PROJ ID';
var projIdTxt = projSubGrp1.add('edittext', undefined, projIdContent);
projIdTxt.maximumSize.width = 100;
projIdTxt.minimumSize.width = vMin;
projIdTxt.helpTip = projIdContent;

var insertUserIdBtn = projSubGrp1.add('iconbutton', iconSize, addIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
insertUserIdBtn.helpTip = 'insert user with ' + projIdContent;

var projNameTxt = projSubGrp1.add('edittext', undefined, 'proj name');
projNameTxt.maximumSize.width = 100;
projNameTxt.minimumSize.width = vMin;
projNameTxt.helpTip = 'project name';
var renameItemBtn = projSubGrp1.add('iconbutton', iconSize, applyIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
renameItemBtn.helpTip = 'rename comps';

//---------------------------------------------------------

currentGrp.add('image', undefined, spacer.vertical, { name: 'div' });

var projOrgBtn = currentGrp.add('iconbutton', iconSize, projOrgIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
projOrgBtn.helpTip = 'organize project | organization tags';

//---------------------------------------------------------

currentGrp.add('image', undefined, spacer.vertical, { name: 'div' });

// end page presets UI button...
var endPagePresetBtn = currentGrp.add('iconbutton', iconSize, endPagePresetIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
endPagePresetBtn.helpTip = 'end page JSON presets';
endPagePresetBtn.enabled = !hardNews;

//---------------------------------------------------------

currentGrp.add('image', undefined, spacer.vertical, { name: 'div' });
var projSubGrp2 = currentGrp.add('group');

var collectTogBtn = projSubGrp2.add('iconbutton', iconTogSize, fldTogIcon[iconTheme], { name: 'btn', style: 'toolbutton', toggle: 1 });
collectTogBtn.helpTip = 'collect files';

var collectFontsTogBtn = projSubGrp2.add('iconbutton', iconTogSize, txtTogIcon[iconTheme], { name: 'btn', style: 'toolbutton', toggle: 1 });
collectFontsTogBtn.helpTip = 'collect fonts';

var saveBtn = projSubGrp2.add('iconbutton', iconSize, saveIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
saveBtn.helpTip = 'quick project save';

//---------------------------------------------------------

currentGrp.add('image', undefined, spacer.vertical, { name: 'div' });
var projSubGrp3 = currentGrp.add('group');

var fldProjBtn2 = projSubGrp3.add('iconbutton', iconSize, projFolderIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
fldProjBtn2.helpTip = 'project folder';

/*

---------------------------------------------------------------
> 🗃️ project tab events
---------------------------------------------------------------

*/

projIdTxt.onChange = projIdTxt.onEnterKey = function () {
  this.text = projId = this.text
    .replaceSpecialCharacters()
    .toUpperCase();

  if (hardNews) this.text = projId = this.text.toLowerCase();

  if (projIdTxt.text != projIdContent) setXMPdata('identifier', projId);
  if (this.text.trim() == '') this.text = projIdContent;
};

projIdTxt.addEventListener('focus', function () {
  this.text = this.text == projIdContent ? '' : this.text;
});

projIdTxt.addEventListener('blur', function () {
  this.text = this.text == '' ? projIdContent : this.text;
});

// projIdTxt.addEventListener('keydown', function (k) {

//   //alert(k.keyName);
//   if (k.keyName == 'Escape') {
//     // alert('foi');
//     projIdTxt.text = projId;
//     projIdTxt.active = false;
//   }
// });

//---------------------------------------------------------

projNameTxt.onChange = projNameTxt.onEnterKey = function () {
  this.text = projName = this.text
    .replaceSpecialCharacters()
    .toLowerCase();

  if (hardNews) this.text = projName = this.text.toUpperCase();

  setXMPdata('title', projName);
  if (this.text.trim() == '') this.text = 'proj name';
};

projNameTxt.addEventListener('focus', function () {
  this.text = this.text == 'proj name' ? '' : this.text;
});

projNameTxt.addEventListener('blur', function () {
  this.text = this.text == '' ? 'proj name' : this.text;
});

//---------------------------------------------------------

insertUserIdBtn.onClick = function () {
  // error...
  if (app.project.numItems == 0) {
    showTabErr('empty project');
    return;
  }
  app.beginUndoGroup('insert ID');

  var dateStr = system
    .callSystem('cmd.exe /c date /t')
    .trim();
  setXMPdata('creator', system.userName);
  setXMPdata('date', dateStr);

  if (hardNews) {
    insertHnID(projId);
  } else {
    insertPromoID(projId);
  }
  app.endUndoGroup();
};

//---------------------------------------------------------

renameItemBtn.onClick = function () {
  // error...
  if (app.project.numItems == 0) {
    showTabErr('empty project');
    return;
  }
  app.beginUndoGroup('rename comps');

  var dateStr = system
    .callSystem('cmd.exe /c date /t')
    .trim();

  setXMPdata('creator', system.userName);
  setXMPdata('date', dateStr);

  var compArray = app.project.selection;

  if (hardNews) {
    compArray = compArray.length > 0 ? compArray : getComps();
    renameHNComps(projId, projName, compArray);

  } else {
    compArray = compArray.length > 0 ? compArray : getCompsAndTemplates();
    renamePromoComps(projId, projName, compArray);
  }

  app.endUndoGroup();
};

//---------------------------------------------------------

projOrgBtn.addEventListener('click', function (c) {
  if (c.button == 2) {
    if (app.project.numItems == 0) return;
    tagDialog();
  }
});

projOrgBtn.onClick = function () {
  if (app.project.numItems == 0) return;

  var progressWindow = progressDialog();
  var enterBtn = progressWindow.children[2].children[0];
  var cancelBtn = progressWindow.children[2].children[1];
  app.beginUndoGroup('organize project');

  enterBtn.onClick = progressWindow.onEnterKey = function () {
    deleteProjectFolders();
    populateProjectFolders(progressWindow);
    deleteEmptyProjectFolders();

    app.endUndoGroup();
    progressWindow.close();
  };

  cancelBtn.onClick = function () {
    progressWindow.close();
    app.endUndoGroup();

    alert('escaping...');
    executeCommandID('Undo organize project');
  };

  progressWindow.show();
};

//---------------------------------------------------------

saveBtn.onClick = function () {

  var todayPath = PRODUCAO_DIA_A_DIA();
  var saveFolder = hardNews ? new Folder(todayPath) : new Folder(projPath);
  var dateStr = system
    .callSystem('cmd.exe /c date /t')
    .trim();

  setXMPdata('creator', system.userName);
  setXMPdata('date', dateStr);

  app.beginUndoGroup('save project');

  if (!saveFolder.exists) saveFolder = new Folder('~/Desktop');

  var savePath = decodeURI(saveFolder.fullName);
  var promoName = projId + ' ' + projName;
  var hnName = userPrefix + ' - GNEWS ' + projName;

  if (collectTogBtn.value) {
    // collect files...
    // app.executeCommand(2482); // collect files...
    if (hardNews) filesCollectHN(projName);
    
    if (!hardNews) {
      savePath = savePath + '/' + promoName;
      // wipAlert();
      filesCollectPROMO(projName);
    }
  }
  var projFullName = hardNews ? hnName : promoName;
  var projFile = new File(savePath + '/' + projFullName);
  app.project.save(projFile);

  if (collectFontsTogBtn.value) fontCollect(savePath);
  openFolder(saveFolder);
  app.endUndoGroup();

  /*   if (appV > 22) {
      executeCommandID('Save a Copy As 22.x...');
      return;
    }*/
};

//---------------------------------------------------------

endPagePresetBtn.onClick = function () {
  currentGrp = tabsGrp.menu;
  // error...
  if (!netAccess()) {
    showTabErr(netConfigName + ' not checked');
    return;
  }
  endPagePresetDialog();
};

//---------------------------------------------------------

fldProjBtn2.onClick = function () {
  // error...
  if (!netAccess()) {
    showTabErr(netConfigName + ' not checked');
    return;
  }
  var todayPath = PRODUCAO_DIA_A_DIA();
  var currentProj = app.project.file;
  var currentProjPath = currentProj != null ? decodeURI(currentProj.path) : projPath;
  var fld = hardNews ? new Folder(todayPath) : new Folder(currentProjPath);

  if (!fld.exists) {
    showTabErr('this folder is not accessible...');
    return;
  }
  openFolder(decodeURI(fld.fullName));
};
