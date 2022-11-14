/*

---------------------------- info ----------------------------

  title:   PROMO GNEWS utilities script

  notes:   a collection of tools designed to
  speedup the motion graphics team workflow

  copy all files and folders
  to 'ScriptUI Panels' folder

  author:  Jean-Marc Billard
  version: 1.9 beta 4
  date:    xx-xx-2022

--------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061

// load the XMP library...
if ( ExternalObject.AdobeXMPScript == undefined ) {
    ExternalObject.AdobeXMPScript = new ExternalObject( 'lib:AdobeXMPScript');
}
/* jshint ignore:start */
#include 'source/PROMO GNEWS globals.jsxinc'; // global variables...
/* jshint ignore:end */

function PROMO_GNEWS_UTL(thisObj) {
  // app script network access preferences...
  var prefSection = 'Main Pref Section';
  var prefName = 'Pref_SCRIPTING_FILE_NETWORK_SECURITY';
  var netConfigName = '"Allow Scripts to Write Files and Access Network"';

  /* jshint ignore:start */
  #include 'source/ui/PROMO GNEWS main ui.jsxinc'; // → UI definition file
  /* jshint ignore:end */

  // gets the current value for the network permission preference...
  function netAccess() {
    return app.preferences.getPrefAsLong(prefSection, prefName);
  }

  /*

  ---------------------------------------------------------------
   > run...
  ---------------------------------------------------------------

  */

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
