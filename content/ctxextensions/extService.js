if (!('extProgressManagers' in window)) window.extProgressManagers = []; 
 
var ExtService = { 
	XHTMLNS : 'http://www.w3.org/1999/xhtml',
	XLinkNS : 'http://www.w3.org/1999/xlink',
	XULNS   : 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul',
	EXNS    : 'http://piro.sakura.ne.jp/ctxextensions',
	
	// 初期値の設定 
	activated : false,

	utils : ExtCommonUtils,

	message                  : {},
	downloadManagers         : [],

	duplicatingMPopup  : false,
	popupshowing       : false,

	userdefinedKeys : [],

	content      : 'chrome://ctxextensions/content/',
	locale       : 'chrome://ctxextensions/locale/',

	regexp :
	{
		link_next      : null,
		link_prev      : null,
		link_home      : null,
		link_contents  : null,
		link_index     : null,
		link_glossary  : null,
		link_copyright : null,
		link_appendix  : null,
		link_search    : null,
		link_help      : null
	},
 
//============================== Generic Values ===============================
// プロパティ 
	
	debug : false, 
 
	// 状態 
	
	// 現在のドキュメントのURIがHTTPスキームを含むかどうか 
	get isHTTP()
	{
		return (this.contextualURI().match(/^https?:\/\//));
	},
 
	// 現在のドキュメントがWebページかどうか（簡易） 
	get isWebPage()
	{
		var contentType = this.contentDocument().contentType;
		return contentType.match(/^(text|application)\/(xml|x?html)/);
	},
 
	// Mozillaがオンラインかどうか 
	get isOnline()
	{
		return !this.utils.IOService.offline;
	},
 
	get inFrame() 
	{
		return (this.contentWindow() != this.contentWindow(true));
	},
 
	get onLink() 
	{
		return !(!window.gContextMenu || !gContextMenu.onLink);
	},
 
	get canUp() 
	{
		var uri = this.currentURI();
		return (uri && (this.getCurrentDir(uri) != this.getParentDir(uri) || this.getCurrentDir(uri) != uri));
	},
 
	get hasNavigations() 
	{
		return ('navigations' in this.contentInfo() && this.contentInfo().navigations) ? this.contentInfo().navigations.length : null ;
	},
 
	get hasOutline() 
	{
		return ('headings' in this.contentInfo() && this.contentInfo().headings) ? this.contentInfo().headings.length : null ;
	},
 
	get hasRecieverForStr() 
	{
		return this.utils.evaluateXPath(
				'count(descendant::xul:menuitem[not(@hidden)])',
				document.getElementById('context-item-sendStr'),
				XPathResult.NUMBER_TYPE
			).numberValue;
	},
 
	get hasRecieverForURI() 
	{
		return this.utils.evaluateXPath(
				'count(descendant::xul:menuitem[not(@hidden)])',
				document.getElementById('context-item-sendURI'),
				XPathResult.NUMBER_TYPE
			).numberValue;
	},
 
	get hasCustomScripts() 
	{
		return this.utils.evaluateXPath(
				'count(descendant::xul:menuitem[not(@hidden)])',
				document.getElementById('context-item-customScripts'),
				XPathResult.NUMBER_TYPE
			).numberValue;
	},
 
	get hasExecApps() 
	{
		return this.utils.evaluateXPath(
				'count(descendant::xul:menuitem[not(@hidden)])',
				document.getElementById('context-item-execApps'),
				XPathResult.NUMBER_TYPE
			).numberValue;
	},
   
	// content 
	
	// 現在のフレームの内容を返す 
	// forceフラグがある場合又はフレームが見つからない場合、トップレベルのフレームを返す。
	
	contentWindow : function(aForce) 
	{
		var focusedWindow = document.commandDispatcher.focusedWindow;
		return (
				aForce ||
				!focusedWindow ||
				focusedWindow == window ||
				focusedWindow.top == window
			) ?
				this.utils.browser.contentWindow :
				focusedWindow ;
	},
 
	contentDocument : function(aForce) 
	{
		var focusedWindow = document.commandDispatcher.focusedWindow;
		return (
				aForce ||
				!focusedWindow ||
				focusedWindow == window ||
				focusedWindow.top == window
			) ?
				this.utils.browser.contentDocument :
				focusedWindow.document ;
	},
 
	currentURI : function(aForce) 
	{
		return this.contentDocument(aForce).defaultView.location.href;
	},
 
	contentInfo : function(aForce, aWindow) 
	{
		var d = (aWindow ? aWindow.document : this.contentDocument(aForce) );
		if (!d.__mozInfo__) d.__mozInfo__ = {};
		return d.__mozInfo__;
	},
  
	// リンクの上ではリンク先URI、それ以外の場合はドキュメントのURIを帰す 
	contextualURI : function(aForce, aWindow)
	{
		return (window.gContextMenu && gContextMenu.onLink && gContextMenu.link) ?
				(
					('getLinkURI' in gContextMenu) ? gContextMenu.linkURI.spec : // firefox 1.1 or later
					gContextMenu.linkURL() // firefox 1.0.x or before
				) :
				aWindow ? aWindow.location.href :
				this.currentURI(aForce) ;
	},
 
	getCiteForQuote : function() 
	{
		var node = this.utils.evaluateXPath(
					'ancestor-or-self::*['+
						'contains(concat(" ",local-name()," "), " q blockquote Q BLOCKQUOTE ") and '+
						'@cite and @cite != ""'+
					'][1]',
					document.popupNode,
					XPathResult.FIRST_ORDERED_NODE_TYPE
				).singleNodeValue;
		if (!node) return '';

		var cite = node.cite ||
				node.getAttribute('cite') ||
				node.getAttributeNS(this.XHTMLNS, 'cite') ||
				'';
		return this.utils.makeURIAbsolute(node.baseURI, cite);
	},
 
	getCiteForEdit : function() 
	{
		var node = this.utils.evaluateXPath(
					'ancestor-or-self::*['+
						'contains(concat(" ",local-name()," "), " del ins DEL INS ") and '+
						'@cite and @cite != ""'+
					'][1]',
					document.popupNode,
					XPathResult.FIRST_ORDERED_NODE_TYPE
				).singleNodeValue;
		if (!node) return '';

		var cite = node.cite ||
				node.getAttribute('cite') ||
				node.getAttributeNS(this.XHTMLNS, 'cite') ||
				'';
		return this.utils.makeURIAbsolute(node.baseURI, cite);
	},
 
	getLongdesc : function() 
	{
		var node = this.utils.evaluateXPath(
					'ancestor-or-self::*['+
						'contains(concat(" ",local-name()," "), " img IMG ") and '+
						'@longdesc and @longdesc != ""'+
					'][1]',
					document.popupNode,
					XPathResult.FIRST_ORDERED_NODE_TYPE
				).singleNodeValue;
		if (!node) return '';

		var longdesc = ('longdesc' in node && node.longdesc) ? node.longdesc :
				node.getAttribute('longdesc') ||
				node.getAttributeNS(this.XHTMLNS, 'longdesc') ||
				'';
		return this.utils.makeURIAbsolute(node.baseURI, longdesc);
	},
  
//================================ Initialize =================================
	// 初期化 
	init : function()
	{
		if (this.activated) return;
		this.activated = true;

		this.initApplicationMenu();

		var frameItems = [
				'context-item-sendURI-frame',
				'context-item-execApps-frame'
			];
		var framePopup = document.getElementById('frame');
		if (framePopup) {
			framePopup = framePopup.lastChild;
			var sep = framePopup.appendChild(document.createElement('menuseparator'));
			sep.setAttribute('class', 'menuseparator-ctxextensions');
			for (var i in frameItems)
				framePopup.appendChild(document.getElementById(frameItems[i]));
		}


		// ラベル文字列の初期化
		this.message =
		{
			comment   : this.utils.getMsg('show_label_comment'),
			href      : this.utils.getMsg('show_label_href'),
			longdesc  : this.utils.getMsg('show_label_longdesc'),
			id        : this.utils.getMsg('show_label_id'),
			name      : this.utils.getMsg('show_label_name'),
			cite      : this.utils.getMsg('show_label_cite'),
			cite_edit : this.utils.getMsg('show_label_cite_edit'),
			title     : this.utils.getMsg('show_label_title'),

			status_comment : this.utils.getMsg('show_status_comment'),
			status_link    : this.utils.getMsg('show_status_link'),
			status_id      : this.utils.getMsg('show_status_id'),
			status_cite    : this.utils.getMsg('show_status_cite'),
			status_title   : this.utils.getMsg('show_status_title'),
			status_event   : this.utils.getMsg('show_status_event'),

			status_initHeadings    : this.utils.getMsg('global_status_initHeadings'),
			status_initNavigations : this.utils.getMsg('global_status_initNavigations'),

			tempfile_loading : this.utils.getMsg('global_tempfile_loading'),

			unknown_host : this.utils.getMsg('global_unknown_host'),

			emptyItem : this.utils.getMsg('global_label_submenu_empty')
		};

		this.initMenu();          // 各メニューの初期化
		this.overrideFunctions(); // 標準の関数の上書き
		this.updateKey();
		this.updateRegExp();      // 正規表現の読み込み


		var context = this.utils.contextMenu;
		if (context)
			context.addEventListener('popupshowing', this, true);

		var content = document.getElementById('content');
		if (content) {
			window.addEventListener('fullscreen', this, false);
			content.addEventListener('keypress', this, true);
			content.addEventListener('mouseover', this, true);
			content.addEventListener('load', this, true);
			content.mTabContainer.addEventListener('TabClose', this, false);
		}

		// catch the event to start FindTypeAhead
		window.addEventListener('keypress', this, true);

		this.utils.addPrefListener(this.ShortcutPrefListener);
		this.utils.addPrefListener(this.RegexpPrefListener);
		this.utils.addPrefListener(this.UIPrefListener);

		window.setTimeout(function(aSelf) {
			aSelf.delayedInit();
		}, 0, this);
		window.setTimeout(function(aSelf) {
			aSelf.utils.datasource.AddObserver(aSelf.RDFObserver);
		}, 100, this);

		delete this.init;
		return;
	},
	delayedInit : function()
	{
		var i;

		this.rebuildExtraItems()


		// visibility of main menus
		var prefs = [
				'customScripts',
				'execApps',
				'getLinks',
				'JSPanel',
				'navigations',
				'nextHeading',
				'outline',
				'prevHeading',
				'sendStr',
				'sendURI',
				'showAll',
				'showCites',
				'showComments',
				'showEvents',
				'showIDs',
				'showLinks',
				'showTitles',
				'up'
			];
		for (i = 0; i < prefs.length; i++)
			this.showHideMenubarItem(prefs[i]);

		// autoexec on startup
		var runScripts = function() {
				var CSObj = this.utils.CUSTOMSCRIPTS,
					item,
					ret;
				if (!CSObj.length) return false;
				for (i = 0; i < CSObj.length; i++)
				{
					item = CSObj.item(i);
					if (CSObj.getData(item, 'Startup') == 'true')
						ret = ExtFunc.CustomScripts(CSObj.getData(item, 'Name'));
				}
				return true;
			};
		var count = 0;
		if (!runScripts.call(this))
			window.setTimeout(function(aSelf) {
				count++;
				if (!runScripts.call(aSelf) && count < 10)
					window.setTimeout(arguments.callee, 10, aSelf);
			}, 10, this);
	},
	destroy : function()
	{
		// 設定の監視を解除
		this.utils.removePrefListener(this.ShortcutPrefListener);
		this.utils.removePrefListener(this.RegexpPrefListener);
		this.utils.removePrefListener(this.UIPrefListener);

		var dsource = this.utils.datasource;
		dsource.RemoveObserver(this.RDFObserver);

		// イベントリスナーの登録を解除
		if (this.utils.contextMenu)
			this.utils.contextMenu.removeEventListener('popupshowing', this, true);

		var content = document.getElementById('content');
		if (content) {
			window.removeEventListener('fullscreen', this, false);
			content.removeEventListener('keypress', this, true);
			content.removeEventListener('mouseover', this, true);
			content.removeEventListener('load', this, true);
			content.mTabContainer.removeEventListener('TabClose', this, false);
		}

		window.removeEventListener('keypress', this, true);
	},
	
	// メニューの初期化 
	initMenu : function()
	{
		this.rebuildExecApps();
		this.rebuildCustomScripts();
		this.rebuildSendStr();
		this.rebuildSendURI();

		// メニューの最大幅を設定
		var style_value;
		style_value = 'max-width:'+this.utils.getPref('ctxextensions.width.navigations')+'em;';
		this.insertAttribute('ext-common-navigationsSelect:mpopup', 'style', style_value);
		this.insertAttribute('ext-common-navigations:mpopup', 'style', style_value);
		this.insertAttribute('menu-item-navigations:mpopup', 'style', style_value);
		this.insertAttribute('menu-item-navigations:mpopup:submenu', 'style', style_value);
		this.insertAttribute('appmenu-item-navigations:mpopup', 'style', style_value);
		this.insertAttribute('appmenu-item-navigations:mpopup:submenu', 'style', style_value);
		this.insertAttribute('context-item-navigations:mpopup', 'style', style_value);
		this.insertAttribute('context-item-navigations:mpopup:submenu', 'style', style_value);

		style_value = 'max-width:'+this.utils.getPref('ctxextensions.width.outline')+'em;';
		this.insertAttribute('ext-common-outline:mpopup', 'style', style_value);
		this.insertAttribute('menu-item-outline:mpopup', 'style', style_value);
		this.insertAttribute('menu-item-outline:mpopup:submenu', 'style', style_value);
		this.insertAttribute('appmenu-item-outline:mpopup', 'style', style_value);
		this.insertAttribute('appmenu-item-outline:mpopup:submenu', 'style', style_value);
		this.insertAttribute('context-item-outline:mpopup', 'style', style_value);
		this.insertAttribute('context-item-outline:mpopup:submenu', 'style', style_value);



		// キーボードショートカットからポップアップを開くキーボードショートカットの設定
		var menubar = document.getElementById('main-menubar');
		if (menubar) {
			var menu    = menubar.childNodes,
				keyset  = document.getElementById('ext-key-showMenu:menu'),
				key;
			for (var i = 0; i < menu.length; i++)
			{
				if (!menu[i].localName || menu[i].localName != 'menu' || !menu[i].getAttribute('accesskey')) continue;
				key = document.createElement('key');
				key.setAttribute('id', 'ext-key-showMenu:menu:'+i);
				key.setAttribute('observes', 'ext-broadcaster-key:showMenu:menu');
				key.setAttribute('key', menu[i].getAttribute('accesskey'));
				key.setAttribute('modifiers', 'alt');
				key.setAttribute('disabled', true);
				key.setAttribute('oncommand', 'if (!window.fullScreen) return; FullScreen.showXULChrome(\'menubar\', window.fullScreen); ExtFunc.showMenu(this);');
				keyset.appendChild(key);

				this.appendAttribute(menu[i].lastChild, 'onpopuphiding',
					';if (event.target == this && window.fullScreen) FullScreen.showXULChrome(\'menubar\', !window.fullScreen);');
			}
		}

		delete this.initMenu;
	},
 
	initApplicationMenu : function() 
	{
		var button = document.getElementById('appmenu-button');
		if (!button) return;

		var menubar = document.getElementById('main-menubar');

		var fragment = document.createDocumentFragment();
		Array.slice(menubar.getElementsByAttribute('ctxextensions-item', '*'))
			.forEach(function(aItem) {
				if (aItem.parentNode == menubar)
					fragment.appendChild(aItem.cloneNode(true));
			});

		var updateID = function(aNodes) {
				Array.slice(aNodes).forEach(function(aNode) {
					if (aNode.hasAttribute('id'))
						aNode.setAttribute('id', 'app'+aNode.getAttribute('id'));
					if (aNode.hasChildNodes())
						updateID(aNode.childNodes);
				});
			};
		updateID(fragment.childNodes)

		button.firstChild.insertBefore(fragment, document.getElementById('appmenu_openHelp').nextSibling);
	},
 
	// 標準の関数の上書き 
	overrideFunctions : function()
	{

		// 内容領域をクリックした際の処理
		window.__ctxextensions__contentAreaClick = window.contentAreaClick;
		window.contentAreaClick = function(aEvent, aFieldNormalClicks)
		{
			if (
				aEvent.type != 'keypress' ||
				aEvent.keyCode == aEvent.DOM_VK_ENTER ||
				aEvent.keyCode == aEvent.DOM_VK_RETURN
				)
				return __ctxextensions__contentAreaClick(aEvent, aFieldNormalClicks);

			return false;
		};

		// フルスクリーンモードからの復帰
		if (window.BrowserFullScreen) {
			window.__ctxextensions__BrowserFullScreen = window.BrowserFullScreen;
			window.BrowserFullScreen = function()
			{
				window.__ctxextensions__BrowserFullScreen();
				ExtFunc.toggleMenubar();
				return;
			};
		}

		delete this.overrideFunctions;
		return;
	},
 
	handleEvent : function(aEvent) 
	{
		switch (aEvent.type)
		{
			case 'popupshowing':
				if (aEvent.target == this.utils.contextMenu)
					this.updateContextMenu(aEvent.target);
				return;

			case 'fullscreen':
				this.onFullScreen(aEvent);
				return;

			case 'keypress':
				if (aEvent.currentTarget == window) {
					this.onKeyPress(aEvent);
				}
				else {
					window.contentAreaClick(aEvent);
				}
				return;

			case 'mouseover':
				this.onMouseOver(aEvent);
				return;

			case 'load':
				if (aEvent.currentTarget == window) {
					window.removeEventListener('load', this, false);
					this.init();
				}
				else {
					this.onContentLoad(aEvent);
				}
				return;

			case 'unload':
				window.removeEventListener('unload', this, false);
				this.destroy();
				return;

			case 'TabClose':
				this.onTabRemoved(aEvent);
				return;
		}
	},
	
	onContentLoad : function(aEvent) 
	{
		var w = aEvent.originalTarget;
		if (w.defaultView) w = w.defaultView;
		if (!w.document) return;

		try {
			if (ExtCommonUtils.getPref('ctxextensions.scan_outline_in_background.enable'))
				ExtService.updateHeadings(w, true);
			if (ExtCommonUtils.getPref('ctxextensions.scan_navigations_in_background.enable'))
				ExtService.updateNavigations(w, true);

			ExtFunc.AutoExecShow(w);
			ExtFunc.AutoExecCS(w);
		}
		catch(e) {
			if (ExtService.debug) alert('OnFinish:\n\n'+e);
		}

		function setReadyState(aWindow) {
			aWindow.ctxextensionsDocumentReadyState = 'complete';
			aWindow.document.ctxextensionsReadyState = 'complete';

			if ('frames' in aWindow && aWindow.frames.length)
				for (var i = 0; i < aWindow.frames.length; i++)
					setReadyState(aWindow.frames[i]);
		}
		setReadyState(w);
	},
 
	// 要素がポイントされた際の処理 
	onMouseOver : function(aEvent)
	{
		// citeの内容をステータスバーに表示
		if (!this.utils.getPref('ctxextensions.enable.cite_as_href')) return false;

		var target = this.utils.evaluateXPath(
				'ancestor-or-self::*['+
					'contains(concat(" ",local-name()," "), " q blockquote ins del Q BLOCKQUOTE INS DEL ")'+
				'][1]',
				aEvent.target,
				XPathResult.FIRST_ORDERED_NODE_TYPE
			).singleNodeValue;
		if (target &&
			target.cite && !('ex_onmouseout' in target)) {
			window.status       = target.cite;
			target.style.cursor = 'pointer';
			target.addEventListener('mouseover', this.onMouseOverSetStatus, true);
			target.addEventListener('mouseout', this.onMouseOutRemoveStatus, true);
			target.ex_onmouseout = true;
		}
		return true;
	},
	
	onMouseOverSetStatus : function() 
	{
		window.status = this.cite;
	},
 
	onMouseOutRemoveStatus : function() 
	{
		window.status = window.defaultStatus;
	},
  
	onFullScreen : function(aEvent) 
	{
		window.setTimeout(function(aSelf) {
			var items = [
					'customScripts',
					'execApps',
					'getLinks',
					'JSPanel',
					'navigations',
					'nextHeading',
					'outline',
					'prevHeading',
					'sendStr',
					'sendURI',
					'showAll',
					'showCites',
					'showComments',
					'showEvents',
					'showIDs',
					'showLinks',
					'showTitles',
					'up'
				];
			for (var i in items)
				aSelf.showHideMenubarItem(items[i]);
		}, 0, this);
	},
 
	// タブを閉じるときに、エラーの元になりそうなものは後始末しておく。 
	onTabRemoved : function(aEvent)
	{
		var b = this.getTabBrowserFromChild(aEvent.currentTarget);
		b = b.getBrowserForTab(aEvent.originalTarget);
		var managers = [
				'headingsManager',
				'navigationsManager',
				'showInvisibleInfoForComments',
				'showInvisibleInfoForLinks',
				'showInvisibleInfoForIDs',
				'showInvisibleInfoForCites',
				'showInvisibleInfoForTitles',
				'showInvisibleInfoForEvents'
			];
		for (var i in managers)
			if (managers[i] in b && b[managers[i]]) {
				b[managers[i]].stop();
				b[managers[i]].walker = null;
				b[managers[i]] = null;
			}
	},
   
	// Utilities 
	
	getTabBrowserFromChild : function(aTab) 
	{
		var b = aTab.ownerDocument.evaluate(
				'ancestor-or-self::*[local-name()="tabbrowser"] | '+
				'ancestor-or-self::*[local-name()="tabs" and @tabbrowser]',
				aTab,
				null,
				XPathResult.FIRST_ORDERED_NODE_TYPE,
				null
			).singleNodeValue;
		return (b && b.tabbrowser) || b;
	},
 
	// URIからディレクトリを抜き出す 
	getCurrentDir : function(aURI)
	{
		return this.utils.getCurrentDir(aURI || this.currentURI());
	},
	
	// URIから親ディレクトリを抜き出す 
	getParentDir : function(aURI)
	{
		return this.utils.getParentDir(aURI || this.currentURI());
	},
 
	// 親ディレクトリをルートまで辿り、配列として返す 
	getParentDirs : function(aURI)
	{
		return this.utils.getParentDirs(aURI || this.currentURI());
	},
  
	// filepathで指定されたアプリケーションを、argsを引数として起動する 
	run : function(aFilepath, aArgs)
	{
		// 渡された引数が配列の形になっていない場合の処理
		if (!aArgs) aArgs = '';
		if (aArgs.constructor != Array) {
			var tmp_arg    = aArgs.toString().split(/ +/),
				inner_quot = false,
				tmp_value;

			aArgs = [];
			for (var i in tmp_arg)
			{
				tmp_arg[i] = tmp_arg[i].replace(/"([^"]*)"/g, '$1');

				if (tmp_arg[i].charAt(0) != '"' && !inner_quot) aArgs.push(tmp_arg[i]);

				if (inner_quot) {
					tmp_value = tmp_value+' '+tmp_arg[i];
					if (tmp_value.charAt(tmp_value.length-1) == '"') {
						aArgs.push(tmp_value.substring(0, tmp_value.length-1));
						inner_quot = false;
					}
				}
				if (tmp_arg[i].charAt(0) == '"') {
					inner_quot = true;
					tmp_value = tmp_arg[i].substring(1, tmp_arg[i].length);
				}
			}
		}

		var app = this.utils.makeFileWithPath(aFilepath);
		var process = Components.classes['@mozilla.org/process/util;1']
						.createInstance(Components.interfaces.nsIProcess);
		process.init(app);
		process.run(false, aArgs, aArgs.length, {});
		return process;
	},
 
	// カスタムスクリプトなどのインデックスからIDを返す 
	getIDFromIndex : function(aIDOrIndex, aObjID)
	{
		if (typeof aIDOrIndex == 'number')
			aIDOrIndex = this.utils[aObjID].getData(this.utils[aObjID].item(aIDOrIndex), 'Name');
		return aIDOrIndex;
	},
 
	// リンクタイプを示す文字列を返す 
	getLinkType : function(aLinkNode)
	{
		var rel = ExtService.getAttributeOfLink(aLinkNode, 'rel');
		var rev = ExtService.getAttributeOfLink(aLinkNode, 'rev');
		var linktype = rel || rev ;
		var useRev   = !rel && rev ;

		if (!linktype || !linktype.replace(/\s/g, '')) return '';

		linktype = linktype.toLowerCase()
					.replace(/alternate\s+stylesheet/g, 'alternatestylesheet')
					.replace(/(shortcut\s+)?icon|icon/g, 'shortcuticon')
					.split(/ +/);

		var i,
			tmp_str,
			linktypeStr = [];

		for (i in linktype)
		{
			if (!linktype[i]) continue;
			if (useRev) linktype[i] = 'rev_'+linktype[i];
			tmp_str = this.utils.getMsg('link_'+linktype[i]);

			if (!tmp_str) tmp_str = linktype[i].replace(/^rev_/, 'rev:');

			linktypeStr.push(tmp_str);
		}

		return (linktypeStr.length) ? this.utils.getMsg('link_linktype').replace(/%l/i, linktypeStr.join('/')) :
			(aLinkNode.rel) ? this.utils.getMsg('link_rel').replace(/%l/i, rel) :
			(aLinkNode.rev) ? this.utils.getMsg('link_rev').replace(/%l/i, rev) :
			this.utils.getMsg('link') ;
	},
	
	// リンクタイプを揃える 
	formatLinkType : function(aLinktype)
	{
		if (!aLinktype) return '';
		switch (aLinktype.toLowerCase())
		{
			case 'home':
			case 'start':
			case 'top':
			case 'origin':
				return 'top';

			case 'up':
			case 'parent':
				return 'up';

			case 'begin':
			case 'first':
				return 'first';

			case 'next':
			case 'child':
				return 'next';

			case 'prev':
			case 'previous':
				return 'prev';

			case 'end':
			case 'last':
				return 'last';

			case 'author':
			case 'made':
				return 'author';

			case 'contents':
			case 'toc':
				return 'toc';

			default:
				return aLinktype.toLowerCase();
		}
	},
	
	// rev > rel の変換テーブル 
	revLinkType :
	{
		next       : 'prev',
		prev       : 'next',
		previous   : 'next',

		home       : 'child',
		start      : 'child',
		top        : 'child',
		origin     : 'child',

		up         : 'child',
		parent     : 'child',
		contents   : 'child',
		toc        : 'child',
		index      : 'child',

		begin      : 'next',
		first      : 'next',

		end        : 'last',
		last       : 'prev',

		child      : 'parent',

		help       : 'parent',
		glossary   : 'parent',

		chapter    : 'parent',
		section    : 'parent',
		subsection : 'parent'
	},
  
	// リンク先URIからリンクタイプを推測する 
	conjectureLinkType : function(aLinkNode, aCurrentPageNum)
	{
		var href = ExtService.getAttributeOfLink(aLinkNode, 'href');
		var uri;
		try {
			uri = Components.lookupMethod(aLinkNode.ownerDocument, 'URL').call(aLinkNode.ownerDocument);
		}
		catch(e) {
			uri = aLinkNode.baseURI;
		}

		var parents = this.getParentDirs(uri),
			dir     = this.getCurrentDir(href);

		if (!dir ||
			href.split('#')[0] == uri.split('#')[0] ||
			(dir.indexOf(parents[0]) < 0 && parents[0].indexOf(dir) < 0)) return '';

		var content = aLinkNode.textContent;

		var num     = this.utils.getNumberFromString(content),
			navDir  = 0; // +1 = next, -1 = prev
		if (num === void(0))
			num = this.utils.getNumberFromString(this.getAttributeOfLink(aLinkNode, 'title'));
		if (aCurrentPageNum !== void(0) && num !== void(0)) {
			if (aCurrentPageNum > num)
				navDir--;
			else if (aCurrentPageNum < num)
				navDir++;
		}


		content = this.utils.getHalfWidthStrings(content).toLowerCase();

		var f_contents = href.match(/\/((index|contents|mokuj?z?i).*)?$/),
			f_root     = (dir == parents[parents.length-1]);

		var type = (navDir > 0 || content.match(this.regexp.link_next)) ? ' next' :
					(navDir < 0 || content.match(this.regexp.link_prev)) ? ' prev' :
					'' ;

		type += (f_root && f_contents && content.match(this.regexp.link_home)) ? ' up home' :
				(!f_root && f_contents && content.match(this.regexp.link_contents)) ? ' up contents' :
				(content.match(this.regexp.link_index)) ? ' index' :
				(content.match(this.regexp.link_glossary)) ? ' glossary' :
				(content.match(this.regexp.link_copyright)) ? ' copyright' :
				(content.match(this.regexp.link_appendix)) ? ' appendix' :
				(content.match(this.regexp.link_help)) ? ' help' :
				(content.match(this.regexp.link_search)) ? ' search' :
				(dir == parents[0]) ? '' :
				(dir.indexOf(parents[0]) > -1) ? ' child' : ' parent' ;

		return type;
	},
  
	getAttributeOfLink : function(aNode, aAttr) 
	{
		try {
			return (aAttr in aNode && aNode[aAttr]) ? aNode[aAttr] :
					aNode.getAttributeNS(this.XLinkNS, aAttr) ||
					aNode.getAttributeNS(this.XHTMLNS, aAttr) ||
					aNode.getAttribute(aAttr);
		}
		catch(e) {
		}
		return aNode.getAttributeNS(this.XLinkNS, aAttr) ||
				aNode.getAttributeNS(this.XHTMLNS, aAttr) ||
				aNode.getAttribute(aAttr);
	},
 
	// イベントがキーボード関係で且つテキストフォーム関係から送られたかどうか 
	// フォーム内でキーを単独で押したり、Shift+キーだけだったりした場合は、falseを返す。
	isEventSentFromTextFields : function(aEvent)
	{
	//	return (aEvent && /textbox|input|textarea|menulist|select/i.test(aEvent.target.localName));
		return (
				aEvent &&
				(aEvent.type == 'keypress' || aEvent.type == 'input') &&
				!aEvent.ctrlKey &&
				!aEvent.altKey &&
				!aEvent.metaKey &&
				/textbox|input|textarea|menulist|select/i.test((document.commandDispatcher.focusedElement || aEvent.target).localName)
				);
	},
 
	// Find Type Ahead (Find As You Type) 
	onFindTypeAheadActive : function()
	{
		if (!this.findTypeAheadTimer) {
			this.updateKey(false);
			this.findTypeAheadTimer = window.setInterval(this.findTypeAheadTimerCallback, 50);
		}
	},

	findTypeAheadTimerCallback : function()
	{
		if (ExtService.isFindTypeAheadActive()) return;

		window.clearInterval(ExtService.findTypeAheadTimer);
		ExtService.findTypeAheadTimer = null;
		ExtService.updateKey();
	},
	findTypeAheadTimer : null,

	isFindTypeAheadActive : function()
	{
		var activated = 'isXMigemoActive' in window ? isXMigemoActive : false ;
		try {
			return this.nsITypeAheadFind.isActive || activated;
		}
		catch(e) {
		}

		return activated;
	},
	get nsITypeAheadFind()
	{
		if (!this._nsITypeAheadFind)
			this._nsITypeAheadFind = Components.classes['@mozilla.org/typeaheadfind;1'].getService(Components.interfaces.nsITypeAheadFind);
		return this._nsITypeAheadFind;
	},
	_nsITypeAheadFind : null,

	onKeyPress : function(aEvent)
	{
		var node,
			keys = ['key_findTypeText', 'key_findTypeLinks'],
			data,
			key,
			keycode;

		for (var i in keys)
		{
			if (!(node = document.getElementById(keys[i]))) { // Firefox or Old Builds
				key = (keys[i] == 'key_findTypeText') ? '/' :
					(keys[i] == 'key_findTypeLinks') ? '\'' :
					'';
				keycode = '';
				data = ExtCommonUtils.getAccelText({
						key       : key,
						keyCode   : '',
						modifiers : ''
					}, true);
			}
			else {
				key     = node.getAttribute('key');
				keycode = node.getAttribute('keycode');
				data = ExtCommonUtils.getAccelText({
						key       : key,
						keyCode   : keycode,
						modifiers : node.getAttribute('modifiers')
					}, true);
			}

			if (
				(
				String.fromCharCode(aEvent.charCode).toUpperCase() == key.toUpperCase() ||
				aEvent.keyCode == aEvent['DOM_'+keycode.toUpperCase()]
				) &&
//				aEvent.shiftKey == data.shiftKey && // ['] needs ShiftKey to be pressed...
				aEvent.altKey == data.altKey &&
				aEvent.metaKey == data.metaKey &&
				aEvent.ctrlKey == data.ctrlKey &&
				!ExtService.isEventSentFromTextFields(aEvent)
				)
				ExtService.onFindTypeAheadActive();
		}
	},
 
	// 文書の操作 
	
	// 選択文字列を得る 
	getSelection : function(aWindow)
	{
		var targetWindow = aWindow || this.contentWindow();
		var sel = Components.lookupMethod(targetWindow, 'getSelection').call(targetWindow)

try {
		// for textfields
		if (sel && !sel.toString()) {
			var node = document.commandDispatcher.focusedElement;
			if (node &&
				'selectionStart' in node &&
				node.selectionStart != node.selectionEnd) {
				var offsetStart = Math.min(node.selectionStart, node.selectionEnd);
				var offsetEnd   = Math.max(node.selectionStart, node.selectionEnd);
				return node.value.substr(offsetStart, offsetEnd-offsetStart);
			}
		}
}
catch(e) {
		return '';
}

		return sel ? sel.toString() : '' ;
	},
	
	getSelectionSource : function(aWindow, aFormat, aUseAllEntities) 
	{
		var targetWindow = aWindow || this.contentWindow();

		var selection = Components.lookupMethod(targetWindow, 'getSelection').call(targetWindow);
		var pSelection = selection.QueryInterface(Components.interfaces.nsISelectionPrivate),
			cType      = Components.lookupMethod(targetWindow, 'document').call(targetWindow).contentType,
			ret;

		if (!pSelection) return '';

		// flags are defined in the code:
		// http://lxr.mozilla.org/mozilla/source/content/base/public/nsIDocumentEncoder.h
		// http://mxr.mozilla.org/mozilla-central/source/content/base/public/nsIDocumentEncoder.idl
		// 128 = make links absolute
		// 256 = use all entities
		// 16384 = use only basic entities
		// 32768 = use only latin1 entities
		// 65536 = use only HTML entities
		var flag = aUseAllEntities ? 256 : 16384+32768+65536 ;
		try {
			ret = pSelection.toStringWithFormat(aFormat || cType, 128+flag, 0);
		}
		catch(e) {
			ret = pSelection.toStringWithFormat('text/xml', 128+flag, 0);
		}
		return ret.replace(/ _moz-userdefined="[^"]*"/g, '');
	},
  
	// リンク先URIとリンクの要素の配列を得る（正規表現でフィルタリング） 
	getLinksArray : function(aRegExp, aWindow, aShouldFollowFrames)
	{
		var user_condition = aRegExp;

		if (!user_condition) {
			var data = { value : this.utils.getPref('ctxextensions.history.regexp.getLinks') };
			if (!this.utils.PromptService.prompt(
					window,
					this.utils.getMsg((this.getSelection() ? 'getLinks_inputRegExp_title_select' : this.inFrame ? 'getLinks_inputRegExp_title_frame' : 'getLinks_inputRegExp_title_normal')),
					this.utils.getMsg('getLinks_inputRegExp'),
					data,
					null,
					{}
				)) return [];

			user_condition = data.value;
			this.utils.setPref('ctxextensions.history.regexp.getLinks', user_condition);

			if (!user_condition) user_condition = '.';
		}

		var w     = aWindow || this.contentWindow();
		var sel   = this.utils.getSelectionNodes(),
			condition = this.utils.makeRegExp(user_condition),
			i, j;

		var links = [];

		if (sel.length &&
			sel[0].ownerDocument == w.document) {
			for (i = 0; i < sel.length; i++)
				if (sel[i].nodeType == Node.ELEMENT_NODE &&
					sel[i].localName.toLowerCase().match(/^(a|area|link)$/) &&
					(!sel[i].namespaceURI || sel[i].namespaceURI == this.XHTMLNS))
					links.push(sel[i]);
		}
		else
			links = this.getLinksNodesInWindow(w, aShouldFollowFrames);

		var literalsInEvent,
			getOnClickEvent = this.utils.getPref('ctxextensions.enable.getLinks_collectOnClick');

		var uris    = {},
			uri,
			results = [];

		for (i in links)
		{
			uri = links[i].href;
			if (uri && uri.match(condition) && !(uri in uris)) {
				uris[uri] = true;
				results[results.length] = { node : links[i], uri : uri };
			}

			if (!getOnClickEvent) continue;

			literalsInEvent = links[i].getAttribute('onclick');
			if (!literalsInEvent) continue;

			literalsInEvent = literalsInEvent.match(/(['"])[^'"]*\1/g);
			if (!literalsInEvent) continue;
			for (j in literalsInEvent)
			{
				uri = literalsInEvent[j];
				uri = uri.replace(/^['"]|['"]$/g, '').match(/([-+a-z0-9.]+:\/\/|[-a-z0-9]+(\.[-a-z0-9]+)+)[-_.!~*'()a-z0-9;\/?:\@&=+\$,%#]+/ig);
				if (uri && uri[0].match(condition) && !(uri[0] in uris)) {
					uris[uri[0]] = true;
					results[results.length] = { node : links[i], uri : uri[0] };
				}
			}
		}

		return results;
	},

	getLinksNodesInWindow : function(aWindow, aShouldFollowFrames)
	{
		var links = [].concat(
				Array.slice(aWindow.document.getElementsByTagName('A')),
				Array.slice(aWindow.document.getElementsByTagName('AREA')),
				Array.slice(aWindow.document.getElementsByTagName('LINK')),
				Array.slice(aWindow.document.getElementsByTagName(this.XHTMLNS, 'a')),
				Array.slice(aWindow.document.getElementsByTagName(this.XHTMLNS, 'area')),
				Array.slice(aWindow.document.getElementsByTagName(this.XHTMLNS, 'link'))
			);
		if (aShouldFollowFrames &&
			aWindow.frames &&
			aWindow.frames.length)
			for (var i = 0; i < aWindow.frames.length; i++)
				links = links.concat(this.getLinksNodesInWindow(aWindow.frames[i], true));

		return links;
	},
  
	// XULの操作 
	
	// 指定したdocumentオブジェクトをcontentDocumentとして保持しているブラウザを返す 
	getBrowserForDocument : function(aDocument)
	{
		var b = this.utils.browser;
		if (!b)
			return null;
		else if (b.localName == 'browser')
			return b;

		var browsers = b.browsers;
		var current  = b.mCurrentBrowser;
		for (var i = 0; i < browsers.length; i++)
			if (browsers[i].contentDocument == aDocument) current = browsers[i];

		return current;
	},
 
	// 指定のidを持つ要素をflagに従い有効にする 
	setEnable : function(aIDOrNode, aFlag)
	{
		try {
			var str = (aFlag) ? 'false' : 'true' ;
			var node = aIDOrNode;
			if (typeof aIDOrNode == 'string')
				node = document.getElementById(aIDOrNode);

			if (!node) return;

			if (str)
				node.setAttribute('disabled', str);
			else
				nore.removeAttribute('disabled');
		}
		catch(e) { alert(e+'\n\n'+aIDOrNode); }
	},
 
	// 指定のidを持つ要素をflagに従い表示する 
	setVisible : function(aIDOrNode, aFlag)
	{
		try {
			var node = aIDOrNode;
			if (typeof aIDOrNode == 'string')
				node = document.getElementById(aIDOrNode);

			if (node)
				node.hidden = !aFlag;
		}
		catch(e) { alert(e+'\n\n'+aIDOrNode); }
	},
 
	// 指定のidを持つ要素のラベルを変更する 
	setLabel : function(aIDOrNode, aLabel)
	{
		try {
			var node = aIDOrNode;
			if (typeof aIDOrNode == 'string')
				node = document.getElementById(aIDOrNode);

			if (node)
				node.setAttribute('label', aLabel);
		}
		catch(e) { alert(e+'\n\n'+aIDOrNode); }
	},
 
	// 指定のidを持つ要素の属性値を得る 
	getAttribute : function(aIDOrNode, aAttr)
	{
	//	return elem.getAttributeNS(this.EXNS, attrname);
		try {
			var node = aIDOrNode;
			if (typeof aIDOrNode == 'string')
				node = document.getElementById(aIDOrNode);

			return node.getAttribute('ex-'+aAttr);
		}
		catch(e) { alert(e+'\n\n'+aIDOrNode); }

		return null;
	},
 
	// 指定のidを持つ要素に属性値を挿入する 
	insertAttribute : function(aTarget, aAttr, aValue)
	{
		aTarget = (aTarget.localName) ? aTarget : document.getElementById(aTarget) ;
		if (aTarget) aTarget.setAttribute(aAttr, aValue + aTarget.getAttribute(aAttr));
	},
 
	// 指定のidを持つ要素に属性値を追加する 
	appendAttribute : function(aTarget, aAttr, aValue)
	{
		aTarget = (aTarget.localName) ? aTarget : document.getElementById(aTarget) ;
		if (aTarget) aTarget.setAttribute(aAttr, aTarget.getAttribute(aAttr) + aValue);
	},
 
	// ポップアップメニューを複製する 
	duplicateMPopup : function(aFrom, aTo)
	{
		var node_from = document.getElementById(aFrom),
			node_to   = document.getElementById(aTo);

		if (!node_from.childNodes.length) return true;

		var range = document.createRange();

		range.selectNodeContents(node_to);
		range.deleteContents();
		range.selectNodeContents(node_from);
		node_to.appendChild(range.cloneContents());

		range.detach();

		return true;
	},
 
	// ポップアップを表示 
	showPopup : function(aPopup, aX, aY, aParent)
	{
		if (!aPopup) return null;

		var x = parseInt(aX),
			y = parseInt(aY);
		if (!aParent) aParent = aPopup.parentNode;

		aPopup.autoPosition = true;
		aPopup.showPopup(aParent, x, y, 'popup', null, null);

		// 場所がズレる場合があるので、エラー処理。
		if (aPopup.parentNode.localName != 'menu' &&
			(aPopup.popupBoxObject.screenX != x ||
			aPopup.popupBoxObject.screenY != y)) aPopup.moveTo(x, y);

		return aPopup;
	},
  
	// URIを読み込む 
	
	// URIを読み込む 
	// フレーム内で実行した場合、フレームを解除して読み込む。
	// bypassは、MozillaのセキュリティをバイパスしてURIを読み込むフラグ。
	loadURI : function(aURI, aReferrer, aOpenIn, aShouldBypassSecurity)
	{
		if (typeof aReferrer == 'string')
			aReferrer = this.utils.makeURIFromSpec(aReferrer);

		if (!this.utils.isBrowser) { // Thunderbird
			this.utils.openURIInExternalApp(aURI);
			return null;
		}

		if (this.utils.mainWindow &&
			(
				!aOpenIn ||
				this.utils.mainWindow.ExtService.currentURI(true) == 'about:blank' ||
				(
					aURI.split('#')[0] == this.currentURI(true).split('#')[0] &&
					!this.utils.getPref('ctxextensions.showResultIn.forceNewWindowOrTab')
				)
			)
			) {
			this.utils.mainWindow.loadURI(aURI, aReferrer);
			var b = this.utils.browser;
			if ('selectedTab' in b)
				b = b.getBrowserForTab(b.selectedTab);
			return b;
		}
		else if (!this.utils.mainWindow || aOpenIn == this.NEW_WINDOW) {
			return this.openNewWindow(aURI, aReferrer);
		}
		else {
			var t = this.openNewTab(aURI, aReferrer, aShouldBypassSecurity);
			if (aOpenIn ? aOpenIn != this.NEW_BG_TAB : !this.utils.getPref('browser.tabs.loadInBackground') )
				this.utils.browser.selectedTab = t;

			return t;
		}
	},
	CURRENT_TAB : 0,
	NEW_TAB     : 10,
	NEW_BG_TAB  : 11,
	NEW_WINDOW  : 20,
 
	openNewWindow : function(aURI, aReferrer) 
	{
		if (!this.utils.isBrowser) { // Thunderbird
			this.utils.openURIInExternalApp(aURI);
			return null;
		}

		if (typeof aReferrer == 'string')
			aReferrer = this.utils.makeURIFromSpec(aReferrer);

		return window.openDialog(this.utils.mainURI, '_blank', 'chrome,all,dialog=no', aURI, null, aReferrer);
	},
 
	// 新規タブで読み込む 
	openNewTab : function(aURI, aReferrer, aShouldBypassSecurity)
	{
		if (!this.utils.isBrowser) { // Thunderbird
			this.utils.openURIInExternalApp(aURI);
			return null;
		}

		if (typeof aReferrer == 'string')
			aReferrer = this.utils.makeURIFromSpec(aReferrer);

		if (!this.utils.mainWindow)
			return this.openNewWindow(aURI, aReferrer);

		var b = this.utils.mainWindow.ExtCommonUtils.browser;
		var newTab = b.addTab(aURI, aReferrer);
		return newTab;
	},
 
	// 読み込み完了後に処理を行う 
	doAfterLoaded : function(aBrowserOrTabOrXULWindow, aURI, aCallBackFuncs)
	{
		if (!aBrowserOrTabOrXULWindow || !aCallBackFuncs) return;

		if (aCallBackFuncs.constructor == Function)
			aCallBackFuncs = [aCallBackFuncs];

		var w;
		if (!('localName' in aBrowserOrTabOrXULWindow) ||
			(aBrowserOrTabOrXULWindow.localName != 'browser' &&
			aBrowserOrTabOrXULWindow.localName != 'tab'))
			w = aBrowserOrTabOrXULWindow;
		else
			w = aBrowserOrTabOrXULWindow.ownerDocument.defaultView;

		if (!('extProgressManagers' in w))
			w.extProgressManagers = [];

		var progress = new pProgressManager(this.doAfterLoadedObserver, 50);

		w.extProgressManagers[w.extProgressManagers.length] = progress;

		progress.appendItem(w.extProgressManagers.length-1, aURI, aBrowserOrTabOrXULWindow, aCallBackFuncs, w);
		progress.start();
	},
	
	doAfterLoadedObserver : 
	{
		onProgress : function(aManager, aManagerIndex, aURI, aBrowserOrTabOrXULWindow, aCallBackFuncs, aXULWindow)
		{
			var b;
			if ('localName' in aBrowserOrTabOrXULWindow &&
				aBrowserOrTabOrXULWindow.localName == 'browser')
				b = aBrowserOrTabOrXULWindow;
			else if ('localName' in aBrowserOrTabOrXULWindow &&
				aBrowserOrTabOrXULWindow.localName == 'tab')
				b = ExtCommonUtils.browser.getBrowserForTab(aBrowserOrTabOrXULWindow);
			else {
				if (!('ExtCommonUtils' in aXULWindow) ||
					!aXULWindow.ExtCommonUtils.activated)
					return false;

				b = aXULWindow.ExtCommonUtils.browser;
				if ('selectedTab' in b)
					b = b.getBrowserForTab(b.selectedTab);
			}

			try {
				if (
					!b.contentWindow ||
					!('ctxextensionsDocumentReadyState' in b.contentWindow) ||
					b.contentWindow.ctxextensionsDocumentReadyState != 'complete' ||
					(aURI != 'about:blank' && b.currentURI.spec == 'about:blank') // for tab
					)
					return false;
			}
			catch(e) { // when fail to access "contentWindow"
				return false;
			}

			var w = b.ownerDocument.defaultView

			// for custom scripts
			var originalContextWindow = gExtContextWindow; // save the context window
			gExtContextWindow = b.contentWindow;

			for (var i in aCallBackFuncs)
			{
				w.extCustomScripts._anonymous_callback = aCallBackFuncs[i];
				w.extCustomScripts._anonymous_callback(b.contentWindow);
			}

			gExtContextWindow = originalContextWindow; // restore the context window

			return true;
		},
		onProgressEnd : function(aManager, aManagerIndex)
		{
			delete window.extProgressManagers[aManagerIndex];
		}
	},
  
	// 指定のタイプ名を持つウィンドウがあればフォーカスを移し、なければ開く 
	openDialog : function(aURI, aType, aArg)
	{
		var target = this.utils.getTopWindowOf(aType);
		if (target)
			target.focus();
		else
			window.openDialog(aURI, '_blank', 'chrome,all,dialog=no', aArg);
		return;
	},
  
	// 指定の要素にジャンプする 
	scrollTo : function(aTarget)
	{
		if (!aTarget ||
			aTarget.offsetLeft === void(0) ||
			aTarget.offsetTop  === void(0))
			return;

		var d = aTarget.ownerDocument;
		if (d.__ctxextensions__smoothScrollTask)
			this.utils.animationManager.removeTask(d.__ctxextensions__smoothScrollTask);

		var finalX = aTarget.offsetLeft;
		var finalY = aTarget.offsetTop;
		var w = d.defaultView;

		var startX = w.scrollX;
		var startY = w.scrollY;
		var deltaX = finalX - startX;
		var deltaY = finalY - startY;
		var radian = 90 * Math.PI / 180;
		var self   = this;
		d.__ctxextensions__smoothScrollTask = function(aTime, aBeginning, aChange, aDuration) {
			var x, y, finished;
			if (aTime >= aDuration) {
				delete d.__ctxextensions__smoothScrollTask;
				x = finalX;
				y = finalY
				finished = true;
			}
			else {
				x = startX + (deltaX * Math.sin(aTime / aDuration * radian));
				y = startY + (deltaY * Math.sin(aTime / aDuration * radian));
				finished = false;
			}
			w.scrollTo(x, y);
			return finished;
		};
		this.utils.animationManager.addTask(
			d.__ctxextensions__smoothScrollTask,
			0, 0, this.smoothScrollDuration
		);
	},
	smoothScrollDuration : 250,
 
	// URIをダウンロードし、ダウンロード完了後にアプリで開く 
	downloadAndOpenWithApp : function(aManagerID, aApp, aOptions, aURI, aDocument)
	{
		// URIをパスに変換。ローカルのファイルでなければ、テンポラリファイルを渡す。
		var path = this.utils.getFileFromURLSpec(aURI).path;

		var persist = null;
		if (!path) {
			var tempFile = this.utils.makeTempFileForURI(aURI);
			persist = this.utils.saveURIInBackgroundAs(aURI, tempFile);
			path = tempFile.path;
		}

		if (aManagerID in this.downloadManagers &&
			this.downloadManagers[aManagerID]) {
			this.downloadManagers[aManagerID].stop()
			this.downloadManagers[aManagerID] = null;
		}

		// ファイルのダウンロードを待ってから開く
		var message = (persist) ? this.message.tempfile_loading : null ;

		if (message)
			message = message.replace(/%host%/g, this.utils.makeURIFromSpec(aURI).host || this.message.unknown_host );

		this.downloadManagers[aManagerID] = new pProgressManager(this.downloadAndOpenWithAppObserver, 50, /*aURI, */'progress=undetermined', message);
		this.downloadManagers[aManagerID].appendItem(aApp, aOptions.replace(/%s/gi, path), persist);
		this.downloadManagers[aManagerID].start();

		return;
	},
	
	downloadAndOpenWithAppObserver : 
	{
		onProgress : function(aManager, aApp, aOptions, aPersist)
		{
			if (aPersist && aPersist.currentState != aPersist.PERSIST_STATE_FINISHED)
				return false;

			ExtService.run(aApp, aOptions);
			//	if (aFile) aFile.remove(true);
			return true;
		},
		onProgressEnd : function()
		{
		}
	},
  
	// 見出しのリストを取得し、保存する 
	updateHeadings : function(aWindow, aInBackGround)
	{
		var d    = (aWindow ? aWindow.document : this.contentDocument()),
			info = this.contentInfo(false, aWindow || d.defaultView);

		if (!('headings' in info) || !info.headings) {
			info.headingsCurrentIndex = -1;
			info.headingsLastCount = 0;
			info.headings          = [];
			info.headingsIndex     = [];
		}

		var nodes = this.utils.evaluateXPath('/descendant::*[contains("H1,H2,H3,H4,H5,H6,H7,h1,h2,h3,h4,h5,h6,h7,h", local-name())]', d.documentElement);
		var max = nodes.snapshotLength;
		if (max == info.headingsLastCount) return;

		for (var i = info.headingsLastCount || info.headingsLastCount; i < max; i++)
		{
			info.headings[info.headings.length] = this.createHeading(nodes.snapshotItem(i));
			info.headingsIndex[info.headings[info.headings.length-1].id] = info.headings.length-1;
		}

		info.headingsLastCount = max;
	},
	
	// 見出しオブジェクトの生成 
	createHeading : function(aNode)
	{
		return ({
			get id()
			{
				return ('id' in this.node && this.node.id) ? this.node.id :
					(this.node.firstChild && 'name' in this.node.firstChild && this.node.firstChild.name) ? this.node.firstChild.name :
					null ;
			},
			get label()
			{
				return this.node.textContent.replace(/(\n|\r)+/g, ' ').replace(/\t/g, '');
			},
			get level()
			{
				if (this.node.localName != 'h')
					return parseInt(this.node.localName.charAt(1));

				// XHTML 2.0
				var count = 0,
					node  = this.node.parentNode;
				while (node)
				{
					if (node.localName == 'section') count++;
					node = node.parentNode;
				}
				return count;
			},
			node      : aNode,
			substance : aNode // for old implementations
		});
	},
  
	// ナビゲーション用リンクのリストを更新 
	updateNavigations : function(aWindow, aInBackGround, aCallBackFunc)
	{
		var d    = (aWindow ? aWindow.document : this.contentDocument()),
			info = this.contentInfo(false, aWindow || d.defaultView);

		if (!('navigations' in info) || !info.navigations) {
			info.navigationsLastCount = 0;
			info.navigations          = [];
			info.finished_navigation_types = {};
		}


		var expression = [];
		expression.push('/descendant::*[@href');

		if (!this.utils.getPref('ctxextensions.enable.navigations_collectLinks'))
			expression.push(' and contains("LINK,link", local-name())')
		if (!this.utils.getPref('ctxextensions.enable.navigations_advanced'))
			expression.push(' and (@rel or @rev)');

		expression.push(']');
		expression = expression.join('');

		var nodes = this.utils.evaluateXPath(expression, d.documentElement);
		var max = nodes.snapshotLength;

		if (max == info.navigationsLastCount) return;

		parentRoop:
		for (var i = 0; i < max; i++)
		{
			var tmp_navi = this.createNavigation(nodes.snapshotItem(i));

			for (var j in tmp_navi.linktypes)
			{
				if (tmp_navi.linktypes[j]+'::'+tmp_navi.href in info.finished_navigation_types) continue parentRoop;

				info.finished_navigation_types[tmp_navi.linktypes[i]+'::'+tmp_navi.href] = true;
			}

			info.navigations[info.navigations.length] = tmp_navi;
		}

		info.navigationsLastCount = max;
	},
	
	// ナビゲーション項目オブジェクトの生成 
	createNavigation : function(aNode)
	{
		var href  = ExtService.getAttributeOfLink(aNode, 'href');
		var title = ExtService.getAttributeOfLink(aNode, 'title');
		var rel   = ExtService.getAttributeOfLink(aNode, 'rel');
		var rev   = ExtService.getAttributeOfLink(aNode, 'rev');
		var media = ExtService.getAttributeOfLink(aNode, 'media');

		var linktypes = [];
		var tmp_types = (rel || rev || '')
			.toLowerCase()
			.replace(/alternate\s+stylesheet/, 'alternatestylesheet stylesheet')
			.replace(/(start|top|home|origin)/, '$1 up')
			.split(/ +/);

		for (var i in tmp_types)
		{
			if (!rel)
				tmp_types[i] = (tmp_types[i] in this.revLinkType) ? this.revLinkType[tmp_types[i]] : null ;

			if (!tmp_types[i]) continue;

			linktypes.push(this.formatLinkType(tmp_types[i]));
		}

		var label = title ||
					aNode.textContent.replace(/\s+/g, ' ') ||
					href ;
		label = this.getLinkType(aNode).replace(/%s/i, label) || label ;
		if (media) label = this.utils.getMsg('media').replace(/%s/i, label).replace(/%m/i, media);

		return ({
			label     : label,
			linktypes : (linktypes.length) ? linktypes : null ,
			get href()
			{
				var node = this.node;
				var href = ('href' in node && node.href) ? node.href :
						node.getAttributeNS(ExtService.XHTMLNS, 'href') ||
						node.getAttributeNS(ExtService.XLinkNS, 'href') ||
						node.getAttribute('href');
				return href;
			},
			get elemType()
			{
				return (this.node.localName.toLowerCase() == 'link') ? 'navigation' : 'anchor' ;
			},
			node      : aNode,
			substance : aNode // for old implementations
		});
	},
  
	// メニューから直接、各種項目のプロパティを開く 
	editRDFItem : function(aEventOrID, aRDFName)
	{
		aRDFName = aRDFName.toUpperCase();
		var RDFData = this.utils[aRDFName];
		var id;
		if (typeof aEventOrID == 'string')
			id = aEventOrID;
		else
			id = aEventOrID.target.getAttribute('label');

		var mod = RDFData.getData(id, 'Modifier');
		var data = {
				name           : id
			};

		if (aRDFName.match(/^(SendURI|SendStr|ExecApps|CustomScripts)$/i)) {
			data.keyboardShortcut = {
				key      : RDFData.getData(id, 'Key').toUpperCase(),
				charCode : RDFData.getData(id, 'Key').toUpperCase().charCodeAt(0),
				keyCode  : RDFData.getData(id, 'Keycode'),
				altKey   : (mod.match(/alt/) ? true : false),
				ctrlKey  : (mod.match(/control/) ? true : false),
				metaKey  : (mod.match(/meta/) ? true : false),
				shiftKey : (mod.match(/shift/) ? true : false)
			};

			data.newContextItem = (RDFData.getData(id, 'NewContextItem') == 'true');
			data.contextShowNormal = (RDFData.getData(id, 'ShowContextItemNormally') != 'false');
			data.contextShowSelect = (RDFData.getData(id, 'ShowContextItemWithSelection') != 'false');
			data.contextShowLink = (RDFData.getData(id, 'ShowContextItemOnLink') != 'false');
		}

		switch(aRDFName)
		{
			case 'SENDURI':
				data.webServicePath = RDFData.getData(id, 'Path');
				data.webServiceForURI = true;
				data.openIn = RDFData.getData(id, 'OpenIn');
				break;

			case 'SENDSTR':
				data.webServicePath = RDFData.getData(id, 'Path');
				data.webServiceForSelection = true;
				data.charset = RDFData.getData(id, 'Charset');
				data.openIn = RDFData.getData(id, 'OpenIn');
				break;

			case 'EXECAPPS':
				data.applicationPath = RDFData.getData(id, 'Path');
				data.applicationArguments = RDFData.getData(id, 'Arguments');
				data.charset = RDFData.getData(id, 'Charset');
				data.download = RDFData.getData(id, 'Download') == 'true';
				break;

			case 'CUSTOMSCRIPTS':
				data.customScripts = ExtCommonUtils.unescape(RDFData.getData(id, 'Script'));
				data.autoExec = RDFData.getData(id, 'Automatically') == 'true';
				data.autoExecStartup = RDFData.getData(id, 'Startup') == 'true';
				data.hiddenInMenu = RDFData.getData(id, 'Hidden') == 'true';
				break;

			default:
				break;
		}

		data.mRDFData     = RDFData;
		data.callBackFunc = this.editRDFItemCallBackFunc;

		// if the property window has been opened, focus to it
		var props = this.utils.getWindowsOf('ctxextensions:PrefProperty');
		for (var i in props)
			if ('mRDFData' in props[i].PrefPropService.data &&
				props[i].PrefPropService.data.mRDFData.id == data.mRDFData.id &&
				'name' in props[i].PrefPropService.data &&
				props[i].PrefPropService.data.name == data.name) {
				props[i].focus();
				return true;
			}

		window.openDialog('chrome://ctxextensions/content/pref/prefProperty.xul', '_blank', 'chrome,all,dialog=no,centerscreen', data);


		return true;
	},

	editRDFItemCallBackFunc : function()
	{
		if (!('modified' in this)) return;

		if ('keyboardShortcut' in this) {
			var modifiers    = [],
				modifiersStr = '';
			if (this.keyboardShortcut.altKey)   modifiers.push('alt');
			if (this.keyboardShortcut.ctrlKey)  modifiers.push('control');
			if (this.keyboardShortcut.metaKey)  modifiers.push('meta');
			if (this.keyboardShortcut.shiftKey) modifiers.push('shift');
			if (modifiers.length) modifiersStr = modifiers.join(',');

			this.mRDFData.setData(this.name,
				'Key',       this.keyboardShortcut.key,
				'Keycode',   this.keyboardShortcut.keyCode,
				'Modifier',  modifiersStr
			);
		}

		if ('newContextItem' in this)
			this.mRDFData.setData(this.name, 'NewContextItem', this.newContextItem ? 'true' : 'false' );
		if ('contextShowNormal' in this)
			this.mRDFData.setData(this.name, 'ShowContextItemNormally', this.contextShowNormal ? 'true' : 'false' );
		if ('contextShowSelect' in this)
			this.mRDFData.setData(this.name, 'ShowContextItemWithSelection', this.contextShowSelect ? 'true' : 'false' );
		if ('contextShowLink' in this)
			this.mRDFData.setData(this.name, 'ShowContextItemOnLink', this.contextShowLink ? 'true' : 'false' );


		if ('openIn' in this)
			this.mRDFData.setData(this.name, 'OpenIn', this.openIn);
		if ('charset' in this)
			this.mRDFData.setData(this.name, 'Charset', this.charset);
		if ('applicationPath' in this)
			this.mRDFData.setData(this.name, 'Path', this.applicationPath);
		if ('applicationArguments' in this)
			this.mRDFData.setData(this.name, 'Arguments', this.applicationArguments);
		if ('webServicePath' in this)
			this.mRDFData.setData(this.name, 'Path', this.webServicePath);
		if ('download' in this)
			this.mRDFData.setData(this.name, 'Download', this.download ? 'true' : 'false' );
		if ('hiddenInMenu' in this)
			this.mRDFData.setData(this.name, 'Hidden', this.hiddenInMenu ? 'true' : 'false' );
		if ('autoExec' in this)
			this.mRDFData.setData(this.name, 'Automatically', this.autoExec ? 'true' : 'false' );
		if ('autoExecStartup' in this)
			this.mRDFData.setData(this.name, 'Startup', this.autoExecStartup ? 'true' : 'false' );
		if ('customScripts' in this)
			this.mRDFData.setData(this.name, 'Script', ExtCommonUtils.escape(this.customScripts));
	},
  
	// UIの更新 
	
	// 正規表現の更新 
	updateRegExp : function()
	{
		this.regexp.link_next      = this.utils.makeRegExp(this.utils.getPref('ctxextensions.regexp.navigations.next'), this.regexp.link_next);
		this.regexp.link_prev      = this.utils.makeRegExp(this.utils.getPref('ctxextensions.regexp.navigations.prev'), this.regexp.link_prev);
		this.regexp.link_home      = this.utils.makeRegExp(this.utils.getPref('ctxextensions.regexp.navigations.home'), this.regexp.link_home);
		this.regexp.link_contents  = this.utils.makeRegExp(this.utils.getPref('ctxextensions.regexp.navigations.contents'), this.regexp.link_contents);
		this.regexp.link_index     = this.utils.makeRegExp(this.utils.getPref('ctxextensions.regexp.navigations.index'), this.regexp.link_index);
		this.regexp.link_glossary  = this.utils.makeRegExp(this.utils.getPref('ctxextensions.regexp.navigations.glossary'), this.regexp.link_glossary);
		this.regexp.link_copyright = this.utils.makeRegExp(this.utils.getPref('ctxextensions.regexp.navigations.copyright'), this.regexp.link_copyright);
		this.regexp.link_appendix  = this.utils.makeRegExp(this.utils.getPref('ctxextensions.regexp.navigations.appendix'), this.regexp.link_appendix);
		this.regexp.link_search    = this.utils.makeRegExp(this.utils.getPref('ctxextensions.regexp.navigations.search'), this.regexp.link_search);
		this.regexp.link_help      = this.utils.makeRegExp(this.utils.getPref('ctxextensions.regexp.navigations.help'), this.regexp.link_help);
	},
 
	// テンプレートで生成された要素を再生成する 
	rebuild : function(aNames)
	{
		var nsIXULTemplateBuilderAvailable = this.utils.getPref('ctxextensions.enable.nsIXULTemplateBuilder');

		if (typeof aNames == 'string') aNames = [aNames];
		var node;
		for (var i in aNames)
		{
			if ((node = document.getElementById(aNames[i]))) {
				if (nsIXULTemplateBuilderAvailable)
					node.builder.rebuild();
				else
					this.utils.rebuildFromTemplate(node);
			}

			if (aNames[i].indexOf('context-') == 0)
				window.setTimeout(this.hideContextDuplicatedItems, 10, aNames[i]);

		}
		this.utils.cleanUpInvalidKeysWithDelay();
		return;
	},
	hideContextDuplicatedItems : function(aID)
	{
		var duplicatedItems = ExtCommonUtils.evaluateXPath('descendant::*[(@newitem = "true") and ((@contextShowNormal and @contextShowSelect = "true") or (@contextShowSelect and @contextShowNormal = "true") or (@contextShowLink and @contextShowLink = "true"))]', document.getElementById(aID));
		for (var j = 0; j < duplicatedItems.snapshotLength; j++)
			duplicatedItems.snapshotItem(j).setAttribute('hidden', true);
	},
	
	// create acceltext, because menuitems have same ids and 
	// then wrong acceltexts (like "CHROME://...") are displayed.
	updateAccelTextFor : function(aKeysetID)
	{
		var keys = document.getElementById(aKeysetID);
		if (!keys) return;

		keys = keys.getElementsByTagName('key');

		var i, j,
			nodes,
			acceltext;
		for (i = 0; i < keys.length; i++)
		{
			if (!keys[i].getAttribute('id').match(/^chrome:\/\//)) continue;

			nodes = document.getElementsByAttribute('ext-key', keys[i].getAttribute('keyid'));
			acceltext = ExtCommonUtils.getAccelText({
					key       : keys[i].getAttribute('key'),
					keyCode   : keys[i].getAttribute('keycode'),
					modifiers : keys[i].getAttribute('modifiers')
				});

			for (j = 0; j < nodes.length; j++)
				nodes[j].setAttribute('acceltext', acceltext);
		}
	},
 
	// ExecAppの更新 
	rebuildExecApps : function()
	{
		this.rebuild([
			'ext-key-execApps',
			'ext-common-execApps:mpopup',
			'menu-item-execApps:mpopup',
			'menu-item-execApps:mpopup:submenu',
			'menu-item-execApps-frame:mpopup',
			'appmenu-item-execApps:mpopup',
			'appmenu-item-execApps:mpopup:submenu',
			'appmenu-item-execApps-frame:mpopup',
			'context-item-execApps:mpopup',
			'context-item-execApps:mpopup:submenu',
			'context-item-execApps-frame:mpopup'
		]);
		window.setTimeout(this.updateAccelTextFor, 100, 'ext-key-execApps');
		window.setTimeout('ExtService.showHideMenubarItem("execApps");', 0);
		this.setKeyEnabled('ext-broadcaster-key:showMenu:execapps', this.hasExecApps);
	},
 
	// CustomScriptの更新 
	rebuildCustomScripts : function()
	{
		this.rebuild([
			'ext-key-customScripts',
			'ext-common-customScripts:mpopup',
			'menu-item-customScripts:mpopup',
			'menu-item-customScripts:mpopup:submenu',
			'appmenu-item-customScripts:mpopup',
			'appmenu-item-customScripts:mpopup:submenu',
			'context-item-customScripts:mpopup',
			'context-item-customScripts:mpopup:submenu'
		]);
		window.setTimeout(this.updateAccelTextFor, 100, 'ext-key-customScripts');
		window.setTimeout('ExtService.showHideMenubarItem("customScripts");', 0);
		this.setKeyEnabled('ext-broadcaster-key:showMenu:customscripts', this.hasCustomScripts);
	},
 
	// SendStrの更新 
	rebuildSendStr : function()
	{
		this.rebuild([
			'ext-key-sendStr',
			'menu-item-sendStr:mpopup',
			'menu-item-sendStr:mpopup:submenu',
			'context-item-sendStr:mpopup',
			'context-item-sendStr:mpopup:submenu'
		]);
		window.setTimeout(this.updateAccelTextFor, 100, 'ext-key-sendStr');
		window.setTimeout('ExtService.showHideMenubarItem("sendStr");', 0);
	},
 
	// SendURIの更新 
	rebuildSendURI : function()
	{
		this.rebuild([
			'ext-key-sendURI',
			'menu-item-sendURI:mpopup',
			'menu-item-sendURI:mpopup:submenu',
			'menu-item-sendURI-frame:mpopup',
			'appmenu-item-sendURI:mpopup',
			'appmenu-item-sendURI:mpopup:submenu',
			'appmenu-item-sendURI-frame:mpopup',
			'context-item-sendURI:mpopup',
			'context-item-sendURI:mpopup:submenu',
			'context-item-sendURI-frame:mpopup'
		]);
		window.setTimeout(this.updateAccelTextFor, 100, 'ext-key-sendURI');
		window.setTimeout('ExtService.showHideMenubarItem("sendURI");', 0);
	},
 
	rebuildExtraItems : function() 
	{
		// we cannot create menu items at startup...it's a Mozilla's bug.
		var data = [ /* objID, menuID, func */
				'SendURI',
					'context-item-sendURI:mpopup',
					'ExtFunc.SendURI(event);',
				'SendStr',
					'context-item-sendStr:mpopup',
					'ExtFunc.SendStr(event);',
				'ExecApps',
					'ext-common-execApps:mpopup',
					'ExtFunc.ExecApps(event);',
				'CustomScripts',
					'ext-common-customScripts:mpopup',
					'ExtFunc.CustomScripts(event);'
			];

		var sep = document.getElementById('context-sep-extensionsExtra');
		if (!sep) return;

		// clear old items;
		while (sep.nextSibling &&
				sep.nextSibling.getAttribute('ext-item-userdefined') == 'true')
			sep.parentNode.removeChild(sep.nextSibling);

		var ref = sep.nextSibling;

		var newSep,
			mpopup,
			items,
			item,
			name,
			show,
			count = 0,
			i, j;

		for (i = 0; i < data.length; i += 3)
		{
			// create separators. useless separators are hidden by updateContextMenu.
			if (i >= 1) {
				newSep = document.createElement('menuseparator');
				newSep.setAttribute('ext-item-userdefined', 'true');
				newSep.setAttribute('class', 'menuseparator-ctxextensions');
				sep.parentNode.insertBefore(newSep, ref);
			}

			mpopup = document.getElementById(data[i+1]);
			if (!mpopup) continue;

			items = mpopup.getElementsByAttribute('newitem', 'true');

			for (j = 0; j < items.length; j++)
			{
				name = items[j].getAttribute('label');

				item = document.createElement('menuitem');

				item.setAttribute('id', 'context-item-userdefined'+j);
				item.setAttribute('oncommand', data[i+2]+'; event.stopPropagation();');
				item.setAttribute('onclick', 'if (event.button == 1) ExtService.editRDFItem(event, "'+data[i]+'");');

				item.setAttribute('label',   name);

				show = [];
				if (items[j].getAttribute('contextShowNormal') == 'true')
					show.push('normal');
				if (items[j].getAttribute('contextShowLink') == 'true')
					show.push('link');
				if (items[j].getAttribute('contextShowSelect') == 'true')
					show.push('select');
				item.setAttribute('ext-context-show', show.join(','));

				item.setAttribute('ext-item-userdefined', 'true');

				sep.parentNode.insertBefore(item, ref);

				count++;
			}
		}

		sep.hidden = !count;
	},
  
	initKeys : function() 
	{
		var userKeys = document.getElementsByAttribute('class', 'key-userdefined');

		var keys, key, keyCode, disabled, items,
			i, j, k;
		for (i = 0; i < userKeys.length; i++)
		{
			if (userKeys[i].getAttribute('uri') == 'rdf:*' ||
				this.userdefinedKeys[userKeys[i].getAttribute('id')]) continue;

			this.userdefinedKeys[userKeys[i].getAttribute('id')] = userKeys[i];

			key       = userKeys[i].getAttribute('key').toLowerCase() || '';
			keyCode   = userKeys[i].getAttribute('keycode') || '';
			keystring = this.getKeyString(userKeys[i]);
			disabled  = (userKeys[i].getAttribute('disabled') != 'true');

			if (keyCode)
				keys = document.getElementsByAttribute('keycode', keyCode);
			else if (key == '*')
				keys = [];
			else
				keys = [].concat(
					Array.slice(document.getElementsByAttribute('key', key)),
					Array.slice(document.getElementsByAttribute('key', key.toUpperCase()))
				);
	//		dump('keys: '+keys.length+'('+keystring+')\n');

			for (j = 0; j < keys.length; j++)
			{
				if (this.getKeyString(keys[j]) != keystring) continue;

				if (disabled)
					keys[j].setAttribute('disabled', true);
				else
					keys[j].removeAttribute('disabled');

				items = document.getElementsByAttribute('key', keys[j].id);
				for (k = 0; k < items.length; k++)
					items[k].setAttribute('keydisabled', disabled);
			}
		}

		return;
	},
	
	getKeyString : function(aKey) 
	{
		var modifiers = aKey.getAttribute('modifiers').toLowerCase();
		var data = {
				key      : aKey.getAttribute('key'),
				keyCode  : aKey.getAttribute('keycode'),
				altKey   : modifiers.match(/alt/),
				ctrlKey  : modifiers.match(/ctrl|control/),
				shiftKey : modifiers.match(/shift/),
				metaKey  : modifiers.match(/meta/)
			};

		if (modifiers.match(/accel/))
			switch(this.utils.getPref('ui.key.accelKey'))
			{
				default:
				case 0:
					break;
				case 17:
					data.ctrlKey = true;
					break;
				case 18:
					data.altKey = true;
					break;
				case 224:
					data.metaKey = true;
					break;
			}

		return this.utils.getStringFromKeyboardShortcut(data);
	},
 
	// キーボードショートカットの有効/無効のチェック 
	updateKey : function(aForceFlag)
	{
		// go to next/prev heading
		this.setKeyEnabled('ext-broadcaster-key:goHeading',
			aForceFlag !== void(0) ? aForceFlag :
			this.utils.getPref('ctxextensions.shortcut.goHeadings'));

		this.setKeyEnabled('ext-broadcaster-key:getLinks',
//			aForceFlag !== void(0) ? aForceFlag :
			this.utils.getPref('ctxextensions.shortcut.getLinks'));
		this.setKeyEnabled('ext-broadcaster-key:up',
//			aForceFlag !== void(0) ? aForceFlag :
			this.utils.getPref('ctxextensions.shortcut.up'));

		// move focus
		this.setKeyEnabled('ext-broadcaster-key:advanceFocus:alphabet',
			aForceFlag !== void(0) ? aForceFlag :
			this.utils.getPref('ctxextensions.shortcut.advanceFocus_alphabet'));
		this.setKeyEnabled('ext-broadcaster-key:advanceFocus:arrow',
//			aForceFlag !== void(0) ? aForceFlag :
			this.utils.getPref('ctxextensions.shortcut.advanceFocus_arrow'));


		this.setKeyEnabled('ext-broadcaster-key:goNavigation',
			aForceFlag !== void(0) ? aForceFlag :
			this.utils.getPref('ctxextensions.shortcut.navigations'));

		// custom scripts, exec apps, and so on
		var nodes = document.getElementsByAttribute('class', 'key-userdefined');
		for (var i = 0; i < nodes.length; i++)
			if (nodes[i].parentNode.localName != 'action')
				this.setKeyEnabled(nodes[i],
					aForceFlag !== void(0) ? aForceFlag : true);


		if ('fullScreen' in window && window.fullScreen !== void(0))
			this.setKeyEnabled('ext-broadcaster-key:showMenu:menu',
//				aForceFlag !== void(0) ? aForceFlag :
				window.fullScreen);
	},
 
	// キーボードショートカットについて、設定が変化した場合のみ属性を変更する 
	setKeyEnabled : function(aIDOrElem, aFlag)
	{
		var id = (aIDOrElem && typeof aIDOrElem == 'string') ? aIDOrElem :
				aIDOrElem ? aIDOrElem.id : null ;

		var node = (aIDOrElem && typeof aIDOrElem == 'string') ? document.getElementById(id) : aIDOrElem ;
		if (!node) return;

		if (!node.getAttribute('disabled') != !aFlag) return;

		if (aFlag)
			node.removeAttribute('disabled');
		else
			node.setAttribute('disabled', true);

		var menuitems = document.getElementsByAttribute('ext-key-observer', id);
		for (var i = 0; i < menuitems.length; i++)
			if (node.getAttribute('disabled') == 'true')
				menuitems[i].removeAttribute('key');
			else
				menuitems[i].setAttribute('key', menuitems[i].getAttribute('ext-key'));

		return;
	},
  
	// メニューの更新 
	
	// メニューのラベルを更新 
	updateMenuLabels : function(aPopup)
	{
		var i;

		var sel     = this.getSelection();
		var selstr  = sel ? this.utils.getShortString(sel.replace(/\s+/g, ''), 16, 'cut-end') : '' ;
		var inFrame = this.inFrame;
		var onLink  = this.onLink;

		var items = [].concat(
				Array.slice(aPopup.getElementsByAttribute('label-for-frame', '*')),
				Array.slice(aPopup.getElementsByAttribute('label-for-select', '*')),
				Array.slice(aPopup.getElementsByAttribute('label-for-link', '*'))
			);
		var labeledItems = [];
		for (i in items)
			if (!('ext_checked' in items[i]) || !items[i].ext_checked) {
				items[i].ext_checked = true;
				labeledItems.push(items[i]);
			}

		var normal, frame, select, link;
		for (i in labeledItems)
		{
			labeledItems[i].ext_checked = false;

			normal = labeledItems[i].getAttribute('label-for-normal') || '' ;
			frame = inFrame ? labeledItems[i].getAttribute('label-for-frame') : '' ;
			select = sel ? labeledItems[i].getAttribute('label-for-select').replace(/%s/ig, selstr) : '' ;
			link = onLink ? labeledItems[i].getAttribute('label-for-link') : '' ;

			labeledItems[i].setAttribute('label', link || select || frame || normal );
		}
	},
 
	// コンテキストメニューの表示更新 
	updateContextMenu : function(aPopup)
	{
		if (this.utils.getPref('ctxextensions.show_item.context.navigations'))
			this.updateNavigationsPopup();
		if (this.utils.getPref('ctxextensions.show_item.context.outline'))
			this.updateOutlinePopup();
		if (this.utils.getPref('ctxextensions.show_item.context.go'))
			this.makeBackList();

		this.updateMenuLabels(aPopup);


		var i;
		var CM = window.gContextMenu || null ;

		var showMisc = CM ? !(CM.isTextSelected || CM.onTextInput) : false ;
		var sel = this.getSelection();
		var showAll = this.utils.getPref('ctxextensions.showall_enable.showCites') ||
				this.utils.getPref('ctxextensions.showall_enable.showComments') ||
				this.utils.getPref('ctxextensions.showall_enable.showEvents') ||
				this.utils.getPref('ctxextensions.showall_enable.showIDs') ||
				this.utils.getPref('ctxextensions.showall_enable.showLinks') ||
				this.utils.getPref('ctxextensions.showall_enable.showTitles');

		var showGo     = false,
			hasHistory = false;
		try {
			showGo = (CM ? !(CM.isTextSelected || CM.onLink || CM.onImage || CM.onTextInput) : true );
			hasHistory = this.utils.browser.sessionHistory.count > 1;
		}
		catch(e) { // in undocked sidebar, etc.
		}

		var normal = !sel && !this.onLink;
		var allowShowFrameItem = this.utils.isBrowser;

		var items = [
				'go',                 hasHistory && showGo && normal,
				'up',                 this.canUp && normal,
				'nextHeading',        showGo && this.hasOutline && normal,
				'prevHeading',        showGo && this.hasOutline && normal,
				'openCiteForQuote',   this.getCiteForQuote() && normal,
				'openCiteForEdit',    this.getCiteForEdit() && normal,
				'openLongdesc',       this.getLongdesc() && !sel,
				'bookmarks',          showMisc && normal,
				'outline',            this.hasOutline && normal,
				'navigations',        this.hasNavigations && this.isWebPage && normal,
				'JSPanel',            normal,
				'getLinks',           this.isWebPage,
				'showComments',       this.isWebPage && normal,
				'showLinks',          this.isWebPage && normal,
				'showIDs',            this.isWebPage && normal,
				'showCites',          this.isWebPage && normal,
				'showTitles',         this.isWebPage && normal,
				'showEvents',         this.isWebPage && normal,
				'showAll',            this.isWebPage && normal,
				'sendURI',            this.hasRecieverForURI && (this.onLink || (!sel && allowShowFrameItem)),
				'sendURI-frame',      this.hasRecieverForURI && allowShowFrameItem,
				'sendStr',            this.hasRecieverForStr && sel,
				'customScripts',      this.hasCustomScripts,
				'execApps',           this.hasExecApps && (this.onLink || allowShowFrameItem),
				'execApps-frame',     this.hasExecApps && allowShowFrameItem
			];

		var prefName;
		for (i = 0; i < items.length; i += 2)
		{
			prefName = items[i].split('-')[0];
			this.setVisible(
				aPopup.getElementsByAttribute('ctxextensions-item', items[i])[0],
				items[i+1] &&
				this.utils.getPref('ctxextensions.show_item.context.'+prefName) &&
				!this.utils.getPref('ctxextensions.submenu.context.'+prefName)
			);
			this.setVisible(
				aPopup.getElementsByAttribute('ctxextensions-item', items[i]+':submenu')[0],
				items[i+1] &&
				this.utils.getPref('ctxextensions.show_item.context.'+prefName) &&
				this.utils.getPref('ctxextensions.submenu.context.'+prefName)
			);
		}


		// show/hide "Extensions" submenu
		var hasItem = false;
		var extensions = aPopup.getElementsByAttribute('ctxextensions-item', 'extensions')[0]
		for (i = 0; i < extensions.firstChild.childNodes.length; i++)
			if (extensions.firstChild.childNodes[i].localName != 'menuseparator' &&
				!extensions.firstChild.childNodes[i].hidden)
				hasItem = true;

		this.setVisible(
			extensions,
			hasItem && this.utils.getPref('ctxextensions.show_item.context.extensions')
		);
		if (!extensions.hidden)
			this.utils.showHideMenuSeparators(extensions.firstChild);


		// visibility of userdefined items
		var nodes = aPopup.getElementsByAttribute('ext-item-userdefined', 'true'),
			show;
		for (i = 0; i < nodes.length; i++)
		{
			if (nodes[i].localName != 'menuitem') continue;

			show = nodes[i].getAttribute('ext-context-show');
			nodes[i].hidden = !(
				(show.match(/select/) && sel) ||
				(show.match(/link/) && this.onLink) ||
				(show.match(/normal/) && !this.onLink && !sel)
				);
		}


		// hide needless separators
		this.utils.showHideMenuSeparators(aPopup);
	},
 
	// メニューバーの項目の表示更新 
	updateMenubarSubmenu : function(aPopup)
	{
		if (this.utils.getPref('ctxextensions.submenu.menubar.navigations'))
			this.updateNavigationsPopup();
		if (this.utils.getPref('ctxextensions.submenu.menubar.outline'))
			this.updateOutlinePopup();

		var menu = aPopup.parentNode;

		this.updateMenuLabels(aPopup);


		var i;
		var sel = this.getSelection();
		var showAll = this.utils.getPref('ctxextensions.showall_enable.showCites') ||
				this.utils.getPref('ctxextensions.showall_enable.showComments') ||
				this.utils.getPref('ctxextensions.showall_enable.showEvents') ||
				this.utils.getPref('ctxextensions.showall_enable.showIDs') ||
				this.utils.getPref('ctxextensions.showall_enable.showLinks') ||
				this.utils.getPref('ctxextensions.showall_enable.showTitles');

		var allowSendPageItem = this.utils.isBrowser;

		var items = [
				'up',                 this.canUp,
				'nextHeading',        this.hasOutline,
				'prevHeading',        this.hasOutline,
				'outline',            this.hasOutline,
				'navigations',        this.hasNavigations && this.isWebPage,
				'JSPanel',            true,
				'getLinks',           this.isWebPage,
				'showComments',       this.isWebPage,
				'showLinks',          this.isWebPage,
				'showIDs',            this.isWebPage,
				'showCites',          this.isWebPage,
				'showTitles',         this.isWebPage,
				'showEvents',         this.isWebPage,
				'showAll',            this.isWebPage,
				'sendURI',            this.hasRecieverForURI && allowSendPageItem,
				'sendURI-frame',      this.hasRecieverForURI && allowSendPageItem && this.inFrame,
				'sendStr',            this.hasRecieverForStr && sel,
				'customScripts',      this.hasCustomScripts,
				'execApps',           this.hasExecApps && allowSendPageItem,
				'execApps-frame',     this.hasExecApps && allowSendPageItem && this.inFrame,
				'pref',               true,
				'help',               true
			];

		var prefName,
			value;
		for (i = 0; i < items.length; i += 2)
		{
			prefName = items[i].split('-')[0];
//			this.setVisible(
//				'menu-item-'+items[i],
//				items[i+1] &&
//				!this.utils.getPref('ctxextensions.submenu.menubar.'+prefName)
//			);
			value = this.utils.getPref('ctxextensions.submenu.menubar.'+prefName);
			this.setVisible(
				aPopup.getElementsByAttribute('ctxextensions-item', items[i]+':submenu')[0],
				items[i+1] &&
				(value === null ? true : value )
			);
		}


		// hide needless separators
		this.utils.showHideMenuSeparators(aPopup);
	},
 
	// アウトラインを生成する 
	updateOutlinePopup : function(aShouldShowEmpty)
	{
		var mpopup = document.getElementById('ext-common-outline:mpopup');
		if (!mpopup) return;

		var info     = this.contentInfo(),
			headings = ('headings' in info) ? info.headings : [] ;

		if (!aShouldShowEmpty &&
			'ex_uri' in mpopup && mpopup.ex_uri &&
			mpopup.ex_uri == this.currentURI().split('#')[0] &&
			mpopup.getElementsByTagName('menuitem').length == headings.length) return;

		this.updateHeadings();
		headings = info.headings;

		var range = document.createRange();
		range.selectNodeContents(mpopup);
		range.deleteContents();
		range.detach();

		if (!headings.length) {
			if (aShouldShowEmpty) {
				var empty = document.createElement('menuitem');
				empty.setAttribute('label',    this.message.emptyItem);
				empty.setAttribute('disabled', true);
				mpopup.appendChild(empty);
			}
			mpopup.ex_uri = '';
			return;
		}

		var n, space, menuitem;
		for (var i in headings)
		{
			space = '';
			for (n = 1; n < headings[i].level; n++) space += '   ';

			menuitem = document.createElement('menuitem');
			menuitem.setAttribute('label', space+headings[i].label);
			menuitem.setAttribute('value', i);
			menuitem.setAttribute('crop', 'end');
			mpopup.appendChild(menuitem);
		}

		mpopup.ex_uri = this.currentURI().split('#')[0];

		return;
	},
 
	// ナビゲーション一覧を生成する 
	updateNavigationsPopup : function(aShouldShowEmpty, aAutoGoNavigation)
	{
		var mpopup = document.getElementById('ext-common-navigations:mpopup');
		if (!mpopup) return;

		var info  = this.contentInfo(),
			links = ('navigations' in info) ? info.navigations : [] ;

		if (!aShouldShowEmpty &&
			'ex_link_uri' in mpopup && mpopup.ex_link_uri &&
			mpopup.ex_link_uri == this.currentURI().split('#')[0] &&
			mpopup.getElementsByTagName('menuitem').length == links.length) return;

		var callBackFunc;
		if (aAutoGoNavigation) {
			this.updateNavigationsAutoGoNavigation = aAutoGoNavigation;
			callBackFunc = function() {
				ExtService.updateNavigationsPopup();
			};
		}

		this.updateNavigations(null, false, callBackFunc)
		links = info.navigations;

		var range = document.createRange();
		range.selectNodeContents(mpopup);
		range.deleteContents();
		range.detach();

		if (!links.length) {
			if (aShouldShowEmpty) {
				var empty = document.createElement('menuitem');
				empty.setAttribute('label',    this.message.emptyItem);
				empty.setAttribute('disabled', true);
				mpopup.appendChild(empty);
			}
			mpopup.ex_uri = '';
			return;
		}

		var label, href, menuitem, stylesheet, j;
		for (var i in links)
		{
			stylesheet = ((links[i].node.rel || '').match(/stylesheet/i));

			// ignore stylesheet
			if (stylesheet) continue;

			if (links.length > 1 && i > 1 && links[i-1] &&
				links[i].elemType != links[i-1].elemType &&
				!stylesheet) {
				mpopup.appendChild(document.createElement('menuseparator'))
					.setAttribute('class', 'menuseparator-ctxextensions');
			}

			menuitem = document.createElement('menuitem');
			menuitem.setAttribute('label', links[i].label);
			menuitem.setAttribute('originalLabel', links[i].node.title || links[i].node.textContent);
			menuitem.setAttribute('value', links[i].href);
			menuitem.setAttribute('statustext', links[i].href);
			if (links[i].linktypes && links[i].linktypes.length) {
				for (j in links[i].linktypes)
				{
					menuitem.setAttribute('ext-navigation-'+links[i].linktypes[j], 'true');
					if (this.utils.getPref('ctxextensions.shortcut.navigations'))
						menuitem.setAttribute('key', 'ext-key-goNavigation:'+links[i].linktypes[j]);
				}
			}
			menuitem.setAttribute('crop', 'center');

			mpopup.appendChild(menuitem);
		}

		mpopup.ex_link_uri = this.currentURI().split('#')[0];

		if (!aAutoGoNavigation &&
			this.updateNavigationsAutoGoNavigation) {
			ExtFunc.goNavigation(this.updateNavigationsAutoGoNavigation);
			this.updateNavigationsAutoGoNavigation = null;
		}

		return;
	},
	updateNavigationsAutoGoNavigation : null,
 
	// 履歴から戻り先/進み先リストを生成 
	makeBackList : function()
	{
		var goMenu = document.getElementById('context-item-go');
		if (!goMenu) return;

		var range  = document.createRange();
		range.selectNodeContents(goMenu);
		range.deleteContents();
		range.detach();

		var history = this.utils.browser.sessionHistory;
		var count   = history.count,
			index   = history.index,
			entry;

		if (count < 1) return true;

		goMenu.appendChild(document.createElement('menupopup'));

		var end = (count > MAX_HISTORY_MENU_ITEMS) ? count-MAX_HISTORY_MENU_ITEMS : 0 ;
		for (var i = count-1; i >= end; i--)
		{
			entry = history.getEntryAtIndex(i, false);
			if (!entry) continue;

			createRadioMenuItem(goMenu.firstChild, i, entry.title, i == index);
		}

		return true;
	},
   
	// preferences listeners 
	
	// ナビゲーション項目のD&D 
	NavigationDNDObserver :
	{
		onDragStart : function(aEvent, aTransferData, aDragAction)
		{
			var node = aEvent.target;
			if (node.localName != 'menuitem') return false;

			var uri   = node.getAttribute('ex-uri') || node.getAttribute('value'),
				label = node.getAttribute('originalLabel') || node.getAttribute('label');

			aTransferData.data = new TransferData();
			aTransferData.data.addDataForFlavour('text/x-moz-url', uri+'\n'+label);
			aTransferData.data.addDataForFlavour('text/html', '<a href="'+uri+'">'+label+'</a>');
			aTransferData.data.addDataForFlavour('text/unicode', uri);
			return true;
		},

		onDragExit : function(aEvent, aSession)
		{
			var node = aEvent.target.parentNode;
			while (node)
			{
				if (node.parentNode.hidePopup)
					node = node.parentNode;

				if (node.hidePopup)
					node.hidePopup();

				node = node.parentNode;
			}
		}
	},
 
	// ショートカットの変更を検知 
	ShortcutPrefListener :
	{
		domain  : 'ctxextensions.shortcut',
		observe : function(aSubject, aTopic, aPrefstring)
		{
			if (aTopic != 'nsPref:changed') return;

			ExtService.updateKey();
		}
	},
 
	RegexpPrefListener : 
	{
		domain  : 'ctxextensions.regexp',
		observe : function(aSubject, aTopic, aPrefstring)
		{
			if (aTopic != 'nsPref:changed') return;

			ExtService.updateRegExp();
		}
	},
 
	UIPrefListener : 
	{
		domain  : 'ctxextensions.submenu.menubar',
		observe : function(aSubject, aTopic, aPrefstring)
		{
			if (aTopic != 'nsPref:changed') return;

			ExtService.showHideMenubarItem(aPrefstring.match(/[^\.]+$/)[0]);
		}
	},
	showHideMenubarItem : function(aName)
	{
		var item = document.getElementById('menu-item-'+aName);
		if (!item) return;

		var visible = !this.utils.getPref('ctxextensions.submenu.menubar.'+aName) &&
			(
				!item.hasChildNodes() ||
				!item.firstChild.builder ||
				item.firstChild.hasChildNodes()
			);
		this.setVisible(item, visible);
		this.setVisible('appmenu-item-'+aName, visible);
	},
 
	RDFObserver : 
	{
		observe : function(aSource, aProperty)
		{
			if (aSource.Value.match(/#urn:\w+:root$/) ||
				aProperty.Value.split('#')[1] == 'Name')
				this.rebuildItems(aSource);
			else if (aProperty.Value.split('#')[1] == 'NewContextItem')
				ExtService.rebuildExtraItems();
		},

		rebuildItems : function(aSource)
		{
			if (!('gExtCallBackStatements' in window))
				window.gExtCallBackStatements = {};

			switch (aSource.Value.match(/#urn:(\w+):/)[1].toString())
			{
				case 'ExecApps':
					window.gExtCallBackStatements.execApps = function() { ExtService.rebuildExecApps(); };
					break;
				case 'CustomScripts':
					window.gExtCallBackStatements.customScripts = function() { ExtService.rebuildCustomScripts(); };
					break;
				case 'SendStr':
					window.gExtCallBackStatements.sendStr = function() { ExtService.rebuildSendStr(); };
					break;
				case 'SerdURI':
					window.gExtCallBackStatements.sendURI = function() { ExtService.rebuildSendURI(); };
					break;
				default:
					break;
			}

			window.setTimeout(this.rebuildCallBackFunc, 1);

		},
		rebuildCallBackFunc : function()
		{
			var count = 0;
			for (var i in gExtCallBackStatements)
			{
				if (!gExtCallBackStatements[i]) continue;

				gExtCallBackStatements[i]();

				gExtCallBackStatements[i] = null;
				count++;
			}
			if (count) ExtService.rebuildExtraItems();
		},

		onAssert: function (aDS, aSource, aProperty, aTarget)
		{
			this.observe(aSource, aProperty);
		},
		onUnassert: function (aDS, aSource, aProperty, aTarget)
		{
			this.observe(aSource, aProperty);
		},
		onChange: function (aDS, aSource, aProperty, aOldTarget, aNewTarget)
		{
			this.observe(aSource, aProperty);
		},
		onMove: function (aDS, aOldSource, aNewSource, aProperty, aTarget)
		{
			this.observe(aNewSource, aProperty);
		},
		onBeginUpdateBatch: function(aDS) {},
		onEndUpdateBatch: function(aDS) {},
		// for old implementation
		beginUpdateBatch: function (aDS) {},
		endUpdateBatch: function (aDS) {}
	}
  
}; 
window.addEventListener('load', ExtService, false);
window.addEventListener('unload', ExtService, false);
  
// カスタムスクリプト内で使用できる短縮構文 

// values
if (!('XHTMLNS' in window)) window.XHTMLNS = ExtService.XHTMLNS;
if (!('XLinkNS' in window)) window.XLinkNS = ExtService.XLinkNS;
if (!('XULNS' in window))   window.XULNS = ExtService.XULNS;
if (!('EXNS' in window))    window.EXNS = ExtService.EXNS;


window.__defineGetter__('_window', function() {
	return gExtContextWindow || ExtService.contentWindow();
});

window.__defineGetter__('_contextualURI', function() {
	return ExtService.contextualURI(false, window._window);
});
window.__defineGetter__('_selection', function() {
	return ExtService.getSelection(window._window);
});
window.__defineGetter__('_selectionSource', function() {
	return ExtService.getSelectionSource(window._window);
});
window.__defineGetter__('_selectionSourceXML', function() {
	return ExtService.getSelectionSource(window._window, null, true);
});
window.__defineGetter__('_selectionNodes', function() {
	return ExtCommonUtils.getSelectionNodes(window._window);
});
window.__defineGetter__('_focusedElement', function() {
	return document.commandDispatcher.focusedElement;
});

// 以前のバージョン
window.__defineGetter__('_getSelection', function() {
	return ExtService.getSelection(window._window);
});
window.__defineGetter__('_getSelectionSource', function() {
	return ExtService.getSelectionSource(window._window);
});
window.__defineGetter__('_getSelectionNodes', function() {
	return ExtCommonUtils.getSelectionNodes(window._window);
});

window.__defineGetter__('_isOnline', function() {
	return ExtService.isOnline;
});
window.__defineGetter__('_inFrame', function() {
	return (window._window != Components.lookupMethod(window._window, 'top').call(window._window));
});

window.__defineGetter__('_popupNode', function() {
	return (window.gContextMenu ? document.popupNode : null );
});


window.__defineGetter__('_profileURI', function() {
	return ExtCommonUtils.getURISpecFromKey('ProfD');
});

window.__defineGetter__('_installedURI', function() {
	return ExtCommonUtils.getURISpecFromKey('CurProcD');
});

window.__defineGetter__('_temporaryURI', function() {
	return ExtCommonUtils.getURISpecFromKey('TmpD');
});

window.__defineGetter__('_homeURI', function() {
	return ExtCommonUtils.getURISpecFromKey('Home');
});

window.__defineGetter__('_profilePath', function() {
	return ExtCommonUtils.getFileFromURLSpec(_profileURI).path;
});

window.__defineGetter__('_installedPath', function() {
	return ExtCommonUtils.getFileFromURLSpec(_installedURI).path;
});

window.__defineGetter__('_temporaryPath', function() {
	return ExtCommonUtils.getFileFromURLSpec(_temporaryURI).path;
});

window.__defineGetter__('_homePath', function() {
	return ExtCommonUtils.getFileFromURLSpec(_homeURI).path;
});

var dummyFunc = function() {};
window.__defineSetter__('_window', dummyFunc);
window.__defineSetter__('_contextualURI', dummyFunc);
window.__defineSetter__('_selection', dummyFunc);
window.__defineSetter__('_selectionSource', dummyFunc);
window.__defineSetter__('_selectionSourceXML', dummyFunc);
window.__defineSetter__('_selectionNodes', dummyFunc);
window.__defineSetter__('_focusedElement', dummyFunc);
window.__defineSetter__('_getSelection', dummyFunc);
window.__defineSetter__('_getSelectionSource', dummyFunc);
window.__defineSetter__('_getSelectionNodes', dummyFunc);
window.__defineSetter__('_isOnline', dummyFunc);
window.__defineSetter__('_inFrame', dummyFunc);
window.__defineSetter__('_popupNode', dummyFunc);
window.__defineSetter__('_profileURI', dummyFunc);
window.__defineSetter__('_installedURI', dummyFunc);
window.__defineSetter__('_temporaryURI', dummyFunc);
window.__defineSetter__('_homeURI', dummyFunc);
window.__defineSetter__('_profilePath', dummyFunc);
window.__defineSetter__('_installedPath', dummyFunc);
window.__defineSetter__('_temporaryPath', dummyFunc);
window.__defineSetter__('_homePath', dummyFunc);



// functions
function _selectButton(aText, aButtons)
{
	return _selectButtonWithTitle(null, aText, aButtons);
};
function _selectButtonWithTitle(aTitle, aText, aButtons)
{
	return ExtCommonUtils.PromptService.confirmEx(
			window,
			aTitle || ExtCommonUtils.getMsg('customScripts_shortExpression_selectButton_title'),
			aText || '',
			(
				(aButtons.length ? (ExtCommonUtils.PromptService.BUTTON_TITLE_IS_STRING * ExtCommonUtils.PromptService.BUTTON_POS_0) : 0) +
				(aButtons.length > 1 ? (ExtCommonUtils.PromptService.BUTTON_TITLE_IS_STRING * ExtCommonUtils.PromptService.BUTTON_POS_1) : 0) +
				(aButtons.length > 2 ? (ExtCommonUtils.PromptService.BUTTON_TITLE_IS_STRING * ExtCommonUtils.PromptService.BUTTON_POS_2) : 0)
			),
			aButtons.length ? aButtons[0] : null ,
			aButtons.length > 1 ? aButtons[1] : null ,
			aButtons.length > 2 ? aButtons[2] : null ,
			null,
			{}
		);
};
function _selectList(aText, aListItems)
{
	return _selectListWithTitle(null, aText, aListItems);
};
function _selectListWithTitle(aTitle, aText, aListItems)
{
	var data = {};
	return (ExtCommonUtils.PromptService.select(
			window,
			aTitle || ExtCommonUtils.getMsg('customScripts_shortExpression_selectList_title'),
			aText,
			aListItems.length,
			aListItems,
			data
		)) ? data.value : -1 ;
};

function _getTopWindowOf(aType)
{
	return ExtCommonUtils.getTopWindowOf(aType);
};
function _getWindowsOf(aType)
{
	return ExtCommonUtils.getWindowsOf(aType);
};

function _loadURI(uri, ref)
{
	return ExtService.loadURI(uri, ref, false, true);
};
function _openNewWindow(uri, ref)
{
	return ExtService.openNewWindow(uri, ref);
};
function _openNewTab(uri, ref)
{
	return ExtService.openNewTab(uri, ref, true);
};

function _loadURIAndDo()
{
	var b = ExtService.loadURI(arguments[0], arguments[1], false, true);
	var funcs = Array.slice(arguments);
	funcs.splice(0, 2);
	ExtService.doAfterLoaded(b, arguments[0], funcs);

	return b;
};
function _openNewWindowAndDo()
{
	var w = ExtService.openNewWindow(arguments[0], arguments[1]);
	var funcs = Array.slice(arguments);
	funcs.splice(0, 2);
	ExtService.doAfterLoaded(w, arguments[0], funcs);

	return w;
};
function _openNewTabAndDo()
{
	var t = ExtService.openNewTab(arguments[0], arguments[1], true);
	var funcs = Array.slice(arguments);
	funcs.splice(0, 2);
	ExtService.doAfterLoaded(t, arguments[0], funcs);

	return t;
};


function _read(filePathOrFile)
{
	return ExtCommonUtils.readFrom(filePathOrFile);
};
function _readFrom(filePathOrFile)
{
	return ExtCommonUtils.readFrom(filePathOrFile);
};
function _write(filePathOrFile, content, aFlags)
{
	return ExtCommonUtils.writeTo(content, filePathOrFile, aFlags);
};
function _writeTo(content, filePathOrFile, aFlags)
{
	return ExtCommonUtils.writeTo(content, filePathOrFile, aFlags);
};

function _saveURIAs(aURI, aFilePathOrFile, aFlags)
{
	return ExtCommonUtils.saveURIAs(aURI, (aFilePathOrFile || _chooseFileToSave()), aFlags);
};
function _saveURIInBackgroundAs(aURI, aFilePathOrFile, aFlags)
{
	return ExtCommonUtils.saveURIInBackgroundAs(aURI, (aFilePathOrFile || _chooseFileToSave()), aFlags);
};

function _zipFilesAs(aFiles, aZip, aComporessionLevel)
{
	ExtCommonUtils.zipFilesAs(aFiles, aZip, aComporessionLevel);
};

function _evalInSandbox(aCode, aOwner)
{
	return ExtCommonUtils._evalInSandbox(aCode, aOwner);
};

function _run(filepath, args)
{
	 ExtService.run(filepath, args);
};
function _include(filepathOrURI)
{
	 ExtCommonUtils.include(filepathOrURI);
};

function _chooseFile(aTitle, aDefault, aFilter)
{
	return ExtCommonUtils.chooseFile(
			aTitle,
			aDefault,
			(aFilter ? [aFilter, aFilter] : null)
		);
};
function _chooseFiles(aTitle, aDefault, aFilter)
{
	return ExtCommonUtils.chooseFile(
			aTitle,
			aDefault,
			(aFilter ? [aFilter, aFilter] : null),
			Components.interfaces.nsIFilePicker.modeOpenMultiple
		);
};
function _chooseFolder(aTitle, aDefault)
{
	return ExtCommonUtils.chooseFile(
			aTitle,
			aDefault,
			null,
			Components.interfaces.nsIFilePicker.modeGetFolder
		);
};
function _chooseFileToSave(aTitle, aDefault, aFilter)
{
	return ExtCommonUtils.chooseFile(
			aTitle,
			aDefault,
			(aFilter ? [aFilter, aFilter] : null),
			Components.interfaces.nsIFilePicker.modeSave
		);
};

function _setPref(prefstring, value)
{
	 ExtCommonUtils.setPref(prefstring, value);
};
function _getPref(prefstring)
{
	 return ExtCommonUtils.getPref(prefstring);
};
function _clearPref(prefstring)
{
	 ExtCommonUtils.clearPref(prefstring);
};
function _clearUserPref(prefstring)
{
	 ExtCommonUtils.clearPref(prefstring);
};

function _setClipBoard(string)
{
	 ExtCommonUtils.setStringToClipBoard(string);
};
function _getClipBoard()
{
	return ExtCommonUtils.getStringFromClipBoard();
};
function _convertCharset()
{
	var string = arguments[0],
		target;
	switch (arguments.length)
	{
		case 1:
			return string;
			break;
		case 2:
			target = arguments[1];
			break;
		default:
			ExtCommonUtils.UCONV.charset = arguments[1];
			string = ExtCommonUtils.UCONV.ConvertToUnicode(string);
			target = arguments[2];
			break;
	}
	ExtCommonUtils.UCONV.charset = target;
	return ExtCommonUtils.UCONV.ConvertFromUnicode(string);
};
function _convertCharsetFrom(aString, aFrom)
{
	ExtCommonUtils.UCONV.charset = aFrom;
	return ExtCommonUtils.UCONV.ConvertToUnicode(aString);
};


function _up(aWindow)
{
	 ExtFunc.doCommand('Up', aWindow || _window);
};
function _goNextHeading(aWindow)
{
	 ExtFunc.goHeadings('next', null, aWindow || _window);
};
function _goPrevHeading(aWindow)
{
	 ExtFunc.goHeadings('prev', nill. aWindow || _window);
};

function _goJSPanel()
{
	ExtFunc.doCommand('JSPanel');
};
function _getLinks(regexp_str, copyToClipBoard, aWindow)
{
	 return ExtFunc.getLinks(regexp_str, aWindow || _window, !copyToClipBoard);
};
function _getLinksWithNode(regexp_str, aWindow)
{
	 return ExtService.getLinksArray(regexp_str, aWindow || _window, true);
};

function _showComments(aWindow)
{
	 ExtFunc.showComment(aWindow || _window);
};
function _showLinks(aWindow)
{
	 ExtFunc.showLink(aWindow || _window);
};
function _showIDs(aWindow)
{
	 ExtFunc.showID(aWindow || _window);
};
function _showCites(aWindow)
{
	 ExtFunc.showCite(aWindow || _window);
};
function _showTitles(aWindow)
{
	 ExtFunc.showTitle(aWindow || _window);
};
function _showEvents(aWindow)
{
	 ExtFunc.showEventHandler(aWindow || _window);
};
function _showAll(aWindow)
{
	 ExtFunc.doCommand('showAll', aWindow || _window);
};

function _SendURITo(aURI, aIDOrIndex)
{
	ExtFunc.SendURI(ExtService.getIDFromIndex(aIDOrIndex), null, aURI);
};
function _SendStringTo(aString, aIDOrIndex)
{
	ExtFunc.SendStr(ExtService.getIDFromIndex(aIDOrIndex), aString);
};
function _OpenWithApp(aURI, aString, aIDOrIndex)
{
	ExtFunc.SendURI(ExtService.getIDFromIndex(aIDOrIndex), null, aURI);
};

function _CustomScript(aIDOrIndex, aWindow)
{
	return _runCustomScript(aIDOrIndex, aWindow);
};
function _runCustomScript(aIDOrIndex, aWindow)
{
	var originalContextWindow = _window; // save the context window

	var retValue = ExtFunc.CustomScripts(ExtService.getIDFromIndex(aIDOrIndex), null, aWindow || _window);

	_window = originalContextWindow; // restore the context window

	return retValue;
};


function _getCookie(name, aWindow)
{
	var d = (aWindow || _window).document;

	var cookie = (d.cookie) ? d.cookie.split(/ *; */) : [] ;
	for (var i in cookie)
	{
		if (cookie[i].split(/ *= */)[0].replace(/^ +| +$/g, '') == name)
			return ExtCommonUtils.unescapeString(cookie[i].split(/ *= */)[1].replace(/^ +| +$/g, ''));
	}
	return '';
};
function _putCookie(name, value, expire, path, aWindow)
{
	var d = (aWindow || _window).document;

	var uri = d.URL;
	if (!uri ||
		uri.match(/^[^:\/]+:[^:\/]+:\//) ||
		uri.substring(0, 6).toLowerCase() == 'about:') return;

	limit = limit || 0 ;
	var today = new Date();
		today.setTime(today.getTime()+1000*60*60*24*limit);
	var date = ';expires='+today.toGMTString();

	var cookieStr = name+'='+escape(data)+date;

	if (path) cookieStr += ';path='+path;

	d.cookie = cookieStr;
	return;
};
function _getInnerText(node)
{
	 return node.textContent;
};

function _getStackTrace()
{
	var stacks = [];
	var stack = Components.stack;
	while (stack = stack.caller)
	{
		stacks.push(stack);
	}
	return stacks;
};

function _inspect(aObject)
{
	var inspected = [];
	var results = [];
	return Array.slice(arguments).map(function(aObject) {
		if (aObject === null) {
			return 'null';
		}
		else if (aObject === void(0)) {
			return 'undefined';
		}
		else if (!aObject.__proto__) {
			return aObject.toString();
		}
		var index = inspected.indexOf(aObject);
		if (index > -1) {
			return results[index];
		}
		var result = '';
		if (aObject instanceof Array) {
			aObject.forEach(function(aObject) {
				inspected.push(aObject);
				results.push(aObject.toString());
			});
			result = '['+aObject.map(arguments.callee).join(', ')+']';
		}
		else if (typeof aObject == 'object') {
			var names = [];
			for (var i in aObject)
			{
				names.push(i);
				try {
					inspected.push(aObject[i]);
				results.push(aObject[i].toString());
				}
				catch(e) {
				}
			}
			names.sort();
			result = '{'+
				names.map(function(aName) {
					var namePart = '"'+aName.replace(/"/g, '\\"')+'": ';
					try {
						return namePart+this(aObject[aName]);
					}
					catch(e) {
						return namePart+'???';
					}
				}, arguments.callee).join(', ')+
				'}';
		}
		else if (typeof aObject == 'string') {
			result = '"'+aObject.replace(/"/g, '\\"')+'"';
		}
		else {
			result = aObject.toString();
		}
		inspected.push(aObject);
		results.push(result);
		return result;
	}).join(', ');
};

function _inspectDOMNode(aNode)
{
	var self = arguments.callee;
	var result;
	switch (aNode.nodeType)
	{
		case Node.ELEMENT_NODE:
		case Node.DOCUMENT_NODE:
		case Node.DOCUMENT_FRAGMENT_NODE:
			result = Array.slice(aNode.childNodes).map(function(aNode) {
					return self(aNode);
				}).join('');
			break;

		case Node.TEXT_NODE:
			result = aNode.nodeValue
						.replace(/&/g, '&ampt;')
						.replace(/</g, '&lt;')
						.replace(/>/g, '&gt;')
						.replace(/"/g, '&quot;');
			break;

		case Node.CDATA_SECTION_NODE:
			result = '<![CDATA['+aNode.nodeValue+']]>';
			break;

		case Node.COMMENT_NODE:
			result = '<!--'+aNode.nodeValue+'-->';
			break;

		case Node.ATTRIBUTE_NODE:
			result = aNode.name+'="'+
						aNode.value
							.replace(/&/g, '&ampt;')
							.replace(/</g, '&lt;')
							.replace(/>/g, '&gt;')
							.replace(/"/g, '&quot;')+
						'"';
			break;

		case Node.PROCESSING_INSTRUCTION_NODE:
			result = '<?'+aNode.target+' '+aNode.data+'?>';
			break;

		case Node.DOCUMENT_TYPE_NODE:
			result = '<!DOCTYPE'+aNode.name+
						(aNode.publicId ? ' '+aNode.publicId : '' )+
						(aNode.systemId ? ' '+aNode.systemId : '' )+
						'>';
			break;

		case Node.ENTITY_NODE:
		case Node.ENTITY_REFERENCE_NODE:
		case Node.NOTATION_NODE:
		default:
			return '';
	}

	if (aNode.nodeType == Node.ELEMENT_NODE) {
		result = '<'+
			aNode.localName+
			(aNode.namespaceURI ? ' xmlns="'+aNode.namespaceURI+'"' : '' )+
			Array.slice(aNode.attributes).map(function(aAttr) {
				return ' '+self(aAttr);
			}).sort().join('')+
			(result ? '>' : '/>' )+
			(result ? result+'</'+aNode.localName+'>' : '' );
	}
	return result;
}
 
