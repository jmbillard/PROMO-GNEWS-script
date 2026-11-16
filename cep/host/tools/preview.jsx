/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/*

---------------------------------------------------------------
> PROMO GNEWS · CEP tools · png preview
---------------------------------------------------------------

  port of the 'pngPreviewBtn' handlers (the classic ScriptUI main window).

    · left click  → choose a folder, save '<comp> preview.png', open the folder
    · right click → args.alt: save next to the current project
                    ('PRODUCAO DIA-A-DIA/_PREVIEWS' on hard news), open the folder

*/

PGN.register('preview', function (args) {
	var aItem = PGN.comp();
	var savePath;

	if (args.alt === true) {
		var todayPathPreview = PRODUCAO_DIA_A_DIA() + '/_PREVIEWS';
		var currentProj = app.project.file;
		var currentProjPath = currentProj != null ? decodeURI(currentProj.path) : projPath;

		savePath = hardNews ? todayPathPreview : currentProjPath;

		// with the missing parents (today's folder may not exist yet)
		if (!createPath(savePath)) PGN.fail('n\u00E3o foi poss\u00EDvel criar a pasta ' + new Folder(savePath).fsName);

	} else {
		var saveFolder = Folder.selectDialog();

		if (saveFolder == null) return '';
		savePath = saveFolder.fullName;
	}
	// a comp name with '/' or ':' would become a path: those characters become '-'
	var safeName = String(aItem.name).replace(/[\\\/:*?"<>|]/g, '-');
	var previewFile = new File(savePath + '/' + safeName + ' preview.png');

	aItem.saveFrameToPng(aItem.time, previewFile);
	openFolder(savePath);

	return { msg: 'Preview salvo', data: { path: previewFile.fsName } };
});
