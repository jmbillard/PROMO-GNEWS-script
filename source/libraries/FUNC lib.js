/*

---------------------------------------------------------------
# general functions
---------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061
//  jshint -W085
//  jshint -W043


/* jshint ignore:start */
#include 'functions/color lib.js'; // global variables...
#include 'functions/ctrl anim lib.js'; // global variables...
#include 'functions/file system lib.js'; // global variables...
#include 'functions/layers lib.js'; // global variables...
#include 'functions/math num lib.js'; // global variables...
#include 'functions/string lib.js'; // global variables...
#include 'functions/treeView lib.js'; // global variables...
#include 'functions/metadata lib.js'; // global variables...
/* jshint ignore:end */


function executeCommandID(command) {
  app.executeCommand(app.findMenuCommandId(command));
}


// gets the current value for the network permission preference...
function netAccess() {
  return app.preferences.getPrefAsLong(prefSection, prefName);
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

/*

---------------------------------------------------------------
> string functions
---------------------------------------------------------------

*/



// breaks text based on a character limit...
function lineBreak(selLayer, inputLimit) {

  inputLimit = Math.floor(inputLimit);

  if (selLayer instanceof TextLayer) {

    var srcTxt = selLayer
      .property('ADBE Text Properties')
      .property('ADBE Text Document');
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

  var compArray = getComps();

  for (var i = 0; i < compArray.length; i++) {
    var comp = compArray[i];
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
      } catch (error) { }
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
function projectTemplate(projectMode) {

  var rndFolder; // render folder...
  var ftgFolder; // footage folder...
  var imgFolder; // images folder...
  var snoFolder; // sounds folder...
  var solFolder; // solids folder...
  var compsFolder; // precomps folder...
  var astFolder; // assets folder...
  var edtFolder; // editable assets folder...

  switch (projectMode) {
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

function populateFolders(projectMode) {

  var comps = getCompsAndTemplates(); // all project comps and templates...
  var footage = getFootage(); // all project footage...
  var folders = projectTemplate(projectMode); // project folder structure...
  
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
      comp.parentFolder = compsFolder; // → comps folder
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
      } catch (error) { }

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

// rename comps (assinaturas, exports)...
function renameComps(projId, projName, compArray) {

  var baseName = userPrefix + ' PROMO - ' + projId; // → USER PROMO - ID
  for (var a = 0; a < compArray.length; a++) {
    var comp = compArray[a];
    
    if (!(comp instanceof CompItem)) continue; // is not comp...
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
        comp.name = [baseName, 'ep', lDate].join(' '); // → USER PROMO - ID ep SHORT DATE TIME
        continue;
      }
      // is not end page but has date and time information...
      comp.name = [baseName, projName, lDate].join(' ');  // → USER PROMO - ID project SHORT DATE TIME
      continue;
    } catch (error) { }
    
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

        if (templateName != 'end page' && essEpService == undefined) {
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
        comp.name = [baseName, projName, essDate].join(' '); // → USER PROMO - ID project SHORT DATE TIME
        break;
      } catch (error) { }
    }
  }
}

// check if layer has effect named 'servico ...'
function hasServiceData(aLayer) {

  if (aLayer == null) { return false; } // no layer...

  var pattern = /servico|serviço/i; // regex pattern...

  for (var i = 1; i <= fx.numProperties; i++) {
    var fxName = aLayer
      .property('ADBE Effect Parade')
      .property(i).name; // current effect name...

    if (pattern.test(fxName)) { return true; }  // effect named 'servico' exists...
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

// [ ] prefixes - loop settings obj...
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

// [ ] broken layer names...
// rename comp layers...
function renameLayers(compArray) {

  function defaultSet(aLabel, aPrefix) {

    //lLabel = aLabel;
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
        case (aLayer instanceof TextLayer):
          if (txtTogBtn.value) {
            rename = true;
            lName = textContent(aLayer);
            defaultSet(1, txtPrefix);
          }
          break;

        case (aLayer instanceof ShapeLayer):
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

        case (aLayer instanceof CameraLayer):
          if (camTogBtn.value) {
            rename = true;
            defaultSet(1, camPrefix);
          }
          break;

        case (aLayer instanceof LightLayer):
          if (lgtTogBtn.value) {
            rename = true;
            defaultIncArray.push(aLayer);
            defaultSet(1, lgtPrefix);
          }
          break;

        case (aLayer.source.mainSource instanceof SolidSource):
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

        case (aLayer.source.mainSource instanceof FileSource):
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
function savePrefs() {

  var scriptFolder = new Folder(scriptPreferencesPath);

  if (!scriptFolder.exists) {
    scriptFolder.create();
  }
  var fileContent = JSON.stringify(JSONPrefsObj, null, "\t");
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

function fxObj(fx) {

  var obj = {};

  for (var p = 1; p <= fx.numProperties; p++) {

    try {
      var prop = fx.property(p);
      var keyName = prop.name
        .replaceSpecialCharacters()
        .replace(/\s/g, '_');
      var val = prop.value;

      if (val == undefined) { continue; }

      if (Array.isArray(val)) {

        if (val.length == 4) {
          val = rgbToHex(val)
            .replace('0x', '#')
            .toUpperCase();
        }
      }

      obj[keyName] = val;
    } catch (error) { }
  }
  return obj;
}

function buildFxObj() {

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
  } catch (error) { }

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
  if (obj.layout_end_page == undefined) { obj.layout_end_page = {}; }

  for (var l in defObj.layout_end_page) {

    if (!obj.layout_end_page.hasOwnProperty(l)) {
      obj.layout_end_page[l] = defObj.layout_end_page[l];
    }
  }

  if (obj.servico_end_page == undefined) { obj.servico_end_page = {}; }

  for (var s in defObj.servico_end_page) {

    if (!obj.servico_end_page.hasOwnProperty(s)) {
      obj.servico_end_page[s] = defObj.servico_end_page[s];
    }
  }

  if (obj.aparencia_end_page == undefined) { obj.aparencia_end_page = {}; }

  for (var a in defObj.layout_end_page) {

    if (!obj.aparencia_end_page.hasOwnProperty(a)) {
      obj.aparencia_end_page[a] = defObj.aparencia_end_page[a];
    }
  }

  return obj;
}