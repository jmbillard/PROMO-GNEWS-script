/*

---------------------------------------------------------------
> text tab events
---------------------------------------------------------------

*/

txtUpperBtn.onClick = function () {
  var aItem = app.project.activeItem;
  var selLayers = aItem != null ? aItem.selectedLayers : [];
  // error...
  if (selLayers.length == 0) {
    showTabErr('no text layer is selected');
    return;
  }
  app.beginUndoGroup('text to upper case');

  for (i = 0; i < selLayers.length; i++) {
    setTxtCase(selLayers[i], 0);
  }
  app.endUndoGroup();
};

txtLowerBtn.onClick = function () {
  var aItem = app.project.activeItem;
  var selLayers = aItem != null ? aItem.selectedLayers : [];
  // error...
  if (selLayers.length == 0) {
    showTabErr('no text layer is selected');
    return;
  }
  app.beginUndoGroup('text to lower case');

  for (i = 0; i < selLayers.length; i++) {
    setTxtCase(selLayers[i], 1);
  }
  app.endUndoGroup();
};

txtTitleBtn.onClick = function () {
  var aItem = app.project.activeItem;
  var selLayers = aItem != null ? aItem.selectedLayers : [];
  // error...
  if (selLayers.length == 0) {
    showTabErr('no text layer is selected');
    return;
  }
  app.beginUndoGroup('text to title case');

  for (i = 0; i < selLayers.length; i++) {
    setTxtCase(selLayers[i], 2);
  }
  app.endUndoGroup();
};

txtCleanerBtn.onClick = function () {
  var aItem = app.project.activeItem;
  var selLayers = aItem != null ? aItem.selectedLayers : [];
  // error...
  if (selLayers.length == 0) {
    showTabErr('no text layer is selected');
    return;
  }
  app.beginUndoGroup('text to title case');

  for (i = 0; i < selLayers.length; i++) {
    cleanText(selLayers[i]);
  }
  app.endUndoGroup();
};

txtColumnBtn.onClick = function () {
  var aItem = app.project.activeItem;
  var selLayers = aItem != null ? aItem.selectedLayers : [];
  // error...
  if (selLayers.length == 0) {
    showTabErr('no text layer is selected');
    return;
  }
  app.beginUndoGroup('break text columns');

  for (var i = 0; i < selLayers.length; i++) {
    var selLayer = selLayers[i];
    var colN = 2;
    var colPos = selLayer.position.value;
    var col = columnText(selLayer);

    if (col.length < 2) return;
    selLayer.enabled = false;
    col[0].position.setValue(colPos);

    for (c = 1; c < col.length; c++) {
      var exp = '[parent.sourceRectAtTime().width / 2 + 50 + sourceRectAtTime().width / 2, 0];';

      col[c].parent = col[c - 1];
      col[c].position.expression = exp;
      var cPos = col[c].position.value;
      col[c].position.expression = '';
      col[c].position.setValue(cPos);
      col[c].parent = null;
    }
  }
  app.endUndoGroup();
};

limitSld.onChanging = function () {
  limitTxt.text = parseInt(limitSld.value);
  limitTxt2.text = parseInt(limitSld.value);
};

limitTxt2.onChanging = function () {
  limitTxt.text = parseInt(limitTxt2.text);
  limitSld.value = parseInt(limitTxt2.text);
};

limitSld.onChange = function () {
  var aItem = app.project.activeItem;
  var selLayers = aItem != null ? aItem.selectedLayers : [];

  if (aItem != null) {
    app.beginUndoGroup('break text');

    for (i = 0; i < selLayers.length; i++) {
      lineBreak(selLayers[i], Number(limitTxt.text));
    }
    app.endUndoGroup();
  }
};

limitTxt2.onChange = function () {
  var aItem = app.project.activeItem;
  var selLayers = aItem != null ? aItem.selectedLayers : [];

  if (aItem != null) {
    app.beginUndoGroup('break text');

    for (i = 0; i < selLayers.length; i++) {
      lineBreak(selLayers[i], Number(limitTxt.text));
    }
    app.endUndoGroup();
  }
};
