/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/*

---------------------------------------------------------------
> PROMO GNEWS · CEP tools · animation tab (+ tools sub tab)
---------------------------------------------------------------

  ported from the classic ScriptUI 'animation' tab

    inf.read   → copy keyframe influence (stores keyData / ease globals)
    inf.stats  → read-only stats of the selected keyframes
    inf.apply  → apply influence (args.out / args.in, 0-100)
    lock       → lock transform properties
    rand       → randomize layers   (args.frames, default 30)
    seq        → sequence layers    (args.frames, default 30)
    cols       → columns guide layer rig
    arrow      → simple arrow rig
    count      → counter rig
    type       → typewriter animation
    words      → words animation
    box        → simple box bg base
    wig        → wig rig
    ik         → simple ik rig

*/

(function () {

	// 6612 - linear | 6613 - ease (bezier) | 6614 - hold
	function interpName(t) {
		if (t == 6614) return 'hold';
		if (t == 6613) return 'ease';
		return 'linear';
	}

	// keyframe image index used by the classic ui (keyImg0...9)...
	function keyImgIndex(inType, outType) {
		if (inType == 6613 && outType == 6612) return 1; // ease - linear
		if (inType == 6612 && outType == 6613) return 2; // linear - ease
		if (inType == 6613 && outType == 6613) return 3; // ease - ease
		if (inType == 6614 && outType == 6612) return 6; // hold - linear
		if (inType == 6614 && outType == 6613) return 9; // hold - ease
		if (inType == 6612 && outType == 6614) return 7; // linear - hold
		if (inType == 6613 && outType == 6614) return 8; // ease - hold
		if (inType == 6614 && outType == 6614) return 5; // hold - hold
		return 4; // linear - linear
	}

	// keyframe data (same text the classic tooltip showed)...
	function keyStats(selLayer, aProp, k, keyCount) {
		var kIn = aProp.keyInTemporalEase(k)[0];
		var kOut = aProp.keyOutTemporalEase(k)[0];
		var inType = aProp.keyInInterpolationType(k);
		var outType = aProp.keyOutInterpolationType(k);

		var kHelp = selLayer.name + ' ' + aProp.name + ' key ' + k + ':\n\n';
		kHelp +=
			'<< in\nspeed: ' + kIn.speed.toFixed(1) +
			'\ninfluence: ' + kIn.influence.toFixed(1) +
			'\n\n>> out\nspeed: ' + kOut.speed.toFixed(1) +
			'\ninfluence: ' + kOut.influence.toFixed(1);

		return {
			out: kOut.influence,
			'in': kIn.influence,
			outSpeed: kOut.speed,
			inSpeed: kIn.speed,
			outType: interpName(outType),
			inType: interpName(inType),
			img: keyImgIndex(inType, outType),
			keys: keyCount,
			info: kHelp
		};
	}

	function hasKeys(aProp) {
		return aProp != null && aProp.selectedKeys != undefined && aProp.selectedKeys.length > 0;
	}

	// number of selected keyframes on the selected layers...
	function countSelKeys(selLayers) {
		var count = 0;

		for (var l = 0; l < selLayers.length; l++) {
			var selProps = selLayers[l].selectedProperties;

			for (var p = 0; p < selProps.length; p++) {
				if (hasKeys(selProps[p])) count += selProps[p].selectedKeys.length;
			}
		}
		return count;
	}

	// args.frames → integer (classic edittext default: 30)...
	function framesArg(args) {
		var v = args.frames;

		if (v == null || v === '') v = 30;
		v = parseInt(String(v).replace(/\D/g, ''));

		if (isNaN(v)) PGN.fail('número de frames inválido');
		return v;
	}

	// influence → valid KeyframeEase range...
	function clampInf(v) {
		v = parseFloat(v);
		if (isNaN(v)) PGN.fail('influência inválida');
		if (v < 0.1) v = 0.1;
		if (v > 100) v = 100;
		return v;
	}

	// shared text rig routine (typewriter / words)...
	function textRig(undoName, fxName, fxCode) {
		var comp = PGN.comp();
		var selLayers = comp.selectedLayers;
		var txtArray = [];

		app.beginUndoGroup(undoName);

		if (selLayers.length == 0) {
			selLayers.push(comp.layers.addText('Lettering automático...'));
		}

		for (var l = 0; l < selLayers.length; l++) {
			var content = textContent(selLayers[l]).replace(/[—\-\_\|]$/, '');

			if (content == '') continue;
			txtArray.push(content);
		}
		if (txtArray.length == 0) PGN.fail('nenhum texto encontrado');
		// the pseudo effect is applied to all selected layers at once (ADOBE limitation);
		addPseudoEffect(fxName, fxCode);

		// textArray index... the textArray length may not match selLayers length...
		var t = 0;
		for (var n = 0; n < selLayers.length; n++) {
			var nLayer = selLayers[n];

			if (!(nLayer instanceof TextLayer)) continue;
			var textDoc2 = nLayer
				.property('ADBE Text Properties')
				.property('ADBE Text Document');
			var textDocVal2 = textDoc2.value;

			textDocVal2.text = txtArray[t];
			textDoc2.setValue(textDocVal2);

			selLayers[n].name =
				txtPrefix + 'lettering ' + (txtArray.length - t); // → txt_lettering 1 ... txtArray.length
			t += 1;
		}
		app.endUndoGroup();
		removeFolder(tempFolder);

		return t;
	}

	/*

	---------------------------------------------------------------
	> keyframe influence
	---------------------------------------------------------------

	*/

	PGN.register('inf.read', function (args) {
		var comp = PGN.comp();
		var selLayers = comp.selectedLayers;
		var selLayer = null;
		var aProp = null;

		// the property that holds the selected key (groups like an effect come in the selection too)
		if (countSelKeys(selLayers) != 1) PGN.fail('selecione 1 keyframe');
		for (var l = 0; l < selLayers.length && !aProp; l++) {
			var selProps = selLayers[l].selectedProperties;

			for (var p = 0; p < selProps.length; p++) {
				if (hasKeys(selProps[p])) { selLayer = selLayers[l]; aProp = selProps[p]; break; }
			}
		}
		if (aProp == null) PGN.fail('selecione 1 keyframe');
		var k = aProp.selectedKeys[0];
		var stats = keyStats(selLayer, aProp, k, 1);

		keyData.value = true;
		keyData.inType = aProp.keyInInterpolationType(k);
		keyData.outType = aProp.keyOutInterpolationType(k);
		keyData.inEase = aProp.keyInTemporalEase(k);
		keyData.outEase = aProp.keyOutTemporalEase(k);

		easeInInfluence = stats['in'];
		easeOutInfluence = stats.out;

		return {
			msg: 'Influência copiada (out ' + stats.out.toFixed(0) + '% | in ' + stats['in'].toFixed(0) + '%)',
			data: stats
		};
	});

	//---------------------------------------------------------

	// read-only: first selected keyframe of the selection + total selected keys...
	PGN.register('inf.stats', function (args) {
		var aItem = app.project.activeItem;
		var empty = { out: null, 'in': null, keys: 0, info: '' };

		if (!(aItem instanceof CompItem)) return { msg: '', data: empty };

		var selLayers = aItem.selectedLayers;
		var keyCount = countSelKeys(selLayers);

		empty.keys = keyCount;

		for (var l = 0; l < selLayers.length; l++) {
			var selProps = selLayers[l].selectedProperties;

			for (var p = 0; p < selProps.length; p++) {
				if (!hasKeys(selProps[p])) continue;

				return {
					msg: '',
					data: keyStats(selLayers[l], selProps[p], selProps[p].selectedKeys[0], keyCount)
				};
			}
		}
		return { msg: '', data: empty };
	});

	//---------------------------------------------------------

	/*
	  args.out → ease out influence % (classic slider 1: value)
	  args.in  → ease in influence %  (classic slider 2: 100 - value)
	  without args → paste the copied influence (requires inf.read first)
	*/
	PGN.register('inf.apply', function (args) {
		var hasOut = args.out != null && args.out !== '';
		var hasIn = args['in'] != null && args['in'] !== '';

		if (!hasOut && !hasIn && !keyData.value) PGN.fail('nenhum dado de keyframe copiado');

		var comp = PGN.comp();
		var selLayers = comp.selectedLayers;
		var keyCount = countSelKeys(selLayers);

		if (keyCount == 0) PGN.fail('nenhum keyframe selecionado');

		if (hasOut) easeOutInfluence = clampInf(args.out);
		if (hasIn) easeInInfluence = clampInf(args['in']);

		app.beginUndoGroup('apply ease');

		for (var l = 0; l < selLayers.length; l++) {
			applyEase(selLayers[l]);
		}
		app.endUndoGroup();

		return 'Influência aplicada em ' + PGN.n(keyCount, 'keyframe');
	});

	/*

	---------------------------------------------------------------
	> layers
	---------------------------------------------------------------

	*/

	PGN.register('lock', function (args) {
		var selLayers = PGN.layers(1);

		app.beginUndoGroup('lock transform properties');

		for (var i = 0; i < selLayers.length; i++) {
			lockTrmProp(selLayers[i]);
		}
		app.endUndoGroup();

		return 'Transformações travadas em ' + PGN.n(selLayers.length, 'layer');
	});

	//---------------------------------------------------------

	// randomize layer start times...
	PGN.register('rand', function (args) {
		var selLayers = PGN.layers(2);
		var comp = PGN.comp();
		var limit = framesArg(args);
		var fDur = comp.frameDuration;
		var rArray = [];
		var rMax = 0;
		var rMin = 1;

		app.beginUndoGroup('randomize layers');

		for (var j = 0; j < selLayers.length; j++) {
			// generates a random number between 0 and 1...
			var r = gaussRnd(3);
			rArray.push(r);

			// update the highest and lowest values so far...
			rMax = Math.max(r, rMax);
			rMin = Math.min(r, rMin);
		}
		for (var i = 0; i < selLayers.length; i++) {
			var f = (rArray[i] - rMin) / (rMax - rMin); // normalized value...
			var increment = Math.round(limit * f) * fDur; // final random increment time...

			selLayers[i].startTime += increment;
		}
		app.endUndoGroup();

		return PGN.n(selLayers.length, 'layer') + ' randomizados (até ' + limit + ' frames)';
	});

	//---------------------------------------------------------

	// sequence layer start times...
	PGN.register('seq', function (args) {
		var selLayers = PGN.layers(2);
		var comp = PGN.comp();
		var fDur = comp.frameDuration;
		var frames = framesArg(args);
		var increment = frames * fDur;
		var stMin = comp.duration;

		app.beginUndoGroup('sequence layers');

		for (var j = 0; j < selLayers.length; j++) {
			stMin = Math.min(selLayers[j].inPoint, stMin);
		}
		for (var i = 0; i < selLayers.length; i++) {
			selLayers[i].startTime += (stMin - selLayers[i].inPoint) + (increment * i);
		}
		app.endUndoGroup();

		return PGN.n(selLayers.length, 'layer') + ' em sequência (' + frames + ' frames)';
	});

	/*

	---------------------------------------------------------------
	> rigs and tools
	---------------------------------------------------------------

	*/

	PGN.register('arrow', function (args) {
		PGN.comp();

		app.beginUndoGroup('arrow rig');

		var expFx = arrow();

		var bodyShape = new Shape();
		bodyShape.vertices = [[0, 0], [80, 0], [80, -250], [160, -250]];
		bodyShape.inTangents = [[0, 0], [0, 0], [0, 0], [0, 0]];
		bodyShape.outTangents = [[0, 0], [0, 0], [0, 0], [0, 0]];
		bodyShape.closed = false;

		var headShape = new Shape();
		headShape.vertices = [[-10, -10], [0, 0], [-10, 10]];
		headShape.inTangents = [[0, 0], [0, 0], [0, 0]];
		headShape.outTangents = [[0, 0], [0, 0], [0, 0]];
		headShape.closed = false;

		var shpLayer = shpArrow(bodyShape, headShape);
		addPseudoEffect('arrow', expFx);
		shpLayer.name = 'arrow';
		app.endUndoGroup();
		removeFolder(tempFolder);

		return 'Seta criada';
	});

	//---------------------------------------------------------

	PGN.register('count', function (args) {
		var comp = PGN.comp();
		var selLayers = comp.selectedLayers;
		var valArray = [];

		app.beginUndoGroup('counter');

		if (selLayers.length == 0) {
			var cLayer = comp.layers.addText('0');
			selLayers.push(cLayer);
		}

		for (var l = 0; l < selLayers.length; l++) {
			var aLayer = selLayers[l];

			if (!(aLayer instanceof TextLayer)) continue;
			var textDoc = aLayer
				.property('ADBE Text Properties')
				.property('ADBE Text Document');

			valArray.push(textDoc.value);
		}
		// the pseudo effect is applied to all selected layers at once (ADOBE limitation);
		addPseudoEffect('counter', toolCounter);

		// textArray index... the textArray length may not match selLayers length...
		var t = 0;
		for (var n = 0; n < selLayers.length; n++) {
			var nLayer = selLayers[n];

			if (!(nLayer instanceof TextLayer)) continue;
			var textDoc2 = nLayer
				.property('ADBE Text Properties')
				.property('ADBE Text Document');

			textDoc2.setValue(valArray[t]);

			selLayers[n].name = txtPrefix + 'counter ' + (valArray.length - t); // → txt_counter 1 ... txtArray.length
			t += 1;
		}
		app.endUndoGroup();
		removeFolder(tempFolder);

		return t == 1 ? 'Contador criado' : t + ' contadores criados';
	});

	//---------------------------------------------------------

	PGN.register('cols', function (args) {
		var comp = PGN.comp();

		app.beginUndoGroup('column guides');

		var guideLayer = comp.layers.addShape();
		addPseudoEffect('guides', toolGuides);
		guideLayer.name = 'guides - GNEWS';
		guideLayer.guideLayer = true;

		app.endUndoGroup();
		removeFolder(tempFolder);

		return 'Guia de colunas criado';
	});

	//---------------------------------------------------------

	PGN.register('wig', function (args) {
		var selLayers = PGN.layers(1);
		var w = wig();
		var expFx = w[0];
		var expStr = w[1];

		app.beginUndoGroup('wig rig');

		for (var i = 0; i < selLayers.length; i++) {
			var wProp = selLayers[i]
				.property('ADBE Transform Group')
				.property('ADBE Position');

			addPseudoEffect('wig', expFx);
			wProp.expression = expStr;
		}
		app.endUndoGroup();
		removeFolder(tempFolder);

		return 'Wig aplicado em ' + PGN.n(selLayers.length, 'layer');
	});

	//---------------------------------------------------------

	PGN.register('ik', function (args) {
		var comp = PGN.comp();
		var selLayers = comp.selectedLayers;

		if (selLayers.length != 3) PGN.fail('selecione 3 layers em ordem');

		app.beginUndoGroup('simple ik');

		var bone1 = selLayers[0];
		var bone2 = selLayers[1];
		var bone3 = selLayers[2];

		bone2.parent = bone1;
		bone3.parent = bone2;

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
		var ctrlLayer;

		var zeroLayer = comp.layers.addShape();

		if (nullType == 0) {
			ctrlLayer = shpNull();
		} else {
			ctrlLayer = comp.layers.addNull();
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
		removeFolder(tempFolder);

		return 'IK criado';
	});

	//---------------------------------------------------------

	PGN.register('type', function (args) {
		var t = textRig('typewriter', 'typewriter', toolTypewriter);

		return 'Typewriter aplicado em ' + PGN.n(t, 'layer');
	});

	PGN.register('words', function (args) {
		var t = textRig('words', 'words', toolWords);

		return 'Animação de palavras aplicada em ' + PGN.n(t, 'layer');
	});

	//---------------------------------------------------------

	PGN.register('box', function (args) {
		var comp = PGN.comp();

		app.beginUndoGroup('simple box');

		var selLayers = comp.selectedLayers;

		if (selLayers.length == 0) {
			selLayers.push(comp.layers.addText('Tarja simples...'));
		}

		for (var l = 0; l < selLayers.length; l++) {
			var layer = selLayers[l];
			var effects = layer.property('ADBE Effect Parade');
			// base effect...
			var baseFx = effects.addProperty('ADBE Simple Choker');
			baseFx.name = 'base';
			baseFx.property('ADBE Simple Choker-0001').setValue(2);
			// margin effect...
			var marginFx = effects.addProperty('ADBE Minimax');
			marginFx.name = 'margin';
			marginFx.property('ADBE Minimax-0002').setValue(20);
			marginFx.property('ADBE Minimax-0003').setValue(6);
			// colors effect...
			var colorsFx = effects.addProperty('ADBE Tint');
			colorsFx.name = 'colors';
			colorsFx
				.property('ADBE Tint-0001')
				.setValue([35 / 255, 30 / 255, 30 / 255, 1]);
			colorsFx
				.property('ADBE Tint-0002')
				.setValue([238 / 255, 1, 140 / 255, 1]);
		}
		app.endUndoGroup();

		return 'Tarja criada em ' + PGN.n(selLayers.length, 'layer');
	});

})();
