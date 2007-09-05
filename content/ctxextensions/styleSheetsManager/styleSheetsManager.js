// static class "StyleSheetsManagerService" 
var StyleSheetsManagerService = {

	utils : ExtCommonUtils,

	userContentCSS : null,


	USERSTYLES :
	{
		RDFData    : null,
		groupID    : 'userStyles',
		defaultKey : 'StyleRules'
	},

	SELECTEDSTYLES :
	{
		RDFData    : null,
		groupID    : 'selectedStyles',
		defaultKey : 'SelectedStyle'
	},
	
	init : function() 
	{
		document.documentElement.getButton('extra1').label = document.getElementById('extra1-label').getAttribute('label');
		document.documentElement.getButton('extra1').setAttribute('default', 'true');

		this.loadUserContentCSS();

		this.USERSTYLES.RDFData     = this.utils.USERSTYLES;
		this.SELECTEDSTYLES.RDFData = this.utils.SELECTEDSTYLES;

		// 引数からタブの選択状態を設定
		if ('arguments' in window && window.arguments.length)
			this.selectTab(window.arguments[0]);

		this.utils.datasource.AddObserver(gStyleSheetsManagerRDFObserver);

		window.setTimeout(
			function(aThis)
			{
				aThis.initTree('USERSTYLES');
				aThis.initTree('SELECTEDSTYLES');
			},
			0,
			this
		);
	},
 
	selectTab : function(index) 
	{
		var tabbox = document.getElementsByTagName('tabbox')[0];
		var tabs   = tabbox.getElementsByTagName('tab');

		tabbox.selectedTab = tabs[index];
	},
 
	// userContent.cssの編集 
	
	get userContentCSS() 
	{
		return document.getElementById('userContentCSS');
	},
 
	loadUserContentCSS : function() 
	{
		this.userContentCSS.value = this.utils.readCSSFrom(this.utils.userContentCSSFile);
		this.userContentCSS.focus();
		this.utils.doCommand(this.userContentCSS, 'cmd_moveTop');
	},
 
	saveUserContentCSS : function() 
	{
		this.utils.writeCSSTo(this.userContentCSS.value, this.utils.userContentCSSFile);

		var data = { value : this.utils.getPref('ctxextensions.styleManager.userContentCSS_reload_alert') };
		if (!data.value) return;

		this.utils.PromptService.alertCheck(
			window,
			this.utils.getMsg('styleManager_userContentCSS_reloadAlert_title'),
			this.utils.getMsg('styleManager_userContentCSS_reloadAlert'),
			this.utils.getMsg('styleManager_userContentCSS_reloadAlert_check'),
			data
		);
		this.utils.setPref('ctxextensions.styleManager.userContentCSS_reload_alert', data.value);
	},
 
	importRules : function() 
	{
		this.utils.readCSSFor('userContentCSS');
		this.userContentCSS.focus();
		this.utils.doCommand(this.userContentCSS, 'cmd_moveTop');
	},
 
	clearRules : function() 
	{
		this.utils.doCommand(this.userContentCSS, 'cmd_selectAll');
		this.utils.doCommand(this.userContentCSS, 'cmd_delete');
		this.userContentCSS.focus();
	},
  
	// サイト別ユーザースタイルとスタイル選択情報の管理 
	
	updateCommands : function(aID, aForceFlag) 
	{
		var tree     = document.getElementById('tree:'+this[aID].groupID),
			commands = [];
		var items = this.getSelectedItems(tree);

		commands = this.utils.concatArray(commands, document.getElementsByAttribute('class', 'button-'+this[aID].groupID));
		commands = this.utils.concatArray(commands, document.getElementById('mpopup:'+this[aID].groupID).childNodes);

		for (var i = 0; i < commands.length; i++)
			commands[i].disabled = (aForceFlag !== void(0)) ? aForceFlag : !items.length ;

		return;
	},
 
	openCustomUserStyleEditor : function() 
	{
		var tree   = document.getElementById('tree:'+this.USERSTYLES.groupID),
			target = this.utils.getTopWindowOf('ctxextensions:customUserStyleEditor');

		var items = this.getSelectedItems(tree);
		var path  = (items.length) ? items[0].getElementsByTagName('treecell')[0].getAttribute('label') : '';

		if (target) {
			target.focus();
			target.CustomUserStyleEditorService.initDialog(path);
		}
		else
			window.openDialog('chrome://ctxextensions/content/styleSheetsManager/customUserStyleEditor.xul', '', 'chrome,all,dialog=no', path);
	},
 
	openURI : function(aID) 
	{
		var tree   = document.getElementById('tree:'+this[aID].groupID),
			target = this.utils.mainWindow;

		var items = this.getSelectedItems(tree);
		var path = (items.length) ? items[0].getElementsByTagName('treecell')[0].getAttribute('label') : '';

		if (!path) return;

		if (target)
			target.loadURI(path);
		else
			window.openDialog(this.utils.mainURI, '_blank', 'chrome,all,dialog=no', path);

		return;
	},
 
	removeData : function(aID) 
	{

		var tree  = document.getElementById('tree:'+this[aID].groupID);
		var items = this.getSelectedItems(tree);

		if (!items.length) return;
		for (var j = items.length-1; j > -1; j--)
		{
			this[aID].RDFData.removeData(items[j].getElementsByTagName('treecell')[0].getAttribute('label'));
//			items[j].parentNode.removeChild(items[j]);
		}
		this.updateCommands(aID, true);

		return;
	},
 
	getSelectedItems : function(aTree) 
	{
		var items     = [],
			treeitems = aTree.getElementsByTagName('treeitem');
		for (var i = 1; i < treeitems.length; i++)
		{
			// "aTree.view.selection" is for 1.8a or later. "aTree.treeBoxObject.selection" is for 1.7x.
			if (('selection' in aTree.treeBoxObject ? aTree.treeBoxObject.selection : aTree.view.selection).isSelected(i-1) && // "-1" is for template item
				treeitems[i].parentNode.parentNode.localName != 'template')
				items.push(treeitems[i]);
		}
		return items;
	},
 
	initTree : function(aID) 
	{
		var obj = this[aID];
		obj.RDFData.reset();

		var tree = document.getElementById('tree:'+obj.groupID);
		tree.builder.rebuild();

		var cells = tree.getElementsByTagName('treecell'),
			label,
			value;
		for (var i = 0; i < cells.length; i++)
		{
			if (cells[i].parentNode.parentNode.parentNode.parentNode.localName == 'template') continue;

			label = cells[i].getAttribute('label');
//			if (label.match(/^ext_system_(noStyle|onlyPermanence)$/))
//				label = this.utils.getMsg('styleManager_selectedStyle_'+label);

			cells[i].setAttribute('label', label.replace(/\s+/g, ' '));
		}
	},
 
	doSort : function(aTarget) 
	{
		if (aTarget.localName != 'treecol') return;

		var sortResource = aTarget.getAttribute('resource');
		var sortDirection = aTarget.getAttribute('sortDirection') == 'ascending' ? 'descending' : 'ascending';

		try {
			var sortService = Components.classes['@mozilla.org/xul/xul-sort-service;1'].getService(Components.interfaces.nsIXULSortService);
			sortService.sort(aTarget, sortResource, sortDirection);
		}
		catch(e) {
//			alert(e);
		}
	},
  
	destruct : function() 
	{
		this.utils.datasource.RemoveObserver(gStyleSheetsManagerRDFObserver);
	}
};
  
// スタイルシートマネージャのツリーの項目のD&D 
const gStyleSheetsManagerTreeDNDObserver =
{
	onDragStart : function(aEvent, aTransferData, aDragAction)
	{
		if (aEvent.originalTarget.localName != 'treechildren') return; // reject scrollbar

		var node = aEvent.target;
		while (node.parentNode != document.documentElement &&
			node.localName != 'tree')
			node = node.parentNode;

		var treehead = node;
		while (treehead.localName != 'treehead' &&
				treehead.localName != 'treecols' &&
				treehead != document.documentElement)
			treehead = treehead.parentNode;
		if (treehead.localName.match(/tree(head|cols)/)) return;

		var tree = node;
		while (tree.localName != 'tree' && tree != document.documentElement)
			tree = tree.parentNode;
		if (!tree) return;


		var type  = (node.id.match(/userStyles$/)) ? 'userstylerules' : 'selectedstyles' ;
		var items = StyleSheetsManagerService.getSelectedItems(node);

		var uris   = [],
			values = [],
			rules  = [];
		for (var i in items)
		{
			uris.push(items[i].getElementsByTagName('treecell')[0].getAttribute('value'));
			values.push(items[i].getElementsByTagName('treecell')[1].getAttribute('value'));

			rules.push('/* '+uris[i]+' */\n'+values[i]+'\n\n');
		}


		aTransferData.data = new TransferData();
		aTransferData.data.addDataForFlavour('moz/'+type, uris[0]);
		aTransferData.data.addDataForFlavour('text/unicode', (type == 'userstylerules' ? rules.join('\n') : uris.join('\n') ));
	}
};
 
const gStyleSheetsManagerRDFObserver = 
{
	observe : function(aProperty)
	{
		switch (aProperty.Value.split('#')[1])
		{
			case 'StyleRules':
				StyleSheetsManagerService.initTree('USERSTYLES');
				break;
			case 'SelectedStyle':
				StyleSheetsManagerService.initTree('SELECTEDSTYLES');
				break;
			default:
				break;
		}
	},

	// save status
	onAssert: function (aDS, aSource, aProperty, aTarget)
	{
		this.observe(aProperty);
	},

	// clear stored status
	onUnassert: function (aDS, aSource, aProperty, aTarget)
	{
		this.observe(aProperty);
	},

	onChange: function (aDS, aSource, aProperty, aOldTarget, aNewTarget)
	{
		this.observe(aProperty);
	},

	onMove: function (aDS, aOldSource, aNewSource, aProperty, aTarget) {},
	onBeginUpdateBatch: function(aDS) {},
	onEndUpdateBatch: function(aDS) {},
	// for old implementation
	beginUpdateBatch: function (aDS) {},
	endUpdateBatch: function (aDS) {}
};
 
