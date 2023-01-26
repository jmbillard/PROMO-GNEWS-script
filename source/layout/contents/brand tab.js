/* eslint-disable no-with */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
/*

---------------------------------------------------------------
> color, guides and branding tab
---------------------------------------------------------------

*/

currentGrp = tabsGrp.brand;

// ui GNEWS color buttons...
//var colorsGrp = currentGrp.add('group');

var colorSubGrp1 = currentGrp.add('group');
var colors1Txt = colorSubGrp1.add('statictext', undefined, 'main:', { name: 'label' , truncate: 'end'});
colors1Txt.maximumSize.width = 30;

//---------------------------------------------------------


var colorSubGrp2 = currentGrp.add('group');
var colors2Txt = colorSubGrp2.add('statictext', undefined, 'mono:', { name: 'label' , truncate: 'end'});
colors2Txt.maximumSize.width = 35;

//---------------------------------------------------------

var colorSubGrp3 = currentGrp.add('group');
var colors3Txt = colorSubGrp3.add('statictext', undefined, 'sec:', { name: 'label' , truncate: 'end'});
colors3Txt.maximumSize.width = 30;


// main colors...
createColorButtons(GNEWS_mainColors1, colorSubGrp1);
// mono colors...
createColorButtons(GNEWS_mainColors2, colorSubGrp2);
// secondary colors...
createColorButtons(GNEWS_secColors, colorSubGrp3);

//---------------------------------------------------------

var shpPalletBtn = currentGrp.add('iconbutton', iconSize, palletIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
shpPalletBtn.helpTip = 'color pallet as shape layer';

//---------------------------------------------------------

currentGrp.add('panel');
 

var colorSubGrp4 = currentGrp.add('group');

var arrowOnAirBtn = colorSubGrp4.add('iconbutton', iconSize, arrowOnAirIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
arrowOnAirBtn.helpTip = 'arrow on-air';

var logoStaticBtn = colorSubGrp4.add('iconbutton', iconSize, newsStaticIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
logoStaticBtn.helpTip = 'GNEWS logo static';

var logoAnim3sBtn = colorSubGrp4.add('iconbutton', iconSize, newsAnimIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
logoAnim3sBtn.helpTip = 'GNEWS logo 3 seconds animation';

/*

  ---------------------------------------------------------------
  > color, guides and branding events
  ---------------------------------------------------------------

*/

//  linter settings:
//  jshint -W083

for (var i = 1; i < colorSubGrp1.children.length; i++) {
	colorSubGrp1.children[i].onClick = function () {
		var hex = this.properties.name;

		batchFill(hex, hexToRGB(hex));
	};
}

for (var j = 1; j < colorSubGrp2.children.length; j++) {
	colorSubGrp2.children[j].onClick = function () {
		var hex = this.properties.name;

		batchFill(hex, hexToRGB(hex));
	};
}

for (var l = 1; l < colorSubGrp3.children.length; l++) {
	colorSubGrp3.children[l].onClick = function () {
		var hex = this.properties.name;

		batchFill(hex, hexToRGB(hex));
	};
}

//---------------------------------------------------------

shpPalletBtn.onClick = function () {
	var aItem = app.project.activeItem;
	// error...
	if (!(aItem instanceof CompItem)) {
		showTabErr('comp not selected');
		return;
	}
	app.beginUndoGroup('pallet');

	var palletLayer = colorPallet();

	palletLayer.name = 'pallet - GNEWS';
	palletLayer.guideLayer = true;
	palletLayer.locked = true;
	palletLayer.property('ADBE Transform Group')
		.property('ADBE Position')
		.expression('[0,0]');

	app.endUndoGroup();
};

//---------------------------------------------------------

arrowOnAirBtn.onClick = function () {
	var aItem = app.project.activeItem;
	// error...
	if (!(aItem instanceof CompItem)) {
		showTabErr('comp not selected');
		return;
	}
	app.beginUndoGroup('logo GNEWS');

	shp_arrow();

	app.endUndoGroup();
};

//---------------------------------------------------------

logoStaticBtn.onClick = function () {
	var aItem = app.project.activeItem;
	// error...
	if (!(aItem instanceof CompItem)) {
		showTabErr('comp not selected');
		return;
	}
	app.beginUndoGroup('logo GNEWS');

	shpMarcaGnewsStatic();

	app.endUndoGroup();
};

//---------------------------------------------------------

logoAnim3sBtn.onClick = function () {
	var aItem = app.project.activeItem;

	// error...
	if (!(aItem instanceof CompItem)) {
		showTabErr('comp not selected');
		return;
	}
	app.beginUndoGroup('logo GNEWS 3s');

	var layer = app.project.activeItem.layers.addShape();
	layer.startTime = aItem.time;
	layer.name = 'marca_gnews 3s';

	addPseudoEffect('marca_3s', toolMarca3s);
	app.endUndoGroup();
};
