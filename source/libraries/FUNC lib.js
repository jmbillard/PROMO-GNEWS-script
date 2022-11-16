/*

---------------------------------------------------------------
# general functions
---------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061
//  jshint -W085
//  jshint -W043

function executeCommandID(command) {
  app.executeCommand(app.findMenuCommandId(command));
}

// load the XMP library...
if ( ExternalObject.AdobeXMPScript == undefined ) {
  ExternalObject.AdobeXMPScript = new ExternalObject( 'lib:AdobeXMPScript');
}

/* jshint ignore:start */
// shape templates...
#include 'shape templates/arrow on-air.jsxinc'; // → UI definition file
#include 'shape templates/logo animation 3s.jsxinc'; // → UI definition file
#include 'shape templates/logo static.jsxinc'; // → UI definition file
// tools...
#include 'tools/counter.jsxinc'; // → UI definition file
#include 'tools/marca 3s.jsxinc'; // → UI definition file
#include 'tools/typewriter.jsxinc'; // → UI definition file
#include 'tools/words.jsxinc'; // → UI definition file
/* jshint ignore:end */


function getTempFld() {

  try {
    var tempFld = new Folder(scriptPreferencesPath + '/temp');

    if (!tempFld.exists) {
      tempFld.create();
    }
    return tempFld.fullName;

  } catch (error) {
    alert('can\'t find temp folder');
  }
}

function convertToBinary(aFile) {

  aFile.open('r');
  aFile.encoding = 'binary';

  var bin = aFile.read();
  var strCode = bin.toSource().toString();

  strCode = strCode.substring(12, strCode.length - 2);
  aFile.close();

  return strCode.replace(/\'/g, '\\\'')
    .replace(/^\"/, '\'')
    .replace(/[\"]+$/, '\'');
}

function exportFile(outFile, strCode) {

  outFile.open('w');
  outFile.write(strCode);
  outFile.close();
}

function createPresetFile(tempFld, fileName, strCode) {

  try {
    var aFile = new File(tempFld + '/' + fileName);

    aFile.encoding = 'BINARY';
    exportFile(aFile, strCode);

    return aFile;
  } catch (error) {}
}

function addPseudoEffect(fxName, strCode) {

  // var mn = fxName.toUpperCase().replace(/\s/g, '_');
  var fx = {
    presetName: fxName,
    presetBinary: [strCode]
  };
  var tempFld = getTempFld();
  var aPreset = createPresetFile(tempFld, fx.presetName, fx.presetBinary);

  try {
    app.project.activeItem.layer(1).applyPreset(File(aPreset));
  } catch (error) {}
}

// open url...
function openWebSite(url) {

  if (appOs == 'Win') {
    system.callSystem('explorer ' + url);

  } else {
    system.callSystem('open ' + url);
  }
}

// open system folder...
function openFolder(folderPath) {
  
  var folder = Folder(folderPath);
  
  if (appOs == 'Win') {
    system.callSystem('explorer ' + Folder.decode(folder.fsName));
  
  } else {
    system.callSystem('open "' + Folder.decode(folder.fsName) + '"');
  }
}
// apply fill effect on multiple layers...
function batchFill(fillName, aColor) {
  
  var aItem = app.project.activeItem;
  var selLayers = (aItem != null) ? aItem.selectedLayers : [];
  // error...
  if (selLayers.length == 0) {
    showTabErr('layer not selected');
    return;
  }

  app.beginUndoGroup('GNEWS fill');

  for (i = 0; i < selLayers.length; i++) {
    var palletFill = selLayers[i]
      .property('ADBE Effect Parade')
      .addProperty('ADBE Fill');
    palletFill.name = fillName;
    palletFill
      .property('Color')
      .setValue(aColor);
  }
  app.endUndoGroup();
}
// cria shape null layers..
function shpNull() {
  var aItem = app.project.activeItem;
  var shpLayer = aItem.layers.addShape();
  var shpGroup = shpLayer
    .property('ADBE Root Vectors Group');
  var shpRect = shpGroup
    .addProperty('ADBE Vector Shape - Rect');
  shpRect.name = 'null';
  shpRect
    .property('ADBE Vector Rect Size')
    .setValue([100, 100]);

  return shpLayer;
}
// cria shape adjustment layers..
function shpAdjustment() {

  var aItem = app.project.activeItem;
  var shpLayer = aItem.layers.addShape();
  var shpGroup = shpLayer
    .property('ADBE Root Vectors Group');
  var shpRect = shpGroup
    .addProperty('ADBE Vector Shape - Rect');
  var expStr = '[thisComp.width, thisComp.height];';

  shpRect.name = 'adjustment';
  shpRect
    .property('ADBE Vector Rect Size')
    .setValue([aItem.width, aItem.height]);
  shpRect
    .property('ADBE Vector Rect Size')
    .expression = expStr;

  var shpFill = shpGroup
    .addProperty('ADBE Vector Graphic - Fill');
  shpFill
    .property('ADBE Vector Fill Color')
    .setValue([1, 1, 1, 1]);
  shpFill.name = 'adjustment fill';

  return shpLayer;
}

// ui string for color buttons -> apply fill effects...
function colorBtn(aColor) {

  var hex = rgbToHex(aColor) // -> '0xffffff'
    .replace('0x', '') // -> 'ffffff'
    .toUpperCase(); // -> 'FFFFFF'
  var rgb = aColor * 255; // -> [255,255,255,255]

  var str = '\tvar b' + hex + ' = guideGrp.add(\'iconbutton\', undefined, undefined, {style: \'toolbutton\'});\
\tb' + hex + '.size = [10, 20];\
\tsetBtnColor(b' + hex + ', rgb(' + rgb.toString() + '));\
\tb' + hex + '.onDraw = customDraw;\
\tb' + hex + '.helpTip = \'R: ' + rgb[0] + '\\nG: ' + rgb[1] + '\\nB: ' + rgb[2] + '\\nHEX: #' + hex + '\';\n\n\
\tb' + hex + '.onClick = function() {batchFill(\'GNEWS #' + hex + '\', rgb(' + rgb.toString() + '));};\n\n';
  return str;
}

function shpPallet(aLayer, colorArray) {

  var s = 50; // color swatch size...
  var gap = 10; // gap between swatches...
  var posY = (colorArray.length - 1) * (s + gap) / 2; // initial vertical offset...
  // vector content...
	var contents = aLayer.property('ADBE Root Vectors Group'); // vector contents...
  // main color pallet group...
	var pallet = contents
    .addProperty('ADBE Vector Group');

  // 1 swatch for every color...
  for (var c = 0; c < colorArray.length; c++) {
    var color = colorArray[c];
    var Hex = rgbToHex(color)
      .replace('0x', '#')
      .toUpperCase();
    var colorGroup = pallet
      .addProperty('ADBE Vectors Group')
      .addProperty('ADBE Vector Group');
    var colorSubGroup = colorGroup
      .addProperty('ADBE Vectors Group');
    var colorSwatch = colorSubGroup
      .addProperty('ADBE Vector Shape - Rect');
    colorSwatch
      .property('ADBE Vector Rect Size')
      .setValue([s,s]);
    colorSwatch
      .property('ADBE Vector Rect Position')
      .setValue([0,c * (s + gap) - posY]);
    var colorFill = colorSubGroup
      .addProperty('ADBE Vector Graphic - Fill');
    colorFill
      .property('ADBE Vector Fill Color')
      .setValue(color);
    colorFill.name = 'GNEWS ' + Hex;
    colorGroup.name = Hex;  
  }
  return pallet;
}

function colorPallet() {
	// shape layer creation...
	var layer = app.project.activeItem.layers.addShape();

  // main pallet vector group...
  var pallet1 = shpPallet(layer, GNEWS_mainColors);
  pallet1
    .property('ADBE Vector Transform Group')
    .property('ADBE Vector Position')
    .setValue([45,540]);
  pallet1.name = 'pallet 1';
  // secondary pallet vector group...
  var pallet2 = shpPallet(layer, GNEWS_secColors);
  pallet2
    .property('ADBE Vector Transform Group')
    .property('ADBE Vector Position')
    .setValue([1875,540]);
  pallet2.name = 'pallet 2';

  // transformations...
  var transform = layer.property('ADBE Transform Group');
  transform
    .property('ADBE Anchor Point')
    .expression = '// locked...\n[0,0];';
  transform
    .property('ADBE Position')
    .expression = '// locked...\n[0,0];';
  transform
    .property('ADBE Scale')
    .expression = '// locked...\n[100,100];';
  transform
    .property('ADBE Rotate Z')
    .expression = '// locked...\n0;';
  transform
    .property('ADBE Opacity')
    .expression = '// locked...\n100;';
  
	// layer attributes...
	layer.name = 'shp_cores';
	layer.guideLayer = true;
  layer.selected = false;
	layer.locked = true;
	
  return layer;
}

function shpArrow(body, head) {

  var rootVGrp = 'ADBE Root Vectors Group';
  var vGrp = 'ADBE Vector Group';
  var vsGrp = 'ADBE Vectors Group';
  var exp = '';

  var shpLayer = app.project.activeItem.layers.addShape(); 
  var contents = shpLayer.property(rootVGrp);

  // body
  var bodyGrp = contents.addProperty(vGrp);
  var bodyShp = bodyGrp.property(vsGrp).addProperty('ADBE Vector Shape - Group');
  bodyShp.property('ADBE Vector Shape').setValue(body);
  bodyShp.name = 'body path';
  var bodyStk = bodyGrp.property(vsGrp).addProperty('ADBE Vector Graphic - Stroke');
  exp = 'effect("arrow rig")("body stroke size").value;';
  bodyStk.property('ADBE Vector Stroke Width').expression = exp;
  bodyStk.property('ADBE Vector Stroke Line Cap').setValue(2);
  exp = 'effect("arrow rig")("color").value;';
  bodyStk.property('ADBE Vector Stroke Color').expression = exp;
  exp = 'value * effect("arrow rig")("show body").value;';
  bodyGrp.property('ADBE Vector Transform Group').opacity.expression = exp;
  bodyGrp.name = 'body';

  // round corners
  var roundCorners = contents.addProperty('ADBE Vector Filter - RC');
  exp = 'effect("arrow rig")("round corners").value;';
  roundCorners.property('ADBE Vector RoundCorner Radius').expression = exp;

  // trim paths
  var trimPath = contents.addProperty('ADBE Vector Filter - Trim');
  exp = 'effect("arrow rig")("path").value;';
  trimPath.property('ADBE Vector Trim End').expression = exp;

  // head
  var headGrp = contents.addProperty(vGrp);
  var headShp = headGrp.property(vsGrp).addProperty('ADBE Vector Shape - Group');
  headShp.property('ADBE Vector Shape').setValue(head);
  headShp.name = 'head path';
  var headStk = headGrp.property(vsGrp).addProperty('ADBE Vector Graphic - Stroke');
  exp = 'var w = effect("arrow rig")("head stroke size").value;\n';
  exp += 'var s = effect("arrow rig")("head scale").value / 100;\n\n';
  exp += 'w / s;';
  headStk.property('ADBE Vector Stroke Width').expression = exp;
  headStk.property('ADBE Vector Stroke Line Cap').setValue(2);
  exp = 'effect("arrow rig")("color").value;';
  headStk.property('ADBE Vector Stroke Color').expression = exp;
  exp = 'var progress = content("Trim Paths 1").end / 100;\n';
  exp += 'var pathShp = content("body").content("body path").path;\n\n';
  exp += 'pathShp.pointOnPath(progress);';
  headGrp.property('ADBE Vector Transform Group').position.expression = exp;
  exp = 'var s = effect("arrow rig")("head scale").value;\n\n';
  exp += '[s, s];';
  headGrp.property('ADBE Vector Transform Group').scale.expression = exp;
  exp = 'var orientChk = effect("arrow rig")("auto orient").value;\n';
  exp += 'var pathShp = content("body").content("body path").path;\n';
  exp += 'var progress = content("Trim Paths 1").end / 100;\n';
  exp += 'var pathTan = pathShp.tangentOnPath(progress);\n\n';
  exp += 'value + (radiansToDegrees(Math.atan2(pathTan[1],pathTan[0])) * orientChk);';
  headGrp.property('ADBE Vector Transform Group').rotation.expression = exp;
  exp = 'value * effect("arrow rig")("show head").value;';
  headGrp.property('ADBE Vector Transform Group').opacity.expression = exp;
  headGrp.name = 'head';

  return shpLayer;
}

// reposiciona e parenteia um layer mantendo a hierarquia...
function setHierarchy(sLayer, cLayer) {

  var sTrm = sLayer.property('ADBE Transform Group');
  var sPos = sTrm.property('ADBE Position');
  var cTrm = cLayer.property('ADBE Transform Group');
  var cPos = cTrm.property('ADBE Position');

  if (sLayer.parent != null) {
    cLayer.parent = sLayer.parent;
  }
  if (sLayer.threeDLayer || sLayer instanceof LightLayer) {
    cLayer.threeDLayer = true;
  }
  cPos.setValue(sPos.value);

  if (sLayer instanceof CameraLayer) {
    cLayer.threeDLayer = true;
  }
  sLayer.parent = cLayer;

  for (i = 1; i <= sTrm.numProperties; i++) {

    if (sTrm.property(i).dimensionsSeparated) {
      cTrm.property(i).dimensionsSeparated = true;
    }
  }
}

// lock transform properties
function lockTrmProp(sLayer) {

  var trm = sLayer
    .property('ADBE Transform Group');
  var expStr = '// locked...\n';

  for (p = 1; p <= trm.numProperties; p++) {
    var prop = trm.property(p);
    var val = prop.value;
  
    if (!prop.canSetExpression) {continue;}
    if (prop.numKeys != 0) {continue;}
    if (prop.expression != '') {continue;}

    if (Array.isArray(val)) {
      val = '[' + val.toString() + ']';
    }
    prop.expression = expStr + val.toString() + ';';
  }
}

// clone expressions...
function cloneExpressions(sLayer, cLayer) {

  var sTrm = sLayer
    .property('ADBE Transform Group');
  var cTrm = cLayer
    .property('ADBE Transform Group');
  sLayer.parent = cLayer.parent;

  for (var p = 1; p <= sTrm.numProperties; p++) {
    var prop = sTrm.property(p);
    var cProp = cTrm.property(p);
    var expStr = prop.expression;

    if (prop.matchName == 'ADBE Opacity') {continue;}
    if (prop.expression == '') {continue;}
      
    prop.expression = '';
    
    try {
      cProp.setValue(prop.value);
    } catch (error) {}

    cTrm.property(p).expression = expStr;

    if (prop.matchName == 'ADBE Position') {
      prop.setValue(cProp.value);
    }
  }
  sLayer.parent = cLayer;
}

// set keyframe properties...
function setKeys(prop, cProp) {

  for (var k = 1; k <= prop.numKeys; k++) {

    var t = prop.keyTime(k);
    var v = prop.keyValue(k);
    cProp.setValueAtTime(t, v);

    var tInTArray = prop.keyInTemporalEase(k);
    var tOutTArray = prop.keyOutTemporalEase(k);
    cProp.setTemporalEaseAtKey(k, tInTArray, tOutTArray);

    var kInIType = prop.keyInInterpolationType(k);
    var kOutIType = prop.keyOutInterpolationType(k);
    cProp.setInterpolationTypeAtKey(k, kInIType, kOutIType);

    if (prop.isSpatial) {
      var kInSArray = prop.keyInSpatialTangent(k);
      var kOutSArray = prop.keyOutSpatialTangent(k);
      cProp.setSpatialTangentsAtKey(k, kInSArray, kOutSArray);
      var ct = prop.keySpatialContinuous(k);
      cProp.setSpatialContinuousAtKey(k, ct);
    }
  }
}

// clone keyframes...
function cloneKeys(selLayer, ctrlLayer) {

  var selLayerTrm = selLayer.property('ADBE Transform Group');
  var ctrlLayerTrm = ctrlLayer.property('ADBE Transform Group');

  selLayer.parent = ctrlLayer.parent;

  for (var p = 1; p <= selLayerTrm.numProperties; p++) {
    var selLayerProp = selLayerTrm.property(p);
    var ctrlLayerProp = ctrlLayerTrm.property(p);

    if (selLayerProp.numKeys != 0 && selLayerProp.matchName != 'ADBE Opacity') {

      if (selLayerProp.dimensionsSeparated) {
        ctrlLayerProp.dimensionsSeparated = true;

        for (var d = 0; d < selLayerProp.value.length; d++) {
          var selLayerPropD = selLayerProp.getSeparationFollower(d);
          var ctrlLayerPropD = ctrlLayerProp.getSeparationFollower(d);
          setKeys(selLayerPropD, ctrlLayerPropD);
        }
      } else {
        setKeys(selLayerProp, ctrlLayerProp);
      }
      for (var k = 1; k <= ctrlLayerProp.numKeys; k++) {
        selLayerProp.removeKey(1);
      }
      try {
        selLayerProp.setValue(ctrlLayerProp.value);

      } catch (error) {}
    }
  }
  selLayer.parent = ctrlLayer;
}

// find center point...
function findCenter(lArray) {

  var maxY = 0;
  var minY = 0;
  var maxX = 0;
  var minX = 0;
  var maxZ = 0;
  var minZ = 0;

  for (i = 0; i < lArray.length; i++) {
    var aLayer = lArray[i];
    var lPos = aLayer
      .property('ADBE Transform Group')
      .property('ADBE Position');
    var lPosX = lPos.value[0];
    var lPosY = lPos.value[1];
    var lPosZ = lPos.value[2];

    if (i == 0) {
      maxX = lPosX;
      minX = lPosX;
      maxY = lPosY;
      minY = lPosY;
      minZ = lPosZ;
      minZ = lPosZ;

    } else {
      if (lPosX > maxX) {
        maxX = lPosX;
      } else if (lPosX < minX) {
        minX = lPosX;
      }
      if (lPosY > maxY) {
        maxY = lPosY;
      } else if (lPosY < minY) {
        minY = lPosY;
      }
      if (lPosZ > maxZ) {
        maxZ = lPosZ;
      } else if (lPosZ < minZ) {
        minZ = lPosZ;
      }
    }
  }
  var cPos = [];
  cPos.push(minX + (maxX - minX) / 2);
  cPos.push(minY + (maxY - minY) / 2);
  cPos.push(minZ + (maxZ - minZ) / 2);

  return cPos;
}

// returns a random integer...
function getRndInteger(min, max) {

  return Math.floor(Math.random() * (max - min)) + min;
}

function gaussRnd(samples) {
  var r = 0;

  for (var i = 0; i < samples; i ++) {
    r += Math.random();
  }

  return r / samples;
}

/*

---------------------------------------------------------------
> string functions
---------------------------------------------------------------

*/

// sets the text case (upper, lower e title)...
function titleCase(str) {

  str = str.toLowerCase().split(' ');

  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }

  str = str.join(' ');
  str = str.split(/\n|\r/);

  for (var t = 0; t < str.length; t++) {
    str[t] = str[t].charAt(0).toUpperCase() + str[t].slice(1);
  }

  return str.join('\n');
}

function setTxtCase(selLayer, caseType) {

  var txtProp = 'ADBE Text Properties';
  var txtDoc = 'ADBE Text Document';

  if (selLayer instanceof TextLayer) {
    var srcTxt = selLayer.property(txtProp).property(txtDoc);
    var txt = srcTxt.value;

    switch (caseType) {

      case(0):
        srcTxt.setValue(txt.toString().toUpperCase());
        break;

      case(1):
        srcTxt.setValue(txt.toString().toLowerCase());
        break;

      case(2):
        srcTxt.setValue(titleCase(txt.toString()));
    }
  } else {

    return false;
  }
}

// cleans multiple line breaks and consecutive space characters...
function cleanText(sLayer) {

  if (!(sLayer instanceof TextLayer)) {return;}

  var srcTxt = sLayer
    .property('ADBE Text Properties')
    .property('ADBE Text Document');
  var txt = srcTxt.value;

  txt = txt.toString()
    .replace(/[\r|\n][\s]{2,}/g, '\n')
    .replace(/\s{2,}/g, ' ');
  
  srcTxt.setValue(txt.trim());
}

// divides a text layer in multiple columns...
function columnText(sLayer, columnsNum) {

  var srcTxt = sLayer
    .property('ADBE Text Properties')
    .property('ADBE Text Document');
  var txt = srcTxt.value.toString()
    .replace(/[\s]*[\r|\n]{1,}[\s]*/g, '*|*')
    .replace(/[\s]*[\-]{3,}[\s]*/g, '*|*')
    .replace(/[\s]{2,}/g, '*|*');

  var cellArray = txt.split('*|*');

  if (cellArray.length >= columnsNum) {
    var col1 = [];
    var col2 = [];
    var col3 = [];
    var cols = [col1, col2, col3];
    var colLayers = [];
  
    for (i = 0; i < cellArray.length; i++) {
  
      switch (columnsNum - ((i + 1) % columnsNum)) {
        case 1:
          col1.push(cellArray[i]);
          break;
  
        case 2:
          col2.push(cellArray[i]);
          break;
  
        case 3:
          col3.push(cellArray[i]);
          break;
      }
    }
    for (i = 0; i < columnsNum; i++) {
      var colName = cols[i][0];
      var colTxt = cols[i][0];
      var colLayer;
  
      for (c = 1; c < cols[i].length; c++) {
        colTxt = colTxt + '\n' + cols[i][c];
      }
      colLayer = app.project.activeItem.layers.addText(colTxt);
      colLayer.name = colName;
      colLayers.push(colLayer);
    }
    return colLayers;

  } else {

    return false;
  }
}

// breaks text based on a character limit...
function lineBreak(selLayer, inputLimit) {

  inputLimit = Math.floor(inputLimit);

  if (selLayer instanceof TextLayer) {

    var srcTxt = selLayer.property(txtProp).property(txtDoc);
    var txt = srcTxt.value.toString().replace(/\n|\r|\t|\v/g, ' ');
    var txt2 = '';
    var wrdArray = txt.split(' ');

    for (i = 0; i < wrdArray.length; i++) {
      var letterCount = wrdArray[i].length;

      if (letterCount >= inputLimit) {
        inputLimit = letterCount + 1;
      }
    }
    while (txt.length > inputLimit) {

      for (i = inputLimit; i > 0; i--) {

        if (txt[i] == ' ') {
          txt2 += txt.substring(0, i);
          txt = '\n' + txt.substring(i + 1, txt.length).trim();
          break;
        }
      }
    }
    srcTxt.setValue(txt2 + txt);
  }
}

function deleteFileExt(str) {

  return str.replace(/\.[0-9a-z]+$/i, '');
}

function getFileExt(str) {

  return str.match(/\.[0-9a-z]+$/i).toString().toLowerCase();
}

function deletePrefix(str, prefixStr) {

  var patStr = 'new RegExp(/(' + prefixStr + '(\\s)*)+/)';
  var pat = eval(patStr);

  return str.replace(pat, '');
}

/*

---------------------------------------------------------------
> 🗃️ project organization and renaming
---------------------------------------------------------------

*/

// moves every project item to root folder...
function removeProjFolders() {

  for (i = app.project.numItems; i >= 1; i--) {
    var rFolder = app.project.rootFolder; // project root folder...
    var aItem = app.project.item(i);

    // is not project folder...
    if (!(aItem instanceof FolderItem)) {
      continue;
    }
    // is project folder...
    while (aItem.numItems > 0) {
      aItem.item(1).parentFolder = rFolder;
    }
  }
  deleteEmptyFolders();
}

function getComps() {

  var compArray = [];

  for (var i = 1; i <= app.project.numItems; i++) {
    var comp = app.project.item(i);

    if (!(comp instanceof CompItem)) continue; // is not comp...
    // item is comp...
    compArray.push(comp);
  }
  return compArray;
}
// get all compositions | templates...
function getCompsAndTemplates() {

  var compArray = [];
  
  for (var i = 1; i <= app.project.numItems; i++) {
    var comp = app.project.item(i);

    if (!(comp instanceof CompItem)) continue; // is not comp...
    // item is comp...
    compArray.push(comp);
    // essential graphics template name
    var templateName = comp.motionGraphicsTemplateName;

    // item is end page template...
    if (templateName == 'end page') {
      comp.comment = 'export: true'; // → export tag
      continue;
    }
    // item is not end page template...
    for (var l = 1; l <= comp.numLayers; l++) {
      var service = comp.layer(l)
        .property('ADBE Effect Parade')
        .property('servico');
      var epService = comp.layer(l)
        .property('ADBE Effect Parade')
        .property('servico end page');
      if (service != undefined || epService != undefined) {
        // has a layer with date and time information...
        comp.comment = 'export: true';  // → export tag
        break;
      }
      if (!(comp.layer(l).source instanceof CompItem)) {
        break; // layer is not comp...
      }
      // layer is comp...
      var preComp = comp.layer(l).source;
      // essential graphics template name...
      templateName = preComp.motionGraphicsTemplateName;
      try {
        epService = preComp.layer('ctrl_comp')
          .property('ADBE Effect Parade')
          .property('servico end page'); // effect named 'servico end page'...

        if (epService != undefined) {
          // precomp is end page...
          comp.comment = 'export: true'; // → export tag
          break;
        }
      } catch (error) {}
      // has a end page precomp layer...
      if (templateName == 'end page') {
        comp.comment = 'export: true'; // → export tag
      }
    }
  }
  return compArray;
}

function getFootage() {

  var stillArray = [];
  var footageArray = [];
  var sonoArray = [];
  var solidArray = [];
  var missingArray = [];

  for (i = app.project.numItems; i >= 1; i--) {
    var aItem = app.project.item(i);

    if (aItem instanceof FootageItem) {

      if (!aItem.footageMissing) {

        switch (true) {
          case (aItem.mainSource instanceof FileSource):

          switch (true) {
            case (aItem.mainSource.isStill):
              stillArray.push(aItem);
              break;

            case (aItem.hasVideo):
              footageArray.push(aItem);
              break;

            default:
              sonoArray.push(aItem);
          }
          break;

          case (aItem.mainSource instanceof SolidSource):
            solidArray.push(aItem);
            break;
        }
      } else {
        missingArray.push(aItem.name);
      }
    }
  }

  return [stillArray, footageArray, sonoArray, solidArray, missingArray];
}

// creates the project folder structure...
function projectTemplate(template) {

  var rndFolder; // render folder...
  var ftgFolder; // footage folder...
  var imgFolder; // images folder...
  var snoFolder; // sounds folder...
  var solFolder; // solids folder...
  var compsFolder; // precomps folder...
  var astFolder; // assets folder...
  var edtFolder; // editable assets folder...

  switch (template) {
    // legacy 'PROMO' template...
    case (0):
      rndFolder = app.project.rootFolder; // project root folder
      edtFolder = app.project.items.addFolder('_EDITAR');
      astFolder = app.project.items.addFolder('_MATERIAL');
      compsFolder = app.project.items.addFolder('Comps');
      compsFolder.parentFolder = astFolder;
      epFolder = app.project.items.addFolder('End Pages');
      ftgFolder = app.project.items.addFolder('Videos');
      ftgFolder.parentFolder = astFolder;
      imgFolder = app.project.items.addFolder('Imagens');
      imgFolder.parentFolder = astFolder;
      snoFolder = app.project.items.addFolder('Sons');
      snoFolder.parentFolder = astFolder;
      solFolder = app.project.items.addFolder('Solidos');
      break;

    // custom 'PROMO' template...
    case (1):
      edtFolder = app.project.items.addFolder('---- edit ----');
      rndFolder = app.project.items.addFolder('---- render ----');
      epFolder = app.project.items.addFolder('end pages');
      epFolder.parentFolder = rndFolder;
      astFolder = app.project.items.addFolder('assets');
      ftgFolder = app.project.items.addFolder('footage');
      ftgFolder.parentFolder = astFolder;
      imgFolder = app.project.items.addFolder('images');
      imgFolder.parentFolder = ftgFolder;
      snoFolder = app.project.items.addFolder('sounds');
      snoFolder.parentFolder = ftgFolder;
      compsFolder = app.project.items.addFolder('precomps');
      compsFolder.parentFolder = astFolder;
      solFolder = app.project.items.addFolder('solids');
  }

  return [
    rndFolder,
    ftgFolder,
    imgFolder,
    snoFolder,
    solFolder,
    compsFolder,
    edtFolder,
    epFolder
  ];
}

function populateFolders() {
  // current selected project template...
  var p = parseInt(projTemplateDrop.selection);

  var comps = getCompsAndTemplates(); // all project comps and templates...
  var footage = getFootage(); // all project footage...
  var folders = projectTemplate(p); // project folder structure...

  var stl = footage[0]; // images...
  var pht; // photos...
  var bg; // backgrounds...
  var ref; // references...
  var lgo; // logos...
  var ico; // icons...
  var tex; // textures...
  var ftg = footage[1]; // videos...
  var sno = footage[2]; // sounds...
  var loc; // voice over...
  var mus; // music...
  var sol = footage[3]; // solids...
  var mis = footage[4]; // missing footage...

  var rndFolder = folders[0]; // render folder...
  var ftgFolder = folders[1]; // footage folder...
  var imgFolder = folders[2]; // images folder...
  var snoFolder = folders[3]; // sounds folder...
  var solFolder = folders[4]; // solids folder...
  var compsFolder = folders[5]; // comps folder...
  var edtFolder = folders[6]; // editable assets folder...
  var epFolder = folders[7]; // end page folder...

  if (comps.length > 0) {
    
    for (var c = 0; c < comps.length; c++) {
      var comp = comps[c];
      // essential graphics template name...
      var templateName = comp.motionGraphicsTemplateName;

      switch (true) {
        // export tag...
        case itemSetting(comp, 'export'):
          comp.parentFolder = rndFolder; // → render folder
          break;
        // edit tag...
        case itemSetting(comp, 'edit'):
          comp.parentFolder = edtFolder; // → edit folder
          break;
        // voice over tag...
        case itemSetting(comp, 'loc'):
          if (loc == undefined) {
            loc = app.project.items.addFolder('loc'); // → new voice over folder
            loc.parentFolder = snoFolder; // subfolder...
          }
          comp.parentFolder = loc;
          break;
        // music tag...
        case itemSetting(comp, 'music'):
          if (mus == undefined) {
            mus = app.project.items.addFolder('music'); // → new music folder
            mus.parentFolder = snoFolder; // subfolder...
          }
          comp.parentFolder = mus;
          break;
        // no tag...
        default:
          comp.parentFolder = compsFolder; // → comps folder
      }
      try {
        var epService = comp.layer('ctrl_comp')
          .property('ADBE Effect Parade')
          .property('servico end page'); // effect named 'servico end page'...

        if (epService != undefined) {
          // is end page...
          comp.parentFolder = epFolder; // → end page folder
          continue;
        }
      } catch (error) {}

      if (templateName == 'Untitled' || itemSetting(comp, 'ignore') || itemSetting(comp, 'edit')) {
        continue; // comp is not a named template...
      }
      // comp is a named template...
      // current parent folder...
      var parFolder = comp.parentFolder; // → current parent folder
      var templateFolder = parFolder; // → template folder

      // checks if the current parent folder has a subfolder named as the current template...
      for (var fi = 1; fi <= parFolder.numItems; fi++) {

        if (parFolder.item(fi).name == templateName + 's') {
          templateFolder = parFolder.item(fi); // template folder exists...
          break;
        }
      }
      // create template folder...
      if (templateFolder == parFolder) {
        templateFolder = app.project.items.addFolder(templateName + 's'); // → new template folder
        templateFolder.parentFolder = parFolder; // subfolder...
      }
      comp.parentFolder = templateFolder;
    }
  }
  if (ftg.length > 0) {
 
    for (var f = 0; f < ftg.length; f++) {

      switch (true) {
        // logo tag...
        case itemSetting(ftg[f], 'logo'):
          if (lgo == undefined) {
            lgo = app.project.items.addFolder('logos'); // → new logos folder
            lgo.parentFolder = ftgFolder; // subfolder...
          }
          ftg[f].parentFolder = lgo;
          break;
        // backgrounds tag...
        case itemSetting(ftg[f], 'bg'):
          if (bg == undefined) {
            bg = app.project.items.addFolder('bg'); // → new backgrounds folder
            bg.parentFolder = ftgFolder; // subfolder...
          }
          ftg[f].parentFolder = bg;
          break;
        // references tag...
        case itemSetting(ftg[f], 'ref'):
          if (ref == undefined) {
            ref = app.project.items.addFolder('references'); // → new references folder
            ref.parentFolder = ftgFolder; // subfolder...
          }
          ftg[f].parentFolder = ref;
          break;
        // voice over tag...
        case itemSetting(ftg[f], 'loc'):
          if (loc == undefined) {
            loc = app.project.items.addFolder('loc'); // → new voice over folder
            loc.parentFolder = snoFolder; // subfolder...
          }
          ftg[f].parentFolder = loc;
          break;
        // music tag...
        case itemSetting(ftg[f], 'music'):
          if (mus == undefined) {
            mus = app.project.items.addFolder('music'); // → new music folder
            mus.parentFolder = snoFolder; // subfolder...
          }
          ftg[f].parentFolder = mus;
          break;
        // textures tag...
        case itemSetting(ftg[f], 'texture'):
          if (tex == undefined) {
            tex = app.project.items.addFolder('textures'); // → new textures folder
            tex.parentFolder = ftgFolder; // subfolder...
          }
          ftg[f].parentFolder = tex;
          break;
        // general footage folder...
        default:
          ftg[f].parentFolder = ftgFolder;
      }
    }
  }
  if (stl.length > 0) {

    for (var s = 0; s < stl.length; s++) {

      switch (true) {
        // references tag...
        case itemSetting(stl[s], 'ref'):
          if (ref == undefined) {
            ref = app.project.items.addFolder('references'); // → new references folder
            ref.parentFolder = imgFolder.parentFolder; // subfolder...
          }
          stl[s].parentFolder = ref;
          break;
        // logo tag...
        case itemSetting(stl[s], 'logo'):
          if (lgo == undefined) {
            lgo = app.project.items.addFolder('logos'); // → new logos folder
            lgo.parentFolder = imgFolder.parentFolder; // subfolder...
          }
          stl[s].parentFolder = lgo;
          break;
        // icon tag...
        case itemSetting(stl[s], 'icon'):
          if (ico == undefined) {
            ico = app.project.items.addFolder('icons'); // → new icons folder
            ico.parentFolder = imgFolder.parentFolder; // subfolder...
          }
          stl[s].parentFolder = ico;
          break;
        // photo tag...
        case itemSetting(stl[s], 'photo'):
          if (pht == undefined) {
            pht = app.project.items.addFolder('photos'); // → new photos folder
            pht.parentFolder = imgFolder.parentFolder; // subfolder...
          }
          stl[s].parentFolder = pht;
          break;
        // backgrounds tag...
        case itemSetting(stl[s], 'bg'):
          if (bg == undefined) {
            bg = app.project.items.addFolder('bgs'); // → new backgrounds folder
            bg.parentFolder = imgFolder.parentFolder; // subfolder...
          }
          stl[s].parentFolder = bg;
          break;
        // texture tag...
        case itemSetting(stl[s], 'texture'):
          if (tex == undefined) {
            tex = app.project.items.addFolder('textures'); // → new textures folder
            tex.parentFolder = imgFolder.parentFolder; // subfolder...
          }
          stl[s].parentFolder = tex;
          break;
        // no tag...
        default:
          stl[s].parentFolder = imgFolder;
      }
    }
  }
  if (sno.length > 0) {

    for (var sn = 0; sn < sno.length; sn++) {
      switch (true) {
        // voice over folder...
        case itemSetting(sno[sn], 'loc'):
          if (loc == undefined) {
            loc = app.project.items.addFolder('loc'); // → new voice over folder
            loc.parentFolder = snoFolder; // subfolder...
          }
          sno[sn].parentFolder = loc;
          break;
        // music folder...
        case itemSetting(sno[sn], 'music'):
          if (mus == undefined) {
            mus = app.project.items.addFolder('music'); // → new music folder
            mus.parentFolder = snoFolder; // subfolder...
          }
          sno[sn].parentFolder = mus;
          break;
        // general sounds folder...
        default:
          sno[sn].parentFolder = snoFolder;
      }
    }
  }
  if (sol.length > 0) {

    for (var sl = 0; sl < sol.length; sl++) {
      sol[sl].parentFolder = solFolder;
    }
  }
  if (mis.length > 0) {
    var missingStr = '';

    for (var m = 0; m < mis.length; m++) {
      missingStr += '\n    ' + mis[m];
    }
    alert('some files are missing:' + missingStr);
  }
}

// removes project folders with 0 itens...
function deleteEmptyFolders() {

  for (i = app.project.numItems; i >= 1; i--) {
    var aItem = app.project.item(i);

    if (aItem instanceof FolderItem && aItem.numItems == 0) {
      aItem.remove();
    }
  }
}

// copy all fonts used in the project...
function fontCollect(savePath) {

  var fontArray = [];
  var txtProp = 'ADBE Text Properties';
  var txtDoc = 'ADBE Text Document';

  for (f = 1; f <= app.project.numItems; f++) {
    var aItem = app.project.item(f);

    if (!(aItem instanceof CompItem)) {continue;}

    for (l = 1; l <= aItem.numLayers; l++) {
      var aLayer = aItem.layer(l);

      if (!(aLayer instanceof TextLayer)) {continue;}
      
      var textProp = aLayer.property(txtProp);
      var textDoc = textProp.property(txtDoc).value;
      var fontName = textDoc.font;

      if (textDoc.fontLocation == '') {
        alert(fontName + ' not found... >_<');

      } else if (fontArray.indexOf(fontName) >= 0) {
        var fontFolder = new Folder(savePath + '/fonts/');
        var fontCPath = fontFolder.absoluteURI + '/';
        var fontPath = decodeURI(textDoc.fontLocation);
        var ext = getFileExt(fontPath);
        var fontFile = new File(fontPath);
        var fontCFile = new File(fontCPath + fontName + ext);

        fontArray.push(fontName);

        if (!fontFolder.exists) {
          fontFolder.create();
        }
        fontFile.copy(fontCFile);
      }
    }
  }
}

function copyFolderContent(src, dst) {

  var srcFolder = new Folder(src);
  var dstFolder = new Folder(dst);
  var filesArray = [];
  
  if (!srcFolder.exists) {return;}

  filesArray = srcFolder.getFiles();
  
  if (filesArray.length == 0) {return;}
    
  for (var i = 0; i < filesArray.length; i++) {
    var aFile = filesArray[i];
    var aFileName = File.decode(aFile.displayName).toString();
    var subArray = [];

    try {
      subArray = new Folder(decodeURI(aFile.fullName).toString()).getFiles();
    } catch (error) {}

    if (subArray.length > 0) {
      copyFolderContent(decodeURI(aFile.fullName).toString(), dst);
    
    } else {

      if (!dstFolder.exists) {continue;}

      var cFile = new File(dst + '/' + aFileName);
      aFile.copy(cFile);
    }
  }
}

function installFonts (fontsPath) {

  var srcFolder = new Folder(fontsPath);
  var filesArray = [];
  var filter = ['.ttf', '.otf'];
  
  if (!srcFolder.exists) {return;}

  filesArray = srcFolder.getFiles();
  
  if (filesArray.length == 0) {return;}
  
  var installFontsPS = 'Write-Host \'------------- PROMO GNEWS script -------------\'';
  installFontsPS += ' -ForegroundColor white -BackgroundColor DarkRed;';
  installFontsPS += 'Write-Host \'                (u.u )...zzz\';';
  installFontsPS += '$Destination = (New-Object -ComObject Shell.Application).Namespace(0x14);';
  
  for (var i = 0; i < filesArray.length; i++) {
    var aFile = filesArray[i];
    var aFileName = File.decode(aFile.displayName).toString();
    var subArray = [];
    
    try {
      subArray = new Folder(decodeURI(aFile.fullName).toString()).getFiles();
    } catch (error) {}
    
    if (subArray.length > 0) {
      installFonts(decodeURI(aFile.fullName).toString());

      continue;
    } else {
      
      if (filter.indexOf(getFileExt(aFileName)) >= 0) {
        var aFontPath = fontsPath.replace(/\~/, 'C:/Users/' + system.userName.toString());
        aFontPath = aFontPath.replace(/\//g, '\\');
        installFontsPS += '$Destination.CopyHere(\'' + aFontPath + '\\' + aFileName + '\');';
        installFontsPS += 'Write-Host \'> installing ' + aFileName + '...\';';
        
      } else {
        continue;
      }
    }
  }
  var cmdStr = 'cmd.exe /c powershell.exe -c "' + installFontsPS + '"';
  system.callSystem(cmdStr);
}

function getURLContent(urlArray, dstArray) {
  
  if (appOs == 'Win') {
    // powershell command string...
    // header...
    var cmd = 'Write-Host \'------------- PROMO GNEWS script -------------\'';
    cmd += ' -ForegroundColor white -BackgroundColor DarkRed;';

    
    for (var i = 0; i < urlArray.length; i++) {
      // get only the NOT '\' OR '/' at the end...
      var fileName = decodeURI(urlArray[i].match(/[^\\|\/]*$/i));
      // removes any character after the '?' at the end...
      fileName = fileName.replace(/[\?].*$/, '');
      // current action description...
      cmd += 'Write-Host \'> downloading ' + fileName + '...\';';
      // downloads file...
      cmd += 'curl \'' + urlArray[i] + '\' -OutFile \'' + dstArray[i] + '/' + fileName + '\';';
    }
    // pass the powershell command → cmd... 
    var cmdStr = 'cmd.exe /c powershell.exe -c "' + cmd + '"';
    // →  cmd.exe /c powershell.exe -c "curl 'https://site.com/file.jsx' -OutFile '~/Desktop/file.jsx'"
    system.callSystem(cmdStr);
  }
}

function unzipContent(zipPath, dstPath) {
  
  if (appOs == 'Win') {
    // get only the NOT '\' OR '/' at the end...
    var fileName = decodeURI(zipPath.match(/[^\\|\/]*$/i));
    // removes any character after the '?' at the end...
    fileName = fileName.replace(/[\?].*$/, '');
    
    // powershell command string...
    // header...
    var cmd = 'Write-Host \'------------- PROMO GNEWS script -------------\'';
    cmd += ' -ForegroundColor white -BackgroundColor DarkRed;';
    // current action description...
    cmd += 'Write-Host \'> extracting ' + fileName + '...\';';
    // unzip file...
    cmd += 'Expand-Archive -Path \'' + zipPath + '\' -DestinationPath \'' + dstPath + '\'  -Force;';
    // pass the powershell command thru cmd... 
    var cmdStr = 'cmd.exe /c powershell.exe -c "' + cmd + '"';

    system.callSystem(cmdStr);
  }
}

function zipContent(path, zipPath) {
  
  if (appOs == 'Win') {
    // get only the NOT '\' OR '/' at the end...
    var fileName = decodeURI(zipPath.match(/[^\\|\/]*$/i));
    // removes any character after the '?' at the end...
    fileName = fileName.replace(/[\?].*$/, '');
    
    // powershell command string...
    // header...
    var cmd = 'Write-Host \'------------- PROMO GNEWS script -------------\'';
    cmd += ' -ForegroundColor white -BackgroundColor DarkRed;';
    // current action description...
    cmd += 'Write-Host \'> compressing ' + fileName + '...\';';
    // zip file...
    cmd += 'Compress-Archive -Path \'' + path + '\' -DestinationPath \'' + zipPath;
    cmd += '\' -CompressionLevel Optimal -Force;';
    // pass the powershell command thru cmd... 
    var cmdStr = 'cmd.exe /c powershell.exe -c "' + cmd + '"';

    system.callSystem(cmdStr);
  }
}

// format short date and time → SHORT DATE TIME
function formatShortDateAndTime(str) {
  return  str.toString()
    .trim()
    .toUpperCase()
    .toShortDate()
    .split(/\s+—\s+|[\n\r]+|\s+\|\s+/)
    .join(' ');
}

// rename comps (assinaturas, exports)...
function renameComps(projId, projName, compArray) {

  var baseName = userPrefix + ' PROMO - ' + projId; // → USER PROMO - ID
  
  for (var a = 0; a < compArray.length; a++) {
    var comp = compArray[a];

    if (!(comp instanceof CompItem)) {
      continue; // is not comp...
    }
    // is comp...
    if (itemSetting(comp, 'export')) {
      // only has the export tag...
      comp.name = [baseName, projName].join(' ');  // → USER PROMO - ID project
    }
    // essential graphics template name...
    var templateName = comp.motionGraphicsTemplateName;

    // try to find the text layer with date and time information...
    try {
      var epService = comp.layer('ctrl_comp')
        .property('ADBE Effect Parade')
        .property('servico end page'); // effect named 'servico end page'...

      var lDate = comp.layer('txt_data e horario')
        .property('ADBE Text Properties')
        .property('ADBE Text Document')
        .value; // date and time text content...
      lDate = formatShortDateAndTime(lDate); // → SHORT DATE TIME
      
      comp.comment = 'export: true'; // export tag...
      // is end page...
      if (templateName == 'end page' || epService != undefined) {
        comp.name = [baseName, 'ep',lDate].join(' '); // → USER PROMO - ID ep SHORT DATE TIME
        continue;
      }
      // is not end page but has date and time information...
      comp.name = [baseName, projName, lDate].join(' ');  // → USER PROMO - ID project SHORT DATE TIME
      continue;
    } catch (error) {}

    for (var l = 1; l <= comp.numLayers; l++) {

      if (!(comp.layer(l).source instanceof CompItem)) {
        continue; // layer is not precomp...
      }
      // layer is precomp...
      var preComp = comp.layer(l).source; // precomp item...
      
      try {
        var essEpService = preComp.layer('ctrl_comp')
          .property('ADBE Effect Parade')
          .property('servico end page'); // effect named 'servico end page'...
        // essential graphics template name...
        templateName = preComp.motionGraphicsTemplateName;

        if (templateName != 'end page' && essEpService  == undefined) {
          continue; // precomp is not end page...
        }
        // precomp is end page...
        // try to find the text layer with date and time information...
        var essDate = preComp.layer('txt_data e horario')
          .property('ADBE Text Properties')
          .property('ADBE Text Document')
          .value; // date and time text content...
        essDate = formatShortDateAndTime(essDate); // → SHORT DATE TIME
        comp.comment = 'export: true'; // export tag...
        comp.name  = [baseName, projName, essDate].join(' '); // → USER PROMO - ID project SHORT DATE TIME
        break;
      } catch(error) {}
    }
  }
}

// returns text layer content...
function textContent(aLayer) {

  if (aLayer == null) return '';
  
  if (!(aLayer instanceof TextLayer)) return '';
  
  return aLayer
    .property('ADBE Text Properties')
    .property('ADBE Text Document')
    .value.toString();
}

// check if layer has effect named 'servico ...'
function hasServiceData(aLayer) {

  if (aLayer == null) {return false;} // no layer...
  
  var pattern = /servico|serviço/i; // regex pattern...

  for (var i = 1; i <= fx.numProperties; i++) {
    var fxName = aLayer
      .property('ADBE Effect Parade')
      .property(i).name; // current effect name...

    if (pattern.test(fxName)) {return true;}  // effect named 'servico' exists...
  }
  return false; // no effect named 'servico name'
}

function nullName(aLayer) {

  var cArray = [];
  var aItem = aLayer.containingComp;
  var lName = aLayer.name;

  for (c = 1; c <= aItem.numLayers; c++) {

    if (aItem.layer(c).parent == aLayer) {
      cArray.push(aItem.layer(c));
    }
  }
  if (cArray.length == 1) {
    lName = cArray[0].name;
  }

  return lName;
}

function adjustmentName(aLayer) {

  var fxNum = aLayer.property('ADBE Effect Parade').numProperties;
  var lName = '';

  if (fxNum > 0) {
    lName = aLayer.property('ADBE Effect Parade').property(1).name;

    for (i = 2; i <= fxNum; i++) {

      if (i < 4) {
        lName += ' | ' + aLayer.property('ADBE Effect Parade').property(i).name;

      } else {
        lName += '...';
        break;
      }
    }
  }

  return lName;
}

function matteName(aLayer) {

  var aItem = aLayer.containingComp;
  var matteName = aItem.layer(aLayer.index + 1).name;
  var lName = matteName;

  return lName;
}

function getPrefixes() {

  return [
    compPrefix,
    solPrefix,
    adjPrefix,
    nullPrefix,
    txtPrefix,
    shpPrefix,
    ctrlPrefix,
    mattePrefix,
    camPrefix,
    lgtPrefix
  ];
}

// rename comp layers...
function renameLayers(compArray) {

  function defaultSet(aLabel, aPrefix) {

    //lLabel = aLabel; // TODO: label system...
    lPrefix = aPrefix;
  }

  var prefixArray = getPrefixes();

  for (i = 0; i < compArray.length; i++) {
    var defaultIncArray = [];
    var aItem = compArray[i];

    for (l = aItem.numLayers; l >= 1; l--) {
      var aLayer = aItem.layer(l);
      var lName = aLayer.name;
      var lLabel = aLayer.label;
      var shpNullChk = false;
      var lLock = (aLayer.locked) ? true : false;
      var lPrefix = '';
      var rename = false;
      aLayer.locked = false;

      switch (true) {
        case(aLayer instanceof TextLayer):
          if (txtTogBtn.value) {
            rename = true;
            lName = textContent(aLayer);
            defaultSet(1, txtPrefix);
          }
          break;

        case(aLayer instanceof ShapeLayer):
          var vGrp = aLayer.property('ADBE Root Vectors Group');

        if (vGrp.numProperties == 0 || vGrp.property(1).name == 'null') {
          shpNullChk = true;
        }
        if (shpTogBtn.value) {
          rename = true;
          defaultIncArray.push(aLayer);
          defaultSet(1, shpPrefix);

          if (shpNullChk) {
            aLayer.guideLayer = true;
            lName = nullName(aLayer);
            defaultSet(1, nullPrefix);
          }
          if (aLayer.adjustmentLayer) {
            lName = adjustmentName(aLayer);
            defaultSet(1, adjPrefix);
          }
          if (aLayer.isTrackMatte) {
            lName = matteName(aLayer);
            defaultSet(1, mattePrefix);
          }
        }
        break;

        case(aLayer instanceof CameraLayer):
          if (camTogBtn.value) {
            rename = true;
            defaultSet(1, camPrefix);
          }
          break;

        case(aLayer instanceof LightLayer):
          if (lgtTogBtn.value) {
            rename = true;
            defaultIncArray.push(aLayer);
            defaultSet(1, lgtPrefix);
          }
          break;

        case(aLayer.source.mainSource instanceof SolidSource):
          if (solTogBtn.value) {
            rename = true;
            defaultSet(1, solPrefix);

            if (aLayer.nullLayer) {
              aLayer.guideLayer = true;
              lName = nullName(aLayer);
              defaultSet(1, nullPrefix);
            }
            if (aLayer.adjustmentLayer) {
              lName = adjustmentName(aLayer);
              defaultSet(1, adjPrefix);
            }
            if (aLayer.isTrackMatte) {
              lName = matteName(aLayer);
              defaultSet(1, mattePrefix);
            }
          }
          break;

        case(aLayer.source.mainSource instanceof FileSource):
          var lSource = aLayer.source;

          if (ftgTogBtn.value && lSource.mainSource.isStill) {

            if (aLayer.adjustmentLayer) {
              rename = true;
              lName = adjustmentName(aLayer);
              defaultSet(1, adjPrefix);
            }
            if (aLayer.isTrackMatte) {
              rename = true;
              lName = matteName(aLayer);
              defaultSet(1, mattePrefix);
            }
          }
          if (ftgTogBtn.value && lSource.hasVideo) {

            if (aLayer.adjustmentLayer) {
              rename = true;
              lName = adjustmentName(aLayer);
              defaultSet(1, adjPrefix);
            }
            if (aLayer.isTrackMatte) {
              rename = true;
              lName = matteName(aLayer);
              defaultSet(1, mattePrefix);
            }
          }
          break;
      }
      if (rename) {

        for (p = 0; p < prefixArray.length; p++) {
          lName = deletePrefix(lName, prefixArray[p]);
        }
        if (aLayer.adjustmentLayer || aLayer.isTrackMatte) {
          lName = lPrefix + lName.toLowerCase();

        } else {
          lName = lPrefix + lName.replaceSpecialCharacters().toLowerCase();
        }
        aLayer.name = lName;
        aLayer.label = lLabel;
      }
      aLayer.locked = lLock;
    }
    defaultNameInc(defaultIncArray);
  }
}

// simple name increment based on the layer stack...
function defaultNameInc(layerArray) {

  for (l = 0; l < layerArray.length; l++) {
    var abcName = layerArray[l].name.replace(/\s*[0-9]+\b/, '');
    layerArray[l].name = abcName;
  }
  for (l = layerArray.length - 1; l >= 0; l--) {
    var nameArray = [];

    for (n = 0; n < layerArray.length; n++) {

      if (layerArray[l].name == layerArray[n].name) {
        nameArray.push(layerArray[l]);
      }
    }
    var num = (nameArray.length > 1) ? ' ' + nameArray.length.toString() : '';
    layerArray[l].name += num;
  }
}

function nameInc(aName) {

  var abcName = aName.replace(/\s*[0-9]+\b/, '');
  var num = aName.match(/\s*[0-9]+\b/);
  var numStr = (num == null) ? 2 : parseInt(num) + 1;

  return abcName + ' ' + numStr.toString();
}

/*

---------------------------------------------------------------
> 🖌️ color and conversions
---------------------------------------------------------------

*/

// converts rgb color to a simple array...
function rgb(r, g, b) {

  r = r / 255;
  g = g / 255;
  b = b / 255;

  return [r, g, b];
}

// converts rgba color to a simple array...
function rgba(r, g, b, a) {

  r = r / 255;
  g = g / 255;
  b = b / 255;
  a = a / 255;

  return [r, g, b, a];
}

function componentToHex(c) {

  var hexStr = c.toString(16);
  hexStr = (hexStr.length == 1) ? "0" + hexStr : hexStr;

  return hexStr;
}

function rgbToHex(rgbArray) {

  r = rgbArray[0] * 255;
  g = rgbArray[1] * 255;
  b = rgbArray[2] * 255;

  return '0x' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function rgbStr(val) {

  if (val.length > 0) {
    val = rgbToHex(val);

  } else if (eval(val).length > 0) {
    val = rgbToHex(eval(val));
  }
  var r = (val >> 16) & 0xFF;
  var g = (val >> 8) & 0xFF;
  var b = (val) & 0xFF;

  return "rgb(" + r + ", " + g + ", " + b + ")";
}

function hexToRGB(hex) {
  
  hex = hex.replace('#', '');
  
  var r = '0x' + hex[0] + hex[1] | 0;
  var g = '0x' + hex[2] + hex[3] | 0;
  var b = '0x' + hex[4] + hex[5] | 0;
  
  return [r/255, g/255, b/255];
}

// returns a random color from de color preferences...
function randomColor() {

  var colorArray = labelColors;
  var r1 = getRndInteger(0, colorArray.length);

  return colorArray[r1];
}

/*

---------------------------------------------------------------
> ⚙️ script preferences
---------------------------------------------------------------

*/

// saves the preferences JSON file...
function savePreferences() {

  var scriptFolder = new Folder(scriptPreferencesPath);

  if (!scriptFolder.exists) {
    scriptFolder.create();
  }
  var fileContent = prefsObj();
  var filePath = scriptPreferencesPath + '/preferences.json';

  return saveFile(fileContent, filePath);
}

// project panel comments as item settings...
function itemSetting(aItem, settingName) {

  var str = aItem.comment;
  var n1 = str.search(settingName);
  var set = 'false';

  if (str != '' && n1 != -1) {
    var n2 = n1 + settingName.length + 2;
    set = str.substring(n2, n2 + str.length);
  }
  return eval(set);
}

function saveFile(fileContent, filePath) {

  var newFile = new File(filePath);

  newFile.open('w');
  newFile.write(fileContent);
  newFile.close();

  return newFile;
}

function readFile(file) {

  var fileContent;

  file.open('r');
  fileContent = file.read();
  file.close();

  return fileContent;
}

// creates the preferences obj in a JSON formatted string...
function prefsObj() {

  var objStr = '';
  objStr += '{\n';
  objStr += '\t"color":{';

  // formats all the tab colors...
  for (i = 0; i < grpNames.length; i++) {
    var c = rgbToHex(tabColors[i]).replace('0x', '#').toUpperCase();
    objStr += '\n\t\t"' + grpNames[i] + '":"' + c + '",';
  }
  // removes the last ','...
  objStr = objStr.substring(0, objStr.length-1);
  objStr += '\n\t},\n\n';
  objStr += '\t"label":{';

  // formats all the label colors...
  for (i = 0; i < labelColors.length; i++) {
    var l = rgbToHex(labelColors[i]).replace('0x', '#').toUpperCase(); 
    objStr += '\n\t\t"l' + (i + 1) + '":"' + l + '",';
  }
  objStr = objStr.substring(0, objStr.length-1);
  objStr += '\n\t},\n\n';

  // folder paths...
  objStr += '\t"folders":{\n';
  objStr += '\t\t"artePath":"' +   artePath + '",\n';
  objStr += '\t\t"magazinePath":"' +   magazinePath + '"\n';
  objStr += '\n\t},\n\n';

  // preferences dropdown selections...
  objStr += '\t"selection":{\n';
  objStr += '\t\t"layerType":' +   layerType + ',\n';
  objStr += '\t\t"projectModel":' +   projectModel + '\n';
  objStr += '\n\t},\n\n';

  // user prefix...
  objStr += '\t"userPrefix":"' +  userPrefix.toUpperCase() + '"\n';
  objStr += '\t"homeOffice":"' +  homeOffice + '"\n';
  objStr += '}';

  return objStr;
}

function fxObj(fx) {

  var obj = {};

  for (var p = 1; p <= fx.numProperties; p++) {

    try {
      var prop = fx.property(p);
      var keyName = prop.name
        .replaceSpecialCharacters()
        .replace(/\s/g, '_');
      var val = prop.value;

      if (val == undefined) {continue;}
      
      if (Array.isArray(val)) {
        
        if (val.length == 4) {
          val = rgbToHex(val)
            .replace('0x', '#')
            .toUpperCase();
        }
      }

      obj[keyName] = val;
    } catch (error) {}
  }
  return obj;
}

function buildFxObj(){

  var aItem = app.project.activeItem;
  var obj = {};
  
  try {
    var cFx = aItem.layer('ctrl_comp')
      .property('ADBE Effect Parade');

    for (var f = 1; f <= cFx.numProperties; f++) {

      var fx = cFx.property(f);
      var keyName = fx.name
        .replaceSpecialCharacters()
        .replace(/\s/g, '_');

      obj[keyName] = fxObj(fx);
    }
  } catch (error) {}

  return obj;
}

// populate dropdownlists...
function populateDropdownList(array, dropdown) {

  for (var i = 0; i < array.length; i++) {
    dropdown.add('item', array[i]);
  }
}

function defaultEndPageObj(obj) {

  var defObj = {
    layout_end_page: {
      modelo: 1,
      subtitulo: true,
      footage: true,
      foto: false,
      foto_layer: '-------',
      pattern: true,
      pattern_layer: '-------',
    },
    servico_end_page: {
      titulo: 'Digite O Título Aqui',
      subtitulo: 'SUBTÍTULO',
      formato: 4,
      semana: 8,
      dia: 10,
      mes: 0,
      hora: 16,
      min: 0,
    },
    aparencia_end_page: {
      tema: 4,
      logo: '#141414',
      titulo: '#F2F2F2',
      subtitulo: '#F2F2F2',
      apoio: '#F2F2F2',
      horario: '#141414',
      horario_base: '#ECFF8C',
      footage: '#141414',
      pattern: '#141414',
      fundo: '#E53131',
    },
  };
  if (obj.layout_end_page == undefined) {obj.layout_end_page = {};}
  
  for (var l in defObj.layout_end_page) {

    if (!obj.layout_end_page.hasOwnProperty(l)) {
      obj.layout_end_page[l] = defObj.layout_end_page[l];
    }
  }

  if (obj.servico_end_page == undefined) {obj.servico_end_page = {};}
  
  for (var s in defObj.servico_end_page) {

    if (!obj.servico_end_page.hasOwnProperty(s)) {
      obj.servico_end_page[s] = defObj.servico_end_page[s];
    }
  }

  if (obj.aparencia_end_page == undefined) {obj.aparencia_end_page = {};}

  for (var a in defObj.layout_end_page) {

    if (!obj.aparencia_end_page.hasOwnProperty(a)) {
      obj.aparencia_end_page[a] = defObj.aparencia_end_page[a];
    }
  }

  return obj;
}

// TODO: loop formatting...
// creates the preferences obj in a JSON formatted string...
function endPageObjToString(obj) {

  obj = defaultEndPageObj(obj);
  var layout = obj.layout_end_page;
  var servico = obj.servico_end_page;
  var aparencia = obj.aparencia_end_page;
  var objStr = '{\
\t"layout_end_page":{\
\t\t"modelo":' + layout.modelo.toString() + ',\
\t\t"subtitulo":' + Boolean(layout.subtitulo).toString() + ',\
\t\t"footage":' + Boolean(layout.footage).toString() + ',\
\t\t"foto":' + Boolean(layout.foto).toString() + ',\
\t\t"foto_layer":"' + layout.foto_layer.toString() + '",\
\t\t"pattern":' + Boolean(layout.pattern).toString() + ',\
\t\t"pattern_layer":"' + layout.pattern_layer.toString() + '"\
\t},\n\
\t"servico_end_page":{\
\t\t"titulo":"' + servico.titulo.toString().replace(/\n|\r/g, '\\n') + '",\
\t\t"subtitulo":"' + servico.subtitulo.toString().replace(/\n|\r/g, '\\n') + '",\
\t\t"formato":' + servico.formato.toString() + ',\
\t\t"semana":' + servico.semana.toString() + ',\
\t\t"dia":' + servico.dia.toString() + ',\
\t\t"mes":' + servico.mes.toString() + ',\
\t\t"hora":' + servico.hora.toString() + ',\
\t\t"min":' + servico.min.toString() + '\
\t},\n\
\t"aparencia_end_page":{\
\t\t"tema":' + aparencia.tema.toString() + ',\
\t\t"logo":"' + aparencia.logo.toString() + '",\
\t\t"titulo":"' + aparencia.titulo.toString() + '",\
\t\t"subtitulo":"' + aparencia.subtitulo.toString() + '",\
\t\t"apoio":"' + aparencia.apoio.toString() + '",\
\t\t"horario":"' + aparencia.horario.toString() + '",\
\t\t"horario_base":"' + aparencia.horario_base.toString() + '",\
\t\t"footage":"' + aparencia.footage.toString() + '",\
\t\t"pattern":"' + aparencia.pattern.toString() + '",\
\t\t"fundo":"' + aparencia.fundo.toString() + '"\
\t}\
}';

  return objStr;
}

function removeFolder(folder){

  var files = folder.getFiles();

  for (var n = 0; n < files.length; n++){
    
    if (files[n] instanceof File) {
      files[n].remove();
    
    } else {
      removeFolder(files[n]);
    } 
  }
  folder.remove();
}


/*

---------------------------------------------------------------
> 🌳 tree view functions
---------------------------------------------------------------

*/

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

// TODO: include source text keyframes...
// TODO: compensate the ALL CAPS toggle...
// TODO: RegEx search...
// TODO: limit play head movement to expressions and keyframes...

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

function limitNameSize(name, limit) {

  var limit1 = (limit / 2) - 5;
  var limit2 = name.length - (limit / 2);

  var name1 = name.substring(0, limit1);
  var name2 = name.substring(limit2, name.length);

  name = name.length < limit ? name : name1 + '...' + name2;

  return name;
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

/*

---------------------------------------------------------------
> 📃 script metadata
---------------------------------------------------------------

*/

function getXMPdata(XMPfield) {

  var metaData = new XMPMeta(app.project.xmpPacket);
  var XMPSet = XMPConst.NS_DC;
  var XMPVal = '';
  var XMPProp = metaData.getProperty(XMPSet, XMPfield);

  if(XMPProp != undefined) {
    XMPVal = XMPProp.value;
  }

  return XMPVal;
}

function setXMPdata(XMPfield, XMPval) {

  var metaData = new XMPMeta(app.project.xmpPacket);
  var XMPSet = XMPConst.NS_DC;
  var XMPProp = metaData.doesPropertyExist(XMPSet, XMPfield);

  metaData.deleteProperty(XMPSet, XMPfield);
  metaData.setProperty(XMPSet, XMPfield, XMPval);

  app.project.xmpPacket = metaData.serialize();
}
