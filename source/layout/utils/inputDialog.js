/*

---------------------------------------------------------------
> 🪟 UI dialogs
---------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061
//  jshint -W043

function inputDialog(title, icon, val, pos) {
  var wInput = new Window('dialog', title, undefined, {borderless: true});
  wInput.orientation = 'row';
  wInput.spacing = 4;
  wInput.margins = 4;

  //---------------------------------------------------------
  
  var inputIcon = wInput.add('image', undefined, icon);
  var inputValTxt = wInput.add('edittext');
  inputValTxt.size = [100, 24];
  inputValTxt.text = val.toString();

  wInput.location = pos;
  //---------------------------------------------------------

  wInput.onShow = function () {

    inputValTxt.active = true;
  };

  inputValTxt.onEnterKey = function () {

    wInput.close();
    return inputValTxt.text;
  };

  wInput.onclose = function () {

    return inputValTxt.text;
  };

  wInput.show();

  return inputValTxt.text;
}

//inputDialog('title', sliderIcon, 'val', [600, 800]);