/* eslint-disable no-with */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
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

function setTxtHighlight(sTxt, color) {
	setTxtColor(sTxt, color);

	sTxt.addEventListener('mouseover', function () {
		setTxtColor(sTxt, ([138 / 255, 138 / 255, 138 / 255, 1]));
	});
	sTxt.addEventListener('mouseout', function () {
		setTxtColor(sTxt, color);
	});
}

// simulates a button click with other control obj...
function setTxtBtnLink(sTxt, btn) {
	sTxt.addEventListener('mousedown', function () {
		btn.notify();
	});
}

function setLayout() {
	wLayout = w.size.width > w.size.height ? 'row' : 'column';

	var hOffset = devMode ? 0 : iconSize[3] / 2;
	if (w.size.width > 1380) hOffset = hOffset * 4;
	var hMargin = 90 + hOffset;
	var vMargin = 40 + hOffset;

	aboutTxt.text = !hardNews ? vStr : vStr + ' HN';

	for (var lab = 0; lab < tabLabels.length; lab++) {
		tabLabels[lab].size.width = w.size.width - 24;
	}

	// horizontal layout
	if (wLayout == 'row') {
		ltAlignment = 'left';
		rbAlignment = 'right';

		// [left, top, right, bottom]
		mainGrp.margins = [80, 0, 0, 0];
		tabsGrp.menu.margins = [hMargin, 0, hMargin, 0];
		leftGrp.margins = [5, 0, 0, 0];

		// color buttons
		for (var c1 = 1; c1 < colorSubGrp1.children.length; c1++) {
			colorSubGrp1.children[c1].minimumSize = [20, 20];
			colorSubGrp1.children[c1].maximumSize = [20, 20];
			colorSubGrp1.children[c1].size = [20, 20];
		}
		for (var c2 = 1; c2 < colorSubGrp2.children.length; c2++) {
			colorSubGrp2.children[c2].minimumSize = [10, 20];
			colorSubGrp2.children[c2].maximumSize = [20, 20];
			colorSubGrp2.children[c2].size = [(w.size.width - 520) / 22, 20];
		}
		for (var c3 = 1; c3 < colorSubGrp3.children.length; c3++) {
			colorSubGrp3.children[c3].minimumSize = [10, 20];
			colorSubGrp3.children[c3].maximumSize = [20, 20];
			colorSubGrp3.children[c3].size = [(w.size.width - 520) / 22, 20];
		}
		// error tab
		errTxt.visible = true;
		errTxt.size.width = 500;
		progTxt1.visible = true;
		// progress tab
		progTxt1.size.width = 160;
		progTxt2.visible = true;
		progTxt2.size.width = 160;

		var mainMenuLabelsMaxW = [
			55, // control
			65, // animation
			45, // effects
			70, // text utilities
			40, // brand
			45, // project
			55, // shortcuts
			60, // templates
			65, // text search
			50, // preview
			65, // app utilities
			50  // dev tools
		];

		for (var mlh = 0; mlh < mainMenuLabels.length; mlh++) {
			mainMenuLabels[mlh].maximumSize.width = mainMenuLabelsMaxW[mlh];
			mainMenuLabels[mlh].size.width = mainMenuLabelsMaxW[mlh];

			if (w.size.width < 1380 || !showLabels) {
				mainMenuLabels[mlh].size.width = 0;
				mainMenuLabels[mlh].parent.spacing = 0;
			}
		}
		if (w.size.width > 1380) {
			tabsGrp.menu.margins = [0, 0, 0, 0];
		}

	} else {
		// vertical layout
		ltAlignment = 'bottom';
		rbAlignment = 'top';

		// [left, top, right, bottom]
		mainGrp.margins = [0, 0, 0, iconSize[3] - hOffset - 4];
		tabsGrp.menu.margins = [0, vMargin, 0, vMargin];
		leftGrp.margins = [0, 0, 0, 5];

		// color buttons
		for (var b1 = 1; b1 < colorSubGrp1.children.length; b1++) {
			colorSubGrp1.children[b1].minimumSize = [vMin, 20];
			colorSubGrp1.children[b1].maximumSize = [80, 20];
			colorSubGrp1.children[b1].size = [w.size.width - 8, (w.size.height - 402) / 22];
		}
		for (var b2 = 1; b2 < colorSubGrp2.children.length; b2++) {
			colorSubGrp2.children[b2].minimumSize = [vMin, 10];
			colorSubGrp2.children[b2].maximumSize = [80, 20];
			colorSubGrp2.children[b2].size = [w.size.width - 8, (w.size.height - 402) / 22];
		}
		for (var b3 = 1; b3 < colorSubGrp3.children.length; b3++) {
			colorSubGrp3.children[b3].minimumSize = [vMin, 10];
			colorSubGrp3.children[b3].maximumSize = [80, 20];
			colorSubGrp3.children[b3].size = [w.size.width - 8, (w.size.height - 402) / 22];
		}
		// error tab
		errTxt.visible = false;
		errTxt.size.width = 0;
		// progress tab
		progTxt1.visible = false;
		progTxt1.size.width = 0;
		progTxt2.visible = false;
		progTxt2.size.width = 0;

		GNEWS_LOGO.size.width = w.size.width - 8;
		progImg.size.width = w.size.width - 8;

		for (var mlv = 0; mlv < mainMenuLabels.length; mlv++) {
			mainMenuLabels[mlv].maximumSize.width = 70;
			mainMenuLabels[mlv].size.width = w.size.width - 60;

			if (w.size.width < 100 || !showLabels) {
				mainMenuLabels[mlv].size.width = 0;
				mainMenuLabels[mlv].parent.spacing = 0;
			}
		}
		if (w.size.width < vMin + 8) {
			GNEWS_LOGO.size.width = 0;
			progImg.size.width = 0;
			aboutTxt.text = '...';
		}
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
	leftGrp.alignment = ltAlignment;
	rightGrp.alignment = rbAlignment;

	devBtn.size = devMode ? [36, 36] : [0, 0];
	if (w.size.width > 1380 && showLabels) devLab.size = devMode ? [60, 12] : [0, 0];

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
	if (currentGrp != tabsGrp.menu) infoBtn.visible = true;

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
	
	infoBtn.visible = false;
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
	alert('ヽ(✿ﾟ▽ﾟ)ノ     please restart the script!\njust close and reopen the script window...');

	progTxt1.text = 'KEEP CALM';
	progTxt2.text = msg;
	progressGrp.visible = true;
	progImgGrp.visible = true;
	progImgGrp.helpTip = msg;
	
	infoBtn.visible = false;
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
	for (var g = 0; g < tabsGrp.menu.children.length; g++) {
		var div = tabsGrp.menu.children[g];

		if (div.toString() != '[object Panel]') continue;
		div.alignment = 'fill';
	}
	return tabDividers;
}

// all tab subgroups except keyStatsGrp...
function getTabLabels() {
	var tabLabels = [];

	for (var st = 1; st < tabs.length; st++) {
		var uiLabels = getStaticTextLabels(tabs[st], []);

		for (var l = 0; l < uiLabels.length; l++) {
			var lab = uiLabels[l];

			if (lab.properties == undefined) continue;
			if (lab.properties.name != 'label') continue;

			tabLabels.push(lab);

			lab.justify = 'center';
			lab.helpTip = lab.text;
			lab.minimumSize = [vMin, 12];
		}
	}
	return tabLabels;
}

function highlighMenuLabels() {
	var uiLabels = getStaticTextLabels(tabsGrp.menu, []);

	for (var l = 0; l < uiLabels.length; l++) {
		var lab = uiLabels[l];
		setTxtHighlight(lab, sTxtColor[iconTheme]);
		setTxtBtnLink(lab, lab.parent.children[0]);
	}
}

function getStaticTextLabels(grp, resultArray) {

	for (var g = 0; g < grp.children.length; g++) {
		var subGrp = grp.children[g];

		if (subGrp.toString() == '[object Group]') {
			subGrp.spacing = 4;
			getStaticTextLabels(subGrp, resultArray);

		} else {
			var lab = subGrp;

			if (lab.properties == undefined) continue;
			if (lab.properties.name != 'label') continue;

			resultArray.push(lab);

			setTxtColor(lab, sTxtColor[iconTheme]);
		}
	}
	return resultArray;
}
