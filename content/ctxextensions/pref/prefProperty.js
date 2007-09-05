// static class "PrefPropService" 
var PrefPropService = {

	utils : ExtCommonUtils,

	activatedItems : [],

	defaultEditorValue : '',

	keyboardShortcutData :
	{
		key      : '',
		charCode : 0,
		keyCode  : '',
		altKey   : false,
		ctrlKey  : false,
		metaKey  : false,
		shiftKey : false,
		string   : ''
	},

	
	// properties 
	
	get editors() 
	{
		return document.getElementById('editors');
	},
	
	get editor() 
	{
		return document.getElementById('editor').getElementsByTagName('textbox')[0];
	},
 
	get styleRules() 
	{
		return document.getElementById('styleRules').getElementsByTagName('textbox')[0];
	},
 
	get customScripts() 
	{
		return document.getElementById('customScripts').getElementsByTagName('textbox')[0];
	},
  
	get application() 
	{
		if (!this._application) {
			this._application = document.getElementById('application');
			this._application.path = document.getElementById('applicationPath');
			this._application.args = document.getElementById('applicationArguments');
		}
		return this._application;
	},
	_application : null,
 
	get webService() 
	{
		if (!this._webService) {
			this._webService = document.getElementById('webService');
			this._webService.path = document.getElementById('webServicePath');
			this._webService.descriptionForURI = document.getElementById('webServiceDescriptionForURI');
			this._webService.descriptionForSelection = document.getElementById('webServiceDescriptionForSelection');
		}
		return this._webService;
	},
	_webService : null,
 
	get checkboxes() 
	{
		return document.getElementById('checkboxes').getElementsByTagName('checkbox');
	},
	
	get contextChecks() 
	{
		return document.getElementById('contextChecks').getElementsByTagName('checkbox');
	},
  
	get charset() 
	{
		if (!this._charset) {
			this._charset = document.getElementById('charset');
			this._charset.list = document.getElementById('charsetList');
		}
		return this._charset;
	},
	_charset : null,
 
	get openIn() 
	{
		if (!this._openIn) {
			this._openIn = document.getElementById('openIn');
			this._openIn.list = document.getElementById('openInList');
		}
		return this._openIn;
	},
	_openIn : null,
 
	get keyboardShortcut() 
	{
		if (!this._keyboardShortcut) {
			this._keyboardShortcut = document.getElementById('keyboardShortcut');
			this._keyboardShortcut.indicator = document.getElementById('keyboardShortcutIndicator');
		}
		return this._keyboardShortcut;
	},
	_keyboardShortcut : null,
 
	get data() 
	{
		return ('arguments' in window && window.arguments.length) ? window.arguments[0] : {} ;
	},
 
	get isSample() 
	{
		return ('arguments' in window && window.arguments.length > 1) ? window.arguments[1].match(/sampleMode/) : false ;
	},
 
	get isViewer() 
	{
		return ('arguments' in window && window.arguments.length > 1) ? window.arguments[1].match(/viewerMode/) : false ;
	},
  
	init : function() 
	{
dump('0\n');
		var i;

		if ('name' in this.data && this.data.name)
			document.documentElement.setAttribute('title', document.documentElement.getAttribute('title-for').replace(/%s/gi, this.data.name));


dump('1\n');
		if (this.isSample) {
			document.documentElement.getButton('accept').hidden = true;
		}
		else {
			document.documentElement.getButton('extra1').hidden = true;
			if (this.isViewer) {
				document.documentElement.getButton('cancel').hidden = true;
				document.documentElement.setAttribute('readonly', 'true')
			}
		}

dump('2\n');
try{
		this.initEditor();
		this.initApplication();
		this.initWebService();
		this.initCheckboxes();
		this.initCharset();
		this.initOpenIn();
		this.initKeyboardShortcut();
}catch(e){alert(e);}

dump('3\n');
		// hide options tab
		var panel = document.getElementById('tabpanel-options');
		var count = 0;
		for (i = 0; i < panel.childNodes.length; i++)
			if (!panel.childNodes[i].hidden) count++;
		if (!count)
			document.getElementById('tab-options').hidden = true;


dump('4\n');

		if (this.isSample) {
			document.documentElement.getButton('extra1').label = document.getElementById('saveSample-label').getAttribute('label');
		}
dump('5\n');

//		alert(this.activatedItems.join('\n'));
	},
	
	initEditor : function() 
	{
		var activeEditor;
		if ('customScripts' in this.data) {
			activeEditor = this.customScripts;
			activeEditor.value = this.data.customScripts;
			this.activatedItems.push('editor: ScriptEditor');
		}
		else if ('styleRules' in this.data) {
			activeEditor = this.styleRules;
			activeEditor.value = this.data.styleRules;
			this.activatedItems.push('editor: StyleRulesEditor');
		}
		else if ('editorValue' in this.data) {
			activeEditor = this.editor;
			activeEditor.value = this.data.editorValue;
			this.activatedItems.push('editor: CommonEditor');
		}

		if (activeEditor) {
			var i;
			for (i = 0; i < this.editors.childNodes.length; i++)
				if (this.editors.childNodes[i].getElementsByTagName('textbox')[0] != activeEditor)
					this.editors.childNodes[i].setAttribute('hidden', true);

			if (this.isViewer) {
				activeEditor.setAttribute('readonly', 'true');
				var buttons = this.editors.getElementsByTagName('button');
				for (i = 0; i < buttons.length; i++)
					buttons[i].hidden = true;
			}

			this.editors.removeAttribute('hidden');
			activeEditor.removeAttribute('hidden');
			activeEditor.focus();
			this.utils.doCommand(activeEditor, 'cmd_moveTop');
		}
		else
			this.editors.setAttribute('hidden', true);
	},
 
	initApplication : function() 
	{
		if ('applicationPath' in this.data) {
			this.application.path.value = this.data.applicationPath;
			this.application.args.value = this.data.applicationArguments;
			this.application.hidden = false;
			this.activatedItems.push('application: Path and Arguments');

			if (this.isViewer) {
				this.application.path.setAttribute('readonly', 'true');
				this.application.args.setAttribute('readonly', 'true');
			}
		}
		else
			this.application.hidden = true;
	},
 
	initWebService : function() 
	{
		if ('webServicePath' in this.data) {
			this.webService.path.value = this.data.webServicePath;
			this.webService.descriptionForURI.hidden = !this.data.webServiceForURI;
			this.webService.descriptionForSelection.hidden = !this.data.webServiceForSelection;
			this.webService.hidden = false;
			this.activatedItems.push('webservice: Path and Description');

			if (this.isViewer)
				this.webService.path.setAttribute('readonly', 'true');
		}
		else
			this.webService.hidden = true;
	},
 
	initCheckboxes : function() 
	{
		var id,
			count = 0;
		for (var i = 0; i < this.checkboxes.length; i++)
		{
			id = this.checkboxes[i].id;
			if (id in this.data) {
				this.checkboxes[i].hidden = false;
				this.checkboxes[i].checked = this.data[id];
				this.activatedItems.push('checkbox: '+id);
				count++;

				if (this.isViewer)
					this.checkboxes[i].setAttribute('disabled', true);
			}
			else
				this.checkboxes[i].hidden = true;
		}

		if (!count) {
			document.getElementById('checkboxes').hidden = true;
			return;
		}

		count = 0;
		for (i = 1; i < this.contextChecks.length; i++)
			if (!this.contextChecks[i].hidden) count++;

		this.controlContextChecks();

		if (count < 2) {
			var container = document.getElementById('contextChecks');
			document.getElementById('checkboxes').appendChild(this.contextChecks[0].parentNode.removeChild(this.contextChecks[0]));
			container.hidden = true;
		}
	},
 
	initCharset : function() 
	{
		// init charset menu, because the list isn't shown at first. why?
		var observerService = Components.classes['@mozilla.org/observer-service;1'].getService(Components.interfaces.nsIObserverService);
		observerService.notifyObservers(null, 'charsetmenu-selected', 'other');

		if ('charset' in this.data) {
			var items = this.charset.list.getElementsByTagName('menuitem');
			var charset = this.data.charset || this.utils.getPref('ctxextensions.defaultCharset');

			for (var i = 0; i < items.length; i++)
			{
				if (!items[i].value ||
					items[i].value.toLowerCase() != charset.toLowerCase()) continue;
				this.charset.list.selectedItem = items[i];
			}
			this.charset.hidden = false;
			this.activatedItems.push('menulist: Charset Menu');

			if (this.isViewer) {
				this.charset.list.parentNode.previousSibling.setAttribute('disabled', true);
				this.charset.list.setAttribute('disabled', true);
			}
		}
		else
			this.charset.hidden = true;
	},
 
	initOpenIn : function() 
	{
		if ('openIn' in this.data) {
			var items = this.openIn.list.getElementsByTagName('menuitem');
			var openIn = this.data.openIn;

			for (var i = 0; i < items.length; i++)
			{
				if (!items[i].value ||
					items[i].value.toLowerCase() != openIn.toLowerCase()) continue;
				this.openIn.list.selectedItem = items[i];
			}
			this.openIn.hidden = false;
			this.activatedItems.push('menulist: Open Result In');

			if (this.isViewer) {
				this.openIn.list.previousSibling.setAttribute('disabled', true);
				this.openIn.list.setAttribute('disabled', true);
			}
		}
		else
			this.openIn.hidden = true;
	},
 
	initKeyboardShortcut : function() 
	{
		if ('keyboardShortcut' in this.data) {
			this.keyboardShortcutData = {
					key      : this.data.keyboardShortcut.key,
					charCode : this.data.keyboardShortcut.charCode,
					keyCode  : this.data.keyboardShortcut.keyCode,
					altKey   : this.data.keyboardShortcut.altKey,
					ctrlKey  : this.data.keyboardShortcut.ctrlKey,
					metaKey  : this.data.keyboardShortcut.metaKey,
					shiftKey : this.data.keyboardShortcut.shiftKey
				};
			this.keyboardShortcut.indicator.value = this.utils.getStringFromKeyboardShortcut(this.keyboardShortcutData);
			this.keyboardShortcut.hidden = false;
			this.activatedItems.push('Keyboard Shortcut');

			if (this.isViewer) {
				this.keyboardShortcut.indicator.nextSibling.hidden = true;
				this.keyboardShortcut.indicator.nextSibling.nextSibling.hidden = true;
			}
		}
		else
			this.keyboardShortcut.hidden = true;
	},
  
	// エディタ部 
	
	runScript : function() 
	{
		var script = this.customScripts.value;
		if (!script.replace(/\s/gi, '')) return;

		if (!this.utils.mainWindow) {
			var w = window.openDialog(this.utils.mainURI, '_blank', 'chrome,all,dialog=no');
			var progress = new pProgressManager(this.runScriptCallback, 50/*, w*/);
			progress.appendItem(w, script);
			progress.start();
		}
		else {
			this.utils.mainWindow.ExtFunc.CustomScripts(null, script);
			this.editor.focus();
			this.editor.label = this.utils.getMsg('JSPanel_OK');
		}
	},
	
	runScriptCallback : function(aWindow, aScript) 
	{
		if (!aWindow.ExtService ||
			!aWindow.ExtService.activated) return false;

		aWindow.ExtFunc.CustomScripts(null, aScript);
		PrefPropService.editor.focus();
		return true;
	},
  
	importEditor : function() 
	{
		var file = this.utils.chooseFile();
		if (!file) return;

		var content = this.utils.readFrom(file);

		this.editor.focus();

		if (content) {
			this.editor.value = content;
			this.utils.doCommand(this.editor, 'cmd_moveTop');
		}
		return;
	},
	
	importScript : function() 
	{
		var file = this.utils.chooseFile(
			this.utils.getMsg('filePicker_title_javascript'),
			null,
			[
				this.utils.getMsg('filePicker_filter_javascript'),
				'*.js'
			]
		);
		if (!file) return;

		var content = this.utils.readFrom(file);

		this.customScripts.focus();

		if (content) {
			this.customScripts.value = content;
			this.utils.doCommand(this.customScripts, 'cmd_moveTop');
		}
		return;
	},
 
	importCSS : function() 
	{
		this.utils.readCSSFor(this.styleRules);
		this.styleRules.focus();
		this.utils.doCommand(this.styleRules, 'cmd_moveTop');
	},
  
	clear : function(aID) 
	{
		this.utils.doCommand(this[aID], 'cmd_selectAll');
		this.utils.doCommand(this[aID], 'cmd_delete');
		this[aID].focus();
	},
 
	reset : function(aID) 
	{
		this[aID].value = this.defaultEditorValue;
		this[aID].focus();
		this.utils.doCommand(this[aID], 'cmd_moveTop');
	},
  
	// ファイル選択ダイアログ 
	getApplicationPath : function(aTitle)
	{
		var file = this.utils.chooseFile(this.utils.getMsg('filePicker_title_applications'));
		if (file)
			this.application.path.value = file.path;
	},
 
	getCurrentURI : function(aTitle) 
	{
		if (!this.utils.mainWindow) return;

		var uri = this.utils.mainWindow.ExtService.currentURI();
		if (uri)
			this.webService.path.value = uri;
	},
 
	// show in the context menu 
	
	controlContextChecks : function() 
	{
		if (this.isViewer) return;

		var checks = this.contextChecks;
		for (var i = 1; i < checks.length; i++)
			checks[i].disabled = !checks[0].checked;
	},
  
	// keyboard shortcut 
	
	setKeyboardShortcut : function() 
	{
		window.openDialog(
			'chrome://ctxextensions/content/pref/keyDetecter.xul',
			'_blank',
			'chrome,modal,resizable=no,titlebar=no,centerscreen',
			this.keyboardShortcutData,
			this.utils.getMsg('pref_keyboardShortcut_description'),
			this.utils.getMsg('pref_keyboardShortcut_cancel')
		);
		var newValue = this.utils.getStringFromKeyboardShortcut(this.keyboardShortcutData);

		if (this.keyboardShortcut.indicator.value != newValue)
			this.data.modified = true;

		this.keyboardShortcut.indicator.value = newValue;
	},
 
	clearKeyboardShortcut : function() 
	{
		this.keyboardShortcutData.key      = '';
		this.keyboardShortcutData.charCode = 0;
		this.keyboardShortcutData.keyCode  = '';
		this.keyboardShortcutData.altKey   = false;
		this.keyboardShortcutData.ctrlKey  = false;
		this.keyboardShortcutData.metaKey  = false;
		this.keyboardShortcutData.shiftKey = false;

		this.keyboardShortcut.indicator.value = '';

		this.data.modified = true;
	},
  
	returnValue : function() 
	{
		// textboxes
		if ('editorValue' in this.data)
			this.data.editorValue   = this.editor.value;

		if ('styleRules' in this.data)
			this.data.styleRules    = this.styleRules.value;

		if ('customScripts' in this.data)
			this.data.customScripts = this.customScripts.value;

		if ('applicationPath' in this.data)
			this.data.applicationPath = this.application.path.value;
		if ('applicationArguments' in this.data)
			this.data.applicationArguments = this.application.args.value;

		if ('webServicePath' in this.data)
			this.data.webServicePath = this.webService.path.value;

		// checkboxes
		for (var i = 0; i < this.checkboxes.length; i++)
			if (this.checkboxes[i].id in this.data)
				this.data[this.checkboxes[i].id] = this.checkboxes[i].checked;

		if ('charset' in this.data)
			this.data.charset = this.charset.list.selectedItem.value;

		if ('openIn' in this.data)
			this.data.openIn = this.openIn.list.selectedItem.value;

		if ('keyboardShortcut' in this.data)
			this.data.keyboardShortcut = this.keyboardShortcutData;
	},
 
	onAccept : function() 
	{
		var node = document.commandDispatcher.focusedElement;
		if (node.localName.match(/text(area|box)/)) return false;

		this.returnValue();

		return true;
	},
 
	onClose : function() 
	{
		if (!this.isSample && 'modified' in this.data) {
			var result = this.utils.PromptService.confirmEx(
					window,
					this.utils.getMsg('pref_confirm_title'),
					this.utils.getMsg('pref_confirm_close_modified'),
					(
						(this.utils.PromptService.BUTTON_TITLE_YES * this.utils.PromptService.BUTTON_POS_0) +
						(this.utils.PromptService.BUTTON_TITLE_CANCEL * this.utils.PromptService.BUTTON_POS_1) +
						(this.utils.PromptService.BUTTON_TITLE_NO * this.utils.PromptService.BUTTON_POS_2)
					),
					null, null, null,
					null,
					{}
				);
			if (result == 0)
				this.onAccept();
			else if (result == 1)
				return false;
		}

		window.close();

		return true;
	},
 
	destruct : function() 
	{
		if ('callBackFunc' in this.data)
			this.data.callBackFunc();
	}
};
  
