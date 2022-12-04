/*

---------------------------------------------------------------
> 🔥 fx tab events
---------------------------------------------------------------

*/

shpAdjBtn.onClick = function () {
  var aItem = app.project.activeItem;
  var selLayer = aItem != null ? aItem.selectedLayers[0] : null;
  var adjLayer;

  // error...
  if (!(aItem instanceof CompItem)) {
    showTabErr('comp not selected');
    return;
  }
  app.beginUndoGroup('create adj layer');

  var adjC = rgb(255, 255, 255);
  var adjW = aItem.width;
  var adjH = aItem.height;

  if (adjType == 0) {
    adjLayer = shpAdjustment();
  } else {
    adjLayer = aItem.layers.addSolid(adjC, '', adjW, adjH, 1.0);
  }
  if (selLayer != null) {
    adjLayer.moveBefore(selLayer);
    adjLayer.inPoint = selLayer.inPoint;
    adjLayer.outPoint = selLayer.outPoint;
  }
  adjLayer.name = adjPrefix;
  adjLayer.adjustmentLayer = true;
  adjLayer.label = 5;

  if (adjLayer instanceof AVLayer) {
    var expStr = scaleToCompSize();
    adjLayer.property('ADBE Transform Group')
      .property('ADBE Scale').expression = expStr;
  }
  app.endUndoGroup();
};

curBtn.onClick = function () {
  var aItem = app.project.activeItem;
  var selLayers = aItem != null ? aItem.selectedLayers : [];
  // error...
  if (selLayers.length == 0) {
    showTabErr('layer not selected');
    return;
  }
  var fxName = 'ADBE CurvesCustom';

  app.beginUndoGroup('curves');

  for (i = 0; i < selLayers.length; i++) {
    var effect = selLayers[i].property('ADBE Effect Parade').addProperty(fxName);
  }
  app.endUndoGroup();
};

levBtn.onClick = function () {
  var aItem = app.project.activeItem;
  var selLayers = aItem != null ? aItem.selectedLayers : [];
  // error...
  if (selLayers.length == 0) {
    showTabErr('layer not selected');
    return;
  }
  var fxName = 'ADBE Pro Levels2';

  app.beginUndoGroup('levels');

  for (i = 0; i < selLayers.length; i++) {
    var effect = selLayers[i].property('ADBE Effect Parade').addProperty(fxName);
  }
  app.endUndoGroup();
};

lumBtn.onClick = function () {
  var aItem = app.project.activeItem;
  var selLayers = aItem != null ? aItem.selectedLayers : [];
  // error...
  if (selLayers.length == 0) {
    showTabErr('layer not selected');
    return;
  }
  var fxName = 'ADBE Lumetri';

  app.beginUndoGroup('lumetri color');

  for (i = 0; i < selLayers.length; i++) {
    var effect = selLayers[i].property('ADBE Effect Parade').addProperty(fxName);
  }
  app.endUndoGroup();
};

gaublurBtn.onClick = function () {
  var aItem = app.project.activeItem;
  var selLayers = aItem != null ? aItem.selectedLayers : [];
  // error...
  if (selLayers.length == 0) {
    showTabErr('layer not selected');
    return;
  }
  var fxName = 'ADBE Gaussian Blur 2';

  app.beginUndoGroup('gaussian blur');

  for (i = 0; i < selLayers.length; i++) {
    var effect = selLayers[i].property('ADBE Effect Parade').addProperty(fxName);
  }
  app.endUndoGroup();
};

comblurBtn.onClick = function () {
  var aItem = app.project.activeItem;
  var selLayers = aItem != null ? aItem.selectedLayers : [];
  // error...
  if (selLayers.length == 0) {
    showTabErr('layer not selected');
    return;
  }
  var fxName = 'ADBE Compound Blur';

  app.beginUndoGroup('compound blur');

  for (i = 0; i < selLayers.length; i++) {
    var effect = selLayers[i].property('ADBE Effect Parade').addProperty(fxName);
  }
  app.endUndoGroup();
};

lensblurBtn.onClick = function () {
  var aItem = app.project.activeItem;
  var selLayers = aItem != null ? aItem.selectedLayers : [];
  // error...
  if (selLayers.length == 0) {
    showTabErr('layer not selected');
    return;
  }
  var fxName = 'ADBE Camera Lens Blur';

  app.beginUndoGroup('lens blur');

  for (i = 0; i < selLayers.length; i++) {
    var effect = selLayers[i].property('ADBE Effect Parade').addProperty(fxName);
  }
  app.endUndoGroup();
};

fillBtn.onClick = function () {
  var aItem = app.project.activeItem;
  var selLayers = aItem != null ? aItem.selectedLayers : [];
  // error...
  if (selLayers.length == 0) {
    showTabErr('layer not selected');
    return;
  }
  var fxName = 'ADBE Fill';

  app.beginUndoGroup('fill');

  for (i = 0; i < selLayers.length; i++) {
    var effect = selLayers[i].property('ADBE Effect Parade').addProperty(fxName);
    effect.property(3).setValue(randomColor(labelColors)); // color
  }
  app.endUndoGroup();
};

fracBtn.onClick = function () {
  var aItem = app.project.activeItem;
  var selLayers = aItem != null ? aItem.selectedLayers : [];
  // error...
  if (selLayers.length == 0) {
    showTabErr('layer not selected');
    return;
  }
  var fxName = 'ADBE Fractal Noise';

  app.beginUndoGroup('fractal noise');

  for (i = 0; i < selLayers.length; i++) {
    var effect = selLayers[i].property('ADBE Effect Parade').addProperty(fxName);
  }
  app.endUndoGroup();
};

grainBtn.onClick = function () {
  var aItem = app.project.activeItem;
  var selLayers = aItem != null ? aItem.selectedLayers : [];
  // error...
  if (selLayers.length == 0) {
    showTabErr('layer not selected');
    return;
  }
  var fxName = 'VISINF Grain Implant';

  app.beginUndoGroup('add grain');

  for (i = 0; i < selLayers.length; i++) {
    var effect = selLayers[i].property('ADBE Effect Parade').addProperty(fxName);
  }
  app.endUndoGroup();
};

glassBtn.onClick = function () {
  var aItem = app.project.activeItem;
  var selLayers = aItem != null ? aItem.selectedLayers : [];
  // error...
  if (selLayers.length == 0) {
    showTabErr('layer not selected');
    return;
  }
  var fxName = 'ADBE 3D Glasses2';

  app.beginUndoGroup('3d glasses');

  for (i = 0; i < selLayers.length; i++) {
    var effect = selLayers[i].property('ADBE Effect Parade').addProperty(fxName);
    effect.property(1).setValue(selLayers[i].index); // left view
    effect.property(2).setValue(selLayers[i].index); // right view
    effect.property(7).setValue(12); // 3d view
  }
  app.endUndoGroup();
};
