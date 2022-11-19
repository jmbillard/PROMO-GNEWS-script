/*

---------------------------------------------------------------
> 📟 ui and layout
---------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061
//  jshint -W085
//  jshint -W043

//
function customDraw() {
  with (this) {
    graphics.drawOSControl();
    graphics.rectPath(0, 0, size[0], size[1]);
    graphics.fillPath(fillBrush);
  }
}

// changes the window background color...
function setBgColor(w, color) {
  var bType = w.graphics.BrushType.SOLID_COLOR;
  w.graphics.backgroundColor = w.graphics.newBrush(bType, color);
}

function setBtnColor(btn, color) {
  var bType = w.graphics.BrushType.SOLID_COLOR;
  btn.fillBrush = btn.graphics.newBrush(bType, color);
}

// changes static text color...
function setTxtColor(sTxt, color) {
  var pType = sTxt.graphics.PenType.SOLID_COLOR;
  sTxt.graphics.foregroundColor = sTxt.graphics.newPen(pType, color, 1);
}

function setLayout() {
  wLayout = w.size.width > w.size.height ? 'row' : 'column';

  if (wLayout == 'row') {
    // horizontal layout
    imgAlignment = 'left';
    errImgAlignment = 'left';
    closeAlignment = 'right';

    mainGrp.margins = [100, 0, 35, 0];
    imgGrp.margins = [20, 0, 0, 0];
    errImgGrp.margins = [20, 0, 0, 0];
    progImgGrp.margins = [20, 0, 0, 0];
    closeGrp.margins = 0;
    prefGrp.margins = 0;

    mainGrp.spacing = 10;

    for (var i = 0; i < tabs.length; i++) {
      tabs[i].spacing = 10;
    }
    preferences.spacing = 10;
    // text tab - limit text horizontal controls
    limitSld.visible = true;
    limitSld.size.width = 200;
    limitSld.size.height = 16;
    limitTxt.visible = true;
    limitTxt.size.width = 60;
    limitTxt.size.height = 24;
    // text tab - limit text vertical controls
    limitTxt2.visible = false;
    limitTxt2.size.width = 0;
    limitTxt2.size.height = 0;
    // project tab - controls
    projIdTxt.size.width = 80;
    projNameTxt.size.width = 140;
    layerTypeDrop.size.width = 80;
    projectModeDrop.size.width = 80;
    colorDrop.size.width = 80;
    tabColorBtn.size.width = 20;
    // error tab
    errTxt.visible = true;
    errTxt.size.width = 500;
    progTxt1.visible = true;
    // progress tab
    progTxt1.size.width = 160;
    progTxt2.visible = true;
    progTxt2.size.width = 160;
  } else {
    // vertical layout
    imgAlignment = 'bottom';
    errImgAlignment = 'center';
    closeAlignment = 'top';

    mainGrp.margins = [0, 40, 0, 30];
    imgGrp.margins = [0, 0, 0, 5];
    errImgGrp.margins = [0, 0, 0, 5];
    progImgGrp.margins = [0, 0, 0, 5];
    closeGrp.margins = [0, 10, 0, 0];
    prefGrp.margins = [0, 10, 0, 0];

    mainGrp.spacing = 2;
    tabsGrp.children[0].spacing = 2;
    preferences.spacing = 5;
    // text tab - limit text horizontal controls
    limitSld.visible = false;
    limitSld.size.width = 0;
    limitSld.size.height = 0;
    limitTxt.visible = false;
    limitTxt.size.width = 0;
    limitTxt.size.height = 0;
    // text tab - limit text vertical controls
    limitTxt2.visible = true;
    limitTxt2.size.width = 70;
    limitTxt2.size.height = 24;
    // project tab - controls
    projIdTxt.size.width = 70;
    projNameTxt.size.width = 70;
    layerTypeDrop.size.width = 70;
    projectModeDrop.size.width = 70;
    colorDrop.size.width = 70;
    tabColorBtn.size.width = 66;
    // error tab
    errTxt.visible = false;
    errTxt.size.width = 0;
    // progress tab
    progTxt1.visible = false;
    progTxt1.size.width = 0;
    progTxt2.visible = false;
    progTxt2.size.width = 0;
  }
  // all tab subgroups
  for (var s = 0; s < tabSubGrps.length; s++) {
    tabSubGrps[s].orientation = wLayout;
  }
  // all tabs
  for (var t = 0; t < tabs.length; t++) {
    tabs[t].orientation = wLayout;
    tabs[t].spacing = 5;
  }
  preferences.orientation = wLayout;
  imgGrp.alignment = imgAlignment;
  errImgGrp.alignment = errImgAlignment;
  progImgGrp.alignment = errImgAlignment;
  errTabGrp.alignment = imgAlignment;
  errTabGrp.orientation = wLayout;
  closeGrp.alignment = closeAlignment;
  prefGrp.alignment = closeAlignment;

  updateLayout();
}

function updateLayout() {
  for (var s = 0; s < tabSubGrps.length; s++) {
    tabSubGrps[s].layout.layout(true);
  }
  for (var t = 0; t < tabs.length; t++) {
    tabs[t].layout.layout(true);
  }
  preferences.layout.layout(true);
  imgGrp.layout.layout(true);
  errImgGrp.layout.layout(true);
  progImgGrp.layout.layout(true);
  errTabGrp.layout.layout(true);
  closeGrp.layout.layout(true);
  prefGrp.layout.layout(true);

  mainGrp.layout.layout(true);

  w.layout.layout(true);
  w.layout.resize();
}

// turns off all tab groups visibility...
function hideTabs() {
  // tabs[0] → tabsGrp.children[0]
  for (var t = 1; t < tabs.length; t++) {
    tabs[t].visible = false;
  }
  preferences.visible = false;
  errTabGrp.visible = false;
  closeGrp.visible = false;
}

// turns on the respective tab group visibility...
function openTab() {
  bgColor = tabColors[tabs.indexOf(currentGrp)];
  currentGrp.visible = true;
  closeGrp.visible = true;
  imgGrp.visible = true;

  tabsGrp.children[0].visible = false;
  prefGrp.visible = false;
  closeErrBtn.visible = false;

  if (currentGrp == tabsGrp.children[0]) {
    closeGrp.visible = false;
    tabsGrp.children[0].visible = true;
    prefGrp.visible = true;
  }
  if (currentGrp == preferences) {
    bgColor = prefGrpColor;
  }
  errImgGrp.visible = false;
  progImgGrp.visible = false;
  progressGrp.visible = false;

  setBgColor(w, bgColor);
}

//
function replaceErrImage() {
  var r = getRndInteger(0, errImgArray.length);

  errImgGrp.remove(errImg);
  errImg = errImgGrp.add('image', undefined, errImgArray[r]);
  w.layout.layout(true);
  w.layout.resize();

  return errImg;
}

// show error message...
function showTabErr(msg) {
  var lol = 'Σ(っ °Д °;)っ        ';
  errTxt.text = lol + msg;
  errImgGrp.visible = true;
  closeGrp.visible = true;
  errTabGrp.visible = true;
  closeErrBtn.visible = true;

  prefGrp.visible = false;
  currentGrp.visible = false;
  tabsGrp.children[0].visible = false;
  closeBtn.visible = false;
  imgGrp.visible = false;
  progImgGrp.visible = false;
  errImg.helpTip = msg;
  errImg = replaceErrImage();

  setBgColor(w, errGrpColor);
  clearOutput();
  write(msg);
}

// show progress blocking user interaction...
function showTabProg(msg) {
  progTxt1.text = 'KEEP CALM';
  progTxt2.text = msg;
  progressGrp.visible = true;
  progImgGrp.visible = true;
  progImgGrp.helpTip = msg;

  closeGrp.visible = false;
  prefGrp.visible = false;
  currentGrp.visible = false;
  tabsGrp.children[0].visible = false;
  closeBtn.visible = false;
  closeErrBtn.visible = false;
  imgGrp.visible = false;
  errImgGrp.visible = false;

  setBgColor(w, errGrpColor);
  clearOutput();
  write(msg);
}

// all tabs except preferences...
function getTabGroups() {
  var tabsGroups = [];

  for (var t = 0; t < tabsGrp.children.length - 1; t++) {
    tabsGroups.push(tabsGrp.children[t]);
  }

  return tabsGroups;
}

// all tab subgroups except keyStatsGrp...
function getTabSubGroups() {
  var tabSubGrps = [];

  for (var st = 0; st < tabs.length; st++) {
    for (var g = 0; g < tabs[st].children.length; g++) {
      var subGrp = tabs[st].children[g];

      if (subGrp.toString() != '[object Group]') continue;
      if (subGrp.properties != undefined) continue;

      tabSubGrps.push(tabs[st].children[g]);
    }
  }
  return tabSubGrps;
}
