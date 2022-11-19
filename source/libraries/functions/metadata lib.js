/*

---------------------------------------------------------------
> 📃 script metadata
---------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061
//  jshint -W085
//  jshint -W043

// load the XMP library...
if (ExternalObject.AdobeXMPScript == undefined) {
	ExternalObject.AdobeXMPScript = new ExternalObject(
		'lib:AdobeXMPScript'
	);
}

function getXMPdata(XMPfield) {
	var metaData = new XMPMeta(app.project.xmpPacket);
	var XMPSet = XMPConst.NS_DC;
	var XMPVal = '';
	var XMPProp = metaData.getProperty(XMPSet, XMPfield);

	if (XMPProp != undefined) {
		XMPVal = XMPProp.value;
	}

	return XMPVal;
}

function setXMPdata(XMPfield, XMPval) {
	var metaData = new XMPMeta(app.project.xmpPacket);
	var XMPSet = XMPConst.NS_DC;
	var XMPProp = metaData.doesPropertyExist(XMPSet, XMPfield);

	metaData.deleteProperty(XMPSet, XMPfield);
	metaData.setProperty(XMPSet, XMPfield, XMPval);

	app.project.xmpPacket = metaData.serialize();
}
