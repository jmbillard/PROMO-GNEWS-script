/*

---------------------------------------------------------------
> 🖌️ files, folders and system
---------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061
//  jshint -W085
//  jshint -W043

/*

---------------------------------------------------------------
> command line
---------------------------------------------------------------

*/

// open system folder...
function openFolder(folderPath) {
	var folder = Folder(folderPath);

	if (appOs == 'Win') {
		system.callSystem('explorer ' + Folder.decode(folder.fsName));
	} else {
		system.callSystem('open "' + Folder.decode(folder.fsName) + '"');
	}
}

// open url...
function openWebSite(url) {
	if (appOs == 'Win') {
		system.callSystem('explorer ' + url);
	} else {
		system.callSystem('open ' + url);
	}
}

function getURLContent(urlArray, dstArray) {
	if (appOs == 'Win') {
		// powershell command string...
		// header...
		var cmd =
			"Write-Host '------------- PROMO GNEWS script -------------'";
		cmd += ' -ForegroundColor white -BackgroundColor DarkRed;';

		for (var i = 0; i < urlArray.length; i++) {
			// get only the NOT '\' OR '/' at the end...
			var fileName = decodeURI(urlArray[i].match(/[^\\|\/]*$/i));
			// removes any character after the '?' at the end...
			fileName = fileName.replace(/[\?].*$/, '');
			// current action description...
			cmd += "Write-Host '> downloading " + fileName + "...';";
			// downloads file...
			cmd += "curl '" + urlArray[i] + "' -OutFile '" + dstArray[i] + '/' + fileName + "';";
		}
		// pass the powershell command → cmd...
		var cmdStr = 'cmd.exe /c powershell.exe -c "' + cmd + '"';
		// →  cmd.exe /c powershell.exe -c "curl 'https://site.com/file.jsx' -OutFile '~/Desktop/file.jsx'"
		system.callSystem(cmdStr);
	}
}

function unzipContent(zipPath, dstPath) {
	if (appOs == 'Win') {
		// get only the NOT '\' OR '/' at the end...
		var fileName = decodeURI(zipPath.match(/[^\\|\/]*$/i));
		// removes any character after the '?' at the end...
		fileName = fileName.replace(/[\?].*$/, '');

		// powershell command string...
		// header...
		var cmd = "Write-Host '------------- PROMO GNEWS script -------------'";
		cmd += ' -ForegroundColor white -BackgroundColor DarkRed;';
		// current action description...
		cmd += "Write-Host '> extracting " + fileName + "...';";
		// unzip file...
		cmd += "Expand-Archive -Path '" + zipPath + "' -DestinationPath '" + dstPath + "'  -Force;";
		// pass the powershell command thru cmd...
		var cmdStr = 'cmd.exe /c powershell.exe -c "' + cmd + '"';

		system.callSystem(cmdStr);
	}
}

function zipContent(path, zipPath) {
	if (appOs == 'Win') {
		// get only the NOT '\' OR '/' at the end...
		var fileName = decodeURI(zipPath.match(/[^\\|\/]*$/i));
		// removes any character after the '?' at the end...
		fileName = fileName.replace(/[\?].*$/, '');

		// powershell command string...
		// header...
		var cmd = "Write-Host '------------- PROMO GNEWS script -------------'";
		cmd += ' -ForegroundColor white -BackgroundColor DarkRed;';
		// current action description...
		cmd += "Write-Host '> compressing " + fileName + "...';";
		// zip file...
		cmd += "Compress-Archive -Path '" + path + "' -DestinationPath '" + zipPath;
		cmd += "' -CompressionLevel Optimal -Force;";
		// pass the powershell command thru cmd...
		var cmdStr = 'cmd.exe /c powershell.exe -c "' + cmd + '"';

		system.callSystem(cmdStr);
	}
}

function installFonts(fontsPath) {
	var srcFolder = new Folder(fontsPath);
	var filesArray = [];
	var filter = ['.ttf', '.otf'];

	if (!srcFolder.exists) return;

	filesArray = srcFolder.getFiles();

	if (filesArray.length == 0) return;

	var installFontsPS = "Write-Host '------------- PROMO GNEWS script -------------'";
	installFontsPS += ' -ForegroundColor white -BackgroundColor DarkRed;';
	installFontsPS += "Write-Host '                (u.u )...zzz';";
	installFontsPS += '$Destination = (New-Object -ComObject Shell.Application).Namespace(0x14);';

	for (var i = 0; i < filesArray.length; i++) {
		var aFile = filesArray[i];
		var aFileName = File.decode(aFile.displayName).toString();
		var subArray = [];

		try {
			subArray = new Folder(decodeURI(aFile.fullName).toString()).getFiles();
		} catch (err) { }

		if (subArray.length > 0) {
			installFonts(decodeURI(aFile.fullName).toString());

			continue;
		} else {

			if (filter.indexOf(getFileExt(aFileName)) >= 0) {
				var aFontPath = fontsPath.replace(/\~/, 'C:/Users/' + system.userName.toString());
				aFontPath = aFontPath.replace(/\//g, '\\');
				installFontsPS += "$Destination.CopyHere('" + aFontPath + '\\' + aFileName + "');";
				installFontsPS += "Write-Host '> installing " + aFileName + "...';";
			} else continue;
		}
	}
	var cmdStr = 'cmd.exe /c powershell.exe -c "' + installFontsPS + '"';
	system.callSystem(cmdStr);
}

/*

---------------------------------------------------------------
> folders
---------------------------------------------------------------

*/

function copyFolderContent(src, dst) {
	try {
		var f = (new Folder(src)).getFiles();

		for (var i = 0; i < f.length; i++) if (!copyFile(f[i], dst)) return false;

		return true;
	}
	catch (err) { }
}

function copyFile(fullPath, newPath) {
	try {
		var file = new File(fullPath);
		var folder = new File(newPath);

		if (file.length < 0) {
			if (!createPath(newPath + "/" + file.name)) return false;
			if (!copyFolderContent(fullPath, newPath + "/" + file.name)) return false;

			return true;
		}
		else {
			if (!createPath(newPath)) return false;
			if (!file.copy(newPath + "/" + file.name)) return false;

			return true;
		}
	}
	catch (err) { }
}

function createPath(path) {
	var folder = new Folder(path);

	if (!folder.exists) {
		var f = new Folder(folder.path);

		if (!f.exists) if (!createPath(folder.path)) return false;
		if (!folder.create()) return false;
	}
	return true;
}


function removeFolder(folder) {
	if (!folder.exists) return;

	var files = folder.getFiles();

	for (var n = 0; n < files.length; n++) {

		if (files[n] instanceof File) {
			files[n].remove();
		} else {
			removeFolder(files[n]);
		}
	}
	folder.remove();
}

function copyFolderContentContent(src, dst) {
	var srcFolder = new Folder(src);
	var dstFolder = new Folder(dst);
	var filesArray = [];

	if (!srcFolder.exists) return;

	filesArray = srcFolder.getFiles();

	if (filesArray.length == 0) return;

	for (var i = 0; i < filesArray.length; i++) {
		var aFile = filesArray[i];
		var aFileName = File
			.decode(aFile.displayName)
			.toString();
		var subArray = [];

		try {
			if (aFile instanceof Folder) subArray = aFile.getFiles();
		} catch (err) { }

		if (subArray.length > 0) {
			copyFolderContentContent(decodeURI(aFile.fullName).toString(), dst);

		} else {

			if (!dstFolder.exists) continue;

			var cFile = new File(dst + '/' + aFileName);
			aFile.copy(cFile);
		}
	}
}

function PRODUCAO_DIA_A_DIA() {
	var dateStr = system
		.callSystem('cmd.exe /c date /t')
		.trim();

	var y = dateStr.split('/')[2].trim(); // -> 2022
	var m = dateStr.split('/')[1]; // -> 11
	m += '_' + shortMonthArray[parseInt(m) - 1]; // -> 11_NOV
	var d = dateStr.split('/')[0]; // -> 24
	var todayPath = nAdd + '/PRODUCAO-DIA-A-DIA/' + y + '/' + m + '/' + d + '/GNEWS';

	return todayPath;
}

/*

---------------------------------------------------------------
> files
---------------------------------------------------------------

*/

function readFileContent(file) {
	var fileContent;

	file.open('r');
	fileContent = file.read();
	file.close();

	return fileContent;
}

function saveTextFile(fileContent, filePath) {
	var newFile = new File(filePath);

	newFile.encoding = 'UTF-8'; // → file encoding
	return writeFileContent(newFile, fileContent);
}

function fileToBinary(aFile) {
	aFile.open('r');
	aFile.encoding = 'binary';

	var bin = aFile.read();
	var strCode = bin.toSource().toString();

	strCode = strCode.substring(12, strCode.length - 2);
	aFile.close();

	return strCode
		.replace(/\'/g, "\\'")
		.replace(/^\"/, "'")
		.replace(/[\"]+$/, "'");
}

function writeFileContent(newFile, fileContent) {
	newFile.open('w');
	newFile.write(fileContent);
	newFile.close();

	return newFile;
}

function createPresetFile(tempFld, fileName, strCode) {
	try {
		var aFile = new File(tempFld + '/' + fileName);

		aFile.encoding = 'BINARY';
		writeFileContent(aFile, strCode);

		return aFile;
	} catch (err) { }
}

// copy all fonts used in the project...
function fontCollect(savePath) {
	savePath += '/fonts'; // collect folder path...
	var saveFolder = new Folder(savePath); // collect folder...
	var fontArray = []; // copied fonts array...
	var failArray = []; // failed copy array...
	var compArray = getComps(); // all project comps...

	if (!saveFolder.exists) saveFolder.create();

	for (var c = 0; c < compArray.length; c++) {
		var comp = compArray[c]; // current comp...

		for (var l = 1; l <= comp.numLayers; l++) {
			var aLayer = comp.layer(l); // current layer...

			if (!(aLayer instanceof TextLayer)) continue;
			// current text layer...
			var textDoc = aLayer
				.property('ADBE Text Properties')
				.property('ADBE Text Document').value;
			var fontName = textDoc.font; // font name...
			var fontSrcFile = new File(decodeURI(textDoc.fontLocation)); // font file...

			if (!fontSrcFile.exists) {
				if (failArray.indexOf(fontName) < 0) failArray.push(fontName); // no font file...
				continue;
			}
			if (fontArray.indexOf(fontName) > 0) continue; // already copied...

			var fontCopyFile = new File(savePath + '/' + fontSrcFile.displayName);

			fontArray.push(fontName);

			fontSrcFile.copy(fontCopyFile);
		}
	}
	if (saveFolder.getFiles().length == 0) saveFolder.remove();

	if (failArray.length > 0) alert(failArray.toString() + ' cant be copied');
}

// copy all fonts used in the project...
function fileCollectHN(projName) {
	var savePath = PRODUCAO_DIA_A_DIA() + '/_EMAILS'; // collect folder path...
	var saveFolder = new Folder(savePath); // collect folder...
	// var footage = getFootage(); // all project footage...


	// var failArray = []; // failed copy array...
	// var compArray = getComps(); // all project comps...

	// if (!saveFolder.exists) saveFolder.create();

	for (var i = 0; i < app.project.numItems; i++) {
    var aItem = app.project.item(i);

    if (!(aItem instanceof FootageItem)) continue;

		var fileName = decodeURI(aItem.file.name);
		var filePath = decodeURI(aItem.file.fullName);
		
		if (!filePath.match(/^\/[c|d|f|i]\/|^~/)) continue;

		copyFile(filePath, savePath)
	}
	// for (var c = 0; c < compArray.length; c++) {
	// 	var comp = compArray[c]; // current comp...

	// 	for (var l = 1; l <= comp.numLayers; l++) {
	// 		var aLayer = comp.layer(l); // current layer...

	// 		if (!(aLayer instanceof TextLayer)) continue;
	// 		// current text layer...
	// 		var textDoc = aLayer
	// 			.property('ADBE Text Properties')
	// 			.property('ADBE Text Document').value;
	// 		var fontName = textDoc.font; // font name...
	// 		var fontSrcFile = new File(decodeURI(textDoc.fontLocation)); // font file...

	// 		if (!fontSrcFile.exists) {
	// 			if (failArray.indexOf(fontName) < 0) failArray.push(fontName); // no font file...
	// 			continue;
	// 		}
	// 		if (fontArray.indexOf(fontName) > 0) continue; // already copied...

	// 		var fontCopyFile = new File(savePath + '/' + fontSrcFile.displayName);

	// 		fontArray.push(fontName);

	// 		fontSrcFile.copy(fontCopyFile);
	// 	}
	// }
	// if (saveFolder.getFiles().length == 0) saveFolder.remove();

	// if (failArray.length > 0) alert(failArray.toString() + ' cant be copied');
}
