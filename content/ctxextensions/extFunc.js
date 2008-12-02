// 
var extCustomScripts = [];
var extCustomScriptsTemp;
var gExtContextWindow = null;
 
// static class "ExtFunc" 
var ExtFunc = {
	
	// 初期値の設定 
	service : ExtService,
	utils   : ExtCommonUtils,

	runningAutoExec   : false,
	jumpingNavigation : false,

	XHTMLNS : 'http://www.w3.org/1999/xhtml',
	XLinkNS : 'http://www.w3.org/1999/xlink',
	XULNS   : 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul',
	EXNS    : 'http://piro.sakura.ne.jp/ctxextensions',
 
//=========================== Executable Functions ============================
// 機能 
	
	// 「 Extensions 」のメニュー項目 
	doCommand : function(aCommandName, aWindow)
	{
		var w = aWindow || this.service.contentWindow();
		var uri;

		switch (aCommandName.toLowerCase())
		{

		case 'jspanel':
			this.service.openDialog(this.service.content+'JSPanel/JSPanel.xul', 'ctxextensions:JSPanel');
			break;

		case 'linkslist': this.getLinks(null, w); break;

		case 'openselectionasuri':
			uri = this.service.getSelection();
			if (!uri) return;

			uri = this.utils.makeURIComplete(uri, this.service.currentURI());

			this.service.loadURI(uri, null, this.utils.getPref('ctxextensions.showResultIn.openSelectionAsURI'));
			break;


		// 不可視情報の可視化

		case 'showcomments': this.showComment(w); break;
		case 'showlinks':    this.showLink(w); break;
		case 'showids':      this.showID(w); break;
		case 'showcites':    this.showCite(w); break;
		case 'showtitles':   this.showTitle(w); break;
		case 'showevents':   this.showEventHandler(w); break;
		case 'showall':
			if (this.utils.getPref('ctxextensions.showall_enable.showLinks')) this.showLink(w);
			if (this.utils.getPref('ctxextensions.showall_enable.showComments')) this.showComment(w);
			if (this.utils.getPref('ctxextensions.showall_enable.showTitles')) this.showTitle(w);
			if (this.utils.getPref('ctxextensions.showall_enable.showEvents')) this.showEventHandler(w);
			if (this.utils.getPref('ctxextensions.showall_enable.showIDs')) this.showID(w);
			if (this.utils.getPref('ctxextensions.showall_enable.showCites')) this.showCite(w);
			break;


		// 一つ上のディレクトリへ
		case 'up':
			uri = w.location.href;
			uri = uri.split('#')[0];
			uri = (ExtService.canUp && uri.match(/\/(index[^\/]*)?$/i)) ? ExtService.getParentDir(uri) : ExtService.getCurrentDir(uri) ;
			this.service.loadURI(uri/*, this.utils.makeURIFromSpec(w.location.href)*/, null, this.utils.getPref('ctxextensions.showResultIn.up')); // HTTP_REFERER must not be sent when the URI doesn't exist in the original document (RFC2616 14.36)
			break;

		case 'openciteforquote':
			uri = this.service.getCiteForQuote();
			if (!uri) return;
			this.service.loadURI(uri, this.utils.makeURIFromSpec(this.service.currentURI()), this.utils.getPref('ctxextensions.showResultIn.openCiteForQuote'));
			break;
		case 'openciteforedit':
			uri = this.service.getCiteForEdit();
			if (!uri) return;
			this.service.loadURI(uri, this.utils.makeURIFromSpec(this.service.currentURI()), this.utils.getPref('ctxextensions.showResultIn.openCiteForEdit'));
			break;
		case 'openlongdesc':
			uri = this.service.getLongdesc();
			if (!uri) return;
			this.service.loadURI(uri, this.utils.makeURIFromSpec(this.service.currentURI()), this.utils.getPref('ctxextensions.showResultIn.openLongdesc'));
			break;


		case 'pref':
			window.openDialog(
				'chrome://ctxextensions/content/pref/prefDialog.xul',
				'ExtPrefWindow',
				'chrome,all,dependent');
			break;


		default: break;
		}
		return;
	},
 
	// アウトライン 
	Outline : function(aEvent)
	{
		var i = parseInt(aEvent.target.value);
		var info = this.service.contentInfo();
		this.service.scrollTo(info.headings[i].node);
		info.headingsCurrentIndex = i;
		aEvent.stopPropagation();
		return;
	},
 
	// ナビゲーション 
	Navigations : function(aEvent)
	{
		var uri = aEvent.target.value;
		this.service.loadURI(uri, this.utils.makeURIFromSpec(this.service.currentURI()), this.utils.getPref('ctxextensions.showResultIn.navigations'));
		aEvent.stopPropagation();
	},
 
	// 不可視情報の表示 
	
	showInvisibleInfo : function(aXPath, aCallBackFunc, aWindow) 
	{
		var d = (aWindow ? aWindow.document : this.service.contentDocument());

		var nodes = this.utils.getNodesFromXPath(aXPath, d.documentElement);
		var max = nodes.snapshotLength;
		for (var i = 0; i < max; i++)
			aCallBackFunc(nodes.snapshotItem(i));
	},
 
	// コメントの可視化 
	showComment : function(aWindow)
	{
		this.showInvisibleInfo(
			'/descendant::comment()',
			this.makeCommentStrings,
			aWindow
		);
	},
	makeCommentStrings : function(aNode)
	{
		if (aNode.ex_comment_visible) return;

		aNode.ex_comment_visible = true;

		var output = document.createElementNS(ExtService.EXNS, 'comment');
		output.appendChild(document.createTextNode(ExtService.message.comment.replace(/%s/i, aNode.nodeValue)));
		output.ext_generated = true;

		aNode.parentNode.insertBefore(output, aNode);
	},
 
	// リンク先の可視化 
	showLink : function(aWindow)
	{
		this.showInvisibleInfo(
			'/descendant::*[(@href or @longdesc) and not(@ex_link_visible)]',
			this.makeLinkStrings,
			aWindow
		);
	},
	makeLinkStrings : function(aNode)
	{
		aNode.setAttribute('ex_link_visible', true);

		var href = ('href' in aNode && aNode.href) ? aNode.href :
				aNode.getAttributeNS(ExtService.XHTMLNS, 'href') ||
				aNode.getAttributeNS(ExtService.XLinkNS, 'href') ||
				'' ;

		if (href) {
			var hrefLabel = ExtService.message.href.replace(/%s/i, href.replace(aNode.baseURI, ''));

			var output_href = document.createElementNS(ExtService.EXNS, 'linkandanchor');
			output_href.appendChild(document.createTextNode(hrefLabel));
			output_href.ext_generated = true;

			if (aNode.firstChild)
				aNode.appendChild(output_href);
			else
				aNode.parentNode.insertBefore(output_href, aNode);
		}

		var longdesc = ('longdesc' in aNode && aNode.longdesc) ? aNode.longdesc :
				aNode.getAttributeNS(ExtService.XHTMLNS, 'longdesc') ||
				'' ;

		if (longdesc) {
			var longdescLabel = ExtService.message.longdesc.replace(/%s/i, longdesc.replace(aNode.baseURI, ''));

			var output_longdesc = document.createElementNS(ExtService.EXNS, 'linkandanchor');
			output_longdesc.setAttributeNS(ExtService.XLinkNS, 'xlink:type', 'simple');
			output_longdesc.setAttributeNS(ExtService.XLinkNS, 'xlink:href',  longdesc);
			output_longdesc.setAttributeNS(ExtService.XLinkNS, 'xlink:title', longdesc);
			output_longdesc.appendChild(document.createTextNode(longdescLabel));
			output_longdesc.ext_generated = true;

			if (aNode.firstChild)
				aNode.appendChild(output_longdesc);
			else
				aNode.parentNode.insertBefore(output_longdesc, aNode);
		}
	},
 
	// id/nameの可視化 
	showID : function(aWindow)
	{
		this.showInvisibleInfo(
			'/descendant::*[(@id or @name) and not(@ex_id_visible)]',
			this.makeIdStrings,
			aWindow
		);
	},
	makeIdStrings : function(aNode)
	{
		aNode.setAttribute('ex_id_visible', true);
		if (!aNode.id && !aNode.name) return;

		var label_inner = aNode.id || aNode.name ;
		var label = ExtService.message.id.replace(/%s/i, aNode.id || aNode.name) ;
		var output = document.createElementNS(ExtService.EXNS, 'id');
		output.setAttributeNS(ExtService.XLinkNS, 'xlink:type', 'simple');
		output.setAttributeNS(ExtService.XLinkNS, 'xlink:href', '#'+label_inner);
		output.appendChild(document.createTextNode(label));
		output.ext_generated = true;

		if (aNode.firstChild)
			aNode.insertBefore(output, aNode.firstChild);
		else
			aNode.parentNode.insertBefore(output, aNode);
	},
 
	// citeの可視化 
	showCite : function(aWindow)
	{
		this.showInvisibleInfo(
			'/descendant::*[(@cite or @longdesc) and not(@ex_cite_visible)]',
			this.makeCiteStrings,
			aWindow
		);
	},
	makeCiteStrings : function(aNode)
	{
		aNode.setAttribute('ex_cite_visible', true);
		if (!aNode.cite && !aNode.getAttributeNS(ExtService.XHTMLNS, 'longdesc')) return;

		var cite = ('cite' in aNode && aNode.cite) ? aNode.cite :
					aNode.getAttributeNS(ExtService.XHTMLNS, 'longdesc') ;
		var label = (/ins|del/i.test(aNode.localName)) ? ExtService.message.cite_edit : ExtService.message.cite ;
		label = label.replace(/%s/i, aNode.title || cite.replace(aNode.baseURI, ''));

		var output = document.createElementNS(ExtService.EXNS, 'citedfrom');
		output.setAttributeNS(ExtService.XLinkNS, 'xlink:type', 'simple');
		output.setAttributeNS(ExtService.XLinkNS, 'xlink:href',  cite);
		output.setAttributeNS(ExtService.XLinkNS, 'xlink:title', cite);
		output.appendChild(document.createTextNode(label));
		output.ext_generated = true;

		aNode.appendChild(output);
	},
 
	// title/summaryの可視化 
	showTitle : function(aWindow)
	{
		this.showInvisibleInfo(
			'/descendant::*[(@title or @summary or @alt) and not(@ex_title_visible)]',
			this.makeTitleStrings,
			aWindow
		);
	},
	makeTitleStrings : function(aNode)
	{
		aNode.setAttribute('ex_title_visible', true);
		if (!aNode.title && !aNode.alt && !aNode.getAttributeNS(ExtService.XHTMLNS, 'longdesc')) return;

		var title = ('title' in aNode && aNode.title) ? aNode.title :
				aNode.getAttributeNS(ExtService.XHTMLNS, 'title') ||
				aNode.getAttributeNS(ExtService.XLinkNS, 'title') ||
				'' ;
		var summary = ('summary' in aNode && aNode.summary) ? aNode.summary :
				aNode.getAttributeNS(ExtService.XHTMLNS, 'summary') ||
				'' ;
		var alt = ('alt' in aNode && aNode.alt) ? aNode.alt :
				aNode.getAttributeNS(ExtService.XHTMLNS, 'alt') ||
				'' ;

		if (title && (summary || alt)) title += '/';
		if (summary && alt) summary += '/';
		var label = ExtService.message.title.replace(/%s/i, title+summary+alt);

		var output = document.createElementNS(ExtService.EXNS, 'explanation');
		output.appendChild(document.createTextNode(label));
		output.ext_generated = true;

		if (aNode.firstChild || !aNode.parentNode)
			aNode.insertBefore(output, aNode.firstChild);
		else
			aNode.parentNode.insertBefore(output, aNode);
	},
 
	// イベント内容の可視化 
	showEventHandler : function(aWindow)
	{
		this.showInvisibleInfo(
			'/descendant::*[not(@ex_event_visible)][attribute::*[starts-with(local-name(), "ON") or starts-with(local-name(), "on")]]',
			this.makeEventStrings,
			aWindow
		);
	},
	makeEventStrings : function(aNode)
	{
		aNode.setAttribute('ex_event_visible', true);

		var attr = aNode.attributes;
		var output = document.createElementNS(ExtService.EXNS, 'event');
		var label, value;
		for (var i = 0; i < attr.length; i++)
		{
			if (attr[i].name.toLowerCase().substring(0, 2) != 'on') continue;

			label = document.createElementNS(ExtService.EXNS, 'eventlabel');
			label.appendChild(document.createTextNode(attr[i].name+':'));

			value = document.createElementNS(ExtService.EXNS, 'eventvalue');
			value.appendChild(document.createTextNode(attr[i].value));

			output.appendChild(label);
			output.appendChild(value);
		}

		output.ext_generated = true;

		if (aNode.firstChild)
			aNode.insertBefore(output, aNode.firstChild);
		else if (aNode.nextSibling)
			aNode.parentNode.insertBefore(output, aNode.nextSibling);
		else
			aNode.parentNode.appendChild(output);
	},
  
	// 選択文字列を送る 
	SendStr : function(aEventOrID, aString)
	{
		if (typeof aEventOrID != 'string' &&
			'stopPropagation' in aEventOrID) {
			aEventOrID.stopPropagation();
			if (aEventOrID.altKey || aEventOrID.ctrlKey || aEventOrID.metaKey)
				return this.service.editRDFItem(aEventOrID, 'SendStr');
		}

		var id     = (typeof aEventOrID == 'string') ? aEventOrID : aEventOrID.target.getAttribute('label') ;
		var path   = this.utils.SENDSTR.getData(id, 'Path'),
			openIn = this.utils.SENDSTR.getData(id, 'OpenIn'),
			word   = aString || this.service.getSelection();

		if (!path) return true;

		var charset = this.utils.SENDSTR.getData(id, 'Charset') || this.utils.getPref('ctxextensions.sendStrCharset');

		if (!word) {
			// load history for this item
			var data = { value : this.utils.getPref('ctxextensions.history.sendStr.'+escape(id)) || '' };
			if (!this.utils.PromptService.prompt(
					window,
					this.utils.getMsg('sendStr_inputString_title').replace(/%s/gi, id),
					this.utils.getMsg('sendStr_inputString'),
					data,
					null,
					{}
				) ||
				!data.value)
				return true;

			word    = data.value;
			charset = 'UTF-8';
			this.utils.setPref('ctxextensions.history.sendStr.'+escape(id), word);
		}

		// Unicode から指定された文字コードへ変換
		if (charset != 'UTF-8') {
			this.utils.UCONV.charset = charset;
			word = this.utils.UCONV.ConvertFromUnicode(word);
			word = this.utils.byteEscape(word); // escape()では文字化けするケースがある
		}
		else
			word = encodeURI(word);

		// word ではなく escape(word) を渡さないと、なんかようわからんけど勝手にヘンなコードに変換される。
		var uri = (!path.match(/%s/i)) ? path+word : path.replace(/%s/gi, word) ;

		switch(openIn)
		{
			case 'NewWindow':
				this.service.loadURI(uri, null, this.service.NEW_WINDOW);
				break;
			case 'NewTab':
				this.service.openNewTab(uri, null, this.service.NEW_TAB);
				break;
			case 'NewBackgroundTab':
				this.service.openNewTab(uri, null, this.service.NEW_BG_TAB);
				break;
			default:
				this.service.loadURI(uri);
				break;
		}

		return true;
	},
 
	// URIを送る 
	SendURI : function(aEventOrID, aShouldOpenTopFrame, aURI)
	{
		if (typeof aEventOrID != 'string' &&
			'stopPropagation' in aEventOrID) {
			aEventOrID.stopPropagation();
			if (aEventOrID.altKey || aEventOrID.ctrlKey || aEventOrID.metaKey)
				return this.service.editRDFItem(aEventOrID, 'SendURI');
		}

		var id     = (typeof aEventOrID == 'string') ? aEventOrID : aEventOrID.target.getAttribute('label') ;
		var path   = this.utils.SENDURI.getData(id, 'Path'),
			openIn = this.utils.SENDURI.getData(id, 'OpenIn'),
			encode = this.utils.SENDURI.getData(id, 'Encode'),
			uri    = aURI || this.service.contextualURI(aShouldOpenTopFrame);

		if (!path) return true;

		if (encode == 'true') uri = escape(uri);

		uri = (!path.match(/%s/i)) ? path+uri : path.replace(/%s/gi, uri) ;

		switch(openIn)
		{
			case 'NewWindow':
				this.service.loadURI(uri, null, this.service.NEW_WINDOW);
				break;
			case 'NewTab':
				if (this.utils.mainWindow.ExtService.currentURI(true) != 'about:blank') {
					this.service.openNewTab(uri, null, this.service.NEW_TAB);
					break;
				}
			case 'NewBackgroundTab':
				if (this.utils.mainWindow.ExtService.currentURI(true) != 'about:blank') {
					this.service.openNewTab(uri, null, this.service.NEW_BG_TAB);
					break;
				}
				break;
			default:
				this.service.loadURI(uri);
				break;
		}

		return true;
	},
 
	// 外部アプリ連携（ Execute Applications ） 
	ExecApps : function(aEventOrID, aShouldOpenTopFrame, aURI, aString)
	{
		if (typeof aEventOrID != 'string' &&
			'stopPropagation' in aEventOrID) {
			aEventOrID.stopPropagation();
			if (aEventOrID.altKey || aEventOrID.ctrlKey || aEventOrID.metaKey)
				return this.service.editRDFItem(aEventOrID, 'ExecApps');
		}

		var id    = (typeof aEventOrID == 'string') ? aEventOrID : aEventOrID.target.getAttribute('label') ;
		var path  = this.utils.EXECAPPS.getData(id, 'Path'),
			arg   = this.utils.EXECAPPS.getData(id, 'Arguments'),
			down  = (this.utils.EXECAPPS.getData(id, 'Download') == 'true'),
			uri   = aURI || this.service.contextualURI(aShouldOpenTopFrame);

		arg = (!arg) ? arg = '' : arg.replace(/\[URI\]/i, '%s') ;

		if (arg.match(/%c/i)) {
			var str = aString || this.service.getSelection() || '' ;
			arg = arg.replace(/%c/ig, str);

			// Unicode から指定された文字コードへ変換
			var charset = this.utils.EXECAPPS.getData(id, 'Charset') || this.utils.getPref('ctxextensions.sendStrCharset');
			if (charset != 'UTF-8') {
				this.utils.UCONV.charset = charset;
//				str = this.utils.UCONV.ConvertFromUnicode(str);
				arg = this.utils.UCONV.ConvertFromUnicode(arg);
			}
//			arg = arg.replace(/%c/ig, str);
		}

		var d = this.service.contentDocument(aShouldOpenTopFrame);
		if (down || d.URL.match(/^(chrome|resource|data):/)) {
			if (!d.location || d.URL != uri) d = null;
			this.service.downloadAndOpenWithApp('EXECAPP:'+path, path, arg, uri, d);
		}
		else
			this.service.run(path, arg.replace(/%s/gi, uri));

		return true;
	},
 
	// カスタムスクリプト 
	CustomScripts : function(aEventOrID, aScript, aWindow)
	{
		if (aEventOrID && typeof aEventOrID == 'object') { //event
			aEventOrID.stopPropagation();
			if (aEventOrID.altKey || aEventOrID.ctrlKey || aEventOrID.metaKey)
				return this.service.editRDFItem(aEventOrID, 'CustomScripts');
		}

		var script = aScript;
		var id = '_anonymous';

		if (aEventOrID) {
			if (typeof aEventOrID == 'string') {
				id = aEventOrID;
				if (!script)
					script = ExtCommonUtils.unescape(ExtCommonUtils.CUSTOMSCRIPTS.getData(aEventOrID, 'Script'));
			}
			else {
				if (ExtService.isEventSentFromTextFields(aEventOrID) ||
					ExtService.isFindTypeAheadActive()) return true;
				id = aEventOrID.target.getAttribute('label');
				if (!script)
					script = ExtCommonUtils.unescape(ExtCommonUtils.CUSTOMSCRIPTS.getData(id, 'Script'));
			}
		}

		if (!script) return true;

		// カスタムスクリプト内で使用できる短縮構文
		var w = aWindow || ExtService.contentWindow();

		gExtContextWindow = w;

		// headingやnavigationsを参照している場合、リストを更新
		if (script.match(/headings/)) {
			ExtService.updateHeadings(w);
			w.document.headings = w.document.__mozInfo__.headings;
		}
		if (script.match(/navigations/)) {
			ExtService.updateNavigations(w);
			w.document.navigations = w.document.__mozInfo__.navigations;
		}

		try {
			// windowオブジェクトのメソッドにする
			eval([
				'window.extCustomScripts[id] = function() { with (window) {',
					'var _window = window._window;',
					'var _contextualURI = window._contextualURI;',
					'var _selection = window._selection;',
					'var _selectionSource = window._selectionSource;',
					'var _selectionSourceXML = window._selectionSourceXML;',
					'var _selectionNodes = window._selectionNodes;',
					'var _focusedElement = window._focusedElement;',

					'var Cc = Components.classes;'+
					'var Ci = Components.interfaces;'+

					// 以前のバージョン'
					'var _getSelection = window._getSelection;',
					'var _getSelectionSource = window._getSelectionSource;',
					'var _getSelectionNodes = window._getSelectionNodes;',
					'var _isOnline = window._isOnline;',
					'var _inFrame = window._inFrame;',
					'var _popupNode = window._popupNode;',
					'var _profileURI = window._profileURI;',
					'var _installedURI = window._installedURI;',
					'var _temporaryURI = window._temporaryURI;',
					'var _homeURI = window._homeURI;',
					'var _profilePath = window._profilePath;',
					'var _installedPath = window._installedPath;',
					'var _temporaryPath = window._temporaryPath;',
					'var _homePath = window._homePath;',

					script,
				' } }'
			].join('\n\r'));
			return window.extCustomScripts[id]();
		}
		catch(e) { // Fx 3ではエラーになる（withが正しく動いてる？）
			try {
				eval([
					'window.extCustomScripts[id] = function() { with (window) {',
						script,
					' } }'
				].join('\n\r'));
			}
			catch(e) {
				alert(e);
				return false;
			}
		}
		try {
			return window.extCustomScripts[id]();
		}
		catch(e) {
			alert(e);
		}

		return true;
	},
 
	// リンク一覧をコピーする 
	getLinks : function(aRegExp, aWindow, aShouldNotCopy)
	{
		var links = this.service.getLinksArray(aRegExp, aWindow, true);

		var ret = [];
		for (var i in links)
			ret.push(links[i].uri);

		if (!aShouldNotCopy)
			this.utils.setStringToClipBoard(ret.join('\n')+'\n');

		return ret;
	},
 
	// 見出し間ジャンプ 
	goHeadings : function(aTarget, aEvent, aWindow)
	{
		if (this.service.isEventSentFromTextFields(aEvent) ||
			this.service.isFindTypeAheadActive()) return;

		this.service.updateHeadings(aWindow);

		var d    = (aWindow ? aWindow.document : this.service.contentDocument()),
			w    = (aWindow ? aWindow : gBrowser.contentWindow ),
			info = this.service.contentInfo(false, w);
		if (!info.headings || !info.headings.length) return;

		// アンカーから現在の見出しを取得。取得できなければ、内部の値から。
		var uri     = d.URL.split('#');
		var current =
			(uri[1] &&
			info.headingsIndex &&
			info.headingsIndex[uri[1]] !== void(0) &&
			info.headingsCurrentIndex < 0)
				? info.headingsIndex[uri[1]] : info.headingsCurrentIndex ;

		switch (aTarget.toLowerCase())
		{
			case 'next':
				if (current < info.headings.length-1) current++;
				else current = 0;
				break;
			case 'prev':
				if (current > 0) current--;
				else current = info.headings.length-1;
				break;
			default:
				break;
		}

		this.service.scrollTo(info.headings[current].node);
		info.headingsCurrentIndex = current;

		return;
	},
 
	// フォーカスを移動 
	advanceFocus : function(aDir, aEvent)
	{
		if (aEvent &&
			(
			this.service.isEventSentFromTextFields(aEvent) ||
			this.service.isFindTypeAheadActive()
			)
			) return;

		var d = this.service.contentDocument();
		var dispatcher = document.commandDispatcher;
		if (!dispatcher.focusedElement) {
			dispatcher.advanceFocusIntoSubtree(d.documentElement);
			// advanceFocusIntoSubtreeはカレントノードの次にあるリンクなどにフォーカスする。
			if (aDir > 0) return;
		}

		var focusedNode = dispatcher.focusedElement;
		try {
			focusedNode.blur();
		}
		catch(e) {
		}

		var walker = d.createTreeWalker(d, NodeFilter.SHOW_ELEMENT, this.getFocusFilter, false);
		walker.currentNode = focusedNode;

		var next = (aDir > 0) ? walker.nextNode() : walker.previousNode() ;
		if (!next) {
			if (aDir > 0) { // move to the first node
				walker.currentNode = walker.root;
				walker.nextNode();
			}
			else
				while(walker.nextNode()) // move to the last node
				{
				}

			next = walker.currentNode;
		}

		if (next) next.focus();
	},
	getFocusFilter :
	{
		acceptNode : function(aNode)
		{
			return (
					!('focus' in aNode) || !aNode.focus ||
					typeof aNode.focus != 'function' ||
					!('offsetParent' in aNode) // hidden elements
					) ? NodeFilter.FILTER_SKIP : NodeFilter.FILTER_ACCEPT ;
		}
	},
 
	// Site Navigation Toolbarの内容にジャンプ 
	goNavigation : function(aType, aEvent, aNode)
	{
		if (this.jumpingNavigation ||
			this.service.isEventSentFromTextFields(aEvent) ||
			this.service.isFindTypeAheadActive()) return;

		this.service.updateNavigationsPopup(false, aType);
		var popup = document.getElementById('ext-common-navigationsSelect:mpopup'),
			nodes = document.getElementById('ext-common-navigations:mpopup').getElementsByAttribute('ext-navigation-'+aType, 'true');

		if (!nodes.length) {
//			window.status = this.utils.getMsg('error_gotoLink_noitem').replace(/%s/i, this.utils.getMsg('link_'+aType));
			return;
		}

		this.jumpingNavigation = true;
		try {
			var i,
				menuitem;
			if (nodes.length > 1 &&
				this.utils.getPref('ctxextensions.enable.navigations_submenu') &&
				!aNode)
			{
				// 同じリンクタイプを持つリンクが二つ以上ある場合、ポップアップで選択

				var range = document.createRange();
				range.selectNodeContents(popup);
				range.deleteContents();
				range.detach();

				for (i = 0; i < nodes.length; i++)
				{
					menuitem = document.createElement('menuitem');

					menuitem.setAttribute('id', 'ext-navigationsSelect:item:'+aType);
					menuitem.setAttribute('label', nodes[i].getAttribute('label'));
					menuitem.setAttribute('originalLabel', nodes[i].getAttribute('originalLabel'));
					menuitem.setAttribute('accesskey', (i < 26+9) ? (i+1).toString(26+9) : '');
					menuitem.setAttribute('value', i);
					menuitem.setAttribute('oncommand', 'ExtFunc.goNavigation(\''+aType+'\', event, this);');

					popup.appendChild(menuitem);
				}

				this.service.showPopup(popup, window.screenX+20, window.screenY+40);
		//		var x = window.screenX+(window.outerWidth/4);
		//		var y = window.screenY+(window.outerHeight/5);

			}
			else {
				i = aNode ? aNode.getAttribute('value') : 0 ;
				i = i ? Number(i) : 0 ;

				var destURL = nodes[i].getAttribute('value');
				try {
					// セキュリティチェック
					const ssm = Components.classes['@mozilla.org/scriptsecuritymanager;1'].getService().QueryInterface(Components.interfaces.nsIScriptSecurityManager);
					ssm.checkLoadURIStr(window.content.location.href, destURL, 0);
					window.loadURI(destURL, this.utils.makeURIFromSpec(this.service.currentURI()));
				}
				catch (e) {
					dump('Error: it is not permitted to load this URI from a <link> element: ' + e);
				}

			}
		}
		catch(e) {alert(e);
		}

		this.jumpingNavigation = false;
		return;
	},
 
	// メニューをポップアップ 
	showMenu : function(aNode)
	{
		var type    = aNode.id.split(':')[1],
			index   = (aNode.id.split(':').length > 2) ? parseInt(aNode.id.split(':')[2]) : -1 ,
			popupId = (type.match(/^(navigations|outline|customScripts|execApps)$/)) ? 'ext-common-'+type+':mpopup' : null ;

		if (popupId &&
			!this.utils.getPref('ctxextensions.submenu.menubar.'+type))
			popupId = 'menu-item-'+type+':mpopup';


		var popup = (index < 0) ? document.getElementById(popupId) :
					document.getElementById('main-menubar').childNodes[index].firstChild ;

		// bookmarks
		if (index > -1 && popup.localName != 'menupopup')
			popup = popup.parentNode.lastChild;

		switch (type)
		{
			case 'navigations':
				this.service.updateNavigationsPopup();
				break;

			case 'outline':
				this.service.updateOutlinePopup();
				break;

			case 'execApps':
				break;

			case 'menu':
				var menubar = popup.parentNode.parentNode;
				for (var i = 0; i < menubar.childNodes.length; i++)
					menubar.childNodes[i].hidden = (menubar.childNodes[i] != popup.parentNode);
				break;

			default:
				break;
		}

		if (type.match(/^(navigations|outline)$/) &&
			!this.utils.getPref('ctxextensions.submenu.menubar.'+type)) {
			popup.showPopup();
			return;
		}


		if (!popup.childNodes.length) {
//			window.status = this.utils.getMsg('error_showMenu_noitem').replace(/%s/i, this.utils.getMsg('menu_'+type));
			return;
		}

		this.service.showPopup(popup, window.screenX+20, window.screenY+40);
//		var x = window.screenX+(window.outerWidth/4);
//		var y = window.screenY+(window.outerHeight/5);

		return;
	},
	
	toggleMenubar : function() 
	{
		this.service.updateKey();
		var menubar = document.getElementById('main-menubar');
		for (var i = 0; i < menubar.childNodes.length; i++)
			menubar.childNodes[i].hidden = false;
		return;
	},
   
	// 自動実行 
	
	// 不可視情報表示の自動実行 
	AutoExecShow : function(aWindow)
	{
		var d = (aWindow ? aWindow.document : this.service.contentDocument());
		if (!d) return; // failsafe

		var w    = (aWindow ? aWindow : gBrowser.contentWindow ),
			info = this.service.contentInfo(false, w);
		if ('showAutoFinished' in info) return;

		var prefs = {
				showComments : 'showComment',
				showLinks    : 'showLink',
				showIDs      : 'showID',
				showCites    : 'showCite',
				showTitles   : 'showTitle',
				showEvents   : 'showEventHandler'
			};

		for (var i in prefs)
			if (this.utils.getPref('ctxextensions.autoexec.'+i)) {
				this[prefs[i]](aWindow);
				info.showAutoFinished = true;
			}

		return;
	},
 
	// カスタムスクリプトの自動実行 
	AutoExecCS : function(aWindow)
	{
		var d = (aWindow ? aWindow.document : this.service.contentDocument());
		if (!d) return; // failsafe

		var w    = (aWindow ? aWindow : gBrowser.contentWindow ),
			info = this.service.contentInfo(false, w);
		if ('execautoFinished' in info ||
			!this.utils.getPref('ctxextensions.autoexec.customScripts')) return;

		var CSObj = this.utils.CUSTOMSCRIPTS,
			item,
			ret;
		for (var i = 0; i < CSObj.length; i++)
		{
			item = CSObj.item(i);
			if (CSObj.getData(item, 'Automatically') == 'true')
				ret = this.CustomScripts(CSObj.getData(item, 'Name'), null, w);
		}

		info.execautoFinished = true;

		return;
	},
  
	destruct : function() 
	{
	}
};
  
