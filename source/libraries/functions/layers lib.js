/*

---------------------------------------------------------------
> 🖌️ layers
---------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061
//  jshint -W085
//  jshint -W043

/*

---------------------------------------------------------------
> shape layers
---------------------------------------------------------------

*/

// cria shape null layers..
function shpNull() {
	var aItem = app.project.activeItem;
	var shpLayer = aItem.layers.addShape();
	var shpGroup = shpLayer.property('ADBE Root Vectors Group');
	var shpRect = shpGroup.addProperty('ADBE Vector Shape - Rect');
	shpRect.name = 'null';
	shpRect.property('ADBE Vector Rect Size').setValue([100, 100]);

	return shpLayer;
}
// cria shape adjustment layers..
function shpAdjustment() {
	var aItem = app.project.activeItem;
	var shpLayer = aItem.layers.addShape();
	var shpGroup = shpLayer.property('ADBE Root Vectors Group');
	var shpRect = shpGroup.addProperty('ADBE Vector Shape - Rect');
	var expStr = '[thisComp.width, thisComp.height];';

	shpRect.name = 'adjustment';
	shpRect
		.property('ADBE Vector Rect Size')
		.setValue([aItem.width, aItem.height]);
	shpRect.property('ADBE Vector Rect Size').expression = expStr;

	var shpFill = shpGroup.addProperty('ADBE Vector Graphic - Fill');
	shpFill.property('ADBE Vector Fill Color').setValue([1, 1, 1, 1]);
	shpFill.name = 'adjustment fill';

	return shpLayer;
}

function shpPallet(aLayer, colorArray) {
	var s = 50; // color swatch size...
	var gap = 10; // gap between swatches...
	var posY = ((colorArray.length - 1) * (s + gap)) / 2; // initial vertical offset...
	// vector content...
	var contents = aLayer.property('ADBE Root Vectors Group'); // vector contents...
	// main color pallet group...
	var pallet = contents.addProperty('ADBE Vector Group');

	// 1 swatch for every color...
	for (var c = 0; c < colorArray.length; c++) {
		var color = colorArray[c];
		var Hex = rgbToHex(color).replace('0x', '#').toUpperCase();
		var colorGroup = pallet
			.addProperty('ADBE Vectors Group')
			.addProperty('ADBE Vector Group');
		var colorSubGroup = colorGroup.addProperty('ADBE Vectors Group');
		var colorSwatch = colorSubGroup.addProperty(
			'ADBE Vector Shape - Rect'
		);
		colorSwatch.property('ADBE Vector Rect Size').setValue([s, s]);
		colorSwatch
			.property('ADBE Vector Rect Position')
			.setValue([0, c * (s + gap) - posY]);
		var colorFill = colorSubGroup.addProperty(
			'ADBE Vector Graphic - Fill'
		);
		colorFill.property('ADBE Vector Fill Color').setValue(color);
		colorFill.name = 'GNEWS ' + Hex;
		colorGroup.name = Hex;
	}
	return pallet;
}

function colorPallet() {
	// shape layer creation...
	var layer = app.project.activeItem.layers.addShape();

	// main pallet vector group...
	var pallet1 = shpPallet(layer, GNEWS_mainColors1.concat(GNEWS_mainColors2));
	pallet1
		.property('ADBE Vector Transform Group')
		.property('ADBE Vector Position')
		.setValue([45, 540]);
	pallet1.name = 'pallet 1';
	// secondary pallet vector group...
	var pallet2 = shpPallet(layer, GNEWS_secColors);
	pallet2
		.property('ADBE Vector Transform Group')
		.property('ADBE Vector Position')
		.setValue([1875, 540]);
	pallet2.name = 'pallet 2';

	// transformations...
	var transform = layer.property('ADBE Transform Group');
	transform.property('ADBE Anchor Point').expression =
		'// locked...\n[0,0];';
	transform.property('ADBE Position').expression =
		'// locked...\n[0,0];';
	transform.property('ADBE Scale').expression =
		'// locked...\n[100,100];';
	transform.property('ADBE Rotate Z').expression = '// locked...\n0;';
	transform.property('ADBE Opacity').expression =
		'// locked...\n100;';

	// layer attributes...
	layer.name = 'shp_cores';
	layer.guideLayer = true;
	layer.selected = false;
	layer.locked = true;

	return layer;
}

function shpArrow(body, head) {
	var rootVGrp = 'ADBE Root Vectors Group';
	var vGrp = 'ADBE Vector Group';
	var vsGrp = 'ADBE Vectors Group';
	var exp = '';

	var shpLayer = app.project.activeItem.layers.addShape();
	var contents = shpLayer.property(rootVGrp);

	// body
	var bodyGrp = contents.addProperty(vGrp);
	var bodyShp = bodyGrp
		.property(vsGrp)
		.addProperty('ADBE Vector Shape - Group');
	bodyShp.property('ADBE Vector Shape').setValue(body);
	bodyShp.name = 'body path';
	var bodyStk = bodyGrp
		.property(vsGrp)
		.addProperty('ADBE Vector Graphic - Stroke');
	exp = 'effect("arrow rig")("body stroke size").value;';
	bodyStk.property('ADBE Vector Stroke Width').expression = exp;
	bodyStk.property('ADBE Vector Stroke Line Cap').setValue(2);
	exp = 'effect("arrow rig")("color").value;';
	bodyStk.property('ADBE Vector Stroke Color').expression = exp;
	exp = 'value * effect("arrow rig")("show body").value;';
	bodyGrp.property('ADBE Vector Transform Group').opacity.expression =
		exp;
	bodyGrp.name = 'body';

	// round corners
	var roundCorners = contents.addProperty('ADBE Vector Filter - RC');
	exp = 'effect("arrow rig")("round corners").value;';
	roundCorners.property('ADBE Vector RoundCorner Radius').expression =
		exp;

	// trim paths
	var trimPath = contents.addProperty('ADBE Vector Filter - Trim');
	exp = 'effect("arrow rig")("path").value;';
	trimPath.property('ADBE Vector Trim End').expression = exp;

	// head
	var headGrp = contents.addProperty(vGrp);
	var headShp = headGrp
		.property(vsGrp)
		.addProperty('ADBE Vector Shape - Group');
	headShp.property('ADBE Vector Shape').setValue(head);
	headShp.name = 'head path';
	var headStk = headGrp
		.property(vsGrp)
		.addProperty('ADBE Vector Graphic - Stroke');
	exp = 'var w = effect("arrow rig")("head stroke size").value;\n';
	exp += 'var s = effect("arrow rig")("head scale").value / 100;\n\n';
	exp += 'w / s;';
	headStk.property('ADBE Vector Stroke Width').expression = exp;
	headStk.property('ADBE Vector Stroke Line Cap').setValue(2);
	exp = 'effect("arrow rig")("color").value;';
	headStk.property('ADBE Vector Stroke Color').expression = exp;
	exp = 'var progress = content("Trim Paths 1").end / 100;\n';
	exp +=
		'var pathShp = content("body").content("body path").path;\n\n';
	exp += 'pathShp.pointOnPath(progress);';
	headGrp.property(
		'ADBE Vector Transform Group'
	).position.expression = exp;
	exp = 'var s = effect("arrow rig")("head scale").value;\n\n';
	exp += '[s, s];';
	headGrp.property('ADBE Vector Transform Group').scale.expression =
		exp;
	exp = 'var orientChk = effect("arrow rig")("auto orient").value;\n';
	exp += 'var pathShp = content("body").content("body path").path;\n';
	exp += 'var progress = content("Trim Paths 1").end / 100;\n';
	exp += 'var pathTan = pathShp.tangentOnPath(progress);\n\n';
	exp +=
		'value + (radiansToDegrees(Math.atan2(pathTan[1],pathTan[0])) * orientChk);';
	headGrp.property(
		'ADBE Vector Transform Group'
	).rotation.expression = exp;
	exp = 'value * effect("arrow rig")("show head").value;';
	headGrp.property('ADBE Vector Transform Group').opacity.expression =
		exp;
	headGrp.name = 'head';

	return shpLayer;
}

/*

---------------------------------------------------------------
> text layers
---------------------------------------------------------------

*/

// returns text layer content...
function textContent(aLayer) {
	if (aLayer == null) return '';

	if (!(aLayer instanceof TextLayer)) return '';

	return aLayer
		.property('ADBE Text Properties')
		.property('ADBE Text Document')
		.value.toString();
}

function setTxtCase(selLayer, caseType) {
	if (selLayer instanceof TextLayer) {
		var srcTxt = selLayer
			.property('ADBE Text Properties')
			.property('ADBE Text Document');
		var txt = srcTxt.value;

		switch (caseType) {
			case 0:
				srcTxt.setValue(txt.toString().toUpperCase());
				break;

			case 1:
				srcTxt.setValue(txt.toString().toLowerCase());
				break;

			case 2:
				srcTxt.setValue(titleCase(txt.toString()));
		}
	} else {
		return false;
	}
}

// cleans multiple line breaks and consecutive space characters...
function cleanText(sLayer) {
	if (!(sLayer instanceof TextLayer)) {
		return;
	}

	var srcTxt = sLayer
		.property('ADBE Text Properties')
		.property('ADBE Text Document');
	var txt = srcTxt.value;

	txt = txt
		.toString()
		.replace(/[\r|\n][\s]{2,}/g, '\n')
		.replace(/\s{2,}/g, ' ');

	srcTxt.setValue(txt.trim());
}

// [ ] get column number from first line...
// divides a text layer in multiple columns...
function columnText(sLayer) {
	var srcTxt = textContent(sLayer);
	var txt = srcTxt.replace(/\s*[\r\n]{1,}\s*/g, '*|*')
		.replace(/\s*\-{3,}\s*/g, '*|*')
		.replace(/\s{2,}/g, '*|*');
	var columnsNum = srcTxt.split(/[\r\n]+/g)[0]
		.replace(/\s*\-{3,}\s*/g, '*|*')
		.replace(/\s{2,}/g, '*|*')
		.split('*|*')
		.length;
	var cellArray = txt.split('*|*');

	if (cellArray.length < 2) return [];

	var cols = [];
	var colLayers = [];

	for (var c = 0; c < columnsNum; c++) {
		cols.push([]);
	}
	for (var i = 0; i < cellArray.length; i++) {
		var cI = (columnsNum - ((i + 1) % columnsNum)) - 1;
		cols[cI].push(cellArray[i]);
	}
	for (i = 0; i < columnsNum; i++) {
		var colName = cols[i][0];
		var colTxt = cols[i][0];
		var colLayer;

		for (c = 1; c < cols[i].length; c++) {
			colTxt = colTxt + '\n' + cols[i][c];
		}
		colLayer = app.project.activeItem.layers.addText(colTxt);
		colLayer.name = colName;
		colLayers.push(colLayer);
	}

	return colLayers;
}
