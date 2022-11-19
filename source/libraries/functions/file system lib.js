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
			cmd +=
				"curl '" +
				urlArray[i] +
				"' -OutFile '" +
				dstArray[i] +
				'/' +
				fileName +
				"';";
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
		var cmd =
			"Write-Host '------------- PROMO GNEWS script -------------'";
		cmd += ' -ForegroundColor white -BackgroundColor DarkRed;';
		// current action description...
		cmd += "Write-Host '> extracting " + fileName + "...';";
		// unzip file...
		cmd +=
			"Expand-Archive -Path '" +
			zipPath +
			"' -DestinationPath '" +
			dstPath +
			"'  -Force;";
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
		var cmd =
			"Write-Host '------------- PROMO GNEWS script -------------'";
		cmd += ' -ForegroundColor white -BackgroundColor DarkRed;';
		// current action description...
		cmd += "Write-Host '> compressing " + fileName + "...';";
		// zip file...
		cmd +=
			"Compress-Archive -Path '" +
			path +
			"' -DestinationPath '" +
			zipPath;
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

	if (!srcFolder.exists) {
		return;
	}

	filesArray = srcFolder.getFiles();

	if (filesArray.length == 0) {
		return;
	}

	var installFontsPS =
		"Write-Host '------------- PROMO GNEWS script -------------'";
	installFontsPS +=
		' -ForegroundColor white -BackgroundColor DarkRed;';
	installFontsPS += "Write-Host '                (u.u )...zzz';";
	installFontsPS +=
		'$Destination = (New-Object -ComObject Shell.Application).Namespace(0x14);';

	for (var i = 0; i < filesArray.length; i++) {
		var aFile = filesArray[i];
		var aFileName = File.decode(aFile.displayName).toString();
		var subArray = [];

		try {
			subArray = new Folder(
				decodeURI(aFile.fullName).toString()
			).getFiles();
		} catch (error) {}

		if (subArray.length > 0) {
			installFonts(decodeURI(aFile.fullName).toString());

			continue;
		} else {
			if (filter.indexOf(getFileExt(aFileName)) >= 0) {
				var aFontPath = fontsPath.replace(
					/\~/,
					'C:/Users/' + system.userName.toString()
				);
				aFontPath = aFontPath.replace(/\//g, '\\');
				installFontsPS +=
					"$Destination.CopyHere('" +
					aFontPath +
					'\\' +
					aFileName +
					"');";
				installFontsPS +=
					"Write-Host '> installing " + aFileName + "...';";
			} else {
				continue;
			}
		}
	}
	var cmdStr =
		'cmd.exe /c powershell.exe -c "' + installFontsPS + '"';
	system.callSystem(cmdStr);
}

/*

---------------------------------------------------------------
> folders
---------------------------------------------------------------

*/

function removeFolder(folder) {
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

function getTempFld() {
	try {
		var tempFld = new Folder(scriptPreferencesPath + '/temp');

		if (!tempFld.exists) {
			tempFld.create();
		}
		return tempFld.fullName;
	} catch (error) {
		alert("can't find temp folder");
	}
}

function copyFolderContent(src, dst) {
	var srcFolder = new Folder(src);
	var dstFolder = new Folder(dst);
	var filesArray = [];

	if (!srcFolder.exists) {
		return;
	}

	filesArray = srcFolder.getFiles();

	if (filesArray.length == 0) {
		return;
	}

	for (var i = 0; i < filesArray.length; i++) {
		var aFile = filesArray[i];
		var aFileName = File.decode(aFile.displayName).toString();
		var subArray = [];

		try {
			subArray = new Folder(
				decodeURI(aFile.fullName).toString()
			).getFiles();
		} catch (error) {}

		if (subArray.length > 0) {
			copyFolderContent(decodeURI(aFile.fullName).toString(), dst);
		} else {
			if (!dstFolder.exists) {
				continue;
			}

			var cFile = new File(dst + '/' + aFileName);
			aFile.copy(cFile);
		}
	}
}

/*

---------------------------------------------------------------
> files
---------------------------------------------------------------

*/

function readFile(file) {
	var fileContent;

	file.open('r');
	fileContent = file.read();
	file.close();

	return fileContent;
}

function saveFile(fileContent, filePath) {
	var newFile = new File(filePath);

	newFile.open('w');
	newFile.write(fileContent);
	newFile.close();

	return newFile;
}

function convertToBinary(aFile) {
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

function exportFile(outFile, strCode) {
	outFile.open('w');
	outFile.write(strCode);
	outFile.close();
}

function createPresetFile(tempFld, fileName, strCode) {
	try {
		var aFile = new File(tempFld + '/' + fileName);

		aFile.encoding = 'BINARY';
		exportFile(aFile, strCode);

		return aFile;
	} catch (error) {}
}

// copy all fonts used in the project...
function fontCollect(savePath) {
	var fontArray = [];

	for (f = 1; f <= app.project.numItems; f++) {
		var aItem = app.project.item(f);

		if (!(aItem instanceof CompItem)) {
			continue;
		}

		for (l = 1; l <= aItem.numLayers; l++) {
			var aLayer = aItem.layer(l);

			if (!(aLayer instanceof TextLayer)) {
				continue;
			}

			var textProp = aLayer.property('ADBE Text Properties');
			var textDoc = textProp.property('ADBE Text Document').value;
			var fontName = textDoc.font;

			if (textDoc.fontLocation == '') {
				alert(fontName + ' not found... >_<');
			} else if (fontArray.indexOf(fontName) >= 0) {
				var fontFolder = new Folder(savePath + '/fonts/');
				var fontCPath = fontFolder.absoluteURI + '/';
				var fontPath = decodeURI(textDoc.fontLocation);
				var ext = getFileExt(fontPath);
				var fontFile = new File(fontPath);
				var fontCFile = new File(fontCPath + fontName + ext);

				fontArray.push(fontName);

				if (!fontFolder.exists) {
					fontFolder.create();
				}
				fontFile.copy(fontCFile);
			}
		}
	}
}
