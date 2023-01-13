/*

---------------------------------------------------------------
> 🪟 UI dialogs
---------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061
//  jshint -W043


// organization tags UI...
function tagDialog() {

  // → [tag, icon]
  // comments just for comp itens...
  var compCommentTags = [
    ['export', 'ftgTogIcon'],
    ['edit', 'compTogIcon'],
    ['ignore', 'solTogIcon']
  ];
  // comments for footage itens or template names for comp itens...
  var multiTags = [
    ['bg', 'imgTogIcon'],
    ['photo', 'imgTogIcon'],
    ['ref', 'imgTogIcon'],
    ['logo', 'shpTogIcon'],
    ['icon', 'shpTogIcon'],
    ['texture', 'matteTogIcon'],
    ['pattern', 'matteTogIcon'],
    ['tile', 'matteTogIcon'],
    ['lettering', 'txtTogIcon'],
    ['music', 'sonoTogIcon'],
    ['loc', 'sonoTogIcon']
  ];
  // template names for comp itens...
  var compTemplateTags = [
    ['end page', 'compTogIcon'],
    ['opening', 'compTogIcon']
  ];

  // Ui definition...
  // window...
  var tagWindow = 'var w = new Window(\'palette\', \'org. tags...\');\
var mainGrp = w.add(\'group\');\
mainGrp.orientation = \'column\';\
mainGrp.spacing = 2;\
mainGrp.alignChildren = \'left\';\n\n';

  // comp comment buttons...
  for (var c = 0; c < compCommentTags.length; c++) {
    tagWindow += 'var compComTagGrp' + c + ' = mainGrp.add(\'group\');\
var compComTagBtn'+ c + ' = compComTagGrp' + c + '.add(\'iconbutton\', iconTogSize, ' + compCommentTags[c][1] + '.light, {style: \'toolbutton\'});\
compComTagBtn'+ c + '.helpTip = \'' + compCommentTags[c][0] + ' comp comment tag\';\
var compComTag'+ c + 'Txt = compComTagGrp' + c + '.add(\'statictext\', undefined, \'' + compCommentTags[c][0] + '\');\
setTxtColor(compComTag'+ c + 'Txt, GNEWS_secColors[10]);\n\n';
  }
  // template buttons...
  for (var b = 0; b < multiTags.length; b++) {
    tagWindow += 'var multiTagGrp' + b + ' = mainGrp.add(\'group\');\
var multiTagBtn'+ b + ' = multiTagGrp' + b + '.add(\'iconbutton\', iconTogSize, ' + multiTags[b][1] + '.light, {style: \'toolbutton\'});\
multiTagBtn'+ b + '.helpTip = \'' + multiTags[b][0] + ' tag\';\
var multiTag'+ b + 'Txt = multiTagGrp' + b + '.add(\'statictext\', undefined, \'' + multiTags[b][0] + '\');\
setTxtColor(multiTag'+ b + 'Txt, GNEWS_secColors[9]);\n\n';
  }
  // template buttons...
  for (var p = 0; p < compTemplateTags.length; p++) {
    tagWindow += 'var temTagGrp' + p + ' = mainGrp.add(\'group\');\
var temTagBtn'+ p + ' = temTagGrp' + p + '.add(\'iconbutton\', iconTogSize, ' + compTemplateTags[p][1] + '.light, {style: \'toolbutton\'});\
temTagBtn'+ p + '.helpTip = \'' + compTemplateTags[p][0] + ' template tag\';\
var temTag'+ p + 'Txt = temTagGrp' + p + '.add(\'statictext\', undefined, \'' + compTemplateTags[p][0] + '\');\
setTxtColor(temTag'+ p + 'Txt, GNEWS_secColors[8]);\n\n\n';
  }
  // click events...
  for (var t = 0; t < compCommentTags.length; t++) {
    tagWindow += 'compComTagBtn' + t + '.onClick = function () {\
\tif (app.project.selection.length == 0) {return;}\
\tfor (var i = 0; i < app.project.selection.length; i++) {\
\t\tif (!(app.project.selection[i] instanceof CompItem)) {continue;}\
\t\tapp.project.selection[i].comment = \'' + compCommentTags[t][0] + '\';\
\t}\n};\n';
  }

  for (var m = 0; m < multiTags.length; m++) {
    tagWindow += 'multiTagBtn' + m + '.onClick = function () {\
\tif (app.project.selection.length == 0) {return;}\
\tfor (var i = 0; i < app.project.selection.length; i++) {\
\t\tif (app.project.selection[i] instanceof CompItem) {\
\t\t\tapp.project.selection[i].motionGraphicsTemplateName = \'' + multiTags[m][0] + '\';\
\t\t}\
\t\tif (app.project.selection[i] instanceof FootageItem) {\
\t\t\tapp.project.selection[i].comment = \'' + multiTags[m][0] + '\';\
\t\t}\
\t}\n};\n';
  }

  for (var k = 0; k < compTemplateTags.length; k++) {
    tagWindow += 'temTagBtn' + k + '.onClick = function () {\
\tif (app.project.selection.length == 0) {return;}\
\tfor (var i = 0; i < app.project.selection.length; i++) {\
\t\tif (!(app.project.selection[i] instanceof CompItem)) {continue;}\
\t\tapp.project.selection[i].motionGraphicsTemplateName = \'' + compTemplateTags[k][0] + '\';\
\t}\n};\n';
  }

  tagWindow += 'w.show();';

  eval(tagWindow); // → eval Ui definition
}
