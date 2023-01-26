/*

---------------------------------------------------------------
> txt tab
---------------------------------------------------------------

*/

currentGrp = tabsGrp.text;
var textSubGrp1 = currentGrp.add('group');

var txtUpperBtn = textSubGrp1.add('iconbutton', iconSize, txtUpperIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
txtUpperBtn.helpTip = 'set text layer to upper case';

var txtLowerBtn = textSubGrp1.add('iconbutton', iconSize, txtLowerIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
txtLowerBtn.helpTip = 'set text layer to lower case';

var txtTitleBtn = textSubGrp1.add('iconbutton', iconSize, txtTitleIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
txtTitleBtn.helpTip = 'set text layer to title case';

//---------------------------------------------------------

currentGrp.add('panel');
 

var textSubGrp2 = currentGrp.add('group');

var txtCleanerBtn = textSubGrp2.add('iconbutton', iconSize, txtCleanerIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
txtCleanerBtn.helpTip = 'deletes consecutive spaces and line breaks';

var txtColumnBtn = textSubGrp2.add('iconbutton', iconSize, txtColumnsIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
txtColumnBtn.helpTip = 'divides consecutive spaces in columns';

//---------------------------------------------------------

currentGrp.add('panel');
 

var textSubGrp3 = currentGrp.add('group');

var limitSld = textSubGrp3.add('slider', undefined, 60, 5, 100);
limitSld.maximumSize.width = 100;
limitSld.minimumSize.width = vMin;

var limitTxt = textSubGrp3.add('statictext', undefined, limitSld.value + ' characters', { name: 'label' , truncate: 'end'});
limitTxt.maximumSize.width = 70;

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

  for (var i = 0; i < selLayers.length; i++) {
    var txt = textContent(selLayers[i]);

    if (txt == '') continue;
    selLayers[i]
      .property('ADBE Text Properties')
      .property('ADBE Text Document')
      .setValue(txt.toUpperCase());
  }
  app.endUndoGroup();
};

//---------------------------------------------------------

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
    var txt = textContent(selLayers[i]);

    if (txt == '') continue;
    selLayers[i]
      .property('ADBE Text Properties')
      .property('ADBE Text Document')
      .setValue(txt.toLowerCase());
  }
  app.endUndoGroup();
};

//---------------------------------------------------------

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
    var txt = textContent(selLayers[i]);

    if (txt == '') continue;
    selLayers[i]
      .property('ADBE Text Properties')
      .property('ADBE Text Document')
      .setValue(txt.toTitleCase());
    //.setValue(titleCase(txt));
  }
  app.endUndoGroup();
};

//---------------------------------------------------------

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

//---------------------------------------------------------

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

//---------------------------------------------------------

limitSld.onChanging = function () {
  this.value = parseInt(this.value);
  limitTxt.text = limitTxt.helpTip = this.value + ' characters';
};

//---------------------------------------------------------

limitSld.onChange = function () {
  this.value = parseInt(this.value);
  limitTxt.text = limitTxt.helpTip = this.value + ' characters';

  if (app.project.numItens == 0) return;
  var aItem = app.project.activeItem;
  var selLayers = aItem != null ? aItem.selectedLayers : [];

  if (aItem != null) {
    app.beginUndoGroup('break text');

    for (i = 0; i < selLayers.length; i++) {
      lineBreak(selLayers[i], this.value);
    }
    app.endUndoGroup();
  }
};

//---------------------------------------------------------

// right click -> opens the git repo...
limitTxt.addEventListener('click', function (c) {
  if (c.detail == 2) {

    var pos = [
      c.screenX + 16,
      c.screenY - 16
    ];

    var input = inputDialog(this.text, pos)
      .toString()
      .replace(/\D/g, '');

    input = parseInt(input) > 5 ? input : 5;
    this.text = this.helpTip = input + ' characters';
    limitSld.value = parseInt(input) > 100 ? 100 : parseInt(input);

    var aItem = app.project.activeItem;
    var selLayers = aItem != null ? aItem.selectedLayers : [];

    if (aItem != null) {
      app.beginUndoGroup('break text');

      for (i = 0; i < selLayers.length; i++) {
        lineBreak(selLayers[i], parseInt(input));
      }
      app.endUndoGroup();
    }
  }
});
