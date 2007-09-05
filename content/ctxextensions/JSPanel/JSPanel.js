// static class "JSPanelService" 
var JSPanelService = {

	utils : ExtCommonUtils,
	
	get tabs() 
	{
		return document.getElementById('scriptPageTabs');
	},
	get tabpanels()
	{
		return document.getElementById('scriptPagePanels');
	},
 
	get script() 
	{
		return this.scripts[this.tabs.selectedIndex];
	},
 
	get scripts() 
	{
		return document.getElementsByTagName('textbox');
	},
 
	get status() 
	{
		return document.getElementById('statusbar');
	},
 
	init : function() 
	{
		var tabs   = this.tabs,
			label  = tabs.getAttribute('labelTemplate'),
			panels = this.tabpanels,
			max    = this.utils.getPref('ctxextensions.JSPanel.page.number');
		for (var i = 1; i < max; i++)
		{
			tabs.appendChild(document.createElement('tab'));
			tabs.lastChild.label = label.replace(/%s/gi, i+1);

			panels.appendChild(panels.firstChild.cloneNode(true));
			panels.lastChild.lastChild.id = 'script'+(i+1);
		}
		tabs.firstChild.label = label.replace(/%s/gi, 1);

		tabs.selectedIndex = this.utils.getPref('ctxextensions.JSPanel.page.last') || 0 ;

		document.documentElement.getButton('extra1').label = document.getElementById('extra1-label').getAttribute('label');

		this.loadScript();
		this.script.focus();
		this.utils.doCommand(this.script, 'cmd_moveTop');
	},
	
	saveScript : function() 
	{
		var scripts = this.scripts;
		for (var i = 0; i < scripts.length; i++)
		{
			if (scripts[i].value)
				this.utils.setPref('ctxextensions.JSPanel.history.page'+i, scripts[i].value, true);
			else
				this.utils.clearPref('ctxextensions.JSPanel.history.page'+i);
		}
	},
 
	loadScript : function() 
	{
		var scripts = this.scripts;
		for (var i = 0; i < scripts.length; i++)
			scripts[i].value = this.utils.getPref('ctxextensions.JSPanel.history.page'+i, true) || '';
	},
  
	// スクリプトの操作 
	
	runScript : function() 
	{
		this.clearStatus()

		var script = this.script.value;
		if (!script.replace(/\s/gi, '')) return;

		if (!this.utils.mainWindow) {
			this.status.label = this.utils.getMsg('JSPanel_WindowOpen');
			var w = window.openDialog(this.utils.mainURI, '_blank', 'chrome,all,dialog=no');
			var progress = new pProgressManager(this.runScriptObserver, 50/*, w*/);
			progress.appendItem(w, script, window);
			progress.start();
		}
		else {
			this.utils.mainWindow.ExtFunc.CustomScripts(null, script);
//			this.script.focus();
			window.focus();
			this.status.label = this.utils.getMsg('JSPanel_OK');
		}

		return;
	},
	
	runScriptObserver : 
	{
		onProgress : function(aManager, aWindow, aScript, aJSPanel)
		{
			if (!aWindow || ('closed' in aWindow && aWindow.closed))
				return true;

			if (!('ExtService' in aWindow) ||
				!aWindow.ExtService.activated) return false;

			aWindow.ExtFunc.CustomScripts(null, aScript);
//			JSPanelService.script.focus();
			aJSPanel.focus();
			return true;
		},
		onProgressEnd : function(aManager)
		{
			JSPanelService.status.label = JSPanelService.utils.getMsg('JSPanel_OK');
		}
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

		this.script.focus();

		if (content) {
			this.script.value = content;
			this.utils.doCommand(this.script, 'cmd_moveTop');
		}
		return;
	},
 
	clearScript : function() 
	{
		this.utils.doCommand(this.script, 'cmd_selectAll');
		this.utils.doCommand(this.script, 'cmd_delete');
		this.script.focus();
	},
  
	clearStatus : function() 
	{
		this.status.label = '';
	},
 
	destruct : function() 
	{
		this.saveScript();
		this.utils.setPref('ctxextensions.JSPanel.page.last', this.tabs.selectedIndex);
	}
};
  
