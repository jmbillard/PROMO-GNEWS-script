
// function deleteFolder(fld) {

//   if (!fld.exists) return;
  
//   var subFld = fld.getFiles();

//   for (var i = subFld.length - 1; i >= 0; i--) {
    
//     try {
//       if (subFld[i].getFiles().length > 0) {
//         deleteFiles(subFld[i]);
//       } else {
//         subFld[i].remove();
//       }
//     } catch (error) {
//       subFld[i].remove();
//     }
//     if (fld.getFiles().length == 0) {
//       subFld[i].parent.remove();
//     }
//   }
// }
function removeFolder(folder){
  var files = folder.getFiles();
  var n, N=files.length;

  for (n=0; n<N; n++){
    files instanceof File ? files.remove() : removeFolder(files);
  ;

  folder.remove();

  };
var test = new Folder('~/AppData/Roaming/PROMO GNEWS script/templates')
deleteFolder(test);