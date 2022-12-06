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

  var saveFolder = Folder.selectDialog();
  var dateStr = system
    .callSystem('cmd.exe /c date /t')
    .trim();

  setXMPdata('creator', system.userName);
  setXMPdata('date', dateStr);

  app.beginUndoGroup('quick save');

  if (saveFolder != null) {
    var savePath = decodeURI(saveFolder.fullName);
    var projFullName = projId + ' ' + projName;
    var projFile = new File(savePath + '/' + projFullName);
    app.project.save(projFile);

    if (collectTogBtn.value) {
      // collect files...
      app.executeCommand(2482);
    } else {
      if (collectFontsTogBtn.value) fontCollect(savePath);
      openFolder(saveFolder);
    }
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

