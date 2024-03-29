/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
/*

---------------------------------------------------------------
> 🖌️ animation
---------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061
//  jshint -W085
//  jshint -W043

// lock transform properties
function lockTrmProp(sLayer) {
	var trm = sLayer.property('ADBE Transform Group');
	var expStr = '// locked...\n';

	for (p = 1; p <= trm.numProperties; p++) {
		var prop = trm.property(p);
		var val = prop.value;

		if (!prop.canSetExpression) continue;
		if (prop.numKeys > 0) continue;
		if (prop.expression != '') continue;

		if (Array.isArray(val)) {
			val = '[' + val.toString() + ']';
		}
		prop.expression = expStr + val.toString() + ';';
	}
}

// clone expressions...
function cloneExpressions(sLayer, cLayer) {
	var sTrm = sLayer.property('ADBE Transform Group');
	var cTrm = cLayer.property('ADBE Transform Group');
	sLayer.parent = cLayer.parent;

	for (var p = 1; p <= sTrm.numProperties; p++) {
		var prop = sTrm.property(p);
		var cProp = cTrm.property(p);
		var expStr = prop.expression;

		if (prop.matchName == 'ADBE Opacity') continue;
		if (prop.expression == '') continue;

		prop.expression = '';

		try {
			cProp.setValue(prop.value);
		} catch (err) { }

		cTrm.property(p).expression = expStr;

		if (prop.matchName == 'ADBE Position') {
			prop.setValue(cProp.value);
		}
	}
	sLayer.parent = cLayer;
}

// set keyframe properties...
function setKeys(prop, cProp) {
	for (var k = 1; k <= prop.numKeys; k++) {
		var t = prop.keyTime(k);
		var v = prop.keyValue(k);
		cProp.setValueAtTime(t, v);

		var tInTArray = prop.keyInTemporalEase(k);
		var tOutTArray = prop.keyOutTemporalEase(k);
		cProp.setTemporalEaseAtKey(k, tInTArray, tOutTArray);

		var kInIType = prop.keyInInterpolationType(k);
		var kOutIType = prop.keyOutInterpolationType(k);
		cProp.setInterpolationTypeAtKey(k, kInIType, kOutIType);

		if (prop.isSpatial) {
			var kInSArray = prop.keyInSpatialTangent(k);
			var kOutSArray = prop.keyOutSpatialTangent(k);
			cProp.setSpatialTangentsAtKey(k, kInSArray, kOutSArray);
			var ct = prop.keySpatialContinuous(k);
			cProp.setSpatialContinuousAtKey(k, ct);
		}
	}
}

// clone keyframes...
function cloneKeys(sLayer, cLayer) {
	var sLayerTrm = sLayer
		.property('ADBE Transform Group');
	var cLayerTrm = cLayer
		.property('ADBE Transform Group');

	sLayer.parent = cLayer.parent;

	for (var p = 1; p <= sLayerTrm.numProperties; p++) {
		var sProp = sLayerTrm.property(p);
		var cProp = cLayerTrm.property(p);


		if (sProp.numKeys == 0) continue;
		if (sProp.matchName == 'ADBE Opacity') continue;

		if (sProp.dimensionsSeparated) {
			cProp.dimensionsSeparated = true;

			for (var d = 0; d < sProp.value.length; d++) {
				var sPropD = sProp.getSeparationFollower(d);
				var cPropD = cProp.getSeparationFollower(d);
				setKeys(sPropD, cPropD);
				while (sPropD.numKeys > 0) sPropD.removeKey(1);
			}
		} else {
			setKeys(sProp, cProp);
			while (sProp.numKeys > 0) sProp.removeKey(1);
		}
		try {
			sProp.setValue(cProp.value);
		} catch (err) { }
	}
	sLayer.parent = cLayer;
	sLayerTrm
		.property('ADBE Position')
		.dimensionsSeparated = false;
	sLayerTrm
		.property('ADBE Position')
		.setValue([0, 0, 0]);
	sLayerTrm
		.property('ADBE Scale')
		.setValue([100, 100, 100]);
}

function addPseudoEffect(fxName, strCode) {
	var fx = {
		name: fxName,
		binary: [strCode],
	};
	var tempFolder = new Folder(tempPath);
	if (!tempFolder.exists) tempFolder.create();
	var aPreset = createPresetFile(tempPath, fx.name, fx.binary);

	try {
		app.project.activeItem.layer(1).applyPreset(File(aPreset));
	} catch (err) { }
}

// reposiciona e parenteia um layer mantendo a hierarquia...
function setHierarchy(sLayer, cLayer) {
	var sTrm = sLayer.property('ADBE Transform Group');
	var sPos = sTrm.property('ADBE Position');
	var cTrm = cLayer.property('ADBE Transform Group');
	var cPos = cTrm.property('ADBE Position');

	if (sLayer.parent != null) cLayer.parent = sLayer.parent;

	if (sLayer.threeDLayer) cLayer.threeDLayer = true;
	if (sLayer instanceof LightLayer) cLayer.threeDLayer = true;

	cPos.setValue(sPos.value);

	if (sLayer instanceof CameraLayer) cLayer.threeDLayer = true;

	sLayer.parent = cLayer;

	for (var i = 1; i <= sTrm.numProperties; i++) {

		if (sTrm.property(i).dimensionsSeparated) {
			cTrm.property(i).dimensionsSeparated = true;
		}
	}
}

// find center point...
function findCenter(lArray) {
	var maxY = 0;
	var minY = 99999999999999999999;
	var maxX = 0;
	var minX = 99999999999999999999;
	var maxZ = 0;
	var minZ = 99999999999999999999;

	for (i = 0; i < lArray.length; i++) {
		var lPos = lArray[i]
			.property('ADBE Transform Group')
			.property('ADBE Position');

		maxX = Math.max(maxX, lPos.value[0]);
		minX = Math.min(minX, lPos.value[0]);
		maxY = Math.max(maxY, lPos.value[1]);
		minY = Math.min(minY, lPos.value[1]);
		maxZ = Math.max(maxZ, lPos.value[2]);
		minZ = Math.min(minZ, lPos.value[2]);
	}

	return [
		minX + (maxX - minX) / 2,
		minY + (maxY - minY) / 2,
		minZ + (maxZ - minZ) / 2
	];
}


function applyEase(sLayer) {
	var selProps = sLayer.selectedProperties;

	for (var p = 0; p < selProps.length; p++) {
		var aProp = selProps[p];
		var selKeys = aProp.selectedKeys;

		for (var k = 0; k < selKeys.length; k++) {
			var aKey = selKeys[k];

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