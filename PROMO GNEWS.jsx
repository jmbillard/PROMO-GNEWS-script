/*

---------------------------- info ----------------------------

  title:   GNEWS utilities script

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

  var vStr = 'v 1.61';
  var prefSection = 'Main Pref Section';
  var prefName = 'Pref_SCRIPTING_FILE_NETWORK_SECURITY';
  var configName = '\"Allow Scripts to Write Files and Access Network\"';
  var scriptPreferencesPath = Folder.userData.toString() + '/PROMO GNEWS script';

  /* jshint ignore:start */
  #include 'PROMO GNEWS ui.jsxinc';
  /* jshint ignore:end */

  /*

  ---------------------------------------------------------------
   > show ui
  ---------------------------------------------------------------

  */

  var PROMO_GNEWS_WINDOW = PROMO_GNEWS_UI(thisObj);

  if (!app.preferences.getPrefAsLong(prefSection, prefName)) {
    alert('please check the ' + configName + ' preference');
    app.executeCommand(3131);

    if (app.preferences.getPrefAsLong(prefSection, prefName)) {

      if (PROMO_GNEWS_WINDOW.toString() != '[object Panel]') {
        PROMO_GNEWS_WINDOW.show();
      }

      return PROMO_GNEWS_WINDOW;

    } else {

      try {
        if (PROMO_GNEWS_WINDOW.toString() != '[object Panel]') {
          PROMO_GNEWS_WINDOW.show();
        }
 
        alert('no network... Σ(っ °Д °;)っ');
        
        return PROMO_GNEWS_WINDOW;

      } catch (error) {

        alert('PROMO GNEWS script can\'t run');
      }
    }
  } else {
    if (PROMO_GNEWS_WINDOW.toString() != '[object Panel]') {
       PROMO_GNEWS_WINDOW.show();
    }

    return PROMO_GNEWS_WINDOW;
  }
}
PROMO_GNEWS_UTL(this);
