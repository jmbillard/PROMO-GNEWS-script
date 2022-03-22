/*

---------------------------- info ----------------------------

  title:   PROMO GNEWS utilities script

  notes:   a collection of tools designed to
  speedup the motion graphics team workflow

  copy all files and folders
  to 'ScriptUI Panels' folder

  author:  Jean-Marc Billard
  version: 1.6
  date:    xx-xx-2022

--------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061

// load the XMP library...
if ( ExternalObject.AdobeXMPScript == undefined ) {
    ExternalObject.AdobeXMPScript = new ExternalObject( "lib:AdobeXMPScript");
}
/* jshint ignore:start */
#include 'JSON lib.jsxinc';
/* jshint ignore:end */

function PROMO_GNEWS_UTL(thisObj) {

  var vStr = 'v 1.6';
  var prefSection = 'Main Pref Section';
  var prefName = 'Pref_SCRIPTING_FILE_NETWORK_SECURITY';
  var netConfigName = '"Allow Scripts to Write Files and Access Network"';
  var scriptPreferencesPath = Folder.userData.toString() + '/PROMO GNEWS script';

  /* jshint ignore:start */
 
  // ui definition file...
  #include 'PROMO GNEWS ui.jsxinc';
 
  /* jshint ignore:end */

  /*

  ---------------------------------------------------------------
   > show ui
  ---------------------------------------------------------------

  */

  var PROMO_GNEWS_WINDOW = PROMO_GNEWS_UI(thisObj);

  // checks network access...
  if (!app.preferences.getPrefAsLong(prefSection, prefName)) {
    alert('please check the ' + netConfigName + ' preference');
  
    // opens the scripting preferences...
    app.executeCommand(3131);

    // alert...
    if (!app.preferences.getPrefAsLong(prefSection, prefName)) {
      alert('no network...  Σ(っ °Д °;)っ');
    }
  }
  // checks if the ui is running as floating window or as a panel...
  if (PROMO_GNEWS_WINDOW.toString() != '[object Panel]') {
    PROMO_GNEWS_WINDOW.show();
  }
  return PROMO_GNEWS_WINDOW;
}
PROMO_GNEWS_UTL(this);
