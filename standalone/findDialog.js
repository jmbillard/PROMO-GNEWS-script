/*

---------------------------------------------------------------
> 🪟 UI dialogs
---------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061
//  jshint -W043

var findIcon = '\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x18\x00\x00\x00\x18\b\x06\x00\x00\x00\u00E0w=\u00F8\x00\x00\x00\tpHYs\x00\x00\x0B\x12\x00\x00\x0B\x12\x01\u00D2\u00DD~\u00FC\x00\x00\x018IDATH\u0089\u00B5V\u00CBM\x03A\f} \n\u00C8\u00C1\x05\u00D0\x01\u00DC\u00B8 \x04\x15d\u00D3\u00C1\u00D2\bJj\u00C8\x11\u00A4\u0084\nB\x07\u00E4\u0092;t\u00C0\u00DD\u00EF@\x07\u008B\x1Cy\u00C9\bf?3\u009A\u00B5\u00B4Z\u00AD\u00EDyol?K{\u00D64\r\u00A6\u00B4\u00F3I\u00D1\x01\\\u00E4\x1C\"Y\x01X\x02\u00B8\n\u00DC\u009F\u00E6\x13\u0091\u00B707\u00B9\x02\u0092\x06\u00BC\x03\u00F0\x05`\x01\u00E0\u00C1\u00DF\u00F6\u00BD\u00F3\u00F8\u00C9l\x06c\x1FU\u00ADT\u00B5Q\u00D5:v\u00C6\u00FC\x1E\u00AFZ_\u00D2\u0090I~\u00D8ME\u00A4\u00EA\u00C9\u00B1\x16]\u008A\u00C8uN\u008B\u00AC\u00E7\u00DB\u0081\u009Cm8\u009B\x1C\x15}\u00A7\u00C4s\bf)\u00F1T\x02\u0093b=\u0090S{^\x16\u0081IpN\u00F2)\x16$i\u00E0s\u00CF;Z\u00EA\u00A2\u00B5\u00E5\u00AFH\u00DE\x00x\u00F6\u009E\u00CF\u00FC\u00E6\x06\u00BE\n\u0097m\x14\x01\u00C9{\u0093\x1E\u0080\u008D\u00BB\u00D6\x00\u00EE|\u00E1Z\u00B3\u00B6,\u00FEn\u00F2 \u0081\u0097\u00BD\t\\\u008F\"2$\u00D5_\u00EB]\u00B4\b\u00F8ADn\u00C7\u0082\u00A3o\u00C8\x11p\u00B3\u0097\x14\u00F0N\u0082\x0E\u00F0\u00A4\u00D6t\x12\u0094\x04\u00FFGP\x1A\x1C\u00E1\u0090]\u008A\u00EF%\u00C1\x11V \"{\x00\u00AF%\u00C1\x11\u0093)I\x03\u00DD\u0097\x00\u008F\x12\u0094\u00B6i\u00FF*\x00\u00FC\x005\u00B1\u00BC\'\u00BAl\u00D3\u00FA\x00\x00\x00\x00IEND\u00AEB`\u0082';
var compTogIcon = '\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x10\x00\x00\x00\x10\b\x06\x00\x00\x00\x1F\u00F3\u00FFa\x00\x00\x00\tpHYs\x00\x00\x0B\x12\x00\x00\x0B\x12\x01\u00D2\u00DD~\u00FC\x00\x00\x00AIDAT8\u008Dc\u00FC\u00FF\u00FF?\x03%\u0080\u0089\"\u00DD\u00D40\u0080\x05\u00C6x\u00F3\u00E6\u00CDLR4\u008A\u0088\u0088\u00A4c\u00B8\x00$\b\u0093\u00C0\u00A5\t]\u009Ez^` \u00C2\x1B\u00D8\u00E4G\u00BD0\x18\u00BC0\u00D43\x13\x03\x03\x03\x00\u0094\u00E5%\u00F3\'ku\u008F\x00\x00\x00\x00IEND\u00AEB`\u0082';
var eyeOpenLabelIcon = '\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x10\x00\x00\x00\n\b\x06\x00\x00\x00\u00BD\u00BE\u00DE\u009C\x00\x00\x00\tpHYs\x00\x00\x0B\x12\x00\x00\x0B\x12\x01\u00D2\u00DD~\u00FC\x00\x00\x00\u00B7IDAT(\u0091\u00A5\u0091\u00B1\r\u00C2P\fD\x1F\u0088\x1E6\u0080\r`\x04F`\x04F\u00A0\u00B9:\u00A1\u00FEMF\u0080\r\x18!#\u00C0\x06a\x032A\u00D0IN\x14%\u00A1@qe\u00D9w\u00B6\u00EF\u00BCh\u009A\u00869\u00B1\u009C\u00C5\x06VS\u00C5\u0094\u00D2\x068\x02\u0087(=\u0081R\u00D2g\u0088\x1DIH)\u00E5\u00C0\x05X\x0F\u00B05PH\u00CA\'\x07\u00C4\u00D6\x12\u00D8G\u00EF\r\u00DC\"?\x03\u00DB\u00C8_\u00C0IR\u00D5\r\br\x15[\u00EB \u00F8\u00FC,H\u00D7\u00E8\x17=\u00CC\u00CE\u0092Z\x13\u00DB\u0086\u00A7\x1F$=zdG&\u00C9\u00D7\u00D8\x17\u0093\u008D5\u00A7\u00FB\u00825\u00DF\u00FB\u00A7M\u0085$\u009B\u00E9!\u00C6\u009A36q`f\'ah\u00DE\u00CF/\u00FC\x15\u00C0\x17\u00D9hD\u009B\u0090\u00DCT\u00B8\x00\x00\x00\x00IEND\u00AEB`\u0082';
var eyeClosedIcon = '\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x10\x00\x00\x00\n\b\x06\x00\x00\x00\u00BD\u00BE\u00DE\u009C\x00\x00\x00\tpHYs\x00\x00\x0B\x12\x00\x00\x0B\x12\x01\u00D2\u00DD~\u00FC\x00\x00\x00cIDAT(\u0091c\u00FC\u00FF\u00FF?\x03%\u0080\u0089\"\u00DD\u00A3\x06\u0080\x01\x0B2\u00A7\u00BB\u00BB\u00BB\u0080\u0081\u0081A\u0080\u0081\u0081\u00E1\x00\x16\u00B5 q\x03\x06\x06\u0086\x0F\u00A5\u00A5\u00A5\x13\u00B0\x1A\x00\u00D5\b\u00C2\u00F58,\u00BC\u00C8\u00C0\u00C0\u00E0\u0080,\u0080\u0091\x0E\u00BA\u00BB\u00BB\x15\x18\x18\x18@.\x01)\u00D4\u0087\n\x1F\u0084\x1A<\u00A1\u00B4\u00B4\u00F4\x03^\x03H\x02\f\f\f\x00\u00ADY\x19\x1DE\u00A0T\x04\x00\x00\x00\x00IEND\u00AEB`\u0082';
var eyeOpenIcon = '\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x10\x00\x00\x00\n\b\x06\x00\x00\x00\u00BD\u00BE\u00DE\u009C\x00\x00\x00\tpHYs\x00\x00\x0B\x12\x00\x00\x0B\x12\x01\u00D2\u00DD~\u00FC\x00\x00\x00\u0098IDAT(\u0091\u00AD\u0092\u00D1\r\u00C20\x10C\x1F\u00A8\u009FHt\u0084\u008E\u00D0\x11\x18\x05&\u00E0\u00CBS\u00DC\x0F#\u0094\r\x18\u0081\x11`\x03F(\x13\x04\u009DtA(i\u00BF\u00C2\u00FD\u009De\u00FBb+\u009B\u0094\x12-\u00B3mR\u00FF\u00C3\u00A0[\x02\u00CD\u00AC\x07\u008E@\x1F\u00D0K\u00D2\u00B4\u00C4\u00AD:0\u00B3\x03p\x03\u00F6\x05\u00F7\u00E9\u00A6\u0092\x1E\u00AB\x06f6\x02\u00F7\x1F\u00F1\x1C\u00AF\u00DC\u00C5\u00FE\x06\x06Is\u00D6\u0094\x1D\\Bt\u008A\u00DD#dq\u00C6\u009C\u00F3\u009D\u00D2`\u0092\u00E4\x17\u00AA\u00BC\u0081\r\u00C0z\u0084\u00A2\x0B\u00BFt\u008E\u00F5*\u00C9K\u00AD\u00A6\u00ED#\x01\x1F\u00AA\n/\u00FE\u00B4\x18\x16\u0089\x00\x00\x00\x00IEND\u00AEB`\u0082';

// simple timer...
function timer() {
	return ($.hiresTimer / 1000000).toFixed(2); // → 1.27 (in seconds)
}

function limitNameSize(name, limit) {
  var limit1 = limit / 2 - 5;
  var limit2 = name.length - limit / 2;

  var name1 = name.substring(0, limit1);
  var name2 = name.substring(limit2, name.length);

  name = name.length < limit ? name : name1 + '...' + name2;

  return name;
}

// replaces most of the special characters...
String.prototype.replaceSpecialCharacters = function () {

  return this.replace(/À|Á|Â|Ã|Ä|\u00C0|\u00C1|\u00C2|\u00C3|\u00C4/g, 'A')
    .replace(/à|á|â|ã|ä|\u00E0|\u00E1|\u00E2|\u00E3|\u00E4/g, 'a')
    .replace(/È|É|Ê|Ë|\u00C8|\u00C9|\u00CA|\u00CB/g, 'E')
    .replace(/è|é|ê|ë|\u00E8|\u00E9|\u00EA|\u00EB/g, 'e')
    .replace(/Ì|Í|Î|Ï|\u00CC|\u00CD|\u00CE|\u00CF/g, 'I')
    .replace(/ì|í|î|ï|\u00EC|\u00ED|\u00EE|\u00EF/g, 'i')
    .replace(/Ò|Ó|Ô|Õ|Ö|\u00D2|\u00D3|\u00D4|\u00D5|\u00D6/g, 'O')
    .replace(/ò|ó|ô|õ|ö|\u00F2|\u00F3|\u00F4|\u00F5|\u00F6/g, 'o')
    .replace(/Ù|Ú|Û|Ü|\u00D9|\u00DA|\u00DB|\u00DC/g, 'U')
    .replace(/ù|ú|û|ü|\u00F9|\u00FA|\u00FB|\u00FC/g, 'u')
    .replace(/Ç|\u00C7/g, 'C')
    .replace(/ç|\u00E7/g, 'c')
    .replace(/\n|\r/g, ' ') // replaces line breaks...
    .replace(/\_|-|\|/g, ' ')
    .replace(/\s{2,}/g, ' ') // replaces 2 or more spaces...
    .replace(/[^\w\s\—]/ig, '') // replaces any non-word character except space...
    .trim();
};

// indexOf() definition...
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (element, startPoint) {

    var k;
    var O = Object(this);
    var aSize = O.length >>> 0;

    if (aSize === 0) return -1;
    var n = + startPoint || 0;

    if (Math.abs(n) === Infinity) n = 0;
    if (n >= aSize)  return -1;

    k = Math.max(n >= 0 ? n : aSize - Math.abs(n), 0);

    while (k < aSize) {
      if (k in O && O[k] === element) return k;
      k++;
    }
    return -1;
  };
}

// returns text layer content...
function textContent(aLayer) {
	if (aLayer == null) return '';

	if (!(aLayer instanceof TextLayer)) return '';

	return aLayer
		.property('ADBE Text Properties')
		.property('ADBE Text Document')
		.value.toString();
}

// trim...
if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/gm, '');
  };
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

  var progInc = 100 / compArray.length; // serch progress increment step...

  for (i = 0; i < compArray.length; i++) {
    if (!(compArray[i] instanceof CompItem)) continue; // is not comp...

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
          txtArray.push(doc.keyValue(k).toString().trim());
        }
      } else {
        // source text property has expression...
        // move comp playhead to 1 second before the current text layer out point...
        if (doc.expression != '') compArray[i].time = txtLayer.outPoint - 1;
        // includes source text with expressions...
        txtArray.push(textContent(txtLayer).trim());
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

        if (resultArray.indexOf(compArray[i]) < 0) { // check for duplicate entrys...
          // character length limited comp name...
          var compName = limitNameSize(compArray[i].name, 45);
           // add comp tree item... -> comp_comp...name
          compItem = tree.add('node', compName);
          compItem.image = compTogIcon; // add com icon...
          count += 1; // incremente tree items count...

          resultArray.push(compArray[i]); // push current comp to resltArray...
        }
        var layerName = limitNameSize(txtLayer.name, 35);
        // add text layer tree item... -> (1)  # 5  txt_layer...name
        var txtItem = compItem.add('item', '(' + (f + 1) + ')   #' + txtLayer.index + '   ' + layerName);
        // add layer visibility icon...
        txtItem.image = txtLayer.enabled ? eyeOpenIcon : eyeClosedIcon;
        count += 1; // increment tree items count...
      }
    }
    progBar.value += progInc; // increment current progress...
  }
  progBar.value = 100; // end progress...
  return {'resultArray': resultArray, 'count': count}; 
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

function getComps() {

  var compArray = [];

  for (var i = 1; i <= app.project.numItems; i++) {
    var comp = app.project.item(i);

    if (!(comp instanceof CompItem)) continue; // is not comp...
    // item is comp...
    compArray.push(comp);
  }
  return compArray;
}


function findDialog() {
  var w = new Window('palette', 'busca...');
  w.spacing = 5;
  w.margins = 0;

  // =============
  var searchMainGrp = w.add('group');
  searchMainGrp.orientation = 'column';
  searchMainGrp.alignChildren = ['center', 'top'];

  // ========
  var inputGrp = searchMainGrp.add('group');
  inputGrp.spacing = 0;
  inputGrp.margins = 8;

  var findEdTxt = inputGrp.add('edittext', [0, 0, 260, 38]);

  var findBtn = inputGrp.add('iconbutton', undefined, findIcon, { style: 'toolbutton' });
  findBtn.helpTip = 'buscar';

  // ==========
  var optMainGrp = searchMainGrp.add('group');
  optMainGrp.spacing = 20;

  // =======
  var optGrp5 = optMainGrp.add('group');
  optGrp5.alignChildren = ['center', 'top'];
  optGrp5.spacing = 4;

  var optCkb5 = optGrp5.add('checkbox');
  optCkb5.value = true;

  var optIco5 = optGrp5.add('image', undefined, eyeOpenLabelIcon);
  optCkb5.helpTip = optIco5.helpTip = 'incluir apenas layers visíveis';

  // =======
  var optGrp1 = optMainGrp.add('group');
  optGrp1.alignChildren = ['center', 'top'];
  optGrp1.spacing = 4;

  var optCkb1 = optGrp1.add('checkbox');
  optCkb1.value = false;

  var optTxt1 = optGrp1.add('statictext', undefined, 'Tt');
  optCkb1.helpTip = optTxt1.helpTip = 'respeitar maiúsculas e minusculas';

  // =======
  var optGrp2 = optMainGrp.add('group');
  optGrp2.alignChildren = ['center', 'top'];
  optGrp2.spacing = 4;

  var optCkb2 = optGrp2.add('checkbox');
  optCkb2.value = false;

  var optTxt2 = optGrp2.add('statictext', undefined, 'àê');
  optCkb2.helpTip = optTxt2.helpTip = 'respeitar acentuação';

  // =======
  var optGrp4 = optMainGrp.add('group');
  optGrp4.alignChildren = ['center', 'top'];
  optGrp4.spacing = 4;

  var optCkb4 = optGrp4.add('checkbox');
  optCkb4.value = false;

  var optTxt4 = optGrp4.add('statictext', undefined, '!=');
  optCkb4.helpTip = optTxt4.helpTip = 'os resultados NÃO incluirão o termo buscado';

  // =======
  var optGrp3 = optMainGrp.add('group');
  optGrp3.alignChildren = ['center', 'top'];
  optGrp3.spacing = 4;

  var optCkb3 = optGrp3.add('checkbox');
  optCkb3.value = false;

  var optTxt3 = optGrp3.add('statictext', undefined, 'RegExp');
  optCkb3.helpTip = optTxt3.helpTip = 'usar regular expression';

  // =========
  var resultGrp = w.add('group');

  var findPb = w.add('progressbar', [0, 0, 305, 5], undefined);
  findPb.value = 100;

  // ==========
  var resultTree = w.add('treeview', [0, 0, 320, 0]);
  resultTree.visible = false;
  var resultArray = [];

  findEdTxt.onEnterKey = findBtn.onClick = function () {
    // starting timer...
    timer();
    w.text = 'procurando...';
    resultTree.visible = false;
    resultTree.size.height = 0;
    w.layout.layout(true);

    var sKey = findEdTxt.text;
    if (sKey == '' || app.project.numItems == 0) {
      w.text = 'busca...';
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

    var selArray = app.project.selection;
    selArray = selArray.length > 0 ? selArray : getComps(); // → [selected items] : [all comps]
    findTree = buildFindTree(resultTree, optObj, selArray, findPb); // → {'resultArray': resultArray, 'count': count};
    resultArray = findTree.resultArray; // → [filtered comps]
    count = findTree.count; // → items count

    if (resultArray.length == 0) {
      w.text = 'nenhum resultado - ' + timer() + 's  (っ °Д °;)っ';
      return;
    }
    expandNodes(resultTree);
    resultTree.visible = true;
    resultTree.size.height = count >= 16 ? 320 : (count * 21) + 5;
    w.text = 'busca completa - ' + timer() + 's  (o °▽ °)o☆';
    w.layout.layout(true);
  };

  optCkb3.onClick = function () {
    optCkb1.enabled = optCkb2.enabled = !optCkb3.value;
  };

  // [ ] comment - resultTree
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
        .replace(/[\(|\)]/g, ''); // → '1'
      var i = lArray[1] // → '# 3'
        .replace('#', ''); // → '3'

      for (var l = 1; l <= comp.numLayers; l++) {
        var aLayer = comp.layer(l);

        if (l == parseInt(i)) {
          var doc = aLayer.property('ADBE Text Properties').property('ADBE Text Document');

          t = (aLayer.outPoint - aLayer.inPoint) / 2 + aLayer.inPoint;
          aLayer.shy = false;
          aLayer.selected = true;

          if (doc.numKeys > 0) {
            t = doc.keyTime(parseInt(k));
          }
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

findDialog();
