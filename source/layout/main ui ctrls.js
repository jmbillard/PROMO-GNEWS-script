/* ---------------------------------------------------------------
> script main ui
--------------------------------------------------------------- */
//  linter settings:
//  jshint -W061
//  jscs:disable maximumLineLength

function PROMO_GNEWS_UI() {

  /* jshint ignore:start */
  #include 'utils/templateDialog.js'; // import templates dialog file...
  #include 'utils/tagDialog.js'; // organization tags dialog file...
  #include 'utils/endPagePresetDialog.js'; // end page presets dialog file...
  #include 'utils/fontsDialog.js'; // end page presets dialog file...
  #include 'utils/findDialog.js'; // end page presets dialog file...
  #include 'utils/bin.js'; // end page presets dialog file...

  #include 'ui functions.js'; // ui and layout functions...
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

  // add, center and hide the preferences tab...
  var preferences = tabsGrp.add('group', undefined, { name: 'preferences' });
  preferences.alignment = 'center';
  preferences.visible = false;

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
  var prefBtn = prefGrp.add('iconbutton', undefined, setIcon, { style: 'toolbutton' });
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

  var infoGrp = imgGrp.add('group');
  infoGrp.orientation = 'stack';

  var aboutTxt = infoGrp.add('statictext', undefined, vStr);
  aboutTxt.helpTip = aboutStr;
  setTxtColor(aboutTxt, sTxtColor);

  var infoBtn = infoGrp.add('iconbutton', undefined, infoIcon, { style: 'toolbutton' });
  infoBtn.helpTip = 'Help | README';
  infoBtn.visible = false;

  // progress image group...
  var progImgGrp = leftGrp.add('group');
  progImgGrp.visible = false;

  var progImg = progImgGrp.add('image', undefined, keepCalmIcon);

  /*

  ---------------------------------------------------------------
  > 📟 main menu
  ---------------------------------------------------------------

  */
  var currentGrp = tabsGrp.menu;

  // control tab button...
  var ctrlBtn = currentGrp.add('iconbutton', undefined, ctrlIcon, { style: 'toolbutton' });
  ctrlBtn.helpTip = 'null and controls';
  // animation tab button...
  var animBtn = currentGrp.add('iconbutton', undefined, animIcon, { style: 'toolbutton' });
  animBtn.helpTip = 'animation';
  // effects tab button...
  var fxBtn = currentGrp.add('iconbutton', undefined, fxIcon, { style: 'toolbutton' });
  fxBtn.helpTip = 'effects';
  // text tab button...
  var txtBtn = currentGrp.add('iconbutton', undefined, txtTitleIcon, { style: 'toolbutton' });
  txtBtn.helpTip = 'text case and line breaking';
  // pallet tab button...
  var guideBtn = currentGrp.add('iconbutton', undefined, guideIcon, { style: 'toolbutton' });
  guideBtn.helpTip = 'color, guides and branding';
  // project tab button...
  var projBtn = currentGrp.add('iconbutton', undefined, toolsIcon, { style: 'toolbutton' });
  projBtn.helpTip = 'project organization';

  currentGrp.add('image', undefined, vSpacer);

  // links tab button...
  var linksBtn = currentGrp.add('iconbutton', undefined, linksIcon, { style: 'toolbutton' });
  linksBtn.helpTip = 'useful links';

  currentGrp.add('image', undefined, vSpacer);

  // import templates UI button...
  var importAetBtn = currentGrp.add('iconbutton', undefined, aeIcon, { style: 'toolbutton' });
  importAetBtn.helpTip = 'project templates';
  // layers tab button...
  var findBtn = currentGrp.add('iconbutton', undefined, findIcon, { style: 'toolbutton' });
  findBtn.helpTip = 'text layer search';

  var pngPreviewBtn = currentGrp.add('iconbutton', undefined, previewIcon, { style: 'toolbutton' });
  pngPreviewBtn.helpTip = 'save PNG preview';

  currentGrp.add('image', undefined, vSpacer);

  // application tab button...
  var appBtn = currentGrp.add('iconbutton', undefined, appIcon, { style: 'toolbutton' });
  appBtn.helpTip = 'setup Media Encoder presets, fonts, etc...';
  // application tab button...
  var devBtn = currentGrp.add('iconbutton', undefined, exprTogIcon, { style: 'toolbutton' });
  devBtn.helpTip = 'dev tools...';


  /*

  ---------------------------------------------------------------
  > 🕹️ ctrl tab
  ---------------------------------------------------------------

  */
  currentGrp = tabsGrp.ctrl;

  // sub group...
  var ctrlSubGrp1 = currentGrp.add('group');
  // copy animation toggle... 
  var aniTogBtn = ctrlSubGrp1.add('iconbutton', undefined, aniTogIcon, { style: 'toolbutton', toggle: 1 });
  aniTogBtn.helpTip = 'copy animation';
  // copy expressions toggle... 
  var exprTogBtn = ctrlSubGrp1.add('iconbutton', undefined, exprTogIcon, { style: 'toolbutton', toggle: 1 });
  exprTogBtn.helpTip = 'copy expressions';

  // create parent null... 
  var nullShpBtn = currentGrp.add('iconbutton', undefined, shpNullIcon, { style: 'toolbutton' });
  nullShpBtn.helpTip = 'create parent null';

  currentGrp.add('image', undefined, vSpacer);

  // create centered null
  var nullCShpBtn = currentGrp.add('iconbutton', undefined, nullCIcon, { style: 'toolbutton' });
  nullCShpBtn.helpTip = 'centered null';

  currentGrp.add('image', undefined, vSpacer);

  // select hierarchy sub group...
  var hGrp = currentGrp.add('group', undefined, { name: 'hGrp' });
  hGrp.orientation = 'column';
  hGrp.spacing = 0;
  // select parent button...
  var upHBtn = hGrp.add('iconbutton', undefined, upIcon, { style: 'toolbutton' });
  upHBtn.helpTip = 'select parent';
  // select children button...
  var dwnHBtn = hGrp.add('iconbutton', undefined, downIcon, { style: 'toolbutton' });
  dwnHBtn.helpTip = 'select children';

  /*

  ---------------------------------------------------------------
  > 🚶 anim tab
  ---------------------------------------------------------------

  */
  currentGrp = tabsGrp.animation;

  // copy keyframe influences...
  var copyInfBtn = currentGrp.add('iconbutton', undefined, copyInfluenceIcon, { style: 'toolbutton' });
  copyInfBtn.helpTip = 'copy keyframe influence';

  var keyStatsGrp = currentGrp.add('group', undefined, { name: 'keyStatsGrp' });
  keyStatsGrp.orientation = 'stack';

  // keyframe images...
  for (var kf = 0; kf < keyImgs.length; kf++) {
    var keyImg = keyStatsGrp.add('image', undefined, keyImgs[kf], { name: 'keyImg' + kf });
    keyImg.helpTip = 'no keyframe data';

    // only the first keyframe image is visible...
    if (kf > 0) keyImg.visible = false;
  }

  // paste keyframe influences...
  var pasteInfBtn = currentGrp.add('iconbutton', undefined, pasteInfluenceIcon, { style: 'toolbutton' });
  pasteInfBtn.helpTip = 'paste keyframe influence';

  currentGrp.add('image', undefined, vSpacer);

  var lockTrmBtn = currentGrp.add('iconbutton', undefined, lockPropIcon, { style: 'toolbutton' });
  lockTrmBtn.helpTip = 'lock transform properties';

  currentGrp.add('image', undefined, vSpacer);

  var layerRandBtn = currentGrp.add('iconbutton', undefined, randomizeLayerTimesIcon, { style: 'toolbutton' });
  layerRandBtn.helpTip = 'randomize layer times';

  // tools button...
  var toolBtn = currentGrp.add('iconbutton', undefined, rigToolsIcon, { style: 'toolbutton' });
  toolBtn.helpTip = 'rigs and tools';

  /*

  ---------------------------------------------------------------
  > 🔥 fx tab
  ---------------------------------------------------------------

  */
  currentGrp = tabsGrp.fx;

  var shpAdjBtn = currentGrp.add('iconbutton', undefined, shpAdjIcon, { style: 'toolbutton' });
  shpAdjBtn.helpTip = 'adjustment layer';

  currentGrp.add('image', undefined, vSpacer);

  var cGrp = currentGrp.add('group');
  var curBtn = cGrp.add('iconbutton', undefined, curIcon, { style: 'toolbutton' });
  curBtn.helpTip = 'curves';
  var levBtn = cGrp.add('iconbutton', undefined, levIcon, { style: 'toolbutton' });
  levBtn.helpTip = 'levels';
  var lumBtn = cGrp.add('iconbutton', undefined, lumIcon, { style: 'toolbutton' });
  lumBtn.helpTip = 'lumetri color';

  currentGrp.add('image', undefined, hSpacer);

  var fxSubGrp1 = currentGrp.add('group');
  var gaublurBtn = fxSubGrp1.add('iconbutton', undefined, gaublurIcon, { style: 'toolbutton' });
  gaublurBtn.helpTip = 'gaussian blur';
  var comblurBtn = fxSubGrp1.add('iconbutton', undefined, comblurIcon, { style: 'toolbutton' });
  comblurBtn.helpTip = 'compound blur';
  var lensblurBtn = fxSubGrp1.add('iconbutton', undefined, lensblurIcon, { style: 'toolbutton' });
  lensblurBtn.helpTip = 'lens blur';

  currentGrp.add('image', undefined, hSpacer);

  var fxSubGrp2 = currentGrp.add('group');
  var fillBtn = fxSubGrp2.add('iconbutton', undefined, fillIcon, { style: 'toolbutton' });
  fillBtn.helpTip = 'fill';

  currentGrp.add('image', undefined, hSpacer);

  var fxSubGrp3 = currentGrp.add('group');
  var glassBtn = fxSubGrp3.add('iconbutton', undefined, glassIcon, { style: 'toolbutton' });
  glassBtn.helpTip = '3d glasses';

  currentGrp.add('image', undefined, hSpacer);

  var fxSubGrp4 = currentGrp.add('group');
  var fracBtn = fxSubGrp4.add('iconbutton', undefined, fracIcon, { style: 'toolbutton' });
  fracBtn.helpTip = 'fractal noise';
  var grainBtn = fxSubGrp4.add('iconbutton', undefined, grainIcon, { style: 'toolbutton' });
  grainBtn.helpTip = 'add grain';

  /*

  ---------------------------------------------------------------
  > txt tab
  ---------------------------------------------------------------

  */
  currentGrp = tabsGrp.text;

  var textSubGrp1 = currentGrp.add('group');
  var txtUpperBtn = textSubGrp1.add('iconbutton', undefined, txtUpperIcon, { style: 'toolbutton' });
  txtUpperBtn.helpTip = 'set text layer to upper case';
  var txtLowerBtn = textSubGrp1.add('iconbutton', undefined, txtLowerIcon, { style: 'toolbutton' });
  txtLowerBtn.helpTip = 'set text layer to lower case';
  var txtTitleBtn = textSubGrp1.add('iconbutton', undefined, txtTitleIcon, { style: 'toolbutton' });
  txtTitleBtn.helpTip = 'set text layer to title case';

  currentGrp.add('image', undefined, hSpacer);

  var textSubGrp2 = currentGrp.add('group');
  var txtCleanerBtn = textSubGrp2.add('iconbutton', undefined, txtCleanerIcon, { style: 'toolbutton' });
  txtCleanerBtn.helpTip = 'deletes consecutive spaces and line breaks';
  var txtColumnBtn = textSubGrp2.add('iconbutton', undefined, txtColumnsIcon, { style: 'toolbutton' });
  txtColumnBtn.helpTip = 'divides consecutive spaces in 2 columns';

  currentGrp.add('image', undefined, vSpacer);

  var limitSld = currentGrp.add('slider', undefined, 60, 5, 200);
  var limitTxt2 = currentGrp.add('edittext', undefined, '60');
  limitTxt2.characters = 3;
  var limitTxt = currentGrp.add('statictext', undefined, '60');
  limitTxt.characters = 3;
  setTxtColor(limitTxt, sTxtColor);

  /*

  ---------------------------------------------------------------
  > color, guides and branding tab
  ---------------------------------------------------------------

  */
  currentGrp = tabsGrp.guide;

  // ui GNEWS color buttons...
  var colorsGrp = currentGrp.add('group');
  
  var colors1Grp = colorsGrp.add('group');
  var colors1Txt = colors1Grp.add('statictext', undefined, 'main:');
  setTxtColor(colors1Txt, sTxtColor);

  var colors2Grp = colorsGrp.add('group');
  var colors2Txt = colors2Grp.add('statictext', undefined, 'mono:');
  setTxtColor(colors2Txt, sTxtColor);

  var colors3Grp = colorsGrp.add('group');
  var colors3Txt = colors3Grp.add('statictext', undefined, 'sec:');
  setTxtColor(colors3Txt, sTxtColor);

  // main colors...
  createColorButtons(GNEWS_mainColors1, colors1Grp);
  createColorButtons(GNEWS_mainColors2, colors2Grp);
  // secondary colors...
  createColorButtons(GNEWS_secColors, colors3Grp);

  currentGrp.add('image', undefined, hSpacer);

  var shpPalletBtn = currentGrp.add('iconbutton', undefined, palletIcon, { style: 'toolbutton' });
  shpPalletBtn.helpTip = 'color pallet as shape layer';

  var arrowOnAirBtn = currentGrp.add('iconbutton', undefined, arrowOnAirIcon, { style: 'toolbutton' });
  arrowOnAirBtn.helpTip = 'arrow on-air';

  var logoStaticBtn = currentGrp.add('iconbutton', undefined, newsStaticIcon, { style: 'toolbutton' });
  logoStaticBtn.helpTip = 'GNEWS logo static';

  var logoAnim3sBtn = currentGrp.add('iconbutton', undefined, newsAnimIcon, { style: 'toolbutton' });
  logoAnim3sBtn.helpTip = 'GNEWS logo 3 seconds animation';

  /*

  ---------------------------------------------------------------
  > 🧻 layer tab
  ---------------------------------------------------------------

  currentGrp = layersGrp;
  
  var layersSubGrp1 = currentGrp.add('group');
  layersSubGrp1.spacing = 2;
  var ftgTogBtn = layersSubGrp1.add('iconbutton', undefined, ftgTogIcon, {style: 'toolbutton', toggle: 1});
  ftgTogBtn.helpTip = 'footage';
  ftgTogBtn.enabled = false;
  var solTogBtn = layersSubGrp1.add('iconbutton', undefined, solTogIcon, {style: 'toolbutton', toggle: 1});
  solTogBtn.helpTip = 'solids';
  solTogBtn.enabled = false;
  var shpTogBtn = layersSubGrp1.add('iconbutton', undefined, shpTogIcon, {style: 'toolbutton', toggle: 1});
  shpTogBtn.helpTip = 'shape layers';
  shpTogBtn.enabled = false;
  var txtTogBtn = layersSubGrp1.add('iconbutton', undefined, txtTogIcon, {style: 'toolbutton', toggle: 1});
  txtTogBtn.helpTip = 'text layers';
  txtTogBtn.enabled = false;
  var camTogBtn = layersSubGrp1.add('iconbutton', undefined, camTogIcon, {style: 'toolbutton', toggle: 1});
  camTogBtn.helpTip = 'camera layers';
  camTogBtn.enabled = false;
  var lgtTogBtn = layersSubGrp1.add('iconbutton', undefined, lgtTogIcon, {style: 'toolbutton', toggle: 1});
  lgtTogBtn.helpTip = 'light layers';
  lgtTogBtn.enabled = false;
  
  var renameLayersBtn = currentGrp.add('iconbutton', undefined, chkIcon, {style: 'toolbutton'});
  renameLayersBtn.helpTip = 'update layer names';
  renameLayersBtn.enabled = false;
  
  currentGrp.add('image', undefined, vSpacer);
  
  var isolateBtn = currentGrp.add('iconbutton', undefined, isolateIcon, {style: 'toolbutton'});
  isolateBtn.helpTip = 'isolate layers';
  */

  /*

  ---------------------------------------------------------------
  > 🔨 tools tab
  ---------------------------------------------------------------

  */

  currentGrp = tabsGrp.tools;

  // dynamic arrow rig...
  var arrowBtn = currentGrp.add('iconbutton', undefined, arrowIcon, { style: 'toolbutton' });
  arrowBtn.helpTip = 'simple arrow rig';

  currentGrp.add('image', undefined, vSpacer);

  // simple counter rig...
  var counterBtn = currentGrp.add('iconbutton', undefined, counterIcon, { style: 'toolbutton' });
  counterBtn.helpTip = 'make counter rig';

  currentGrp.add('image', undefined, hSpacer);
  // text typing rig...
  var typeAnimBtn = currentGrp.add('iconbutton', undefined, typewriterIcon, { style: 'toolbutton' });
  typeAnimBtn.helpTip = 'typewriter animation';
  var wordsBtn = currentGrp.add('iconbutton', undefined, wordsIcon, { style: 'toolbutton' });
  wordsBtn.helpTip = 'words animation';
  var simpleBoxBtn = currentGrp.add('iconbutton', undefined, boxIcon, { style: 'toolbutton' });
  simpleBoxBtn.helpTip = 'simple box bg base';

  currentGrp.add('image', undefined, vSpacer);

  // wiggle position rig...
  var wigBtn = currentGrp.add('iconbutton', undefined, wigIcon, { style: 'toolbutton' });
  wigBtn.helpTip = 'wig rig';

  currentGrp.add('image', undefined, vSpacer);

  // simple ik rig...
  var ikBtn = currentGrp.add('iconbutton', undefined, ikIcon, { style: 'toolbutton' });
  ikBtn.helpTip = 'simple ik rig';

  /*

  ---------------------------------------------------------------
  > 🗃️ project tab
  ---------------------------------------------------------------

  */
  currentGrp = tabsGrp.project;

  var projUserTxt = currentGrp.add('edittext', undefined, userPrefix);
  projUserTxt.characters = 3;
  projUserTxt.helpTip = 'user id';
  var projIdTxt = currentGrp.add('edittext', undefined, 'proj id');
  projIdTxt.characters = 8;
  projIdTxt.helpTip = 'project id';
  var insertUserIdBtn = currentGrp.add('iconbutton', undefined, addIcon, { style: 'toolbutton' });
  insertUserIdBtn.helpTip = 'insert user with project ID';

  var projNameTxt = currentGrp.add('edittext', undefined, 'proj name');
  projNameTxt.characters = 16;
  projNameTxt.helpTip = 'project name';
  var renameItemBtn = currentGrp.add('iconbutton', undefined, chkIcon, { style: 'toolbutton' });
  renameItemBtn.helpTip = 'quick template rename';

  currentGrp.add('image', undefined, vSpacer);

  var tagBtn = currentGrp.add('iconbutton', undefined, tagIcon, { style: 'toolbutton' });
  tagBtn.helpTip = 'organization tags';
  // end page presets UI button...
  var endPagePresetBtn = currentGrp.add('iconbutton', undefined, endPagePresetIcon, { style: 'toolbutton' });
  endPagePresetBtn.helpTip = 'end page JSON presets';

  var projOrgBtn = currentGrp.add('iconbutton', undefined, templateIcon, { style: 'toolbutton' });
  projOrgBtn.helpTip = 'quick project organization';

  currentGrp.add('image', undefined, vSpacer);

  var projectSubGrp1 = currentGrp.add('group');
  var collectTogBtn = projectSubGrp1.add('iconbutton', undefined, fldTogIcon, { style: 'toolbutton', toggle: 1 });
  collectTogBtn.helpTip = 'collect files';
  // var collectFontsTogBtn = projectSubGrp1.add('iconbutton', undefined, txtTogIcon, {style: 'toolbutton', toggle: 1});
  // collectFontsTogBtn.helpTip = 'collect fonts';

  var saveBtn = currentGrp.add('iconbutton', undefined, quickSaveIcon, { style: 'toolbutton' });
  saveBtn.helpTip = 'quick project save';

  /*

  ---------------------------------------------------------------
  > ✌️ app tab
  ---------------------------------------------------------------

  */
  currentGrp = tabsGrp.app;

  var installFontsBtn = currentGrp.add('iconbutton', undefined, fontsIcon, { style: 'toolbutton' });
  installFontsBtn.helpTip = 'install fonts | open fonts folder';

  currentGrp.add('image', undefined, vSpacer);

  var copyAMEPresetsBtn = currentGrp.add('iconbutton', undefined, eprIcon, { style: 'toolbutton' });
  copyAMEPresetsBtn.helpTip = 'install Encoder presets | open presets folder';

  currentGrp.add('image', undefined, vSpacer);

  var templatesLocalBtn = currentGrp.add('iconbutton', undefined, aetIcon, { style: 'toolbutton' });
  templatesLocalBtn.helpTip = 'install templates locally';
  templatesLocalBtn.enabled = false;

  /*
  
  ---------------------------------------------------------------
  > 🔗 links tab
  ---------------------------------------------------------------
  
  */

  currentGrp = tabsGrp.links;

  var linksSubGrp2 = currentGrp.add('group');
  var emailBtn = linksSubGrp2.add('iconbutton', undefined, emailIcon, { style: 'toolbutton' });
  emailBtn.helpTip = 'webmail globo';
  var oneDriveBtn = linksSubGrp2.add('iconbutton', undefined, oneDriveIcon, { style: 'toolbutton' });
  oneDriveBtn.helpTip = 'OneDrive globo';
  var sharePointBtn = linksSubGrp2.add('iconbutton', undefined, sharePointIcon, { style: 'toolbutton' });
  sharePointBtn.helpTip = 'SharePoint promo GNEWS';

  currentGrp.add('image', undefined, hSpacer);

  var linksSubGrp3 = currentGrp.add('group');
  var trelloBtn = linksSubGrp3.add('iconbutton', undefined, trelloIcon, { style: 'toolbutton' });
  trelloBtn.helpTip = 'trello promo GNEWS';
  var typeFormBtn = linksSubGrp3.add('iconbutton', undefined, typeFormIcon, { style: 'toolbutton' });
  typeFormBtn.helpTip = 'type form globo';
  var plannerBtn = linksSubGrp3.add('iconbutton', undefined, plannerIcon, { style: 'toolbutton' });
  plannerBtn.helpTip = 'planner globo';

  currentGrp.add('image', undefined, vSpacer);

  var linksSubGrp1 = currentGrp.add('group');
  var mamArteBtn = linksSubGrp1.add('iconbutton', undefined, arteFolderIcon, { style: 'toolbutton' });
  mamArteBtn.helpTip = 'MAM Para Arte | set custom folder';
  var mamMagBtn = linksSubGrp1.add('iconbutton', undefined, magazineFolderIcon, { style: 'toolbutton' });
  mamMagBtn.helpTip = 'upload MAM Magazine | set custom folder';

  linksSubGrp1.add('image', undefined, hSpacer);

  var mamHardNewsBtn = linksSubGrp1.add('iconbutton', undefined, hardNewsFolderIcon, { style: 'toolbutton' });
  mamHardNewsBtn.helpTip = 'upload MAM Hard News';
  mamHardNewsBtn.enabled = !homeOffice;
  var nUtilsBtn = linksSubGrp1.add('iconbutton', undefined, utilsFolderIcon, { style: 'toolbutton' });
  nUtilsBtn.helpTip = 'N: Utilidades';
  nUtilsBtn.enabled = !homeOffice;

  /*

  ---------------------------------------------------------------
  > ⚙️ dev tab
  ---------------------------------------------------------------

  */

  currentGrp = tabsGrp.dev;

  var binTxt = currentGrp.add('statictext', undefined, 'bin');
  setTxtColor(binTxt, sTxtColor);

  var binBtn = currentGrp.add('iconbutton', undefined, binIcon, { style: 'toolbutton' });
  binBtn.helpTip = 'binary converter | layer source code';

  currentGrp.add('image', undefined, vSpacer);

  var zipTxt1 = currentGrp.add('statictext', undefined, 'zip');
  setTxtColor(zipTxt1, sTxtColor);
  var zipTemplatesBtn = currentGrp.add('iconbutton', undefined, zipIcon, { style: 'toolbutton' });
  zipTemplatesBtn.helpTip = 'zip the templates folder';

  var zipFontsBtn = currentGrp.add('iconbutton', undefined, zipIcon, { style: 'toolbutton' });
  zipFontsBtn.helpTip = 'zip the fonts folder';

  /*

  ---------------------------------------------------------------
  > ⚙️ preferences tab
  ---------------------------------------------------------------

  */

  currentGrp = tabsGrp.preferences;

  var lPrefTxt = currentGrp.add('statictext', undefined, 'null - adj');
  lPrefTxt.helpTip = 'ctrl and adjustment layer type';
  setTxtColor(lPrefTxt, sTxtColor);
  var layerTypeDropArray = ['shape', 'solid'];
  var layerTypeDrop = currentGrp.add('dropdownlist', undefined, layerTypeDropArray);
  layerTypeDrop.selection = layerType;

  currentGrp.add('image', undefined, vSpacer);

  var projPrefTxt = currentGrp.add('statictext', undefined, 'proj. model');
  projPrefTxt.helpTip = 'project structure template';
  setTxtColor(projPrefTxt, sTxtColor);
  var projectModeDropArray = ['PROMO', 'custom'];
  var projectModeDrop = currentGrp.add('dropdownlist', undefined, projectModeDropArray);
  projectModeDrop.selection = projectMode;

  currentGrp.add('image', undefined, vSpacer);

  var colorDrop = currentGrp.add('dropdownlist', undefined, grpNames);
  colorDrop.selection = 0;
  var tabColorBtn = currentGrp.add('iconbutton', undefined, undefined, { style: 'toolbutton' });
  tabColorBtn.size = [20, 20];
  setBtnColor(tabColorBtn, tabColors[0]);
  tabColorBtn.onDraw = customDraw;

  currentGrp.add('image', undefined, vSpacer);

  var hoGrp = currentGrp.add('group');
  hoGrp.alignment = 'center';
  hoGrp.margins = [0, 7, 0, 0];

  var hoTxt = hoGrp.add('statictext', undefined, 'HO');
  hoTxt.alignment = 'top';
  var hoCkb = hoGrp.add('checkbox');
  hoCkb.value = homeOffice;
  hoCkb.helpTip = hoTxt.helpTip = 'switch between local or network templates, fonts, folders';
  setTxtColor(hoTxt, sTxtColor);

  currentGrp.add('image', undefined, vSpacer);

  var updateBtn = currentGrp.add('iconbutton', undefined, downloadIcon, { style: 'toolbutton' });
  updateBtn.helpTip = 'download the latest script version from github';

  /*

  ---------------------------------------------------------------
  > error tab
  ---------------------------------------------------------------

  */

  var errTxt = errTabGrp.add('statictext', undefined, '');
  errTxt.characters = 60;
  setTxtColor(errTxt, errTxtColor);

  // close group...
  var closeBtn = closeGrp.add('iconbutton', undefined, closeIcon, { style: 'toolbutton' });
  closeBtn.helpTip = 'close';
  var closeErrBtn = closeGrp.add('iconbutton', undefined, closeErrIcon, { style: 'toolbutton' });
  closeErrBtn.helpTip = 'close';
  closeErrBtn.visible = false;

  /*

  ---------------------------------------------------------------
  >  progress tab
  ---------------------------------------------------------------

  */

  var progTxt1 = progressGrp.add('statictext', undefined, '');
  progTxt1.characters = 16;
  setTxtColor(progTxt1, sTxtColor);
  var progTxt2 = progressGrp.add('statictext', undefined, '');
  progTxt2.characters = 16;
  setTxtColor(progTxt2, sTxtColor);

  // all tabs except preferences...
  var tabs = getTabGroups();

  // all tab subgroups except keyStatsGrp...
  var tabSubGrps = getTabSubGroups();

  // menu is the current selected and viewed group by default... 
  currentGrp = tabsGrp.menu;
  currentGrp.visible = true;
  bgColor = tabColors[tabs.indexOf(currentGrp)];

  setBgColor(w, bgColor);

  w.layout.layout(true);

  /* jshint ignore:start */
  #include 'main ui events.js';  // event call functions...
  /* jshint ignore:end */

  return w;
}