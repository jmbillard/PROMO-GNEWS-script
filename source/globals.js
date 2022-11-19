/*

---------------------------------------------------------------
# main variables
---------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061
//  jshint -W085
//  jshint -W043


// current script version...
var vStr = 'v 1.9 beta 4';

// current OS... 'Win' or 'Mac'...
var appOs = $.os.indexOf('Win') >= 0 ? 'Win' : 'Mac';

// app version
var appV = parseInt(app.buildName.substring(0, 2));

// app script network access preferences...
var prefSection = 'Main Pref Section';
var prefName = 'Pref_SCRIPTING_FILE_NETWORK_SECURITY';
var netConfigName = '"Allow Scripts to Write Files and Access Network"';


// GLOBO network
// GLOBO addresses
var mamAdd = '//10.181.53.152';
var nAdd = '//10.197.18.172/arte';
// network paths...
var hnPath = mamAdd + '/arte_ilhasjorn/UPLOAD_MAM/Hardnews_MAM'; // MAM hard news
var utiPath = nAdd + '/UTILIDADES'; // art utilities and assets...
var promoInsPath = utiPath + '/FERRAMENTAS/SCRIPTS/SCRIPTS AFX/BARRA UTILIDADES PROMO PARA INSTALAR'; // promo toolbar install path...
var promoArcPath = nAdd + '/arquivamento/GLOBONEWS/On Air 2022/Promo'; // promo archive path...
var templatesArchPath = promoArcPath + '/templates';
var fontsArchPath = promoArcPath + '/fonts';


// preferences folder path...
var scriptPreferencesPath = Folder.userData.toString() + '/PROMO GNEWS script'; // → ~/AppData/Roaming/PROMO GNEWS script
var downPath = scriptPreferencesPath + '/temp'; // → '~/AppData/Roaming/PROMO GNEWS script/temp'
var templatesLocalPath = scriptPreferencesPath + '/templates'; // → '~/AppData/Roaming/PROMO GNEWS script/templates'
var fontsLocalPath = scriptPreferencesPath + '/fonts';


/* jshint ignore:start */
// libraries...
#include 'libraries/JSON lib.js'; // JSON definition file...
#include 'libraries/FUNC lib.js'; // general functions definition file...
#include 'libraries/PROT lib.js'; // prototype functions definition file...
#include 'libraries/EXPS lib.js'; // expressions library...
#include 'libraries/ICON lib.js'; // images encoded as binary...
/* jshint ignore:end */


// github main repo...
var repoURL = 'https://github.com/jmbillard/PROMO-GNEWS-script';
var codeURL = 'https://raw.githubusercontent.com/jmbillard/PROMO-GNEWS-script/main/';

var codeURLArray = [
  codeURL + 'release/PROMO%20GNEWS.jsxbin'//, // → .jsxbin binary encoded release...
];


// GNEWS on-air 2022 colors...
var GNEWS_mainColors = [
  rgb(229, 49, 49), // '#e52f2e' red...
  rgb(238, 255, 140), // '#ecff8c' yellow...
  rgb(242, 242, 242), // '#f2f2f2' white...
  rgb(20, 20, 20), // '#141414' black...
  rgb(35, 30, 30), // '#221e1d' dark gray...
  rgb(51, 51, 51), // '#333333' dark gray...
  rgb(74, 74, 74), // '#4a4a4a' medium gray...
  rgb(178, 178, 178), // '#b2b2b2' light gray...
];
var GNEWS_secColors = [
  rgb(242, 51, 51), // '#f13333'
  rgb(255, 77, 77), // '#ff4d4d'
  rgb(255, 103, 77), // '#fe674c'
  rgb(255, 143, 77), // '#ff8f4d'
  rgb(255, 196, 78), // '#ffc44e'
  rgb(255, 90, 103), // '#ff5a68'
  rgb(255, 115, 154), // '#ff739a'
  rgb(255, 140, 205), // '#ff8ccd'
  rgb(181, 173, 255), // '#b5adff'
  rgb(128, 192, 255), // '#80c0fe'
  rgb(92, 230, 161), // '#5de6a2'
];


function loadStaticPrefs() {
  // item prefixes...
  compPrefix = 'comp_';
  solPrefix = 'sol_';

  // layer prefixes...
  nullPrefix = 'null_';
  adjPrefix = 'adj_';
  txtPrefix = 'txt_';
  shpPrefix = 'shp_';
  camPrefix = 'cam_';
  lgtPrefix = 'lgt_';
  ctrlPrefix = 'ctrl_';
  mattePrefix = 'matte_';

  prefGrpColor = rgb(35, 35, 35);
  errGrpColor = rgb(20, 20, 20);

  // static text colors (UI)...
  sTxtColor = rgb(234, 234, 234);
  errTxtColor = rgb(140, 0, 51);
  aboutTxtColor = rgb(80, 80, 80);
}

// preferences management...
//https://coolors.co/8c252f-bf3a48-cb6259-d68a69-c2b6a3-db9437-6ea57d-00b5c2-5f3691-6e489b
function loadDefaultPrefs() {

  // default values...
  var defPrefs = {
    'color': {
      'menu': '#3E50B4',
      'ctrl': '#BF3A48',
      'animation': '#CB6259',
      'tools': '#6EA57D',
      'fx': '#D68A69',
      'text': '#C2B6A3',
      'guide': '#202020',
      'project': '#00B5C2',
      'links': '#DB9437',
      'app': '#5F3691',
      'dev': '#202020',
    },
    'labels': [
      '#F44336',
      '#E81D62',
      '#9B26AF',
      '#6639B6',
      '#3E50B4',
      '#02A8F3',
      '#00BBD3',
      '#009587',
      '#8AC249',
      '#CCDB38',
      '#FEEA3A',
      '#FE9700',
      '#FF5722',
      '#785447',
      '#9D9D9D',
      '#5F7C8A'
    ],
    'folders': {
      'artePath': '//10.181.53.152/arte_ilhasjorn/PARA ARTE/PROMO GNEWS/MXF ARTE',
      'magazinePath': '//10.181.53.152/arte_ilhasjorn/UPLOAD_MAM/Magazine'
    },
    'selection': {
      'layerType': 0,
      'projectMode': 0
    },
    'userPrefix': system.userName.substring(0, 3).toUpperCase(),
    'homeOffice': true
  };

  // ui colors, labels and group names...
  tabColors = [];
  labelColors = [];
  grpNames = [];

  JSONObj = {};
  // loads all configurable preferences...
  var JSONFile = new File(scriptPreferencesPath + '/preferences.json');

  // loads the current saved preferences...
  if (JSONFile.exists) {
    var JSONContent = readFile(JSONFile); // → JSON string

    try {
      // evaluate JSON content...
      JSONObj = JSON.parse(JSONContent); // → preferencesObject
    } catch (error) {
      // error: invalid JSON content...
      alert('preferences failed to load... Σ(っ °Д °;)っ');
    }
  }
  // main properties...
  for (var o in defPrefs) {
    // check saved preferences...
    if (JSONObj.hasOwnProperty(o)) continue; // main property exists...
    JSONObj[o] = defPrefs[o]; // use default main property value...
  }
  // tab names and colors...
  for (var t in defPrefs.color) {
    // check color preferences...
    if (!JSONObj.color.hasOwnProperty(t)) { // color is missing...
      JSONObj.color[t] = defPrefs.color[t]; // use default color...
    }
    // populate names array and colors...
    grpNames.push(t.toString());
    tabColors.push(hexToRGB(JSONObj.color[t]));
  }
  // labels...
  for (var l = 0; l < defPrefs.labels.length; l++) {

    try {
      // populate labels array...
      labelColors.push(hexToRGB(JSONObj.labels[l]));

    } catch (error) {
      // error: missing labels or invalid data...
      labelColors.push(hexToRGB(defPrefs.labels[l]));
    }
  }
  // folders paths...
  for (var f in defPrefs.folders) {
    // check folder preferences...
    if (JSONObj.folders.hasOwnProperty(f)) continue; // folder path exists...
    JSONObj.folders[f] = defPrefs.folders[f]; // use default path...
  }
  for (var s in defPrefs.selection) {
    // check selection preferences...
    if (JSONObj.selection.hasOwnProperty(s)) continue; // dropdown selection exists...
    JSONObj.selection[s] = defPrefs.selection[s]; // use default selection...
  }
  // folder paths...
  artePath = JSONObj.folders.artePath; // global arte path...
  magazinePath = JSONObj.folders.magazinePath; // global magazine path...
  // selections...
  layerType = JSONObj.selection.layerType; // global layer type selection...
  projectMode = JSONObj.selection.projectMode; // global project model selection...
}

// about and 'work in progress' messages...
var aboutStr = 'PROMO GNEWS script ' + vStr + ' | Jean-Marc Billard';
var wip = 'work in progress... Σ(っ °Д °;)っ';

// keyframe images...
var keyImgs = [
  keyStat0Icon,
  keyStat1Icon,
  keyStat2Icon,
  keyStat3Icon,
  keyStat4Icon,
  keyStat5Icon,
  keyStat6Icon,
  keyStat7Icon,
  keyStat8Icon,
  keyStat9Icon
];
// keyframe influence data...
var keyData = {
  value: false,
  spatial: false,
  inEase: {},
  inType: {},
  outEase: {},
  outType: {},
};

// use globo network folders
var GLOBO_ACCESS = false;

// final paths...
var templatesPath = GLOBO_ACCESS ? templatesArchPath : templatesLocalPath; // → templates folder object
var fontsPath = GLOBO_ACCESS ? fontsArchPath : fontsLocalPath; // → templates folder object
// folders...
var templatesFolder = Folder(templatesPath); // → templates folder object
var downFolder = Folder(downPath); // → download folder object
var fontsFolder = Folder(fontsPath); // → fonts folder object