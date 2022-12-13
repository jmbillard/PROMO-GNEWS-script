/*

---------------------------------------------------------------
> 🪟 UI dialogs
---------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061
//  jshint -W043

function inputDialog(title, message, value, icon) {
  var wInput = new Window('dialog', title);

  //---------------------------------------------------------
  
  var messageTxt = wInput.add('statictext', undefined, message);
  var inputGrp = wInput.add('group');
  var inputIcon = wInput.add('image', undefined, icon);
  var inputEdTxt = inputGrp.add('edittext', [0, 0, 150, 38]);

  //---------------------------------------------------------

  inputEdTxt.onEnterKey = function () {

    wInput.close();
  };

  wInput.show();
}
