function toDarkTheme () {
  var iconArray = app.project.importFileWithDialog();

  for (var i = 0; i < iconArray.length; i++) {
    var icon = iconArray[i];
    var compN = icon.name;
    var compW = icon.width;
    var compH = icon.height;
    
    var comp = app.project.items.addComp(compN, compW, compH, 1, 1, 1);
    var aLayer = comp.layers.add(icon);
  }
}