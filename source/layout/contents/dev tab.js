
/*

---------------------------------------------------------------
> ⚙️ dev tab
---------------------------------------------------------------

*/

currentGrp = tabsGrp.dev;

var devGrp1 = currentGrp.add('group');
var binTxt = devGrp1.add('statictext', undefined, 'bin:', { name: 'label' });

var binBtn = devGrp1.add('iconbutton', undefined, binIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
binBtn.helpTip = 'binary converter | layer source code';

//---------------------------------------------------------

currentGrp.add('image', undefined, vSpacer, { name: 'div' });

var devGrp2 = currentGrp.add('group');

var zipTxt1 = devGrp2.add('statictext', undefined, 'templates:', { name: 'label' });
zipTxt1.maximumSize.width = 56;

var zipTemplatesBtn = devGrp2.add('iconbutton', undefined, zipIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
zipTemplatesBtn.helpTip = 'zip the templates folder';

var zipTxt2 = devGrp2.add('statictext', undefined, 'fonts:', { name: 'label' });
zipTxt2.maximumSize.width = 30;

var zipFontsBtn = devGrp2.add('iconbutton', undefined, zipIcon[iconTheme], { name: 'btn', style: 'toolbutton' });
zipFontsBtn.helpTip = 'zip the fonts folder';


/*

---------------------------------------------------------------
> ⚙️ dev tab events
---------------------------------------------------------------

*/

binBtn.onClick = function () {
  bin();
};

//---------------------------------------------------------

zipTemplatesBtn.onClick = function () {
  // error...
  if (!netAccess()) {
    showTabErr(netConfigName + ' not checked');
    return;
  }
  var templatesPath = scriptPreferencesPath + '/templates';
  var templatesFolder = new Folder(templatesPath);
  // dev folder path '[user name]/PROMO-GNEWS-script'...
  var destPath = Folder.myDocuments.parent.toString() + '/PROMO-GNEWS-script';
  var devFolder = new Folder(destPath);

  if (templatesFolder.exists) {
    var templatesStr = templatesFolder.getFiles().toString();
    // replaces '[' at the start and ']' at the end...
    templatesStr = templatesStr.replace(/^\[|\]$/, '');
    templatesStr = templatesStr.replace(/\,/g, "', '");
    templatesStr = decodeURI(templatesStr);

    if (!devFolder.exists) {
      // alternative path 1 'desktop'...
      destPath = Folder.desktop.toString();
    }

    var zipPath = destPath + '/templates.zip';
    zipContent(templatesStr, zipPath);
    openFolder(destPath);
  }
};

//---------------------------------------------------------

zipFontsBtn.onClick = function () {
  // error...
  if (!netAccess()) {
    showTabErr(netConfigName + ' not checked');
    return;
  }
  var fontsPath = scriptPreferencesPath + '/fonts';
  var fontsFolder = new Folder(fontsPath);
  // dev folder path '[user name]/PROMO-GNEWS-script'...
  var destPath = Folder.myDocuments.parent.toString() + '/PROMO-GNEWS-script';
  var devFolder = new Folder(destPath);

  if (fontsFolder.exists) {
    var fontsStr = fontsFolder.getFiles().toString();
    // replaces '[' at the start and ']' at the end...
    fontsStr = fontsStr.replace(/^\[|\]$/, '');
    fontsStr = fontsStr.replace(/\,/g, "', '");
    fontsStr = decodeURI(fontsStr);

    if (!devFolder.exists) {
      // alternative path 1 'desktop'...
      destPath = Folder.desktop.toString();
    }

    var zipPath = destPath + '/fonts.zip';
    zipContent(fontsStr, zipPath);
    openFolder(destPath);
  }
};
