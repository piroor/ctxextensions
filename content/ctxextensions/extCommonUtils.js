// static class "ExtCommonUtils" 
var ExtCommonUtils = {

	debug : true,

	activated : false,

	content      : 'chrome://ctxextensions/content/',
	locale       : 'chrome://ctxextensions/locale/',
	
	// プロパティ 
	// properties
	
	get browserURI() 
	{
		if (!this._browserURI) {
			var uri = this.getPref('browser.chromeURL');
			if (!uri) {
				try {
					var handler = Components.classes['@mozilla.org/commandlinehandler/general-startup;1?type=browser'].getService(Components.interfaces.nsICmdLineHandler);
					uri = handler.chromeUrlForTask;
				}
				catch(e) {
				}
			}
			if (uri.charAt(uri.length-1) == '/')
				uri = uri.replace(/chrome:\/\/([^\/]+)\/content\//, 'chrome://$1/content/$1.xul');
			this._browserURI = uri;
		}
		return this._browserURI;
	},
	_browserURI : null,
  
	get contextMenu() 
	{
		if (!this.mContextMenu)
			this.mContextMenu = document.getElementById('contentAreaContextMenu');
		return this.mContextMenu;
	},
	mContextMenu : null,
 
	get browser() 
	{
		if (this._browser === void(0)) {
			this._browser = document.getElementById('content');
			if (this._browser &&
				(
					this._browser.localName != 'browser' &&
					this._browser.localName != 'tabbrowser'
				)
				)
				this._browser = null;
		}
		if (this._browser) return this._browser;

		var b = this.browsers;
		if (b.length || !document.popupNode) return b[0] || null ;

		// in undocked sidebar panels, and so on
		var browsers = this.concatArray(
					document.getElementsByTagNameNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'tabbrowser'),
					document.getElementsByTagNameNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'browser')
				);
		var contentURI;
		for (var i in browsers)
		{
			try {
				if (document.popupNode.ownerDocument == browsers[i].contentDocument)
					return browsers[i];
			}
			catch(e) {
				if (document.popupNode.ownerDocument.location.href == browsers[i].getAttribute('content'))
					return browsers[i];
			}
		}

		return null;
	},
	
	get browsers() 
	{
		return document.getElementsByTagNameNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'tabbrowser');
	},
  
	get browserWindow() 
	{
		return this.getTopWindowOf('navigator:browser');
	},
 
	get browserWindows() 
	{
		return this.getWindowsOf('navigator:browser');
	},
 
	get datasource() 
	{
		if (!this.mDatasource) {
			var uri = this.getURLFromFilePath(this.datasourceFile.path).spec;
			this.mDatasource = this.RDF.GetDataSource(uri);
		}
		return this.mDatasource;
	},
	mDatasource : null,
	
	// RDFデータソースの位置 
	get datasourceURI()
	{
		var dsource_uri;
		try {
			dsource_uri = this.getURLFromFilePath(this.getPref('ctxextensions.override.datasource_path')).spec;
		}
		catch(e) {
		}

		if (!dsource_uri) {
			var ProfD = this.getURISpecFromKey('ProfD');
			if (!ProfD.match(/\/$/)) ProfD += '/';
			dsource_uri = ProfD+'ctxextensions.rdf';
		}
		return dsource_uri;
	},
 
	// RDFデータソースのファイル 
	get datasourceFile()
	{
		var dsourceFile = this.getFileFromURLSpec(this.datasourceURI);
		if (!dsourceFile.exists())
			dsourceFile.create(dsourceFile.NORMAL_FILE_TYPE, 0644);

		return dsourceFile;
	},
  
	get userContentCSSFile() 
	{
		var UChrm = this.getURISpecFromKey('UChrm');
		if (!UChrm.match(/\/$/)) UChrm += '/';

		var CSSFile = this.getFileFromURLSpec(UChrm+'userContent.css');
		if (!CSSFile.exists()) {
			var exampleURI = UChrm+'userContent-example.css';
			var example = this.getFileFromURLSpec(exampleURI);

			var sourceURI = (example.exists()) ? exampleURI : 'chrome://ctxextensions/content/default/userContent.css' ;
			this.saveURIInBackgroundAs(sourceURI, CSSFile);
		}

		return CSSFile;
	},
 
	// メッセージ文字列 
	get msg()
	{
		if (!this._msg)
			this._msg = this.StringBundleService.createBundle(this.locale+'ctxextensions.properties');
		return this._msg;
	},
	_msg : null,
	
	getMsg : function(aName) 
	{
		try {
			return this.msg.GetStringFromName(aName);
		}
		catch(e) {
			return '';
		}
	},
  
	get keys() 
	{
		if (!this._keys)
			this._keys = this.StringBundleService.createBundle('chrome://global/locale/keys.properties');
		return this._keys;
	},
	_keys : null,
	
	getKey : function(aName) 
	{
		try {
			return this.keys.GetStringFromName(aName);
		}
		catch(e) {
			return '';
		}
	},
  
	get platformKeys() 
	{
		if (!this._platformKeys)
			this._platformKeys = this.StringBundleService.createBundle('chrome://global-platform/locale/platformKeys.properties');
		return this._platformKeys;
	},
	_platformKeys : null,
	
	getPlatformKey : function(aName) 
	{
		try {
			return this.platformKeys.GetStringFromName(aName);
		}
		catch(e) {
			return this.getKey(aName);
		}
	},
  
	// RDFデータ 
	mNS      : 'http://white.sakura.ne.jp/~piro/rdf#',
	mBaseURL : 'chrome://ctxextensions/content/ctxextensions.rdf#',
	
	// ユーザースタイル 
	get USERSTYLES()
	{
		if (!this.mUSERSTYLES)
			this.mUSERSTYLES = new pRDFData('UserStyles', this.datasourceURI, 'bag', this.mNS, this.mBaseURL);
		return this.mUSERSTYLES;
	},
	mUSERSTYLES : null,
 
	// スタイル選択情報 
	get SELECTEDSTYLES()
	{
		if (!this.mSELECTEDSTYLES)
			this.mSELECTEDSTYLES = new pRDFData('SelectedStyles', this.datasourceURI, 'bag', this.mNS, this.mBaseURL);
		return this.mSELECTEDSTYLES;
	},
	mSELECTEDSTYLES : null,
 
	// スタイルシート 
	get STYLESHEETS()
	{
		if (!this.mSTYLESHEETS)
			this.mSTYLESHEETS = new pRDFData('StyleSheets', this.datasourceURI, '', this.mNS, this.mBaseURL);
		return this.mSTYLESHEETS;
	},
	mSTYLESHEETS : null,
 
	// カスタムスクリプト 
	get CUSTOMSCRIPTS()
	{
		if (!this.mCUSTOMSCRIPTS)
			this.mCUSTOMSCRIPTS = new pRDFData('CustomScripts', this.datasourceURI, '', this.mNS, this.mBaseURL);
		return this.mCUSTOMSCRIPTS;
	},
	mCUSTOMSCRIPTS : null,
 
	// 外部アプリ登録情報 
	get EXECAPPS()
	{
		if (!this.mEXECAPPS)
			this.mEXECAPPS = new pRDFData('ExecApps', this.datasourceURI, '', this.mNS, this.mBaseURL);
		return this.mEXECAPPS;
	},
	mEXECAPPS : null,
 
	// 選択文字列の送り先 
	get SENDSTR()
	{
		if (!this.mSENDSTR)
			this.mSENDSTR = new pRDFData('SendStr', this.datasourceURI, '', this.mNS, this.mBaseURL);
		return this.mSENDSTR;
	},
	mSENDSTR : null,
 
	// URIの送り先 
	get SENDURI()
	{
		if (!this.mSENDURI)
			this.mSENDURI = new pRDFData('SendURI', this.datasourceURI, '', this.mNS, this.mBaseURL);
		return this.mSENDURI;
	},
	mSENDURI : null,
  
	// XPConnect 
	
	get WINMAN() 
	{
		if (!this.mWINMAN) {
			if (Components.classes['@mozilla.org/appshell/window-mediator;1'])
				this.mWINMAN = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator);
			else
				this.mWINMAN = Components.classes['@mozilla.org/rdf/datasource;1?name=window-mediator'].getService(Components.interfaces.nsIWindowMediator);
		}
		return this.mWINMAN;
	},
	mWINMAN : null,
 
	get PREF() 
	{
		if (!this.mPREF) {
			this.mPREF = Components.classes['@mozilla.org/preferences;1'].getService(Components.interfaces.nsIPrefBranch);
		}
		return this.mPREF;
	},
	mPREF : null,
 
	get DEFPREF() 
	{
		if (!this.mDEFPREF) {
			this.mDEFPREF = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getDefaultBranch(null);
		}
		return this.mDEFPREF;
	},
	mDEFPREF : null,
 
	get RDF() 
	{
		if (!this.mRDF) {
			this.mRDF = Components.classes['@mozilla.org/rdf/rdf-service;1'].getService(Components.interfaces.nsIRDFService);
		}
		return this.mRDF;
	},
	mRDF : null,
 
	get IOService() 
	{
		if (!this.mIOService) {
			this.mIOService = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);
		}
		return this.mIOService;
	},
	mIOService : null,
 
	get UCONV() 
	{
		if (!this.mUCONV) {
			this.mUCONV = Components.classes['@mozilla.org/intl/scriptableunicodeconverter'].getService(Components.interfaces.nsIScriptableUnicodeConverter);
		}
		return this.mUCONV;
	},
	mUCONV : null,
 
	get StringBundleService() 
	{
		if (!this.mStringBundleService)
			this.mStringBundleService = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService);
		return this.mStringBundleService;
	},
	mStringBundleService : null,
 
	get PromptService() 
	{
		if (!this.mPromptService)
			this.mPromptService = Components.classes['@mozilla.org/embedcomp/prompt-service;1'].getService(Components.interfaces.nsIPromptService);
		return this.mPromptService;
	},
	mPromptService : null,
 
	get CLIPBOARD() 
	{
		if (!this._clipboard)
			this._clipboard = Components.classes['@mozilla.org/widget/clipboard;1'].getService(Components.interfaces.nsIClipboard);
		return this._clipboard;
	},
	_clipboard : null,
 
	get ClipBoardHelper() 
	{
		if (!this._ClipBoardHelper)
			this._ClipBoardHelper = Components.classes['@mozilla.org/widget/clipboardhelper;1'].getService(Components.interfaces.nsIClipboardHelper);
		return this._ClipBoardHelper;
	},
	_ClipBoardHelper : null,
 
	get TextToSubURI() 
	{
		if (!this._TextToSubURI)
			this._TextToSubURI = Components.classes['@mozilla.org/intl/texttosuburi;1'].getService(Components.interfaces.nsITextToSubURI);
		return this._TextToSubURI;
	},
	_TextToSubURI : null,
   
	// 文字列処理 
	
	// escape and unescape 
	
	// byte excape implemented by rti 
	// (http://www.mozilla.gr.jp/ml/logs/moz-users/4300/4350.html)
	byteEscape : function(aString)
	{
		var ret = '',
			code;
		for(var i = 0; i < aString.length; i++) {
			code = aString.charCodeAt(i);
			ret += ((code >= 48 && code <= 57) ||
					(code >= 65 && code <= 90) ||
					(code >= 97 && code <= 122)) ? String.fromCharCode(code) : '%'+code.toString(16) ;
		}
		return ret;
	},
 
	unescapeString : function(aString) 
	{
		var unescapedAsStr = unescape(aString);
		var unescapedAsURI = this.unescapeWithOldMethod(aString);
		return (this.escapeWithOldMethod(unescapedAsURI) == aString) ? unescapedAsURI : unescapedAsStr ;
	},
	
	escapeWithOldMethod : function(aString) 
	{
		return this.TextToSubURI.ConvertAndEscape('UTF-8', aString.replace(/ /g, '%20')).replace(/%2520/g, '%20').replace(/%2B/g, '+');
	},
 
	unescapeWithOldMethod : function(aString) 
	{
		return this.TextToSubURI.UnEscapeAndConvert('UTF-8', aString.replace(/%%20/g, '+').replace(/\+/g, '%2B'));
	},
  
	// 改行などの、prefs.jsやlocalstore.rdfに保存するときに問題になる文字をエスケープ 
	escape : function(aString)
	{
		return (aString) ? aString.replace(/&/g, '[[AMP]]').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\t/g, '\\t') : '' ;
	},
	
	unescape : function(aString) 
	{
		return (aString) ? aString.replace(/\[\[AMP\]\]/g, '&').replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\\\/g, '\\').replace(/\\\n/g, '\\n').replace(/\\\t/g, '\\t') : '' ;
	},
   
	// 文字列を短くする 
	getShortString : function(aString, aMax, aMode)
	{
		if (aString.length < aMax) return aString;
		switch (aMode)
		{
			case 'cut-end':
				return aString.substr(0, aMax-1) + '...';
				break;
			case 'cut-start':
				return '...' + aString.substr(aString.length-aMax+1);
				break;
			case 'cut-center':
			default:
				return aString.substr(0, (aMax/2)-1) + '...' + aString.substr(aString.length-(aMax/2)+1);
				break;
		}
		return null;
	},
 
	// Unicode全角英数を半角に変換 
	getHalfWidthStrings : function(aString)
	{
		var code,
			ret = '';
		for (var i = 0; i < aString.length; i++)
		{
			code = aString.charCodeAt(i);
			if (code >= 0xFF10 && code <= 0xFF19 || // 0-9
				code >= 0xFF21 && code <= 0xFF5A) // A-Z, a-z
				code -= 0xFEE0;

			ret += String.fromCharCode(code);
		}
		return ret;
	},
 
	// 渡された文字列から適切な正規表現を生成する 
	makeRegExp : function(aPattern, aRegexp)
	{
		if (typeof aPattern != 'string') return aPattern;

		var flags = '';
		var result = aPattern.match(/^\/(.+)\/([igm]+)?$/);
		if (result) {
			aPattern = result[1];
			flags    = result[2] || '';
		}
		return aRegexp ? aRegexp.compile(aPattern, flags) : new RegExp(aPattern, flags);
	},
 
	// キーボードショートカットの組み合わせを示す文字列を得る 
	getStringFromKeyboardShortcut : function(aData)
	{
		var modifiers = [];
		if (aData.altKey)   modifiers.push('alt');
		if (aData.ctrlKey)  modifiers.push('control');
		if (aData.metaKey)  modifiers.push('meta');
		if (aData.shiftKey) modifiers.push('shift');

		return this.getAccelText({
				key       : (aData.key == ' ') ? 'Space' : aData.key,
				keyCode   : aData.keyCode,
				modifiers : modifiers.length ? modifiers.join(',') : ''
			});
	},
 
	// key, keycode, modifiersからacceltextを生成 
	getAccelText : function(aData, aShouldReturnData)
	{
		const nsIDOMKeyEvent = Components.interfaces.nsIDOMKeyEvent;

		var mod = (aData.modifiers || '').toLowerCase();
		var key = aData.key ? aData.key.toUpperCase() : '' ;
		if (!key) key = this.getKey(aData.keyCode.toUpperCase());

		var data = {
				key      : key,
				keyCode  : aData.keyCode,
				shiftKey : (mod.indexOf('shift') > -1),
				altKey   : (mod.indexOf('alt') > -1),
				metaKey  : (mod.indexOf('meta') > -1),
				ctrlKey  : (mod.indexOf('control') > -1)
			};

		if (!key) return aShouldReturnData ? data : '';

		var keys = [];
		if (data.shiftKey)
			keys.push(this.getPlatformKey('VK_SHIFT'));
		if (data.altKey)
			keys.push(this.getPlatformKey('VK_ALT'));
		if (data.metaKey)
			keys.push(this.getPlatformKey('VK_META'));
		if (data.ctrlKey)
			keys.push(this.getPlatformKey('VK_CONTROL'));
		if (mod.indexOf('accel') > -1) {
			var accelKey = this.getPref('ui.key.accelKey') || nsIDOMKeyEvent[navigator.platform.match(/Mac/) ? 'DOM_VK_META' : 'DOM_VK_CONTROL' ];
			keys.push(
				accelKey == nsIDOMKeyEvent.DOM_VK_META ? this.getPlatformKey('VK_META') :
				accelKey == nsIDOMKeyEvent.DOM_VK_ALT ? this.getPlatformKey('VK_ALT') :
				this.getPlatformKey('VK_CONTROL')
			);

			if (accelKey == nsIDOMKeyEvent.DOM_VK_META)
				data.metaKey = true;
			else if (accelKey == nsIDOMKeyEvent.DOM_VK_ALT)
				data.altKey = true;
			else
				data.ctrlKey = true;
		}

		if (aShouldReturnData) return data;

		var sep = this.getPlatformKey('MODIFIER_SEPARATOR');
		if (keys.length) {
			keys.push(key);
			key = keys.join(sep);
		}

		return key;
	},
 
	// クリップボードから文字列を取得する 
	getStringFromClipBoard : function()
	{
		try {
			var trans = Components.classes['@mozilla.org/widget/transferable;1'].createInstance(Components.interfaces.nsITransferable);
			trans.addDataFlavor('text/unicode');
			try {
				this.CLIPBOARD.getData(trans, this.CLIPBOARD.kSelectionClipboard);
			}
			catch(ex) {
				this.CLIPBOARD.getData(trans, this.CLIPBOARD.kGlobalClipboard);
			}

			var data       = {},
				dataLength = {};
			trans.getTransferData('text/unicode', data, dataLength);

			if (data) {
				data = data.value.QueryInterface(('nsISupportsWString' in Components.interfaces ? Components.interfaces.nsISupportsWString : Components.interfaces.nsISupportsString ));
				return data.data.substring(0, dataLength.value / 2);
			}
		}
		catch(e) {
		}
		return null;
	},
 
	// クリップボードに文字列をコピーする 
	setStringToClipBoard : function(aString)
	{
		this.ClipBoardHelper.copyString(aString);
	},
 
	// 渡された文字列から数字部分を抜き出す 
	getNumberFromString : function(aString)
	{
		if (!aString || !aString.match(/[\uFF10-\uFF19]/))
			return void(0);

		var num = String(aString)
					.replace(/\uFF10/g, '0') // 全角数字を半角に
					.replace(/\uFF11/g, '1')
					.replace(/\uFF12/g, '2')
					.replace(/\uFF13/g, '3')
					.replace(/\uFF14/g, '4')
					.replace(/\uFF15/g, '5')
					.replace(/\uFF16/g, '6')
					.replace(/\uFF17/g, '7')
					.replace(/\uFF18/g, '8')
					.replace(/\uFF19/g, '9')
					.match(/\d+/g);

		return num ? Number(num[0]) : void(0) ;
	},
  
	// URI操作 
	
	// 渡されたURIからnsIURIのオブジェクトを生成する 
	makeURIFromSpec : function(aURI)
	{
		try {
			var newURI;
			aURI = aURI || '';
			if (aURI && aURI.match(/^file:/)) {
				var fileHandler = this.IOService.getProtocolHandler('file').QueryInterface(Components.interfaces.nsIFileProtocolHandler);
				var tempLocalFile = fileHandler.getFileFromURLSpec(aURI);

				newURI = this.IOService.newFileURI(tempLocalFile); // we can use this instance with the nsIFileURL interface.
			}
			else {
				newURI = this.IOService.newURI(aURI, null, null);
			}

			return newURI;
		}
		catch(e){
		}
		return null;
	},
 
	// 内部名からファイル/ディレクトリのURIを得る 
	getURISpecFromKey : function(aKey)
	{
		const DIR = Components.classes['@mozilla.org/file/directory_service;1'].getService(Components.interfaces.nsIProperties);
		var dir = DIR.get(aKey, Components.interfaces.nsILocalFile);
		return this.getURLFromFilePath(dir.path).spec;
	},
 
	// URLをファイルパスに変換する 
	getFileFromURLSpec : function(aURI)
	{
		if ((aURI || '').indexOf('file://') != 0) return '';

		var fileHandler = this.IOService.getProtocolHandler('file').QueryInterface(Components.interfaces.nsIFileProtocolHandler);
		return fileHandler.getFileFromURLSpec(aURI);
	},
 
	// ファイルパスをURIに変換する 
	getURLFromFilePath : function(aPath)
	{
		var tempLocalFile = this.makeFileWithPath(aPath);
		return this.IOService.newFileURI(tempLocalFile);
	},
 
	// 相対URIから絶対URIを得る 
	makeURIAbsolute : function(aBase, aURI)
	{
		var baseURI = this.IOService.newURI(aBase, null, null);
		return this.IOService.newURI(baseURI.resolve(aURI), null, null).spec;
	},
 
	// 不完全なURIを補完する 
	makeURIComplete : function(aURI, aSourceURI)
	{
		var filepath = aSourceURI.split('?')[0],
			path     = aSourceURI.split('#')[0],
			dir      = this.getCurrentDir(filepath);

		return (aURI.match(/^urn:/i)) ? aURI :
				(aURI.match(/^(ttp|tp|p|ttps|tps|ps):/)) ? aURI.replace(/^[^:]*p/, 'http') : // 2chで見かけるタイプの省略
				(!aURI.match(/^[-+a-z0-9.]+:\/\//i) && aURI.match(/^[-a-z0-9]+(\.[-a-z0-9]+)+/i)) ? 'http://'+aURI :
				(!aURI.match(/^[-+a-z0-9.]+:\/\//i) && !aURI.match(/^[-a-z0-9]+(\.[-a-z0-9]+)+/i)) ? dir+aURI :
				(aURI.charAt(0) == '#') ? path+aURI :
				(aURI.charAt(0) == '?') ? filepath+aURI :
//				(!aURI.match(/^(file|http|https|ftp|chrome|gopher|news|nntp):/)) ? dir+aURI :
				aURI ;
	},
 
	uriSecurityCheck : function(aURI, aSourceURI, aShouldReturnResult) 
	{
		const nsIScriptSecurityManager = Components.interfaces.nsIScriptSecurityManager;
		var secMan = Components.classes['@mozilla.org/scriptsecuritymanager;1'].getService(nsIScriptSecurityManager);
		try {
			secMan.checkLoadURIStr(aSourceURI, aURI, nsIScriptSecurityManager.STANDARD);
		}
		catch (e) {
			if (aShouldReturnResult) return false;
			throw 'Load of '+aURI+' denied.';
		}
		if (aShouldReturnResult) return true;

		return void(0);
	},
 
	// URIからディレクトリを抜き出す 
	getCurrentDir : function(aURI)
	{
		return (aURI) ? aURI.replace(/[#?].*|[^\/]*$/g, '') : '' ;
	},
	
	// URIから親ディレクトリを抜き出す 
	getParentDir : function(aURI)
	{
		var dir = this.getCurrentDir(aURI || '');
		return (aURI && dir == aURI.match(/^[^:]+:\/\/[^\/]*\//)) ? dir : dir.replace(/[^\/]*\/$/, '') ;
	},
	
	// 親ディレクトリをルートまで辿り、配列として返す 
	getParentDirs : function(aURI)
	{
		var dir = [this.getCurrentDir(aURI || '')];
		for (var i = 1; dir[i-1] != this.getParentDir(dir[i-1]); i++)
			dir[i] = this.getParentDir(dir[i-1]);
		return dir;
	},
    
	// ファイル操作 
	
	// 渡されたパスからnsIFileのオブジェクトを生成する 
	makeFileWithPath : function(aPath)
	{
		var newFile = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
		newFile.initWithPath(aPath);
		return newFile;
	},
 
	// テンポラリファイルを作り、ファイルオブジェクトを返す 
	// contentAreaUtil.js の makeTempFile の改造。
	makeTempFileWithName : function(aName)
	{
		const DIR = Components.classes['@mozilla.org/file/directory_service;1'].getService(Components.interfaces.nsIProperties);
		var tempFile = DIR.get('TmpD', Components.interfaces.nsIFile);
		tempFile.append(aName);
		return tempFile;
	},
	
	makeTempFileWithExtension : function(aExt) 
	{
		if (!aExt)
			aExt = 'tmp'
		else if (aExt.length > 3)
			aExt = aExt.substring(0, 3);

		return this.makeTempFileWithName('~sav' + Math.floor(Math.random() * 1000) + '.' + aExt);
	},
  
	// 渡されたURIからテンポラリファイルを生成する 
	makeTempFileForURI : function(aURI)
	{
		var fileName = aURI.replace(/#.*$/, '').replace(/\?.*$/, '').match(/[^\/]+$/);

		var tempFile = this.makeTempFileWithName(fileName);

		// 同名のファイルがある場合
		if (tempFile.exists()) {
			var name = tempFile.leafName;

			var newFile,
				newName = tempFile.leafName,
				i = 0;
			newName = (newName.match(/\./)) ? newName.replace(/\./, '(%s).') : newName+'(%s)' ;
			do {
				i++;
				newFile = this.getFileFromURLSpec(
						this.getURLFromFilePath(tempFile.parent.path).spec+newName.replace(/%s/, i)
					);
			} while (newFile.exists());

			tempFile = newFile;
		}

		return tempFile;
	},
 
	// 外部のJavaScriptを読み込んで実行する 
	include : function(aFilepathOrURI)
	{
		var uri;
		try {
			uri = this.getURLFromFilePath(aFilepathOrURI).spec;
		}
		catch(e) {
			uri = aFilepathOrURI;
		}

		const loader = Components.classes['@mozilla.org/moz/jssubscript-loader;1'].getService(Components.interfaces.mozIJSSubScriptLoader);
		loader.loadSubScript(uri);
	},
 
	// ファイル選択ダイアログを開き、選択したファイルを返す 
	chooseFile : function(aTitle, aDefaultString, aFilters, aSaveMode)
	{
		const nsIFilePicker = Components.interfaces.nsIFilePicker;
		const FP = Components.classes['@mozilla.org/filepicker;1'].createInstance(nsIFilePicker);

		if (!aTitle) {
			const STRBUNDLE = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService);
			var strbundle = STRBUNDLE.createBundle('chrome://ctxextensions/locale/ctxextensions.properties');
			aTitle = strbundle.GetStringFromName('filePicker_title_default');
		}

		FP.init(window, aTitle, (aSaveMode ? nsIFilePicker.modeSave : nsIFilePicker.modeOpen ));

		if (aDefaultString)
			FP.defaultString = aDefaultString;
		if (aFilters) {
			for (var i = 0; i < aFilters.length; i += 2)
				FP.appendFilter(aFilters[i], aFilters[i+1]);
		}

		FP.appendFilters(nsIFilePicker.filterAll);

		var flag = FP.show();
		if (flag & nsIFilePicker.returnCancel) return null;

		try {
			return FP.file.QueryInterface(Components.interfaces.nsILocalFile);
		}
		catch(e) {
			return null;
		}
	},
  
	// File I/O 
	
	createPersist : function() 
	{
		return Components.classes['@mozilla.org/embedding/browser/nsWebBrowserPersist;1'].createInstance(Components.interfaces.nsIWebBrowserPersist)
	},
 
	parseSavingFlags : function(aFlags, aFile) 
	{
		if (!aFile) return false;
		if (!aFlags) aFlags = '';


		// if the file exists...
		if (aFile.exists())
			if  (
				aFlags.match(/Overwrite=(no|false|0)/i) ||
				(
					!aFlags.match(/Overwrite=(yes|true|1)/i) &&
					!this.PromptService.confirm(
						window,
						this.getMsg('global_overwrite_title'),
						this.getMsg('global_overwrite_confirm').replace(/%s/g, aFile.path)
					)
				)
				)
				return false;
			else
				aFile.remove(true);


		// create directories
		var current = aFile;
		var dirs    = [];
		while (current.parent && !current.parent.exists())
		{
			dirs.push(current.parent);
			current = current.parent;
		}

		if (
			dirs.length &&
			(
				aFlags.match(/CreateDirectory=(no|false|0)/i) ||
				(
					!aFlags.match(/CreateDirectory=(yes|true|1)/i) &&
					this.PromptService.confirmEx(
						window,
						this.getMsg('global_createdirectory_title'),
						this.getMsg('global_createdirectory_confirm').replace(/%s/g, aFile.parent.path),
						(
							(ExtCommonUtils.PromptService.BUTTON_TITLE_YES * ExtCommonUtils.PromptService.BUTTON_POS_0) +
							(ExtCommonUtils.PromptService.BUTTON_TITLE_NO * ExtCommonUtils.PromptService.BUTTON_POS_1)
						),
						null, null, null,
						null,
					{}
					) != 0
				)
			)
			)
			return false;

		for (var i = dirs.length-1; i > -1; i--)
			dirs[i].create(dirs[i].DIRECTORY_TYPE, 0644);


		return true;
	},
 
	// URIで示されたリソースをファイルに保存する 
	saveURIAs : function(aURI, aFile, aFlags)
	{
		try {
			aFile = (aFile && 'QueryInterface' in aFile) ? aFile.QueryInterface(Components.interfaces.nsIFile) : this.makeFileWithPath(aFile) ;
		}
		catch(e) {
			aFile = aFile ? this.makeFileWithPath(aFile) : null ;
		}

		if (!this.parseSavingFlags(aFlags, aFile)) return null;

		try {
			aURI = (aURI && 'QueryInterface' in aURI) ? aURI.QueryInterface(Components.interfaces.nsIURI) : this.makeURIFromSpec(aURI) ;
		}
		catch(e) {
			aURI = this.makeURIFromSpec(aURI);
		}


		var data = {
			url             : aURI.spec,
			fileObject      : aFile,
			fileName        : (aFile ? aFile.leafName : null ),
			filePickerTitle : null,
			document        : null,
			bypassCache     : true,
			window          : window,
			persist         : ExtCommonUtils.createPersist()
		};
		var sniffer = new nsHeaderSniffer(aURI.spec, this.foundHeaderInfo, data);

		return data.persist;
	},
	
	foundHeaderInfo : function(aSniffer, aData) 
	{
		if (!aData.fileObject) {
			window.foundHeaderInfo(aSniffer, aData);
			return;
		}

		var shouldDecode = false;
		try {
			const helperAppService = Components.classes['@mozilla.org/uriloader/external-helper-app-service;1'].getService(Components.interfaces.nsIExternalHelperAppService);
			var url = aSniffer.uri.QueryInterface(Components.interfaces.nsIURL);
			var urlExt = url.fileExtension;
			if (helperAppService.applyDecodingForType(aSniffer.contentType) &&
				(!urlExt || helperAppService.applyDecodingForExtension(urlExt))) {
				shouldDecode = true;
			}
		}
		catch (e) {
		}


		var PERSIST = aData.persist;

		const nsIWebBrowserPersist = Components.interfaces.nsIWebBrowserPersist;
		const flags = nsIWebBrowserPersist.PERSIST_FLAGS_NO_CONVERSION | nsIWebBrowserPersist.PERSIST_FLAGS_REPLACE_EXISTING_FILES;
		if (aData.bypassCache)
			PERSIST.persistFlags = flags | nsIWebBrowserPersist.PERSIST_FLAGS_BYPASS_CACHE;
		else
			PERSIST.persistFlags = flags | nsIWebBrowserPersist.PERSIST_FLAGS_FROM_CACHE;

		if (shouldDecode)
			PERSIST.persistFlags &= ~nsIWebBrowserPersist.PERSIST_FLAGS_NO_CONVERSION;


		var dl = Components.classes['@mozilla.org/download;1'].createInstance(Components.interfaces.nsIDownload);
		dl.init(aSniffer.uri, aData.fileObject, null, null, null, PERSIST);

		if (PERSIST.saveURI.arity == 3) // old implementation
			PERSIST.saveURI(aSniffer.uri, null, aData.fileObject);
		else
			PERSIST.saveURI(aSniffer.uri, null, null, null, null, aData.fileObject);
	},
  
	// URIで示されたリソースをバックグラウンドでファイルに保存する 
	saveURIInBackgroundAs : function(aURI, aFile, aFlags)
	{
		try {
			aFile = (aFile && 'QueryInterface' in aFile) ? aFile.QueryInterface(Components.interfaces.nsIFile) : this.makeFileWithPath(aFile) ;
		}
		catch(e) {
			aFile = this.makeFileWithPath(aFile);
		}

		if (!this.parseSavingFlags(aFlags, aFile)) return null;

		try {
			aURI = (aURI && 'QueryInterface' in aURI) ? aURI.QueryInterface(Components.interfaces.nsIURI) : this.makeURIFromSpec(aURI) ;
		}
		catch(e) {
			aURI = this.makeURIFromSpec(aURI);
		}

		var postData = null;
/*
		if ('getWebNavigation' in window) {
			try {
				var SH = getWebNavigation().sessionHistory;
				var entry = SH.getEntryAtIndex(SH.index, false).QueryInterface(Components.interfaces.nsISHEntry);
				postData = entry.postData;
			}
			catch (e) {
			}
		}
*/

		var PERSIST = this.createPersist();
		if (PERSIST.saveURI.arity == 3) // old implementation
			PERSIST.saveURI(aURI, postData, aFile);
		else
			PERSIST.saveURI(aURI, null, null, postData, null, aFile);

		return PERSIST;
	},
 
	// 渡されたドキュメントをバックグラウンドでファイルに保存する 
	saveDocumentInBackgroundAs : function(aDocument, aFile, aFlags)
	{
		if (!aDocument) return null;

		try {
			aFile = (aFile && 'QueryInterface' in aFile) ? aFile.QueryInterface(Components.interfaces.nsIFile) : this.makeFileWithPath(aFile) ;
		}
		catch(e) {
			aFile = this.makeFileWithPath(aFile);
		}

		if (!this.parseSavingFlags(aFlags, aFile)) return null;


		var mimeType  = document.contentType;
		var parentDir = aFile.parent || null ;

		var PERSIST;
		const nsIWebPersist = Components.interfaces.nsIWebBrowserPersist;
		var outputFlag = nsIWebPersist.ENCODE_FLAGS_ENCODE_ENTITIES | nsIWebPersist.ENCODE_FLAGS_FORMATTED;

		PERSIST = this.createPersist();
		PERSIST.saveDocument(aDocument, aFile, parentDir, mimeType, outputFlag, 0);

		return PERSIST;
	},
 
	// ファイルの中身をテキストとして読み込む 
	readFrom : function(aTarget)
	{
		if (typeof aTarget == 'string') {
			if (aTarget.match(/^\w+:\/\//))
				aTarget = this.makeURIFromSpec(aTarget);
			else
				aTarget = this.makeFileWithPath(aTarget);
		}

		var stream;
		try {
			aTarget = aTarget.QueryInterface(Components.interfaces.nsIURI);
			var channel = this.IOService.newChannelFromURI(aTarget);
			stream = channel.open();
		}
		catch(e) {
			aTarget = aTarget.QueryInterface(Components.interfaces.nsILocalFile)
			stream = Components.classes['@mozilla.org/network/file-input-stream;1'].createInstance(Components.interfaces.nsIFileInputStream);
			try {
				stream.init(aTarget, 1, 0, false); // open as "read only"
			}
			catch(ex) {
				return null;
			}
		}

		try {
			var scriptableStream = Components.classes['@mozilla.org/scriptableinputstream;1'].createInstance(Components.interfaces.nsIScriptableInputStream);
			scriptableStream.init(stream);

			var fileContents = scriptableStream.read(scriptableStream.available());

			scriptableStream.close();
			stream.close();

			return fileContents;
		}
		catch(e) {
		}

		return null;
	},
	
	// CSSファイルを読み込む 
	readCSSFrom : function(aFile)
	{
		var rules = this.readFrom(aFile);
		var atCharsetArray = rules.match(/@charset[^'"]+(['"])([^'"]+)\1/);
		this.UCONV.charset = (atCharsetArray && atCharsetArray[0].length > 1) ? atCharsetArray[2] : 'UTF-8' ;
		return this.UCONV.ConvertToUnicode(rules);
	},
  
	// 渡されたテキストをファイルに保存する 
	writeTo : function(aContent, aTarget, aFlags)
	{
		if (typeof aTarget == 'string') {
			if (aTarget.match(/^\w+:\/\//))
				aTarget = this.makeURIFromSpec(aTarget);
			else
				aTarget = this.makeFileWithPath(aTarget);
		}

		try {
			aTarget = aTarget.QueryInterface(Components.interfaces.nsILocalFile)
		}
		catch(e) {
			aTarget = aTarget.QueryInterface(Components.interfaces.nsIURI);
			aTarget = this.getFileFromURLSpec(aTarget.spec);
		}

		if (!this.parseSavingFlags(aFlags, aTarget)) return null;

		aTarget.create(aTarget.NORMAL_FILE_TYPE, 0666);

		var stream = Components.classes['@mozilla.org/network/file-output-stream;1'].createInstance(Components.interfaces.nsIFileOutputStream);
		stream.init(aTarget, 2, 0x200, false); // open as "write only"

		stream.write(aContent, aContent.length);

		stream.close();

		return aTarget;
	},
	
	// CSSファイルを保存する 
	writeCSSTo : function(aRules, aFile)
	{
		var atCharsetArray = aRules.match(/@charset[^'"]+(['"])([^'"]+)\1/);
		this.UCONV.charset = (atCharsetArray && atCharsetArray[0].length > 1) ? atCharsetArray[2] : 'UTF-8' ;
		this.writeTo(this.UCONV.ConvertFromUnicode(aRules), aFile);
	},
   
	// DOM操作 
	
	getTopWindowOf : function(aType) 
	{
		return this.WINMAN.getMostRecentWindow(aType);
	},
 
	getWindowsOf : function(aType) 
	{
		var windows = [];

		var targets = this.WINMAN.getZOrderDOMWindowEnumerator(aType, true),
			target;
		while (targets.hasMoreElements())
		{
			target = targets.getNext().QueryInterface(Components.interfaces.nsIDOMWindowInternal);
			windows.push(target);
		}

		return windows;
	},
 
	getWindowFromDocument : function(aDocument) 
	{
		if (aDocument.defaultView)
			return aDocument.defaultView;

		var docShell = this.getDocShellFromDocument(aDocument);
		return !docShell ? null :
				docShell
					.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
					.getInterface(Components.interfaces.nsIDOMWindow);
	},
 
	getDocShellFromDocument : function(aDocument, aRootDocShell) 
	{
		const kDSTreeNode = Components.interfaces.nsIDocShellTreeNode;
		const kDSTreeItem = Components.interfaces.nsIDocShellTreeItem;
		const kWebNav     = Components.interfaces.nsIWebNavigation;

		if (aDocument.defaultView)
			return aDocument.defaultView.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
					.getInterface(kWebNav)
					.QueryInterface(Components.interfaces.nsIDocShell);

		if (!aRootDocShell)
			aRootDocShell = gBrowser.docShell;

		var aRootDocShell = aRootDocShell
				.QueryInterface(kDSTreeNode)
				.QueryInterface(kDSTreeItem)
				.QueryInterface(kWebNav);
		var docShell = aRootDocShell;
		traceDocShellTree:
		do {
			if (docShell.document == aDocument) {
				return docShell;
				break;
			}

			if (docShell.childCount) {
				docShell = docShell.getChildAt(0);
				docShell = docShell
					.QueryInterface(kDSTreeNode)
					.QueryInterface(kWebNav);
			}
			else {
				parentDocShell = docShell.parent.QueryInterface(kDSTreeNode);
				while (docShell.childOffset == parentDocShell.childCount-1)
				{
					docShell = parentDocShell;
					if (docShell == aRootDocShell || !docShell.parent)
						break traceDocShellTree;
					parentDocShell = docShell.parent.QueryInterface(kDSTreeNode);
				}
				docShell = parentDocShell.getChildAt(docShell.childOffset+1)
					.QueryInterface(kDSTreeNode)
					.QueryInterface(kWebNav);
			}
		} while (docShell != aRootDocShell);

		return null;
	},
 
	// 要素のソースを得る 
	getSourceOf : function(aNode, aType)
	{
		var topTag;
		if (aType == 'mathml')
			topTag = 'math';
		else
			throw 'not reached';

		while (aNode && aNode.localName != topTag)
			aNode = aNode.parentNode;

		if (!aNode) return '';


		var mLineCount       = 0,
			mStartTargetLine = 0,
			mEndTargetLine   = 0;

		function getOuterMarkup(aNode, aIndent)
		{
			var newline = '',
				padding = [],
				ret     = [];

			switch (aNode.nodeType)
			{
				case Node.ELEMENT_NODE:
					if (mLineCount > 0 &&
						mLineCount != mStartTargetLine &&
						mLineCount != mEndTargetLine) {
						newline = '\n';
					}
					mLineCount++;
					for (i = 0; i < aIndent; i++) {
						padding.push(' ');
					}
					ret.push(newline);
					ret.push(padding.join(''));
					ret.push('<'+aNode.nodeName);

					var attr;
					for (i = 0; i < aNode.attributes.length; i++)
					{
						attr = node.attributes.item(i);
						if (attr.nodeName.match(/^[-_]moz/)) continue;
						ret.push(' '+attr.nodeName+'='+unicodeTOentity(attr.nodeValue)+'"');
					}
					if (!aNode.hasChildNodes()) {
						ret.push('/>');
					}
					else {
						ret.push('>');
						var oldLine = mLineCount;
						ret.push(getInnerMarkup(aNode, aIndent + 2));
						if (oldLine == mLineCount) {
							newline = '';
							padding = '';
						}
						else {
							newline = (mLineCount == mEndTargetLine) ? '' : '\n' ;
							mLineCount++;
						}
						ret.push(newline);
						ret.push(padding.join(''));
						ret.push('</'+aNode.nodeName+'>');
					}
					break;

				case Node.TEXT_NODE:
					var tmp = aNode.nodeValue
								.replace(/(\n|\r|\t)+/g, ' ')
								.replace(/^ +/, '')
								.replace(/ +$/, '');
					if (tmp.length)
						ret.push(unicodeTOentity(tmp));
					break;

				default:
					break;
			}

			return ret.join('');
		}

		function getInnerMarkup(aNode, aIndent)
		{
			var ret = [];
			for (var i = 0; i < aNode.childNodes.length; i++)
				ret.push(getOuterMarkup(aNode.childNodes.item(i), aIndent));
			return ret.join('');
		}

		var mEntityConverter;
		try {
			mEntityConverter = Components.classes['@mozilla.org/intl/entityconverter;1'].createInstance(Components.interfaces.nsIEntityConverter);
		}
		catch(e) {
		}

		function unicodeTOentity(aText)
		{
			const charTable = {
					'&' : '&amp;',
					'<' : '&lt;',
					'>' : '&gt;',
					'"' : '&quot;'
				};

			function charTableLookup(aLetter) {
				return charTable[aLetter];
			}

			function convertEntity(aLetter) {
				try {
					var unichar = mEntityConverter.ConvertToEntity(aLetter, entityVersion);
					var entity = unichar.substring(1);
					return '&'+entity+';';
				}
				catch (e) {
					return aLetter;
				}
			}

			const entityVersion = Components.interfaces.nsIEntityConverter.entityW3C;

			return aText.replace(/[<>&"]/g, charTableLookup)
					.replace(/[^\0-\u007f]/g, convertEntity);
		}

		return getOuterMarkup(aNode, 0);
	},
 
	// 配列状の要素を連結する 
	concatArray : function()
	{
		var ret = [],
			i, j;
		for (i = 0; i < arguments.length; i++)
			for (j = 0; j < arguments[i].length; j++)
				ret.push(arguments[i][j]);

		return ret;
	},
 
	// 選択範囲に含まれる全てのノードを一次配列として返す 
	getSelectionNodes : function(aWindow)
	{
		var nodes = [];

		var targetWindow = aWindow || document.commandDispatcher.focusedWindow;
		if (!targetWindow || Components.lookupMethod(targetWindow, 'top').call(targetWindow) == window)
			targetWindow = gBrowser.contentWindow;

		var selection = Components.lookupMethod(targetWindow, 'getSelection').call(targetWindow);
		if (!selection || !selection.toString()) return nodes;


		var range = targetWindow.document.createRange();
		if (selection.anchorNode == selection.focusNode ||
			selection.anchorNode.compareDocumentPosition(selection.focusNode) & Node.DOCUMENT_POSITION_FOLLOWING) {
			range.setStart(selection.anchorNode, selection.anchorOffset);
			range.setEnd(selection.focusNode, selection.focusOffset);
		}
		else {
			range.setStart(selection.focusNode, selection.focusOffset);
			range.setEnd(selection.anchorNode, selection.anchorOffset);
		}


		var node = range.startContainer,
			newNode;

		traceTree:
		do
		{
			if (node.hasChildNodes())
				node = node.firstChild;
			else {
				while (!node.nextSibling)
				{
					node = node.parentNode;
					if (!node) break traceTree;
				}
				node = node.nextSibling;
			}
			if (node == range.endContainer) break traceTree;

			nodes.push(node);
		}
		while (node != range.endContainer);

		range.detach();

		return nodes;
	},
 
	// findParentNodeで、指定の属性を持つもののみを返す 
	findParentNodeWithAttr : function(aNode, aLocalName, aAttr)
	{
		var node = aNode;
		while (node)
		{
			node = this.findParentNodeWithLocalName(node, aLocalName);
			if (!node || node.getAttribute(aAttr)) break;
			node = node.parentNode;
		}
		return (node && node.getAttribute(aAttr)) ? node : null ;
	},
	findParentNodeWithLocalName : function(aNode, aLocalName)
	{
		var name = String(aLocalName).toLowerCase();
		var node = aNode;
		while (node &&
			String(Components.lookupMethod(node, 'localName').call(node)).toLowerCase() != name)
			node = Components.lookupMethod(node, 'parentNode').call(node);

		return node;
	},
 
	// ポップアップメニューのセパレータの表示 
	showHideMenuSeparators : function(aPopup)
	{
		var nodes = this.getNodesFromXPath('descendant::xul:menuseparator[@hidden]', aPopup);
		for (i = 0; i < nodes.snapshotLength; i++)
			nodes.snapshotItem(i).removeAttribute('hidden');

		// hide needless separators
		nodes = this.getNodesFromXPath('descendant::xul:menuseparator[not(following-sibling::*[not(local-name() = "menuseparator") and not(@hidden or @collapsed)]) or not(preceding-sibling::*[not(local-name() = "menuseparator") and not(@hidden or @collapsed)]) or local-name(following-sibling::*[not(@hidden or @collapsed)]) = "menuseparator"]', aPopup);
		for (i = 0; i < nodes.snapshotLength; i++)
			nodes.snapshotItem(i).setAttribute('hidden', true);
	},
 
	// コマンドの実行 
	doCommand : function(aNode, aCommand)
	{
		try {
			aNode.controllers.getControllerForCommand(aCommand).doCommand(aCommand);
		}
		catch(e) {
		}
	},
 
	// テキストフィールドに文字列を挿入する 
	insertTextFor : function(aString, aNode)
	{
		// replace selection to inserted text
		var cmd = 'cmd_cut';
		var c = aNode.controllers.getControllerForCommand(cmd);
		if (c.isCommandEnabled(cmd)) {
			this.doCommand(aNode, 'cmd_delete');
		}

//		var pos = this.getPositionInTextField(aNode);
//		var value = aNode.value;
//		aNode.value = [value.substring(0, pos), aString, value.substring(pos, value.length)].join('');

//		this.doCommand(aNode, 'cmd_moveTop');
//		for (var i = 0; i < pos; i++)
//			this.doCommand(aNode, 'cmd_charNext');

		this.setStringToClipBoard(aString);
		this.doCommand(aNode, 'cmd_paste');
	},
	
	// テキストフィールドの中での本当の現在位置を得る（範囲選択は解除される） 
	getPositionInTextField : function(aNode)
	{
		var start = aNode.selectionStart;

		// cancel selection
		this.doCommand(aNode, 'cmd_charPrevious');
		if (aNode.selectionStart != start)
			this.doCommand(aNode, 'cmd_charNext');

		var count = -1;
		for (start = -1; aNode.selectionStart != start; count++) {
			start = aNode.selectionStart;
			this.doCommand(aNode, 'cmd_charPrevious');
		}
		for (var i = 0; i < count; i++)
			this.doCommand(aNode, 'cmd_charNext');

		return count;
	},
  
	// nsIXULTemplateBuilder.rebuild() の代わり 
	rebuildFromTemplate : function(aContainer)
	{
		var i, j;
		const XULNS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';

		var template = aContainer.hasAttribute('template') ? document.getElementById(aContainer.getAttribute('template')) : aContainer.getElementsByTagNameNS(XULNS, 'template')[0] ;
		if (!template.hasAttribute('ext-template')) return;

		if (!('extTemplate' in template))
			eval('template.extTemplate = '+template.getAttribute('ext-template'));

		var obj = eval(aContainer.getAttribute('ext-datasource'));
		obj.reset();

		var children = aContainer.childNodes;
		for (i = children.length-1; i > -1; i--)
			if (
				('extGenerated' in children[i] && children[i].extGenerated) ||
				children[i].getAttribute('extGenerated') == 'true'
				)
				aContainer.removeChild(children[i]);

		var node, data;
//		window.dump(aContainer.id+' :: '+obj.length+'\n');
		for (i = 0; i < obj.length; i++)
		{
			data = template.extTemplate(i, obj);
			if (!data || !('localName' in data)) continue;

			aContainer.appendChild(document.createElement(data.localName));
			for (j in data.attr)
				aContainer.lastChild.setAttribute(j, data.attr[j]);

			aContainer.lastChild.extGenerated = true;
		}
//dump(aContainer.getAttribute('ext-datasource')+' / '+obj.length+'('+aContainer.childNodes.length+')\n');
	},
 
	getNodesFromXPath : function(aXPath, aContextNode, aType) 
	{
		// http://www.hawk.34sp.com/stdpls/xml/
		// http://www.hawk.34sp.com/stdpls/xml/dom_xpath.html
		// http://www.homoon.jp/users/www/doc/CR-css3-selectors-20011113.shtml
		const xmlDoc  = aContextNode ? aContextNode.ownerDocument : document ;
		const context = aContextNode || xmlDoc.documentElement;
		const type    = aType || XPathResult.ORDERED_NODE_SNAPSHOT_TYPE;
		const resolver = {
			lookupNamespaceURI : function(aPrefix)
			{
				switch (aPrefix)
				{
					case 'xul':
					default:
						return XULNS;
	//					return '';
				}
			}
		};


		var resultObj = (aType == XPathResult.FIRST_ORDERED_NODE_TYPE) ? null :
				(type == XPathResult.ORDERED_NODE_ITERATOR_TYPE ||
					type == XPathResult.UNORDERED_NODE_ITERATOR_TYPE) ?
				{
					count       : 0,
					iterateNext : function()
					{
						try {
							return this.XPathResult.iterateNext();
						}
						catch(e) {
							return null;
						}
					}
				} :
				{
					get length() {
						return this.snapshotLength;
					},
					get snapshotLength() {
						return this.XPathResult.snapshotLength;
					},

					item : function(aIndex)
					{
						return this.snapshotItem(aIndex);
					},
					snapshotItem : function(aIndex)
					{
						return this.XPathResult.snapshotItem(aIndex);
					}
				};

		try {
			var expression = xmlDoc.createExpression(aXPath, resolver);
			var result     = expression.evaluate(context, type, null);

			if (aType == XPathResult.FIRST_ORDERED_NODE_TYPE)
				return result.singleNodeValue;
		}
		catch(e) {
			dump('=============getNodesFromXPath===========\n');
			dump('============____ERROR____============\n');
			dump('XPath   : '+aXPath+'\n');
			if (aContextNode)
				dump('Context : '+aContextNode+'('+aContextNode.localName+')\n');
			dump(e+'\n');
			dump('============~~~~ERROR~~~~============\n');

			if (aType == XPathResult.FIRST_ORDERED_NODE_TYPE)
				return null;

			resultObj.XPathResult = {
				snapshotLength : 0,
				snapshotItem : function()
				{
					return null;
				},
				iterateNext : function()
				{
					return null;
				}
			};
			return resultObj;
		}

		resultObj.XPathResult = result;
		return resultObj;
	},
  
	readCSSFor : function(aTextboxOrID) 
	{
		var file = this.chooseFile(
				this.getMsg('filePicker_title_stylesheets'),
				null,
				[
					this.getMsg('filePicker_filter_stylesheets'),
					'*.css'
				]
			);
		if (!file) return;

		var rules = this.readCSSFrom(file);

		var textbox = (typeof aTextboxOrID == 'string') ? document.getElementById(aTextboxOrID) : aTextboxOrID ;
		textbox.value = rules;
	},
 
	goStyleSheetsManager : function(aSelectedTabIndex) 
	{
		var target = this.getTopWindowOf('ctxextensions:StyleSheetsManager');
		if (target) {
			target.focus();
			if (aSelectedTabIndex !== void(0))
				target.StyleSheetsManagerService.selectTab(aSelectedTabIndex);
		}
		else
			window.openDialog('chrome://ctxextensions/content/styleSheetsManager/styleSheetsManager.xul', '_blank', 'chrome,all,dialog=no', aSelectedTabIndex);
		return;
	},
 
	// prefs.jsの読み書き 
	
	addPrefListener : function(aObserver) 
	{
		try {
			var pbi = Components.classes['@mozilla.org/preferences;1'].getService(Components.interfaces.nsIPrefBranchInternal);
			pbi.addObserver(aObserver.domain, aObserver, false);
		}
		catch(e) {
		}
	},
 
	removePrefListener : function(aObserver) 
	{
		try {
			var pbi = Components.classes['@mozilla.org/preferences;1'].getService(Components.interfaces.nsIPrefBranchInternal);
			pbi.removeObserver(aObserver.domain, aObserver);
		}
		catch(e) {
		}
	},
 
	getPref : function(aPrefstring, aMultiLine) 
	{
		try {
			var type = this.PREF.getPrefType(aPrefstring);
			switch (type)
			{
				case this.PREF.PREF_STRING:
					var nsISupportsString = ('nsISupportsWString' in Components.interfaces) ? Components.interfaces.nsISupportsWString : Components.interfaces.nsISupportsString;
					var string = this.PREF.getComplexValue(aPrefstring, nsISupportsString).data;
					return (aMultiLine) ? this.unescape(string) : string ;
					break;
				case this.PREF.PREF_INT:
					return this.PREF.getIntPref(aPrefstring);
					break;
				default:
					return this.PREF.getBoolPref(aPrefstring);
					break;
			}
		}
		catch(e) {
//			if (this.debug) alert(e+'\n\nCannot load "'+aPrefstring+'" as "'+type+'"');
		}

		return this.getDefPref(aPrefstring, aMultiLine);
	},
	
	getDefPref : function(aPrefstring, aMultiLine) 
	{
		try {
			var type = this.DEFPREF.getPrefType(aPrefstring);
			switch (type)
			{
				case this.PREF.PREF_STRING:
					var nsISupportsString = ('nsISupportsWString' in Components.interfaces) ? Components.interfaces.nsISupportsWString : Components.interfaces.nsISupportsString;
					var string = this.DEFPREF.getComplexValue(aPrefstring, nsISupportsString).data;
					return (aMultiLine) ? this.unescape(string) : string ;
					break;
				case this.PREF.PREF_INT:
					return this.DEFPREF.getIntPref(aPrefstring);
					break;
				default:
					return this.DEFPREF.getBoolPref(aPrefstring);
					break;
			}
		}
		catch(e) {
//			if (this.debug) alert(e+'\n\nCannot load default pref "'+aPrefstring+'" as "'+type+'"');
		}
		return null;
	},
  
	setPref : function(aPrefstring, aNewValue, aMultiLine, aPrefObj) 
	{
		var type;
		try {
			type = typeof aNewValue;
		}
		catch(e) {
			type = null;
	//		if (this.debug) alert(e+'\n\n'+aPrefstring);
		}

		var pref = aPrefObj || this.PREF ;

		switch (type)
		{
			case 'string':
				var nsISupportsString = ('nsISupportsWString' in Components.interfaces) ? Components.interfaces.nsISupportsWString : Components.interfaces.nsISupportsString;
				var string = ('@mozilla.org/supports-wstring;1' in Components.classes) ?
						Components.classes['@mozilla.org/supports-wstring;1'].createInstance(nsISupportsString) :
						Components.classes['@mozilla.org/supports-string;1'].createInstance(nsISupportsString);
				string.data = (aMultiLine) ? this.escape(aNewValue) : aNewValue ;
				pref.setComplexValue(aPrefstring, nsISupportsString, string);
				break;
			case 'number':
				pref.setIntPref(aPrefstring, parseInt(aNewValue));
				break;
			default:
				pref.setBoolPref(aPrefstring, aNewValue);
				break;
		}
		return true;
	},
 
	clearPref : function(aPrefstring) 
	{
		try {
			this.PREF.clearUserPref(aPrefstring);
		}
		catch(e) {
		}

		return;
	},
  
	init : function() 
	{
		if (this.activated) return;
		this.activated = true;

		var i;
		var nullPointer;

		// デフォルト設定を読み込む
		this.loadPrefs();

		try {
			nullPointer = this.SELECTEDSTYLES;
			nullPointer = this.USERSTYLES;
			nullPointer = this.STYLESHEETS;
			nullPointer = this.SENDSTR;
			nullPointer = this.SENDURI;
			nullPointer = this.EXECAPPS;
			nullPointer = this.CUSTOMSCRIPTS;
		}
		catch(e) {
		}


		// RDFデータソースの指定を初期化
		var nsIXULTemplateBuilderAvailable = this.getPref('ctxextensions.enable.nsIXULTemplateBuilder');

		var dsource_uri = this.datasourceURI;
		var nodes   = document.getElementsByAttribute('datasources', 'chrome://ctxextensions/content/ctxextensions.rdf'),
			dsource = this.RDF.GetDataSource(dsource_uri),
			lclst;
		try {
			lclst   = this.RDF.GetDataSource('rdf:localstore');
		}
		catch(e) {
		}
		for (i = 0; i < nodes.length; i++)
		{
			nodes[i].database.AddDataSource(dsource);
			if (lclst)
				nodes[i].database.RemoveDataSource(lclst);
			if (nsIXULTemplateBuilderAvailable) {
				nodes[i].builder.rebuild();
			}
			else {
				this.rebuildFromTemplate(nodes[i]);
			}
		}
	},
	loadPrefs : function()
	{
		if (this.getPref('ctxextensions.default.type') === null)
			window.openDialog('chrome://ctxextensions/content/initializeDefaultPref.xul', '_blank', 'chrome,modal,resizable=no,titlebar=no,centerscreen');


		var defPref;
		var i;

		const dir = 'chrome://ctxextensions/content/default/';
		switch (this.getPref('ctxextensions.default.type'))
		{
			default:
			case 0:
				defPref = this.readFrom(dir+'default.js');
				break;

			case 1:
				defPref = this.readFrom(dir+'default.light.js');
				break;
		}

		var prefs = [];
		var pref = function(aPrefstring, aValue) {
			prefs[prefs.length] = { name : aPrefstring, value : aValue };
		}
		eval(defPref);


		const DEFPrefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getDefaultBranch(null);
		var done = {},
			nullPointer;
		for (i = prefs.length-1; i > -1; i--)
		{
			if (prefs[i].name in done) continue;

			this.setPref(prefs[i].name, prefs[i].value, false, DEFPrefs);

			nullPointer = this.getPref(prefs[i]);
			done[prefs[i].name] = true;
		}
	}
 
}; 
 
// 初期化 
// initialize
window.addEventListener('load', function()
{
	if (ExtCommonUtils.activated) return;

	ExtCommonUtils.init();
},
false);
window.addEventListener('load', function()
{
	if (ExtCommonUtils.activated) return;

	ExtCommonUtils.init();
},
false);
 
