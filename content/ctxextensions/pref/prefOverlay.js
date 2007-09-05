// static class "PrefUtils" 
var PrefUtils = {

	utils   : ExtCommonUtils,
	RDFData : null,

	mDraggedItem : null,
	mCurrentDragOverItem : null,

	DROP_BEFORE : -1,
	DROP_AFTER  : 1,
	
	get listBox() 
	{
		return document.getElementById('listBox');
	},
 
	get operatorsForListItem() 
	{
		return document.getElementsByAttribute('ext-for-listbox-item', 'true');
	},
 
	get undoOperatorsForListItem() 
	{
		return document.getElementsByAttribute('ext-for-listbox-undo', 'true');
	},
 
	get undoInfo() { 
		var info = this.mUndoInfo.splice(this.mUndoInfo.length-1, 1);
		if (info.constructor == Array) info = info[0];
		this.activateUndoForListItem();
		return info;
	},
	set undoInfo(aInfo) {
		this.mUndoInfo[this.mUndoInfo.length] = aInfo;
		this.activateUndoForListItem();
	},
	mUndoInfo : [],
 
	init : function() 
	{
		this.initMacLabels();
		this.initElementIDs();
		this.initExpert();
		this.initSamples();
		this.initOperatorsForListItem();

		window.parent.initPanel(location.href);

		this.initLinkedItems();
	},
	
	initMacLabels : function() 
	{
		if (navigator.platform.match(/Mac/)) {
			var macLabels = document.getElementsByAttribute('maclabel-for', '*');
			var node;

			for (var i = 0; i < macLabels.length; i++)
			{
				node = document.getElementById(macLabels[i].getAttribute('maclabel-for'));
				node.setAttribute('label', macLabels[i].getAttribute('value'));
				node.setAttribute('flex', 1);
			}
		}
	},
 
	initElementIDs : function() 
	{
		if (!('_elementIDs' in window))
			window._elementIDs = [];

		var items = document.getElementsByAttribute('prefstring', '*');
		for (var i = 0; i < items.length; i++) {
			if (!items[i].id)
				items[i].id = 'pref-anonymous-item:'+i;

			window._elementIDs.push(items[i].id);
//			alert(items[i].id);
		}
	},
 
	initExpert : function() 
	{
		var expertEnabled = this.utils.getPref('ctxextensions.enable.expert_prefs');
		var nodes = document.getElementsByAttribute('expert', '*');
		for (var i = 0; i < nodes.length; i++)
			nodes[i].setAttribute('expert', !expertEnabled);
	},
 
	initSamples : function() 
	{
		// プリセット・サンプル項目にナンバーを振る
		var sample = document.getElementById('listBoxSample');
		if (!sample) return;

		var samples = sample.getElementsByTagName('menuitem');
		for (var i = 0; i < samples.length; i++)
		{
			samples[i].setAttribute('label',
				this.utils.getMsg('pref_sampleLabel').replace(/%N/i, i+1).replace(/%L/i, samples[i].getAttribute('label'))
			);
//			samples[i].setAttribute('script',
//				this.utils.escape(samples[i].getAttribute('script'))
//			);
			samples[i].setAttribute('styleRules',
				this.utils.escape(samples[i].getAttribute('styleRules'))
			);
		}
	},
 
	initLinkedItems : function() 
	{
		var items = document.getElementsByAttribute('linked', '*');

		for (i = 0; i < items.length; i++)
			this.controlLinkedItems(items[i]);
	},
 
	initOperatorsForListItem : function() 
	{
		var i;
		var nodes = this.operatorsForListItem;
		for (i = 0; i < nodes.length; i++)
			nodes[i].setAttribute('disabled', true);

		nodes = this.undoOperatorsForListItem;
		for (i = 0; i < nodes.length; i++)
			nodes[i].setAttribute('disabled', true);
	},
  
	// ファイル選択ダイアログ 
	getFilePathFor : function(aTextboxId, aTitle, aSaveMode)
	{
		var file = this.utils.chooseFile(aTitle, null, null, aSaveMode);
		if (file) document.getElementById(aTextboxId).value = file.path;
		return file;
	},
 
	// キーボードショートカットを設定する 
	setKeyboardShortcutFor : function(aIndicater, aRDFManager)
	{
		window.openDialog(
			'chrome://ctxextensions/content/pref/keyDetecter.xul',
			'',
			'chrome,modal,resizable=no,titlebar=no,centerscreen',
			aRDFManager.keyData,
			this.utils.getMsg('input_keyboardShortcut')
		);
		aIndicater.value = aRDFManager.keyData.string;
	},
 
	clearKeyboardShortcutFor : function(aIndicater, aRDFManager) 
	{
		aRDFManager.keyData.key      = '';
		aRDFManager.keyData.charCode = 0;
		aRDFManager.keyData.keyCode  = '';
		aRDFManager.keyData.altKey   = false;
		aRDFManager.keyData.ctrlKey  = false;
		aRDFManager.keyData.metaKey  = false;
		aRDFManager.keyData.shiftKey = false;
		aRDFManager.keyData.string   = '';

		aIndicater.value = '';
	},
 
	loadURI : function(aURI) 
	{
		var target = this.utils.mainWindow;
		if (target) {
			target.loadURI(aURI);
			target.focus();
		}
		else
			window.openDialog(this.utils.mainURI, '_blank', 'chrome,all,dialog=no', aURI);
	},
 
	controlLinkedItems : function(aNode) 
	{
		var target = aNode.getAttribute('linked').split(/ +/);
		var item;

		var disabled = (aNode.localName == 'textbox') ? (!aNode.value || !Number(aNode.value)) : !aNode.checked ;

		if (aNode.getAttribute('linked-reversed') == 'true')
			disabled = !disabled;

		for (var i in target)
		{
			item = document.getElementById(target[i]);
			item.disabled = disabled;
		}
	},
 
	spinButtonsUpDown : function(aEvent, aTargetID, aMin, aMax) 
	{
		var eventNode = aEvent.target;
		while (eventNode.localName != 'spinbuttons')
			eventNode = eventNode.parentNode;

		var buttonNode = aEvent.originalTarget;
		while (buttonNode.localName != 'image')
			buttonNode = buttonNode.buttonNode;

		if (eventNode.getAttribute('disabled') == 'true' ||
			eventNode.disabled) return;


		var node = document.getElementById(aTargetID);
		var val = Number(node.value);
		if (isNaN(val)) val = 0;

		if (buttonNode.getAttribute('class') == 'up')
			val++;
		else if (buttonNode.getAttribute('class') == 'down')
			val--;

		if (
			(aMin !== void(0) && val < aMin) ||
			(aMax !== void(0) && val > aMax)
			)
			return;

		node.value = val;
	},
 
	// List Items 
	
	addNewListItem : function(aRDFData) 
	{
		if (!aRDFData) aRDFData = this.RDFData;

		var newName = { value : '' };
		if (!this.utils.PromptService.prompt(
				window,
				this.utils.getMsg('pref_newItem_title'),
				this.utils.getMsg('pref_newItem'),
				newName,
				null,
				{}
			) ||
			!newName.value) return;

		if (aRDFData.indexOf(newName.value) > -1) {
			this.utils.PromptService.alert(
				window,
				this.utils.getMsg('pref_newName_duplicated_title'),
				this.utils.getMsg('pref_newName_duplicated')
			);
			return;
		}

		aRDFData.setData(newName.value, 'Name', newName.value);

		this.undoInfo = {
			type    : 'add',
			id      : newName.value,
			RDFData : aRDFData
		};

		window.openDialog('chrome://ctxextensions/content/pref/newItem.xul', '_blank', 'chrome,modal,resizable=no,titlebar=no,centerscreen', aRDFData);

//		this.listBox.builder.rebuild();
//		this.listBox.selectedIndex = this.listBox.childNodes.length-1;
//		this.editListItem(null, aRDFData, true);
	},
 
	editListItem : function(aNode, aRDFData, aForNewItem) 
	{
		if (!aNode) aNode = this.listBox.selectedItem;
		if (!aNode || aNode.localName != 'listitem') return;

		if (!aRDFData) aRDFData = this.RDFData;

		var data = window.getDataFromNode(aNode, aRDFData);

		data.mRDFData     = aRDFData;
		data.mSaveData    = window.saveData;
		data.mPrefWindow  = window;
		data.mNewItem     = aForNewItem;
		data.callBackFunc = function() {
			if ('modified' in this) {
				var modified = this.mSaveData(this.name, this, this.mRDFData);
				if (modified &&
					!this.mNewItem &&
					this.mPrefWindow &&
					!this.mPrefWindow.closed)
					this.mPrefWindow.PrefUtils.undoInfo = {
						type    : 'edit',
						id      : this.name,
						data    : modified,
						RDFData : this.mRDFData
					};
			}
		}

		// if the property window has been opened, focus to it
		var props = this.utils.getWindowsOf('ctxextensions:PrefProperty');
		for (var i in props)
			if ('mRDFData' in props[i].PrefPropService.data &&
				props[i].PrefPropService.data.mRDFData.id == data.mRDFData.id &&
				'name' in props[i].PrefPropService.data &&
				props[i].PrefPropService.data.name == data.name) {
				props[i].focus();
				return;
			}

		var dialog = window.openDialog('chrome://ctxextensions/content/pref/prefProperty.xul', '_blank', 'chrome,all,dialog=no,centerscreen', data);
		dialog.setTimeout('window.focus()', 500);
	},
 
	renameListItem : function(aNode, aRDFData) 
	{
		if (!aNode) aNode = this.listBox.selectedItem;
		if (!aNode || aNode.localName != 'listitem') return;

		if (!aRDFData) aRDFData = this.RDFData;

		var oldName = aNode.getAttribute('label');
		var newName = { value : oldName };
		if (!this.utils.PromptService.prompt(
				window,
				this.utils.getMsg('pref_newName_title'),
				this.utils.getMsg('pref_newName'),
				newName,
				null,
				{}
			) ||
			!newName.value ||
			newName.value == oldName) return;

		if (aRDFData.indexOf(newName.value) > -1) {
			this.utils.PromptService.alert(
				window,
				this.utils.getMsg('pref_newName_duplicated_title'),
				this.utils.getMsg('pref_newName_duplicated')
			);
			return;
		}

		var current = this.listBox.selectedIndex;
		var old = aRDFData.renameData(oldName, newName.value);
		if (old)
			this.undoInfo = {
				type    : 'rename',
				index   : current,
				id      : newName.value,
				data    : { Name : old },
				RDFData : aRDFData
			};

		if (this.utils.getPref('ctxextensions.enable.nsIXULTemplateBuilder'))
			this.listBox.builder.rebuild();
		else
			this.utils.rebuildFromTemplate(this.listBox);

		this.listBox.selectedIndex = current;
	},
 
	removeListItem : function(aNode, aRDFData) 
	{
		if (!aNode) aNode = this.listBox.selectedItem;
		if (!aNode || aNode.localName != 'listitem') return;

/*
		if (!this.utils.PromptService.confirm(
				window,
				this.utils.getMsg('pref_confirm_title'),
				this.utils.getMsg('pref_confirm_remove')
			)) return;
*/

		if (!aRDFData) aRDFData = this.RDFData;

		var current = this.listBox.selectedIndex;

		var name = aNode.getAttribute('label');
		var removedData = aRDFData.removeData(name);
		this.undoInfo = {
			type    : 'remove',
			index   : current,
			id      : name,
			data    : removedData,
			RDFData : aRDFData
		};

		if (this.utils.getPref('ctxextensions.enable.nsIXULTemplateBuilder'))
			this.listBox.builder.rebuild();
		else
			this.utils.rebuildFromTemplate(this.listBox);

		if (!this.listBox.selectedItem)
			if (current == this.listBox.childNodes.length)
				this.listBox.selectedIndex = current-1;
			else
				this.listBox.selectedIndex = current;
	},
 
	moveListItemBy : function(aNode, aOrder, aRDFData) 
	{
		if (!aNode) aNode = this.listBox.selectedItem;
		if (!aNode || aNode.localName != 'listitem') return;

		if (!aRDFData) aRDFData = this.RDFData;

		var name = aNode.getAttribute('label');
		var current = this.listBox.selectedIndex;
		var result = aRDFData.moveElement(name, aOrder);
		if (result)
			this.undoInfo = {
				type    : 'move',
				index   : current,
				id      : name,
				RDFData : aRDFData
			};

		if (this.utils.getPref('ctxextensions.enable.nsIXULTemplateBuilder'))
			this.listBox.builder.rebuild();
		else
			this.utils.rebuildFromTemplate(this.listBox);

		var index = current+aOrder;
		if (index < 0)
			index = 0;
		else if (index >= this.listBox.childNodes.length)
			index = this.listBox.childNodes.length-1;

		this.listBox.selectedIndex = index;
	},
 
	moveListItemTo : function(aNode, aIndex, aRDFData) 
	{
		if (!aNode) aNode = this.listBox.selectedItem;
		if (!aNode || aNode.localName != 'listitem') return;

		if (!aRDFData) aRDFData = this.RDFData;

		var name = aNode.getAttribute('label');
		var current = this.listBox.selectedIndex;
		var result = aRDFData.moveElementTo(name, aIndex);
		if (result)
			this.undoInfo = {
				type    : 'move',
				index   : current,
				id      : name,
				RDFData : aRDFData
			};

		if (this.utils.getPref('ctxextensions.enable.nsIXULTemplateBuilder'))
			this.listBox.builder.rebuild();
		else
			this.utils.rebuildFromTemplate(this.listBox);

		this.listBox.selectedIndex = aIndex;
	},
 
	loadSampleListItem : function(aNode, aRDFData) 
	{
		if (!aNode) return;

		if (!aRDFData) aRDFData = this.RDFData;

		var data = window.getDataFromNode(aNode, aRDFData);

		data.mRDFData     = aRDFData;
		data.mSaveData    = window.saveData;
		data.mPrefWindow  = window;
		data.callBackFunc = function() {
			if (!('save' in this)) return;

			this.mRDFData.setData(this.name, 'Name', this.name);
			this.mSaveData(this.name, this, this.mRDFData);

			if (this.mPrefWindow &&
				!this.mPrefWindow.closed) {
				this.mPrefWindow.PrefUtils.undoInfo = {
					type    : 'add',
					id      : this.name,
					RDFData : this.mRDFData
				};

				if (this.mPrefWindow.PrefUtils.utils.getPref('ctxextensions.enable.nsIXULTemplateBuilder'))
					this.mPrefWindow.PrefUtils.listBox.builder.rebuild();
				else
					this.mPrefWindow.PrefUtils.utils.rebuildFromTemplate(this.mPrefWindow.PrefUtils.listBox);

				this.mPrefWindow.PrefUtils.listBox.selectedIndex = this.mPrefWindow.PrefUtils.listBox.childNodes.length-1;
			}
		}

		window.openDialog('chrome://ctxextensions/content/pref/prefProperty.xul', '_blank', 'chrome,all,dialog=no,centerscreen', data, 'sampleMode');
	},
 
	undoForListItem : function() 
	{
		var info = this.undoInfo;
		if (!info) return;

		var i;
		switch (info.type)
		{
			case 'add':
				info.RDFData.removeData(info.id);
				break;

			case 'remove':
				for (i in info.data)
					info.RDFData.setData(info.id, i, info.data[i]);
				info.RDFData.moveElementTo(info.id, info.index);
				break;

			case 'edit':
				for (i in info.data)
					info.RDFData.setData(info.id, i, info.data[i]);
				break;

			case 'rename':
				info.RDFData.renameData(info.id, info.data.Name);
				break;

			case 'move':
				info.RDFData.moveElementTo(info.id, info.index);
				break;

			default:
				break;
		}
	},
 
	activateForListItem : function() 
	{
		var nodes = this.operatorsForListItem;
		for (var i = 0; i < nodes.length; i++)
			if (!this.listBox.selectedItem)
				nodes[i].setAttribute('disabled', true);
			else
				nodes[i].removeAttribute('disabled');

		if (this.listBox.selectedItem) {
			if (!this.listBox.selectedIndex)
				document.getElementById('button-up').setAttribute('disabled', true);
			else if (this.listBox.selectedIndex == this.listBox.childNodes.length-1)
				document.getElementById('button-down').setAttribute('disabled', true);
		}
	},
 
	activateUndoForListItem : function() 
	{
		var nodes = this.undoOperatorsForListItem;
		for (var i = 0; i < nodes.length; i++)
			if (!this.mUndoInfo.length)
				nodes[i].setAttribute('disabled', true);
			else
				nodes[i].removeAttribute('disabled');
	},
  
	// 項目のD&D 
	
	onDragStart : function(aEvent, aTransferData, aDragAction) 
	{
		// in scrollbars
		if (aEvent.originalTarget.localName &&
			aEvent.originalTarget.localName.match(/^(scrollbar(button)?|slider|thumb)$/)) return;

		var item = this.listBox.selectedItem;
		if (!('dragid' in item))
			item.dragId = 'rdf-listitem/'+Math.floor(Math.random() * 10000);

		aTransferData.data = new TransferData();
		aTransferData.data.addDataForFlavour(
			'ctxextensions/rdf-listitem',
			item.dragId
		);

		this.mDraggedItem = item;
	},
 
	onDrop : function(aEvent, aTransferData, aSession) 
	{
		if (aTransferData.flavour.contentType != 'ctxextensions/rdf-listitem') return;

		// in scrollbars
		if (aEvent.originalTarget.localName &&
			aEvent.originalTarget.localName.match(/^(scrollbar(button)?|slider|thumb)$/)) return;

		var toItem   = aEvent.target,
			fromItem = this.mDraggedItem,
			dragId   = aTransferData.data,
			order    = this.RDFData.indexOf(fromItem.getAttribute('label'));

		// from another window
		if (fromItem.dragId != dragId) return;


		// dropped on other elements
		if (toItem.localName != 'listitem') {
			switch (toItem.id)
			{
				case 'listItemDeleteButton':
					this.removeListItem(fromItem);
					break;

				case 'listItemRenameButton':
					this.renameListItem(fromItem);
					break;

				case 'listItemEditButton':
					this.editListItem(fromItem);
					break;

				default:
					break;
			}
			return;
		}


		// get the dropped position
		var pos = this.getDropPosition(aEvent);

		var toIndex = this.RDFData.indexOf(toItem.getAttribute('label'));

		if (toIndex > order)
			toIndex += (pos < 0 ? -1 : 0 );
		else if (toIndex < order)
			toIndex += (pos > 0 ? 1 : 0 );

		if (toIndex >= 0 && toIndex < this.RDFData.length)
			this.moveListItemTo(fromItem, toIndex);

		this.mDraggedItem = null;
	},
 
	onDragOver : function(aEvent, aFlavour, aSession) 
	{
		var XferDataSet = nsTransferable.get(
				this.getSupportedFlavours(),
				nsDragAndDrop.getDragData,
				true
			);
		var XferData = XferDataSet.first.first;
		if (XferData.flavour.contentType != 'ctxextensions/rdf-listitem') return;

		this.mCurrentDragOverItem = (aEvent.target.localName == 'listitem') ? aEvent.target : null ;
		if (!this.mCurrentDragOverItem) {
			if (aEvent.target != this.listBox)
				aEvent.target.setAttribute('dragover-at', 'on');
			return;
		}

		var item = this.mCurrentDragOverItem;

		if (this.mDraggedItem == aEvent.target) {
			item.removeAttribute('dragover-at');
			return;
		}

		var pos = this.getDropPosition(aEvent);
		if (pos == this.DROP_BEFORE) {
			item.setAttribute('dragover-at', 'before');
		}
		else { //if (pos == this.DROP_AFTER) {
			item.setAttribute('dragover-at', 'after');
		}
	},
 
	onDragExit : function(aEvent, aSession) 
	{
		aEvent.target.removeAttribute('dragover-at');
	},
 
	getSupportedFlavours : function () 
	{
		var flavours = new FlavourSet();
		flavours.appendFlavour('ctxextensions/rdf-listitem');
		return flavours;
	},
 
	getDropPosition : function(aEvent) 
	{
		var box = aEvent.target.boxObject.QueryInterface(Components.interfaces.nsIBoxObject);
		var measure          = (box.height / 2),
			coordValue       = box.y,
			clientCoordValue = aEvent.clientY;

		if (clientCoordValue < (coordValue + measure))
			return this.DROP_BEFORE;
		else
			return this.DROP_AFTER;
	},
  
	destruct : function() 
	{
	}
};
  
window.addEventListener( 
	'load',
	function()
	{
		PrefUtils.init();
	},
	false
);
 
