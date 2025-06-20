/* eslint-disable no-prototype-builtins */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
/*

---------------------------- info ----------------------------

  title:   PROMO GNEWS utilities script

  notes:   a collection of tools designed to
  speedup the motion graphics team workflow

  copy the .jsxbin file ('release' folder)
  to 'ScriptUI Panels' folder

  author:  Jean-Marc Billard
  version: 2.4
  date:    xx-xx-2025

--------------------------------------------------------------

*/

function PROMO_GNEWS_UTL(thisObj) {

	// current script version...
	var vStr = 'v2.4';

	/* jshint ignore:start */
	#include 'source/globals.js'; // global variables...
	#include 'source/layout/main ui.js'; // → UI definition file
	/* jshint ignore:end */

	// writes on the 'info' window panel...
	clearOutput();
	write(aboutStr);

	var PROMO_GNEWS_WINDOW = PROMO_GNEWS_UI(thisObj);

	// checks network access...
	if (!netAccess()) {
		// no network access...
		alert('please check the ' + netConfigName + ' preference');

		// opens AE preferences...
		app.executeCommand(3131); // → scripting preferences

		if (!netAccess()) {
			// no network access...
			alert('no network...  Σ(っ °Д °;)っ\nlimited functionality mode');
		}
	}
	// checks if the ui is running as floating window or as a panel...
	if (PROMO_GNEWS_WINDOW.toString() != '[object Panel]') {
		PROMO_GNEWS_WINDOW.show(); // → show UI
	}
	return PROMO_GNEWS_WINDOW;
}

// finally runs everything... ヽ(✿ﾟ▽ﾟ)ノ
PROMO_GNEWS_UTL(this);
