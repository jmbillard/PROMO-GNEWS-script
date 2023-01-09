/*

---------------------------------------------------------------
> 🪟 UI dialogs
---------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061
//  jshint -W043

function progressDialog () {

  var progW = new Window('dialog', undefined, undefined, { borderless: true });
  progW.margins = 24;
  progW.spacing = 4;

  //---------------------------------------------------------

  var progLabelTxt = progW.add('statictext', undefined, '"ENTER" to proceed     -    "ESC" to cancel at any time...');
  progLabelTxt.size = [805, 24];
  
  var progPb = progW.add('progressbar', [0, 0, 805, 5], 0);
  
  var btnGrp = progW.add('group');
  var okBtn = btnGrp.add('button', [0, 0, 0, 0], '', { name: 'ok' });
  var cancelBtn = btnGrp.add('button', [0, 0, 0, 0], '', { name: 'cancel' });

  return progW;
}
