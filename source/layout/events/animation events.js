/*

---------------------------------------------------------------
> 🚶 animation tab events
---------------------------------------------------------------

*/

copyInfBtn.onClick = function () {
	var aItem = app.project.activeItem;
	var selLayer = aItem != null ? aItem.selectedLayers[0] : null;
	var aProp = selLayer != null ? selLayer.selectedProperties[0] : null;
	// error...
	if (aProp.selectedKeys.length != 1) {
		showTabErr('select 1 keyframe');
		return;
	}
	var k = aProp.selectedKeys[0];
	var kIn = aProp.keyInTemporalEase(k)[0];
	var kOut = aProp.keyOutTemporalEase(k)[0];
	// keyframe data formatted as tooltip...
	var kHelp =
		selLayer.name + ' ' + aProp.name + ' key ' + k + ':\n\n';
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
	easeSld1Txt.text = easeSld1Txt.helpTip = this.value + '% out';
};

easeSld1.onChange = function () {

	var aItem = app.project.activeItem;
	var selLayers = aItem != null ? aItem.selectedLayers : null;
	easeOutInfluence = this.value;
	
	for (var l = 0; l < selLayers.length; l++) {
		var aLayer = selLayers[l];
		var selProps = aLayer.selectedProperties;

		for (var p = 0; p < selProps.length; p++) {
			var aProp = selProps[p];
			var selKeys = aProp.selectedKeys;

			for (var k = 0; k < selKeys.length; k++) {
				var aKey = selKeys[k];

				// if (selKeys.length > 1 && k == selKeys.length - 1) continue;

				var easeIn = new KeyframeEase(0, easeInInfluence);
				var easeOut = new KeyframeEase(0, easeOutInfluence);
				var easeInArray = [easeIn];
				var easeOutArray = [easeOut];
				
				try {
					aProp.setTemporalEaseAtKey(aKey, easeInArray, easeOutArray);

				} catch (err) {

					if (Array.isArray(aProp.value)) {
	
						for (var e = 1; e < aProp.value.length; e++) {
							easeOutArray.push(easeOut);
							easeInArray.push(easeIn);
						}
					}
	
					aProp.setTemporalEaseAtKey(aKey, easeInArray, easeOutArray);
				}
			}
		}
	}
};

easeSld2.onChange = function () {

	var aItem = app.project.activeItem;
	var selLayers = aItem != null ? aItem.selectedLayers : null;
	easeInInfluence = 100 - this.value;
	
	for (var l = 0; l < selLayers.length; l++) {
		var aLayer = selLayers[l];
		var selProps = aLayer.selectedProperties;

		for (var p = 0; p < selProps.length; p++) {
			var aProp = selProps[p];
			var selKeys = aProp.selectedKeys;

			for (var k = 0; k < selKeys.length; k++) {
				var aKey = selKeys[k];

				// if (selKeys.length > 1 && k == 0) continue;

				var easeOut = new KeyframeEase(0, easeOutInfluence);
				var easeIn = new KeyframeEase(0, easeInInfluence);
				var easeInArray = [easeIn];
				var easeOutArray = [easeOut];
				
				try {
					aProp.setTemporalEaseAtKey(aKey, easeInArray, easeOutArray);

				} catch (err) {

					if (Array.isArray(aProp.value)) {
	
						for (var e = 1; e < aProp.value.length; e++) {
							easeOutArray.push(easeOut);
							easeInArray.push(easeIn);
						}
					}
	
					aProp.setTemporalEaseAtKey(aKey, easeInArray, easeOutArray);
				}
			}
		}
	}
};

easeSld2.onChanging = function () {

	this.value = Math.floor(this.value);
	easeSld2Txt.text = easeSld2Txt.helpTip = (100 - this.value) + '% in';
};

//---------------------------------------------------------

pasteInfBtn.onClick = function () {
	// error...
	if (!keyData.value) {
		showTabErr('no keyframe data');
		return;
	}
	var aItem = app.project.activeItem;
	var selLayers = aItem != null ? aItem.selectedLayers : null;

	for (var l = 0; l < selLayers.length; l++) {
		var aLayer = selLayers[l];
		var selProps = aLayer.selectedProperties;

		for (var p = 0; p < selProps.length; p++) {
			var aProp = selProps[p];
			var selKeys = aProp.selectedKeys;

			for (var k = 0; k < selKeys.length; k++) {
				var aKey = selKeys[k];

				try {
					aProp.setTemporalEaseAtKey(aKey, keyData.inEase, keyData.outEase);
				} catch (err) {
					var inEase = [keyData.inEase[0]];
					var outEase = [keyData.outEase[0]];

					if (Array.isArray(aProp.value)) {

						for (var e = 1; e < aProp.value.length; e++) {
							inEase.push(keyData.inEase[0]);
							outEase.push(keyData.outEase[0]);
						}
					}
					aProp.setTemporalEaseAtKey(aKey, inEase, outEase);
				}
				aProp.setInterpolationTypeAtKey(aKey, keyData.inType, keyData.outType);
			}
		}
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
		this.text = this.helpTip = input + '% out';
    easeSld1.value = input;
	
		var aItem = app.project.activeItem;
		var selLayers = aItem != null ? aItem.selectedLayers : null;
		easeOutInfluence = easeSld1.value;
		easeInInfluence = 100 - easeSld2.value;

		for (var l = 0; l < selLayers.length; l++) {
			var aLayer = selLayers[l];
			var selProps = aLayer.selectedProperties;
	
			for (var p = 0; p < selProps.length; p++) {
				var aProp = selProps[p];
				var selKeys = aProp.selectedKeys;
	
				for (var k = 0; k < selKeys.length; k++) {
					var aKey = selKeys[k];
	
					// if (selKeys.length > 1 && k == selKeys.length - 1) continue;
	
					var easeIn = new KeyframeEase(0, easeInInfluence);
					var easeOut = new KeyframeEase(0, easeOutInfluence);
					var easeInArray = [easeIn];
					var easeOutArray = [easeOut];
					
					try {
						aProp.setTemporalEaseAtKey(aKey, easeInArray, easeOutArray);
	
					} catch (err) {
	
						if (Array.isArray(aProp.value)) {
		
							for (var e = 1; e < aProp.value.length; e++) {
								easeOutArray.push(easeOut);
								easeInArray.push(easeIn);
							}
						}
						aProp.setTemporalEaseAtKey(aKey, easeInArray, easeOutArray);
					}
				}
			}
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
    this.text = this.helpTip = input + '% in';
    easeSld2.value = 100 - input;

		var aItem = app.project.activeItem;
		var selLayers = aItem != null ? aItem.selectedLayers : null;
		easeOutInfluence = easeSld1.value;
		easeInInfluence = 100 - easeSld2.value;
		
		for (var l = 0; l < selLayers.length; l++) {
			var aLayer = selLayers[l];
			var selProps = aLayer.selectedProperties;
	
			for (var p = 0; p < selProps.length; p++) {
				var aProp = selProps[p];
				var selKeys = aProp.selectedKeys;
	
				for (var k = 0; k < selKeys.length; k++) {
					var aKey = selKeys[k];
	
					// if (selKeys.length > 1 && k == 0) continue;
	
					var easeOut = new KeyframeEase(0, easeOutInfluence);
					var easeIn = new KeyframeEase(0, easeInInfluence);
					var easeInArray = [easeIn];
					var easeOutArray = [easeOut];
					
					try {
						aProp.setTemporalEaseAtKey(aKey, easeInArray, easeOutArray);
	
					} catch (err) {
	
						if (Array.isArray(aProp.value)) {
		
							for (var e = 1; e < aProp.value.length; e++) {
								easeOutArray.push(easeOut);
								easeInArray.push(easeIn);
							}
						}
		
						aProp.setTemporalEaseAtKey(aKey, easeInArray, easeOutArray);
					}
				}
			}
		}
	}
});

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
	if (selLayers.length == 0) {
		showTabErr('layer not selected');
		return;
	}
	var limit = 30;

	app.beginUndoGroup('randomize layer times');

	var fDur = aItem.frameDuration;
	var sTimeMin = selLayers[0].startTime;
	var sTimeMax = selLayers[0].startTime;

	// gets the min and max layer start times...
	for (i = 1; i < selLayers.length; i++) {
		selTime = selLayers[i].startTime;
		sTimeMin = sTimeMin < selTime ? sTimeMin : selTime;
		sTimeMax = sTimeMax > selTime ? sTimeMax : selTime;
	}

	// number of frames between the last and first layer start times...
	limit = sTimeMax != sTimeMin ? (sTimeMax - sTimeMin) / fDur : limit;

	for (i = 0; i < selLayers.length; i++) {
		// generates a random number of frames between 0 and limit...
		var nRandFrames = Math.round(gaussRnd(3) * limit) * fDur;

		if (sTimeMax != sTimeMin) {
			// sets each layer start time as the min + random number of frames...
			selLayers[i].startTime = sTimeMin + nRandFrames;
		} else {
			var halfLimit = (limit / 2) * fDur;
			selLayers[i].startTime = sTimeMin - halfLimit + nRandFrames;
		}
	}
	app.endUndoGroup();
};

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

		selLayers[n].name =
			txtPrefix + 'counter ' + (valArray.length - t); // → txt_counter 1 ... txtArray.length
		// textArray index increment...
		t += 1;
	}
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
};
