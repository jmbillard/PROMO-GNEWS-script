/* ---------------------------------------------------------------
> script main ui
--------------------------------------------------------------- */
//  linter settings:
//  jshint -W061
//  jscs:disable maximumLineLength

function PROMO_GNEWS_UI() {

  /* jshint ignore:start */
  #include 'utils/input ui.js'; // import templates ui file...
  #include 'utils/progress ui.js'; // import templates ui file...
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
    // grp.alignment = 'fill';
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
  var prefBtn = prefGrp.add('iconbutton', undefined, prefsIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
  prefBtn.helpTip = 'script preferences';

  /*

  ---------------------------------------------------------------
  > images
  ---------------------------------------------------------------

  */

  // logo image group...
  var imgGrp = leftGrp.add('group');
  imgGrp.spacing = 0;
  var GNEWS_LOGO = imgGrp.add('image', undefined, GNEWS_LOGO_IMG[iconTheme]);
  GNEWS_LOGO.helpTip = aboutStr;
  GNEWS_LOGO.maximumSize.width = 70;

  var infoGrp = imgGrp.add('group');
  infoGrp.orientation = 'stack';

  var aboutTxt = infoGrp.add('statictext', undefined, undefined);
  aboutTxt.justify = 'center';
  aboutTxt.helpTip = aboutStr;
  aboutTxt.characters = 6;
  setTxtHighlight(aboutTxt, sTxtColor[iconTheme]);
  aboutTxt.text = !hardNews ? vStr : vStr + ' HN';
  aboutTxt.text = !homeOffice ? vStr : vStr + ' HO';

  var infoBtn = infoGrp.add('iconbutton', undefined, infoIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
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
  var menuSubGrp1 = currentGrp.add('group');

  var ctrlSubGrp = menuSubGrp1.add('group');
  // control tab button...
  var ctrlBtn = ctrlSubGrp.add('iconbutton', iconSize, controlsIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
  var ctrlLab = ctrlSubGrp.add('statictext', undefined, 'controls', { name: 'label' , truncate: 'end'});
  ctrlBtn.helpTip = 'controls';

  // animation tab button...
  var animSubGrp = menuSubGrp1.add('group');
  var animBtn = animSubGrp.add('iconbutton', iconSize, animationIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
  var animLab = animSubGrp.add('statictext', undefined, 'animation', { name: 'label' , truncate: 'end'});
  animBtn.helpTip = 'animation and tools';

  // effects tab button...
  var fxSubGrp = menuSubGrp1.add('group');
  var fxBtn = fxSubGrp.add('iconbutton', iconSize, effectsIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
  var fxLab = fxSubGrp.add('statictext', undefined, 'effects', { name: 'label' , truncate: 'end'});
  fxBtn.helpTip = 'effects and presets';

  // text tab button...
  var txtSubGrp = menuSubGrp1.add('group');
  var txtBtn = txtSubGrp.add('iconbutton', iconSize, textIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
  var txtLab = txtSubGrp.add('statictext', undefined, 'text utilities', { name: 'label' , truncate: 'end'});
  txtBtn.helpTip = 'text case, line breaking, ...';

  // pallet tab button...
  var guideSubGrp = menuSubGrp1.add('group');
  var guideBtn = guideSubGrp.add('iconbutton', iconSize, brandIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
  var guideLab = guideSubGrp.add('statictext', undefined, 'brand', { name: 'label' , truncate: 'end'});
  guideBtn.helpTip = 'color, guides, brand, ...';

  // project tab button...
  var projSubGrp = menuSubGrp1.add('group');
  var projBtn = projSubGrp.add('iconbutton', iconSize, projectIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
  var projLab = projSubGrp.add('statictext', undefined, 'project', { name: 'label' , truncate: 'end'});
  projBtn.helpTip = 'project naming, organization, tags, ...';

  //---------------------------------------------------------

  currentGrp.add('panel');
  
  var menuSubGrp2 = currentGrp.add('group');

  // links tab button...
  var linksSubGrp = menuSubGrp2.add('group');
  var linksBtn = linksSubGrp.add('iconbutton', iconSize, shortcutsIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
  var linksLab = linksSubGrp.add('statictext', undefined, 'shortcuts', { name: 'label' , truncate: 'end'});
  linksBtn.helpTip = 'links and folders';

  //---------------------------------------------------------

  currentGrp.add('panel');
  var menuSubGrp3 = currentGrp.add('group');

  // import templates UI button...
  var importAetSubGrp = menuSubGrp3.add('group');
  var importAetBtn = importAetSubGrp.add('iconbutton', iconSize, templatesIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
  var importAetLab = importAetSubGrp.add('statictext', undefined, 'templates', { name: 'label' , truncate: 'end'});
  importAetBtn.helpTip = '.aet templates';

  // layers tab button...
  var findSubGrp = menuSubGrp3.add('group');
  var findBtn = findSubGrp.add('iconbutton', iconSize, findIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
  var findLab = findSubGrp.add('statictext', undefined, 'text search', { name: 'label' , truncate: 'end'});
  findBtn.helpTip = 'text layers search';

  var pngPreviewSubGrp = menuSubGrp3.add('group');
  var pngPreviewBtn = pngPreviewSubGrp.add('iconbutton', iconSize, previewIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
  var pngPreviewLab = pngPreviewSubGrp.add('statictext', undefined, 'preview', { name: 'label' , truncate: 'end'});
  pngPreviewBtn.helpTip = 'save .png preview';

  //---------------------------------------------------------

  currentGrp.add('panel');
   
  var menuSubGrp4 = currentGrp.add('group');

  // application tab button...
  var appSubGrp = menuSubGrp4.add('group');
  var appBtn = appSubGrp.add('iconbutton', iconSize, appIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
  var appLab = appSubGrp.add('statictext', undefined, 'app utilities', { name: 'label' , truncate: 'end'});
  appBtn.helpTip = 'setup Media Encoder presets, fonts, etc...';

  var menuSubGrp5 = currentGrp.add('group');
  // dev tab button...
  var devSubGrp = menuSubGrp5.add('group');
  var devBtn = devSubGrp.add('iconbutton', iconSize, exprTogIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
  var devLab = devSubGrp.add('statictext', undefined, 'dev tools', { name: 'label' , truncate: 'end'}); devBtn.helpTip = 'dev tools...';
  menuSubGrp5.enabled = devMode;
  menuSubGrp5.visible = devMode;

  /* jshint ignore:start */
  #include 'contents/controls tab.js';
  #include 'contents/animation tab.js';
  #include 'contents/effects tab.js';
  #include 'contents/text tab.js';
  #include 'contents/brand tab.js';
  #include 'contents/project tab.js';
  #include 'contents/shortcuts tab.js';
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
  var closeBtn = closeGrp.add('iconbutton', iconSize, closeIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
  closeBtn.helpTip = 'close';

  var closeErrBtn = closeGrp.add('iconbutton', iconSize, closeErrIcon, { name: 'btn', style: 'toolbutton' });
  closeErrBtn.helpTip = 'close';
  closeErrBtn.visible = false;

  /*

  ---------------------------------------------------------------
  >  progress tab
  ---------------------------------------------------------------

  */

  var progTxt1 = progressGrp.add('statictext', undefined, '');
  progTxt1.justify = 'center';

  setTxtColor(progTxt1, sTxtColor.light);

  var progTxt2 = progressGrp.add('statictext', undefined, '');
  progTxt2.justify = 'center';
  setTxtColor(progTxt2, sTxtColor.light);

  var mainMenuLabels = getStaticTextLabels(tabsGrp.menu, []);

  // all tabs except preferences...
  var tabs = getTabGroups();

  // all tab subgroups except keyStatsGrp...
  var tabSubGrps = getTabSubGroups();

  // all tab subgroups except keyStatsGrp...
  var tabDividers = getTabDividers();

  // all tab subgroups except keyStatsGrp...
  var tabLabels = getTabLabels();
  highlighMenuLabels();

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

  //---------------------------------------------------------

  // layouts all the UI
  w.onShow = w.onResizing = function () {
    setLayout();
  };

  //---------------------------------------------------------

  infoBtn.onClick = function () {
    openWebSite(repoURL + readme);
  };

  aboutTxt.addEventListener('mousedown', function () {
    openWebSite(repoURL);
  });

  //---------------------------------------------------------

  ctrlBtn.onClick = function () {
    currentGrp.visible = false;
    currentGrp = tabsGrp.controls;
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
    currentGrp = tabsGrp.effects;
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
    currentGrp = tabsGrp.brand;
    readme = '#--seção-guias-';
    openTab();
  };

  //---------------------------------------------------------

  projBtn.onClick = function () {
    projIdContent = hardNews ? 'client' : 'PROJ ID';

    projName = getXMPdata('title[1]') == '' ? 'proj name' : getXMPdata('title[1]');
    projId = getXMPdata('identifier') == '' ? projIdContent : getXMPdata('identifier');

    currentGrp.visible = false;
    currentGrp = tabsGrp.project;
    readme = '#--seção-projeto-';
    openTab();
    projIdTxt.text = projId;
    projIdTxt.helpTip = projIdContent;

    insertUserIdBtn.helpTip = 'insert user with ' + projIdContent;

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
    currentGrp = tabsGrp.shortcuts;
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
    var zipPath = tempPath + '/templates.zip';
    var templatesLocalFolder = new Folder(templatesLocalPath);

    if (!tempFolder.exists) tempFolder.create();

    if (!templatesFolder.exists || templatesFolder.getFiles().length == 0) {
      // → delete previous local templates folder
      removeFolder(templatesLocalFolder);
      templatesLocalFolder.create(); // → new local templates folder

      getURLContent([url], [tempPath]); // → download templates.zip
      unzipContent(zipPath, templatesLocalPath); // → unzip templates
      removeFolder(tempPath);

      // HO preference
      if (!homeOffice) {
        removeFolder(templatesFolder); // → delete previous templates folder
        templatesFolder.create(); // → delete previous templates folder
        copyFolderContent(templatesLocalPath, templatesPath); // copy every file and folder
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
    // error...
    if (aItem == null) {
      showTabErr('comp not selected');
      return;
    }
    var saveFolder = Folder.selectDialog();

    if (saveFolder == null) return;

    var savePath = saveFolder.fullName + '/';
    var previewPath = savePath + aItem.name + ' preview.png';
    var previewFile = new File(previewPath);

    aItem.saveFrameToPng(aItem.time, previewFile);
    openFolder(savePath);
  };

  pngPreviewBtn.addEventListener('click', function (c) {
    if (c.button == 2) {
      var aItem = app.project.activeItem;
      
      if (aItem == null) {
        showTabErr('comp not selected');
        return;
      }
      var todayPathPreview = PRODUCAO_DIA_A_DIA() + '/_PREVIEWS';
      var currentProj = app.project.file;
      var currentProjPath = currentProj != null ? decodeURI(currentProj.path) : projPath;
      currentProjPath = hardNews ? todayPathPreview : currentProjPath;
      var previewPath = currentProjPath + '/' + aItem.name + ' preview.png';

      var previewFld = new Folder(currentProjPath);
      if (!previewFld.exists) previewFld.create();
      var previewFile = new File(previewPath);

      aItem.saveFrameToPng(aItem.time, previewFile);
      openFolder(currentProjPath);
    }
  });

  //---------------------------------------------------------

  prefBtn.onClick = function () {
    prefsDialog();
  };

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