/* ---------------------------------------------------------------
> script main ui
--------------------------------------------------------------- */
//  linter settings:
//  jshint -W061
//  jscs:disable maximumLineLength

function PROMO_GNEWS_UI() {

  /* jshint ignore:start */
  #include 'utils/input ui.js'; // import templates ui file...
  #include 'utils/prefs ui.js'; // import templates ui file...
  #include 'utils/template ui.js'; // import templates ui file...
  #include 'utils/tag ui.js'; // organization tags ui file...
  #include 'utils/endPagePreset ui.js'; // end page presets ui file...
  #include 'utils/fonts ui.js'; // end page presets ui file...
  #include 'utils/find ui.js'; // end page presets ui file...
  #include 'utils/bin ui.js'; // end page presets ui file...

  #include 'main ui functions.js'; // ui and layout functions...
  /* jshint ignore:end */

  // defines the window object...
  var w = {};

  if (thisObj instanceof Panel) {
    w = thisObj;

  } else {
    w = new Window('palette', 'PROMO GNEWS', undefined);
  }

  w.spacing = 0;
  w.margins = 0;
  w.orientation = 'fill';

  /*

  ---------------------------------------------------------------
  > 📁 tabs and groups
  ---------------------------------------------------------------

  */

  // UI main 'root' centered group...
  var mainGrp = w.add('group');
  mainGrp.alignment = 'center';
  mainGrp.orientation = 'stack';

  // left group...
  var leftGrp = w.add('group');
  leftGrp.alignment = 'left';
  leftGrp.orientation = 'stack';

  // right group...
  var rightGrp = w.add('group');
  rightGrp.alignment = 'right';
  rightGrp.orientation = 'stack';

  //---------------------------------------------------------

  // tab menu group...
  var tabsGrp = mainGrp.add('group');
  tabsGrp.alignment = 'center';
  tabsGrp.orientation = 'stack';

  // add, center and hide every tab from the group names 'array' inside the 'root'...
  for (i = 0; i < grpNames.length; i++) {
    var grp = tabsGrp.add('group', undefined, { name: grpNames[i] });
    grp.alignment = 'center';
    grp.visible = false;
  }

  // error tab group...
  var errTabGrp = mainGrp.add('group');
  errTabGrp.visible = false;

  // progress tab group...
  var progressGrp = mainGrp.add('group');
  progressGrp.visible = false;

  // close button group...
  var closeGrp = rightGrp.add('group');
  closeGrp.orientation = 'stack';
  closeGrp.visible = false;

  // preferences button group...
  var prefGrp = rightGrp.add('group');
  prefGrp.orientation = 'stack';
  var prefBtn = prefGrp.add('iconbutton', undefined, setIcon, { name: 'btn', style: 'toolbutton' });
  prefBtn.helpTip = 'script preferences';

  /*

  ---------------------------------------------------------------
  > images
  ---------------------------------------------------------------

  */

  // logo image group...
  var imgGrp = leftGrp.add('group');
  imgGrp.spacing = 0;
  var GNEWS_LOGO = imgGrp.add('image', undefined, GNEWS_LOGO_IMG);
  GNEWS_LOGO.helpTip = aboutStr;
  GNEWS_LOGO.maximumSize.width = 70;

  var infoGrp = imgGrp.add('group');
  infoGrp.orientation = 'stack';

  var aboutTxt = infoGrp.add('statictext', undefined, vStr);
  aboutTxt.justify = 'center';
  aboutTxt.helpTip = aboutStr;
  setTxtColor(aboutTxt, sTxtColor);

  var infoBtn = infoGrp.add('iconbutton', undefined, infoIcon, { name: 'btn', style: 'toolbutton' });
  infoBtn.size = [12, 12];
  infoBtn.helpTip = 'Help | README';
  infoBtn.visible = false;

  // progress image group...
  var progImgGrp = leftGrp.add('group');
  progImgGrp.helpTip = aboutStr;
  progImgGrp.maximumSize.width = 70;
  progImgGrp.visible = false;

  var progImg = progImgGrp.add('image', undefined, keepCalmIcon);

  /*

  ---------------------------------------------------------------
  > 📟 main menu
  ---------------------------------------------------------------

  */
  var currentGrp = tabsGrp.menu;
  var mnuSubGrp1 = currentGrp.add('group');

  // control tab button...
  var ctrlBtn = mnuSubGrp1.add('iconbutton', undefined, ctrlIcon, { name: 'btn', style: 'toolbutton' });
  ctrlBtn.helpTip = 'null and controls';

  // animation tab button...
  var animBtn = mnuSubGrp1.add('iconbutton', undefined, animIcon, { name: 'btn', style: 'toolbutton' });
  animBtn.helpTip = 'animation';

  // effects tab button...
  var fxBtn = mnuSubGrp1.add('iconbutton', undefined, fxIcon, { name: 'btn', style: 'toolbutton' });
  fxBtn.helpTip = 'effects';

  // text tab button...
  var txtBtn = mnuSubGrp1.add('iconbutton', undefined, txtTitleIcon, { name: 'btn', style: 'toolbutton' });
  txtBtn.helpTip = 'text case and line breaking';

  // pallet tab button...
  var guideBtn = mnuSubGrp1.add('iconbutton', undefined, guideIcon, { name: 'btn', style: 'toolbutton' });
  guideBtn.helpTip = 'color, guides and branding';

  // project tab button...
  var projBtn = mnuSubGrp1.add('iconbutton', undefined, toolsIcon, { name: 'btn', style: 'toolbutton' });
  projBtn.helpTip = 'project organization';

  //---------------------------------------------------------

  currentGrp.add('image', undefined, vSpacer, { name: 'div' });

  // links tab button...
  var linksBtn = currentGrp.add('iconbutton', undefined, linksIcon, { name: 'btn', style: 'toolbutton' });
  linksBtn.helpTip = 'useful links';

  //---------------------------------------------------------

  currentGrp.add('image', undefined, vSpacer, { name: 'div' });
  var mnuSubGrp2 = currentGrp.add('group');

  // import templates UI button...
  var importAetBtn = mnuSubGrp2.add('iconbutton', undefined, File.decode(aeIcon), { name: 'btn', style: 'toolbutton' });
  importAetBtn.helpTip = 'project templates';

  // layers tab button...
  var findBtn = mnuSubGrp2.add('iconbutton', undefined, findIcon, { name: 'btn', style: 'toolbutton' });
  findBtn.helpTip = 'text layer search';

  var pngPreviewBtn = mnuSubGrp2.add('iconbutton', undefined, previewIcon, { name: 'btn', style: 'toolbutton' });
  pngPreviewBtn.helpTip = 'save PNG preview';

  //---------------------------------------------------------

  currentGrp.add('image', undefined, vSpacer, { name: 'div' });

  // application tab button...
  var appBtn = currentGrp.add('iconbutton', undefined, appIcon, { name: 'btn', style: 'toolbutton' });
  appBtn.helpTip = 'setup Media Encoder presets, fonts, etc...';

  // dev tab button...
  var devBtn = currentGrp.add('iconbutton', undefined, exprTogIcon, { name: 'btn', style: 'toolbutton' });
  devBtn.helpTip = 'dev tools...';
  devBtn.enabled = devMode;
  devBtn.visible = devMode;

  /* jshint ignore:start */
  #include 'contents/ctrl tab.js';
  #include 'contents/animation tab.js';
  #include 'contents/fx tab.js';
  #include 'contents/text tab.js';
  #include 'contents/color tab.js';
  #include 'contents/project tab.js';
  #include 'contents/links tab.js';
  #include 'contents/app tab.js';
  #include 'contents/dev tab.js';
  /* jshint ignore:end */

  /*

  ---------------------------------------------------------------
  > error tab
  ---------------------------------------------------------------

  */

  var errTxt = errTabGrp.add('statictext', undefined, '');
  errTxt.justify = 'center';
  setTxtColor(errTxt, errTxtColor);

  // close group...
  var closeBtn = closeGrp.add('iconbutton', undefined, closeIcon, { name: 'btn', style: 'toolbutton' });
  closeBtn.helpTip = 'close';

  var closeErrBtn = closeGrp.add('iconbutton', undefined, closeErrIcon, { name: 'btn', style: 'toolbutton' });
  closeErrBtn.helpTip = 'close';
  closeErrBtn.visible = false;

  /*

  ---------------------------------------------------------------
  >  progress tab
  ---------------------------------------------------------------

  */

  var progTxt1 = progressGrp.add('statictext', undefined, '');
  progTxt1.justify = 'center';

  setTxtColor(progTxt1, sTxtColor);

  var progTxt2 = progressGrp.add('statictext', undefined, '');
  progTxt2.justify = 'center';
  setTxtColor(progTxt2, sTxtColor);

  // all tabs except preferences...
  var tabs = getTabGroups();

  // all tab subgroups except keyStatsGrp...
  var tabSubGrps = getTabSubGroups();

  // all tab subgroups except keyStatsGrp...
  var tabDividers = getTabDividers();

  // all tab subgroups except keyStatsGrp...
  var tabLabels = getLabels();

  // menu is the current selected and viewed group by default... 
  currentGrp = tabsGrp.menu;
  currentGrp.visible = true;
  bgColor = tabColors[tabs.indexOf(currentGrp)];

  setBgColor(w, bgColor);

  w.layout.layout(true);

  /*
  
  ---------------------------------------------------------------
  > 📟 main menu events
  ---------------------------------------------------------------
  
  */

  //  linter settings:
  //  jshint -W061
  //  jscs:disable maximumLineLength

  w.onShow = function () {
    setLayout();
  };

  //---------------------------------------------------------

  // layouts all the UI
  w.onResizing = w.onResize = function () {
    setLayout();
  };

  //---------------------------------------------------------

  infoBtn.onClick = function () {
    openWebSite(repoURL + readme);
  };

  //---------------------------------------------------------

  ctrlBtn.onClick = function () {
    currentGrp.visible = false;
    currentGrp = tabsGrp.ctrl;
    readme = '#--seção-controles-';
    openTab();
  };

  //---------------------------------------------------------

  animBtn.onClick = function () {
    currentGrp.visible = false;
    currentGrp = tabsGrp.animation;
    readme = '#--seção-animação-';
    openTab();
  };

  //---------------------------------------------------------

  fxBtn.onClick = function () {
    currentGrp.visible = false;
    currentGrp = tabsGrp.fx;
    readme = '#--seção-efeitos-';
    openTab();
  };

  //---------------------------------------------------------

  txtBtn.onClick = function () {
    currentGrp.visible = false;
    currentGrp = tabsGrp.text;
    readme = '#--seção-texto-';
    openTab();
  };

  //---------------------------------------------------------

  guideBtn.onClick = function () {
    currentGrp.visible = false;
    currentGrp = tabsGrp.guide;
    readme = '#--seção-guias-';
    openTab();
  };

  //---------------------------------------------------------

  toolBtn.onClick = function () {
    currentGrp.visible = false;
    currentGrp = tabsGrp.tools;
    readme = '#--subseção-ferramentas-';
    openTab();
  };

  //---------------------------------------------------------

  projBtn.onClick = function () {
    projName = getXMPdata('title[1]') == '' ? 'proj name' : getXMPdata('title[1]');
    projId = getXMPdata('identifier') == '' ? 'proj id' : getXMPdata('identifier');

    currentGrp.visible = false;
    currentGrp = tabsGrp.project;
    readme = '#--seção-projeto-';
    openTab();
    projIdTxt.text = projId;
    projNameTxt.text = projName;
  };

  //---------------------------------------------------------

  appBtn.onClick = function () {
    currentGrp.visible = false;
    currentGrp = tabsGrp.app;
    readme = '#--seção-programa-';
    openTab();
  };

  //---------------------------------------------------------

  devBtn.onClick = function () {
    currentGrp.visible = false;
    currentGrp = tabsGrp.dev;
    openTab();
  };

  //---------------------------------------------------------

  linksBtn.onClick = function () {
    currentGrp.visible = false;
    currentGrp = tabsGrp.links;
    readme = '#--seção-links-';
    openTab();
  };

  /*
  
  ---------------------------------------------------------------
  > import templates...
  ---------------------------------------------------------------
  
  */

  importAetBtn.onClick = function () {
    // error...
    if (!netAccess()) {
      showTabErr(netConfigName + ' not checked');
      return;
    }

    // github main repo...
    var url = repoURL + '/raw/main/downloads/templates.zip';
    var zipPath = downPath + '/templates.zip';
    var templatesLocalFolder = new Folder(fontsLocalPath);

    if (!downFolder.exists) downFolder.create();

    if (!templatesFolder.exists || templatesFolder.getFiles().length == 0) {
      // → delete previous local templates folder
      removeFolder(templatesLocalFolder);
      templatesLocalFolder.create(); // → new local templates folder

      getURLContent([url], [downPath]); // → download templates.zip
      unzipContent(zipPath, templatesLocalPath); // → unzip templates
      removeFolder(downPath);

      // HO preference
      if (!homeOffice) {
        removeFolder(templatesFolder); // → delete previous templates folder
        templatesFolder.create(); // → delete previous templates folder
        copyFolder(templatesLocalPath, templatesPath); // copy every file and folder
      }
    }
    templateDialog(); // → templates ui
  };

  /*
  
  ---------------------------------------------------------------
  > find dialog...
  ---------------------------------------------------------------
  
  */

  findBtn.onClick = function () {
    findDialog();
  };

  //---------------------------------------------------------

  pngPreviewBtn.onClick = function () {
    var aItem = app.project.activeItem;

    if (aItem == null) return;

    var saveFolder = Folder.selectDialog();

    if (saveFolder == null) return;

    var savePath = saveFolder.fullName + '/';
    var previewPath = savePath + aItem.name + ' preview.png';
    var previewFile = new File(previewPath);

    aItem.saveFrameToPng(aItem.time, previewFile);
    // var setClipboard = 'Get-Content \'' + previewPath + '\' | Set-Clipboard';
    // var cmdStr = 'cmd.exe /c powershell.exe -c "' + setClipboard + '"';
    // system.callSystem(cmdStr);
    openFolder(savePath);
  };

  //---------------------------------------------------------

  prefBtn.onClick = function () {
    prefsDialog();
  };

  //---------------------------------------------------------

  /* jshint ignore:start */
  // #include 'events/animation events.js';
  // #include 'events/app events.js';
  // #include 'events/color events.js';
  // #include 'events/ctrl events.js';
  // #include 'events/dev events.js';
  // #include 'events/fx events.js';
  // #include 'events/links events.js';
  // #include 'events/project events.js';
  // #include 'events/text events.js';
  /* jshint ignore:end */

  /*
  
  ---------------------------------------------------------------
  > ❌ close group events
  ---------------------------------------------------------------
  
  */

  closeBtn.onClick = function () {
    GNEWS_LOGO.visible = true;
    aboutTxt.visible = true;
    infoBtn.visible = false;

    closeBtn.visible = true;
    prefGrp.visible = true;
    closeErrBtn.visible = false;
    tabsGrp.menu.visible = true;

    bgColor = tabColors[0];

    hideTabs();
    setBgColor(w, bgColor);
  };

  //---------------------------------------------------------

  closeErrBtn.onClick = function () {
    GNEWS_LOGO.visible = true;
    closeBtn.visible = true;
    closeErrBtn.visible = false;

    clearOutput();
    hideTabs();
    openTab();
  };

  return w;
}