/*

---------------------------------------------------------------
> 📟 ui and layout
---------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061
//  jshint -W085
//  jshint -W043
//  jshint -W083

//
function createColorButtons(colorArray, colorGrp) {
  for (var c = 0; c < colorArray.length; c++) {
    var hex = rgbToHEX(colorArray[c]); // -> '#FFFFFF'
    var rgb = colorArray[c] * 255; // -> [255,255,255,255]
    var colorBtn = colorGrp.add('iconbutton', undefined, undefined, { name: hex, style: 'toolbutton' });

    colorBtn.size = [10, 20];
    setBtnColor(colorBtn, colorArray[c]);
    colorBtn.onDraw = customDraw;
    colorBtn.helpTip = 'R: ' + rgb[0] + '\nG: ' + rgb[1] + '\nB: ' + rgb[2] + '\nHEX: ' + hex;
  }
}

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
  
  var hMargin = 50;
  var vMargin = 10;
  
  // horizontal layout
  if (wLayout == 'row') {
    imgAlignment = 'left';
    closeAlignment = 'right';

    mainGrp.margins = [90, 0, 0, 0];
    tabsGrp.menu.margins = [hMargin, 0, hMargin, 0];
    leftGrp.margins = [5, 0, 0, 0];

    // color buttons
    for (var c1 = 1; c1 < colorSubGrp1.children.length; c1++) {
      colors1Grp.children[c1].size = [10, 20];
    }
    for (var c2 = 1; c2 < colorSubGrp2.children.length; c2++) {
      colors2Grp.children[c2].size = [10, 20];
    }
    for (var c3 = 1; c3 < colorSubGrp3.children.length; c3++) {
      colors3Grp.children[c3].size = [10, 20];
    }
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
    projIdTxt.size.width = 70;
    projNameTxt.size.width = 120;
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
    closeAlignment = 'top';

    mainGrp.margins = [0, 0, 0, 20];
    tabsGrp.menu.margins = [0, vMargin, 0, vMargin];
    leftGrp.margins = [0, 0, 0, 5];

    // color buttons
    for (var b1 = 1; b1 < colorSubGrp1.children.length; b1++) {
      colors1Grp.children[b1].size = [66, 15];
    }
    for (var b2 = 1; b2 < colorSubGrp2.children.length; b2++) {
      colors2Grp.children[b2].size = [66, 15];
    }
    for (var b3 = 1; b3 < colorSubGrp3.children.length; b3++) {
      colors3Grp.children[b3].size = [66, 15];
    }
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
    // error tab
    errTxt.visible = false;
    errTxt.size.width = 0;
    // progress tab
    progTxt1.visible = false;
    progTxt1.size.width = 0;
    progTxt2.visible = false;
    progTxt2.size.width = 0;
  }
  imgGrp.orientation = wLayout;

  // all tab subgroups
  for (var s = 0; s < tabSubGrps.length; s++) {
    tabSubGrps[s].orientation = wLayout;
    tabSubGrps[s].spacing = 2;
  }
  
  // all tabs
  for (var t = 0; t < tabs.length; t++) {
    tabs[t].orientation = wLayout;
    tabs[t].spacing = 8;
  }

  tabsGrp.dev.spacing = 8;

  leftGrp.alignment = imgAlignment;
  rightGrp.alignment = closeAlignment;

  updateLayout();
}

function updateLayout() {
  w.layout.layout(true);
  w.layout.resize();
}

// turns off all tab groups visibility...
function hideTabs() {
  // tabs[0] → tabsGrp.menu
  for (var t = 1; t < tabs.length; t++) {
    tabs[t].visible = false;
  }
  errTabGrp.visible = false;
  closeGrp.visible = false;
}

// turns on the respective tab group visibility...
function openTab() {
  infoBtn.visible = true;
  aboutTxt.visible = false;
  bgColor = tabColors[tabs.indexOf(currentGrp)];
  currentGrp.visible = true;
  closeGrp.visible = true;
  imgGrp.visible = true;

  tabsGrp.menu.visible = false;
  prefGrp.visible = false;
  closeErrBtn.visible = false;

  if (currentGrp == tabsGrp.menu) {
    closeGrp.visible = false;
    tabsGrp.menu.visible = true;
    prefGrp.visible = true;
  }
  progImgGrp.visible = false;
  progressGrp.visible = false;

  setBgColor(w, bgColor);
}

// show error message...
function showTabErr(msg) {
  var lol = 'Σ(っ °Д °;)っ        ';
  errTxt.text = lol + msg;
  closeGrp.visible = true;
  errTabGrp.visible = true;
  closeErrBtn.visible = true;

  prefGrp.visible = false;
  currentGrp.visible = false;
  tabsGrp.menu.visible = false;
  closeBtn.visible = false;
  imgGrp.visible = false;
  progImgGrp.visible = false;

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
  tabsGrp.menu.visible = false;
  closeBtn.visible = false;
  closeErrBtn.visible = false;
  imgGrp.visible = false;

  setBgColor(w, errGrpColor);
  clearOutput();
  write(msg);
}

// all tabs except preferences...
function getTabGroups() {
  var tabsGrpArray = [];

  for (var t = 0; t < tabsGrp.children.length; t++) {
    tabsGrpArray.push(tabsGrp.children[t]);
  }
  return tabsGrpArray;
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
