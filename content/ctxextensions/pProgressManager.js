/*

This class repeats the observer's method with an interval,
and feedback the progress status to the statusbar or the progressbar.

Esample:

//var manager = new pProgressManager(observer, 10, document, 'progress',
//					'please wait for a while...");
var manager = new pProgressManager(observer, 10, 'progress',
					'please wait for a while...");

manager.appendItem(elem[0], title[0]);
manager.appendItem(elem[1], title[1]);
manager.appendItem(elem[2], title[2]);
.
.
.
manager.appendItem(elem[100], title[100]);

manager.start();


Arguments:

aObserver (required) :
	a observer which has methods "onProgress" and "onProgressEnd"
	you would like to do on progress.
	theese methods handed the manager as the first argument, and
	handed other arguments registered by "appendItem" as second, third,
	and following.
aInterval (optional) :
	a interval (msec) you would like to progress.
//aID (optional) :
//	a identifier of manager. you can hand any object as an ID.
aFlags (optional) :
	e.g. "progress,status" .
	if you hand "status", status of progressing will be feedbacked to
	statusbar like "n/max".
	if you hand 'progress', status of progressing will be feedbacked to progressbar. 'progress=undetermined' fixes the progressbar to
	undetermined.
aDefaultStatus (oprional) :
	a message displayed while progressing.
aProgressbarID (optional) :
	a ID of progressbar element. default is the Navigator's progressbar.


Methods:

appendItem(aArg1, aArg2, ...aArg10) :
	this method registers a set of arguments handed to observer's
	"onProgress". they are handed as second, third, ... eleventh argument.
start() :
	start to progress.
stop() :
	stop to progress.

*/

/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is the pProgressManager.
 *
 * The Initial Developer of the Original Code is SHIMODA Hiroshi.
 * Portions created by the Initial Developer are Copyright (C) 2001-2005
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s): SHIMODA Hiroshi <piro@p.club.ne.jp>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */


function pProgressManager(aObserver, aInterval, /*aID, */aFlags, aDefaultStatus, aProgressbarID)
{
	this.init(aObserver, aInterval, /*aID, */aFlags, aDefaultStatus, aProgressbarID);
}

pProgressManager.prototype =
{
	mInitialized : false,

	init : function(aObserver, aInterval, /*aID, */aFlags, aDefaultStatus, aProgressbarID)
	{
		this.mID = 'pProgressManager/'+Math.floor(Math.random() * 10000);
//		this.mID            = aID;

		this.mObserver      = aObserver;
		this.mInterval      = (aInterval === void(0)) ? 1 : aInterval ; // 0にするとMoz1.0.xでは1度しか実行されないという問題が……
		this.mDefaultStatus = aDefaultStatus || '' ;

		this.mProgressbar = document.getElementById(aProgressbarID || 'statusbar-icon');

		this.mChangeStatus   = aFlags ? aFlags.match(/status/i) ? true : false : false ;
		this.mChangeProgress = (this.mProgressbar && aFlags) ? aFlags.match(/progress/i) : false ;
		this.mChangeProgressUndetermined = aFlags ? aFlags.match(/progress=undetermined/i) ? true : false : false ;

		this.mInitialized = true;
	},

	mTimer         : null,
	mObserver      : null,
	mInterval      : 1,
	mChangeStatus   : false,
	mChangeProgress : false,
	mDefaultStatus  : '',
	mProgressbar   : null,
	mID            : null,

	mCallBackArgs : [],

	get max()
	{
		return (!this._max || this._max < 0) ? 1 : this._max ;
	},
	set max(aMax)
	{
		this._max = aMax;
		return aMax;
	},
	_max : 0,

	start : function()
	{
		if (!this.mInitialized) return;

		this.max = this.mCallBackArgs.length;

		if (this.mDefaultStatus)
			window.defaultStatus = this.mDefaultStatus;

		if (this.mChangeProgress) {
			this.mProgressbar.setAttribute('mode', 'undetermined');
			this.mProgressbar.setAttribute('value', '0');
		}

		this.mTimer = window.setInterval(this.mOnProgress, this.mInterval, this);
	},

	stop : function()
	{
		window.clearInterval(this.mTimer);

		if (this.mChangeStatus || this.mDefaultStatus)
			window.defaultStatus = '';

		if (this.mChangeProgress) {
			this.mProgressbar.setAttribute('mode', 'normal');
			this.mProgressbar.setAttribute('value', '0');
		}
	},

	appendItem : function()
	{
		var args = [];
		for (var i = 0; i < arguments.length; i++)
			args.push(arguments[i]);

		this.mCallBackArgs.push([this, args]);
	},

	mOnProgress : function(aManager)
	{
		var item = aManager.mCallBackArgs.length ? aManager.mCallBackArgs[0] : null ;

		var args = item ? item[1] : null ;
		var mObserver = aManager.mObserver;
		try {
			if (aManager.mCallBackArgs.length)
				var retVal = mObserver.onProgress(
						aManager,
						(args.length) ? args[0] : null ,
						(args.length > 1) ? args[1] : null ,
						(args.length > 2) ? args[2] : null ,
						(args.length > 3) ? args[3] : null ,
						(args.length > 4) ? args[4] : null ,
						(args.length > 5) ? args[5] : null ,
						(args.length > 6) ? args[6] : null ,
						(args.length > 7) ? args[7] : null ,
						(args.length > 8) ? args[8] : null ,
						(args.length > 9) ? args[9] : null 
					);
			else {
				mObserver.onProgressEnd(aManager);
				return aManager.stop();
			}
		}
		catch(e) { // エラー時は強制終了
			if ('ExtService' in window && ExtService.debug) alert('OnProgress:\n\n'+e);
			return aManager.stop();
		}

		// callBackFuncがfalseを返した場合、要素の削除は行わずに処理を繰り返す。
		// （逆に言えば、falseを返さなかった場合は要素を削除する）
		if (retVal === void(0) || retVal)
			aManager.mCallBackArgs.splice(0, 1);

		// 処理の進行状況を表示
		var max = aManager.max;
		var cur = max - aManager.mCallBackArgs.length;
		aManager.mProgressCallBack(cur, max);

		return true;
	},

	mProgressCallBack : function(aCurrent, aMax)
	{
		var per = parseInt((aCurrent/aMax)*100)+'%';

		if (this.mChangeStatus)
			window.defaultStatus = per + (this.mDefaultStatus ? ' '+this.mDefaultStatus : '');
		else if (this.mDefaultStatus)
			window.defaultStatus = this.mDefaultStatus;

		if (this.mChangeProgressUndetermined)
			this.mProgressbar.setAttribute('mode', 'undetermined');
		else if (this.mChangeProgress) {
			this.mProgressbar.setAttribute('mode', 'determined');
			this.mProgressbar.setAttribute('value', per);
		}
	}
};




/*
	TreeWalker専用の派生クラス（？）。
*/

function pProgressTreeWalker(aObserver, aInterval, /*aID, */aFlags, aDefaultStatus, aProgressbarID)
{
	if (arguments.length < 7)
		this.init(aObserver, aInterval, /*aID, */aFlags, aDefaultStatus, aProgressbarID);
}

pProgressTreeWalker.prototype =
{
	walker     : null,
	nodeFilter : null,
	lastNode   : null,
	count      : 0,
	mShouldStop : false,
	mUseTreeWalker : false,

	// as a NodeFilter for TreeWalkers
	acceptNode : function(aNode)
	{
		this.lastNode = aNode;
		this.count++;
		if (this.nodeFilter && this.nodeFilter.acceptNode)
			return this.nodeFilter.acceptNode(aNode);
		else
			return NodeFilter.FILTER_ACCEPT;
	},

	initWithTreeWalker : function(aRoot, aWhatToShow, aFilter, aRefEx, aObserver, aInterval, /*aID, */aFlags, aDefaultStatus, aProgressbarID)
	{
		this.mUseTreeWalker = true;

		this.init(aObserver, aInterval, /*aID, */aFlags, aDefaultStatus, aProgressbarID);

		this.start         = this.mStartWithTreeWalker;
		this.mOnProgress   = this.mOnProgressWithTreeWalker;
		this.appendItem    = this.mAppendItemWithTreeWalker;
		this.mCallBackArgs = [this, [null]];

		var d = aRoot.ownerDocument || aRoot ;
		this.nodeFilter = aFilter;
		this.walker     = d.createTreeWalker(aRoot, aWhatToShow, this, aRefEx);
		return this.walker;
	},

	mStartWithTreeWalker : function()
	{
		if (this.mDefaultStatus)
			window.defaultStatus = this.mDefaultStatus;

		if (this.mChangeProgress) {
			this.mProgressbar.setAttribute('mode', 'undetermined');
			this.mProgressbar.setAttribute('value', '0');
		}

		this.mTimer = window.setInterval(this.mOnProgress, this.mInterval, this);
	},

	mAppendItemWithTreeWalker : function()
	{
		var args = [];
		for (var i = 0; i < arguments.length; i++)
			args.push(arguments[i]);

		this.mCallBackArgs = [this, args];
	},

	mOnProgressWithTreeWalker : function(aManager)
	{
		var item = aManager.mCallBackArgs;
		/*
			pProgressManagerから生成したインスタンス同士を複数同時に起動させると、互いに干渉して、違うインスタンスのアイテムを処理してしまう場合がある。
			よって、問題を回避するため、アイテムとセットで自分自身を登録しておき、setIntervalの引数として与えられたマネージャが自分自身であることを確認してから処理を行う。
		*/
		if (item && (
			item[0].mID != aManager.mID ||
			item[0].mObserver != aManager.mObserver
			)) return true;

		var args = item ? item[1] : null ;
		var observer = aManager.mObserver;
		var node = aManager.walker.nextNode();

		try {
			if (!node || aManager.mShouldStop) {
				observer.onProgressEnd(
					aManager,
					(args.length) ? args[0] : null ,
					(args.length > 1) ? args[1] : null ,
					(args.length > 2) ? args[2] : null ,
					(args.length > 3) ? args[3] : null ,
					(args.length > 4) ? args[4] : null ,
					(args.length > 5) ? args[5] : null ,
					(args.length > 6) ? args[6] : null ,
					(args.length > 7) ? args[7] : null ,
					(args.length > 8) ? args[8] : null ,
					(args.length > 9) ? args[9] : null 
				);
				aManager.stop();
				return true;
			}
			else
				var retVal = observer.onProgress(
						aManager,
						node,
						(args.length) ? args[0] : null ,
						(args.length > 1) ? args[1] : null ,
						(args.length > 2) ? args[2] : null ,
						(args.length > 3) ? args[3] : null ,
						(args.length > 4) ? args[4] : null ,
						(args.length > 5) ? args[5] : null ,
						(args.length > 6) ? args[6] : null ,
						(args.length > 7) ? args[7] : null ,
						(args.length > 8) ? args[8] : null ,
						(args.length > 9) ? args[9] : null 
					);
		}
		catch(e) { // エラー時は強制終了
			if ('ExtService' in window && ExtService.debug) alert('OnProgress:\n\n'+e);
			aManager.stop();
			return true;
		}

		// callBackFuncがfalseを返した場合、処理を繰り返す。
		if (retVal !== void(0) && retVal)
			aManager.mShouldStop = true;

		// 処理の進行状況を表示
		var max = aManager.max;
		var cur = aManager.count;
		aManager.mProgressCallBack(cur, max);

		return true;
	}
};

pProgressTreeWalker.prototype.__proto__ = pProgressManager.prototype;



/*
	XPath専用の派生クラス（？）。
*/

function pProgressXPath(aObserver, aInterval, /*aID, */aFlags, aDefaultStatus, aProgressbarID)
{
	if (arguments.length < 7)
		this.init(aObserver, aInterval, /*aID, */aFlags, aDefaultStatus, aProgressbarID);
}

pProgressXPath.prototype =
{
	xpathResult : null,
	lastNode    : null,
	count       : 0,
	mShouldStop : false,

	initWithXPath : function(aRoot, aXPath, aObserver, aInterval, /*aID, */aFlags, aDefaultStatus, aProgressbarID)
	{
		this.init(aObserver, aInterval, /*aID, */aFlags, aDefaultStatus, aProgressbarID);

		this.start         = this.mStartWithXPath;
		this.mOnProgress   = this.mOnProgressWithXPath;
		this.appendItem    = this.mAppendItemXPath;
		this.mCallBackArgs = [this, [null]];

		var d = aRoot.ownerDocument || aRoot ;
		this.xpathResult = ExtCommonUtils.getNodesFromXPath(aXPath, d.documentElement);
		return this.xpathResult;
	},

	mStartWithXPath : function()
	{
		if (this.mDefaultStatus)
			window.defaultStatus = this.mDefaultStatus;

		if (this.mChangeProgress) {
			this.mProgressbar.setAttribute('mode', 'undetermined');
			this.mProgressbar.setAttribute('value', '0');
		}

		this.mTimer = window.setInterval(this.mOnProgress, this.mInterval, this);
	},

	mAppendItemXPath : function()
	{
		var args = [];
		for (var i = 0; i < arguments.length; i++)
			args.push(arguments[i]);

		this.mCallBackArgs = [this, args];
	},

	mOnProgressWithXPath : function(aManager)
	{
		var item = aManager.mCallBackArgs;
		/*
			pProgressManagerから生成したインスタンス同士を複数同時に起動させると、互いに干渉して、違うインスタンスのアイテムを処理してしまう場合がある。
			よって、問題を回避するため、アイテムとセットで自分自身を登録しておき、setIntervalの引数として与えられたマネージャが自分自身であることを確認してから処理を行う。
		*/
		if (item && (
			item[0].mID != aManager.mID ||
			item[0].mObserver != aManager.mObserver
			)) return true;

		var args = item ? item[1] : null ;
		var observer = aManager.mObserver;
		var node = (aManager.count > aManager.xpathResult.snapshotLength) ? null : aManager.xpathResult.snapshotItem(aManager.count);
		if (node) {
			aManager.lastNode = node;
			aManager.count++;
		}

		try {
			if (!node || aManager.mShouldStop) {
				observer.onProgressEnd(
					aManager,
					(args.length) ? args[0] : null ,
					(args.length > 1) ? args[1] : null ,
					(args.length > 2) ? args[2] : null ,
					(args.length > 3) ? args[3] : null ,
					(args.length > 4) ? args[4] : null ,
					(args.length > 5) ? args[5] : null ,
					(args.length > 6) ? args[6] : null ,
					(args.length > 7) ? args[7] : null ,
					(args.length > 8) ? args[8] : null ,
					(args.length > 9) ? args[9] : null 
				);
				aManager.stop();
				return true;
			}
			else
				var retVal = observer.onProgress(
						aManager,
						node,
						(args.length) ? args[0] : null ,
						(args.length > 1) ? args[1] : null ,
						(args.length > 2) ? args[2] : null ,
						(args.length > 3) ? args[3] : null ,
						(args.length > 4) ? args[4] : null ,
						(args.length > 5) ? args[5] : null ,
						(args.length > 6) ? args[6] : null ,
						(args.length > 7) ? args[7] : null ,
						(args.length > 8) ? args[8] : null ,
						(args.length > 9) ? args[9] : null 
					);
		}
		catch(e) { // エラー時は強制終了
			if ('ExtService' in window && ExtService.debug) alert('OnProgress:\n\n'+e);
			aManager.stop();
			return true;
		}

		// callBackFuncがfalseを返した場合、処理を繰り返す。
		if (retVal !== void(0) && retVal)
			aManager.mShouldStop = true;


		// 処理の進行状況を表示
		var max = aManager.max;
		var cur = aManager.count;
		aManager.mProgressCallBack(cur, max);

		return true;
	}
};

pProgressXPath.prototype.__proto__ = pProgressManager.prototype;
