
/*

---------------------------------------------------------------
> 🌳 tree view functions
---------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061
//  jshint -W085
//  jshint -W043


function cleanHierarchy(nodeTree) {

  var branches = nodeTree.items;

  for (var i = branches.length - 1; i >= 0; i--) {
    
    if (branches[i].type != 'node') continue;

    if (branches[i].items.length > 0) {
      cleanHierarchy(branches[i]);

    } else {
      nodeTree.remove(branches[i]);
    }
    if (nodeTree.items.length == 0) {
      nodeTree.parent.remove(nodeTree);
    }
  }
}

// populates the 'tree view' node hierarchy...
function createHierarchy(array, node, fileTypes) {

  for (var n = 0; n < array.length; n++) {
    var nodeName = array[n].displayName;
    var subArray = [];
  
    try {
      subArray = new Folder(array[n]).getFiles();
    } catch (error) {}
      
    if (subArray.length > 0) {
      
      nodeItem = node.add('node', nodeName);
      nodeItem.image = fldTogIcon;
      
      createHierarchy(subArray, nodeItem, fileTypes);
    } else {

      if (fileTypes.indexOf(getFileExt(nodeName)) >= 0) {
        var templateItem = node.add('item', nodeName);
        templateItem.image = templateListIcon;
      }
    }
  }
}

// refreshes the main 'tree view' node...
function buildTree(folder, tree, fileTypes) {

  // removes the 'root' node...
  tree.remove(tree.items[0]);
  
  var folderContentArray = folder.getFiles();

  // adds a new 'root' node...
  var folderNode = tree.add('node', folder.displayName);
  folderNode.image = fldTogIcon;
  
  // starts the recursive population...
  createHierarchy(folderContentArray, folderNode, fileTypes);
  cleanHierarchy(tree);
}

function buildFontTree(folder, tree) {

  tree.remove(tree.items[0]);
  
  var fontsArray = folder.getFiles();

  var folderNode = tree.add('node', folder.displayName);
  folderNode.image = fldTogIcon;
  
  for (var n = 0; n < fontsArray.length; n++) {

    var fName = fontsArray[n].displayName;
    var subArray = [];

    try {
      subArray = new Folder(fontsArray[n]).getFiles();
    } catch (error) {}
      
    if (subArray.length > 0) {
      var fontFamilyItem = folderNode.add('item', fName);
      fontFamilyItem.image = fontFamilyIcon;
    }
  }
  cleanHierarchy(tree);
}

// [ ] find - loop folder item contents...
// [ ] find - include source text keyframes...
// [ ] find - compensate the ALL CAPS toggle...
// [ ] find - RegEx search...
// [ ] find - limit play head movement to expressions and keyframes...

function buildFindTree(tree, obj, compArray, progBar) {
  
  var sKey = obj.sKey;
  var matchCase = obj.matchCase;
  var matchAccent = obj.matchAccent;
  var resultArray = [];
  
  if (sKey == '') return resultArray;

  while (tree.items.length > 0) {
    tree.remove(tree.items[0]);
  }
  progBar.value = 0;
  
  var progInc = 100 / compArray.length;

  for (i = 0; i < compArray.length; i++) {
    
    if (!(compArray[i] instanceof CompItem)) continue; // is not comp...

    //var t = compArray[i].time;

    for (var l = 1; l <= compArray[i].numLayers; l++) {

      if (!(compArray[i].layer(l) instanceof TextLayer)) continue;

      var compItem;
      var txtLayer = compArray[i].layer(l);
      compArray[i].time = txtLayer.outPoint - 1;
      var txt = textContent(txtLayer);

      txt = matchCase ? txt : txt.toLowerCase();
      sKey = matchCase ? sKey : sKey.toLowerCase();
      txt = matchAccent ? txt : txt.replaceSpecialCharacters();
      sKey = matchAccent ? sKey : sKey.replaceSpecialCharacters();
      
      if (txt.match(sKey) == null) continue;

      if (resultArray.indexOf(compArray[i]) < 0) {
        var compName = limitNameSize(compArray[i].name, 45);
        compItem = tree.add('node', compName);
        compItem.image = compTogIcon;
        
        resultArray.push(compArray[i]);
      }
      var layerName = limitNameSize(txtLayer.name, 40);
      var txtItem = compItem.add('item', '# ' + txtLayer.index + '   ' + layerName);
      txtItem.image = keyStat5Icon;
    }
    //compArray[i].time = t;
    progBar.value += progInc;
  }
  progBar.value = 100;
  return resultArray;
}

// expands all 'tree view' nodes...
function expandNodes(nodeTree) {

  nodeTree.expanded = true;
  var branches = nodeTree.items;

  for (var i = 0; i < branches.length; i++) {

    if (branches[i].type == 'node') {
      expandNodes(branches[i]);
    }
  }
}

