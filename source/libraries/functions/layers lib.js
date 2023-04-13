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
	var easeIn2;
	var easeOut1;
	var easeOut2;

	// shape object variable...
	var shp;

	// shape layer creation...
	var layer = comp.layers.addShape();

	//*
	// layer marker 1...
	var t1 = 0;
	var marker1 = new MarkerValue('coloque o footage em baixo');
	marker1.label = 13;
	marker1.duration = 0;
	layer.property('ADBE Marker').setValueAtTime(t1, marker1);

	// layer attributes...
	layer.name = '----------------';
	layer.label = 8;
	layer.guideLayer = true;
	layer.locked = true;

//-----------------------------------------------------------------------

	// shape layer creation...
	layer = shpAdjustment(comp);

	// masks...
	var masks = layer.property('ADBE Mask Parade');
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
	effects = layer.property('ADBE Effect Parade');
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

	// layer attributes...
	layer.inPoint = 2.16883550216884;
	layer.outPoint = 3.6036036036036;
	layer.name = 'adj_footage animation';
	layer.label = 5;
	layer.adjustmentLayer = true;
	layer.shy = true;
	layer.locked = true;

//-----------------------------------------------------------------------

	// shape layer creation...
	layer = shpAdjustment(comp);

	// fx...
	effects = layer.property('ADBE Effect Parade');
	// black & white effect...
	blackWhite_effects1 = effects.addProperty('ADBE Black&White');
	blackWhite_effects1.name = 'Black & White';
	compositingOptions_blackWhite2 = blackWhite_effects1.property('ADBE Effect Built In Params');

	// layer attributes...
	layer.inPoint = 0;
	layer.outPoint = 0.73406740073407;
	layer.comment = '';
	layer.name = 'adj_bw';
	layer.label = 5;
	layer.adjustmentLayer = true;
	layer.shy = true;
	layer.locked = true;

//-----------------------------------------------------------------------

	// shape layer creation...
	var cLayer = comp.layers.addShape();

	// fx...
	effects = cLayer.property('ADBE Effect Parade');
	// light | dark mode effect...
	lightDarkMode_effects1 = effects.addProperty('ADBE Checkbox Control');
	lightDarkMode_effects1.name = 'light | dark mode';
	compositingOptions_lightDarkMode2 = lightDarkMode_effects1.property('ADBE Effect Built In Params');

	// layer attributes...
	cLayer.inPoint = 0;
	cLayer.outPoint = 0.03336670003337;
	cLayer.name = 'ctrl';
	cLayer.label = 1;
	cLayer.guideLayer = true;
	
//-----------------------------------------------------------------------

	// shape layer creation...
	layer = comp.layers.addShape();

	// vector content...
	contents = layer.property('ADBE Root Vectors Group');
	marca_contents1 = contents.addProperty('ADBE Vector Group');
	marca_contents1.name = 'marca';
	contents_marca2 = marca_contents1.addProperty('ADBE Vectors Group');
	globo_contents3 = contents_marca2.addProperty('ADBE Vector Group');
	globo_contents3.name = 'globo';
	contents_globo4 = globo_contents3.addProperty('ADBE Vectors Group');
	path1_contents5 = contents_globo4.addProperty('ADBE Vector Shape - Group');
	path1_contents5.name = 'Path 1';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[61.75, 0.00], [0.00, -61.75], [-61.75, 0.00], [0.00, 61.75]];
	shp.outTangents = [[-61.75, 0.00], [0.00, 61.75], [61.75, 0.00], [0.00, -61.75]];
	shp.vertices = [[0.00, -112.00], [-112.00, 0.00], [0.00, 112.00], [112.00, 0.00]];

	path1_contents5.property('ADBE Vector Shape').setValue(shp);
	path1_contents5.name = 'Path';
	path2_contents5 = contents_globo4.addProperty('ADBE Vector Shape - Group');
	path2_contents5.name = 'Path 2';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[7.19, -0.67], [25.60, 0.00], [24.70, 2.70], [0.90, 7.41], [0.00, 14.60], [-1.35, 14.15], [-6.96, 0.67], [-25.60, 0.00], [-24.48, -2.70], [-0.90, -7.41], [0.00, -14.37], [1.12, -14.15]];
	shp.outTangents = [[-24.48, 2.70], [-25.60, 0.00], [-6.96, -0.67], [-1.35, -14.15], [0.00, -14.37], [0.90, -7.41], [24.70, -2.70], [25.60, 0.00], [7.19, 0.67], [1.12, 14.15], [0.00, 14.60], [-0.90, 7.41]];
	shp.vertices = [[76.62, 53.00], [0.05, 56.44], [-76.74, 53.07], [-88.20, 43.19], [-89.54, 0.08], [-88.20, -42.81], [-76.74, -52.69], [0.05, -56.05], [76.62, -52.69], [88.30, -42.81], [89.42, 0.08], [88.30, 43.20]];

	path2_contents5.property('ADBE Vector Shape').setValue(shp);
	path2_contents5.name = 'Path';
	path3_contents5 = contents_globo4.addProperty('ADBE Vector Shape - Group');
	path3_contents5.name = 'Path 3';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[0.00, 25.00], [-25.00, 0.00], [0.00, -25.00], [25.00, 0.00]];
	shp.outTangents = [[0.00, -25.00], [25.00, 0.00], [0.00, 25.00], [-25.00, 0.00]];
	shp.vertices = [[-45.25, 0.00], [0.00, -45.25], [45.25, 0.00], [0.00, 45.25]];

	path3_contents5.property('ADBE Vector Shape').setValue(shp);
	path3_contents5.name = 'Path';
	transform_globo4 = globo_contents3.addProperty('ADBE Vector Transform Group');
	materialOptions_globo4 = globo_contents3.addProperty('ADBE Vector Materials Group');
	news_contents3 = contents_marca2.addProperty('ADBE Vector Group');
	news_contents3.name = 'news';
	contents_news4 = news_contents3.addProperty('ADBE Vectors Group');
	n_contents5 = contents_news4.addProperty('ADBE Vector Shape - Group');
	n_contents5.name = 'n';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[0.00, -44.13], [0.00, 0.00], [5.38, 0.00], [0.00, 0.00], [0.00, 5.38], [0.00, 0.00], [19.37, 0.00], [0.00, -23.32], [0.00, 0.00], [5.38, 0.00], [0.00, 0.00], [0.00, 5.38], [0.00, 0.00], [-5.38, 0.00], [0.00, 0.00], [0.00, -5.38], [0.00, 0.00], [-20.09, 0.00]];
	shp.outTangents = [[0.00, 0.00], [0.00, 5.38], [0.00, 0.00], [-5.38, 0.00], [0.00, 0.00], [0.00, -23.68], [-20.09, 0.00], [0.00, 0.00], [0.00, 5.38], [0.00, 0.00], [-5.38, 0.00], [0.00, 0.00], [0.00, -5.38], [0.00, 0.00], [5.38, 0.00], [0.00, 0.00], [10.05, -11.84], [37.31, 0.00]];
	shp.vertices = [[279.02, -15.63], [279.02, 74.78], [270.41, 83.39], [243.86, 83.39], [235.25, 74.78], [235.25, -8.46], [206.90, -44.33], [175.69, -7.02], [175.69, 74.78], [167.08, 83.39], [140.53, 83.39], [131.92, 74.78], [131.92, -74.47], [140.53, -83.08], [164.57, -83.08], [173.18, -74.47], [173.18, -65.14], [219.46, -85.95]];

	n_contents5.property('ADBE Vector Shape').setValue(shp);
	n_contents5.name = 'Path';
	e_contents5 = contents_news4.addProperty('ADBE Vector Shape - Group');
	e_contents5.name = 'e';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[4.66, -16.86], [0.00, 0.00], [16.50, 0.00]];
	shp.outTangents = [[0.00, 0.00], [-4.66, -18.66], [-20.09, 0.00]];
	shp.vertices = [[340.99, -19.94], [415.61, -19.94], [380.09, -49.00]];

	e_contents5.property('ADBE Vector Shape').setValue(shp);
	e_contents5.name = 'Path';
	e_contents5 = contents_news4.addProperty('ADBE Vector Shape - Group');
	e_contents5.name = 'e';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[0.00, -50.23], [0.00, 0.00], [5.38, 0.00], [0.00, 0.00], [-21.88, 0.00], [-6.82, 8.97], [-4.66, 0.00], [0.00, 0.00], [1.79, -5.38], [38.39, 0.00], [0.00, 49.87], [-45.21, 0.00]];
	shp.outTangents = [[0.00, 0.00], [0.00, 5.38], [0.00, 0.00], [4.31, 21.17], [13.99, 0.00], [2.87, -3.95], [0.00, 0.00], [6.10, 0.00], [-10.05, 30.50], [-47.72, 0.00], [0.00, -48.79], [52.02, 0.00]];
	shp.vertices = [[462.26, 4.10], [462.26, 4.46], [453.64, 13.07], [340.63, 13.07], [383.32, 48.23], [414.18, 35.31], [424.58, 29.57], [451.85, 29.57], [458.67, 38.90], [381.53, 86.26], [296.50, 0.15], [379.02, -85.95]];

	e_contents5.property('ADBE Vector Shape').setValue(shp);
	e_contents5.name = 'Path';
	w_contents5 = contents_news4.addProperty('ADBE Vector Shape - Group');
	w_contents5.name = 'w';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[0.00, 0.00], [1.79, -5.74], [0.00, 0.00], [5.02, 0.00], [0.00, 0.00], [1.44, 4.66], [0.00, 0.00], [0.00, 0.00], [5.02, 0.00], [0.00, 0.00], [1.44, 4.66], [0.00, 0.00], [-6.10, 0.00], [0.00, 0.00], [-1.08, -5.02], [0.00, 0.00], [0.00, 0.00], [-5.02, 0.00], [0.00, 0.00], [-1.43, -5.02], [0.00, 0.00], [0.00, 0.00], [-5.02, 0.00]];
	shp.outTangents = [[6.10, 0.00], [0.00, 0.00], [-1.44, 4.66], [0.00, 0.00], [-5.02, 0.00], [0.00, 0.00], [0.00, 0.00], [-1.44, 4.66], [0.00, 0.00], [-5.02, 0.00], [0.00, 0.00], [-1.79, -5.74], [0.00, 0.00], [5.02, 0.00], [0.00, 0.00], [0.00, 0.00], [1.44, -4.66], [0.00, 0.00], [5.02, 0.00], [0.00, 0.00], [0.00, 0.00], [1.08, -5.02], [0.00, 0.00]];
	shp.vertices = [[694.86, -83.08], [702.04, -73.40], [654.68, 76.21], [644.63, 83.39], [618.80, 83.39], [609.11, 76.21], [581.85, -22.81], [555.30, 76.21], [545.61, 83.39], [519.78, 83.39], [509.73, 76.21], [461.66, -73.40], [468.83, -83.08], [501.12, -83.08], [510.45, -75.55], [533.05, 19.53], [559.24, -75.55], [568.57, -83.08], [597.27, -83.08], [606.60, -75.55], [632.79, 20.24], [655.04, -75.55], [664.36, -83.08]];

	w_contents5.property('ADBE Vector Shape').setValue(shp);
	w_contents5.name = 'Path';
	s_contents5 = contents_news4.addProperty('ADBE Vector Shape - Group');
	s_contents5.name = 's';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[7.89, 24.76], [-6.10, 0.00], [0.00, 0.00], [-2.51, -3.95], [-17.22, 0.00], [0.00, 7.89], [21.53, 3.95], [0.00, 38.39], [-41.62, 0.00], [-8.25, -28.34], [6.10, 0.00], [0.00, 0.00], [2.87, 4.67], [16.86, 0.00], [0.00, -6.46], [-23.32, -4.66], [0.00, -35.16], [39.83, 0.00]];
	shp.outTangents = [[-1.79, -5.74], [0.00, 0.00], [4.30, 0.00], [4.30, 6.82], [13.99, 0.00], [0.00, -13.63], [-26.19, -5.02], [0.00, -30.14], [37.67, 0.00], [1.79, 6.10], [0.00, 0.00], [-4.31, 0.00], [-4.66, -7.18], [-13.63, 0.00], [0.00, 12.92], [25.11, 5.02], [0.00, 32.65], [-42.69, 0.00]];
	shp.vertices = [[711.29, 38.90], [718.83, 29.57], [746.81, 29.57], [756.14, 35.31], [783.77, 47.51], [807.45, 35.67], [766.54, 16.30], [710.93, -35.37], [778.74, -85.95], [847.63, -38.95], [840.10, -29.27], [811.75, -29.27], [802.78, -35.37], [774.44, -47.21], [753.63, -35.01], [799.55, -17.07], [850.86, 32.44], [781.61, 86.26]];

	s_contents5.property('ADBE Vector Shape').setValue(shp);
	s_contents5.name = 'Path';
	transform_news4 = news_contents3.addProperty('ADBE Vector Transform Group');
	materialOptions_news4 = news_contents3.addProperty('ADBE Vector Materials Group');
	color_contents3 = contents_marca2.addProperty('ADBE Vector Graphic - Fill');
	color_contents3.name = 'color';
	color_contents3.property('ADBE Vector Fill Color').setValue([0.89803928136826, 0.1803921610117, 0.1803921610117, 1]);
	color_contents3.name = 'Opacity';
	transform_marca2 = marca_contents1.addProperty('ADBE Vector Transform Group');
	transform_marca2.property('ADBE Vector Position').setValue([-545, -153.600006103516]);
	transform_marca2.property('ADBE Vector Scale').setValue([71.5999984741211, 71.5999984741211]);

	// transform opacity animation...
	// key 1...
	transform_marca2.property('ADBE Vector Group Opacity').setValueAtTime(2.13546880213547, 0);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_marca2.property('ADBE Vector Group Opacity').setTemporalEaseAtKey(1, [easeIn1], [easeOut1]);
	transform_marca2.property('ADBE Vector Group Opacity').setInterpolationTypeAtKey(1, 6614, 6614);
	// key 2...
	transform_marca2.property('ADBE Vector Group Opacity').setValueAtTime(4.1041041041041, 100);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_marca2.property('ADBE Vector Group Opacity').setTemporalEaseAtKey(2, [easeIn1], [easeOut1]);
	transform_marca2.property('ADBE Vector Group Opacity').setInterpolationTypeAtKey(2, 6614, 6614);
	materialOptions_marca2 = marca_contents1.addProperty('ADBE Vector Materials Group');
	nunca_contents1 = contents.addProperty('ADBE Vector Group');
	nunca_contents1.name = 'nunca';
	contents_nunca2 = nunca_contents1.addProperty('ADBE Vectors Group');
	n_contents3 = contents_nunca2.addProperty('ADBE Vector Shape - Group');
	n_contents3.name = 'N';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [-0.19, -13.34], [0.00, 0.00], [7.93, 14.31], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.58, 14.31], [0.00, 0.00], [-6.57, -11.41]];
	shp.outTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 11.41], [0.00, 0.00], [-6.19, -12.76], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, -12.18], [0.00, 0.00], [6.19, 12.96], [0.00, 0.00]];
	shp.vertices = [[79.86, 0.00], [108.67, 0.00], [108.67, -116.02], [87.59, -116.02], [87.59, -65.16], [87.98, -26.10], [87.79, -26.10], [64.78, -70.58], [39.64, -116.02], [7.15, -116.02], [7.15, 0.00], [28.23, 0.00], [28.23, -50.85], [27.46, -95.13], [27.84, -95.13], [49.89, -52.79]];

	n_contents3.property('ADBE Vector Shape').setValue(shp);
	n_contents3.name = 'Path';
	u_contents3 = contents_nunca2.addProperty('ADBE Vector Shape - Group');
	u_contents3.name = 'u';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [13.34, 0.00], [0.00, 11.02], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [-21.85, 0.00], [-4.06, 19.53], [0.00, 0.00]];
	shp.outTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 12.96], [-14.12, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 19.53], [15.28, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.vertices = [[183.06, 0.00], [203.95, 0.00], [203.95, -90.88], [183.06, -90.88], [183.06, -37.13], [161.60, -16.44], [142.65, -37.13], [142.65, -90.88], [121.77, -90.88], [121.77, -31.52], [151.93, 2.51], [182.87, -24.94], [183.06, -24.94]];

	u_contents3.property('ADBE Vector Shape').setValue(shp);
	u_contents3.name = 'Path';
	n_contents3 = contents_nunca2.addProperty('ADBE Vector Shape - Group');
	n_contents3.name = 'n';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[0.00, 0.00], [-13.34, 0.00], [0.00, -11.02], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [21.85, 0.00], [4.06, -19.34], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.outTangents = [[0.00, -12.96], [14.12, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, -19.72], [-15.28, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.vertices = [[238.47, -53.75], [259.93, -74.44], [278.88, -53.75], [278.88, 0.00], [299.76, 0.00], [299.76, -59.17], [269.60, -93.20], [238.66, -65.94], [238.47, -65.94], [238.47, -90.88], [217.58, -90.88], [217.58, 0.00], [238.47, 0.00]];

	n_contents3.property('ADBE Vector Shape').setValue(shp);
	n_contents3.name = 'Path';
	c_contents3 = contents_nunca2.addProperty('ADBE Vector Shape - Group');
	c_contents3.name = 'c';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[-2.75, -12.96], [0.00, 0.00], [27.69, 0.00], [0.00, -30.64], [-29.06, 0.00], [-3.73, 23.57], [0.00, 0.00], [15.51, 0.00], [0.00, 18.85], [-15.12, 0.00]];
	shp.outTangents = [[0.00, 0.00], [-3.73, -23.76], [-28.08, 0.00], [0.00, 31.42], [26.71, 0.00], [0.00, 0.00], [-2.95, 13.16], [-15.71, 0.00], [0.00, -19.83], [14.34, 0.00]];
	shp.vertices = [[378.14, -54.05], [398.57, -57.39], [354.38, -94.90], [306.86, -46.19], [354.97, 2.31], [398.76, -35.98], [378.54, -40.11], [354.58, -17.13], [328.46, -46.39], [354.18, -75.65]];

	c_contents3.property('ADBE Vector Shape').setValue(shp);
	c_contents3.name = 'Path';
	a_contents3 = contents_nunca2.addProperty('ADBE Vector Shape - Group');
	a_contents3.name = 'a';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[14.31, 0.00], [0.00, 6.38], [-10.05, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.outTangents = [[-11.79, 0.00], [0.00, -6.19], [0.00, 0.00], [0.00, 0.00], [0.00, 11.02]];
	shp.vertices = [[439.48, -15.08], [423.63, -27.26], [439.09, -37.13], [463.07, -37.13], [463.07, -34.22]];

	a_contents3.property('ADBE Vector Shape').setValue(shp);
	a_contents3.name = 'Path';
	a2_contents3 = contents_nunca2.addProperty('ADBE Vector Shape - Group');
	a2_contents3.name = 'a2';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[0.00, 0.00], [0.00, 0.00], [26.30, 0.00], [4.25, -16.44], [0.00, 0.00], [-9.09, 0.00], [0.00, -12.38], [0.00, 0.00], [0.00, 0.00], [0.00, -16.63], [-16.82, 0.00], [-4.25, 16.24], [0.00, 0.00], [0.00, 0.00]];
	shp.outTangents = [[0.00, 0.00], [0.00, -23.20], [-23.01, 0.00], [0.00, 0.00], [3.09, -8.12], [12.57, 0.00], [0.00, 0.00], [0.00, 0.00], [-22.82, 0.00], [0.00, 17.40], [15.66, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.vertices = [[483.76, 0.00], [483.76, -56.46], [446.25, -92.81], [407.00, -66.32], [427.49, -64.00], [445.47, -75.41], [463.07, -56.27], [463.07, -52.59], [436.00, -52.59], [403.13, -23.98], [431.75, 1.93], [462.68, -22.82], [463.07, -22.82], [463.07, 0.00]];

	a2_contents3.property('ADBE Vector Shape').setValue(shp);
	a2_contents3.name = 'Path';
	color_contents3 = contents_nunca2.addProperty('ADBE Vector Graphic - Fill');
	color_contents3.name = 'color';
	color_contents3.property('ADBE Vector Fill Color').setValue([0.94901960784314, 0.94901960784314, 0.94901960784314, 1]);

	// color color expression...
	exp = 'var lightMode = thisComp.layer(\'ctrl\').effect(\'light | dark mode\')(1).value;\
	var darkColor = [242, 242, 242, 255] / 255;\
	var lightColor = [35, 30, 30, 255] / 255;\
	var val = lightMode ? lightColor : darkColor;\
	if (time < 3.54) val = darkColor;\
	val;';
	color_contents3.property('ADBE Vector Fill Color').expression = exp;

	color_contents3.name = 'Opacity';
	transform_nunca2 = nunca_contents1.addProperty('ADBE Vector Transform Group');

	// transform position animation...
	// key 1...
	transform_nunca2.property('ADBE Vector Position').setValueAtTime(2.13546880213547, [10.5, 0]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(186.48, 16.67);
	transform_nunca2.property('ADBE Vector Position').setTemporalEaseAtKey(1, [easeIn1], [easeOut1]);
	transform_nunca2.property('ADBE Vector Position').setInterpolationTypeAtKey(1, 6612, 6612);
	transform_nunca2.property('ADBE Vector Position').setSpatialTangentsAtKey(1, [1.75, 0], [-1.75, 0]);
	transform_nunca2.property('ADBE Vector Position').setSpatialContinuousAtKey(1, true);
	// key 2...
	transform_nunca2.property('ADBE Vector Position').setValueAtTime(2.23556890223557, [0, 0]);

	easeIn1 = new KeyframeEase(0.00, 59.23);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nunca2.property('ADBE Vector Position').setTemporalEaseAtKey(2, [easeIn1], [easeOut1]);
	transform_nunca2.property('ADBE Vector Position').setInterpolationTypeAtKey(2, 6613, 6614);
	transform_nunca2.property('ADBE Vector Position').setSpatialTangentsAtKey(2, [1.75, 0], [0, 0]);
	transform_nunca2.property('ADBE Vector Position').setSpatialContinuousAtKey(2, true);
	// key 3...
	transform_nunca2.property('ADBE Vector Position').setValueAtTime(2.73606940273607, [0, 0]);

	easeIn1 = new KeyframeEase(0.00, 59.23);
	easeOut1 = new KeyframeEase(0.00, 71.73);
	transform_nunca2.property('ADBE Vector Position').setTemporalEaseAtKey(3, [easeIn1], [easeOut1]);
	transform_nunca2.property('ADBE Vector Position').setInterpolationTypeAtKey(3, 6613, 6613);
	transform_nunca2.property('ADBE Vector Position').setSpatialTangentsAtKey(3, [0, 0], [0, 0]);
	transform_nunca2.property('ADBE Vector Position').setSpatialContinuousAtKey(3, false);
	// key 4...
	transform_nunca2.property('ADBE Vector Position').setValueAtTime(3.47013680347014, [-394.19664781048, 0]);

	easeIn1 = new KeyframeEase(2530.77, 13.07);
	easeOut1 = new KeyframeEase(2530.77, 32.26);
	transform_nunca2.property('ADBE Vector Position').setTemporalEaseAtKey(4, [easeIn1], [easeOut1]);
	transform_nunca2.property('ADBE Vector Position').setInterpolationTypeAtKey(4, 6613, 6613);
	transform_nunca2.property('ADBE Vector Position').setSpatialTangentsAtKey(4, [0, 0], [0, 0]);
	transform_nunca2.property('ADBE Vector Position').setSpatialContinuousAtKey(4, false);
	// key 5...
	transform_nunca2.property('ADBE Vector Position').setValueAtTime(3.53687020353687, [-495.276047058824, 0]);

	easeIn1 = new KeyframeEase(2692.76, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nunca2.property('ADBE Vector Position').setTemporalEaseAtKey(5, [easeIn1], [easeOut1]);
	transform_nunca2.property('ADBE Vector Position').setInterpolationTypeAtKey(5, 6612, 6614);
	transform_nunca2.property('ADBE Vector Position').setSpatialTangentsAtKey(5, [0, 0], [0, 0]);
	transform_nunca2.property('ADBE Vector Position').setSpatialContinuousAtKey(5, false);
	// key 6...
	transform_nunca2.property('ADBE Vector Position').setValueAtTime(3.57023690357024, [-1200, 290]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nunca2.property('ADBE Vector Position').setTemporalEaseAtKey(6, [easeIn1], [easeOut1]);
	transform_nunca2.property('ADBE Vector Position').setInterpolationTypeAtKey(6, 6614, 6614);
	transform_nunca2.property('ADBE Vector Position').setSpatialTangentsAtKey(6, [0, 0], [0, 0]);
	transform_nunca2.property('ADBE Vector Position').setSpatialContinuousAtKey(6, true);
	// key 7...
	transform_nunca2.property('ADBE Vector Position').setValueAtTime(3.6036036036036, [-1198.5, 290]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nunca2.property('ADBE Vector Position').setTemporalEaseAtKey(7, [easeIn1], [easeOut1]);
	transform_nunca2.property('ADBE Vector Position').setInterpolationTypeAtKey(7, 6614, 6614);
	transform_nunca2.property('ADBE Vector Position').setSpatialTangentsAtKey(7, [0, 0], [0, 0]);
	transform_nunca2.property('ADBE Vector Position').setSpatialContinuousAtKey(7, true);
	// key 8...
	transform_nunca2.property('ADBE Vector Position').setValueAtTime(3.67033700367034, [-1287.7, 290]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nunca2.property('ADBE Vector Position').setTemporalEaseAtKey(8, [easeIn1], [easeOut1]);
	transform_nunca2.property('ADBE Vector Position').setInterpolationTypeAtKey(8, 6614, 6614);
	transform_nunca2.property('ADBE Vector Position').setSpatialTangentsAtKey(8, [0, 0], [0, 0]);
	transform_nunca2.property('ADBE Vector Position').setSpatialContinuousAtKey(8, true);
	// key 9...
	transform_nunca2.property('ADBE Vector Position').setValueAtTime(3.7037037037037, [-1393.2, 290]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nunca2.property('ADBE Vector Position').setTemporalEaseAtKey(9, [easeIn1], [easeOut1]);
	transform_nunca2.property('ADBE Vector Position').setInterpolationTypeAtKey(9, 6614, 6614);
	transform_nunca2.property('ADBE Vector Position').setSpatialTangentsAtKey(9, [0, 0], [0, 0]);
	transform_nunca2.property('ADBE Vector Position').setSpatialContinuousAtKey(9, true);
	// key 10...
	transform_nunca2.property('ADBE Vector Position').setValueAtTime(3.77043710377044, [-1499.9, 290]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nunca2.property('ADBE Vector Position').setTemporalEaseAtKey(10, [easeIn1], [easeOut1]);
	transform_nunca2.property('ADBE Vector Position').setInterpolationTypeAtKey(10, 6614, 6614);
	transform_nunca2.property('ADBE Vector Position').setSpatialTangentsAtKey(10, [0, 0], [0, 0]);
	transform_nunca2.property('ADBE Vector Position').setSpatialContinuousAtKey(10, true);
	// key 11...
	transform_nunca2.property('ADBE Vector Position').setValueAtTime(3.8038038038038, [-1605.6, 290]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nunca2.property('ADBE Vector Position').setTemporalEaseAtKey(11, [easeIn1], [easeOut1]);
	transform_nunca2.property('ADBE Vector Position').setInterpolationTypeAtKey(11, 6614, 6614);
	transform_nunca2.property('ADBE Vector Position').setSpatialTangentsAtKey(11, [0, 0], [0, 0]);
	transform_nunca2.property('ADBE Vector Position').setSpatialContinuousAtKey(11, true);
	// key 12...
	transform_nunca2.property('ADBE Vector Position').setValueAtTime(3.87053720387054, [-1701.5, 290]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nunca2.property('ADBE Vector Position').setTemporalEaseAtKey(12, [easeIn1], [easeOut1]);
	transform_nunca2.property('ADBE Vector Position').setInterpolationTypeAtKey(12, 6614, 6614);
	transform_nunca2.property('ADBE Vector Position').setSpatialTangentsAtKey(12, [0, 0], [0, 0]);
	transform_nunca2.property('ADBE Vector Position').setSpatialContinuousAtKey(12, true);
	// key 13...
	transform_nunca2.property('ADBE Vector Position').setValueAtTime(3.9039039039039, [-1819.5, 290]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nunca2.property('ADBE Vector Position').setTemporalEaseAtKey(13, [easeIn1], [easeOut1]);
	transform_nunca2.property('ADBE Vector Position').setInterpolationTypeAtKey(13, 6614, 6614);
	transform_nunca2.property('ADBE Vector Position').setSpatialTangentsAtKey(13, [0, 0], [0, 0]);
	transform_nunca2.property('ADBE Vector Position').setSpatialContinuousAtKey(13, true);
	// key 14...
	transform_nunca2.property('ADBE Vector Position').setValueAtTime(3.97063730397064, [-1927.7, 290]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nunca2.property('ADBE Vector Position').setTemporalEaseAtKey(14, [easeIn1], [easeOut1]);
	transform_nunca2.property('ADBE Vector Position').setInterpolationTypeAtKey(14, 6614, 6614);
	transform_nunca2.property('ADBE Vector Position').setSpatialTangentsAtKey(14, [0, 0], [0, 0]);
	transform_nunca2.property('ADBE Vector Position').setSpatialContinuousAtKey(14, true);
	// key 15...
	transform_nunca2.property('ADBE Vector Position').setValueAtTime(4.004004004004, [-2034.6, 290]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nunca2.property('ADBE Vector Position').setTemporalEaseAtKey(15, [easeIn1], [easeOut1]);
	transform_nunca2.property('ADBE Vector Position').setInterpolationTypeAtKey(15, 6614, 6614);
	transform_nunca2.property('ADBE Vector Position').setSpatialTangentsAtKey(15, [0, 0], [0, 0]);
	transform_nunca2.property('ADBE Vector Position').setSpatialContinuousAtKey(15, true);
	// key 16...
	transform_nunca2.property('ADBE Vector Position').setValueAtTime(4.1041041041041, [-618, 54]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nunca2.property('ADBE Vector Position').setTemporalEaseAtKey(16, [easeIn1], [easeOut1]);
	transform_nunca2.property('ADBE Vector Position').setInterpolationTypeAtKey(16, 6612, 6614);
	transform_nunca2.property('ADBE Vector Position').setSpatialTangentsAtKey(16, [-235.25, 39.3333320617676], [235.25, -39.3333320617676]);
	transform_nunca2.property('ADBE Vector Position').setSpatialContinuousAtKey(16, true);
	// key 17...
	transform_nunca2.property('ADBE Vector Position').setValueAtTime(4.13747080413747, [-623.1, 54]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nunca2.property('ADBE Vector Position').setTemporalEaseAtKey(17, [easeIn1], [easeOut1]);
	transform_nunca2.property('ADBE Vector Position').setInterpolationTypeAtKey(17, 6614, 6614);
	transform_nunca2.property('ADBE Vector Position').setSpatialTangentsAtKey(17, [1.48333334922791, 0], [-1.48333334922791, 0]);
	transform_nunca2.property('ADBE Vector Position').setSpatialContinuousAtKey(17, true);
	// key 18...
	transform_nunca2.property('ADBE Vector Position').setValueAtTime(4.2042042042042, [-626.9, 54]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nunca2.property('ADBE Vector Position').setTemporalEaseAtKey(18, [easeIn1], [easeOut1]);
	transform_nunca2.property('ADBE Vector Position').setInterpolationTypeAtKey(18, 6614, 6614);
	transform_nunca2.property('ADBE Vector Position').setSpatialTangentsAtKey(18, [1.04999995231628, 0], [-1.04999995231628, 0]);
	transform_nunca2.property('ADBE Vector Position').setSpatialContinuousAtKey(18, true);
	// key 19...
	transform_nunca2.property('ADBE Vector Position').setValueAtTime(4.23757090423757, [-629.4, 54]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nunca2.property('ADBE Vector Position').setTemporalEaseAtKey(19, [easeIn1], [easeOut1]);
	transform_nunca2.property('ADBE Vector Position').setInterpolationTypeAtKey(19, 6614, 6614);
	transform_nunca2.property('ADBE Vector Position').setSpatialTangentsAtKey(19, [0.63333332538605, 0], [-0.63333332538605, 0]);
	transform_nunca2.property('ADBE Vector Position').setSpatialContinuousAtKey(19, true);
	// key 20...
	transform_nunca2.property('ADBE Vector Position').setValueAtTime(4.27093760427094, [-630.700000000001, 54]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nunca2.property('ADBE Vector Position').setTemporalEaseAtKey(20, [easeIn1], [easeOut1]);
	transform_nunca2.property('ADBE Vector Position').setInterpolationTypeAtKey(20, 6614, 6614);
	transform_nunca2.property('ADBE Vector Position').setSpatialTangentsAtKey(20, [0.5, 0], [-0.5, 0]);
	transform_nunca2.property('ADBE Vector Position').setSpatialContinuousAtKey(20, true);
	// key 21...
	transform_nunca2.property('ADBE Vector Position').setValueAtTime(4.3043043043043, [-632.400000000001, 54]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nunca2.property('ADBE Vector Position').setTemporalEaseAtKey(21, [easeIn1], [easeOut1]);
	transform_nunca2.property('ADBE Vector Position').setInterpolationTypeAtKey(21, 6614, 6614);
	transform_nunca2.property('ADBE Vector Position').setSpatialTangentsAtKey(21, [0.26666668057442, 0], [-0.26666668057442, 0]);
	transform_nunca2.property('ADBE Vector Position').setSpatialContinuousAtKey(21, true);
	// key 22...
	transform_nunca2.property('ADBE Vector Position').setValueAtTime(4.37103770437104, [-632.300000000001, 54]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nunca2.property('ADBE Vector Position').setTemporalEaseAtKey(22, [easeIn1], [easeOut1]);
	transform_nunca2.property('ADBE Vector Position').setInterpolationTypeAtKey(22, 6614, 6614);
	transform_nunca2.property('ADBE Vector Position').setSpatialTangentsAtKey(22, [-0.0166666675359, 0], [0.0166666675359, 0]);
	transform_nunca2.property('ADBE Vector Position').setSpatialContinuousAtKey(22, true);

	// transform scale animation...
	// key 1...
	transform_nunca2.property('ADBE Vector Scale').setValueAtTime(2.13546880213547, [100, 100]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	easeIn2 = new KeyframeEase(0.00, 16.67);
	easeOut2 = new KeyframeEase(0.00, 16.67);
	transform_nunca2.property('ADBE Vector Scale').setTemporalEaseAtKey(1, [easeIn1, easeIn2], [easeOut1, easeOut2]);
	transform_nunca2.property('ADBE Vector Scale').setInterpolationTypeAtKey(1, 6612, 6614);
	// key 2...
	transform_nunca2.property('ADBE Vector Scale').setValueAtTime(3.57023690357024, [715, 715]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	easeIn2 = new KeyframeEase(0.00, 16.67);
	easeOut2 = new KeyframeEase(0.00, 16.67);
	transform_nunca2.property('ADBE Vector Scale').setTemporalEaseAtKey(2, [easeIn1, easeIn2], [easeOut1, easeOut2]);
	transform_nunca2.property('ADBE Vector Scale').setInterpolationTypeAtKey(2, 6614, 6614);
	// key 3...
	transform_nunca2.property('ADBE Vector Scale').setValueAtTime(4.1041041041041, [82.3, 82.3]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	easeIn2 = new KeyframeEase(0.00, 16.67);
	easeOut2 = new KeyframeEase(0.00, 16.67);
	transform_nunca2.property('ADBE Vector Scale').setTemporalEaseAtKey(3, [easeIn1, easeIn2], [easeOut1, easeOut2]);
	transform_nunca2.property('ADBE Vector Scale').setInterpolationTypeAtKey(3, 6614, 6614);

	// transform opacity animation...
	// key 1...
	transform_nunca2.property('ADBE Vector Group Opacity').setValueAtTime(0, 0);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nunca2.property('ADBE Vector Group Opacity').setTemporalEaseAtKey(1, [easeIn1], [easeOut1]);
	transform_nunca2.property('ADBE Vector Group Opacity').setInterpolationTypeAtKey(1, 6612, 6614);
	// key 2...
	transform_nunca2.property('ADBE Vector Group Opacity').setValueAtTime(2.16883550216884, 100);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nunca2.property('ADBE Vector Group Opacity').setTemporalEaseAtKey(2, [easeIn1], [easeOut1]);
	transform_nunca2.property('ADBE Vector Group Opacity').setInterpolationTypeAtKey(2, 6612, 6614);
	materialOptions_nunca2 = nunca_contents1.addProperty('ADBE Vector Materials Group');
	desliga_contents1 = contents.addProperty('ADBE Vector Group');
	desliga_contents1.name = 'desliga';
	contents_desliga2 = desliga_contents1.addProperty('ADBE Vectors Group');
	d_contents3 = contents_desliga2.addProperty('ADBE Vector Shape - Group');
	d_contents3.name = 'd';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[14.89, 0.00], [0.00, 18.18], [-15.86, 0.00], [0.00, -17.40], [0.00, 0.00]];
	shp.outTangents = [[-16.24, 0.00], [0.00, -18.76], [14.89, 0.00], [0.00, 0.00], [0.00, 17.98]];
	shp.vertices = [[571.40, -16.44], [547.81, -45.05], [571.40, -74.64], [595.57, -46.02], [595.57, -44.47]];

	d_contents3.property('ADBE Vector Shape').setValue(shp);
	d_contents3.name = 'Path';
	d2_contents3 = contents_desliga2.addProperty('ADBE Vector Shape - Group');
	d2_contents3.name = 'd2';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [18.18, -0.19], [0.00, -30.16], [-23.59, 0.00], [-4.06, 18.37], [0.00, 0.00], [0.00, 0.00]];
	shp.outTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [-4.06, -18.76], [-22.82, -0.19], [0.00, 29.39], [17.60, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.vertices = [[616.45, 0.00], [616.45, -118.53], [595.57, -118.53], [595.57, -64.78], [595.38, -64.78], [562.89, -93.20], [527.12, -45.05], [562.89, 2.51], [595.19, -25.72], [595.57, -25.72], [595.57, 0.00]];

	d2_contents3.property('ADBE Vector Shape').setValue(shp);
	d2_contents3.name = 'Path';
	e_contents3 = contents_desliga2.addProperty('ADBE Vector Shape - Group');
	e_contents3.name = 'e';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[-28.28, 0.00], [-4.71, 17.67], [0.00, 0.00], [14.73, 0.00], [1.96, 15.51], [0.00, 0.00], [0.00, 3.73], [28.08, 0.00], [0.00, -31.22]];
	shp.outTangents = [[24.35, 0.00], [0.00, 0.00], [-2.75, 9.43], [-15.12, 0.00], [0.00, 0.00], [0.39, -4.91], [0.00, -25.33], [-28.67, 0.00], [0.00, 30.44]];
	shp.vertices = [[672.10, 2.36], [713.73, -27.49], [695.27, -32.79], [672.29, -16.10], [646.17, -39.27], [713.93, -39.27], [714.32, -51.64], [672.10, -94.65], [624.97, -44.96]];

	e_contents3.property('ADBE Vector Shape').setValue(shp);
	e_contents3.name = 'Path';
	e2_contents3 = contents_desliga2.addProperty('ADBE Vector Shape - Group');
	e2_contents3.name = 'e 2';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[-13.94, 0.00], [-1.18, -14.34], [0.00, 0.00]];
	shp.outTangents = [[14.53, 0.00], [0.00, 0.00], [2.36, -14.92]];
	shp.vertices = [[671.63, -76.78], [694.81, -54.98], [646.50, -54.98]];

	e2_contents3.property('ADBE Vector Shape').setValue(shp);
	e2_contents3.name = 'Path';
	s_contents3 = contents_desliga2.addProperty('ADBE Vector Shape - Group');
	s_contents3.name = 's';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[-29.20, 0.00], [0.00, 17.02], [25.33, 4.64], [0.00, 6.38], [-9.86, 0.00], [-2.71, -11.99], [0.00, 0.00], [24.75, 0.00], [0.00, -16.44], [-24.56, -4.83], [0.00, -6.57], [11.02, 0.00], [2.90, 11.41], [0.00, 0.00]];
	shp.outTangents = [[25.72, 0.00], [0.00, -13.92], [-18.37, -3.09], [0.00, -6.57], [10.83, 0.00], [0.00, 0.00], [-3.87, -17.40], [-23.78, 0.00], [0.00, 14.50], [18.18, 3.29], [-0.19, 7.15], [-14.50, 0.00], [0.00, 0.00], [3.29, 17.79]];
	shp.vertices = [[759.73, 2.51], [797.24, -25.52], [763.40, -53.37], [741.36, -67.10], [756.44, -77.73], [775.39, -60.71], [795.31, -65.16], [756.44, -93.20], [720.67, -66.13], [753.93, -38.29], [776.74, -24.94], [760.12, -13.54], [736.91, -32.68], [717.38, -28.81]];

	s_contents3.property('ADBE Vector Shape').setValue(shp);
	s_contents3.name = 'Path';
	l_contents3 = contents_desliga2.addProperty('ADBE Vector Shape - Group');
	l_contents3.name = 'l';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.outTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.vertices = [[827.01, -118.53], [806.12, -118.53], [806.12, 0.00], [827.01, 0.00]];

	l_contents3.property('ADBE Vector Shape').setValue(shp);
	l_contents3.name = 'Path';
	i_contents3 = contents_desliga2.addProperty('ADBE Vector Shape - Group');
	i_contents3.name = 'i';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.outTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.vertices = [[864.08, -103.06], [864.08, -118.53], [841.45, -118.53], [841.45, -103.06]];

	i_contents3.property('ADBE Vector Shape').setValue(shp);
	i_contents3.name = 'Path';
	i2_contents3 = contents_desliga2.addProperty('ADBE Vector Shape - Group');
	i2_contents3.name = 'i2';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.outTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.vertices = [[863.30, 0.00], [863.30, -90.88], [842.42, -90.88], [842.42, 0.00]];

	i2_contents3.property('ADBE Vector Shape').setValue(shp);
	i2_contents3.name = 'Path';
	g_contents3 = contents_desliga2.addProperty('ADBE Vector Shape - Group');
	g_contents3.name = 'g';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[14.89, 0.00], [0.00, 16.24], [-15.47, 0.00], [0.00, -16.44], [0.00, 0.00]];
	shp.outTangents = [[-15.86, 0.00], [0.00, -16.05], [14.89, 0.00], [0.00, 0.00], [0.00, 14.89]];
	shp.vertices = [[916.71, -23.40], [893.12, -48.73], [916.71, -74.64], [940.88, -47.57], [940.88, -47.18]];

	g_contents3.property('ADBE Vector Shape').setValue(shp);
	g_contents3.name = 'Path';
	g2_contents3 = contents_desliga2.addProperty('ADBE Vector Shape - Group');
	g2_contents3.name = 'g2';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[0.00, -29.39], [-24.17, 0.00], [-4.06, 14.31], [0.00, 0.00], [0.00, 0.00], [18.76, 0.00], [1.16, 9.86], [0.00, 0.00], [-26.49, 0.00], [0.00, 26.30], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [18.18, -0.19]];
	shp.outTangents = [[0.00, 26.30], [16.44, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 12.96], [-15.28, 0.00], [0.00, 0.00], [2.13, 20.69], [28.04, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [-4.06, -18.76], [-22.82, -0.19]];
	shp.vertices = [[872.43, -47.95], [908.78, -5.61], [940.30, -29.39], [940.88, -29.39], [940.88, -11.21], [917.09, 11.41], [894.08, -4.83], [872.62, -1.93], [917.48, 28.81], [961.76, -11.41], [961.76, -90.88], [940.88, -90.88], [940.88, -64.78], [940.68, -64.78], [908.20, -93.20]];

	g2_contents3.property('ADBE Vector Shape').setValue(shp);
	g2_contents3.name = 'Path';
	a_contents3 = contents_desliga2.addProperty('ADBE Vector Shape - Group');
	a_contents3.name = 'a';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[14.31, 0.00], [0.00, 6.38], [-10.05, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.outTangents = [[-11.79, 0.00], [0.00, -6.19], [0.00, 0.00], [0.00, 0.00], [0.00, 11.02]];
	shp.vertices = [[1008.62, -15.08], [992.77, -27.26], [1008.24, -37.13], [1032.21, -37.13], [1032.21, -34.22]];

	a_contents3.property('ADBE Vector Shape').setValue(shp);
	a_contents3.name = 'Path';
	a2_contents3 = contents_desliga2.addProperty('ADBE Vector Shape - Group');
	a2_contents3.name = 'a2';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[0.00, 0.00], [0.00, 0.00], [26.30, 0.00], [4.25, -16.44], [0.00, 0.00], [-9.09, 0.00], [0.00, -12.38], [0.00, 0.00], [0.00, 0.00], [0.00, -16.63], [-16.82, 0.00], [-4.25, 16.24], [0.00, 0.00], [0.00, 0.00]];
	shp.outTangents = [[0.00, 0.00], [0.00, -23.20], [-23.01, 0.00], [0.00, 0.00], [3.09, -8.12], [12.57, 0.00], [0.00, 0.00], [0.00, 0.00], [-22.82, 0.00], [0.00, 17.40], [15.66, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.vertices = [[1052.90, 0.00], [1052.90, -56.46], [1015.39, -92.81], [976.14, -66.32], [996.64, -64.00], [1014.62, -75.41], [1032.21, -56.27], [1032.21, -52.59], [1005.14, -52.59], [972.27, -23.98], [1000.89, 1.93], [1031.83, -22.82], [1032.21, -22.82], [1032.21, 0.00]];

	a2_contents3.property('ADBE Vector Shape').setValue(shp);
	a2_contents3.name = 'Path';
	color_contents3 = contents_desliga2.addProperty('ADBE Vector Graphic - Fill');
	color_contents3.name = 'color';
	color_contents3.property('ADBE Vector Fill Color').setValue([0.94901960784314, 0.94901960784314, 0.94901960784314, 1]);

	// color color expression...
	exp = 'var lightMode = thisComp.layer(\'ctrl\').effect(\'light | dark mode\')(1).value;\
	var darkColor = [242, 242, 242, 255] / 255;\
	var lightColor = [35, 30, 30, 255] / 255;\
	var val = lightMode ? lightColor : darkColor;\
	if (time < 3.54) val = darkColor;\
	val;';
	color_contents3.property('ADBE Vector Fill Color').expression = exp;

	color_contents3.name = 'Opacity';
	transform_desliga2 = desliga_contents1.addProperty('ADBE Vector Transform Group');

	// transform position animation...
	// key 1...
	transform_desliga2.property('ADBE Vector Position').setValueAtTime(2.4024024024024, [11.1, 0]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(43.29, 0.1);
	transform_desliga2.property('ADBE Vector Position').setTemporalEaseAtKey(1, [easeIn1], [easeOut1]);
	transform_desliga2.property('ADBE Vector Position').setInterpolationTypeAtKey(1, 6612, 6613);
	transform_desliga2.property('ADBE Vector Position').setSpatialTangentsAtKey(1, [0, 0], [0, 0]);
	transform_desliga2.property('ADBE Vector Position').setSpatialContinuousAtKey(1, false);
	// key 2...
	transform_desliga2.property('ADBE Vector Position').setValueAtTime(2.73606940273607, [-1.9, 0]);

	easeIn1 = new KeyframeEase(0.00, 68.08);
	easeOut1 = new KeyframeEase(0.00, 82.83);
	transform_desliga2.property('ADBE Vector Position').setTemporalEaseAtKey(2, [easeIn1], [easeOut1]);
	transform_desliga2.property('ADBE Vector Position').setInterpolationTypeAtKey(2, 6613, 6613);
	transform_desliga2.property('ADBE Vector Position').setSpatialTangentsAtKey(2, [0, 0], [0, 0]);
	transform_desliga2.property('ADBE Vector Position').setSpatialContinuousAtKey(2, false);
	// key 3...
	transform_desliga2.property('ADBE Vector Position').setValueAtTime(3.47013680347014, [-261.54625080507, 0]);

	easeIn1 = new KeyframeEase(3161.46, 7.71);
	easeOut1 = new KeyframeEase(3161.46, 26.89);
	transform_desliga2.property('ADBE Vector Position').setTemporalEaseAtKey(3, [easeIn1], [easeOut1]);
	transform_desliga2.property('ADBE Vector Position').setInterpolationTypeAtKey(3, 6613, 6613);
	transform_desliga2.property('ADBE Vector Position').setSpatialTangentsAtKey(3, [0, 0], [0, 0]);
	transform_desliga2.property('ADBE Vector Position').setSpatialContinuousAtKey(3, false);
	// key 4...
	transform_desliga2.property('ADBE Vector Position').setValueAtTime(3.53687020353687, [-394.97008, 0]);

	easeIn1 = new KeyframeEase(3554.41, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desliga2.property('ADBE Vector Position').setTemporalEaseAtKey(4, [easeIn1], [easeOut1]);
	transform_desliga2.property('ADBE Vector Position').setInterpolationTypeAtKey(4, 6612, 6614);
	transform_desliga2.property('ADBE Vector Position').setSpatialTangentsAtKey(4, [0, 0], [0, 0]);
	transform_desliga2.property('ADBE Vector Position').setSpatialContinuousAtKey(4, false);
	// key 5...
	transform_desliga2.property('ADBE Vector Position').setValueAtTime(4.1041041041041, [-571, 54]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desliga2.property('ADBE Vector Position').setTemporalEaseAtKey(5, [easeIn1], [easeOut1]);
	transform_desliga2.property('ADBE Vector Position').setInterpolationTypeAtKey(5, 6612, 6614);
	transform_desliga2.property('ADBE Vector Position').setSpatialTangentsAtKey(5, [32.0549850463867, -9], [-32.0549850463867, 9]);
	transform_desliga2.property('ADBE Vector Position').setSpatialContinuousAtKey(5, true);
	// key 6...
	transform_desliga2.property('ADBE Vector Position').setValueAtTime(4.13747080413747, [-587.3, 54]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desliga2.property('ADBE Vector Position').setTemporalEaseAtKey(6, [easeIn1], [easeOut1]);
	transform_desliga2.property('ADBE Vector Position').setInterpolationTypeAtKey(6, 6614, 6614);
	transform_desliga2.property('ADBE Vector Position').setSpatialTangentsAtKey(6, [5.08333349227905, 0], [-5.08333349227905, 0]);
	transform_desliga2.property('ADBE Vector Position').setSpatialContinuousAtKey(6, true);
	// key 7...
	transform_desliga2.property('ADBE Vector Position').setValueAtTime(4.2042042042042, [-601.500000000001, 54]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desliga2.property('ADBE Vector Position').setTemporalEaseAtKey(7, [easeIn1], [easeOut1]);
	transform_desliga2.property('ADBE Vector Position').setInterpolationTypeAtKey(7, 6614, 6614);
	transform_desliga2.property('ADBE Vector Position').setSpatialTangentsAtKey(7, [4.03333330154419, 0], [-4.03333330154419, 0]);
	transform_desliga2.property('ADBE Vector Position').setSpatialContinuousAtKey(7, true);
	// key 8...
	transform_desliga2.property('ADBE Vector Position').setValueAtTime(4.23757090423757, [-611.500000000001, 54]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desliga2.property('ADBE Vector Position').setTemporalEaseAtKey(8, [easeIn1], [easeOut1]);
	transform_desliga2.property('ADBE Vector Position').setInterpolationTypeAtKey(8, 6614, 6614);
	transform_desliga2.property('ADBE Vector Position').setSpatialTangentsAtKey(8, [2.95000004768372, 0], [-2.95000004768372, 0]);
	transform_desliga2.property('ADBE Vector Position').setSpatialContinuousAtKey(8, true);
	// key 9...
	transform_desliga2.property('ADBE Vector Position').setValueAtTime(4.27093760427094, [-619.200000000001, 54]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desliga2.property('ADBE Vector Position').setTemporalEaseAtKey(9, [easeIn1], [easeOut1]);
	transform_desliga2.property('ADBE Vector Position').setInterpolationTypeAtKey(9, 6614, 6614);
	transform_desliga2.property('ADBE Vector Position').setSpatialTangentsAtKey(9, [2.26666665077209, 0], [-2.26666665077209, 0]);
	transform_desliga2.property('ADBE Vector Position').setSpatialContinuousAtKey(9, true);
	// key 10...
	transform_desliga2.property('ADBE Vector Position').setValueAtTime(4.3043043043043, [-625.100000000002, 54]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desliga2.property('ADBE Vector Position').setTemporalEaseAtKey(10, [easeIn1], [easeOut1]);
	transform_desliga2.property('ADBE Vector Position').setInterpolationTypeAtKey(10, 6614, 6614);
	transform_desliga2.property('ADBE Vector Position').setSpatialTangentsAtKey(10, [1.68333327770233, 0], [-1.68333327770233, 0]);
	transform_desliga2.property('ADBE Vector Position').setSpatialContinuousAtKey(10, true);
	// key 11...
	transform_desliga2.property('ADBE Vector Position').setValueAtTime(4.37103770437104, [-629.300000000002, 54]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desliga2.property('ADBE Vector Position').setTemporalEaseAtKey(11, [easeIn1], [easeOut1]);
	transform_desliga2.property('ADBE Vector Position').setInterpolationTypeAtKey(11, 6614, 6614);
	transform_desliga2.property('ADBE Vector Position').setSpatialTangentsAtKey(11, [1.13333332538605, 0], [-1.13333332538605, 0]);
	transform_desliga2.property('ADBE Vector Position').setSpatialContinuousAtKey(11, true);
	// key 12...
	transform_desliga2.property('ADBE Vector Position').setValueAtTime(4.4044044044044, [-631.900000000002, 54]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desliga2.property('ADBE Vector Position').setTemporalEaseAtKey(12, [easeIn1], [easeOut1]);
	transform_desliga2.property('ADBE Vector Position').setInterpolationTypeAtKey(12, 6614, 6614);
	transform_desliga2.property('ADBE Vector Position').setSpatialTangentsAtKey(12, [0.76666665077209, 0], [-0.76666665077209, 0]);
	transform_desliga2.property('ADBE Vector Position').setSpatialContinuousAtKey(12, true);
	// key 13...
	transform_desliga2.property('ADBE Vector Position').setValueAtTime(4.43777110443777, [-633.900000000002, 54]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desliga2.property('ADBE Vector Position').setTemporalEaseAtKey(13, [easeIn1], [easeOut1]);
	transform_desliga2.property('ADBE Vector Position').setInterpolationTypeAtKey(13, 6614, 6614);
	transform_desliga2.property('ADBE Vector Position').setSpatialTangentsAtKey(13, [0.51666665077209, 0], [-0.51666665077209, 0]);
	transform_desliga2.property('ADBE Vector Position').setSpatialContinuousAtKey(13, true);
	// key 14...
	transform_desliga2.property('ADBE Vector Position').setValueAtTime(4.47113780447114, [-635.000000000002, 54]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desliga2.property('ADBE Vector Position').setTemporalEaseAtKey(14, [easeIn1], [easeOut1]);
	transform_desliga2.property('ADBE Vector Position').setInterpolationTypeAtKey(14, 6614, 6614);
	transform_desliga2.property('ADBE Vector Position').setSpatialTangentsAtKey(14, [0.40000000596046, 0], [-0.40000000596046, 0]);
	transform_desliga2.property('ADBE Vector Position').setSpatialContinuousAtKey(14, true);
	// key 15...
	transform_desliga2.property('ADBE Vector Position').setValueAtTime(4.53787120453787, [-636.300000000002, 54]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desliga2.property('ADBE Vector Position').setTemporalEaseAtKey(15, [easeIn1], [easeOut1]);
	transform_desliga2.property('ADBE Vector Position').setInterpolationTypeAtKey(15, 6614, 6614);
	transform_desliga2.property('ADBE Vector Position').setSpatialTangentsAtKey(15, [0.21666666865349, 0], [-0.21666666865349, 0]);
	transform_desliga2.property('ADBE Vector Position').setSpatialContinuousAtKey(15, true);

	// transform scale animation...
	// key 1...
	transform_desliga2.property('ADBE Vector Scale').setValueAtTime(2.13546880213547, [100, 100]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	easeIn2 = new KeyframeEase(0.00, 16.67);
	easeOut2 = new KeyframeEase(0.00, 16.67);
	transform_desliga2.property('ADBE Vector Scale').setTemporalEaseAtKey(1, [easeIn1, easeIn2], [easeOut1, easeOut2]);
	transform_desliga2.property('ADBE Vector Scale').setInterpolationTypeAtKey(1, 6612, 6614);
	// key 2...
	transform_desliga2.property('ADBE Vector Scale').setValueAtTime(4.1041041041041, [82.3, 82.3]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	easeIn2 = new KeyframeEase(0.00, 16.67);
	easeOut2 = new KeyframeEase(0.00, 16.67);
	transform_desliga2.property('ADBE Vector Scale').setTemporalEaseAtKey(2, [easeIn1, easeIn2], [easeOut1, easeOut2]);
	transform_desliga2.property('ADBE Vector Scale').setInterpolationTypeAtKey(2, 6614, 6614);

	// transform opacity animation...
	// key 1...
	transform_desliga2.property('ADBE Vector Group Opacity').setValueAtTime(2.13546880213547, 0);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desliga2.property('ADBE Vector Group Opacity').setTemporalEaseAtKey(1, [easeIn1], [easeOut1]);
	transform_desliga2.property('ADBE Vector Group Opacity').setInterpolationTypeAtKey(1, 6614, 6614);
	// key 2...
	transform_desliga2.property('ADBE Vector Group Opacity').setValueAtTime(2.4024024024024, 100);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desliga2.property('ADBE Vector Group Opacity').setTemporalEaseAtKey(2, [easeIn1], [easeOut1]);
	transform_desliga2.property('ADBE Vector Group Opacity').setInterpolationTypeAtKey(2, 6614, 6614);
	// key 3...
	transform_desliga2.property('ADBE Vector Group Opacity').setValueAtTime(3.57023690357024, 0);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desliga2.property('ADBE Vector Group Opacity').setTemporalEaseAtKey(3, [easeIn1], [easeOut1]);
	transform_desliga2.property('ADBE Vector Group Opacity').setInterpolationTypeAtKey(3, 6614, 6614);
	// key 4...
	transform_desliga2.property('ADBE Vector Group Opacity').setValueAtTime(4.1041041041041, 100);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desliga2.property('ADBE Vector Group Opacity').setTemporalEaseAtKey(4, [easeIn1], [easeOut1]);
	transform_desliga2.property('ADBE Vector Group Opacity').setInterpolationTypeAtKey(4, 6614, 6614);
	materialOptions_desliga2 = desliga_contents1.addProperty('ADBE Vector Materials Group');
	ponto_contents1 = contents.addProperty('ADBE Vector Group');
	ponto_contents1.name = 'ponto';
	contents_ponto2 = ponto_contents1.addProperty('ADBE Vectors Group');
	ponto_contents3 = contents_ponto2.addProperty('ADBE Vector Shape - Group');
	ponto_contents3.name = 'ponto';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.outTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.vertices = [[1088.00, -0.61], [1088.00, -24.61], [1062.94, -24.61], [1062.94, -0.61]];

	ponto_contents3.property('ADBE Vector Shape').setValue(shp);
	ponto_contents3.name = 'Path';
	color_contents3 = contents_ponto2.addProperty('ADBE Vector Graphic - Fill');
	color_contents3.name = 'color';
	color_contents3.property('ADBE Vector Fill Color').setValue([0.89803921568627, 0.18039215686275, 0.18039215686275, 1]);

	// color color expression...
	exp = 'var lightMode = thisComp.layer(\'ctrl\').effect(\'light | dark mode\')(1).value;\
	var darkColor = [242, 242, 242, 255] / 255;\
	var lightColor = [35, 30, 30, 255] / 255;\
	var val = lightMode ? lightColor : darkColor;\
	if (time <= 4.55) val = [229, 46, 46, 255] / 255 ;\
	val;';
	color_contents3.property('ADBE Vector Fill Color').expression = exp;

	color_contents3.name = 'Opacity';
	transform_ponto2 = ponto_contents1.addProperty('ADBE Vector Transform Group');

	// transform position animation...
	// key 1...
	transform_ponto2.property('ADBE Vector Position').setValueAtTime(4.1041041041041, [-474.1, 54]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_ponto2.property('ADBE Vector Position').setTemporalEaseAtKey(1, [easeIn1], [easeOut1]);
	transform_ponto2.property('ADBE Vector Position').setInterpolationTypeAtKey(1, 6612, 6614);
	transform_ponto2.property('ADBE Vector Position').setSpatialTangentsAtKey(1, [0.21666666865349, 0], [-0.21666666865349, 0]);
	transform_ponto2.property('ADBE Vector Position').setSpatialContinuousAtKey(1, true);
	// key 2...
	transform_ponto2.property('ADBE Vector Position').setValueAtTime(4.13747080413747, [-475.4, 54]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_ponto2.property('ADBE Vector Position').setTemporalEaseAtKey(2, [easeIn1], [easeOut1]);
	transform_ponto2.property('ADBE Vector Position').setInterpolationTypeAtKey(2, 6614, 6614);
	transform_ponto2.property('ADBE Vector Position').setSpatialTangentsAtKey(2, [1.01666665077209, 0], [-1.01666665077209, 0]);
	transform_ponto2.property('ADBE Vector Position').setSpatialContinuousAtKey(2, true);
	// key 3...
	transform_ponto2.property('ADBE Vector Position').setValueAtTime(4.2042042042042, [-480.200000000001, 54]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_ponto2.property('ADBE Vector Position').setTemporalEaseAtKey(3, [easeIn1], [easeOut1]);
	transform_ponto2.property('ADBE Vector Position').setInterpolationTypeAtKey(3, 6614, 6614);
	transform_ponto2.property('ADBE Vector Position').setSpatialTangentsAtKey(3, [2.23333334922791, 0], [-2.23333334922791, 0]);
	transform_ponto2.property('ADBE Vector Position').setSpatialContinuousAtKey(3, true);
	// key 4...
	transform_ponto2.property('ADBE Vector Position').setValueAtTime(4.23757090423757, [-488.800000000001, 54]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_ponto2.property('ADBE Vector Position').setTemporalEaseAtKey(4, [easeIn1], [easeOut1]);
	transform_ponto2.property('ADBE Vector Position').setInterpolationTypeAtKey(4, 6614, 6614);
	transform_ponto2.property('ADBE Vector Position').setSpatialTangentsAtKey(4, [4.06666660308838, 0], [-4.06666660308838, 0]);
	transform_ponto2.property('ADBE Vector Position').setSpatialContinuousAtKey(4, true);
	// key 5...
	transform_ponto2.property('ADBE Vector Position').setValueAtTime(4.27093760427094, [-504.600000000001, 54]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_ponto2.property('ADBE Vector Position').setTemporalEaseAtKey(5, [easeIn1], [easeOut1]);
	transform_ponto2.property('ADBE Vector Position').setInterpolationTypeAtKey(5, 6614, 6614);
	transform_ponto2.property('ADBE Vector Position').setSpatialTangentsAtKey(5, [7.61666679382324, 0], [-7.61666679382324, 0]);
	transform_ponto2.property('ADBE Vector Position').setSpatialContinuousAtKey(5, true);
	// key 6...
	transform_ponto2.property('ADBE Vector Position').setValueAtTime(4.3043043043043, [-534.500000000001, 54]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_ponto2.property('ADBE Vector Position').setTemporalEaseAtKey(6, [easeIn1], [easeOut1]);
	transform_ponto2.property('ADBE Vector Position').setInterpolationTypeAtKey(6, 6614, 6614);
	transform_ponto2.property('ADBE Vector Position').setSpatialTangentsAtKey(6, [11.1666669845581, 0], [-11.1666669845581, 0]);
	transform_ponto2.property('ADBE Vector Position').setSpatialContinuousAtKey(6, true);
	// key 7...
	transform_ponto2.property('ADBE Vector Position').setValueAtTime(4.37103770437104, [-571.600000000001, 54]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_ponto2.property('ADBE Vector Position').setTemporalEaseAtKey(7, [easeIn1], [easeOut1]);
	transform_ponto2.property('ADBE Vector Position').setInterpolationTypeAtKey(7, 6614, 6614);
	transform_ponto2.property('ADBE Vector Position').setSpatialTangentsAtKey(7, [10.3500003814697, 0], [-10.3500003814697, 0]);
	transform_ponto2.property('ADBE Vector Position').setSpatialContinuousAtKey(7, true);
	// key 8...
	transform_ponto2.property('ADBE Vector Position').setValueAtTime(4.4044044044044, [-596.600000000002, 54]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_ponto2.property('ADBE Vector Position').setTemporalEaseAtKey(8, [easeIn1], [easeOut1]);
	transform_ponto2.property('ADBE Vector Position').setInterpolationTypeAtKey(8, 6614, 6614);
	transform_ponto2.property('ADBE Vector Position').setSpatialTangentsAtKey(8, [6.81666660308838, 0], [-6.81666660308838, 0]);
	transform_ponto2.property('ADBE Vector Position').setSpatialContinuousAtKey(8, true);
	// key 9...
	transform_ponto2.property('ADBE Vector Position').setValueAtTime(4.43777110443777, [-612.500000000002, 54]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_ponto2.property('ADBE Vector Position').setTemporalEaseAtKey(9, [easeIn1], [easeOut1]);
	transform_ponto2.property('ADBE Vector Position').setInterpolationTypeAtKey(9, 6614, 6614);
	transform_ponto2.property('ADBE Vector Position').setSpatialTangentsAtKey(9, [4.28333330154419, 0], [-4.28333330154419, 0]);
	transform_ponto2.property('ADBE Vector Position').setSpatialContinuousAtKey(9, true);
	// key 10...
	transform_ponto2.property('ADBE Vector Position').setValueAtTime(4.47113780447114, [-622.300000000002, 54]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_ponto2.property('ADBE Vector Position').setTemporalEaseAtKey(10, [easeIn1], [easeOut1]);
	transform_ponto2.property('ADBE Vector Position').setInterpolationTypeAtKey(10, 6614, 6614);
	transform_ponto2.property('ADBE Vector Position').setSpatialTangentsAtKey(10, [2.65000009536743, 0], [-2.65000009536743, 0]);
	transform_ponto2.property('ADBE Vector Position').setSpatialContinuousAtKey(10, true);
	// key 11...
	transform_ponto2.property('ADBE Vector Position').setValueAtTime(4.53787120453787, [-628.400000000002, 54]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_ponto2.property('ADBE Vector Position').setTemporalEaseAtKey(11, [easeIn1], [easeOut1]);
	transform_ponto2.property('ADBE Vector Position').setInterpolationTypeAtKey(11, 6614, 6614);
	transform_ponto2.property('ADBE Vector Position').setSpatialTangentsAtKey(11, [1.70000004768372, 0], [-1.70000004768372, 0]);
	transform_ponto2.property('ADBE Vector Position').setSpatialContinuousAtKey(11, true);
	// key 12...
	transform_ponto2.property('ADBE Vector Position').setValueAtTime(4.57123790457124, [-632.500000000002, 54]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_ponto2.property('ADBE Vector Position').setTemporalEaseAtKey(12, [easeIn1], [easeOut1]);
	transform_ponto2.property('ADBE Vector Position').setInterpolationTypeAtKey(12, 6614, 6614);
	transform_ponto2.property('ADBE Vector Position').setSpatialTangentsAtKey(12, [1.03333330154419, 0], [-1.03333330154419, 0]);
	transform_ponto2.property('ADBE Vector Position').setSpatialContinuousAtKey(12, true);
	// key 13...
	transform_ponto2.property('ADBE Vector Position').setValueAtTime(4.6046046046046, [-634.600000000002, 54]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_ponto2.property('ADBE Vector Position').setTemporalEaseAtKey(13, [easeIn1], [easeOut1]);
	transform_ponto2.property('ADBE Vector Position').setInterpolationTypeAtKey(13, 6614, 6614);
	transform_ponto2.property('ADBE Vector Position').setSpatialTangentsAtKey(13, [0.56666666269302, 0], [-0.56666666269302, 0]);
	transform_ponto2.property('ADBE Vector Position').setSpatialContinuousAtKey(13, true);
	// key 14...
	transform_ponto2.property('ADBE Vector Position').setValueAtTime(4.63797130463797, [-635.900000000002, 54]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_ponto2.property('ADBE Vector Position').setTemporalEaseAtKey(14, [easeIn1], [easeOut1]);
	transform_ponto2.property('ADBE Vector Position').setInterpolationTypeAtKey(14, 6614, 6614);
	transform_ponto2.property('ADBE Vector Position').setSpatialTangentsAtKey(14, [0.25, 0], [-0.25, 0]);
	transform_ponto2.property('ADBE Vector Position').setSpatialContinuousAtKey(14, true);
	// key 15...
	transform_ponto2.property('ADBE Vector Position').setValueAtTime(4.7047047047047, [-636.100000000002, 54]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_ponto2.property('ADBE Vector Position').setTemporalEaseAtKey(15, [easeIn1], [easeOut1]);
	transform_ponto2.property('ADBE Vector Position').setInterpolationTypeAtKey(15, 6614, 6614);
	transform_ponto2.property('ADBE Vector Position').setSpatialTangentsAtKey(15, [0.0333333350718, 0], [-0.0333333350718, 0]);
	transform_ponto2.property('ADBE Vector Position').setSpatialContinuousAtKey(15, true);

	// transform scale animation...
	// key 1...
	transform_ponto2.property('ADBE Vector Scale').setValueAtTime(2.13546880213547, [100, 100]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	easeIn2 = new KeyframeEase(0.00, 16.67);
	easeOut2 = new KeyframeEase(0.00, 16.67);
	transform_ponto2.property('ADBE Vector Scale').setTemporalEaseAtKey(1, [easeIn1, easeIn2], [easeOut1, easeOut2]);
	transform_ponto2.property('ADBE Vector Scale').setInterpolationTypeAtKey(1, 6612, 6614);
	// key 2...
	transform_ponto2.property('ADBE Vector Scale').setValueAtTime(4.1041041041041, [82.3, 82.3]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	easeIn2 = new KeyframeEase(0.00, 16.67);
	easeOut2 = new KeyframeEase(0.00, 16.67);
	transform_ponto2.property('ADBE Vector Scale').setTemporalEaseAtKey(2, [easeIn1, easeIn2], [easeOut1, easeOut2]);
	transform_ponto2.property('ADBE Vector Scale').setInterpolationTypeAtKey(2, 6614, 6614);

	// transform opacity animation...
	// key 1...
	transform_ponto2.property('ADBE Vector Group Opacity').setValueAtTime(2.13546880213547, 0);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_ponto2.property('ADBE Vector Group Opacity').setTemporalEaseAtKey(1, [easeIn1], [easeOut1]);
	transform_ponto2.property('ADBE Vector Group Opacity').setInterpolationTypeAtKey(1, 6614, 6614);
	// key 2...
	transform_ponto2.property('ADBE Vector Group Opacity').setValueAtTime(4.1041041041041, 100);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_ponto2.property('ADBE Vector Group Opacity').setTemporalEaseAtKey(2, [easeIn1], [easeOut1]);
	transform_ponto2.property('ADBE Vector Group Opacity').setInterpolationTypeAtKey(2, 6614, 6614);
	materialOptions_ponto2 = ponto_contents1.addProperty('ADBE Vector Materials Group');
	intro_contents1 = contents.addProperty('ADBE Vector Group');
	intro_contents1.name = 'intro';
	contents_intro2 = intro_contents1.addProperty('ADBE Vectors Group');
	nuncaStart_contents3 = contents_intro2.addProperty('ADBE Vector Group');
	nuncaStart_contents3.name = 'nunca start';
	contents_nuncaStart4 = nuncaStart_contents3.addProperty('ADBE Vectors Group');
	n_contents5 = contents_nuncaStart4.addProperty('ADBE Vector Group');
	n_contents5.name = 'N';
	contents_n6 = n_contents5.addProperty('ADBE Vectors Group');
	n_contents7 = contents_n6.addProperty('ADBE Vector Shape - Group');
	n_contents7.name = 'N';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [-0.06, -3.60], [0.00, 0.00], [2.60, 4.32], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.11, 3.82], [0.00, 0.00], [-2.10, -3.43]];
	shp.outTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 3.38], [0.00, 0.00], [-1.88, -3.49], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, -3.60], [0.00, 0.00], [1.83, 3.54], [0.00, 0.00]];
	shp.vertices = [[-49.63, 0.00], [-43.26, 0.00], [-43.26, -33.23], [-48.14, -33.23], [-48.14, -17.34], [-48.03, -6.26], [-48.14, -6.26], [-55.23, -18.83], [-64.03, -33.23], [-71.34, -33.23], [-71.34, 0.00], [-66.42, 0.00], [-66.42, -15.90], [-66.58, -28.25], [-66.47, -28.25], [-59.88, -16.51]];

	n_contents7.property('ADBE Vector Shape').setValue(shp);
	n_contents7.name = 'Path';
	transform_n6 = n_contents5.addProperty('ADBE Vector Transform Group');
	materialOptions_n6 = n_contents5.addProperty('ADBE Vector Materials Group');
	u_contents5 = contents_nuncaStart4.addProperty('ADBE Vector Group');
	u_contents5.name = 'u';
	contents_u6 = u_contents5.addProperty('ADBE Vectors Group');
	u_contents7 = contents_u6.addProperty('ADBE Vector Shape - Group');
	u_contents7.name = 'u';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [4.43, 0.00], [0.00, 3.54], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [-6.70, 0.00], [-1.11, 5.26], [0.00, 0.00]];
	shp.outTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 4.32], [-4.65, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 5.54], [4.54, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.vertices = [[-21.06, 0.00], [-16.24, 0.00], [-16.24, -25.87], [-21.06, -25.87], [-21.06, -10.52], [-28.15, -3.77], [-34.35, -10.52], [-34.35, -25.87], [-39.17, -25.87], [-39.17, -9.31], [-30.14, 0.66], [-21.12, -6.98], [-21.06, -6.98]];

	u_contents7.property('ADBE Vector Shape').setValue(shp);
	u_contents7.name = 'Path';
	transform_u6 = u_contents5.addProperty('ADBE Vector Transform Group');
	materialOptions_u6 = u_contents5.addProperty('ADBE Vector Materials Group');
	n_contents5 = contents_nuncaStart4.addProperty('ADBE Vector Group');
	n_contents5.name = 'n';
	contents_n6 = n_contents5.addProperty('ADBE Vectors Group');
	n_contents7 = contents_n6.addProperty('ADBE Vector Shape - Group');
	n_contents7.name = 'n';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[0.00, 0.00], [-4.43, 0.00], [0.00, -3.54], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [6.70, 0.00], [1.11, -5.26], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.outTangents = [[0.00, -4.32], [4.71, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, -5.54], [-4.54, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.vertices = [[-7.07, -15.34], [0.02, -22.16], [6.22, -15.34], [6.22, 0.00], [11.04, 0.00], [11.04, -16.56], [2.01, -26.53], [-7.02, -18.89], [-7.07, -18.89], [-7.07, -25.87], [-11.89, -25.87], [-11.89, 0.00], [-7.07, 0.00]];

	n_contents7.property('ADBE Vector Shape').setValue(shp);
	n_contents7.name = 'Path';
	transform_n6 = n_contents5.addProperty('ADBE Vector Transform Group');
	materialOptions_n6 = n_contents5.addProperty('ADBE Vector Materials Group');
	c_contents5 = contents_nuncaStart4.addProperty('ADBE Vector Group');
	c_contents5.name = 'c';
	contents_c6 = c_contents5.addProperty('ADBE Vectors Group');
	c_contents7 = contents_c6.addProperty('ADBE Vector Shape - Group');
	c_contents7.name = 'c';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[-0.94, -4.10], [0.00, 0.00], [7.53, 0.00], [0.00, -8.53], [-8.09, 0.00], [-1.16, 6.54], [0.00, 0.00], [5.04, 0.00], [0.00, 5.76], [-4.87, 0.00]];
	shp.outTangents = [[0.00, 0.00], [-1.16, -6.48], [-7.70, 0.00], [0.00, 8.70], [7.31, 0.00], [0.00, 0.00], [-1.00, 3.93], [-5.15, 0.00], [0.00, -6.15], [4.54, 0.00]];
	shp.vertices = [[34.56, -15.45], [39.21, -16.28], [26.86, -26.53], [13.62, -12.96], [27.02, 0.66], [39.26, -9.80], [34.67, -10.75], [26.97, -3.77], [18.55, -12.91], [26.80, -22.10]];

	c_contents7.property('ADBE Vector Shape').setValue(shp);
	c_contents7.name = 'Path';
	transform_c6 = c_contents5.addProperty('ADBE Vector Transform Group');
	materialOptions_c6 = c_contents5.addProperty('ADBE Vector Materials Group');
	a_contents5 = contents_nuncaStart4.addProperty('ADBE Vector Group');
	a_contents5.name = 'a';
	contents_a6 = a_contents5.addProperty('ADBE Vectors Group');
	a_contents7 = contents_a6.addProperty('ADBE Vector Shape - Group');
	a_contents7.name = 'a';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[4.76, 0.00], [0.00, 1.99], [-3.27, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.outTangents = [[-3.77, 0.00], [0.00, -2.27], [0.00, 0.00], [0.00, 0.00], [0.00, 3.54]];
	shp.vertices = [[51.04, -3.49], [46.00, -7.37], [51.04, -10.86], [58.73, -10.86], [58.73, -9.64]];

	a_contents7.property('ADBE Vector Shape').setValue(shp);
	a_contents7.name = 'Path';
	a_contents7 = contents_a6.addProperty('ADBE Vector Shape - Group');
	a_contents7.name = 'a';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [7.20, 0.00], [0.89, -6.04], [0.00, 0.00], [-3.71, 0.00], [0.00, -4.04], [0.00, 0.00], [0.00, 0.00], [0.00, -4.54], [-5.04, 0.00], [-1.16, 4.76], [0.00, 0.00]];
	shp.outTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, -6.65], [-6.81, 0.00], [0.00, 0.00], [0.72, -4.26], [4.10, 0.00], [0.00, 0.00], [0.00, 0.00], [-6.26, 0.00], [0.00, 4.87], [4.49, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.vertices = [[58.73, 0.00], [63.55, 0.00], [63.55, -16.12], [53.25, -26.42], [42.01, -17.00], [46.60, -16.34], [53.08, -22.32], [58.73, -16.06], [58.73, -14.68], [50.37, -14.68], [41.23, -6.76], [49.54, 0.55], [58.68, -6.59], [58.73, -6.59]];

	a_contents7.property('ADBE Vector Shape').setValue(shp);
	a_contents7.name = 'Path';
	mergePaths1_contents7 = contents_a6.addProperty('ADBE Vector Filter - Merge');
	mergePaths1_contents7.name = 'Merge Paths 1';
	mergePaths1_contents7.name = 'Mode';
	transform_a6 = a_contents5.addProperty('ADBE Vector Transform Group');
	materialOptions_a6 = a_contents5.addProperty('ADBE Vector Materials Group');
	mergePaths1_contents5 = contents_nuncaStart4.addProperty('ADBE Vector Filter - Merge');
	mergePaths1_contents5.name = 'Merge Paths 1';
	mergePaths1_contents5.property('ADBE Vector Merge Type').setValue(2);
	mergePaths1_contents5.name = 'Mode';
	transform_nuncaStart4 = nuncaStart_contents3.addProperty('ADBE Vector Transform Group');

	// transform position animation...
	// key 1...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(0, [-1570, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(1, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(1, 6612, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(1, [-9.94999980926514, 0], [9.94999980926514, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(1, true);
	// key 2...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(0.06673340006673, [-1510.3, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(2, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(2, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(2, [-20.5166664123535, 0], [20.5166664123535, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(2, true);
	// key 3...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(0.13346680013347, [-1446.9, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(3, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(3, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(3, [-20.8666667938232, 0], [20.8666667938232, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(3, true);
	// key 4...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(0.16683350016683, [-1385.1, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(4, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(4, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(4, [-21.1333332061768, 0], [21.1333332061768, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(4, true);
	// key 5...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(0.23356690023357, [-1320.1, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(5, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(5, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(5, [-20.783332824707, 0], [20.783332824707, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(5, true);
	// key 6...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(0.3003003003003, [-1260.4, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(6, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(6, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(6, [-20.4500007629395, 0], [20.4500007629395, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(6, true);
	// key 7...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(0.33366700033367, [-1197.4, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(7, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(7, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(7, [-21.25, 0], [21.25, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(7, true);
	// key 8...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(0.4004004004004, [-1132.9, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(8, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(8, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(8, [-21.1833324432373, 0], [21.1833324432373, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(8, true);
	// key 9...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(0.46713380046713, [-1070.3, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(9, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(9, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(9, [-21.0499992370605, 0], [21.0499992370605, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(9, true);
	// key 10...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(0.5005005005005, [-1006.6, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(10, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(10, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(10, [-20.8166675567627, 0], [20.8166675567627, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(10, true);
	// key 11...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(0.56723390056723, [-945.400000000001, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(11, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(11, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(11, [-20.6499996185303, 0], [20.6499996185303, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(11, true);
	// key 12...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(0.63396730063397, [-882.700000000001, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(12, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(12, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(12, [-20.6333332061768, 0], [20.6333332061768, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(12, true);
	// key 13...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(0.66733400066733, [-821.6, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(13, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(13, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(13, [-71.8499984741211, 0], [71.8499984741211, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(13, true);
	// key 14...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(0.73406740073407, [-451.6, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(14, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(14, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(14, [-67.4833297729492, 0], [67.4833297729492, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(14, true);
	// key 15...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(0.76743410076743, [-416.700000000001, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(15, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(15, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(15, [-13.1166667938232, 0], [13.1166667938232, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(15, true);
	// key 16...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(0.83416750083417, [-372.9, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(16, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(16, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(16, [-14.8833332061768, 0], [14.8833332061768, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(16, true);
	// key 17...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(0.9009009009009, [-327.4, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(17, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(17, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(17, [-14.8666667938232, 0], [14.8666667938232, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(17, true);
	// key 18...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(0.93426760093427, [-283.7, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(18, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(18, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(18, [-14.8999996185303, 0], [14.8999996185303, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(18, true);
	// key 19...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(1.001001001001, [-238, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(19, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(19, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(19, [-14.9333333969116, 0], [14.9333333969116, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(19, true);
	// key 20...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(1.06773440106773, [-194.1, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(20, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(20, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(20, [-14.0666666030884, 0], [14.0666666030884, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(20, true);
	// key 21...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(1.1011011011011, [-153.6, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(21, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(21, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(21, [-14.3666667938232, 0], [14.3666667938232, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(21, true);
	// key 22...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(1.16783450116783, [-107.9, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(22, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(22, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(22, [-14.7333335876465, 0], [14.7333335876465, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(22, true);
	// key 23...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(1.23456790123457, [-65.2000000000003, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(23, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(23, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(23, [-14.4166669845581, 0], [14.4166669845581, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(23, true);
	// key 24...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(1.26793460126793, [-21.4000000000003, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(24, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(24, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(24, [-14.5, 0], [14.5, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(24, true);
	// key 25...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(1.33466800133467, [21.7999999999997, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(25, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(25, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(25, [-14.75, 0], [14.75, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(25, true);
	// key 26...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(1.4014014014014, [67.0999999999997, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(26, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(26, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(26, [-15.0500001907349, 0], [15.0500001907349, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(26, true);
	// key 27...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(1.43476810143477, [112.1, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(27, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(27, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(27, [-15.5, 0], [15.5, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(27, true);
	// key 28...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(1.5015015015015, [160.1, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(28, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(28, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(28, [-14.4666662216187, 0], [14.4666662216187, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(28, true);
	// key 29...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(1.56823490156823, [198.9, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(29, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(29, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(29, [-14.0166664123535, 0], [14.0166664123535, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(29, true);
	// key 30...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(1.6016016016016, [244.2, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(30, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(30, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(30, [-14.6499996185303, 0], [14.6499996185303, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(30, true);
	// key 31...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(1.66833500166833, [286.8, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(31, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(31, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(31, [-13.5666666030884, 0], [13.5666666030884, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(31, true);
	// key 32...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(1.73506840173507, [325.6, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(32, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(32, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(32, [-14.1166667938232, 0], [14.1166667938232, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(32, true);
	// key 33...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(1.76843510176843, [371.5, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(33, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(33, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(33, [-16.1000003814697, 0], [16.1000003814697, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(33, true);
	// key 34...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(1.83516850183517, [422.2, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(34, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(34, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(34, [-15.6666669845581, 0], [15.6666669845581, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(34, true);
	// key 35...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(1.9019019019019, [465.5, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(35, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(35, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(35, [-14.3999996185303, 0], [14.3999996185303, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(35, true);
	// key 36...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(1.93526860193527, [508.6, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(36, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(36, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(36, [-13.8833332061768, 0], [13.8833332061768, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(36, true);
	// key 37...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(2.002002002002, [548.8, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(37, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(37, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(37, [-14.1999998092651, 0], [14.1999998092651, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(37, true);
	// key 38...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(2.06873540206874, [593.8, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(38, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(38, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(38, [-15.0166664123535, 0], [15.0166664123535, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(38, true);
	// key 39...
	transform_nuncaStart4.property('ADBE Vector Position').setValueAtTime(2.1021021021021, [638.9, -180]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(39, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(39, 6614, 6614);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(39, [-7.51666688919067, 0], [7.51666688919067, 0]);
	transform_nuncaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(39, true);
	transform_nuncaStart4.property('ADBE Vector Scale').setValue([2360, 2360]);

	// transform opacity animation...
	// key 1...
	transform_nuncaStart4.property('ADBE Vector Group Opacity').setValueAtTime(0, 100);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Group Opacity').setTemporalEaseAtKey(1, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Group Opacity').setInterpolationTypeAtKey(1, 6612, 6614);
	// key 2...
	transform_nuncaStart4.property('ADBE Vector Group Opacity').setValueAtTime(2.16883550216884, 0);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_nuncaStart4.property('ADBE Vector Group Opacity').setTemporalEaseAtKey(2, [easeIn1], [easeOut1]);
	transform_nuncaStart4.property('ADBE Vector Group Opacity').setInterpolationTypeAtKey(2, 6614, 6614);
	materialOptions_nuncaStart4 = nuncaStart_contents3.addProperty('ADBE Vector Materials Group');
	frame_contents3 = contents_intro2.addProperty('ADBE Vector Group');
	frame_contents3.name = 'frame';
	contents_frame4 = frame_contents3.addProperty('ADBE Vectors Group');
	rectanglePath1_contents5 = contents_frame4.addProperty('ADBE Vector Shape - Rect');
	rectanglePath1_contents5.name = 'Rectangle Path 1';
	rectanglePath1_contents5.property('ADBE Vector Shape Direction').setValue(3);

	// rectangle path 1 size animation...
	// key 1...
	rectanglePath1_contents5.property('ADBE Vector Rect Size').setValueAtTime(0, [0, 0]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	easeIn2 = new KeyframeEase(0.00, 16.67);
	easeOut2 = new KeyframeEase(0.00, 16.67);
	rectanglePath1_contents5.property('ADBE Vector Rect Size').setTemporalEaseAtKey(1, [easeIn1, easeIn2], [easeOut1, easeOut2]);
	rectanglePath1_contents5.property('ADBE Vector Rect Size').setInterpolationTypeAtKey(1, 6613, 6614);
	// key 2...
	rectanglePath1_contents5.property('ADBE Vector Rect Size').setValueAtTime(0.73406740073407, [956.999999999999, 957]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(-0.00, 0.1);
	easeIn2 = new KeyframeEase(0.00, 16.67);
	easeOut2 = new KeyframeEase(-0.00, 0.1);
	rectanglePath1_contents5.property('ADBE Vector Rect Size').setTemporalEaseAtKey(2, [easeIn1, easeIn2], [easeOut1, easeOut2]);
	rectanglePath1_contents5.property('ADBE Vector Rect Size').setInterpolationTypeAtKey(2, 6613, 6613);
	// key 3...
	rectanglePath1_contents5.property('ADBE Vector Rect Size').setValueAtTime(1.001001001001, [864, 864]);

	easeIn1 = new KeyframeEase(0.00, 80.23);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	easeIn2 = new KeyframeEase(0.00, 80.23);
	easeOut2 = new KeyframeEase(0.00, 16.67);
	rectanglePath1_contents5.property('ADBE Vector Rect Size').setTemporalEaseAtKey(3, [easeIn1, easeIn2], [easeOut1, easeOut2]);
	rectanglePath1_contents5.property('ADBE Vector Rect Size').setInterpolationTypeAtKey(3, 6613, 6613);
	rectanglePath1_contents5.name = 'Roundness';
	transform_frame4 = frame_contents3.addProperty('ADBE Vector Transform Group');
	transform_frame4.property('ADBE Vector Position').setValue([220, -60]);
	materialOptions_frame4 = frame_contents3.addProperty('ADBE Vector Materials Group');
	mergePaths1_contents3 = contents_intro2.addProperty('ADBE Vector Filter - Merge');
	mergePaths1_contents3.name = 'Merge Paths 1';
	mergePaths1_contents3.property('ADBE Vector Merge Type').setValue(3);
	mergePaths1_contents3.name = 'Mode';
	desligaStart_contents3 = contents_intro2.addProperty('ADBE Vector Group');
	desligaStart_contents3.name = 'desliga start';
	contents_desligaStart4 = desligaStart_contents3.addProperty('ADBE Vectors Group');
	d_contents5 = contents_desligaStart4.addProperty('ADBE Vector Group');
	d_contents5.name = 'd';
	contents_d6 = d_contents5.addProperty('ADBE Vectors Group');
	d_contents7 = contents_d6.addProperty('ADBE Vector Shape - Group');
	d_contents7.name = 'd';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[4.87, 0.00], [0.00, 5.82], [-5.10, 0.00], [0.00, -5.54], [0.00, 0.00]];
	shp.outTangents = [[-5.21, 0.00], [0.00, -5.93], [4.87, 0.00], [0.00, 0.00], [0.00, 5.76]];
	shp.vertices = [[-62.19, -3.77], [-69.84, -12.85], [-62.19, -22.21], [-54.22, -13.07], [-54.22, -12.68]];

	d_contents7.property('ADBE Vector Shape').setValue(shp);
	d_contents7.name = 'Path';
	d_contents7 = contents_d6.addProperty('ADBE Vector Shape - Group');
	d_contents7.name = 'd';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [5.65, -0.06], [0.00, -8.53], [-7.03, 0.00], [-1.11, 5.15], [0.00, 0.00]];
	shp.outTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [-1.05, -5.21], [-6.70, -0.06], [0.00, 8.31], [5.43, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.vertices = [[-54.22, 0.00], [-49.40, 0.00], [-49.40, -33.95], [-54.22, -33.95], [-54.22, -18.17], [-54.33, -18.17], [-64.02, -26.53], [-74.66, -12.85], [-63.97, 0.66], [-54.38, -7.59], [-54.22, -7.59]];

	d_contents7.property('ADBE Vector Shape').setValue(shp);
	d_contents7.name = 'Path';
	mergePaths1_contents7 = contents_d6.addProperty('ADBE Vector Filter - Merge');
	mergePaths1_contents7.name = 'Merge Paths 1';
	mergePaths1_contents7.name = 'Mode';
	transform_d6 = d_contents5.addProperty('ADBE Vector Transform Group');
	materialOptions_d6 = d_contents5.addProperty('ADBE Vector Materials Group');
	e_contents5 = contents_desligaStart4.addProperty('ADBE Vector Group');
	e_contents5.name = 'e';
	contents_e6 = e_contents5.addProperty('ADBE Vectors Group');
	e_contents7 = contents_e6.addProperty('ADBE Vector Shape - Group');
	e_contents7.name = 'e';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[-4.43, 0.00], [-0.33, -4.60], [0.00, 0.00]];
	shp.outTangents = [[4.76, 0.00], [0.00, 0.00], [0.66, -4.82]];
	shp.vertices = [[-33.59, -22.38], [-26.11, -15.18], [-41.62, -15.18]];

	e_contents7.property('ADBE Vector Shape').setValue(shp);
	e_contents7.name = 'Path';
	e_contents7 = contents_e6.addProperty('ADBE Vector Shape - Group');
	e_contents7.name = 'e';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[-7.98, 0.00], [-1.33, 5.10], [0.00, 0.00], [4.65, 0.00], [0.50, 5.04], [0.00, 0.00], [0.00, 0.83], [7.70, 0.00], [0.00, -8.64]];
	shp.outTangents = [[6.59, 0.00], [0.00, 0.00], [-0.89, 3.05], [-4.93, 0.00], [0.00, 0.00], [0.11, -1.22], [0.00, -7.09], [-7.87, 0.00], [0.00, 8.47]];
	shp.vertices = [[-33.37, 0.61], [-21.74, -7.75], [-26.00, -9.03], [-33.37, -3.60], [-41.73, -11.41], [-21.68, -11.41], [-21.57, -14.51], [-33.42, -26.53], [-46.55, -12.74]];

	e_contents7.property('ADBE Vector Shape').setValue(shp);
	e_contents7.name = 'Path';
	transform_e6 = e_contents5.addProperty('ADBE Vector Transform Group');
	materialOptions_e6 = e_contents5.addProperty('ADBE Vector Materials Group');
	s_contents5 = contents_desligaStart4.addProperty('ADBE Vector Group');
	s_contents5.name = 's';
	contents_s6 = s_contents5.addProperty('ADBE Vectors Group');
	s_contents7 = contents_s6.addProperty('ADBE Vector Shape - Group');
	s_contents7.name = 's';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[-8.03, 0.00], [0.00, 4.71], [7.09, 1.22], [0.00, 2.16], [-3.27, 0.00], [-0.94, -3.88], [0.00, 0.00], [6.65, 0.00], [0.00, -4.49], [-6.81, -1.27], [0.00, -2.16], [3.66, 0.00], [0.89, 3.54], [0.00, 0.00]];
	shp.outTangents = [[6.98, 0.00], [0.00, -3.99], [-5.32, -0.89], [0.00, -2.16], [3.43, 0.00], [0.00, 0.00], [-1.16, -5.04], [-6.48, 0.00], [0.00, 4.04], [5.54, 0.94], [-0.06, 2.38], [-4.87, 0.00], [0.00, 0.00], [1.11, 5.37]];
	shp.vertices = [[-8.57, 0.66], [1.73, -7.15], [-7.97, -14.90], [-14.61, -19.28], [-9.63, -22.77], [-3.53, -17.34], [1.06, -18.44], [-9.63, -26.53], [-19.43, -19.00], [-10.13, -11.24], [-3.04, -7.03], [-8.52, -3.16], [-16.05, -9.31], [-20.59, -8.42]];

	s_contents7.property('ADBE Vector Shape').setValue(shp);
	s_contents7.name = 'Path';
	transform_s6 = s_contents5.addProperty('ADBE Vector Transform Group');
	materialOptions_s6 = s_contents5.addProperty('ADBE Vector Materials Group');
	l_contents5 = contents_desligaStart4.addProperty('ADBE Vector Group');
	l_contents5.name = 'l';
	contents_l6 = l_contents5.addProperty('ADBE Vectors Group');
	l_contents7 = contents_l6.addProperty('ADBE Vector Shape - Group');
	l_contents7.name = 'l';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.outTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.vertices = [[9.32, -33.95], [4.50, -33.95], [4.50, 0.00], [9.32, 0.00]];

	l_contents7.property('ADBE Vector Shape').setValue(shp);
	l_contents7.name = 'Path';
	transform_l6 = l_contents5.addProperty('ADBE Vector Transform Group');
	materialOptions_l6 = l_contents5.addProperty('ADBE Vector Materials Group');
	i_contents5 = contents_desligaStart4.addProperty('ADBE Vector Group');
	i_contents5.name = 'i';
	contents_i6 = i_contents5.addProperty('ADBE Vectors Group');
	i_contents7 = contents_i6.addProperty('ADBE Vector Shape - Group');
	i_contents7.name = 'i';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.outTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.vertices = [[19.44, -29.85], [19.44, -33.95], [13.96, -33.95], [13.96, -29.85]];

	i_contents7.property('ADBE Vector Shape').setValue(shp);
	i_contents7.name = 'Path';
	i_contents7 = contents_i6.addProperty('ADBE Vector Shape - Group');
	i_contents7.name = 'i';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.outTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.vertices = [[19.06, 0.00], [19.06, -25.87], [14.29, -25.87], [14.29, 0.00]];

	i_contents7.property('ADBE Vector Shape').setValue(shp);
	i_contents7.name = 'Path';
	mergePaths1_contents7 = contents_i6.addProperty('ADBE Vector Filter - Merge');
	mergePaths1_contents7.name = 'Merge Paths 1';
	mergePaths1_contents7.name = 'Mode';
	transform_i6 = i_contents5.addProperty('ADBE Vector Transform Group');
	materialOptions_i6 = i_contents5.addProperty('ADBE Vector Materials Group');
	g_contents5 = contents_desligaStart4.addProperty('ADBE Vector Group');
	g_contents5.name = 'g';
	contents_g6 = g_contents5.addProperty('ADBE Vectors Group');
	g_contents7 = contents_g6.addProperty('ADBE Vector Shape - Group');
	g_contents7.name = 'g';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[4.87, 0.00], [0.00, 5.26], [-4.99, 0.00], [0.00, -5.32], [0.00, 0.00]];
	shp.outTangents = [[-5.15, 0.00], [0.00, -5.21], [4.87, 0.00], [0.00, 0.00], [0.00, 4.82]];
	shp.vertices = [[35.05, -5.65], [27.40, -13.85], [35.05, -22.21], [43.02, -13.40], [43.02, -13.24]];

	g_contents7.property('ADBE Vector Shape').setValue(shp);
	g_contents7.name = 'Path';
	g_contents7 = contents_g6.addProperty('ADBE Vector Shape - Group');
	g_contents7.name = 'g';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[0.00, -8.20], [-7.15, 0.00], [-1.16, 4.10], [0.00, 0.00], [0.00, 0.00], [6.20, 0.00], [0.39, 3.32], [0.00, 0.00], [-7.48, 0.00], [0.00, 7.53], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [5.65, -0.06]];
	shp.outTangents = [[0.00, 7.59], [5.15, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 4.32], [-5.04, 0.00], [0.00, 0.00], [0.61, 5.98], [8.14, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [-1.05, -5.21], [-6.70, -0.06]];
	shp.vertices = [[22.58, -13.68], [33.38, -1.44], [42.80, -8.31], [43.02, -8.31], [43.02, -3.32], [35.16, 4.15], [27.51, -1.38], [22.53, -0.72], [35.21, 8.31], [47.84, -3.32], [47.84, -25.87], [43.02, -25.87], [43.02, -18.17], [42.91, -18.17], [33.22, -26.53]];

	g_contents7.property('ADBE Vector Shape').setValue(shp);
	g_contents7.name = 'Path';
	mergePaths1_contents7 = contents_g6.addProperty('ADBE Vector Filter - Merge');
	mergePaths1_contents7.name = 'Merge Paths 1';
	mergePaths1_contents7.name = 'Mode';
	transform_g6 = g_contents5.addProperty('ADBE Vector Transform Group');
	materialOptions_g6 = g_contents5.addProperty('ADBE Vector Materials Group');
	a_contents5 = contents_desligaStart4.addProperty('ADBE Vector Group');
	a_contents5.name = 'a';
	contents_a6 = a_contents5.addProperty('ADBE Vectors Group');
	a_contents7 = contents_a6.addProperty('ADBE Vector Shape - Group');
	a_contents7.name = 'a';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[4.76, 0.00], [0.00, 1.99], [-3.27, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.outTangents = [[-3.77, 0.00], [0.00, -2.27], [0.00, 0.00], [0.00, 0.00], [0.00, 3.54]];
	shp.vertices = [[61.04, -3.49], [56.00, -7.37], [61.04, -10.86], [68.74, -10.86], [68.74, -9.64]];

	a_contents7.property('ADBE Vector Shape').setValue(shp);
	a_contents7.name = 'Path';
	a_contents7 = contents_a6.addProperty('ADBE Vector Shape - Group');
	a_contents7.name = 'a';

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [7.20, 0.00], [0.89, -6.04], [0.00, 0.00], [-3.71, 0.00], [0.00, -4.04], [0.00, 0.00], [0.00, 0.00], [0.00, -4.54], [-5.04, 0.00], [-1.16, 4.76], [0.00, 0.00]];
	shp.outTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, -6.65], [-6.81, 0.00], [0.00, 0.00], [0.72, -4.26], [4.10, 0.00], [0.00, 0.00], [0.00, 0.00], [-6.26, 0.00], [0.00, 4.87], [4.49, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.vertices = [[68.74, 0.00], [73.56, 0.00], [73.56, -16.12], [63.26, -26.42], [52.02, -17.00], [56.61, -16.34], [63.09, -22.32], [68.74, -16.06], [68.74, -14.68], [60.38, -14.68], [51.24, -6.76], [59.55, 0.55], [68.69, -6.59], [68.74, -6.59]];

	a_contents7.property('ADBE Vector Shape').setValue(shp);
	a_contents7.name = 'Path';
	mergePaths1_contents7 = contents_a6.addProperty('ADBE Vector Filter - Merge');
	mergePaths1_contents7.name = 'Merge Paths 1';
	mergePaths1_contents7.name = 'Mode';
	transform_a6 = a_contents5.addProperty('ADBE Vector Transform Group');
	materialOptions_a6 = a_contents5.addProperty('ADBE Vector Materials Group');
	transform_desligaStart4 = desligaStart_contents3.addProperty('ADBE Vector Transform Group');

	// transform position animation...
	// key 1...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(0, [2235, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(1, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(1, 6612, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(1, [11.0166664123535, 0], [-11.0166664123535, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(1, true);
	// key 2...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(0.06673340006673, [2168.9, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(2, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(2, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(2, [22.966667175293, 0], [-22.966667175293, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(2, true);
	// key 3...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(0.13346680013347, [2097.2, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(3, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(3, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(3, [23.2000007629395, 0], [-23.2000007629395, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(3, true);
	// key 4...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(0.16683350016683, [2029.7, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(4, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(4, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(4, [23.0499992370605, 0], [-23.0499992370605, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(4, true);
	// key 5...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(0.23356690023357, [1958.9, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(5, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(5, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(5, [23.2999992370605, 0], [-23.2999992370605, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(5, true);
	// key 6...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(0.3003003003003, [1889.9, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(6, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(6, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(6, [23.1000003814697, 0], [-23.1000003814697, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(6, true);
	// key 7...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(0.33366700033367, [1820.3, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(7, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(7, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(7, [23.1000003814697, 0], [-23.1000003814697, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(7, true);
	// key 8...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(0.4004004004004, [1751.3, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(8, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(8, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(8, [23.5, 0], [-23.5, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(8, true);
	// key 9...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(0.46713380046713, [1679.3, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(9, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(9, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(9, [23.216667175293, 0], [-23.216667175293, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(9, true);
	// key 10...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(0.5005005005005, [1612, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(10, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(10, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(10, [23.5166664123535, 0], [-23.5166664123535, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(10, true);
	// key 11...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(0.56723390056723, [1538.2, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(11, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(11, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(11, [23.533332824707, 0], [-23.533332824707, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(11, true);
	// key 12...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(0.63396730063397, [1470.8, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(12, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(12, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(12, [23.3166675567627, 0], [-23.3166675567627, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(12, true);
	// key 13...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(0.66733400066733, [1398.3, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(13, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(13, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(13, [52.3166656494141, 0], [-52.3166656494141, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(13, true);
	// key 14...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(0.73406740073407, [1156.9, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(14, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(14, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(14, [47.9500007629395, 0], [-47.9500007629395, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(14, true);
	// key 15...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(0.76743410076743, [1110.6, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(15, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(15, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(15, [15.7666664123535, 0], [-15.7666664123535, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(15, true);
	// key 16...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(0.83416750083417, [1062.3, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(16, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(16, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(16, [15.8000001907349, 0], [-15.8000001907349, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(16, true);
	// key 17...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(0.9009009009009, [1015.8, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(17, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(17, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(17, [15.9333333969116, 0], [-15.9333333969116, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(17, true);
	// key 18...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(0.93426760093427, [966.700000000001, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(18, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(18, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(18, [16.2333335876465, 0], [-16.2333335876465, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(18, true);
	// key 19...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(1.001001001001, [918.400000000001, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(19, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(19, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(19, [16.4333324432373, 0], [-16.4333324432373, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(19, true);
	// key 20...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(1.06773440106773, [868.100000000001, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(20, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(20, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(20, [16.3666667938232, 0], [-16.3666667938232, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(20, true);
	// key 21...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(1.1011011011011, [820.200000000001, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(21, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(21, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(21, [16.1666660308838, 0], [-16.1666660308838, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(21, true);
	// key 22...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(1.16783450116783, [771.100000000001, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(22, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(22, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(22, [16.4500007629395, 0], [-16.4500007629395, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(22, true);
	// key 23...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(1.23456790123457, [721.500000000001, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(23, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(23, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(23, [16.1333332061768, 0], [-16.1333332061768, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(23, true);
	// key 24...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(1.26793460126793, [674.300000000001, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(24, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(24, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(24, [15.8500003814697, 0], [-15.8500003814697, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(24, true);
	// key 25...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(1.33466800133467, [626.400000000001, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(25, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(25, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(25, [16.1166667938232, 0], [-16.1166667938232, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(25, true);
	// key 26...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(1.4014014014014, [577.600000000001, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(26, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(26, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(26, [16.3999996185303, 0], [-16.3999996185303, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(26, true);
	// key 27...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(1.43476810143477, [528.000000000001, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(27, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(27, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(27, [15.7166662216187, 0], [-15.7166662216187, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(27, true);
	// key 28...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(1.5015015015015, [483.300000000001, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(28, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(28, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(28, [16.533332824707, 0], [-16.533332824707, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(28, true);
	// key 29...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(1.56823490156823, [428.800000000001, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(29, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(29, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(29, [16.7999992370605, 0], [-16.7999992370605, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(29, true);
	// key 30...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(1.6016016016016, [382.500000000001, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(30, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(30, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(30, [15.4833335876465, 0], [-15.4833335876465, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(30, true);
	// key 31...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(1.66833500166833, [335.900000000001, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(31, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(31, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(31, [16.0666675567627, 0], [-16.0666675567627, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(31, true);
	// key 32...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(1.73506840173507, [286.100000000001, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(32, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(32, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(32, [17.033332824707, 0], [-17.033332824707, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(32, true);
	// key 33...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(1.76843510176843, [233.700000000001, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(33, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(33, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(33, [16.3500003814697, 0], [-16.3500003814697, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(33, true);
	// key 34...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(1.83516850183517, [188.000000000001, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(34, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(34, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(34, [15.4833335876465, 0], [-15.4833335876465, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(34, true);
	// key 35...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(1.9019019019019, [140.800000000001, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(35, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(35, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(35, [16.1833324432373, 0], [-16.1833324432373, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(35, true);
	// key 36...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(1.93526860193527, [90.9000000000007, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(36, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(36, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(36, [16.3333339691162, 0], [-16.3333339691162, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(36, true);
	// key 37...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(2.002002002002, [42.8000000000007, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(37, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(37, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(37, [16.2333335876465, 0], [-16.2333335876465, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(37, true);
	// key 38...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(2.06873540206874, [-6.49999999999931, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(38, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(38, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(38, [16.283332824707, 0], [-16.283332824707, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(38, true);
	// key 39...
	transform_desligaStart4.property('ADBE Vector Position').setValueAtTime(2.1021021021021, [-54.8999999999993, 664]);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_desligaStart4.property('ADBE Vector Position').setTemporalEaseAtKey(39, [easeIn1], [easeOut1]);
	transform_desligaStart4.property('ADBE Vector Position').setInterpolationTypeAtKey(39, 6614, 6614);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialTangentsAtKey(39, [8.06666660308838, 0], [-8.06666660308838, 0]);
	transform_desligaStart4.property('ADBE Vector Position').setSpatialContinuousAtKey(39, true);
	transform_desligaStart4.property('ADBE Vector Scale').setValue([2360, 2360]);
	materialOptions_desligaStart4 = desligaStart_contents3.addProperty('ADBE Vector Materials Group');
	color_contents3 = contents_intro2.addProperty('ADBE Vector Graphic - Fill');
	color_contents3.name = 'color';
	color_contents3.property('ADBE Vector Fill Color').setValue([0.94901960784314, 0.94901960784314, 0.94901960784314, 1]);

	// color color expression...
	exp = 'var lightMode = thisComp.layer(\'ctrl\').effect(\'light | dark mode\')(1).value;\
	var darkColor = [242, 242, 242, 255] / 255;\
	var lightColor = [35, 30, 30, 255] / 255;\
	var val = lightMode ? lightColor : darkColor;\
	val;';
	color_contents3.property('ADBE Vector Fill Color').expression = exp;

	color_contents3.name = 'Opacity';
	transform_intro2 = intro_contents1.addProperty('ADBE Vector Transform Group');

	// transform opacity animation...
	// key 1...
	transform_intro2.property('ADBE Vector Group Opacity').setValueAtTime(0, 100);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_intro2.property('ADBE Vector Group Opacity').setTemporalEaseAtKey(1, [easeIn1], [easeOut1]);
	transform_intro2.property('ADBE Vector Group Opacity').setInterpolationTypeAtKey(1, 6612, 6614);
	// key 2...
	transform_intro2.property('ADBE Vector Group Opacity').setValueAtTime(2.16883550216884, 0);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	transform_intro2.property('ADBE Vector Group Opacity').setTemporalEaseAtKey(2, [easeIn1], [easeOut1]);
	transform_intro2.property('ADBE Vector Group Opacity').setInterpolationTypeAtKey(2, 6614, 6614);
	materialOptions_intro2 = intro_contents1.addProperty('ADBE Vector Materials Group');

	// transformations...
	transform = layer.property('ADBE Transform Group');
	transform.property('ADBE Position').setValue([740.627502441406, 602.5, 0]);

	// masks...
	masks = layer.property('ADBE Mask Parade');
	mask1_masks1 = masks.addProperty('ADBE Mask Atom');
	mask1_masks1.name = 'Mask 1';
	mask1_masks1.inverted = true;

	// mask 1 mask path animation...

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.outTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.vertices = [[1197.37, -1034.50], [-752.63, -1034.50], [-752.63, 915.50], [1197.37, 915.50]];

	// key 1...
	mask1_masks1.property('ADBE Mask Shape').setValueAtTime(0.23356690023357, shp);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 67.17);
	mask1_masks1.property('ADBE Mask Shape').setTemporalEaseAtKey(1, [easeIn1], [easeOut1]);
	mask1_masks1.property('ADBE Mask Shape').setInterpolationTypeAtKey(1, 6613, 6613);

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.outTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.vertices = [[993.37, -830.50], [-548.63, -830.50], [-548.63, 711.50], [993.37, 711.50]];

	// key 2...
	mask1_masks1.property('ADBE Mask Shape').setValueAtTime(0.7007007007007, shp);

	easeIn1 = new KeyframeEase(0.00, 0.1);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	mask1_masks1.property('ADBE Mask Shape').setTemporalEaseAtKey(2, [easeIn1], [easeOut1]);
	mask1_masks1.property('ADBE Mask Shape').setInterpolationTypeAtKey(2, 6613, 6613);

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.outTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.vertices = [[701.37, -538.50], [-256.63, -538.50], [-256.63, 419.50], [701.37, 419.50]];

	// key 3...
	mask1_masks1.property('ADBE Mask Shape').setValueAtTime(0.73406740073407, shp);

	easeIn1 = new KeyframeEase(0.00, 33.33);
	easeOut1 = new KeyframeEase(0.00, 0.1);
	mask1_masks1.property('ADBE Mask Shape').setTemporalEaseAtKey(3, [easeIn1], [easeOut1]);
	mask1_masks1.property('ADBE Mask Shape').setInterpolationTypeAtKey(3, 6613, 6613);

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.outTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.vertices = [[655.37, -494.50], [-212.63, -494.50], [-212.63, 373.50], [655.37, 373.50]];

	// key 4...
	mask1_masks1.property('ADBE Mask Shape').setValueAtTime(1.001001001001, shp);

	easeIn1 = new KeyframeEase(0.00, 80.23);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	mask1_masks1.property('ADBE Mask Shape').setTemporalEaseAtKey(4, [easeIn1], [easeOut1]);
	mask1_masks1.property('ADBE Mask Shape').setInterpolationTypeAtKey(4, 6613, 6614);

	shp = new Shape();
	shp.closed = true;
	shp.inTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.outTangents = [[0.00, 0.00], [0.00, 0.00], [0.00, 0.00], [0.00, 0.00]];
	shp.vertices = [[-748.63, 839.50], [-748.63, 839.50], [-748.63, 839.50], [-748.63, 839.50]];

	// key 5...
	mask1_masks1.property('ADBE Mask Shape').setValueAtTime(2.16883550216884, shp);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	mask1_masks1.property('ADBE Mask Shape').setTemporalEaseAtKey(5, [easeIn1], [easeOut1]);
	mask1_masks1.property('ADBE Mask Shape').setInterpolationTypeAtKey(5, 6613, 6614);
	mask1_masks1.name = 'Mask Expansion';

	// fx...
	effects = layer.property('ADBE Effect Parade');
	// bg effect...
	bg_effects1 = effects.addProperty('ADBE Solid Composite');
	bg_effects1.name = 'bg';
	bg_effects1.property('ADBE Solid Composite-0002').setValue([0.13725490196078, 0.11764705882353, 0.11764705882353, 1]);

	// bg color expression...
	exp = 'var lightMode = thisComp.layer(\'ctrl\').effect(\'light | dark mode\')(1).value;\
	var lightColor = [242, 242, 242, 255] / 255;\
	var darkColor = [35, 30, 30, 255] / 255;\
	var val = lightMode ? lightColor : darkColor;\
	val;';
	bg_effects1.property('ADBE Solid Composite-0002').expression = exp;

	compositingOptions_bg2 = bg_effects1.property('ADBE Effect Built In Params');
	masks_compositingOptions3 = compositingOptions_bg2.property('ADBE Effect Mask Parade');
	maskReference1_masks4 = masks_compositingOptions3.addProperty('ADBE Effect Mask');
	maskReference1_masks4.name = 'Mask Reference 1';
	maskReference1_masks4.property('ADBE Effect Path Stream Ref').setValue(1);
	maskReference1_masks4.name = 'Mask Reference 1';

	// compositing options effect opacity animation...
	// key 1...
	compositingOptions_bg2.property('ADBE Effect Mask Opacity').setValueAtTime(0, 100);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	compositingOptions_bg2.property('ADBE Effect Mask Opacity').setTemporalEaseAtKey(1, [easeIn1], [easeOut1]);
	compositingOptions_bg2.property('ADBE Effect Mask Opacity').setInterpolationTypeAtKey(1, 6614, 6614);
	// key 2...
	compositingOptions_bg2.property('ADBE Effect Mask Opacity').setValueAtTime(2.16883550216884, 0);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	compositingOptions_bg2.property('ADBE Effect Mask Opacity').setTemporalEaseAtKey(2, [easeIn1], [easeOut1]);
	compositingOptions_bg2.property('ADBE Effect Mask Opacity').setInterpolationTypeAtKey(2, 6614, 6614);
	// key 3...
	compositingOptions_bg2.property('ADBE Effect Mask Opacity').setValueAtTime(3.57023690357024, 100);

	easeIn1 = new KeyframeEase(0.00, 16.67);
	easeOut1 = new KeyframeEase(0.00, 16.67);
	compositingOptions_bg2.property('ADBE Effect Mask Opacity').setTemporalEaseAtKey(3, [easeIn1], [easeOut1]);
	compositingOptions_bg2.property('ADBE Effect Mask Opacity').setInterpolationTypeAtKey(3, 6614, 6614);

	// layer attributes...
	layer.moveAfter(cLayer);
	layer.inPoint = 0;
	layer.outPoint = 6.00600600600601;
	layer.name = 'shp_nunca desliga';
	layer.label = 8;
	layer.shy = true;
	layer.locked = true;
	layer.selected = false;
	//*/
}