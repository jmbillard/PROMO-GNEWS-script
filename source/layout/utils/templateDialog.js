
/*

---------------------------------------------------------------
> 🪟 UI dialogs
---------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061
//  jshint -W043

// import templates UI...
function templateDialog() {
  var wWidth; // window width without image preview...
  var oWidth; // window width with image preview...
  var previewScale = 0.3; // preview image scale factor...
  var fileFilter = ['.aep', '.aet']; // template files extensions...

  //---------------------------------------------------------

  var wTemplates = new Window('dialog', 'import options...');
  // main group...
  var mainGrp = wTemplates.add('group');
  // left vertical group...
  var vGrp1 = mainGrp.add('group');
  vGrp1.orientation = 'column';
  vGrp1.alignment = ['center', 'top'];

  //---------------------------------------------------------

	var divider = mainGrp.add('panel');
	divider.alignment = 'fill';
  // preview vertical group...
  var vGrp2 = mainGrp.add('group');
  vGrp2.orientation = 'column';
  vGrp2.alignment = ['center', 'top'];
  vGrp2.alignChildren = 'left';
  vGrp2.visible = false;
  var templateTree = vGrp1.add('treeview', [0, 0, 250, 340]);
  buildTree(templatesFolder, templateTree, fileFilter);

  //---------------------------------------------------------

  // buttons group...
  var bGrp = vGrp1.add('group');
  bGrp.orientation = 'stack';
  bGrp.alignment = 'fill';
  // left buttons group...
  var bGrp1 = bGrp.add('group');
  bGrp1.alignment = 'left';
  bGrp1.spacing = 2;
  // right buttons group...
  var bGrp2 = bGrp.add('group');
  bGrp2.alignment = 'right';
  // left buttons...
  var downloadBtn = bGrp1.add('iconbutton', undefined, downloadIcon, { style: 'toolbutton' });
  downloadBtn.helpTip = 'downloads the latest templates';
  var refreshBtn = bGrp1.add('iconbutton', undefined, refreshIcon, { style: 'toolbutton' });
  refreshBtn.helpTip = 'refresh list content';
  var openFldBtn = bGrp1.add('iconbutton', undefined, folderIcon, { style: 'toolbutton' });
  openFldBtn.helpTip = 'open template folder';
  // right buttons...
  var importBtn = bGrp2.add('button', undefined, 'import');
  importBtn.helpTip = 'import selected template';
  importBtn.enabled = false;

  //---------------------------------------------------------

  // preview...
  var pathTxt = vGrp2.add('statictext', undefined, '...');
  pathTxt.characters = 60;
  setTxtColor(pathTxt, GNEWS_mainColors2[3]);
  var previewImg = vGrp2.add('image', undefined, no_preview);
  previewImg.size = [1920 * previewScale, 1080 * previewScale];
  var updateTxt = vGrp2.add('statictext', undefined, '...');
  updateTxt.characters = 40;
  setTxtColor(updateTxt, GNEWS_secColors[10]);

  //---------------------------------------------------------

  wTemplates.onShow = function () {
    expandNodes(templateTree); // expand all tree folder nodes...
    oWidth = wTemplates.size.width; // window width with image preview...
    wWidth = oWidth - 600; // window width without image preview...
    vGrp2.visible = false; // → hide preview
    divider.visible = false; // → hide preview
    wTemplates.size.width = wWidth; // → resize window
  };

  //---------------------------------------------------------

  templateTree.onChange = function () {
    // node folders should not be selectable...
    if (templateTree.selection != null && templateTree.selection.type == 'node') {
      templateTree.selection = null; // → clear selection
    }
    importBtn.enabled = templateTree.selection != null; // → enable | disable import button
    if (templateTree.selection == null) {
      // nothing selected...
      wTemplates.size.width = wWidth; // → resize window
      vGrp2.visible = false; // → hide preview
      divider.visible = false; // → hide preview
      return;
    }
    // template selected...
    var s = templateTree.selection; // → selected template
    var templateName = s.toString();

    // iterate selection parent + parent + parent... to form selected template file path...
    while (s.parent.toString() != templatesFolder.displayName) {
      s = s.parent; // current parent...
      templateName = s.toString() + '/' + templateName; // → 'current parent/.../template name'
    }
    var imgName = templateName.replace(/\.[\w]+$/i, ' preview.png'); // → template preview.png
    var infoName = templateName.replace(/\.[\w]+$/i, ' info.txt'); // → template info.png

    var templateFile = new File(templatesPath + '/' + templateName); // → template file object
    var previewImgFile = new File(templatesPath + '/' + imgName); // → preview image object
    // var infoFile = new File(templatesPath + '/' + infoName); // → info file object

    if (previewImgFile.exists) {
      previewImg.image = previewImgFile; // → set preview image file
    } else {
      previewImg.image = no_preview; // → set image 'no preview available'
    }
    vGrp2.visible = true; // → show preview
    divider.visible = true; // → show preview
    wTemplates.size.width = oWidth; // → resize window
    pathTxt.text = limitNameSize(decodeURI(templateFile.fullName), 90); // → 'templates/.../template name'
    updateTxt.text = 'updated on: ' + templateFile.created.toString(); // → 'updated on: date and time'
  };

  //---------------------------------------------------------

  importBtn.onClick = templateTree.onDoubleClick = function () {
    var s = templateTree.selection; // → current selection
    var fileName = s.toString();
    
    // iterate selection parent + parent + parent... to form selected template file path...
    while (s.parent.toString() != templatesFolder.displayName) {
      s = s.parent; // current parent...
      fileName = s.toString() + '/' + fileName; // → current parent/.../template name
    }
    var templateFile = new File(templatesPath + '/' + fileName); // → template file object
    
    var IO = new ImportOptions(templateFile); // import options...
    app.project.importFile(IO); // → import template project
    wTemplates.close(); // → close window
  };

  //---------------------------------------------------------

  downloadBtn.onClick = function () {
    //alert...
    if (!netAccess()) {
      alert('no network...  Σ(っ °Д °;)っ');
      return;
    }
    var url = repoURL + '/raw/main/downloads/templates.zip';
    var zipPath = downPath + '/templates.zip'; // → ~AppData\Roaming\PROMO GNEWS script\temp\templates.zip
    var templatesLocalFolder = new Folder(templatesLocalPath);
    
    removeFolder(templatesLocalFolder); // → delete previous templates folder
    templatesLocalFolder.create(); // → delete previous templates folder
    
    if (!downFolder.exists) {
      // downloads folder does not exist...
      downFolder.create(); // → create temp folder
    }
    getURLContent([url], [downPath]); // → download content

    unzipContent(zipPath, templatesLocalPath); // → unzip file    
    removeFolder(downFolder); // → delete temp folder
    
    // HO preference...
    if (!homeOffice) {
      removeFolder(templatesFolder); // → delete previous templates folder
      templatesFolder.create(); // → delete previous templates folder
      copyFolder(templatesLocalPath, templatesPath);
    }
    buildTree(templatesFolder, templateTree, fileFilter); // → update tree...
    expandNodes(templateTree); // expand all tree folder nodes...
  };

  //---------------------------------------------------------

  refreshBtn.onClick = function () {
    // alert...
    if (!netAccess()) {
      alert('no access...  Σ(っ °Д °;)っ');
      return;
    }
    buildTree(templatesFolder, templateTree, fileFilter); // → update tree
    expandNodes(templateTree); // expand all tree folder nodes...
  };

  //---------------------------------------------------------

  openFldBtn.onClick = function () {
    // alert...
    if (!netAccess()) {
      alert('no access...  Σ(っ °Д °;)っ');
      return;
    }
    if (!templatesFolder.exists) templatesFolder.create(); // → create template folder
    
    openFolder(templatesPath); // → open template folder
  };
  //*/  
  
  wTemplates.show();
}

// templateDialog();