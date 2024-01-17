/* eslint-disable no-prototype-builtins */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
/*

---------------------------------------------------------------
> 🌳 tree view functions
---------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061
//  jshint -W085
//  jshint -W043

// remove empty tree folders...
function cleanHierarchy(nodeTree) {
	var branches = nodeTree.items; // all current tree item subitems...

	for (var i = branches.length - 1; i >= 0; i--) {
		if (branches[i].type != 'node') continue; // ignore item...

		if (branches[i].items.length > 0) {
			cleanHierarchy(branches[i]); // current item is folder item...
		} else {
			nodeTree.remove(branches[i]); // remove current folder item...
		}
		if (nodeTree.items.length == 0 && nodeTree.type == 'node') { // empty folder item...
			nodeTree.parent.remove(nodeTree); // remove current folder item...
		}
	}
}

// remove empty tree folders...
function optimizeHierarchy(nodeTree) {
	var branches = nodeTree.items; // all current tree item subitems...

	for (var i = branches.length - 1; i >= 0; i--) {

		if (branches[i].type != 'node') continue; // ignore item...

		if (branches[i].items.length > 1) {
			optimizeHierarchy(branches[i]);

		} else {

			if (branches[i].items.length == 1 && branches[i].items[0].type == 'node') {
				branches[i].text += ' / ' + branches[i].items[0].text;

				for (var it = branches[i].items[0].items.length - 1; it >= 0; it--) {
					var nItem = branches[i].add(branches[i].items[0].items[it].type, branches[i].items[0].items[it].text);
					nItem.image = branches[i].items[0].items[it].image;
					branches[i].remove(0);
				}
			}
		}
	}
}

// populates the 'tree view' node hierarchy...
function createHierarchy(array, node, fileTypes) {

	for (var n = 0; n < array.length; n++) {
		var nodeName = array[n].displayName; // current item name...
		var subArray = []; // folder content array...

		// get folder content if current item is a folder...
		if (array[n] instanceof Folder) subArray = array[n].getFiles();

		if (subArray.length > 0) {
			// current folder has content...
			nodeItem = node.add('node', nodeName); // folder node...
			nodeItem.image = fldTogIcon.light; // folder icon...

			createHierarchy(subArray, nodeItem, fileTypes);

		} else {
			try {
				// filter file extensions...
				if (fileTypes.indexOf(getFileExt(nodeName)) < 0) continue;

				var templateItem = node.add('item', nodeName); // item...
				templateItem.image = templateListIcon.light; // item icon...
			} catch (error) { }
		}
	}
}

// refreshes the main 'tree view' node...
function buildTree(folder, tree, fileTypes) {
	// removes the 'root' node...
	tree.remove(tree.items[0]);

	var folderContentArray = folder.getFiles();

	// adds a new 'root' node...
	var folderNode = tree.add('node', folder.displayName);
	folderNode.image = fldTogIcon.light;

	// starts the recursive population...
	createHierarchy(folderContentArray, folderNode, fileTypes);
	cleanHierarchy(tree);
	optimizeHierarchy(tree);
}

// [ ] comment - buildFontTree
function buildFontTree(folder, tree) {
	tree.remove(tree.items[0]);

	var fontsArray = folder.getFiles();

	var folderNode = tree.add('node', folder.displayName);
	folderNode.image = fldTogIcon.light;

	for (var n = 0; n < fontsArray.length; n++) {
		var fName = fontsArray[n].displayName;
		var subArray = [];

		// get folder content if current item is a folder...
		if (fontsArray[n] instanceof File) continue;
		subArray = fontsArray[n].getFiles();

		if (subArray.length == 0) continue;
		var fontFamilyItem = folderNode.add('item', fName);
		fontFamilyItem.image = fontFamilyIcon;
	}
	cleanHierarchy(tree);
}

function buildFindTree(tree, obj, compArray, progBar) {
	var sKey = obj.sKey; // keyword...
	var vis = obj.vis; // include hidden layers...
	var matchCase = obj.matchCase; // match text case...
	var matchAccent = obj.matchAccent; // match accentuation...
	var invert = !obj.invert; // search wont include keyword...
	var regExp = obj.regExp; // use regular expressions...
	var resultArray = []; // matched comps array...

	if (sKey == '') return resultArray; // -> empty search

	if (regExp) {
		var pattern = 'new RegExp(/' + sKey + '/);'; // -> pattern string
		sKey = eval(pattern); // -> regExp pattern
	}

	// delete all tree items...
	while (tree.items.length > 0) {
		tree.remove(tree.items[0]);
	}
	progBar.value = 0; // current search progress...
	count = 0; // current tree items count (nodes + items)...

	var progInc = 100 / compArray.length; // search progress increment step...

	for (i = 0; i < compArray.length; i++) {

		for (var l = 1; l <= compArray[i].numLayers; l++) {
			if (!(compArray[i].layer(l) instanceof TextLayer)) continue; // is not text layer...

			var compItem; // current comp tree item...
			var txtLayer = compArray[i].layer(l); // current text layer
			var doc = txtLayer
				.property('ADBE Text Properties')
				.property('ADBE Text Document'); // layer source text property...
			var txtArray = []; // matched text content array...

			if (doc.numKeys > 0) {
				// source text has keyframes...
				for (var k = 1; k <= doc.numKeys; k++) {
					// includes source text keyframes content...
					compArray[i].time = doc.keyTime(k);
					txtArray.push(textContent(txtLayer));
				}
			} else {
				// source text property has expression...
				// move comp play head to 1 second before the current text layer out point...
				if (doc.expression != '') compArray[i].time = txtLayer.outPoint - 1;
				// includes source text with expressions...
				txtArray.push(textContent(txtLayer));
			}
			if (!regExp) {
				// regular expressions unchecked...
				for (var m = 0; m < txtArray.length; m++) {
					// respect ALL CAPS layer toggle...
					if (doc.value.allCaps) txtArray[m] = txtArray[m].toUpperCase();
					if (!matchCase) txtArray[m] = txtArray[m].toLowerCase();
					if (!matchAccent) txtArray[m] = txtArray[m].replaceSpecialCharacters();
				}
				sKey = matchCase ? sKey : sKey.toLowerCase();
				sKey = matchAccent ? sKey : sKey.replaceSpecialCharacters();
			}

			if (vis && txtLayer.enabled == false) continue; // ignore hidden layers...

			for (var f = 0; f < txtArray.length; f++) {
				var r = txtArray[f].match(sKey) == null ? false : true; // current match result...

				if (r != invert) continue; // ignore match if invert is checked...

				if (resultArray.indexOf(compArray[i]) < 0) { // check for duplicate entries...
					// character length limited comp name...
					var compName = limitNameSize(compArray[i].name, 45);
					// add comp tree item... -> comp_comp...name
					compItem = tree.add('node', compName);
					compItem.image = compTogIcon.light; // add com icon...
					count += 1; // incremente tree items count...

					resultArray.push(compArray[i]); // push current comp to resultArray...
				}
				var layerName = limitNameSize(txtLayer.name, 35);
				// add text layer tree item... -> (1)  # 5  txt_layer...name
				var txtItem = compItem.add('item', '(' + (f + 1) + ')   #' + txtLayer.index + '   ' + layerName);
				// add layer visibility icon...
				txtItem.image = txtLayer.enabled ? eyeOpenIcon : eyeClosedIcon;
				count += 1; // incremente tree items count...
			}
		}
		progBar.value += progInc; // increment current progress...
	}
	progBar.value = 100; // end progress...
	return { 'resultArray': resultArray, 'count': count };
}

// expands all 'tree view' nodes...
function expandNodes(nodeTree) {
	nodeTree.expanded = true;
	var branches = nodeTree.items;

	for (var i = 0; i < branches.length; i++) {
		if (branches[i].type == 'node') {
			expandNodes(branches[i]);
		}
	}
}
