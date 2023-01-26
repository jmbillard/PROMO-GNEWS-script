/* eslint-disable no-prototype-builtins */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
/*

---------------------------------------------------------------
> 🚶 anim tab
---------------------------------------------------------------

*/

currentGrp = tabsGrp.animation;
var animSubGrp1 = currentGrp.add('group');

// copy keyframe influences...
var copyInfBtn = animSubGrp1.add('iconbutton', iconSize, copyInfluenceIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
copyInfBtn.helpTip = 'copy keyframe influence';

var keyStatsGrp = animSubGrp1.add('group', undefined, { name: 'keyStatsGrp' });
keyStatsGrp.orientation = 'stack';

// keyframe images...
for (var kf = 0; kf < keyImgs.length; kf++) {
	var keyImg = keyStatsGrp.add('image', undefined, keyImgs[kf], { name: 'keyImg' + kf });
	keyImg.helpTip = 'no keyframe data';

	// only the first keyframe image is visible...
	if (kf > 0) keyImg.visible = false;
}

// paste keyframe influences...
var pasteInfBtn = animSubGrp1.add('iconbutton', iconSize, pasteInfluenceIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
pasteInfBtn.helpTip = 'paste keyframe influence';

//---------------------------------------------------------

currentGrp.add('panel');
 
var animSubGrp2 = currentGrp.add('group');

var easeSld1Txt = animSubGrp2.add('statictext', undefined, '1%', { name: 'label' , truncate: 'end'});
easeSld1Txt.maximumSize.width = 30;

var easeSld1 = animSubGrp2.add('slider', undefined, 1, 1, 99);
easeSld1.helpTip = 'ease out influence';
easeSld1.maximumSize.width = 80;
easeSld1.minimumSize.width = vMin;

var easePrevGrp = animSubGrp2.add('group');
easePrevGrp.add('image', undefined, easePrev['img00' + iconTheme]);

var easeSld2 = animSubGrp2.add('slider', undefined, 99, 1, 99);
easeSld2.helpTip = 'ease in influence';
easeSld2.maximumSize.width = 80;
easeSld2.minimumSize.width = vMin;

var easeSld2Txt = animSubGrp2.add('statictext', undefined, '1%', { name: 'label' , truncate: 'end'});
easeSld2Txt.maximumSize.width = 30;

//---------------------------------------------------------

currentGrp.add('panel');
 

var lockTrmBtn = currentGrp.add('iconbutton', iconSize, lockPropIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
lockTrmBtn.helpTip = 'lock transform properties';

//---------------------------------------------------------

currentGrp.add('panel');
 

var animSubGrp3 = currentGrp.add('group');

var layerRandBtn = animSubGrp3.add('iconbutton', iconSize, randomizeLayerTimesIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
layerRandBtn.helpTip = 'randomize layers';

var layerRandTxt = animSubGrp3.add('edittext', undefined, '30');
layerRandTxt.minimumSize.width = vMin;

var layerSeqBtn = animSubGrp3.add('iconbutton', iconSize, sequenceLayerTimesIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
layerSeqBtn.helpTip = 'sequence layers';

//---------------------------------------------------------

currentGrp.add('panel');
 

// tools button...
var toolBtn = currentGrp.add('iconbutton', iconSize, rigToolsIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
toolBtn.helpTip = 'rigs and tools';

/*

---------------------------------------------------------------
> 🚶 animation tab events
---------------------------------------------------------------

*/

copyInfBtn.onClick = function () {
	var aItem = app.project.activeItem;
	var selLayer = aItem != null ? aItem.selectedLayers[0] : null;
	var aProp = selLayer != null ? selLayer.selectedProperties[0] : null;

	if (aProp == null) return;

	// error...
	if (aProp.selectedKeys.length != 1) {
		showTabErr('select 1 keyframe');
		return;
	}
	var k = aProp.selectedKeys[0];
	var kIn = aProp.keyInTemporalEase(k)[0];
	var kOut = aProp.keyOutTemporalEase(k)[0];
	// keyframe data formatted as tooltip...
	var kHelp = selLayer.name + ' ' + aProp.name + ' key ' + k + ':\n\n';
	kHelp +=
		'<< in\nspeed: ' + kIn.speed.toFixed(1) +
		'\ninfluence: ' + kIn.influence.toFixed(1) +
		'\n\n>> out\nspeed: ' + kOut.speed.toFixed(1) +
		'\ninfluence: ' + kOut.influence.toFixed(1);

	keyData.value = true;
	keyData.inType = aProp.keyInInterpolationType(k);
	keyData.outType = aProp.keyOutInterpolationType(k);
	keyData.inEase = aProp.keyInTemporalEase(k);
	keyData.outEase = aProp.keyOutTemporalEase(k);

	// alert(JSON.stringify(keyData.inEase));
	// alert(aProp.propertyValueType);

	// hide all keyframe images...
	for (var kf = 0; kf < keyStatsGrp.children.length; kf++) {
		keyStatsGrp.children[kf].visible = false;
	}

	// 6614 - hold
	// 6613 - ease
	// 6612 - linear
	// shows the keyframe image based on the in|out interpolation type....
	switch (true) {
	// ease - linear
	case keyData.inType == 6613 && keyData.outType == 6612:
		keyStatsGrp.keyImg1.visible = true;
		keyStatsGrp.keyImg1.helpTip = kHelp;
		break;

		// linear - ease
	case keyData.inType == 6612 && keyData.outType == 6613:
		keyStatsGrp.keyImg2.visible = true;
		keyStatsGrp.keyImg2.helpTip = kHelp;
		break;

		// ease - ease
	case keyData.inType == 6613 && keyData.outType == 6613:
		keyStatsGrp.keyImg3.visible = true;
		keyStatsGrp.keyImg3.helpTip = kHelp;
		break;

		// hold - linear
	case keyData.inType == 6614 && keyData.outType == 6612:
		keyStatsGrp.keyImg6.visible = true;
		keyStatsGrp.keyImg6.helpTip = kHelp;
		break;

		// hold - ease
	case keyData.inType == 6614 && keyData.outType == 6613:
		keyStatsGrp.keyImg9.visible = true;
		keyStatsGrp.keyImg9.helpTip = kHelp;
		break;

		// linear - hold
	case keyData.inType == 6612 && keyData.outType == 6614:
		keyStatsGrp.keyImg7.visible = true;
		keyStatsGrp.keyImg7.helpTip = kHelp;
		break;

		// ease - hold
	case keyData.inType == 6613 && keyData.outType == 6614:
		keyStatsGrp.keyImg8.visible = true;
		keyStatsGrp.keyImg8.helpTip = kHelp;
		break;

		// hold - hold
	case keyData.inType == 6614 && keyData.outType == 6614:
		keyStatsGrp.keyImg5.visible = true;
		keyStatsGrp.keyImg5.helpTip = kHelp;
		break;

		// linear - linear
	default:
		keyStatsGrp.keyImg4.visible = true;
		keyStatsGrp.keyImg4.helpTip = kHelp;
		break;
	}
};

//---------------------------------------------------------

easeSld1.onChanging = function () {
	this.value = Math.floor(this.value);

	easeSld1Txt.text = easeSld1Txt.helpTip = this.value + '%';
};

easeSld1.onChange = function () {
	easeSld1Txt.text = easeSld1Txt.helpTip = this.value + '%';

	var suf1 = Math.floor(parseInt(easeSld1Txt.text) / 10) * 10;
	var suf2 = Math.floor(parseInt(easeSld2Txt.text) / 10) * 10;

	easePrevGrp.remove(0);
	easePrevGrp.add('image', undefined, easePrev['img' + suf1 + suf2 + iconTheme]);
	easePrevGrp.layout.layout(true);

	var aItem = app.project.activeItem;
	var selLayers = aItem != null ? aItem.selectedLayers : [];
	easeOutInfluence = this.value;

	for (var l = 0; l < selLayers.length; l++) {
		applyEase(selLayers[l]);
	}
};

easeSld2.onChange = function () {
	easeSld2Txt.text = easeSld2Txt.helpTip = (100 - this.value) + '%';

	var suf1 = Math.floor(parseInt(easeSld1Txt.text) / 10) * 10;
	var suf2 = Math.floor(parseInt(easeSld2Txt.text) / 10) * 10;

	easePrevGrp.remove(0);
	easePrevGrp.add('image', undefined, easePrev['img' + suf1 + suf2 + iconTheme]);
	easePrevGrp.layout.layout(true);

	var aItem = app.project.activeItem;
	var selLayers = aItem != null ? aItem.selectedLayers : [];
	easeInInfluence = 100 - this.value;

	for (var l = 0; l < selLayers.length; l++) {
		applyEase(selLayers[l]);
	}
};

easeSld2.onChanging = function () {
	this.value = Math.floor(this.value);

	easeSld2Txt.text = easeSld2Txt.helpTip = (100 - this.value) + '%';
};

//---------------------------------------------------------

pasteInfBtn.onClick = function () {
	// error...
	if (!keyData.value) {
		showTabErr('no keyframe data');
		return;
	}
	var aItem = app.project.activeItem;
	var selLayers = aItem != null ? aItem.selectedLayers : [];

	for (var l = 0; l < selLayers.length; l++) {
		applyEase(selLayers[l]);
	}
};

//---------------------------------------------------------

easeSld1Txt.addEventListener('click', function (c) {

	if (c.detail == 2) {

		var pos = [
			c.screenX + 16,
			c.screenY - 16
		];

		var input = inputDialog(parseInt(this.text).toString(), pos)
			.toString()
			.replace(/\D/g, '');

		input = parseInt(input);
		input = input > 0 ? input : 1;
		input = input < 99 ? input : 99;
		this.text = this.helpTip = input + '%';
		easeSld1.value = input;

		var suf1 = Math.floor(parseInt(easeSld1Txt.text) / 10) * 10;
		var suf2 = Math.floor(parseInt(easeSld2Txt.text) / 10) * 10;

		easePrevGrp.remove(0);
		easePrevGrp.add('image', undefined, easePrev['img' + suf1 + suf2 + iconTheme]);
		easePrevGrp.layout.layout(true);

		var aItem = app.project.activeItem;
		var selLayers = aItem != null ? aItem.selectedLayers : [];
		easeOutInfluence = easeSld1.value;
		easeInInfluence = 100 - easeSld2.value;

		for (var l = 0; l < selLayers.length; l++) {
			applyEase(selLayers[l]);
		}
	}
});

//---------------------------------------------------------

easeSld2Txt.addEventListener('click', function (c) {

	if (c.detail == 2) {

		var pos = [
			c.screenX + 16,
			c.screenY - 16
		];

		var input = inputDialog(parseInt(this.text).toString(), pos)
			.toString()
			.replace(/\D/g, '');

		input = parseInt(input);
		input = input > 0 ? input : 1;
		input = input < 99 ? input : 99;
		this.text = this.helpTip = input + '%';
		easeSld2.value = 100 - input;

		var suf1 = Math.floor(parseInt(easeSld1Txt.text) / 10) * 10;
		var suf2 = Math.floor(parseInt(easeSld2Txt.text) / 10) * 10;

		easePrevGrp.remove(0);
		easePrevGrp.add('image', undefined, easePrev['img' + suf1 + suf2 + iconTheme]);
		easePrevGrp.layout.layout(true);

		var aItem = app.project.activeItem;
		var selLayers = aItem != null ? aItem.selectedLayers : [];
		easeOutInfluence = easeSld1.value;
		easeInInfluence = 100 - easeSld2.value;

		for (var l = 0; l < selLayers.length; l++) {
			applyEase(selLayers[l]);
		}
	}
});

//---------------------------------------------------------

layerRandTxt.onEnterKey = layerRandTxt.onChange = function () {
	var limit = parseInt(this.text.replace(/\D/g, ''));

	this.text = limit;
	this.helpTip = limit + ' frames';
};

//---------------------------------------------------------

lockTrmBtn.onClick = function () {
	var aItem = app.project.activeItem;
	var selLayers = aItem != null ? aItem.selectedLayers : [];
	// error...
	if (selLayers.length == 0) {
		showTabErr('layer not selected');
		return;
	}
	app.beginUndoGroup('lock transform properties');

	for (i = 0; i < selLayers.length; i++) {
		lockTrmProp(selLayers[i]);
	}
	app.endUndoGroup();
};

//---------------------------------------------------------

// randomize layer start times
layerRandBtn.onClick = function () {
	var aItem = app.project.activeItem;
	var selLayers = aItem != null ? aItem.selectedLayers : [];
	// error...
	if (selLayers.length < 2) {
		showTabErr('select 2 or more layers');
		return;
	}
	var limit = parseInt(layerRandTxt.text.replace(/\D/g, ''));
	var fDur = aItem.frameDuration;
	var rArray = [];
	var rMax = 0;
	var rMin = 1;
	
	app.beginUndoGroup('randomize layers');
		
	for (var j = 0; j < selLayers.length; j++) {
		// generates a random integer between 0 and 1...
		var r = gaussRnd(3);
		rArray.push(r);
		
		// update the highest and lowest values so far...
		rMax = Math.max(r, rMax);
		rMin = Math.min(r, rMin);
	}
	for (var i = 0; i < selLayers.length; i++) {
		var f = (rArray[i] - rMin) / (rMax - rMin); // normalized value...
		var increment = Math.round(limit * f) * fDur; // final random inclement time...

		selLayers[i].startTime += increment;
	}
	app.endUndoGroup();
};

//---------------------------------------------------------

// sequence layer start times
layerSeqBtn.onClick = function () {
	var aItem = app.project.activeItem;
	var selLayers = aItem != null ? aItem.selectedLayers : [];
	// error...
	if (selLayers.length < 2) {
		showTabErr('select 2 or more layers');
		return;
	}
	var fDur = aItem.frameDuration;
	var increment = parseInt(layerRandTxt.text.replace(/\D/g, '')) * fDur;
	var stMin = selLayers[0].startTime;

	app.beginUndoGroup('sequence layers');

	for (var j = 1; j < selLayers.length; j++) {
		stMin = Math.min(selLayers[j].startTime, stMin);
	}
	for (var i = 0; i < selLayers.length; i++) {
		selLayers[i].startTime = stMin + (increment * i);
	}
	app.endUndoGroup();
};

/*

---------------------------------------------------------------
> 🔨 tools tab
---------------------------------------------------------------

*/

currentGrp = tabsGrp.tools;

// guides rig...
var guidesBtn = currentGrp.add('iconbutton', iconSize, guidesIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
guidesBtn.helpTip = 'columns guide layer rig';

// dynamic arrow rig...
var arrowBtn = currentGrp.add('iconbutton', iconSize, arrowIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
arrowBtn.helpTip = 'simple arrow rig';

//---------------------------------------------------------

currentGrp.add('panel');
 

// simple counter rig...
var counterBtn = currentGrp.add('iconbutton', iconSize, counterIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
counterBtn.helpTip = 'make counter rig';

//---------------------------------------------------------

var toolsSubGrp1 = currentGrp.add('group');

// text typing rig...
var typeAnimBtn = toolsSubGrp1.add('iconbutton', iconSize, typewriterIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
typeAnimBtn.helpTip = 'typewriter animation';

var wordsBtn = toolsSubGrp1.add('iconbutton', iconSize, wordsIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
wordsBtn.helpTip = 'words animation';

var simpleBoxBtn = toolsSubGrp1.add('iconbutton', iconSize, boxIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
simpleBoxBtn.helpTip = 'simple box bg base';

//---------------------------------------------------------

currentGrp.add('panel');
 

// wiggle position rig...
var wigBtn = currentGrp.add('iconbutton', iconSize, wigIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
wigBtn.helpTip = 'wig rig';

//---------------------------------------------------------

currentGrp.add('panel');
 

// simple ik rig...
var ikBtn = currentGrp.add('iconbutton', iconSize, ikIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
ikBtn.helpTip = 'simple ik rig';

/*

---------------------------------------------------------------
> 🔨 tools tab events
---------------------------------------------------------------

*/

arrowBtn.onClick = function () {
	var aItem = app.project.activeItem;

	// error...
	if (!(aItem instanceof CompItem)) {
		showTabErr('comp not selected');
		return;
	}
	app.beginUndoGroup('arrow rig');

	var expFx = arrow();

	var bodyShape = new Shape();
	bodyShape.vertices = [
		[0, 0],
		[80, 0],
		[80, -250],
		[160, -250],
	];
	bodyShape.inTangents = [
		[0, 0],
		[0, 0],
		[0, 0],
		[0, 0],
	];
	bodyShape.outTangents = [
		[0, 0],
		[0, 0],
		[0, 0],
		[0, 0],
	];
	bodyShape.closed = false;

	var headShape = new Shape();
	headShape.vertices = [
		[-10, -10],
		[0, 0],
		[-10, 10],
	];
	headShape.inTangents = [
		[0, 0],
		[0, 0],
		[0, 0],
	];
	headShape.outTangents = [
		[0, 0],
		[0, 0],
		[0, 0],
	];
	headShape.closed = false;

	var shpLayer = shpArrow(bodyShape, headShape);
	addPseudoEffect('arrow', expFx);
	shpLayer.name = 'arrow';
	app.endUndoGroup();
};

//---------------------------------------------------------

counterBtn.onClick = function () {
	var aItem = app.project.activeItem;
	// error...
	if (!(aItem instanceof CompItem)) {
		showTabErr('comp not selected');
		return;
	}
	var selLayers = aItem != null ? aItem.selectedLayers : [];
	var valArray = [];

	app.beginUndoGroup('counter');

	if (selLayers.length == 0) {
		var cLayer = aItem.layers.addText('0');
		selLayers.push(cLayer);
	}

	for (var l = 0; l < selLayers.length; l++) {
		// layer...
		var aLayer = selLayers[l];

		if (!(aLayer instanceof TextLayer)) continue;
		// text document...
		var text = aLayer.property('ADBE Text Properties');
		var textDoc = text.property('ADBE Text Document');
		var textDocVal = textDoc.value;

		valArray.push(textDocVal);
	}
	// the pseudo effect is applied to all selected layers at once (ADOBE limitation);
	addPseudoEffect('counter', toolCounter);

	// textArray index... the textArray length may not match selLayers length...
	var t = 0;
	for (var n = 0; n < selLayers.length; n++) {
		// layer...
		var nLayer = selLayers[n];

		if (!(nLayer instanceof TextLayer)) continue;
		// text document...
		var text2 = nLayer.property('ADBE Text Properties');
		var textDoc2 = text2.property('ADBE Text Document');
		var textDocVal2 = textDoc2.value;

		textDoc2.setValue(valArray[t]);

		selLayers[n].name = txtPrefix + 'counter ' + (valArray.length - t); // → txt_counter 1 ... txtArray.length
		// textArray index increment...
		t += 1;
	}
	app.endUndoGroup();
};

//---------------------------------------------------------

guidesBtn.onClick = function () {
	var aItem = app.project.activeItem;
	// error...
	if (!(aItem instanceof CompItem)) {
		showTabErr('comp not selected');
		return;
	}

	app.beginUndoGroup('column guides');

	var guideLayer = app.project.activeItem.layers.addShape();
	addPseudoEffect('guides', toolGuides);
	guideLayer.name = 'guides - GNEWS';
	guideLayer.guideLayer = true;

	app.endUndoGroup();
};

//---------------------------------------------------------

wigBtn.onClick = function () {
	var aItem = app.project.activeItem;
	// error...
	if (!(aItem instanceof CompItem)) {
		showTabErr('comp not selected');
		return;
	}
	var selLayers = aItem != null ? aItem.selectedLayers : [];
	// error...
	if (selLayers.length == 0) {
		showTabErr('layer not selected');
		return;
	}
	var wLayer;
	var wProp;
	var w = wig();
	var expFx = w[0];
	var expStr = w[1];

	app.beginUndoGroup('wig rig');

	for (i = 0; i < selLayers.length; i++) {
		wLayer = selLayers[i];
		wProp = wLayer
			.property('ADBE Transform Group')
			.property('ADBE Position');

		addPseudoEffect('wig', expFx);
		wProp.expression = expStr;
	}
	app.endUndoGroup();
};

//---------------------------------------------------------

ikBtn.onClick = function () {
	var aItem = app.project.activeItem;
	// error...
	if (!(aItem instanceof CompItem)) {
		showTabErr('comp not selected');
		return;
	}
	var selLayers = aItem != null ? aItem.selectedLayers : [];
	// error...
	if (selLayers.length != 3) {
		showTabErr('select 3 layers in order');
		return;
	}
	app.beginUndoGroup('simple ik');

	var bone1 = selLayers[0];
	var bone2 = selLayers[1];
	var bone3 = selLayers[2];

	bone2.parent = bone1;
	bone3.parent = bone2;

	var bone1Pos = bone1
		.property('ADBE Transform Group')
		.property('ADBE Position').value;
	var bone1Rot = bone1
		.property('ADBE Transform Group')
		.property('ADBE Rotate Z').value;
	var bone3Pos = bone3
		.property('ADBE Transform Group')
		.property('ADBE Position').value;
	var k = ik(bone1.name, bone2.name, bone3.name);
	var expFx = k[0];
	var expStr1 = k[1];
	var expStr2 = k[2];
	var expStr3 = k[3];
	var expStr4 = k[4];

	zeroLayer = aItem.layers.addShape();

	if (nullType == 0) {
		ctrlLayer = shpNull();
	} else {
		ctrlLayer = aItem.layers.addNull();
	}
	zeroLayer.moveBefore(bone3);
	zeroLayer.name = bone2.name + ' end';
	zeroLayer.guideLayer = true;
	zeroLayer.label = 2;
	zeroLayer.parent = bone3.parent;
	zeroLayer
		.property('ADBE Transform Group')
		.property('ADBE Position')
		.setValue(bone3Pos);
	zeroLayer.locked = true;
	zeroLayer.shy = true;

	ctrlLayer.moveBefore(bone3);
	ctrlLayer.name = ctrlPrefix + bone3.name;
	ctrlLayer.guideLayer = true;
	ctrlLayer.label = 1;
	ctrlLayer.parent = bone3.parent;
	ctrlLayer
		.property('ADBE Transform Group')
		.property('ADBE Position')
		.setValue(bone3Pos);
	ctrlLayer.parent = bone1.parent;
	ctrlLayer.parent = null;

	bone3.parent = null;

	addPseudoEffect('simple IK', expFx);
	bone1
		.property('ADBE Transform Group')
		.property('ADBE Rotate Z').expression = expStr1;
	bone2
		.property('ADBE Transform Group')
		.property('ADBE Rotate Z').expression = expStr2;
	bone3
		.property('ADBE Transform Group')
		.property('ADBE Position').expression = expStr3;
	bone3
		.property('ADBE Transform Group')
		.property('ADBE Rotate Z').expression = expStr4;

	if (
		bone1.property('ADBE Transform Group').property('ADBE Rotate Z')
			.value != bone1Rot
	) {
		ctrlLayer
			.property('ADBE Effect Parade')
			.property('simple IK')
			.property('flip orientation')
			.setValue(true);
	}
	app.endUndoGroup();
};

//---------------------------------------------------------

typeAnimBtn.onClick = function () {
	var aItem = app.project.activeItem;
	// error...
	if (!(aItem instanceof CompItem)) {
		showTabErr('comp not selected');
		return;
	}
	var selLayers = aItem != null ? aItem.selectedLayers : [];
	var txtArray = [];

	app.beginUndoGroup('typewriter');

	if (selLayers.length == 0) {
		selLayers.push(aItem.layers.addText('Lettering automático...'));
	}

	for (var l = 0; l < selLayers.length; l++) {
		var content = textContent(selLayers[l]);

		if (content == '') continue;
		txtArray.push(content);
	}
	// the pseudo effect is applied to all selected layers at once (ADOBE limitation);

	if (txtArray.length == 0) return;
	addPseudoEffect('typewriter', toolTypewriter);

	// textArray index... the textArray length may not match selLayers length...
	var t = 0;
	for (var n = 0; n < selLayers.length; n++) {
		// layer...
		var nLayer = selLayers[n];

		if (!(nLayer instanceof TextLayer)) continue;
		// text document...
		var textDoc2 = nLayer
			.property('ADBE Text Properties')
			.property('ADBE Text Document');
		var textDocVal2 = textDoc2.value;

		textDocVal2.text = txtArray[t];
		textDoc2.setValue(textDocVal2);

		selLayers[n].name =
			txtPrefix + 'lettering ' + (txtArray.length - t); // → txt_lettering 1 ... txtArray.length
		// textArray index increment...
		t += 1;
	}
	app.endUndoGroup();
};

//---------------------------------------------------------

wordsBtn.onClick = function () {
	var aItem = app.project.activeItem;
	// error...
	if (!(aItem instanceof CompItem)) {
		showTabErr('comp not selected');
		return;
	}
	var selLayers = aItem != null ? aItem.selectedLayers : [];
	var txtArray = [];

	app.beginUndoGroup('words');

	if (selLayers.length == 0) {
		selLayers.push(aItem.layers.addText('Lettering automático...'));
	}

	for (var l = 0; l < selLayers.length; l++) {
		var content = textContent(selLayers[l]);

		if (content == '') continue;
		txtArray.push(content);
	}
	if (txtArray.length == 0) return;
	// the pseudo effect is applied to all selected layers at once (ADOBE limitation);
	addPseudoEffect('words', toolWords);

	// textArray index... the textArray length may not match selLayers length...
	var t = 0;
	for (var n = 0; n < selLayers.length; n++) {
		// layer...
		var nLayer = selLayers[n];

		if (!(nLayer instanceof TextLayer)) continue;
		// text document...
		var textDoc2 = nLayer
			.property('ADBE Text Properties')
			.property('ADBE Text Document');
		var textDocVal2 = textDoc2.value;

		textDocVal2.text = txtArray[t];
		textDoc2.setValue(textDocVal2);

		selLayers[n].name =
			txtPrefix + 'lettering ' + (txtArray.length - t); // → txt_lettering 1 ... txtArray.length
		// textArray index increment...
		t += 1;
	}
	app.endUndoGroup();
};

//---------------------------------------------------------

simpleBoxBtn.onClick = function () {
	var aItem = app.project.activeItem;
	// error...
	if (!(aItem instanceof CompItem)) {
		showTabErr('comp not selected');
		return;
	}
	app.beginUndoGroup('simple box');

	var selLayers = aItem != null ? aItem.selectedLayers : [];

	if (selLayers.length == 0) {
		selLayers.push(aItem.layers.addText('Tarja simples...'));
	}

	for (var l = 0; l < selLayers.length; l++) {
		var layer = selLayers[l];
		// fx...
		var effects = layer.property('ADBE Effect Parade');
		// base effect...
		base_effects1 = effects.addProperty('ADBE Simple Choker');
		base_effects1.name = 'base';
		base_effects1.property('ADBE Simple Choker-0001').setValue(2);
		// margin effect...
		margin_effects1 = effects.addProperty('ADBE Minimax');
		margin_effects1.name = 'margin';
		margin_effects1.property('ADBE Minimax-0002').setValue(20);
		margin_effects1.property('ADBE Minimax-0003').setValue(6);
		// colors effect...
		colors_effects1 = effects.addProperty('ADBE Tint');
		colors_effects1.name = 'colors';
		colors_effects1
			.property('ADBE Tint-0001')
			.setValue([35 / 255, 30 / 255, 30 / 255, 1]);
		colors_effects1
			.property('ADBE Tint-0002')
			.setValue([238 / 255, 1, 140 / 255, 1]);
	}
	app.endUndoGroup();
};
