const ID = '{4C4D8A1D-1E3C-439e-9298-16073A5C4851}';
var unreg;

function init()
{
	document.getElementById('expertCheck').checked = ExtCommonUtils.getPref('ctxextensions.enable.expert_prefs');
}


function chooseExtensionsData(textboxId)
{
	var file = chooseRDFDataSource();
	if (file) document.getElementById(textboxId).value = file.path;
}

function importRDFData()
{
	var file = chooseRDFDataSource();
	if (!file) return;

	var uri         = ExtCommonUtils.getURLSpecFromFilePath(file.path);
	var dsource_uri = ExtCommonUtils.datasourceURI;
	if (uri == dsource_uri) return;

	window.openDialog('chrome://ctxextensions/content/pref/importRDFData.xul', '_blank', 'chrome,modal,resizable=no,titlebar=no,centerscreen', uri);

	ExtCommonUtils.PromptService.alert(
		window,
		ExtCommonUtils.getMsg('pref_importRDF_title'),
		ExtCommonUtils.getMsg('pref_importRDF_finish')
	);
}


function chooseRDFDataSource()
{
	var file = ExtCommonUtils.chooseFile(
			ExtCommonUtils.getMsg('filePicker_title_datafile'),
			'ctxextensions.rdf',
			[
				ExtCommonUtils.getMsg('filePicker_filter_rdf'),
				'*.rdf'
			]
		);
	if (!file) return null;

	var content;
	try {
		content = ExtCommonUtils.readFrom(file);
	}
	catch(e) {
	}
	if (!content || !content.match(/xmlns(:[^=]+)?=("|')http:\/\/www\.w3\.org\/1999\/02\/22-rdf-syntax-ns#("|')/)) {
		ExtCommonUtils.PromptService.alert(
			window,
			ExtCommonUtils.getMsg('pref_importRDF_notDataSource_title'),
			ExtCommonUtils.getMsg('pref_importRDF_notDataSource')
		);
		return null;
	}
	return file;
}

