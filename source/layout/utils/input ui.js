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

function inputDialog(val, pos) {
	var keyName;
	var output = val;
	var wInput = new Window('dialog', undefined, undefined, { borderless: true });
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
		output = val;
		wInput.close();
		alert('escaping...');
	};

	wInput.show();

	return output;
}