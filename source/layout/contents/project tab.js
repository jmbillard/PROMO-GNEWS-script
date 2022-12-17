
/*

---------------------------------------------------------------
> 🗃️ project tab
---------------------------------------------------------------

*/

currentGrp = tabsGrp.project;
var projSubGrp1 = currentGrp.add('group');

var projIdContent = hardNews ? 'client' : 'proj id';
var projIdTxt = projSubGrp1.add('edittext', undefined, projIdContent);
projIdTxt.maximumSize.width = 100;
projIdTxt.minimumSize.width = vMin;
projIdTxt.helpTip = projIdContent;

var insertUserIdBtn = projSubGrp1.add('iconbutton', undefined, addIcon, { name: 'btn', style: 'toolbutton' });
insertUserIdBtn.helpTip = 'insert user with ' + projIdContent;

var projNameTxt = projSubGrp1.add('edittext', undefined, 'proj name');
projNameTxt.maximumSize.width = 100;
projNameTxt.minimumSize.width = vMin;
projNameTxt.helpTip = 'project name';
var renameItemBtn = projSubGrp1.add('iconbutton', undefined, chkIcon, { name: 'btn', style: 'toolbutton' });
renameItemBtn.helpTip = 'rename comps';

//---------------------------------------------------------

currentGrp.add('image', undefined, vSpacer, { name: 'div' });

var projOrgBtn = currentGrp.add('iconbutton', undefined, templateIcon, { name: 'btn', style: 'toolbutton' });
projOrgBtn.helpTip = 'organize project | organization tags';

//---------------------------------------------------------

currentGrp.add('image', undefined, vSpacer, { name: 'div' });

// end page presets UI button...
var endPagePresetBtn = currentGrp.add('iconbutton', undefined, endPagePresetIcon, { name: 'btn', style: 'toolbutton' });
endPagePresetBtn.helpTip = 'end page JSON presets';

//---------------------------------------------------------

currentGrp.add('image', undefined, vSpacer, { name: 'div' });
var projSubGrp2 = currentGrp.add('group');

var collectTogBtn = projSubGrp2.add('iconbutton', undefined, fldTogIcon, { name: 'btn', style: 'toolbutton', toggle: 1 });
collectTogBtn.helpTip = 'collect files';

var collectFontsTogBtn = projSubGrp2.add('iconbutton', undefined, txtTogIcon, { name: 'btn', style: 'toolbutton', toggle: 1 });
collectFontsTogBtn.helpTip = 'collect fonts';

var saveBtn = projSubGrp2.add('iconbutton', undefined, quickSaveIcon, { name: 'btn', style: 'toolbutton' });
saveBtn.helpTip = 'quick project save';

/*

---------------------------------------------------------------
> 🗃️ project tab events
---------------------------------------------------------------

*/

projIdTxt.onChange = projIdTxt.onEnterKey = function () {
  this.text = projId = this.text
    .replaceSpecialCharacters()
    .toUpperCase();

  setXMPdata('identifier', projId);
  if (this.text.trim() == '') this.text = 'proj. ID';
};

//---------------------------------------------------------

projNameTxt.onChange = projNameTxt.onEnterKey = function () {
  this.text = projName = this.text
    .replaceSpecialCharacters()
    .toLowerCase();

  setXMPdata('title', projName);
  if (this.text.trim() == '') this.text = 'proj. name';
};

//---------------------------------------------------------

insertUserIdBtn.onClick = function () {
  // error...
  if (app.project.numItems == 0) {
    showTabErr('empty project');
    return;
  }
  var baseName = userPrefix + ' PROMO - ' + projId;
  var dateStr = system
    .callSystem('cmd.exe /c date /t')
    .trim();

  var itemArray = app.project.selection;
  app.beginUndoGroup('quick rename ID');

  setXMPdata('creator', system.userName);
  setXMPdata('date', dateStr);

  for (c = 0; c < itemArray.length; c++) {
    var aItem = itemArray[c];
    if (!(aItem instanceof CompItem)) continue;

    aItem.name = baseName + ' ' + aItem.name
      .replace(compPrefix, '')
      .replace(/^.*\w{3}\d{6}[\s\_]*/, '')
      .replaceSpecialCharacters();

    if (aItem.comment == '') aItem.comment = 'export: true';
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
  app.beginUndoGroup('rename templates');

  var dateStr = system
    .callSystem('cmd.exe /c date /t')
    .trim();
  var compArray = app.project.selection.length > 0 ? app.project.selection : getCompsAndTemplates();

  setXMPdata('creator', system.userName);
  setXMPdata('date', dateStr);

  renameComps(projId, projName, compArray);

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
  app.beginUndoGroup('organize project');

  deleteProjectFolders();
  populateProjectFolders();
  deleteEmptyProjectFolders();

  app.endUndoGroup();
};

//---------------------------------------------------------

saveBtn.onClick = function () {

  var saveFolder = hardNews ? PRODUCAO_DIA_A_DIA () : new Folder(projPath);
  var dateStr = system
    .callSystem('cmd.exe /c date /t')
    .trim();

  setXMPdata('creator', system.userName);
  setXMPdata('date', dateStr);

  app.beginUndoGroup('save project');

	if (!saveFolder.exists) saveFolder = new Folder('~/Desktop');

  var promoName = projId + ' ' + projName;
  var hnName =  userPrefix + ' - GNEWS ' + projName + ' - ' + projId;

  var savePath = decodeURI(saveFolder.fullName);
  var projFullName = hardNews ? hnName : promoName;
  var projFile = new File(savePath + '/' + projFullName);
  app.project.save(projFile);

  if (collectTogBtn.value) {
    // collect files...
    app.executeCommand(2482);
  } else {
    if (collectFontsTogBtn.value) fontCollect(savePath);
    openFolder(saveFolder);
  }
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

