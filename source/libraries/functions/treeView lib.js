/*

---------------------------------------------------------------
> 🌳 tree view functions
---------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061
//  jshint -W085
//  jshint -W043

// [ ] comment - cleanHierarchy
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

// [ ] comment - createHierarchy
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

// [ ] comment - buildFontTree
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

// [ ] comment - buildFindTree
function buildFindTree(tree, obj, compArray, progBar) {
  var sKey = obj.sKey;
  var matchCase = obj.matchCase;
  var matchAccent = obj.matchAccent;
  var invert = !obj.invert;
  var regExp = obj.regExp;
  var resultArray = [];

  if (sKey == '') return resultArray;

  if (regExp) {
    var pattern = 'new RegExp(/' + sKey + '/);';
    sKey = eval(pattern);
  }

  while (tree.items.length > 0) {
    tree.remove(tree.items[0]);
  }
  progBar.value = 0;
  count = 0;

  var progInc = 100 / compArray.length;

  for (i = 0; i < compArray.length; i++) {
    if (!(compArray[i] instanceof CompItem)) continue; // is not comp...

    for (var l = 1; l <= compArray[i].numLayers; l++) {
      if (!(compArray[i].layer(l) instanceof TextLayer)) continue;

      var compItem;
      var txtLayer = compArray[i].layer(l);
      var doc = txtLayer.property('ADBE Text Properties').property('ADBE Text Document');
      var txtArray = [];

      if (doc.numKeys > 0) {
        for (var k = 1; k <= doc.numKeys; k++) {
          txtArray.push(doc.keyValue(k).toString().trim());
        }
      } else {
        if (doc.expression != '') compArray[i].time = txtLayer.outPoint - 1;
        txtArray.push(textContent(txtLayer).trim());
      }
      if (!regExp) {
        for (var m = 0; m < txtArray.length; m++) {
          if (doc.value.allCaps) txtArray[m] = txtArray[m].toUpperCase();
          if (!matchCase) txtArray[m] = txtArray[m].toLowerCase();
          if (!matchAccent) txtArray[m] = txtArray[m].replaceSpecialCharacters();
        }
        sKey = matchCase ? sKey : sKey.toLowerCase();
        sKey = matchAccent ? sKey : sKey.replaceSpecialCharacters();
      }

      for (var f = 0; f < txtArray.length; f++) {
        var r = txtArray[f].match(sKey) == null ? false : true;
        
        if (r != invert) continue;

        if (resultArray.indexOf(compArray[i]) < 0) {
          var compName = limitNameSize(compArray[i].name, 45);
          compItem = tree.add('node', compName);
          compItem.image = compTogIcon;
          count += 1;

          resultArray.push(compArray[i]);
        }
        var layerName = limitNameSize(txtLayer.name, 35);
        var txtItem = compItem.add('item', '(' + (f + 1) + ')   #' + txtLayer.index + '   ' + layerName);
        txtItem.image = keyStat5Icon;
        count += 1;
      }
    }
    progBar.value += progInc;
  }
  progBar.value = 100;
  return {'resultArray': resultArray, 'count': count};
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
