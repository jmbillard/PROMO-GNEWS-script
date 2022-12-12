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

    colorBtn.size = [20, 20];
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
  
  var hMargin = 68;
  var vMargin = 40;
  
  // horizontal layout
  if (wLayout == 'row') {
    ltAlignment = 'left';
    rbAlignment = 'right';
    
    // [left, top, right, bottom]
    mainGrp.margins = [80, 0, 0, 0];
    tabsGrp.menu.margins = [hMargin, 0, hMargin, 0];
    leftGrp.margins = [5, 0, 0, 0];

    divHeight = 20;
    // color buttons
    for (var c1 = 1; c1 < colorSubGrp1.children.length; c1++) {
      colorSubGrp1.children[c1].minimumSize = [20, 20];
      colorSubGrp1.children[c1].maximumSize = [20, 20];
      colorSubGrp1.children[c1].size = [20, 20];
    }
    for (var c2 = 1; c2 < colorSubGrp2.children.length; c2++) {
      colorSubGrp2.children[c2].minimumSize = [10, 20];
      colorSubGrp2.children[c2].maximumSize = [20, 20];
      colorSubGrp2.children[c2].size = [(w.size.width - 500) /22, 20];
    }
    for (var c3 = 1; c3 < colorSubGrp3.children.length; c3++) {
      colorSubGrp3.children[c3].minimumSize = [10, 20];
      colorSubGrp3.children[c3].maximumSize = [20, 20];
      colorSubGrp3.children[c3].size = [(w.size.width - 500) /22, 20];
    }
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
    ltAlignment = 'bottom';
    rbAlignment = 'top';

    // [left, top, right, bottom]
    mainGrp.margins = [0, 0, 0, 30];
    tabsGrp.menu.margins = [0, vMargin, 0, vMargin];
    leftGrp.margins = [0, 0, 0, 5];

    divHeight = 10;
    // color buttons
    for (var b1 = 1; b1 < colorSubGrp1.children.length; b1++) {
      colorSubGrp1.children[b1].minimumSize = [vMin, 10];
      colorSubGrp1.children[b1].maximumSize = [80, 20];
      colorSubGrp1.children[b1].size = [w.size.width - 8, (w.size.height - 400) / 22];
    }
    for (var b2 = 1; b2 < colorSubGrp2.children.length; b2++) {
      colorSubGrp2.children[b2].minimumSize = [vMin, 10];
      colorSubGrp2.children[b2].maximumSize = [80, 20];
      colorSubGrp2.children[b2].size = [w.size.width - 8, (w.size.height - 400) / 22];
    }
    for (var b3 = 1; b3 < colorSubGrp3.children.length; b3++) {
      colorSubGrp3.children[b3].minimumSize = [vMin, 10];
      colorSubGrp3.children[b3].maximumSize = [80, 20];
      colorSubGrp3.children[b3].size = [w.size.width - 8, (w.size.height - 400) / 22];
    }
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
  
  // text tab - controls
  limitSld.size.width = w.size.width - 16;

  // animation tab - controls
  easeSld1.size.width = w.size.width - 16;
  easeSld2.size.width = w.size.width - 16;
  
  // project tab - controls
  projIdTxt.size.width = w.size.width - 8;
  projNameTxt.size.width = w.size.width - 8;
  
  // links tab - controls
  linkTxt2.size.width = w.size.width - 8;

  // dev tab - controls
  zipTxt1.size.width = w.size.width - 8;

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

  // all dividers
  for (var d = 0; d < tabDividers.length; d++) {
    tabDividers[d].size.height = divHeight;
  }

  leftGrp.alignment = ltAlignment;
  rightGrp.alignment = rbAlignment;

  if (w.size.width < 70) {
    GNEWS_LOGO.visible = false;
    GNEWS_LOGO.size.width = 0;
    progImg.size.width = 0;
    aboutTxt.text = '...';
    aboutTxt.size.width = vMin;
  } else {
    GNEWS_LOGO.visible = true;
    GNEWS_LOGO.size.width = 70;
    progImg.size.width = 70;
    aboutTxt.text = vStr;
    aboutTxt.size.width = 60;
  }
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

      tabSubGrps.push(subGrp);
    }
  }
  return tabSubGrps;
}

// all tab subgroups except keyStatsGrp...
function getTabDividers() {
  var tabDividers = [];

  for (var st = 0; st < tabs.length; st++) {
    
    for (var g = 0; g < tabs[st].children.length; g++) {
      var div = tabs[st].children[g];

      if (div.properties == undefined) continue;
      if (div.properties.name == 'div') tabDividers.push(div);
    }
  }
  return tabDividers;
}

// all tab subgroups except keyStatsGrp...
function getLabels() {
  var uiLabels = [];

  for (var st = 0; st < tabSubGrps.length; st++) {
    
    for (var l = 0; l < tabSubGrps[st].children.length; l++) {
      var lab = tabSubGrps[st].children[l];

      if (lab.properties == undefined) continue;
      if (lab.properties.name != 'label') continue;
      
      tabDividers.push(lab);

      setTxtColor(lab, sTxtColor);
      lab.minimumSize = [vMin, 20];
      lab.justify = 'center';
      lab.helpTip = lab.text;
      lab.properties.truncate = 'end';
    }
  }
  return uiLabels;
}
