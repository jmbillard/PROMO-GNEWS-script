/* eslint-disable no-with */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
/*

---------------------------------------------------------------
> 🪟 UI dialogs
---------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061
//  jshint -W043

function findDialog() {
	var findW = new Window('palette', 'find...');
	findW.spacing = 5;
	findW.margins = 0;

	//---------------------------------------------------------

	var searchMainGrp = findW.add('group');
	searchMainGrp.orientation = 'column';
	searchMainGrp.alignChildren = ['center', 'top'];

	var inputGrp = searchMainGrp.add('group');
	inputGrp.spacing = 0;
	inputGrp.margins = 8;

	var findEdTxt = inputGrp.add('edittext', [0, 0, 260, 38]);

	var findBtn = inputGrp.add('iconbutton', iconSize, findIcon.light, { style: 'toolbutton' });
	findBtn.helpTip = 'find';

	//---------------------------------------------------------

	var optMainGrp = searchMainGrp.add('group');
	optMainGrp.spacing = 15;

	var optGrp5 = optMainGrp.add('group');
	optGrp5.alignChildren = ['center', 'top'];
	optGrp5.spacing = 2;

	var optCkb5 = optGrp5.add('checkbox');
	optCkb5.value = true;

	var optIco5 = optGrp5.add('image', undefined, eyeOpenLabelIcon);
	optCkb5.helpTip = optIco5.helpTip = 'only visible layers';

	//---------------------------------------------------------

	var optGrp1 = optMainGrp.add('group');
	optGrp1.alignChildren = ['center', 'top'];
	optGrp1.spacing = 2;

	var optCkb1 = optGrp1.add('checkbox');
	optCkb1.value = false;

	var optTxt1 = optGrp1.add('statictext', undefined, 'Tt');
	optCkb1.helpTip = optTxt1.helpTip = 'match case';

	//---------------------------------------------------------

	var optGrp2 = optMainGrp.add('group');
	optGrp2.alignChildren = ['center', 'top'];
	optGrp2.spacing = 2;

	var optCkb2 = optGrp2.add('checkbox');
	optCkb2.value = false;

	var optTxt2 = optGrp2.add('statictext', undefined, 'àê');
	optCkb2.helpTip = optTxt2.helpTip = 'match accentuation';

	//---------------------------------------------------------

	var optGrp4 = optMainGrp.add('group');
	optGrp4.alignChildren = ['center', 'top'];
	optGrp4.spacing = 2;

	var optCkb4 = optGrp4.add('checkbox');
	optCkb4.value = false;

	var optTxt4 = optGrp4.add('statictext', undefined, '!=');
	optCkb4.helpTip = optTxt4.helpTip = 'results will not include the search keyword';

	//---------------------------------------------------------

	var optGrp3 = optMainGrp.add('group');
	optGrp3.alignChildren = ['center', 'top'];
	optGrp3.spacing = 2;

	var optCkb3 = optGrp3.add('checkbox');
	optCkb3.value = false;

	var optTxt3 = optGrp3.add('statictext', undefined, 'RegExp');
	optCkb3.helpTip = optTxt3.helpTip = 'use regular expression';

	//---------------------------------------------------------

	var infoBtn = optMainGrp.add('iconbutton', undefined, infoIcon.light, { style: 'toolbutton' });
	infoBtn.helpTip = 'Help | README';

	var resultGrp = findW.add('group');

	var findPb = findW.add('progressbar', [0, 0, 305, 5], undefined);
	findPb.value = 100;

	var resultTree = findW.add('treeview', [0, 0, 320, 0]);
	resultTree.visible = false;
	var resultArray = [];

	//---------------------------------------------------------

	findW.onShow = function () {
		findEdTxt.active = true;
	};

	findEdTxt.onEnterKey = findBtn.onClick = function () {
		// starting timer...
		timer();
		findW.text = 'searching...';
		resultTree.visible = false;
		resultTree.size.height = 0;
		findW.layout.layout(true);

		var sKey = findEdTxt.text;
		if (sKey == '' || app.project.numItems == 0) {
			findW.text = 'find...';
			return;
		}
		var optObj = {
			sKey: sKey,
			vis: optCkb5.value,
			matchCase: optCkb1.value,
			matchAccent: optCkb2.value,
			regExp: optCkb3.value,
			invert: optCkb4.value,
		};
		var selArray = getComps(); // → [all comps]
		findTree = buildFindTree(resultTree, optObj, selArray, findPb); // → [filtered comps]
		resultArray = findTree.resultArray; // → [filtered comps]
		count = findTree.count; // → [filtered comps]

		if (resultArray.length == 0) {
			findW.text = 'no matches - ' + timer() + 's  (っ °Д °;)っ';
			return;
		}
		expandNodes(resultTree);
		resultTree.visible = true;
		resultTree.size.height = count >= 16 ? 320 : (count * 21) + 5;
		findW.text = 'complete - ' + timer() + 's  (o °▽ °)o☆';
		findW.layout.layout(true);
	};

	//---------------------------------------------------------

	optCkb3.onClick = function () {
		optCkb1.enabled = optCkb2.enabled = !optCkb3.value;
	};

	//---------------------------------------------------------

	resultTree.onChange = function () {
		var comp;
		var t;

		if (resultTree.selection.type == 'node') {
			comp = resultArray[resultTree.selection.index];
			t = comp.time;
		}
		if (resultTree.selection.type == 'item') {
			comp = resultArray[resultTree.selection.parent.index];
			var lArray = resultTree.selection.toString().split('   ');
			var k = lArray[0] // → '(1)'
				// eslint-disable-next-line no-useless-escape
				.replace(/\(|\)/g, ''); // → '1'
			var i = lArray[1] // → '# 3'
				.replace('#', ''); // → '3'

			for (var l = 1; l <= comp.numLayers; l++) {
				var aLayer = comp.layer(l);
				aLayer.shy = true;
				aLayer.selected = false;

				if (l == parseInt(i)) {
					var doc = aLayer
						.property('ADBE Text Properties')
						.property('ADBE Text Document');

					t = (aLayer.outPoint - aLayer.inPoint) / 2 + aLayer.inPoint;
					aLayer.shy = false;
					aLayer.selected = true;

					if (doc.numKeys > 0) t = doc.keyTime(parseInt(k));

					t = t < comp.duration ? t : comp.duration;
					t = t < 0 ? 0 : t;
				}
			}
			comp.hideShyLayers = true;
		}
		comp.openInViewer();
		comp.time = t;
	};

	//---------------------------------------------------------

	infoBtn.onClick = function () {

		openWebSite('https://github.com/jmbillard/find#find-script');
	};

	findW.show();
}
