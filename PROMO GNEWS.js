/*

---------------------------- info ----------------------------

  title:   PROMO GNEWS utilities script

  notes:   a collection of tools designed to
  speedup the motion graphics team workflow

  copy all files and folders
  to 'ScriptUI Panels' folder

  author:  Jean-Marc Billard
  version: 1.9 beta 5
  date:    xx-xx-2022

--------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061

function PROMO_GNEWS_UTL(thisObj) {

  // current script version...
  var vStr = 'v 1.9 b5';

  /* jshint ignore:start */
  #include 'source/globals.js'; // global variables...
  #include 'source/layout/main ui ctrls.js'; // → UI definition file
  /* jshint ignore:end */

  // loads all preferences...
  loadStaticPrefs();
  loadDefaultPrefs();

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
