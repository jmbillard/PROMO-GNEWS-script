/*

---------------------------------------------------------------
> 🗃️ project tab events
---------------------------------------------------------------

*/

projIdTxt.onChange = projIdTxt.onEnterKey = function () {

  if (this.text.trim() == '') {
    this.text = 'proj. ID';
    setXMPdata('identifier', '');
    return;
  }
  this.text = projId = this.text
    .toUpperCase()
    .replaceSpecialCharacters();

  setXMPdata('identifier', projId);
};

projNameTxt.onChange = projNameTxt.onEnterKey = function () {

  if (this.text.trim() == '') {
    this.text = 'proj. name';
    setXMPdata('title', '');
    return;
  }
  this.text = projName = this.text
    .toLowerCase()
    .replaceSpecialCharacters();

  setXMPdata('title', projName);
};

insertUserIdBtn.onClick = function () {
  // error...
  if (app.project.numItems == 0) {
    showTabErr('empty project');
    return;
  }
  var baseName = userPrefix + ' PROMO - ' + projId;
  var sysDate = system.callSystem('cmd.exe /c date /t');
  var dateStr = sysDate.substring(0, sysDate.length - 3);

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

renameItemBtn.onClick = function () {
  // error...
  if (app.project.numItems == 0) {
    showTabErr('empty project');
    return;
  }
  var sysDate = system.callSystem('cmd.exe /c date /t');
  var dateStr = sysDate.substring(0, sysDate.length - 3);
  var compsArray = app.project.selection.length > 0 ? app.project.selection : getCompsAndTemplates();
  app.beginUndoGroup('quick rename');

  setXMPdata('creator', system.userName);
  setXMPdata('date', dateStr);

  renameComps(projId, projName, compsArray);

  app.endUndoGroup();
};

projOrgBtn.addEventListener('click', function (c) {
  if (c.button == 2) {
    if (app.project.numItems == 0) return;
    tagDialog();
  }
});

projOrgBtn.onClick = function () {
  if (app.project.numItems == 0) return;
  app.beginUndoGroup('quick project organization');

  removeProjFolders();
  deleteEmptyFolders();
  populateFolders(projectMode);
  deleteEmptyFolders();

  app.endUndoGroup();
};

saveBtn.onClick = function () {
  projId = projIdTxt.text.toUpperCase().replaceSpecialCharacters();
  projName = projNameTxt.text.toLowerCase().replaceSpecialCharacters();
  projIdTxt.text = projId;
  projNameTxt.text = projName;

  var saveFolder = Folder.selectDialog();
  var userStr = system.userName;
  var sysDate = system.callSystem('cmd.exe /c date /t');
  var dateStr = sysDate.substring(0, sysDate.length - 3);


  setXMPdata('creator', userStr);
  setXMPdata('date', dateStr);
  setXMPdata('identifier', projId);
  setXMPdata('title', projName);

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
  }
 */};

pngPreviewBtn.onClick = function () {
  var aItem = app.project.activeItem;

  if (aItem == null) return;

  var saveFolder = Folder.selectDialog();

  if (saveFolder == null) return;

  var savePath = saveFolder.fullName + '/';
  var previewPath = savePath + aItem.name + ' preview.png';
  var previewFile = new File(previewPath);

  aItem.saveFrameToPng(aItem.time, previewFile);
  // var setClipboard = 'Get-Content \'' + previewPath + '\' | Set-Clipboard';
  // var cmdStr = 'cmd.exe /c powershell.exe -c "' + setClipboard + '"';
  // system.callSystem(cmdStr);
  openFolder(savePath);
};

endPagePresetBtn.onClick = function () {
  currentGrp = tabsGrp.menu;
  // error...
  if (!netAccess()) {
    showTabErr(netConfigName + ' not checked');
    return;
  }
  endPagePresetDialog();
};

