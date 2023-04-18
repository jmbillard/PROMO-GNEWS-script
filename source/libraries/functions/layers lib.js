/* eslint-disable no-prototype-builtins */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
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
function shpAdjustment(comp) {
	var shpLayer = comp.layers.addShape();
	var shpGroup = shpLayer.property('ADBE Root Vectors Group');
	var shpRect = shpGroup.addProperty('ADBE Vector Shape - Rect');
	var expStr = '[thisComp.width, thisComp.height];';

	shpRect.name = 'adjustment';
	shpRect.property('ADBE Vector Rect Size')
		.setValue([comp.width, comp.height]);
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
		.value.toString()
		.trim();
}

// cleans multiple line breaks and consecutive space characters...
function cleanText(aLayer) {
	if (!(aLayer instanceof TextLayer)) return;

	var srcTxt = aLayer
		.property('ADBE Text Properties')
		.property('ADBE Text Document');
	var lineArray = textContent(aLayer).split(/[\n|\r]+/);

	for (var t = 0; t < lineArray.length; t++) {
		lineArray[t] = lineArray[t]
			.replace(/\s{2,}/g, ' ')
			.trim();
	}
	srcTxt.setValue(lineArray.join('\n'));
}

// divides a text layer in multiple columns...
function columnText(sLayer) {
	var srcTxt = textContent(sLayer);
	var txt = srcTxt.replace(/\s*[\r\n]{1,}\s*/g, '*|*')
		.replace(/\s*-{3,}\s*/g, '*|*')
		.replace(/\s{2,}/g, '*|*');
	var columnsNum = srcTxt.split(/[\r\n]+/g)[0]
		.replace(/\s*-{3,}\s*/g, '*|*')
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

/*

---------------------------------------------------------------
> general...
---------------------------------------------------------------

*/

function createNull(nullType) {
	var nullLayer = nullType == 0 ? shpNull() : aItem.layers.addNull();
	nullLayer.guideLayer = true;
	nullLayer.name = nullPrefix;
	nullLayer.label = 1;

	return nullLayer;
}

function layersVND(comp) {

	// expressions variable...
	var exp;

	// keyframe ease objects variable...
	var easeIn1;
	var easeOut1;

	// shape object variable...
	var shp;

	// shape layer creation...
	var divLayer = comp.layers.addShape();

	// divLayer marker 1...
	var t1 = 0;
	var marker1 = new MarkerValue('coloque o footage em baixo');
	marker1.label = 13;
	marker1.duration = 0;
	divLayer.property('ADBE Marker').setValueAtTime(t1, marker1);

	// layer attributes...
	divLayer.name = '----------------';
	divLayer.label = 8;
	divLayer.guideLayer = true;
	divLayer.locked = true;

	//-----------------------------------------------------------------------

	// shape layer creation...
	footageAnimLayer = shpAdjustment(comp);

	// masks...
	var masks = footageAnimLayer.property('ADBE Mask Parade');
	mask1_masks1 = masks.addProperty('ADBE Mask Atom');
	mask1_masks1.name = 'Mask 1';

	// mask 1 mask path animation...

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.outTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.vertices = [[972.00, 180.00], [-968.00, 180.00], [-968.00, 552.00], [972.00, 552.00]];

	// key 1...
	mask1_masks1.property('ADBE Mask Shape').setValueAtTime(2.56923590256924, shp);

	easeIn1 = new KeyframeEase(0.00, 33.33);
	easeOut1 = new KeyframeEase(0.00, 71.79);
	mask1_masks1.property('ADBE Mask Shape').setTemporalEaseAtKey(1, [easeIn1], [easeOut1]);
	mask1_masks1.property('ADBE Mask Shape').setInterpolationTypeAtKey(1, 6613, 6613);

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.outTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.vertices = [[972.00, 542.00], [-968.00, 542.00], [-968.00, 542.00], [972.00, 542.00]];

	// key 2...
	mask1_masks1.property('ADBE Mask Shape').setValueAtTime(3.13646980313647, shp);

	easeIn1 = new KeyframeEase(0.00, 68.31);
	easeOut1 = new KeyframeEase(0.00, 33.33);
	mask1_masks1.property('ADBE Mask Shape').setTemporalEaseAtKey(2, [easeIn1], [easeOut1]);
	mask1_masks1.property('ADBE Mask Shape').setInterpolationTypeAtKey(2, 6613, 6613);
	mask1_masks1.name = 'footage botton';

	// fx...
	effects = footageAnimLayer.property('ADBE Effect Parade');
	// main transform effect...
	mainTransform_effects1 = effects.addProperty('ADBE Geometry2');
	mainTransform_effects1.name = 'main transform';

	// main transform position animation...
	// key 1...
	mainTransform_effects1.property('ADBE Geometry2-0002').setValueAtTime(2.56923590256924, [960, 850]);

	easeIn1 = new KeyframeEase(0.00, 33.33);
	easeOut1 = new KeyframeEase(0.00, 71.79);
	mainTransform_effects1.property('ADBE Geometry2-0002').setTemporalEaseAtKey(1, [easeIn1], [easeOut1]);
	mainTransform_effects1.property('ADBE Geometry2-0002').setInterpolationTypeAtKey(1, 6613, 6613);
	mainTransform_effects1.property('ADBE Geometry2-0002').setSpatialTangentsAtKey(1, [0, 51.6666679382324], [0, -51.6666679382324]);
	mainTransform_effects1.property('ADBE Geometry2-0002').setSpatialContinuousAtKey(1, true);
	// key 2...
	mainTransform_effects1.property('ADBE Geometry2-0002').setValueAtTime(3.13646980313647, [960, 540]);

	easeIn1 = new KeyframeEase(0.00, 68.31);
	easeOut1 = new KeyframeEase(0.00, 33.33);
	mainTransform_effects1.property('ADBE Geometry2-0002').setTemporalEaseAtKey(2, [easeIn1], [easeOut1]);
	mainTransform_effects1.property('ADBE Geometry2-0002').setInterpolationTypeAtKey(2, 6613, 6613);
	mainTransform_effects1.property('ADBE Geometry2-0002').setSpatialTangentsAtKey(2, [0, 51.6666679382324], [0, -51.6666679382324]);
	mainTransform_effects1.property('ADBE Geometry2-0002').setSpatialContinuousAtKey(2, true);
	compositingOptions_mainTransform2 = mainTransform_effects1.property('ADBE Effect Built In Params');
	// composite top effect...
	compositeTop_effects1 = effects.addProperty('CC Composite');
	compositeTop_effects1.name = 'composite top';
	compositeTop_effects1.property('CC Composite-0002').setValue(2);
	compositeTop_effects1.property('CC Composite-0003').setValue(0);
	compositingOptions_compositeTop2 = compositeTop_effects1.property('ADBE Effect Built In Params');
	// composite botton effect...
	compositeBotton_effects1 = effects.addProperty('CC Composite');
	compositeBotton_effects1.name = 'composite botton';
	compositeBotton_effects1.property('CC Composite-0003').setValue(0);
	compositingOptions_compositeBotton2 = compositeBotton_effects1.property('ADBE Effect Built In Params');
	masks_compositingOptions3 = compositingOptions_compositeBotton2.property('ADBE Effect Mask Parade');
	maskReference1_masks4 = masks_compositingOptions3.addProperty('ADBE Effect Mask');
	maskReference1_masks4.name = 'Mask Reference 1';
	maskReference1_masks4.property('ADBE Effect Path Stream Ref').setValue(1);
	maskReference1_masks4.name = 'Mask Reference 1';
	// transform botton effect...
	transformBotton_effects1 = effects.addProperty('ADBE Geometry2');
	transformBotton_effects1.name = 'transform botton';

	// transform botton position animation...
	// key 1...
	transformBotton_effects1.property('ADBE Geometry2-0002').setValueAtTime(2.56923590256924, [960, 950]);

	easeIn1 = new KeyframeEase(0.00, 33.33);
	easeOut1 = new KeyframeEase(0.00, 71.79);
	transformBotton_effects1.property('ADBE Geometry2-0002').setTemporalEaseAtKey(1, [easeIn1], [easeOut1]);
	transformBotton_effects1.property('ADBE Geometry2-0002').setInterpolationTypeAtKey(1, 6613, 6613);
	transformBotton_effects1.property('ADBE Geometry2-0002').setSpatialTangentsAtKey(1, [0, -50], [0, 50]);
	transformBotton_effects1.property('ADBE Geometry2-0002').setSpatialContinuousAtKey(1, true);
	// key 2...
	transformBotton_effects1.property('ADBE Geometry2-0002').setValueAtTime(3.13646980313647, [960, 1250]);

	easeIn1 = new KeyframeEase(0.00, 68.31);
	easeOut1 = new KeyframeEase(0.00, 33.33);
	transformBotton_effects1.property('ADBE Geometry2-0002').setTemporalEaseAtKey(2, [easeIn1], [easeOut1]);
	transformBotton_effects1.property('ADBE Geometry2-0002').setInterpolationTypeAtKey(2, 6613, 6613);
	transformBotton_effects1.property('ADBE Geometry2-0002').setSpatialTangentsAtKey(2, [0, -50], [0, 50]);
	transformBotton_effects1.property('ADBE Geometry2-0002').setSpatialContinuousAtKey(2, true);
	compositingOptions_transformBotton2 = transformBotton_effects1.property('ADBE Effect Built In Params');
	masks_compositingOptions3 = compositingOptions_transformBotton2.property('ADBE Effect Mask Parade');
	maskReference1_masks4 = masks_compositingOptions3.addProperty('ADBE Effect Mask');
	maskReference1_masks4.name = 'Mask Reference 1';
	maskReference1_masks4.property('ADBE Effect Path Stream Ref').setValue(1);
	maskReference1_masks4.name = 'Mask Reference 1';

	// footageAnimLayer attributes...
	footageAnimLayer.inPoint = 2.16883550216884;
	footageAnimLayer.outPoint = 3.6036036036036;
	footageAnimLayer.adjustmentLayer = true;
	footageAnimLayer.name = 'adj_footage animation';
	footageAnimLayer.label = 5;
	footageAnimLayer.shy = true;
	footageAnimLayer.locked = true;

	//-----------------------------------------------------------------------

	// shape layer creation...
	ccLayer = shpAdjustment(comp);

	// fx...
	effects = ccLayer.property('ADBE Effect Parade');
	// black & white effect...
	blackWhite_effects1 = effects.addProperty('ADBE Black&White');
	blackWhite_effects1.name = 'Black & White';
	compositingOptions_blackWhite2 = blackWhite_effects1.property('ADBE Effect Built In Params');

	// ccLayer attributes...
	ccLayer.inPoint = 0;
	ccLayer.outPoint = 0.73406740073407;
	ccLayer.comment = '';
	ccLayer.adjustmentLayer = true;
	ccLayer.name = 'adj_bw';
	ccLayer.label = 5;
	ccLayer.shy = true;
	ccLayer.locked = true;

	//-----------------------------------------------------------------------

	// shape layer creation...
	var cLayer = comp.layers.addShape();
	var rVal = Math.round(Math.random());
	// fx...
	effects = cLayer.property('ADBE Effect Parade');
	// light | dark mode effect...
	lightDarkMode_effects1 = effects.addProperty('ADBE Checkbox Control');
	lightDarkMode_effects1.name = 'light | dark mode';
	lightDarkMode_effects1.property('ADBE Checkbox Control-0001').setValue(rVal);
	// 'pos y offset' effect...
	posYOffset_effects1 = effects.addProperty('ADBE Slider Control');
	posYOffset_effects1.name = 'pos y offset';

	// layer attributes...
	cLayer.inPoint = 0;
	cLayer.outPoint = 0.03336670003337;
	cLayer.name = 'ctrl';
	cLayer.label = 1;
	cLayer.guideLayer = true;

	//-----------------------------------------------------------------------

	// shape layer creation...
	posOffsetLayer = shpAdjustment(comp);

	// fx...
	effects = posOffsetLayer.property('ADBE Effect Parade');
	// 'pos y offset' effect...
	posYOffset_effects1 = effects.addProperty('ADBE Tile');
	posYOffset_effects1.name = 'pos y offset';
	posYOffset_effects1.property('ADBE Tile-0001').setValue([960, 540]);

	// pos y offset tile center expression...
	exp = 'var posYsld = thisComp.layer(\'ctrl\').effect(\'pos y offset\')(1).value;\
var mainAnim = thisComp.layer(\'adj_footage animation\').effect(\'main transform\')(\'Position\')[1];\
var posY = linear(mainAnim, 850, 540, thisComp.height / 2, thisComp.height / 2 - posYsld);\
[thisComp.width / 2, posY];';
	posYOffset_effects1.property('ADBE Tile-0001').expression = exp;

	posYOffset_effects1.property('ADBE Tile-0006').setValue(1);

	// posOffsetLayer attributes...
	posOffsetLayer.name = 'adj_footage pos y offset';
	posOffsetLayer.label = 5;
	posOffsetLayer.adjustmentLayer = true;
	posOffsetLayer.inPoint = 2.16883550216884;
	posOffsetLayer.outPoint = 3.6036036036036;
	//-----------------------------------------------------------------------

	var VNDLayer = shpNuncaDesliga(comp);

	VNDLayer.moveAfter(cLayer);
	VNDLayer.shy = true;
	VNDLayer.locked = true;
	VNDLayer.selected = false;
	
	posOffsetLayer.moveAfter(footageAnimLayer);
	posOffsetLayer.shy = true;
	posOffsetLayer.locked = true;
}