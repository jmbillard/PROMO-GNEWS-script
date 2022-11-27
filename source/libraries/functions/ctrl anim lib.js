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

		if (!prop.canSetExpression) {
			continue;
		}
		if (prop.numKeys != 0) {
			continue;
		}
		if (prop.expression != '') {
			continue;
		}

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

		if (prop.matchName == 'ADBE Opacity') {
			continue;
		}
		if (prop.expression == '') {
			continue;
		}

		prop.expression = '';

		try {
			cProp.setValue(prop.value);
		} catch (error) {}

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
function cloneKeys(selLayer, ctrlLayer) {
	var selLayerTrm = selLayer.property('ADBE Transform Group');
	var ctrlLayerTrm = ctrlLayer.property('ADBE Transform Group');

	selLayer.parent = ctrlLayer.parent;

	for (var p = 1; p <= selLayerTrm.numProperties; p++) {
		var selLayerProp = selLayerTrm.property(p);
		var ctrlLayerProp = ctrlLayerTrm.property(p);

		if (
			selLayerProp.numKeys != 0 &&
			selLayerProp.matchName != 'ADBE Opacity'
		) {
			if (selLayerProp.dimensionsSeparated) {
				ctrlLayerProp.dimensionsSeparated = true;

				for (var d = 0; d < selLayerProp.value.length; d++) {
					var selLayerPropD = selLayerProp.getSeparationFollower(d);
					var ctrlLayerPropD = ctrlLayerProp.getSeparationFollower(d);
					setKeys(selLayerPropD, ctrlLayerPropD);
				}
			} else {
				setKeys(selLayerProp, ctrlLayerProp);
			}
			for (var k = 1; k <= ctrlLayerProp.numKeys; k++) {
				selLayerProp.removeKey(1);
			}
			try {
				selLayerProp.setValue(ctrlLayerProp.value);
			} catch (error) {}
		}
	}
	selLayer.parent = ctrlLayer;
}

function addPseudoEffect(fxName, strCode) {
	var fx = {
		name: fxName,
		binary: [strCode],
	};
	var aPreset = createPresetFile(downPath, fx.name, fx.binary);

	try {
		app.project.activeItem.layer(1).applyPreset(File(aPreset));
	} catch (error) {}
}

// reposiciona e parenteia um layer mantendo a hierarquia...
function setHierarchy(sLayer, cLayer) {
	var sTrm = sLayer.property('ADBE Transform Group');
	var sPos = sTrm.property('ADBE Position');
	var cTrm = cLayer.property('ADBE Transform Group');
	var cPos = cTrm.property('ADBE Position');

	if (sLayer.parent != null) {
		cLayer.parent = sLayer.parent;
	}
	if (sLayer.threeDLayer || sLayer instanceof LightLayer) {
		cLayer.threeDLayer = true;
	}
	cPos.setValue(sPos.value);

	if (sLayer instanceof CameraLayer) {
		cLayer.threeDLayer = true;
	}
	sLayer.parent = cLayer;

	for (i = 1; i <= sTrm.numProperties; i++) {
		if (sTrm.property(i).dimensionsSeparated) {
			cTrm.property(i).dimensionsSeparated = true;
		}
	}
}

// find center point...
function findCenter(lArray) {
	var maxY = 0;
	var minY = 0;
	var maxX = 0;
	var minX = 0;
	var maxZ = 0;
	var minZ = 0;

	for (i = 0; i < lArray.length; i++) {
		var aLayer = lArray[i];
		var lPos = aLayer
			.property('ADBE Transform Group')
			.property('ADBE Position');
		var lPosX = lPos.value[0];
		var lPosY = lPos.value[1];
		var lPosZ = lPos.value[2];

		if (i == 0) {
			maxX = lPosX;
			minX = lPosX;
			maxY = lPosY;
			minY = lPosY;
			minZ = lPosZ;
			minZ = lPosZ;
		} else {
			if (lPosX > maxX) {
				maxX = lPosX;
			} else if (lPosX < minX) {
				minX = lPosX;
			}
			if (lPosY > maxY) {
				maxY = lPosY;
			} else if (lPosY < minY) {
				minY = lPosY;
			}
			if (lPosZ > maxZ) {
				maxZ = lPosZ;
			} else if (lPosZ < minZ) {
				minZ = lPosZ;
			}
		}
	}
	var cPos = [];
	cPos.push(minX + (maxX - minX) / 2);
	cPos.push(minY + (maxY - minY) / 2);
	cPos.push(minZ + (maxZ - minZ) / 2);

	return cPos;
}
