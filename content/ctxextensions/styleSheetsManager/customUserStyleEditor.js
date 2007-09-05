// static class "CustomUserStyleEditorService" 
var CustomUserStyleEditorService = {
	
	// properties 
	shortStringMode : 'cut-end',

	utils : ExtCommonUtils,

	forcePath : null,
	forceDone : false,

	dir : [],
	
	get contentDocument() 
	{
		return (this.utils.mainWindow) ? this.utils.mainWindow.ExtService.contentDocument(true) : null ;
	},
 
	get currentURI() 
	{
		return (this.utils.mainWindow && (this.forceDone || !this.forcePath)) ? this.utils.mainWindow.ExtService.currentURI(true) : this.forcePath ;
	},
 
	get titleMax() 
	{
		return this.utils.getPref('ctxextensions.width.customUserStyleEditor.title');
	},
  
	// elements 
	
	get rules() 
	{
		return document.getElementById('rules');
	},
 
	get title() 
	{
		return document.getElementById('title');
	},
 
	get target() 
	{
		return document.getElementById('targetDir');
	},
  
	init : function() 
	{
		document.documentElement.getButton('extra1').label = document.getElementById('extra1-label').getAttribute('label');
		document.documentElement.getButton('extra2').label = document.getElementById('extra2-label').getAttribute('label');
		document.documentElement.getButton('extra2').setAttribute('default', 'true');

		this.initDialog(('arguments' in window && window.arguments.length ? window.arguments[0] : '' ));
	},
 
	initDialog : function(aForcedTarget) 
	{
		if (aForcedTarget) {
			this.forcePath = aForcedTarget;
			this.forceDone = false;
		}

		var docTitle;
		try {
			docTitle = this.forcePath || this.contentDocument.title || this.currentURI.split('#')[0];
		}
		catch(e) {
		}
		if (!docTitle)
			docTitle = this.utils.getMsg('customUserStyleEditor_title_none');

		var shortTitle = this.utils.getShortString(docTitle, this.titleMax, this.shortStringMode);

		this.title.setAttribute('tooltiptext', docTitle);
		this.title.setAttribute('label', this.title.getAttribute('label-for-site').replace(/%s/ig, shortTitle));



		this.target.removeChild(this.target.firstChild);

		var mpopup = this.target.appendChild(document.createElement('menupopup'));

		mpopup.appendChild(document.createElement('menuseparator'));
		var reload = mpopup.appendChild(document.createElement('menuitem'));
		var reloadData = document.getElementById('targetDirReload');
		reload.setAttribute('label', reloadData.getAttribute('label'));
		reload.setAttribute('style', reloadData.getAttribute('style'));
		reload.setAttribute('oncommand', reloadData.getAttribute('oncommand'));

		var tmp_item,
			sep = mpopup.firstChild,
			path;

		this.dir = this.utils.getParentDirs(this.currentURI);
		for (var i in this.dir)
		{
			path = this.dir[i];

			tmp_item = document.createElement('menuitem');
			tmp_item.setAttribute('tooltiptext', path);
			tmp_item.setAttribute('label', path);
			tmp_item.setAttribute('value', path);
			tmp_item.setAttribute('crop', 'center');
			mpopup.insertBefore(tmp_item, sep);
		}
		this.target.selectedIndex = 0;

		this.title.setAttribute('uri', this.currentURI);
		this.restoreRules();

		this.forceDone = true;
	},
 
	reload : function(aForce) 
	{
		if (this.utils.mainWindow &&
			this.title.getAttribute('uri').split('#')[0] == this.currentURI.split('#')[0] &&
			!aForce)
			return;
		else if (!this.utils.mainWindow && this.forcePath)
			this.initDialog(this.forcePath);
		else
			this.initDialog();
	},
 
	clearRules : function() 
	{
		this.utils.doCommand(this.rules, 'cmd_selectAll');
		this.utils.doCommand(this.rules, 'cmd_delete');
//		this.saveRules();
		this.rules.focus();
	},

 
	saveRules : function() 
	{
		this.target.value = this.utils.getCurrentDir(this.target.value);
		var path  = this.target.value,
			value = this.utils.escape(this.rules.value);
		if (value)
			this.utils.USERSTYLES.setData(
				path,
				'Path', path,
				'StyleRules', value
			);
		else
			this.utils.USERSTYLES.removeData(path);
	},
 
	restoreRules : function() 
	{
		var value    = '';
		try {
			value = this.utils.unescape(this.utils.USERSTYLES.getDataFromPath(this.target.value, 'StyleRules'));
		}
		catch(e) {
		}

		this.rules.value = value;
	},
 
	importRules : function() 
	{
		this.utils.readCSSFor('rules');
		this.rules.focus();
		this.utils.doCommand(this.rules, 'cmd_moveTop');
	},
 
	destruct : function() 
	{
	}
};
  
// スタイルシートマネージャのツリーからのD&D 
const gCustomUserStyleEditorDNDObserver =
{
	onDrop : function(aEvent, aTransferData, aSession)
	{
		CustomUserStyleEditorService.initDialog(aTransferData.data);
//		ExtCommonUtils.doCommand(CustomUserStyleEditorService.rules, 'cmd_moveBottom');
	},

	onDragOver : function(aEvent, aFlavour, aSession)
	{
	},

	getSupportedFlavours : function ()
	{
		var flavours = new FlavourSet();
		flavours.appendFlavour('moz/userstylerules');
		return flavours;
	}
};
 
