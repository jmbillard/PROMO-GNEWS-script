/*

---------------------------------------------------------------
> 🪟 UI dialogs
---------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061
//  jshint -W043

function inputDialog(label, pos) {
  var keyName;
  var output = label.text;
  var wInput = new Window('dialog', '...', undefined, { borderless: true });
  wInput.margins = 4;
  wInput.spacing = 4;
  wInput.location = pos;

  //---------------------------------------------------------

  var inputValTxt = wInput.add('edittext');
  inputValTxt.size = [40, 24];
  inputValTxt.text = output;

  var cBtn = wInput.add('button', [0, 0, 0, 0], 'c', { name: 'cancel' });

  //---------------------------------------------------------

  wInput.onShow = function () {
    this.size.height = this.size.height - 4;
    inputValTxt.active = true;
  };

  inputValTxt.onChanging = function () {
    output = this.text;
  };

  wInput.onEnterKey = inputValTxt.onEnterKey = function () {
    wInput.close();
  };

  cBtn.onClick = function () {
    output = label.text;
    wInput.close();
    alert('escaping...');
  };

  wInput.addEventListener('click', function (c) {

    alert(c.clientX);
  });

  wInput.show();

  return output;
}

//inputDialog('title', sliderIcon, 'val', [600, 800]);