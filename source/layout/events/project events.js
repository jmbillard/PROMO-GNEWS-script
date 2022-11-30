/*

---------------------------------------------------------------
> 🗃️ project tab events
---------------------------------------------------------------

*/

insertUserIdBtn.onClick = function () {
  // error...
  if (app.project.numItems == 0) {
    showTabErr('empty project');
    return;
  }
  projId = projIdTxt.text.toUpperCase().replaceSpecialCharacters();
  projName = projNameTxt.text.toLowerCase().replaceSpecialCharacters();
  projIdTxt.text = projId;
  projNameTxt.text = projName;

  var baseName = userPrefix + ' PROMO - ' + projId;
  var sysDate = system.callSystem('cmd.exe /c date /t');
  var dateStr = sysDate.substring(0, sysDate.length - 3);
  
  var itemArray = [];
  app.beginUndoGroup('quick rename ID');
  
  setXMPdata('creator', system.userName);
  setXMPdata('date', dateStr);
  setXMPdata('identifier', projId);
  setXMPdata('title', projName);

  for (k = 1; k <= app.project.numItems; k++) {
    var aItem = app.project.item(k);

    if (aItem.selected && aItem instanceof CompItem) {
      itemArray.push(aItem);
    }
  }
  for (c = 0; c < itemArray.length; c++) {
    var qItem = itemArray[c];
    qItem.name = qItem.name.replace(compPrefix, '');
    qItem.name = qItem.name.replace(/^.*\w{3}\d{6}[\s\_]*/, '');
    qItem.name = qItem.name.replaceSpecialCharacters();
    qItem.name = baseName + ' ' + qItem.name;

    if (qItem.comment == '') {
      qItem.comment = 'export: true';
    }
  }
  app.endUndoGroup();
};

renameItemBtn.onClick = function () {
  // error...
  if (app.project.numItems == 0) {
    showTabErr('empty project');
    return;
  }
  //userPrefix = projUserTxt.text.toUpperCase().replaceSpecialCharacters();
  projId = projIdTxt.text.toUpperCase().replaceSpecialCharacters();
  projName = projNameTxt.text.toLowerCase().replaceSpecialCharacters();
  //projUserTxt.text = userPrefix;
  projIdTxt.text = projId;
  projNameTxt.text = projName;

  var sysDate = system.callSystem('cmd.exe /c date /t');
  var dateStr = sysDate.substring(0, sysDate.length - 3);
  var compsArray = app.project.selection.length > 0 ? app.project.selection : getCompsAndTemplates();
  app.beginUndoGroup('quick rename');
  
  setXMPdata('creator', system.userName);
  setXMPdata('date', dateStr);
  setXMPdata('identifier', projId);
  setXMPdata('title', projName);

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
  if (app.project.numItems == 0) {
    return;
  }
  app.beginUndoGroup('quick project organization');

  removeProjFolders();
  deleteEmptyFolders();
  populateFolders(projectMode);
  deleteEmptyFolders();

  app.endUndoGroup();
};

saveBtn.onClick = function () {
  //userPrefix = projUserTxt.text.toUpperCase().replaceSpecialCharacters();
  projId = projIdTxt.text.toUpperCase().replaceSpecialCharacters();
  projName = projNameTxt.text.toLowerCase().replaceSpecialCharacters();
  //projUserTxt.text = userPrefix;
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
      if (collectFontsTogBtn) fontCollect(savePath);
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

  if (aItem == null) {
    return;
  }

  var saveFolder = Folder.selectDialog();

  if (saveFolder == null) {
    return;
  }

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

