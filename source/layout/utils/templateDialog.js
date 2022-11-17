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
  var previewScale = 0.25; // preview image scale factor...
  var fileFilter = ['.aep', '.aet']; // template files extensions...

  var w = new Window('dialog', 'import options...');
  // main group...
  var mainGrp = w.add('group');
  // left vertical group...
  var vGrp1 = mainGrp.add('group');
  vGrp1.orientation = 'column';
  // preview vertical group...
  var vGrp2 = mainGrp.add('group');
  vGrp2.orientation = 'column';
  vGrp2.alignChildren = 'left';
  vGrp2.visible = false;
  var tree = vGrp1.add('treeview', [0, 0, 250, 340]);
  buildTree(templatesFolder, tree, fileFilter);

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

  // preview...
  var pathTxt = vGrp2.add('statictext', undefined, '...');
  pathTxt.characters = 40;
  setTxtColor(pathTxt, GNEWS_mainColors[6]);
  var previewImg = vGrp2.add('image', undefined, no_preview);
  previewImg.size = [1920 * previewScale, 1080 * previewScale];
  var updateTxt = vGrp2.add('statictext', undefined, '...');
  updateTxt.characters = 40;
  setTxtColor(updateTxt, GNEWS_secColors[10]);
  // preview info...
  var infoGrp = vGrp2.add('group');
  infoGrp.orientation = 'column';
  infoGrp.spacing = 3;
  var info1Txt = infoGrp.add('statictext', undefined, '...');
  info1Txt.characters = 40;
  setTxtColor(info1Txt, GNEWS_secColors[8]);
  var info2Txt = infoGrp.add('statictext', undefined, '...');
  info2Txt.characters = 40;
  setTxtColor(info2Txt, GNEWS_secColors[8]);

  tree.onChange = function () {
    // node folders should not be selectable...
    if (tree.selection != null && tree.selection.type == 'node') {
      tree.selection = null; // → clear selection
    }
    importBtn.enabled = tree.selection != null; // → enable | disable import button
    if (tree.selection == null) {
      // nothing selected...
      w.size.width = wWidth; // → resize window
      vGrp2.visible = false; // → hide preview
      return;
    }
    // template selected...
    var s = tree.selection; // → selected template
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
    var infoFile = new File(templatesPath + '/' + infoName); // → info file object

    var fWidth = wWidth;
    var infoContent = ['...', '...']; // info placeholder text...

    if (infoFile.exists) {
      infoFile.open('r'); // → open file
      infoFile.encoding = 'UTF-8'; // → file encoding
      infoContent = infoFile
        .read()
        .toString()
        .split(/[\n|\r]+/); // text content as array → ['line1', 'line2']
    }
    if (previewImgFile.exists) {
      previewImg.image = previewImgFile; // → set preview image file
    } else {
      previewImg.image = no_preview; // → set image 'no preview available'
    }
    vGrp2.visible = true; // → show preview
    w.size.width = oWidth; // → resize window
    pathTxt.text = 'templates/' + templateName; // → 'templates/.../template name'
    updateTxt.text = 'updated on: ' + templateFile.created.toString(); // → 'updated on: date and time'
    info1Txt.text = '>> ' + infoContent[0]; // → '>> info line 1'
    info2Txt.text = '>> ' + infoContent[1]; // → '>> info line 2'
  };

  w.onShow = function () {
    expandNodes(tree); // expand all tree folder nodes...
    oWidth = w.size.width; // window width with image preview...
    wWidth = oWidth - 490; // window width without image preview...
    vGrp2.visible = false; // → hide preview
    w.size.width = wWidth; // → resize window
  };

  importBtn.onClick = function () {
    var s = tree.selection; // → current selection
    var fileName = s.toString();

    // iterate selection parent + parent + parent... to form selected template file path...
    while (s.parent.toString() != templatesFolder.displayName) {
      s = s.parent; // current parent...
      fileName = s.toString() + '/' + fileName; // → current parent/.../template name
    }
    var templateFile = new File(templatesPath + '/' + fileName); // → template file object

    var IO = new ImportOptions(templateFile); // import options...
    app.project.importFile(IO); // → import template project
    w.close(); // → close window
  };

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
  
    if (GLOBO_ACCESS) {
      removeFolder(templatesFolder); // → delete previous templates folder
      templatesFolder.create(); // → delete previous templates folder

      alert('copy the templates to the empty folder\nand press the refresh button!');
      
      // wait 3 seconds...
      $.sleep(3000);
      openFolder(templatesLocalPath);
      openFolder(templatesPath);
    }
    buildTree(templatesFolder, tree, fileFilter); // → update tree...
    expandNodes(tree); // expand all tree folder nodes...
  };

  refreshBtn.onClick = function () {
    // alert...
    if (!netAccess()) {
      alert('no access...  Σ(っ °Д °;)っ');
      return;
    }
    buildTree(templatesFolder, tree, fileFilter); // → update tree
    expandNodes(tree); // expand all tree folder nodes...
  };

  openFldBtn.onClick = function () {
    // alert...
    if (!netAccess()) {
      alert('no access...  Σ(っ °Д °;)っ');
      return;
    }
    if (!templatesFolder.exists) {
      // template folder does not exist...
      templatesFolder.create(); // → create template folder
    }
    openFolder(templatesPath); // → open template folder
  };

  w.show();
}
