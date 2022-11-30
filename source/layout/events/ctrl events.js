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
    for (i = 0; i < selLayers.length; i++) {
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
    } catch (error) { }
  }
  app.endUndoGroup();
};

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
    for (i = 0; i < selLayers.length; i++) {
      for (l = 1; l <= aItem.numLayers; l++) {
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
    } catch (error) { }
  }
  app.endUndoGroup();
};

nullShpBtn.onClick = function () {
  var aItem = app.project.activeItem;
  var selLayers = aItem != null ? aItem.selectedLayers : [];
  var ctrlLayer;
  // error...
  if (!(aItem instanceof CompItem)) {
    showTabErr('comp not selected');
    return;
  }
  app.beginUndoGroup('create null');

  if (selLayers.length > 0) {
    for (var l = 0; l < selLayers.length; l++) {
      var selLayer = selLayers[l];

      if (nullType == 0) {
        ctrlLayer = shpNull();
      } else {
        ctrlLayer = aItem.layers.addNull();
      }
      if (selLayer.hasTrackMatte) {
        ctrlLayer.moveBefore(aItem.layer(selLayer.index - 1));
      } else {
        ctrlLayer.moveBefore(selLayer);
      }
      var prefixArray = getPrefixes();
      var selName = selLayer.name;

      for (var p = 0; p < prefixArray.length; p++) {
        selName = deletePrefix(selName, prefixArray[p]);
      }
      ctrlLayer.guideLayer = true;
      ctrlLayer.name = nullPrefix + selName.replaceSpecialCharacters();

      if (ctrlLayer.name == selLayer.name) {
        var ctrlName = ctrlLayer.name;
        ctrlLayer.name = nameInc(ctrlName);
      }
      setHierarchy(selLayer, ctrlLayer);
      ctrlLayer.inPoint = selLayer.inPoint;
      ctrlLayer.outPoint = selLayer.outPoint;

      if (aniTogBtn.value) {
        cloneKeys(selLayer, ctrlLayer);
      }
      if (exprTogBtn.value) {
        cloneExpressions(selLayer, ctrlLayer);
      }
      ctrlLayer.label = 1;
    }
  } else {
    if (nullType == 0) {
      ctrlLayer = shpNull();
    } else {
      ctrlLayer = aItem.layers.addNull();
    }
    ctrlLayer.guideLayer = true;
    ctrlLayer.name = nullPrefix;
    ctrlLayer.label = 1;
  }
  app.endUndoGroup();
};

nullCShpBtn.onClick = function () {
  var aItem = app.project.activeItem;
  var selLayers = aItem != null ? aItem.selectedLayers : [];
  // error...
  if (selLayers.length < 2) {
    showTabErr('select more than one layer');
    return;
  }
  var lIndex = aItem != null ? aItem.numLayers : 0;
  var ctrlLayer;

  for (i = 0; i < selLayers.length; i++) {
    selLayers[i].parent = null;

    if (selLayers[i].index < lIndex) {
      lIndex = i;
    }
  }
  app.beginUndoGroup('create centered null');

  if (nullType == 0) {
    ctrlLayer = shpNull();
  } else {
    ctrlLayer = aItem.layers.addNull();
  }
  var ctrlPos = ctrlLayer.property('ADBE Transform Group')
    .property('ADBE Position');

  ctrlLayer.guideLayer = true;
  ctrlLayer.name = nullPrefix + 'center';
  ctrlPos.setValue(findCenter(selLayers));
  ctrlLayer.moveBefore(selLayers[lIndex]);

  for (i = 0; i < selLayers.length; i++) {
    selLayers[i].parent = ctrlLayer;
  }
  ctrlLayer.label = 1;

  app.endUndoGroup();
};