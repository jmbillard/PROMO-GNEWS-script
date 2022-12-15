
/*

---------------------------------------------------------------
> 🕹️ ctrl tab
---------------------------------------------------------------

*/

currentGrp = tabsGrp.ctrl;
var ctrlSubGrp1 = currentGrp.add('group');

// copy animation toggle... 
var aniTogBtn = ctrlSubGrp1.add('iconbutton', undefined, aniTogIcon, { name: 'btn', style: 'toolbutton', toggle: 1 });
aniTogBtn.helpTip = 'copy animation';

// copy expressions toggle... 
var exprTogBtn = ctrlSubGrp1.add('iconbutton', undefined, exprTogIcon, { name: 'btn', style: 'toolbutton', toggle: 1 });
exprTogBtn.helpTip = 'copy expressions';

// create parent null... 
var nullShpBtn = currentGrp.add('iconbutton', undefined, shpNullIcon, { name: 'btn', style: 'toolbutton' });
nullShpBtn.helpTip = 'create parent null';

//---------------------------------------------------------

currentGrp.add('image', undefined, vSpacer, { name: 'div' });

// create centered null
var nullCShpBtn = currentGrp.add('iconbutton', undefined, nullCIcon, { name: 'btn', style: 'toolbutton' });
nullCShpBtn.helpTip = 'centered null';

//---------------------------------------------------------

currentGrp.add('image', undefined, vSpacer, { name: 'div' });

// select hierarchy sub group...
var hGrp = currentGrp.add('group', undefined, { name: 'hGrp' });
hGrp.orientation = 'column';
hGrp.spacing = 0;

// select parent button...
var upHBtn = hGrp.add('iconbutton', undefined, upIcon, { name: 'btn', style: 'toolbutton' });
upHBtn.helpTip = 'select parent';

// select children button...
var dwnHBtn = hGrp.add('iconbutton', undefined, downIcon, { name: 'btn', style: 'toolbutton' });
dwnHBtn.helpTip = 'select children';

/*

---------------------------------------------------------------
> 🕹️ ctrl tab events
---------------------------------------------------------------

*/

upHBtn.onClick = function () {
  var aItem = app.project.activeItem;
  var selLayers = aItem != null ? aItem.selectedLayers : [];
  var upArray = [];
  // error...
  if (!(aItem instanceof CompItem)) {
    showTabErr('comp not selected');
    return;
  }
  app.beginUndoGroup('select parent');

  if (selLayers.length > 0) {

    for (var i = 0; i < selLayers.length; i++) {

      if (selLayers[i].parent != null) {
        upArray.push(selLayers[i].parent);
      }
    }
    if (upArray.length > 0) {

      for (i = 0; i < selLayers.length; i++) {
        selLayers[i].selected = false;
      }
      for (i = 0; i < upArray.length; i++) {

        if (upArray[i].shy && aItem.hideShyLayers) {
          upArray[i].shy = false;
        }
        upArray[i].selected = true;
      }
    }
  } else {
    try {
      aItem.layer('ctrl_comp').selected = true;
    } catch (err) { }
  }
  app.endUndoGroup();
};

//---------------------------------------------------------

dwnHBtn.onClick = function () {
  var aItem = app.project.activeItem;
  var selLayers = aItem != null ? aItem.selectedLayers : [];
  var dwnArray = [];
  // error...
  if (!(aItem instanceof CompItem)) {
    showTabErr('comp not selected');
    return;
  }
  app.beginUndoGroup('select children');

  if (selLayers.length > 0) {

    for (var i = 0; i < selLayers.length; i++) {

      for (var l = 1; l <= aItem.numLayers; l++) {
        var lParent = aItem.layer(l).parent;

        if (lParent == selLayers[i]) {
          dwnArray.push(aItem.layer(l));
        }
      }
    }
    if (dwnArray.length > 0) {

      for (i = 0; i < selLayers.length; i++) {
        selLayers[i].selected = false;
      }
      for (i = 0; i < dwnArray.length; i++) {

        if (dwnArray[i].shy && aItem.hideShyLayers) {
          dwnArray[i].shy = false;
        }
        dwnArray[i].selected = true;
      }
    }
  } else {
    try {
      aItem.layer('ctrl_comp').selected = true;
    } catch (err) { }
  }
  app.endUndoGroup();
};

//---------------------------------------------------------

nullShpBtn.onClick = function () {
  var aItem = app.project.activeItem;
  var selLayers = aItem != null ? aItem.selectedLayers : [];
  // error...
  if (!(aItem instanceof CompItem)) {
    showTabErr('comp not selected');
    return;
  }
  app.beginUndoGroup('create null');

  if (selLayers.length == 0) {
    createNull(nullType);
    return;
  }
  for (var l = 0; l < selLayers.length; l++) {
    var selLayer = selLayers[l];
    var nullLayer = createNull(nullType);
    nullLayer.moveBefore(selLayer);

    if (selLayer.hasTrackMatte && appV < 23) {
      nullLayer.moveBefore(aItem.layer(selLayer.index - 1));
    }

    nullLayer.name += deletePrefix(selLayer.name)
      .replaceSpecialCharacters();

    if (nullLayer.name == selLayer.name) nullLayer.name = nameInc(nullLayer.name);

    setHierarchy(selLayer, nullLayer);
    nullLayer.inPoint = selLayer.inPoint;
    nullLayer.outPoint = selLayer.outPoint;

    if (aniTogBtn.value) cloneKeys(selLayer, nullLayer);
    if (exprTogBtn.value) cloneExpressions(selLayer, nullLayer);
  }
  app.endUndoGroup();
};

//---------------------------------------------------------

nullCShpBtn.onClick = function () {
  var aItem = app.project.activeItem;
  var selLayers = aItem != null ? aItem.selectedLayers : [];
  // error...
  if (selLayers.length < 2) {
    showTabErr('select more than one layer');
    return;
  }
  var lIndex = aItem != null ? aItem.numLayers : 0;

  for (var i = 0; i < selLayers.length; i++) {
    selLayers[i].parent = null;

    if (selLayers[i].index < lIndex) lIndex = i;
  }
  app.beginUndoGroup('create centered null');

  var nullLayer = createNull(nullType);

  nullLayer.name += 'center';
  nullLayer.moveBefore(selLayers[lIndex]);
  nullLayer
    .property('ADBE Transform Group')
    .property('ADBE Position')
    .setValue(findCenter(selLayers));

  for (var s = 0; s < selLayers.length; s++) {
    selLayers[s].parent = nullLayer;
  }
  app.endUndoGroup();
};