// 
if (!('extProgressManagers' in window))
	window.extProgressManagers = [];
 
// static class "ExtService" 
var ExtService = {
	XHTMLNS : 'http://www.w3.org/1999/xhtml',
	XLinkNS : 'http://www.w3.org/1999/xlink',
	XULNS   : 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul',
	EXNS    : 'http://piro.sakura.ne.jp/ctxextensions',
	
//============================== Generic Values ===============================
// �v���p�e�B 
	
	debug : false, 
 
	// ��� 
	
	// ���݂̃h�L�������g��URI��HTTP�X�L�[�����܂ނ��ǂ��� 
	get isHTTP()
	{
		return (this.contextualURI().match(/^https?:\/\//));
	},
 
	// ���݂̃h�L�������g��Web�y�[�W���ǂ����i�ȈՁj 
	get isWebPage()
	{
		var contentType = this.contentDocument().contentType;
		return contentType.match(/^(text|application)\/(xml|x?html)/);
	},
 
	// Mozilla���I�����C�����ǂ��� 
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
 
	get hasCustomScripts() 
	{
		var popup = document.getElementById('ext-common-customScripts:mpopup');
		return popup && popup.hasChildNodes();
	},
 
	get hasExecApps() 
	{
		var mpopup = document.getElementById('ext-common-execApps:mpopup');
		return mpopup && mpopup.hasChildNodes() && mpopup.lastChild.localName == 'menuitem';
	},
  
	// XPConnect Wraped Object 
	get PROCESS()
	{
		if (!this._process)
			this._process = Components.classes['@mozilla.org/process/util;1'].getService(Components.interfaces.nsIProcess);
		return this._process;
	},
	_process : null,
  
	// content 
	
	// ���݂̃t���[���̓��e��Ԃ� 
	// force�t���O������ꍇ���̓t���[����������Ȃ��ꍇ�A�g�b�v���x���̃t���[����Ԃ��B

	contentWindow : function(aForce)
	{
		var focusedWindow = document.commandDispatcher.focusedWindow;
		return (
				aForce ||
				!focusedWindow ||
				focusedWindow == window ||
				Components.lookupMethod(focusedWindow, 'top').call(focusedWindow) == window
			) ?
				gBrowser.contentWindow :
				focusedWindow ;
	},

	contentDocument : function(aForce)
	{
		var focusedWindow = document.commandDispatcher.focusedWindow;
		return (
				aForce ||
				!focusedWindow ||
				focusedWindow == window ||
				Components.lookupMethod(focusedWindow, 'top').call(focusedWindow) == window
			) ?
				gBrowser.contentDocument :
				focusedWindow.document ;
	},

	currentURI : function(aForce)
	{
		var d = this.contentDocument(aForce);
		return Components.lookupMethod(d, 'URL').call(d);
	},

	contentStyles : function(aForce)
	{
		var d = this.contentDocument(aForce);
		return Components.lookupMethod(d, 'styleSheets').call(d);
	},

	contentInfo : function(aForce, aWindow)
	{
		var d = (aWindow ? aWindow.document : this.contentDocument(aForce) );
		if (!d.__mozInfo__) d.__mozInfo__ = {};
		return d.__mozInfo__;
	},
 
	// �����N�̏�ł̓����N��URI�A����ȊO�̏ꍇ�̓h�L�������g��URI���A�� 
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
		var node = this.utils.findParentNodeWithAttr(document.popupNode, 'q', 'cite') ||
				this.utils.findParentNodeWithAttr(document.popupNode, 'blockquote', 'cite');
		if (!node) return '';

		var cite = ('cite' in node && node.cite) ? node.cite :
				node.getAttribute('cite') ||
				node.getAttributeNS(this.XHTMLNS, 'cite') ||
				'';
		return this.utils.makeURIAbsolute(node.baseURI, cite);
	},
 
	getCiteForEdit : function() 
	{
		var node = this.utils.findParentNodeWithAttr(document.popupNode, 'del', 'cite') ||
				this.utils.findParentNodeWithAttr(document.popupNode, 'ins', 'cite');
		if (!node) return '';

		var cite = ('cite' in node && node.cite) ? node.cite :
				node.getAttribute('cite') ||
				node.getAttributeNS(this.XHTMLNS, 'cite') ||
				'';
		return this.utils.makeURIAbsolute(node.baseURI, cite);
	},
 
	getLongdesc : function() 
	{
		var node = this.utils.findParentNodeWithAttr(document.popupNode, 'img', 'longdesc');
		if (!node) return '';

		var longdesc = ('longdesc' in node && node.longdesc) ? node.longdesc :
				node.getAttribute('longdesc') ||
				node.getAttributeNS(this.XHTMLNS, 'longdesc') ||
				'';
		return this.utils.makeURIAbsolute(node.baseURI, longdesc);
	},
  
//================================ Initialize =================================
	// ������ 
	init : function()
	{
		if (this.activated) return;
		this.activated = true;


		var frameItems = [
				'context-item-sendURI-frame',
				'context-item-execApps-frame'
			];
		var framePopup = document.getElementById('frame').lastChild;
		framePopup.appendChild(document.createElement('menuseparator'));
		for (var i in frameItems)
			framePopup.appendChild(document.getElementById(frameItems[i]));


		// ���x��������̏�����
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

		this.initMenu();          // �e���j���[�̏�����
		this.overrideFunctions(); // �W���̊֐��̏㏑��
		this.updateKey();
		this.updateRegExp();      // ���K�\���̓ǂݍ���
		this.initEvents();        // �C�x���g���̏����̏�����

		window.setTimeout('ExtService.initDelay();', 0);

		delete this.init;
		return;
	},
	initDelay : function()
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
				'openSelectionAsURI',
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
				'styleSheets',
				'up'
			];
		for (i = 0; i < prefs.length; i++)
			this.showHideMenubarItem(prefs[i]);


		// autoexec on startup
		var CSObj = this.utils.CUSTOMSCRIPTS,
			item,
			ret;
		for (i = 0; i < CSObj.length; i++)
		{
			item = CSObj.item(i);
			if (CSObj.getData(item, 'Startup') == 'true')
				ret = ExtFunc.CustomScripts(CSObj.getData(item, 'Name'));
		}
	},
	
	// ���j���[�̏����� 
	initMenu : function()
	{
		this.rebuildStyleSheets();
		this.rebuildExecApps();
		this.rebuildCustomScripts();
		this.rebuildSendStr();
		this.rebuildSendURI();


		// �R���e�L�X�g���j���[�J���Ƀ��j���[���ڂ��X�V
		var context = this.utils.contextMenu;
		if (context)
			context.addEventListener('popupshowing', this.onContextMenuPopupShowing, true);

		// ���j���[�̍ő啝��ݒ�
		var style_value;
		style_value = 'max-width:'+this.utils.getPref('ctxextensions.width.navigations')+'em;';
		this.insertAttribute('ext-common-navigationsSelect:mpopup', 'style', style_value);
		this.insertAttribute('ext-common-navigations:mpopup', 'style', style_value);
		this.insertAttribute('menu-item-navigations:mpopup', 'style', style_value);
		this.insertAttribute('menu-item-navigations:mpopup:submenu', 'style', style_value);
		this.insertAttribute('context-item-navigations:mpopup', 'style', style_value);
		this.insertAttribute('context-item-navigations:mpopup:submenu', 'style', style_value);

		style_value = 'max-width:'+this.utils.getPref('ctxextensions.width.outline')+'em;';
		this.insertAttribute('ext-common-outline:mpopup', 'style', style_value);
		this.insertAttribute('menu-item-outline:mpopup', 'style', style_value);
		this.insertAttribute('menu-item-outline:mpopup:submenu', 'style', style_value);
		this.insertAttribute('context-item-outline:mpopup', 'style', style_value);
		this.insertAttribute('context-item-outline:mpopup:submenu', 'style', style_value);



		// �����炠��u�X�^�C���V�[�g�v���j���[���B��
		var StyleSheets = document.getElementById('view-item-styleSheets');
		if (StyleSheets)
			StyleSheets.nextSibling.hidden = true;


		// �L�[�{�[�h�V���[�g�J�b�g����|�b�v�A�b�v���J���L�[�{�[�h�V���[�g�J�b�g�̐ݒ�
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
		return;
	},
 
	// �W���̊֐��̏㏑�� 
	overrideFunctions : function()
	{

		// �\�[�X�\���̏�����
		window.__ctxextensions__BrowserViewSourceOfDocument = window.BrowserViewSourceOfDocument;
		window.BrowserViewSourceOfDocument = function(aDocument)
		{
			return ExtService.viewSourceOf('document', aDocument);
		};

		window.__ctxextensions__BrowserViewSourceOfURL = window.BrowserViewSourceOfURL;
		window.BrowserViewSourceOfURL = function(aURI, aCharset, aPageCookie)
		{
			return ExtService.viewSourceOf('url', aURI, aCharset, aPageCookie);
		};

		nsContextMenu.prototype.__ctxextensions__viewPartialSource = nsContextMenu.prototype.viewPartialSource;
		nsContextMenu.prototype.viewPartialSource = function(aContext)
		{
			return ExtService.viewSourceOf('partial', aContext, this);
		};


		// ���e�̈���N���b�N�����ۂ̏���
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

		// MUA�̃I�[�o�[���C�h
		window.__ctxextensions__handleLinkClick = window.handleLinkClick;
		window.handleLinkClick = function(aEvent, aURI, aNode)
		{
			var mailer;
			if (!ExtCommonUtils.getPref('network.protocol-handler.external.mailto')) {
				mailer = ExtCommonUtils.getPref('ctxextensions.override.mailer.webmail.enable') ? ExtCommonUtils.getPref('ctxextensions.override.mailer.webmail.path') : ExtCommonUtils.getPref('ctxextensions.override.mailer.path') ;
			}

			if (
				mailer &&
				aURI && aURI.match(/^mailto:/) &&
				aEvent.button < 2 &&
				!aEvent.shiftKey // Shift�{�N���b�N�̏ꍇ�A�f�t�H���g�̓���B
				)
				{
				aEvent.preventDefault();
				aEvent.stopPropagation();

				ExtService.runMailer(aURI);

				return true;
			}

			return __ctxextensions__handleLinkClick(aEvent, aURI, aNode);
		};

		// MUA�̃I�[�o�[���C�h�i�u�y�[�W�𑗂�v�j
		if ('sendPage' in window) {
			window.__ctxextensions__sendPage = window.sendPage;
			window.sendPage = function(aDocument)
			{
				var mailer;
				if (!ExtCommonUtils.getPref('network.protocol-handler.external.mailto')) {
					mailer = ExtCommonUtils.getPref('ctxextensions.override.mailer.webmail.enable') ? ExtCommonUtils.getPref('ctxextensions.override.mailer.webmail.path') : ExtCommonUtils.getPref('ctxextensions.override.mailer.path') ;
				}

				if (mailer) {
					if (!aDocument)
						aDocument = gBrowser.contentDocument;

					var uri   = aDocument.URL;
					var title = Components.lookupMethod(aDocument, 'title').call(aDocument);
					ExtService.runMailer(null, title, uri);
				}
				else {
					window.__ctxextensions__sendPage(aDocument);
				}
			};
		}

		// �t���X�N���[�����[�h����̕��A
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

	runMailer : function(aURI, aPageTitle, aPageURI)
	{
		var mailer = ExtCommonUtils.getPref('ctxextensions.override.mailer.webmail.enable') ? ExtCommonUtils.getPref('ctxextensions.override.mailer.webmail.path') : ExtCommonUtils.getPref('ctxextensions.override.mailer.path') ;
		if (!aURI) aURI = '';

		if (this.utils.getPref('ctxextensions.override.mailer.webmail.enable')) {
			mailer = this.replaceMailArgumentsFromURI(mailer, aURI);
			if (aPageTitle)
				mailer = mailer.replace(/%pagetitle/gi, aPageTitle);
			if (aPageURI)
				mailer = mailer.replace(/%pageur[il]/gi, aPageURI);

			if (this.utils.getPref('ctxextensions.override.mailer.webmail.usetab'))
				this.openNewTab(mailer, null, true);
			else
				window.openDialog(this.utils.browserURI, '_blank', 'chrome,all,dialog=no', mailer);

			return;
		}

		var params  = { value : [] };
		var options = this.replaceMailArgumentsFromURI(this.utils.getPref('ctxextensions.override.mailer.options'), aURI, params);
		if (aPageTitle)
			options = options.replace(/%pagetitle/gi, aPageTitle);
		if (aPageURI)
			options = options.replace(/%pageur[il]/gi, aPageURI);

		if (params.value && params.value.length &&
			options.indexOf(params.value[0]) < 0)
			options = (options) ? params.value[0]+' '+options : params.value[0] ;

		this.run(mailer, options);
	},

	// ���[���A�h���X�ւ̃����N�����߂���iRFC2368�`���ɏ����j
	replaceMailArgumentsFromURI : function(aBaseString, aURI, aOutArray)
	{
		var params = [
				aURI.match(/^mailto:([^?]+)/) ? RegExp.$1 : '' ,
				aURI.match(/subject=([^?]+)/) ? RegExp.$1 : '' ,
				aURI.match(/[^b]cc=([^?]+)/) ? RegExp.$1 : '' ,
				aURI.match(/bcc=([^?]+)/) ? RegExp.$1 : '' ,
				aURI.match(/body=([^?]+)/) ? RegExp.$1 : ''
			];

		var charset = this.utils.getPref('ctxextensions.override.mailer.charset');
		if (charset != 'UTF-8') {
			this.utils.UCONV.charset = charset;

			var webMail = ExtCommonUtils.getPref('ctxextensions.override.mailer.webmail.enable');

			for (var i in params)
			{
				if (!params[i]) continue;
				params[i] = decodeURI(params[i]);
				params[i] = this.utils.UCONV.ConvertFromUnicode(params[i]);
				if (webMail)
					params[i] = this.utils.byteEscape(params[i]);
			}
		}

		if (aOutArray) aOutArray.value = params;

		return aBaseString.replace(/%to/ig, params[0])
				.replace(/%subject/ig, params[1])
				.replace(/%cc/ig, params[2])
				.replace(/%bcc/ig, params[3])
				.replace(/%body/ig, params[4]);
	},
 
	initEvents : function() 
	{
		var content = document.getElementById('content');
		if (content) {
			window.addEventListener('fullscreen', this.onFullScreen, false);
			content.addEventListener('keypress', window.contentAreaClick, true);
			content.addEventListener('mouseover', this.onMouseOver, true);
			content.addEventListener('load', this.onContentLoad, true);
		}

		// catch the event to start FindTypeAhead
		window.addEventListener('keypress', this.onKeyPress, true);


		var b = this.utils.browser;
		// �^�u�����Ƃ��ɁA�G���[�̌��ɂȂ肻���Ȃ��̂͌�n�����Ă����B
		b.__ctxextensions__removeTab = b.removeTab;
		b.removeTab = function(aTab, aTabExtFlags) {
			var b = this.getBrowserForTab(aTab);

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

			return this.__ctxextensions__removeTab(aTab, aTabExtFlags);
		};

		delete this.initEvents;
		return;
	},
	
	onContentLoad : function(aEvent) 
	{
		var w = aEvent.originalTarget;
		if (w.defaultView) w = w.defaultView;
		if (!w.document) return;

		try {
			ExtFunc.RestoreSelectedStyle(w);
			ExtFunc.AddOptionalStyleSheets(w);
			ExtFunc.ApplyCustomUserStyleRules(w);
		}
		catch(e) {
			if (ExtService.debug) alert('OnEvent:\n\n'+e);
		}

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
 
	// �v�f���|�C���g���ꂽ�ۂ̏��� 
	onMouseOver : function(aEvent)
	{
		var ES = ExtService;

		var target = aEvent.target;

		// cite�̓��e���X�e�[�^�X�o�[�ɕ\��
		if (!ExtCommonUtils.getPref('ctxextensions.enable.cite_as_href')) return false;

		if (/q|blockquote|ins|del/i.test(target.localName)) {
			target = ExtCommonUtils.findParentNodeWithLocalName(aEvent.target, 'q') ||
					ExtCommonUtils.findParentNodeWithLocalName(aEvent.target, 'blockquote') ||
					ExtCommonUtils.findParentNodeWithLocalName(aEvent.target, 'ins') ||
					ExtCommonUtils.findParentNodeWithLocalName(aEvent.target, 'del') ;
		}
		if (target.cite && !('ex_onmouseout' in target)) {
			window.status       = target.cite;
			target.style.cursor = 'pointer';
			target.addEventListener('mouseover', ES.onMouseOverSetStatus, true);
			target.addEventListener('mouseout', ES.onMouseOutRemoveStatus, true);
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
 
	onContextMenuPopupShowing : function(aEvent) 
	{
		if (aEvent.target.id == ExtCommonUtils.contextMenu.id)
			ExtService.updateContextMenu();
	},
 
	onFullScreen : function(aEvent) 
	{
		window.setTimeout(
			function()
			{
				var items = [
						'customScripts',
						'execApps',
						'getLinks',
						'JSPanel',
						'navigations',
						'nextHeading',
						'openSelectionAsURI',
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
						'styleSheets',
						'up'
					];
				for (var i in items)
					ExtService.showHideMenubarItem(items[i]);
			},
			0
		);
	},
  
	// �����l�̐ݒ� 
	activated : false,

	utils : ExtCommonUtils,

	message                  : {},
	downloadManagers         : [],
	appendStyleSheetManagers : [],
	selectStyleSheetManagers : [],

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


	XHTMLNS : 'http://www.w3.org/1999/xhtml',
	XLinkNS : 'http://www.w3.org/1999/xlink',
	XULNS   : 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul',
	EXNS    : 'http://piro.sakura.ne.jp/ctxextensions',
  
	// Utilities 
	
	// URI����f�B���N�g���𔲂��o�� 
	getCurrentDir : function(aURI)
	{
		return this.utils.getCurrentDir(aURI || this.currentURI());
	},
	
	// URI����e�f�B���N�g���𔲂��o�� 
	getParentDir : function(aURI)
	{
		return this.utils.getParentDir(aURI || this.currentURI());
	},
 
	// �e�f�B���N�g�������[�g�܂ŒH��A�z��Ƃ��ĕԂ� 
	getParentDirs : function(aURI)
	{
		return this.utils.getParentDirs(aURI || this.currentURI());
	},
  
	// filepath�Ŏw�肳�ꂽ�A�v���P�[�V�������Aargs�������Ƃ��ċN������ 
	run : function(aFilepath, aArgs)
	{
		// �n���ꂽ�������z��̌`�ɂȂ��Ă��Ȃ��ꍇ�̏���
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
		this.PROCESS.init(app);
		this.PROCESS.run(false, aArgs, aArgs.length, {});
		return this.PROCESS;
	},
 
	// �J�X�^���X�N���v�g�Ȃǂ̃C���f�b�N�X����ID��Ԃ� 
	getIDFromIndex : function(aIDOrIndex, aObjID)
	{
		if (typeof aIDOrIndex == 'number')
			aIDOrIndex = this.utils[aObjID].getData(this.utils[aObjID].item(aIDOrIndex), 'Name');
		return aIDOrIndex;
	},
 
	// �����N�^�C�v�������������Ԃ� 
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
	
	// �����N�^�C�v�𑵂��� 
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
	
	// rev > rel �̕ϊ��e�[�u�� 
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
  
	// �����N��URI���烊���N�^�C�v�𐄑����� 
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
 
	// �C�x���g���L�[�{�[�h�֌W�Ŋ��e�L�X�g�t�H�[���֌W���瑗��ꂽ���ǂ��� 
	// �t�H�[�����ŃL�[��P�Ƃŉ�������AShift+�L�[�����������肵���ꍇ�́Afalse��Ԃ��B
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
 
	// �����̑��� 
	
	// �I�𕶎���𓾂� 
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
  
	// �����N��URI�ƃ����N�̗v�f�̔z��𓾂�i���K�\���Ńt�B���^�����O�j 
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
		var links = this.utils.concatArray(
				aWindow.document.getElementsByTagName('A'),
				aWindow.document.getElementsByTagName('AREA'),
				aWindow.document.getElementsByTagName('LINK'),
				aWindow.document.getElementsByTagName(this.XHTMLNS, 'a'),
				aWindow.document.getElementsByTagName(this.XHTMLNS, 'area'),
				aWindow.document.getElementsByTagName(this.XHTMLNS, 'link')
			);
		if (aShouldFollowFrames &&
			aWindow.frames &&
			aWindow.frames.length)
			for (var i = 0; i < aWindow.frames.length; i++)
				links = links.concat(this.getLinksNodesInWindow(aWindow.frames[i], true));

		return links;
	},
  
	// XUL�̑��� 
	
	// �w�肵��document�I�u�W�F�N�g��contentDocument�Ƃ��ĕێ����Ă���u���E�U��Ԃ� 
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
 
	// �w���id�����v�f��flag�ɏ]���L���ɂ��� 
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
 
	// �w���id�����v�f��flag�ɏ]���\������ 
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
 
	// �w���id�����v�f�̃��x����ύX���� 
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
 
	// �w���id�����v�f�̑����l�𓾂� 
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
 
	// �w���id�����v�f�ɑ����l��}������ 
	insertAttribute : function(aTarget, aAttr, aValue)
	{
		aTarget = (aTarget.localName) ? aTarget : document.getElementById(aTarget) ;
		if (aTarget) aTarget.setAttribute(aAttr, aValue + aTarget.getAttribute(aAttr));
	},
 
	// �w���id�����v�f�ɑ����l��ǉ����� 
	appendAttribute : function(aTarget, aAttr, aValue)
	{
		aTarget = (aTarget.localName) ? aTarget : document.getElementById(aTarget) ;
		if (aTarget) aTarget.setAttribute(aAttr, aTarget.getAttribute(aAttr) + aValue);
	},
 
	// �|�b�v�A�b�v���j���[�𕡐����� 
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
 
	// �|�b�v�A�b�v��\�� 
	showPopup : function(aPopup, aX, aY, aParent)
	{
		if (!aPopup) return null;

		var x = parseInt(aX),
			y = parseInt(aY);
		if (!aParent) aParent = aPopup.parentNode;

		aPopup.autoPosition = true;
		aPopup.showPopup(aParent, x, y, 'popup', null, null);

		// �ꏊ���Y����ꍇ������̂ŁA�G���[�����B
		if (aPopup.parentNode.localName != 'menu' &&
			(aPopup.popupBoxObject.screenX != x ||
			aPopup.popupBoxObject.screenY != y)) aPopup.moveTo(x, y);

		return aPopup;
	},
  
	// URI��ǂݍ��� 
	
	// URI��ǂݍ��� 
	// �t���[�����Ŏ��s�����ꍇ�A�t���[�����������ēǂݍ��ށB
	// bypass�́AMozilla�̃Z�L�����e�B���o�C�p�X����URI��ǂݍ��ރt���O�B
	loadURI : function(aURI, aReferrer, aOpenIn, aShouldBypassSecurity)
	{
		if (typeof aReferrer == 'string')
			aReferrer = this.utils.makeURIFromSpec(aReferrer);

		if (this.utils.browserWindow &&
			(
				!aOpenIn ||
				this.utils.browserWindow.ExtService.currentURI(true) == 'about:blank' ||
				(
					aURI.split('#')[0] == this.currentURI(true).split('#')[0] &&
					!this.utils.getPref('ctxextensions.showResultIn.forceNewWindowOrTab')
				)
			)
			) {
			this.utils.browserWindow.loadURI(aURI, aReferrer);
			var b = this.utils.browser;
			if ('selectedTab' in b)
				b = b.getBrowserForTab(b.selectedTab);
			return b;
		}
		else if (!this.utils.browserWindow || aOpenIn == this.NEW_WINDOW) {
			return this.openNewWindow(aURI, aReferrer);
		}
		else {
			var t = this.openNewTab(aURI, aReferrer, aShouldBypassSecurity);
			if (aOpenIn ? aOpenIn != this.NEW_BG_TAB : !this.utils.getPref('browser.tabs.loadInBackground') )
				gBrowser.selectedTab = t;

			return t;
		}
	},
	CURRENT_TAB : 0,
	NEW_TAB     : 10,
	NEW_BG_TAB  : 11,
	NEW_WINDOW  : 20,
 
	openNewWindow : function(aURI, aReferrer) 
	{
		if (typeof aReferrer == 'string')
			aReferrer = this.utils.makeURIFromSpec(aReferrer);

		return window.openDialog(this.utils.browserURI, '_blank', 'chrome,all,dialog=no', aURI, null, aReferrer);
	},
 
	// �V�K�^�u�œǂݍ��� 
	openNewTab : function(aURI, aReferrer, aShouldBypassSecurity)
	{
		if (typeof aReferrer == 'string')
			aReferrer = this.utils.makeURIFromSpec(aReferrer);

		if (!this.utils.browserWindow)
			return this.openNewWindow(aURI, aReferrer);

		var b = this.utils.browserWindow.ExtCommonUtils.browser;
		var newTab = b.addTab(aURI, aReferrer);
		return newTab;
	},
 
	// �ǂݍ��݊�����ɏ������s�� 
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
			w = this.utils.getWindowFromDocument(aBrowserOrTabOrXULWindow.ownerDocument);

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

			var w = aXULWindow.ExtCommonUtils.getWindowFromDocument(b.ownerDocument);

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
  
	// �w��̃^�C�v�������E�B���h�E������΃t�H�[�J�X���ڂ��A�Ȃ���ΊJ�� 
	openDialog : function(aURI, aType, aArg)
	{
		var target = this.utils.getTopWindowOf(aType);
		if (target)
			target.focus();
		else
			window.openDialog(aURI, '_blank', 'chrome,all,dialog=no', aArg);
		return;
	},
  
	// �w��̗v�f�ɃW�����v���� 
	scrollTo : function(aTarget)
	{
		if (aTarget &&
			aTarget.offsetLeft !== void(0) &&
			aTarget.offsetTop  !== void(0))
			this.utils.getWindowFromDocument(aTarget.ownerDocument).scrollTo(aTarget.offsetLeft, aTarget.offsetTop);
		return;
	},
 
	// URI���_�E�����[�h���A�_�E�����[�h������ɃA�v���ŊJ�� 
	downloadAndOpenWithApp : function(aManagerID, aApp, aOptions, aURI, aDocument)
	{
		// URI���p�X�ɕϊ��B���[�J���̃t�@�C���łȂ���΁A�e���|�����t�@�C����n���B
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

		// �t�@�C���̃_�E�����[�h��҂��Ă���J��
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
  
	// �X�^�C���V�[�g��ǉ����A���[�h������ɃX�^�C�����[����ǉ����� 
	appendStyleSheet : function(aManagerID, aPath, aWindow, aRules)
	{
		this.addStyle(aPath, null, null, aWindow);

		if (aManagerID in this.appendStyleSheetManagers &&
			this.appendStyleSheetManagers[aManagerID]) {
			this.appendStyleSheetManagers[aManagerID].stop()
			this.appendStyleSheetManagers[aManagerID] = null;
		}

		this.appendStyleSheetManagers[aManagerID] = new pProgressManager(this.appendStyleSheetObserver, 50, /*aPath, */'progress=undetermined');
		this.appendStyleSheetManagers[aManagerID].appendItem(aWindow, aManagerID, aPath, aRules);
		this.appendStyleSheetManagers[aManagerID].count = 0;
		this.appendStyleSheetManagers[aManagerID].start();

		return;
	},
	
	appendStyleSheetObserver : 
	{
		onProgress : function(aManager, aWindow, aID, aPath, aRules)
		{
			if (aWindow.document) {
				var s    = aWindow.document.styleSheets,
					info = ExtService.contentInfo(false, aWindow);

				for (var i = 0; i < s.length; i++)
				{
					if (!s[i].href || s[i].href != aPath) continue;

					s[i].ext_system_added = true;
					s[i].disabled = false;

					if (!('sheet' in info) || !info.sheet) info.sheet = [];
					info.sheet[aID] = s[i];

					if (aRules)
						ExtService.addCSSRules(aRules, s[i]);

					return true;
				}

			}

			return (++aManager.count > 10);
		},
		onProgressEnd : function()
		{
		}
	},
  
	// �X�^�C���V�[�g�̑I����Ԃ𔽉f 
	selectStyleSheet : function(aManagerID, aName, aWindow)
	{
		var w = (aWindow ? aWindow : this.contentWindow() );

		if (aManagerID in this.selectStyleSheetManagers &&
			this.selectStyleSheetManagers[aManagerID]) {
			this.selectStyleSheetManagers[aManagerID].stop()
			this.selectStyleSheetManagers[aManagerID] = null;
		}

		this.selectStyleSheetManagers[aManagerID] = new pProgressManager(this.selectStyleSheetObserver, 50, /*aManagerID, */'progress=undetermined');
		this.selectStyleSheetManagers[aManagerID].appendItem(w, aManagerID, aName);
		this.selectStyleSheetManagers[aManagerID].count = 0;
		this.selectStyleSheetManagers[aManagerID].start();

		return;
	},
	
	selectStyleSheetObserver : 
	{
		onProgress : function(aManager, aWindow, aID, aName)
		{
			if (aWindow.document) {
				var d = aWindow.document;

				// meta�v�f�Ńf�t�H���g�̃V�[�g��ݒ�
				var head = 'head' in d ? d.head :
							d.getElementsByTagName('HEAD')[0] ||
							d.getElementsByTagNameNS(ExtService.XHTMLNS, 'head')[0];
				if (head && (!('doneHead' in aManager) || !aManager.doneHead)) {
					aManager.doneHead = true;

					var meta = document.createElementNS(ExtService.XHTMLNS, 'meta');
					meta.setAttribute('http-equiv', 'Default-Style');
					meta.setAttribute('content', aName);

					if (head.hasChildNodes())
						head.insertBefore(meta, head.firstChild);
					else
						head.appendChild(meta);
				}

				// �؂�ւ��̏���
				var body = 'body' in d ? d.body :
							d.getElementsByTagName('BODY')[0] ||
							d.getElementsByTagNameNS(ExtService.XHTMLNS, 'body')[0];
				if (body && (!('doneBody' in aManager) || !aManager.doneBody)) {
					ExtService.setStyleTo(aName, Components.lookupMethod(aWindow, 'top').call(aWindow), true);
					return true;
				}
			}

			return (++aManager.count > 30);
		},
		onProgressEnd : function()
		{
		}
	},
  
	// �\�[�X�\�� 
	viewSourceOf : function()
	{
		if (!arguments || !arguments.length) return false;

		var viewer = this.utils.getPref('ctxextensions.override.source_viewer.path');
		if (!viewer)
			return (arguments[0] == 'document') ? __ctxextensions__BrowserViewSourceOfDocument(arguments[1]) :
					(arguments[0] == 'url') ? __ctxextensions__BrowserViewSourceOfURL(arguments[1], arguments[2], arguments[3]) :
					arguments[2].__ctxextensions__viewPartialSource(arguments[1]) ;


		var targetURI = (arguments[0] == 'document') ? arguments[1].URL :
						(arguments[0] == 'url') ? arguments[1] :
						this.currentURI();

		var options = this.utils.getPref('ctxextensions.override.source_viewer.options');
		if (!options)
			options = '%s';
		else if (!options.match(/%s/i))
			options = '%s '+options;

		if (!arguments[0] || !arguments[0].match(/selection/)) {
			this.downloadAndOpenWithApp('viewsource', viewer, options, targetURI, arguments[1]);
		}
		else {
			var source;
			if (arguments[0] == 'partial')
				source = this.getSelectionSource(this.contentWindow());
			else
				source = this.utils.getSourceOf(gContextMenu.target, String(aMode.match(/[^\/]+$/)));

			this.run(
				viewer,
				options.replace(
					/%s/gi,
					this.utils.writeTo(
						source,
						this.utils.makeTempFileForURI(targetURI),
						'Overwrite=yes,CreateDirectory=yes'
					).path
				)
			);
		}

		return true;
	},
 
	// ���o���̃��X�g���擾���A�ۑ����� 
	updateHeadings : function(aWindow, aInBackGround)
	{
		var d    = (aWindow ? aWindow.document : this.contentDocument()),
			info = this.contentInfo(false, aWindow || this.utils.getWindowFromDocument(d));

		if (!('headings' in info) || !info.headings) {
			info.headingsCurrentIndex = -1;
			info.headingsLastCount = 0;
			info.headings          = [];
			info.headingsIndex     = [];
		}

		var nodes = this.utils.getNodesFromXPath('/descendant::*[contains("H1,H2,H3,H4,H5,H6,H7,h1,h2,h3,h4,h5,h6,h7,h", local-name())]', d.documentElement);
		var max = nodes.snapshotLength;
		if (max == info.headingsLastCount) return;

		for (var i = info.headingsLastCount || info.headingsLastCount; i < max; i++)
		{
			info.headings[info.headings.length] = this.createHeading(nodes.snapshotItem(i));
			info.headingsIndex[info.headings[info.headings.length-1].id] = info.headings.length-1;
		}

		info.headingsLastCount = max;
	},
	
	// ���o���I�u�W�F�N�g�̐��� 
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
			substance : aNode, // for old implementations
			findParentNode              : ExtCommonUtils.findParentNodeWithLocalName,
			findParentNodeWithLocalName : ExtCommonUtils.findParentNodeWithLocalName
		});
	},
  
	// �i�r�Q�[�V�����p�����N�̃��X�g���X�V 
	updateNavigations : function(aWindow, aInBackGround, aCallBackFunc)
	{
		var d    = (aWindow ? aWindow.document : this.contentDocument()),
			info = this.contentInfo(false, aWindow || this.utils.getWindowFromDocument(d));

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

		var nodes = this.utils.getNodesFromXPath(expression, d.documentElement);
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
	
	// �i�r�Q�[�V�������ڃI�u�W�F�N�g�̐��� 
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
  
	// ���j���[���璼�ځA�e�퍀�ڂ̃v���p�e�B���J�� 
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

		if (aRDFName.match(/^(StyleSheets|SendURI|SendStr|ExecApps|CustomScripts)$/i)) {
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
			if (RDFData != this.utils.STYLESHEETS) {
				data.contextShowSelect = (RDFData.getData(id, 'ShowContextItemWithSelection') != 'false');
				data.contextShowLink = (RDFData.getData(id, 'ShowContextItemOnLink') != 'false');
			}
		}

		switch(aRDFName)
		{
			case 'STYLESHEETS':
				data.styleRules = this.utils.unescape(RDFData.getData(id, 'StyleRules'));
				data.cancelStyles = RDFData.getData(id, 'Cancel') == 'true';
				break;

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


		if ('cancelStyles' in this)
			this.mRDFData.setData(this.name, 'Cancel', this.cancelStyles ? 'true' : 'false' );
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
		if ('styleRules' in this)
			this.mRDFData.setData(this.name, 'StyleRules', ExtCommonUtils.escape(this.styleRules));
		if ('customScripts' in this)
			this.mRDFData.setData(this.name, 'Script', ExtCommonUtils.escape(this.customScripts));
	},
  
	// UI�̍X�V 
	
	// ���K�\���̍X�V 
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
 
	// �e���v���[�g�Ő������ꂽ�v�f���Đ������� 
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
		return;
	},
	hideContextDuplicatedItems : function(aID)
	{
		var duplicatedItems = ExtCommonUtils.getNodesFromXPath('descendant::*[(@newitem = "true") and ((@contextShowNormal and @contextShowSelect = "true") or (@contextShowSelect and @contextShowNormal = "true") or (@contextShowLink and @contextShowLink = "true"))]', document.getElementById(aID));
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
 
	// styleSheets�̍X�V 
	rebuildStyleSheets : function()
	{
		this.rebuild([
			'ext-key-styleSheets',
			'ext-common-styleSheets:mpopup'
		]);
		this.updateAccelTextFor('ext-key-styleSheets');
	},
 
	// ExecApp�̍X�V 
	rebuildExecApps : function()
	{
		this.rebuild([
			'ext-key-execApps',
			'ext-common-execApps:mpopup',
			'menu-item-execApps:mpopup',
			'menu-item-execApps:mpopup:submenu',
			'menu-item-execApps-frame:mpopup',
			'context-item-execApps:mpopup',
			'context-item-execApps:mpopup:submenu',
			'context-item-execApps-frame:mpopup'
		]);
		window.setTimeout(this.updateAccelTextFor, 100, 'ext-key-execApps');
		window.setTimeout('ExtService.showHideMenubarItem("execApps");', 0);
		this.setKeyEnabled('ext-broadcaster-key:showMenu:execapps', this.hasExecApps);
	},
 
	// CustomScript�̍X�V 
	rebuildCustomScripts : function()
	{
		this.rebuild([
			'ext-key-customScripts',
			'ext-common-customScripts:mpopup',
			'menu-item-customScripts:mpopup',
			'menu-item-customScripts:mpopup:submenu',
			'context-item-customScripts:mpopup',
			'context-item-customScripts:mpopup:submenu'
		]);
		window.setTimeout(this.updateAccelTextFor, 100, 'ext-key-customScripts');
		window.setTimeout('ExtService.showHideMenubarItem("customScripts");', 0);
		this.setKeyEnabled('ext-broadcaster-key:showMenu:customscripts', this.hasCustomScripts);
	},
 
	// SendStr�̍X�V 
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
 
	// SendURI�̍X�V 
	rebuildSendURI : function()
	{
		this.rebuild([
			'ext-key-sendURI',
			'menu-item-sendURI:mpopup',
			'menu-item-sendURI:mpopup:submenu',
			'menu-item-sendURI-frame:mpopup',
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
				'StyleSheets',
					'ext-common-styleSheets:mpopup',
					'ExtFunc.ApplyStyle(event, true);',
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
				if (ref)
					sep.parentNode.insertBefore(newSep, ref);
				else
					sep.parentNode.appendChild(newSep);
			}

			mpopup = document.getElementById(data[i+1]);
			if (!mpopup) continue;

			items = mpopup.getElementsByAttribute('newitem', 'true');

			for (j = 0; j < items.length; j++)
			{
				name = items[j].getAttribute('label');

				item = document.createElement('menuitem');

				item.setAttribute('id', 'context-item-userdefined'+j);
				item.setAttribute('styleid', 'context-item-userdefined'+j);
				item.setAttribute('oncommand', data[i+2]+'; event.stopPropagation();');
				item.setAttribute('onclick', 'if (event.button == 1) ExtService.editRDFItem(event, "'+data[i]+'");');

				item.setAttribute('label',   name);
				item.setAttribute('styleid', name);
				if (data[i] == 'StyleSheets')
					item.setAttribute('type', 'checkbox');

				show = [];
				if (items[j].getAttribute('contextShowNormal') == 'true')
					show.push('normal');
				if (items[j].getAttribute('contextShowLink') == 'true')
					show.push('link');
				if (items[j].getAttribute('contextShowSelect') == 'true')
					show.push('select');
				item.setAttribute('ext-context-show', show.join(','));

				item.setAttribute('ext-item-userdefined', 'true');

				if (ref)
					sep.parentNode.insertBefore(item, ref);
				else
					sep.parentNode.appendChild(item);

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
				keys = this.utils.concatArray(
					document.getElementsByAttribute('key', key),
					document.getElementsByAttribute('key', key.toUpperCase())
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
 
	// �L�[�{�[�h�V���[�g�J�b�g�̗L��/�����̃`�F�b�N 
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
 
	// �L�[�{�[�h�V���[�g�J�b�g�ɂ��āA�ݒ肪�ω������ꍇ�̂ݑ�����ύX���� 
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
  
	// ���j���[�̍X�V 
	
	// ���j���[�̃��x�����X�V 
	updateMenuLabels : function(aPopup)
	{
		var i;

		var sel     = this.getSelection();
		var selstr  = sel ? this.utils.getShortString(sel.replace(/\s+/g, ''), 16, 'cut-end') : '' ;
		var inFrame = this.inFrame;
		var onLink  = this.onLink;

		var items = this.utils.concatArray(
				aPopup.getElementsByAttribute('label-for-frame', '*'),
				aPopup.getElementsByAttribute('label-for-select', '*'),
				aPopup.getElementsByAttribute('label-for-link', '*')
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
 
	// �R���e�L�X�g���j���[�̕\���X�V 
	updateContextMenu : function()
	{
		if (this.utils.getPref('ctxextensions.show_item.context.navigations'))
			this.updateNavigationsPopup();
		if (this.utils.getPref('ctxextensions.show_item.context.outline'))
			this.updateOutlinePopup();
		if (this.utils.getPref('ctxextensions.show_item.context.go'))
			this.makeBackList();
		if (this.utils.getPref('ctxextensions.show_item.context.styleSheets'))
			this.updateStyleSheetsPopup();

		var contextMenu = this.utils.contextMenu;

		this.updateMenuLabels(contextMenu);



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

		var hasRecieverForStr = this.utils.getNodesFromXPath('descendant::xul:menuitem[not(@hidden)]', document.getElementById('context-item-sendStr')).snapshotLength;
		var hasRecieverForURI = this.utils.getNodesFromXPath('descendant::xul:menuitem[not(@hidden)]', document.getElementById('context-item-sendURI')).snapshotLength;
		var hasCustomScripts = this.utils.getNodesFromXPath('descendant::xul:menuitem[not(@hidden)]', document.getElementById('context-item-customScripts')).snapshotLength;
		var hasExecApps = this.utils.getNodesFromXPath('descendant::xul:menuitem[not(@hidden)]', document.getElementById('context-item-execApps')).snapshotLength;

		var items = [
				'go',                 hasHistory && showGo && normal,
				'up',                 this.canUp && normal,
				'openSelectionAsURI', sel,
				'nextHeading',        showGo && this.hasOutline && normal,
				'prevHeading',        showGo && this.hasOutline && normal,
				'openCiteForQuote',   this.getCiteForQuote() && normal,
				'openCiteForEdit',    this.getCiteForEdit() && normal,
				'openLongdesc',       this.getLongdesc() && !sel,
				'bookmarks',          showMisc && normal,
				'outline',            this.hasOutline && normal,
				'navigations',        this.hasNavigations && this.isWebPage && normal,
				'styleSheets',        normal,
				'JSPanel',            normal,
				'getLinks',           this.isWebPage,
				'showComments',       this.isWebPage && normal,
				'showLinks',          this.isWebPage && normal,
				'showIDs',            this.isWebPage && normal,
				'showCites',          this.isWebPage && normal,
				'showTitles',         this.isWebPage && normal,
				'showEvents',         this.isWebPage && normal,
				'showAll',            this.isWebPage && normal,
				'sendURI',            hasRecieverForURI && (this.onLink || !sel),
				'sendStr',            hasRecieverForStr && sel,
				'customScripts',      hasCustomScripts,
				'execApps',           hasExecApps
			];

		var prefName;
		for (i = 0; i < items.length; i += 2)
		{
			prefName = items[i].split('-')[0];
			this.setVisible(
				'context-item-'+items[i],
				items[i+1] &&
				this.utils.getPref('ctxextensions.show_item.context.'+prefName) &&
				!this.utils.getPref('ctxextensions.submenu.context.'+prefName)
			);
			this.setVisible(
				'context-item-'+items[i]+':submenu',
				items[i+1] &&
				this.utils.getPref('ctxextensions.show_item.context.'+prefName) &&
				this.utils.getPref('ctxextensions.submenu.context.'+prefName)
			);
		}


		// show/hide "Extensions" submenu
		var hasItem = false;
		var extensions = document.getElementById('context-item-extensions');
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
		var nodes = contextMenu.getElementsByAttribute('ext-item-userdefined', 'true'),
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
		this.utils.showHideMenuSeparators(contextMenu);
	},
 
	// ���j���[�o�[�̍��ڂ̕\���X�V 
	updateMenubarSubmenu : function()
	{
		if (this.utils.getPref('ctxextensions.submenu.menubar.navigations'))
			this.updateNavigationsPopup();
		if (this.utils.getPref('ctxextensions.submenu.menubar.outline'))
			this.updateOutlinePopup();
		if (this.utils.getPref('ctxextensions.submenu.menubar.styleSheets'))
			this.updateStyleSheetsPopup();

		var menu = document.getElementById('menu-item-extensions');

		this.updateMenuLabels(menu.firstChild);


		var i;
		var sel = this.getSelection();
		var showAll = this.utils.getPref('ctxextensions.showall_enable.showCites') ||
				this.utils.getPref('ctxextensions.showall_enable.showComments') ||
				this.utils.getPref('ctxextensions.showall_enable.showEvents') ||
				this.utils.getPref('ctxextensions.showall_enable.showIDs') ||
				this.utils.getPref('ctxextensions.showall_enable.showLinks') ||
				this.utils.getPref('ctxextensions.showall_enable.showTitles');

		var items = [
				'up',                 this.canUp,
				'openSelectionAsURI', sel,
				'nextHeading',        this.hasOutline,
				'prevHeading',        this.hasOutline,
				'outline',            this.hasOutline,
				'navigations',        this.hasNavigations && this.isWebPage,
				'styleSheets',        true,
				'JSPanel',            true,
				'getLinks',           this.isWebPage,
				'showComments',       this.isWebPage,
				'showLinks',          this.isWebPage,
				'showIDs',            this.isWebPage,
				'showCites',          this.isWebPage,
				'showTitles',         this.isWebPage,
				'showEvents',         this.isWebPage,
				'showAll',            this.isWebPage,
				'sendURI',            this.hasRecieverForURI,
				'sendURI-frame',      this.hasRecieverForURI && this.inFrame,
				'sendStr',            this.hasRecieverForStr && sel,
				'customScripts',      this.hasCustomScripts,
				'execApps',           this.hasExecApps,
				'execApps-frame',     this.hasExecApps && this.inFrame,
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
				'menu-item-'+items[i]+':submenu',
				items[i+1] &&
				(value === null ? true : value )
			);
		}


		// hide needless separators
		this.utils.showHideMenuSeparators(menu.firstChild);
	},
 
	// �A�E�g���C���𐶐����� 
	updateOutlinePopup : function(aShouldShowEmpty)
	{
		var mpopup = document.getElementById('ext-common-outline:mpopup');

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
 
	// �i�r�Q�[�V�����ꗗ�𐶐����� 
	updateNavigationsPopup : function(aShouldShowEmpty, aAutoGoNavigation)
	{
		var mpopup = document.getElementById('ext-common-navigations:mpopup');

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

/*
		var stylemenu = document.createElement('menu');
		stylemenu.setAttribute('label', mpopup.getAttribute('label-for-stylesheets'));
		stylemenu.setAttribute('onpopupshowing', 'event.stopPropagation()');
		stylemenu.setAttribute('onpopuphiding', 'event.stopPropagation()');
		stylemenu.appendChild(document.createElement('menupopup'));
*/

		var label, href, menuitem, stylesheet, j;
		for (var i in links)
		{
			stylesheet = ((links[i].node.rel || '').match(/stylesheet/i));

			// ignore stylesheet
			if (stylesheet) continue;

			if (links.length > 1 && i > 1 && links[i-1] &&
				links[i].elemType != links[i-1].elemType &&
				!stylesheet)
				mpopup.appendChild(document.createElement('menuseparator'));

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

//			if (stylesheet)
//				stylemenu.firstChild.appendChild(menuitem);
//			else
				mpopup.appendChild(menuitem);
		}

/*
		if (stylemenu.firstChild.childNodes.length) {
			if (mpopup.firstChild)
				mpopup.appendChild(document.createElement('menuseparator'));
			mpopup.appendChild(stylemenu);
		}
*/

		mpopup.ex_link_uri = this.currentURI().split('#')[0];

		if (!aAutoGoNavigation &&
			this.updateNavigationsAutoGoNavigation) {
			ExtFunc.goNavigation(this.updateNavigationsAutoGoNavigation);
			this.updateNavigationsAutoGoNavigation = null;
		}

		return;
	},
	updateNavigationsAutoGoNavigation : null,
 
	// �X�^�C���V�[�g�̃��X�g���X�V���� 
	updateStyleSheetsPopup : function()
	{
		var i;

		var class_authors = 'ex-style-authors',
			popup    = document.getElementById('ext-common-styleSheets:mpopup'),
			olditems = popup.getElementsByAttribute('class', class_authors);
		for (i = 0; i < olditems.length; i++) popup.removeChild(olditems[i]);

		var customUserStyle = popup.getElementsByAttribute('styleid', 'ext-common-customUserStyleEditor')[0];
		var title = '';
		try {
			title = Components.lookupMethod(this.contentDocument(),'title').call(this.contentDocument());
		}
		catch(e) {
		}
		this.setLabel(
			customUserStyle,
			customUserStyle.getAttribute('label-for-site').replace(/%s/gi, this.utils.getShortString(title, 24, 'cut-end'))
		);


		// update checkboxes
		var addedstyles = popup.getElementsByAttribute('type', 'checkbox');
		var idAttrString;
		var checked;
		for (i = 0; i < addedstyles.length; i++)
			if (addedstyles[i].parentNode == popup) {
				idAttrString = escape(addedstyles[i].getAttribute('styleid')).replace(/%/g, '-');
				checked = gBrowser.selectedTab.hasAttribute('ctxextensions-optionalstylesheet-'+idAttrString) ?
						(gBrowser.selectedTab.getAttribute('ctxextensions-optionalstylesheet-'+idAttrString) == 'true') :
						(this.utils.STYLESHEETS.getData(addedstyles[i].getAttribute('styleid'), 'Selected') == 'true');
				addedstyles[i].setAttribute('checked', checked);
			}

		var sheets      = this.contentStyles(),
			sourcesmenu = popup.getElementsByAttribute('styleid', 'ext-common-styleSources')[0],
			items       = [],
			newItem,
			lastWithSameTitle,
			hasNoStyle  = true,
			current     = this.currentURI(),
			path        = this.utils.getCurrentDir(current);

		var range = document.createRange();
		range.selectNodeContents(sourcesmenu.firstChild);
		range.deleteContents();
		range.detach();

		var checkedStyle = this.utils.SELECTEDSTYLES.getDataFromPath(path, 'SelectedStyle');
		var checkedStyleID = this.utils.SELECTEDSTYLES.getDataFromPath(path, 'SelectedStyleID');
		var hasSavedStyle = checkedStyle ? this.hasStyle(this.contentDocument(), checkedStyle) : false ;

		var source,
			showMedia,
			label,
			label_base;

		for (i = 0; i < sheets.length; i++)
		{
			if (sheets[i].href && !('ext_system_added' in sheets[i])) {
				label_base = this.utils.getMsg((!sheets[i].title ? 'styleSheets_source_permanent' : sheets[i].disabled ? 'styleSheets_source_alternate' : 'styleSheets_source_preferred'));

				showMedia = (sheets[i].media.length && sheets[i].media.mediaText.toLowerCase() != 'all');

				label = this.utils.getMsg(
						sheets[i].title ?
							showMedia ?
								'styleSheets_source_title_media' :
								'styleSheets_source_title'
						:
							showMedia ?
								'styleSheets_source_media' :
								'styleSheets_source_none'
						)
						.replace(/%m/i, sheets[i].media.mediaText || 'all')
						.replace(/%s/i, sheets[i].href.match(/[^\/]+$/) || '')
						.replace(/%t/i, sheets[i].title || this.utils.getMsg('styleSheets_source_anoymous'));
				label = label_base.replace(/%s/i, label);

				source = document.createElement('menuitem');
				if (sheets[i].href == current &&
					sheets[i].ownerNode &&
					sheets[i].ownerNode.firstChild) {
					label = this.utils.getMsg('styleSheets_source_embedded').replace(/%s/i, label);
					source.setAttribute('embeddedSheet', this.utils.escape(sheets[i].ownerNode.firstChild.nodeValue));
				}
				source.setAttribute('label', label);
				source.setAttribute('value', sheets[i].href);

				if (!this.utils.uriSecurityCheck(sheets[i].href, current, true))
					source.setAttribute('disabled', true);

				sourcesmenu.firstChild.appendChild(source);
			}

			if (!sheets[i].title) continue;

			hasNoStyle = false;

			lastWithSameTitle = null;
			if (sheets[i].title in items)
				lastWithSameTitle = items[sheets[i].title];

			if (!lastWithSameTitle) {
				newItem = document.createElement('menuitem');
				newItem.setAttribute('label', sheets[i].title);
				newItem.setAttribute('value', sheets[i].title);
				newItem.setAttribute('styleid', 'ext_style:'+sheets[i].title);
				newItem.setAttribute('type', 'radio');
				newItem.setAttribute('name', 'ext-styleSheets-pageStyle');
				if ((hasSavedStyle && !checkedStyleID.match(/^ext_system/) ? checkedStyle == sheets[i].title : !sheets[i].disabled ))
					newItem.setAttribute('checked', true);
				newItem.setAttribute('class', class_authors);

				popup.insertBefore(newItem, sourcesmenu);
				items[sheets[i].title] = newItem;

			} else if (sheets[i].disabled)
				lastWithSameTitle.removeAttribute('checked');
		}

		sourcesmenu.hidden = !sourcesmenu.firstChild.hasChildNodes();

		var noStyle = popup.getElementsByAttribute('styleid', 'ext_system_noStyle')[0];
		var onlyPermanence = popup.getElementsByAttribute('styleid', 'ext_system_onlyPermanence')[0];

		if (checkedStyleID == 'ext_system_noStyle')
			noStyle.setAttribute('checked', true);
		else
			noStyle.removeAttribute('checked');

		if (checkedStyleID == 'ext_system_onlyPermanence' || (checkedStyleID != 'ext_system_noStyle' && hasNoStyle))
			onlyPermanence.setAttribute('checked', true);
		else
			onlyPermanence.removeAttribute('checked');

		// hide needless separators
//		this.utils.showHideMenuSeparators(popup);
	},
 
	// ��������߂��/�i�ݐ惊�X�g�𐶐� 
	makeBackList : function()
	{
		var goMenu = document.getElementById('context-item-go');
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
   
	// �X�^�C���V�[�g�̏��� 
	
	// �^����ꂽ���O�̃X�^�C���V�[�g�����邩�ǂ��� 
	hasStyle : function(aDocument, aName)
	{
		if (aName == 'ext_system_noStyle' || aName == 'ext_system_onlyPermanence')
			return true;

		var sheets = aDocument.styleSheets;
		for (var i = 0; i < sheets.length; i++)
			if (sheets[i].title == aName) return true;

		return false;
	},
 
	// �X�^�C���̐؂�ւ� 
	setStyleTo : function(aName, aWindow, aTraceFrames)
	{
		var i;
		var w = (aWindow ? aWindow : this.contentWindow() );
		var d = w.document;

		var sheets   = d.styleSheets,
			defStyle = null,
			hasStyle = false,
			name     = aName;
		for (i = 0; i < sheets.length; i++)
			if (sheets[i].title) {
				if (!sheets[i].disabled)
					defStyle = sheets[i].title;
				if (sheets[i].title == aName)
					hasStyle = true;
			}

		// if the document doesn't have the stylesheet, select default sheets
		if (!hasStyle && aName) name = defStyle;

		for (i = 0; i < sheets.length; i++)
		{
			if (sheets[i].title)
				sheets[i].disabled = (sheets[i].title != name);
			else if (sheets[i].disabled && !sheets[i].ext_system_added)
				sheets[i].disabled = false;
		}

		if (aTraceFrames)
			for (i = 0; i < w.frames.length; i++)
				this.setStyleTo(aName, w.frames[i], true);
	},
 
	// �X�^�C���V�[�g�������� 
	addStyle : function(aPath, aType, aMedia, aWindow)
	{
		// document�I�u�W�F�N�g���n���ꂽ�ꍇ�A����document��Ώۂɂ��ď�������
		var d     = (aWindow ? aWindow.document : this.contentDocument() ),
			newPI = document.createProcessingInstruction('xml-stylesheet',
				'href="'+aPath+'" type="'+(aType || 'text/css')+'" media="'+(aMedia || 'all')+'"');
		try {
			d.insertBefore(newPI, d.documentElement);
		}
		catch(e) {
		}
		return;
	},
	
	// rules�Ŏw�肳�ꂽ�X�^�C���w��������� 
	addCSSRules : function(aRules, aSheet)
	{
		if (!aSheet) return;

		var rulesIndex = 0;
		var rules = aRules.match(/@[^\{;]+(\{([^\}]+\{[^\}]*\})*\})?;?|[^\}]+\{[^\}]*\}/g);
		if (!rules) return;
		for (var i in rules)
		{
			//alert('Add StyleRule:'+rules[i]);
			try {
				if (rules[i].match(/@(import|charset|namespace)/)) // ��������at-rule�͐擪�֒ǉ��B
					aSheet.insertRule(rules[i], rulesIndex++);
				else if (rules[i].match(/@media/)) { // @media�͍ċN�����ł����邩�H
					aSheet.insertRule(
						rules[i].match(/^@media[^\{]+/)+'{}',
						aSheet.cssRules.length);
					this.addCSSRules(
						rules[i].replace(/^@media[^\{]+\{/, '').replace(/\};?$/, ''),
						aSheet.cssRules[targetSheet.cssRules.length-1]);
				} else
					aSheet.insertRule(rules[i], aSheet.cssRules.length);
			} catch(e) {};
		}
		return;
	},
  
	reapplyOptionalStyle : function(aID, aWindow, aTraceFrames) 
	{
		if (!aWindow) return;

		var info = this.contentInfo(false, aWindow),
			i;

		if ('sheet' in info) {
			for (i in info.sheet)
				if (i.indexOf('UserdefinedStyleSheet:'+aID+':') == 0)
					try {
						info.sheet[i].ownerNode.parentNode.removeChild(info.sheet[i].ownerNode);
						info.sheet[i] = null;
					}
					catch(e) {
					}
			if (this.utils.STYLESHEETS.getData(aID, 'Selected') == 'true')
				ExtFunc.toggleOptionalStyleRules(aID, null, aWindow, true);
		}
		if (aTraceFrames && 'frames' in aWindow) {
			for (i = 0; i < aWindow.frames.length; i++)
				this.reapplyOptionalStyle(aID, aWIndow.frames[i], true);
		}
	},
 
	applyUserStyleFor : function(aPath, aWindow, aTraceFrames) 
	{
		if (!aWindow) return;

		var info = this.contentInfo(false, aWindow),
			i;

		if (aWindow.location.href.indexOf(aPath) == 0) {
			if ('sheet' in info)
				for (i in info.sheet)
					if (i == 'UserStyle:'+aWindow.location.href)
						try {
							info.sheet[i].ownerNode.parentNode.removeChild(info.sheet[i].ownerNode);
							info.sheet[i] = null;
						}
						catch(e) {
						}

			var rules = this.utils.unescape(this.utils.USERSTYLES.getDataFromPath(aWindow.location.href, 'StyleRules'));
			if (rules)
				this.appendStyleSheet('UserStyle:'+aWindow.location.href, 'about:blank?UserStyle', aWindow, rules);
		}
		if (aTraceFrames && 'frames' in aWindow) {
			for (i = 0; i < aWindow.frames.length; i++)
				this.applyUserStyleFor(aPath, aWIndow.frames[i], true);
		}
	},
  
	// preferences listeners 
	
	// �i�r�Q�[�V�������ڂ�D&D 
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
 
	// �V���[�g�J�b�g�̕ύX�����m 
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
		this.setVisible(
			item,
			!this.utils.getPref('ctxextensions.submenu.menubar.'+aName) &&
			(
				!item.hasChildNodes() ||
				!item.firstChild.builder ||
				item.firstChild.hasChildNodes()
			)
		);
	},
 
	RDFObserver : 
	{
		observe : function(aSource, aProperty)
		{
			if (aSource.Value.match(/#urn:SelectedStyles:/)) return;

			if (aSource.Value.match(/#urn:UserStyles:/) &&
				aProperty.Value.split('#')[1] == 'StyleRules')
				this.updateCustomUserStyle(aSource);
			if (aSource.Value.match(/#urn:StyleSheets:/) &&
				aProperty.Value.split('#')[1] == 'StyleRules')
				this.updateOptionalStyle(aSource);
			else if (aSource.Value.match(/#urn:\w+:root$/) ||
				aProperty.Value.split('#')[1] == 'Name')
				this.rebuildItems(aSource);
			else if (aProperty.Value.split('#')[1] == 'NewContextItem')
				ExtService.rebuildExtraItems();
		},

		updateCustomUserStyle : function(aSource)
		{
			var b    = ExtCommonUtils.browser.browsers;
			var path = ExtCommonUtils.unescapeString(aSource.Value.match(/#urn:\w+:(.*)$/)[1].toString());
			for (var i = 0; i < b.length; i++)
				ExtService.applyUserStyleFor(path, b[i].contentWindow, true);

		},

		updateOptionalStyle : function(aSource)
		{
			var id = ExtCommonUtils.unescapeString(aSource.Value.match(/#urn:\w+:(.*)$/)[1].toString());
			var b  = ExtCommonUtils.browser.browsers;
			for (var i = 0; i < b.length; i++)
				ExtService.reapplyOptionalStyle(id, b[i].contentWindow, true);
		},

		rebuildItems : function(aSource)
		{
			if (!('gExtCallBackStatements' in window))
				window.gExtCallBackStatements = {};

			switch (aSource.Value.match(/#urn:(\w+):/)[1].toString())
			{
				case 'StyleSheets':
					window.gExtCallBackStatements.styleSheets = 'ExtService.rebuildStyleSheets();'
					break;
				case 'ExecApps':
					window.gExtCallBackStatements.execApps = 'ExtService.rebuildExecApps();';
					break;
				case 'CustomScripts':
					window.gExtCallBackStatements.customScripts = 'ExtService.rebuildCustomScripts();';
					break;
				case 'SendStr':
					window.gExtCallBackStatements.sendStr = 'ExtService.rebuildSendStr();';
					break;
				case 'SerdURI':
					window.gExtCallBackStatements.sendURI = 'ExtService.rebuildSendURI();';
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

				eval(gExtCallBackStatements[i]);

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
	},
  
	destruct : function() 
	{
	}
};
  
// �J�X�^���X�N���v�g���Ŏg�p�ł���Z�k�\�� 

// values
if (!('XHTMLNS' in window)) window.XHTMLNS = ExtService.XHTMLNS;
if (!('XLinkNS' in window)) window.XLinkNS = ExtService.XLinkNS;
if (!('XULNS' in window))   window.XULNS = ExtService.XULNS;
if (!('EXNS' in window))    window.EXNS = ExtService.EXNS;


window.__defineGetter__('_window', function() {
	return gExtContextWindow || ExtService.contentWindow();
});

window.__defineGetter__('_contextualURI', function() {
	return ExtService.contextualURI(false, _window);
});
window.__defineGetter__('_selection', function() {
	return ExtService.getSelection(_window);
});
window.__defineGetter__('_selectionSource', function() {
	return ExtService.getSelectionSource(_window);
});
window.__defineGetter__('_selectionSourceXML', function() {
	return ExtService.getSelectionSource(_window, null, true);
});
window.__defineGetter__('_selectionNodes', function() {
	return ExtCommonUtils.getSelectionNodes(_window);
});
window.__defineGetter__('_focusedElement', function() {
	return document.commandDispatcher.focusedElement;
});

// �ȑO�̃o�[�W����
window.__defineGetter__('_getSelection', function() {
	return ExtService.getSelection(_window);
});
window.__defineGetter__('_getSelectionSource', function() {
	return ExtService.getSelectionSource(_window);
});
window.__defineGetter__('_getSelectionNodes', function() {
	return ExtCommonUtils.getSelectionNodes(_window);
});

window.__defineGetter__('_isOnline', function() {
	return ExtService.isOnline;
});
window.__defineGetter__('_inFrame', function() {
	return (_window != Components.lookupMethod(_window, 'top').call(_window));
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
	var funcs = ExtCommonUtils.concatArray(arguments);
	funcs.splice(0, 2);
	ExtService.doAfterLoaded(b, arguments[0], funcs);

	return b;
};
function _openNewWindowAndDo()
{
	var w = ExtService.openNewWindow(arguments[0], arguments[1]);
	var funcs = ExtCommonUtils.concatArray(arguments);
	funcs.splice(0, 2);
	ExtService.doAfterLoaded(w, arguments[0], funcs);

	return w;
};
function _openNewTabAndDo()
{
	var t = ExtService.openNewTab(arguments[0], arguments[1], true);
	var funcs = ExtCommonUtils.concatArray(arguments);
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
function _chooseFileToSave(aTitle, aDefault, aFilter)
{
	return ExtCommonUtils.chooseFile(
			aTitle,
			aDefault,
			(aFilter ? [aFilter, aFilter] : null),
			true
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


function _cancelStyles(aWindow)
{
	 ExtFunc.cancelStyles(aWindow || _window);
};
function _switchStyleTo(aName, aWindow)
{
	if (aName)
		aName = 'ext_style:'+aName;
	else
		aName = 'ext_system_onlyPermanence';

	ExtFunc.ApplyStyle(aName, true, aWindow || _window);
};
function _openStyleSheetSource(aName, aWindow)
{
	ExtFunc.OpenStyleSheetSource(aName, aWindow || _window);
};
function _editGlobalUserStyleSheet()
{
	ExtFunc.editUserContentCSS();
};
function _editCustomUserStyle(aWindow)
{
	ExtFunc.ApplyStyle('ext-common-customUserStyleEditor', false, aWindow || _window);
};
function _addOptionalStyleSheet(aIDOrIndex, aWindow)
{
	ExtFunc.toggleOptionalStyleRules(ExtService.getIDFromIndex(aIDOrIndex), null, aWindow || _window, true);
};
function _removeOptionalStyleSheet(aIDOrIndex, aWindow)
{
	ExtFunc.toggleOptionalStyleRules(ExtService.getIDFromIndex(aIDOrIndex), null, aWindow || _window, false);
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


function _addStyleSheet(path, type, media, aWindow)
{
	 ExtService.addStyle(path, type, media, aWindow || _window);
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

 
// ������ 
window.addEventListener(
'unload',
function()
{
	// �ݒ�̊Ď�������
	ExtCommonUtils.removePrefListener(ExtService.ShortcutPrefListener);
	ExtCommonUtils.removePrefListener(ExtService.RegexpPrefListener);
	ExtCommonUtils.removePrefListener(ExtService.UIPrefListener);

	var dsource = ExtCommonUtils.datasource;
	dsource.RemoveObserver(ExtService.RDFObserver);

	// �C�x���g���X�i�[�̓o�^������
	if (ExtCommonUtils.contextMenu)
		ExtCommonUtils.contextMenu.removeEventListener('popupshowing', ExtService.onContextMenuPopupShowing, true);

	var content = document.getElementById('content');
	if (content) {
		content.removeEventListener('keypress', window.contentAreaClick, false);
		content.removeEventListener('mouseover', ExtService.onMouseOver, false);
	}
},
false
);

window.addEventListener(
'load',
function()
{
	if (ExtService.activated) return;

	ExtService.init();

	// �C�x���g���X�i�[�̓o�^
	ExtCommonUtils.addPrefListener(ExtService.ShortcutPrefListener);
	ExtCommonUtils.addPrefListener(ExtService.RegexpPrefListener);
	ExtCommonUtils.addPrefListener(ExtService.UIPrefListener);

	// delayed
	window.setTimeout('ExtCommonUtils.datasource.AddObserver(ExtService.RDFObserver);', 100);
},
false
);
 