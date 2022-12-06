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

  if (!(selLayer instanceof TextLayer)) return;

  var srcTxt = selLayer
    .property('ADBE Text Properties')
    .property('ADBE Text Document');
  var txt = textContent(selLayer)
    .replace(/\s/g, ' ');
  var txt2 = '';
  var wordsArray = txt.split(/\s/);

  for (var i = 0; i < wordsArray.length; i++) {
    var letterCount = wordsArray[i].length;

    if (letterCount >= inputLimit) {
      inputLimit = letterCount + 1;
    }
  }
  while (txt.length > inputLimit) {

    for (var t = inputLimit; t > 0; t--) {

      if (txt[t] != ' ') continue;

      txt2 += txt
        .substring(0, t) + '\n';
      txt = txt
        .substring(t + 1, txt.length)
        .trim();
      break;
    }
  }
  srcTxt.setValue(txt2 + txt);
}

/*

---------------------------------------------------------------
> 🗃️ project organization and renaming
---------------------------------------------------------------

*/

// moves every project item to root folder...
function deleteProjectFolders() {

  for (i = app.project.numItems; i >= 1; i--) {
    var rFolder = app.project.rootFolder; // project root folder...
    var aItem = app.project.item(i);

    // is not project folder...
    if (!(aItem instanceof FolderItem)) continue;

    // is project folder...
    while (aItem.numItems > 0) {
      aItem.item(1).parentFolder = rFolder;
    }
  }
  deleteEmptyProjectFolders();
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
      if (!(comp.layer(l).source instanceof CompItem)) break; // layer is not comp...

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

  var footage = {
    stillArray: [],
    videoArray: [],
    sonoArray: [],
    solidArray: [],
    missingArray: []
  };

  for (i = app.project.numItems; i >= 1; i--) {
    var aItem = app.project.item(i);

    if (!(aItem instanceof FootageItem)) continue;

    if (aItem.footageMissing) {
      footage.missingArray.push(aItem.name);
      continue;
    }
    if (aItem.mainSource instanceof SolidSource) {
      footage.solidArray.push(aItem);
      continue;
    }
    if (!(aItem.mainSource instanceof FileSource)) continue;

    if (aItem.mainSource.isStill) {
      footage.stillArray.push(aItem);
      continue;
    }
    if (aItem.hasVideo) {
      footage.videoArray.push(aItem);
      continue;
    }
    footage.sonoArray.push(aItem);
  }
  return footage;
}

// creates the project folder structure...
function projectTemplateFolders(projectMode) {

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

function populateProjectFolders() {

  var comps = getCompsAndTemplates(); // all project comps and templates...
  var footage = getFootage(); // all project footage...
  var folders = projectTemplateFolders(projectMode); // project folder structure...

  var stl = footage.stillArray; // images...
  var pht; // photos...
  var bg; // backgrounds...
  var ref; // references...
  var lgo; // logos...
  var ico; // icons...
  var tex; // textures...

  var ftg = footage.videoArray; // videos...

  var sno = footage.sonoArray; // sounds...
  var loc; // voice over...
  var mus; // music...

  var sol = footage.solidArray; // solids...

  var mis = footage.missingArray; // missing footage...

  var rndFolder = folders[0]; // render folder...
  var ftgFolder = folders[1]; // footage folder...
  var imgFolder = folders[2]; // images folder...
  var snoFolder = folders[3]; // sounds folder...
  var solFolder = folders[4]; // solids folder...
  var compsFolder = folders[5]; // comps folder...
  var edtFolder = folders[6]; // editable assets folder...
  var epFolder = folders[7]; // end page folder...


  for (var c = 0; c < comps.length; c++) {
    var comp = comps[c];
    // essential graphics template name...
    var templateName = comp.motionGraphicsTemplateName;

    comp.parentFolder = compsFolder; // → comps folder

    if (itemSetting(comp, 'export')) comp.parentFolder = rndFolder; // → render folder
    if (itemSetting(comp, 'edit')) comp.parentFolder = edtFolder; // → edit folder

    if (itemSetting(comp, 'loc')) {
      if (loc == undefined) {
        loc = app.project.items.addFolder('loc'); // → new voice over folder
        loc.parentFolder = snoFolder; // subfolder...
      }
      comp.parentFolder = loc;
    }
    if (itemSetting(comp, 'music')) {
      if (mus == undefined) {
        mus = app.project.items.addFolder('music'); // → new music folder
        mus.parentFolder = snoFolder; // subfolder...
      }
      comp.parentFolder = mus;
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

    if (templateName == 'Untitled') continue;
    if (itemSetting(comp, 'ignore')) continue;
    if (itemSetting(comp, 'edit')) continue;
    // comp is not a named template...

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
  for (var sl = 0; sl < sol.length; sl++) {
    sol[sl].parentFolder = solFolder;
  }
  var missingStr = '';

  for (var m = 0; m < mis.length; m++) {
    missingStr += '\n    ' + mis[m];
  }
  if (missingStr != '') alert('some files are missing:' + missingStr);
}

// removes project folders with 0 itens...
function deleteEmptyProjectFolders() {

  for (var i = app.project.numItems; i >= 1; i--) {
    var aItem = app.project.item(i);

    if (!(aItem instanceof FolderItem)) continue;
    if (aItem.numItems == 0) aItem.remove();
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

      var lDate = textContent(comp.layer('txt_data e horario')); // date and time text content...
      lDate = formatShortDateAndTime(lDate); // → SHORT DATE TIME

      comp.comment = 'export: true'; // export tag...
      // is end page...
      if (templateName == 'end page' || epService != undefined) {
        comp.name = [baseName, 'ep', lDate].join(' '); // → USER PROMO - ID ep SHORT DATE TIME
        continue;
      }
      // is not end page but has date and time information...
      comp.name = [baseName, projName, lDate].join(' ');  // → USER PROMO - ID project SHORT DATE TIME
    } catch (error) { }

    for (var l = 1; l <= comp.numLayers; l++) {

      if (!(comp.layer(l).source instanceof CompItem)) continue; // layer is not precomp...

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
        var essDate = textContent(preComp.layer('txt_data e horario')); // date and time text content...
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

  if (aLayer == null) return false; // no layer...

  var pattern = /servico|serviço/i; // regex pattern...

  for (var i = 1; i <= fx.numProperties; i++) {
    var fxName = aLayer
      .property('ADBE Effect Parade')
      .property(i).name; // current effect name...

    if (pattern.test(fxName)) return true;  // effect named 'servico' exists...
  }
  return false; // no effect named 'servico name'
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

  return saveTextFile(fileContent, filePath);
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

      if (val == undefined) continue;

      if (Array.isArray(val) && val.length > 3) val = rgbToHEX(val);

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
      logo: true,
      titulo: true,
      auto_title_case: true,
      subtitulo: true,
      data_e_horario: true,
      apoio: false,
      foto: false,
      footage: true,
      pattern: true,
      foto_layer: '-------',
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
  if (obj.layout_end_page == undefined) obj.layout_end_page = {};

  for (var l in defObj.layout_end_page) {

    if (!obj.layout_end_page.hasOwnProperty(l)) {
      obj.layout_end_page[l] = defObj.layout_end_page[l];
    } else {
      if (typeof defObj.layout_end_page[l] == 'boolean') {
        obj.layout_end_page[l] = Boolean(obj.layout_end_page[l]);
      }
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