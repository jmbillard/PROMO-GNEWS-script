/*

---------------------------------------------------------------
> 🪟 UI dialogs
---------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061
//  jshint -W043
function findDialog() {
  var w = new Window('palette', 'find...');

  // =============
  var searchMainGrp = w.add('group');

  // ========
  var inputGrp = searchMainGrp.add('group');
  inputGrp.orientation = 'column';
  inputGrp.alignChildren = ['center', 'center'];

  var findEdTxt = inputGrp.add('edittext', [0, 0, 220, 30]);

  // ==========
  var optMainGrp = inputGrp.add('group');
  optMainGrp.spacing = 20;

  // =======
  var optGrp1 = optMainGrp.add('group');
  optGrp1.alignChildren = ['center', 'top'];
  optGrp1.spacing = 4;
  
  var optCkb1 = optGrp1.add('checkbox');
  optCkb1.value = false;
  //optCkb1.enabled = false;
  
  var optTxt1 = optGrp1.add('statictext', undefined, 'Tt');
  optCkb1.helpTip = optTxt1.helpTip = 'match case';

  // =======
  var optGrp2 = optMainGrp.add('group');
  optGrp2.alignChildren = ['center', 'top'];
  optGrp2.spacing = 4;

  var optCkb2 = optGrp2.add('checkbox');
  optCkb2.value = false;
  //optCkb2.enabled = false;
  
  var optTxt2 = optGrp2.add('statictext', undefined, 'àê');
  optCkb2.helpTip = optTxt2.helpTip = 'match accentuation';

  // =======
  var optGrp3 = optMainGrp.add('group');
  optGrp3.alignChildren = ['center', 'top'];
  optGrp3.spacing = 4;
  
  var optCkb3 = optGrp3.add('checkbox');
  optCkb3.value = false;
  optCkb3.enabled = false;
  
  var optTxt3 = optGrp3.add('statictext', undefined, 'RegEx');
  optCkb3.helpTip = optTxt3.helpTip = 'use regular expression';

  // =============
  var findBtn = searchMainGrp.add('iconbutton', [0, 0, 80, 60], findIcon, { style: 'toolbutton' });
  findBtn.helpTip = 'find';

  var divider = w.add('panel', undefined, undefined);
  divider.alignment = 'fill';

  // =========
  var resultGrp = w.add('group');
  resultGrp.orientation = 'column';

  var resultTxt = resultGrp.add('statictext', undefined, undefined);
  resultTxt.characters = 16;

  var findPb = resultGrp.add('progressbar', [0, 0, 315, 5], undefined);
  findPb.value = 100;

  // ==========
  var resultTree = w.add('treeview', [0, 0, 320, 0]);
  resultTree.visible = false;
  var resultArray = [];

  // find event...
  findBtn.onClick = function () {
    resultTxt.text = 'searching...';

    var sKey = findEdTxt.text;
    if (sKey == '' || app.project.numItems == 0) {
      resultTxt.text = '';
      resultTree.visible = false;
      resultTree.size.height = 0;
      w.layout.layout(true);
      return;
    }

    var optObj = {
      'sKey': sKey,
      'matchCase': optCkb1.value,
      'matchAccent': optCkb2.value
    };

    var selArray = app.project.selection;
    selArray = selArray.length > 0 ? selArray : getComps(); // → [selected items] : [all comps]

    resultArray = buildFindTree(resultTree, optObj, selArray, findPb); // → [filtered comps]
    
    if (resultArray.length == 0) {
      resultTxt.text = 'no matches  (っ °Д °;)っ';
      resultTree.visible = false;
      resultTree.size.height = 0;
      w.layout.layout(true);
      return;
    }
    expandNodes(resultTree);
    resultTree.visible = true;
    resultTree.size.height = 160;
    resultTxt.text = 'complete  ヽ(✿ﾟ▽ﾟ)ノ';
    w.layout.layout(true);
  };

  resultTree.onChange = function () {

    var comp;
    var t;

    if (resultTree.selection.type == 'node') {
      comp = resultArray[resultTree.selection.index];
      t = comp.time;
    }
    if (resultTree.selection.type == 'item') {
      comp = resultArray[resultTree.selection.parent.index];
      var i = resultTree.selection
        .toString()         // → '# 1   layer name'
        .split('   ')[0]    // → '# 1'
        .replace('# ', ''); // → '1'
      
      for (var l = 1; l <= comp.numLayers; l++) {
        var aLayer = comp.layer(l);

        if (l == parseInt(i)) {
          t = (aLayer.outPoint - aLayer.inPoint) / 2 + aLayer.inPoint;
          aLayer.shy = false;

        } else {
          aLayer.shy = true;
        }
      }
      comp.hideShyLayers = true;
    }
    comp.openInViewer();
    comp.time = t;
  };

  w.show();
}

//findDialog();