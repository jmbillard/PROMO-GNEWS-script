
/*

  ---------------------------------------------------------------
  > color, guides and branding events
  ---------------------------------------------------------------

*/

//  linter settings:
//  jshint -W083

for (var i = 1; i < colorSubGrp1.children.length; i++) {
  colorSubGrp1.children[i].onClick = function () { 
    var hex = this.properties.name;

    batchFill(hex, hexToRGB(hex));
  };
}
for (var i = 1; i < colorSubGrp2.children.length; i++) {
  colorSubGrp2.children[i].onClick = function () { 
    var hex = this.properties.name;

    batchFill(hex, hexToRGB(hex));
  };
}
for (var i = 1; i < colorSubGrp3.children.length; i++) {
  colorSubGrp3.children[i].onClick = function () { 
    var hex = this.properties.name;

    batchFill(hex, hexToRGB(hex));
  };
}

shpPalletBtn.onClick = function () {
  var aItem = app.project.activeItem;
  // error...
  if (!(aItem instanceof CompItem)) {
    showTabErr('comp not selected');
    return;
  }
  app.beginUndoGroup('pallet');

  var palletLayer = colorPallet();

  palletLayer.name = 'pallet - GNEWS';
  palletLayer.guideLayer = true;
  palletLayer.locked = true;
  palletLayer.property('ADBE Transform Group').position.setValue([0, 0]);
  palletLayer.property('ADBE Transform Group').position.expression('[0,0]');

  app.endUndoGroup();
};

arrowOnAirBtn.onClick = function () {
  var aItem = app.project.activeItem;
  // error...
  if (!(aItem instanceof CompItem)) {
    showTabErr('comp not selected');
    return;
  }
  app.beginUndoGroup('logo GNEWS');

  shp_arrow();

  app.endUndoGroup();
};

logoStaticBtn.onClick = function () {
  var aItem = app.project.activeItem;
  // error...
  if (!(aItem instanceof CompItem)) {
    showTabErr('comp not selected');
    return;
  }
  app.beginUndoGroup('logo GNEWS');

  shpMarcaGnewsStatic();

  app.endUndoGroup();
};

logoAnim3sBtn.onClick = function () {
  var aItem = app.project.activeItem;

  // error...
  if (!(aItem instanceof CompItem)) {
    showTabErr('comp not selected');
    return;
  }
  app.beginUndoGroup('logo GNEWS 3s');

  var layer = app.project.activeItem.layers.addShape();
  layer.startTime = aItem.time;
  layer.name = 'marca_gnews 3s';

  addPseudoEffect('marca_3s', toolMarca3s);
  app.endUndoGroup();
};
