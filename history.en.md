# History

 - 4.3.2010020101
   * Drop support of Firefox 1.5.
   * Improved: New short expressions are introduced:  `$()` ,  `$X()` , and  `_inspectDOMNode()` . They are compatible to [UxU](http://www.clear-code.com/software/uxu/).
   * Fixed: Broken menu on local files disappeared.
   * Fixed: New directories created by this addon have correct permissions on Linux.
   * Fixed: Configuration UI for keyboard shortcuts works correctly on Firefox 3.6.
 - 4.2.2009071601
   * Improved: New short expressions are available;  `_chooseFiles()`  (provides common dialog to choose multiple files),  `_chooseFolder()`  (provides common dialog to choose a folder), and  `_zipFilesAs()`  (create ZIP archive from files).
 - 4.2.2009071401
   * Modified: "Open Selection as URI" is deleted and no longer available. You should use other extensions like [Text Link](http://piro.sakura.ne.jp/xul/../textlink/index.html.en).
   * Modified: Initial startup dialog is deleted.
   * Fixed: External applications are correctly started multiple times.
   * Improved: New short expressions,  `_getStackTrace()`  (returns the stack trace) and  `_inspect()`  (returns JSON-style serialized string of an object) are available.
 - 4.2.2008120201
   * Modified: "View Source" overriding is deleted and no longer available. You should use other extensions like [Source Viewer Tab](http://piro.sakura.ne.jp/xul/../_viewsourceintab.html.en).
   * Modified: "mailto:" links overriding is deleted and no longer available. You should use Firefox 3's feature.
   * Modified: Features about stylesheets are deleted and no longer available. You should use other extensions like [Stylish](https://addons.mozilla.org/firefox/addon/2108).
   * Fixed: Visualized elements of invisible information are correctly stylized.
   * Fixed: Keyboard shortcuts of Firefox features work correctly even if no keyboard shortcut is defined for any custom script and any other CME feature.
 - 4.1.2008062001
   * Fixed: Keyboard shortcuts of Firefox features work correctly even if no keyboard shortcut is defined for any custom script and any other CME feature.
 - 4.1.2008050601
   * Added: zh-TW locale is available. (by Alan CHENG, thanks!)
 - 4.1.2008040702
   * Fixed: Invalid shortcuts genereted from templates are ignored.
 - 4.1.2008040701
   * Works on Firefox 3.0 beta5.
 - 4.1.2007090601
   * Improved: Works on Thunderbird 2.
 - 4.1.2007080701
   * Fixed: "Custom Scripts" feature works correctly in some environments.
 - 4.1.2007080601
   * Fixed: Works on Firefox 2. (maybe)
   * Fixed: Submenus in "Extensions" menu are shown correctly.
   * Fixed: Some short expressions work again.
 - 4.0.2006011301
   * Modified: Strings in arguments hahded to registered applications are converted to the specified encoding.
   * Fixed: Some keyboard shortcuts work correctly in the FullScreen Mode.
 - 4.0.20050822
   * Fixed: Short expressions are available for custom scripts on Firefox with Gecko 1.8.
 - 4.0.20050819
   * Fixed: Broken features on Firefox with Gecko 1.8 work again.
   * Fixed: Broken context menu disappeared.
   * Fixed: Broken context menu on Firefox with Gecko 1.8 disappeared.
   * Fixed: Errors on startup disappeared.
 - 4.0.20050713
   * Fixed: Works correctly on Deer Park Alpha2.
 - 4.0.20050706
   * Modified: "Send This Frame to..." menuitems for the context menu are moved into the "This Frame" submenu.
   * Fixed: Needless menu separators disappeared.
   * Modified: Seprarators in the context menu cannot be hidden by setting.
   * Improved: Results of some features can be loaded into "the current tab", "new tab", "new window" and a new option "new background tab".
   * Fixed: "Open with Applications" can be shown in webpages without subframes.
   * Improved: User-defined items added into the context menu (top-level) are hidden in submenus in the context menu.
 - 4.0.20050603
   * Modified: Compatibility codes are removed. Now, this extensions works on Mozilla Firefox only.
   * Improved: Some internal operations are optimized.
   * Improved: Each results of some features can be shown in new window/tab as you like.
   * Improved: User defined stylesheets can be applied per tab.
   * Deleted: "Scroll Buttons" feature disappeared.
   * Deleted: In the menu bar, some feautres can be shown in the "Extension" menu. You cannot put them into the menu bar directly.
 - 3.1.20050129
   * Fixed: An fatal error about getting chrome URL of the default browser in the lately Firefox disappeared.
 - 3.1.20041216
   * Fixed: Context menu problem on some webpages (Movable Type 3.0, etc.) disappeared.
 - 3.1.20041112
   * Improved: Last selected panel in the configuration dalog is restored on the next time.
   * Fixed: Errors on initializing and destroying disappear.
   * Modified: Some default settings are changed.
 - 3.1.20040906
   * Fixed: Duplicated menu items defined by user disappear.
   * Fixed: Unclosable dialog (it sais "Please wait..." when new menu item is added) disappears.
 - 3.1.20040818
   * Fixed: Navigations list is generated correctly.
   * Fixed: Initializing error on lately Firefox disappears.
   * Fixed: Context menu with selecting whole the page doesn't cause error.
   * Fixed: Danger of freezing the dialog of Firefox options is resolved.
 - 3.1.20040523
   * Fixed: StyleSheets Manager has worked on Mozilla 1.8a or later correctly.
   * Fixed: Errors in CustomScripts (and some features) caused by comments in the last line have disappeared.
 - 3.1.20040516
   * Fixed: Error of undefined entities in Mozilla Suite has disappeared.
 - 3.1.20040514
   * Fixed: Broken expressions for searching navigations have been corrected.
   * Improved: A new short expression,  `_selectionSourceXML`  has been available, and the behavior of  `_selectionSource`  has changed.
   * Fixed: Broken context menu has disappeared for webpages which include modified  `document.title` .
   * Fixed: "Apply" button has been available without switching panels.
   * Fixed: Weaknesses about modified  `window.top`  have disappeared. (maybe)
   * Fixed: Error of undefined entities in Firefox 0.8+ has disappeared. (maybe)
 - 3.1.20040330
   * Fixed: Conflict with [XUL/Migemo](http://tkm.s31.xrea.com/xul/xulmigemo.shtml) has gone. (maybe)
   * Fixed: External viewer to show sources has worked correctly.
   * Fixed: Fatal error on initializing message window (independently opened from Mozilla Mail), has disappeared.
 - 3.1.20040326
   * Fixed: Initializing problem on Mail has been fixed.
 - 3.1.20040325
   * Removed: The feature to load URI strings like links by double click, has been removed. (You can do it with the [Text Link](http://piro.sakura.ne.jp/xul/textlink/index.html.en).)
   * Removed: The feature to show sources in tabs has been removed. (You can do it with the [Tabbrowser Extensions](http://piro.sakura.ne.jp/xul/tabextensions/index.html.en).)
   * Modified: "Up" command has not sent HTTP_REFERER.
   * Improved: Default settings have been included in the archive.
   * Fixed: Crash problem on Firefox when you close the preferences dialog has disappeared.
   * Fixed: Stylesheet Manager has worked correctly.
   * Fixed: Conflict with Find As You Type has disappeared.
 - 3.1.20031229
   * Fixed: Compatibility problem for old data file has been fixed.
   * Fixed: File-creating operation for the data file has been optimized.
 - 3.1.20031125
   * Modified: Original implementation to rebuild UI from RDF datasources, against the crash problem on the lately Mozilla Trunk after 2003/10, has been available.
   * Improved: "View Selection Source" has been able to be loaded in a tab.
   * Improved: Needless context menu items with selection, links, or others have been hidden.
   * Fixed: Custom user stylesheets for each webpage has been available for Mozilla 1.5 later. (may)
   * Fixed: Initializing problem has been fixed.
   * Fixed: Switching of author stylesheets has worked correctly.
 - 3.0.20031003
   * Fixed: Some mistakes in English Help have been removed.
   * Fixed: Preference dialog has been available for lately Firebird.
   * Fixed: Problems caused by NewsMonster have been corrected.
   * Fixed: Mistakes of short expressions have been corrected.
   * Fixed: Default settings have been loaded correctly in lately Mozilla.
   * Fixed: Errors caused when tabextensions reads the revision number of Mozilla have disappeared.
   * Fixed: Crashes caused by JavaScript panel have disappeared.
 - 3.0.20030804
   * Improved: "Send Page" has been handed to the external mailer application.
   * Fixed: "Light Setting" has been available on the installation.
   * Fixed: Changes in Mozilla Firebird have been followed up.
 - 3.0.20030612
   * Fixed: Broken behavior in the latest Mozilla has been corrected.
 - 3.0.20030516
   * Fixed: Conflict with "Find As You Type" has disappeared.
   * Fixed: Errors in old Mozilla/Netscape which didn't have the feature "Find As You Type" have disappeared.
   * Fixed: Broken appearance of the menubar when the window returned from the full screen mode has been corrected.
   * Fixed: Initializing problem has been fixed.
   * Fixed: "View Source" problem has been fixed.
 - 3.0.20030416
   * Fixed: "View Source" has worked well again.
   * Fixed: Shortcuts to show menubar in the full screen mode have been available.
   * Fixed: Typo in ELP have been corrected.
   * Improved: External source-viewer has been able to open selection sources.
   * Fixed: Garbages in overlays.rdf in the profile directory have been removed completely by self uninstaller. (These garbages obstructed installing into the directory Mozilla installed, after uninstalling from the profile directory.)
   * Fixed: Conflict of "Find As You Type" and some keyboard shortcuts has disappeared.
 - 3.0.20030405
   * Fixed: A fatal error in the uninstaller has been removed.
   * Fixed: Keys have been available in the JavaScript Panel with lately Mozilla.
   * Fixed: New implementation of bookmarks in lately Mozilla has been supported.
 - 3.0.20030330
   * Fixed: Some typos in English Language Pack have been corrected.
   * Fixed: Duplicated "Top of This Page" and "Bottom of This Page" buttons have been removed.
   * Modified: Results have been loaded in the current tab if the tab is blank.
   * Improved: Confirm dialogs for creating directories or overriding files have been available.
 - 3.0.20030317
   * Improved: Multi panels have been available in the JavaScript Panel.
   * Modified: Negative values have been ignored for some numeric prefs.
   * Modified: Some labels of top-level menus have been shorten.
   * Improved: Some Japanese keywords have been added into the default keys of Navigations.
   * Improved: Lately Trunks have been able to install this package into the profile directory.
 - 3.0.20030315
   * Fixed: "Up" has worked on documents which is in the root directory.
   * Fixed: A typo in the English help has been corrected.
   * Improved: Links which contain continuous (to/from the title of the page) numbers, have been regarded as navigations "Next page" or "Previous page".
   * Fixed: Duplicated navigation items called from keyboard shortcuts have been removed.
 - 3.0.20030306
   * Fixed: "Copy Links List" has worked well.
   * Fixed: Garbages of webmail options have been removed.
   * Fixed: The only Enter key has been able to open link with keypress with a focus, other keys have been ignored correctly.
   * Fixed: Keyboard shortcuts for Site Navigation have worked well.
   * Fixed: The behavior of shortcuts for Site Navigations has been changed on a few point.
   * Fixed: New Options window of lately Phoenix has been supported.
 - 3.0.20030121
   * Improved: New short expressions to get file path and URI of system directories have been available.
   * Improved: New short expressions to download remote resources as files have been available.
   * Fixed: Errors in the custom liblary to operate RDF datasources have been fixed.
   * Fixed: Garbages of option for web mails have been removed. (may)
 - 3.0.20030111
   * Fixed: Codes have followed up changes in nsIWebBrowserPersist.
   * Modified: Caches have not been used on saving resources specified by URIs.
   * Modified: The RDF datasource file has been saved only when windows close.
   * Modified: The GUI of the property dialog window of userdefined-menuitems has been modified on a few points.
   * Improved: A new setting to execute custom scripts when Navitator starts up, has been available.
 - 3.0.20030108
   * Fixed: Some undefined short expressions have been defined correctly.
 - 3.0.20030107
   * Fixed: Some short expressions have worked correctly in background tabs.
   * Fixed: A needless element at the last of links array created by  `_getLinks()`  has disappeared.
   * Improved: A new short expression,  `_getLinksWithNode()`  has been available.
 - 3.0.20030106
   * Modified: Only one dialog window has appeared for each item.
   * Improved: The interface of preferences panel has been improved.
   * Modified: Behavior of  `_loadURI()`  and  `_openNewWindow`  of short expressions have been modified.
   * Improved: New short expressions,  `_loadURIAndDo()` ,  `_openNewWindowAndDo()` , and  `_openNewTabAndDo()`  have been available.
 - 3.0.20021228
   * Fixed: Broken context menu in some pages using stylesheets, has been corrected.
   * Fixed: Scrollbars of listboxes in preference panels have been draggable.
   * Fixed: New order of items in preference panels have been memorized at once.
   * Fixed: The external mailer has been available for entering on links with the keyboard and other cases.
   * Modified: Some English label have been modified.
 - 3.0.20021223
   * Improved: Phoenix has been supported experimentally.
   * Improved: User-typed texts (for the JavaScript Panel, regexp to get links, etc.) have been stored.
   * Improved: Menuitems of extensions have been shown in the context menu directly or in the submenu.
   * Improved: User-defined menuitems have been shown as new context menu items.
   * Improved: Preference panels to edit userdefined items have been reformed.
   * Improved: A new feature, to load double-clicked URIs in pages, has been launched.
   * Modified: Help documents have been rewritten.
   * Modified: A feature, "Suplicate Tab" has been removed because which was implemented with Tabbrowser Extensions.
   * And, there are innumerable fixes and improvements.
   * Fixed: A mistake in JLP has been corrected.
 - 2.8.20021019
   * Fixed: Some features have worked well with Mozilla 1.2b later.
 - 2.8.20021014
   * Improved: Browser has been able to get links list in the selection.
 - 2.8.20021002
   * Fixed: Bookmarks menu has been able to open with the keyboard shortcut in the fulscreen mode again.
   * Fixed: Optional stylesheets has been able to enable with keyboard shortcuts.
   * Fixed: Menues e.g. "CustomScripts" have been able to open with keyboard shortcuts again.
   * Modified: "View Source" with external viewer has been able to save the temporary file as the original filename.
   * Improved: "Open with Apps" can hand file paths insetad of URIs even if the resources are in remote, with temporary files.
   * Modified: Field of selection about optional stylesheets has been changed in the datasource.
   * Fixed: A problem which keyboard shortcuts were lost when items were updated has been fixed.
   * Fixed: Needless KEY elements generated from the datasource have been removed.
   * Fixed: Broken menu items built from datasources has been corrected.
   * Fixed: Sent strings have been URI-encoded directly when it's encoding is UTF-8.
 - 2.8.20020930
   * Fixed: A crash bug caused when "Go" menu (or others) is opened in local directory, has been fixed.
   * Improved: New keyboard shortcuts, A/Q and Ctrl(Command)+Down/Ctrl(Command)+Up for focusing to next/previous link or form control, have been launched. (compatible Opera ver.6)
 - 2.8.20020929
   * Fixed: A problem in concatenation of node lists has been fixed.
   * Fixed: Mistakes in this help file have been fixed.
   * Improved: "Open with Apps" has been able to hand selection string to applications.
   * Modified: Selection status of optional stylesheets have been stored in the RDF datasource.
 - 2.8.20020928
   * Fixed: Keyboard shortcuts for custom scripts have been available.
   * Fixed: A problem in concatenation of node lists has been fixed.
   * Added: New sample script to add new sidebar panels has been launched.
   * Improved: "Add Stylesheets", "Open with Apps", and "Send to XXX" has been able to use with keyboard shortcuts.
   * Fixed: Self uninstaller has been available.
   * Modified: Operations during page-loading have been modified on a few points.
   * Fixed: Problems caused by  `Array.concat()`  have been fixed.
 - 2.8.20020918
   * Fixed: Self uninstaller has been available in Mozilla 1.2a later
   * Improved: Preferences of "Type Ahead Find" have been customizable with "Mozilla" pref panel.
 - 2.8.20020916
   * Fixed: AREA element has been parsed too.
   * Fixed: Prefered Stylesheets have been applied when the selected sheet is missed.
   * Modified: "Open with Apps" has been hand no URI as a parameter when  `%s`  isn't written into parameters.
 - 2.8.20020911
   * Fixed: URL encoding has worked completely.
   * Modifed: Internal implementations have been changed a little.
 - 2.8.20020909
   * Fixed: External source viewer has been opened after saving a temporary file of remote resources.
   * Fixed: Status of progress about extensions has been displayed properly.
   * Improved: "View ***" have been renamed to "Show ***".
   * Improved: "Show Links" has been able to show long descriptions of images.
   * Improved: The baseURI have been omitted in the results of "Show ***".
 - 2.8.20020908
   * Improved: Total performance has been improved. TreeWalkers have worked with proper performance.
   * Fixed: Some problems caused in TreeWalker operations have been fixed.
   * Fixed: Default source viewer has been available completely (may).
   * Improved: Some heavy and irritative operations have been run progressively.
   * Fixed: String prefs have been loaded properly.
   * Fixed: Navigator windows by JavaScript Panel have work properly.
   * Fixed: Some mistakes in sample scripts have been corrected.
   * Fixed: A crash bug, which browser crashes when the pointer moved on upper menus keeping open submenus, has been fixed (may).
 - 2.7.20020901
   * FixedÅFBroken order of items in the context menu has been corrected.
 - 2.7.20020830
   * Modified: Legacy codes for NS6 have been removed.
   * Improved: "browser.block.target_new_window" has been customizable with GUI.
 - 2.6.20020828
   * Fixed: Menus have been initialized on startup whenever.
 - 2.6.20020825
   * Fixed: Codes have been changed to cope with changing of nsIIOService.
 - 2.6.20020809
   * Fixed: Codes have been changed to cope with changing of nsISupports(W)String.
 - 2.6.20020721
   * Fixed:
A fatal problem, which the operation opening context menu on q/ins/del
without cite and with child elements causes freeze, has been fixed.
   * Fixed: "View Cited from" has been able to show cite attribute without title attribute.
 - 2.6.20020720
   * Improved:  `_read()`  and  `_write()` , new short expressions has been launched.
   * Modified: The spec of  `_ex.GetLinks()`  has been changed.
   * Improved: The operation of userContent.css I/O in StyleSheets Manager has been improved.
   * Improved: Some panels and dialogs has been able to import external files.
   * Improved: The location of stored data file has been changable.
 - 2.6.20020718
   * Fixed:
A fatal problem, which the operation opening context menu on q/ins/del
without cite or img without longdesc causes freeze, has been fixed.
   * Improved:  `_include()` , a new short expression has been launched.
   * Modified: Items in the preferences tab "Mozilla" have been displayed in normal pref mode.
   * Improved: bookmarks.html's backup will be created when you change boomrks.html's path to existing file's.
 - 2.6.20020713
   * Modified: Operations for copying menu items into "Go" menu have been changed.
   * Improved:
Browser has been able to view long descriptions of images, source
documents of quotations, and explanations of edited sections, with the
context menu.
 - 2.6.20020706
   * Fixed: A problem, Custom Scripts was always executed in current tab, has been fixed.
   * Fixed: StyleSheets Manager has been available again.
 - 2.6.20020703
   * Fixed: A problem, which the feature executing Custom Scripts automatically didn't work, has been fixed.
   * Fixed: A fatal problem, which ContextMenu Extensions failed to initialize at first, has been fixed.
 - 2.6.20020628
   * Modified:
"@mozilla.org/appshell/window-mediator;1" has been used instead of
"@mozilla.org/rdf/datasource;1?name=window-mediator" in Mozilla 1.0
later.
 - 2.6.20020618
   * Fixed: "_getPref()" has been available in Custom Scripts.
 - 2.6.20020614
   * Fixed: Navigations menu has been available again.
 - 2.6.20020611
   * Fixed: "View Frame Source" has been available again with Mozilla 10 later.
 - 2.6.20020531
   * Fixed: A plobblem, which the browser wasn't able to save RDF data file, has been fixed.
   * Fixed: Misstakes of style rules for showing invisible data has been fixed.
   * Modified: Features of tabbed browsing has been separated from this package.
 - 2.5.20020528
   * Fixed: The conflict with XHTML Ruby Support has been fixed.
 - 2.5.20020527
   * Fixed: A problem, which the settings about tabbed browsing weren't saved, has been fixed.
   * Modified: XHTML Ruby Support has been separated from this package.
   * Modified: Mozilla 0.9.8-0.9.9 have been out of support.
 - 2.4.20020526
   * Modified: Keyboard shortcuts have been changed. "H" has been assigned to "Search", and "?" to "Help".
 - 2.4.20020525
   * Fixed: A problem, which the feature "view invisible data with onload" didn't work with no disc cache, has been fixed.
   * Fixed:
The timing of operating "view invisible data with onload" and "execute
custom scripts" on loaded documents, has been changed.
   * Fixed: The disorder of outline's list has been fixed tentatively.
   * Improved: You have been able to change the mozilla's secret preference for using the mailer set to system's default.
   * Modified:
The checkboxes of tabbed browsing's preferences in "Mozilla" panel have
been moved into "Navigator" &gt; "Tabbed Browsing".
   * Fixed: A
problem, which the keyboard shortcuts are enabled even if you turned
off their availability in preferences dialog, has been fixed.
 - 2.4.20020524
   * Improved: The operation making lists of headings has been fastened.
 - 2.4.20020521
   * Fixed: Initializing bug of menus has been fixed.
   * Fixed: A style bug, a custom user styles has been applied to current tab when the link is opened in new tab, has been fixed.
   * Fixed: Loading bug of string preferences (style rules for visiblized items, and so on) has been fixed.
 - 2.4.20020519
   * Fixed: Initializing bug has been fixed.
 - 2.4.20020518
   * Fixed: Navigations list has been available.
   * Improved: Useless operations on transferring documents have been removed.
   * Improved: The operation taking effect of preference changings has been improved.
   * Fixed: Some script's erros has been fixed.
 - 2.4.20020517
   * Fixed: A problem, preferences dialog was closed with pressing ENTER key in textbox, has been fixed.
   * Fixed: A problem, initializing failed with latest Mozilla, has been fixed.
   * Modified: Changing about keyboard shortcuts' preferences have took effect after restarting browsers.
   * Modified: Changing about keyboard shortcuts' preferences have took effect without restarting browsers.
 - 2.4.20020514
   * Improved: Navigation menuitems has been draggable as links.
   * Improved: Trees of StyleSheets Manager has draggable as texts.
   * Fixed: Mistakes 
 - 2.4.20020512
   * Improved: A check to edit the preference "browser.tabs.opentabfor.windowopen" has been attached in the "Mozilla" tab.
   * Modified: A preference item for background operations has been restorated.
 - 2.4.20020511
   * Improved: Some annoying operations have been done in background with tabbed-browsing.
   * Modified:
"(Custom) User Styles &amp; Selected Styles Manager" and "User
StyleSheet Editor" have been importd in "StyleSheets Manager".
 - 2.3.20020511
   * Improved: Mozilla has repaired prefs.js when illegal prefs is written.
   * Modified: Timings of operating ruby rendering and so on have been changed.
   * Modified: Internal operation about switching stylesheets has been changed.
   * Improved: Lists of navigations and outline for current tab have been updated in the background.
 - 2.3.20020506
   * Fixed: "View Page Source" has been available in NS6 again.
   * Fixed: Ruby-like rendering of abbreviations has been available with Mozilla 1.0.0+ later.
   * Fixed: Complex rubies have been rendered completely in pages containing abbreviations.
   * Fixed: A problem, which the "View Page Source" didn't work when no external viewer specified, has been fixed.
 - 2.3.20020502
   * Fixed: A problem, which the browser failed to initialize some prefs, has been fixed.
   * Improved: A new feature to edit User StyleSheet has been implimented.
   * Fixed: A problem, which the browser often failed to handle options to external apps, has been fixed.
   * Improved: Outline list has been able to show headings of XHTML 2.0.
   * Improved: A new function,  `_CustomScript()` , has been implemented in Custom Scripts.
   * Fixed: A problem, which the setting of charset wasn't loaded in the panel "Send selected term to", has been fixed.
   * Improved: A new preference item about operation of downloading files has been implemented in the panel "Mozilla".
   * Fixed: A problem, which the RUBY implementation often made crash with Mozilla 1.0 RC1 later, has been fixed.
 - 2.3.20020426
   * Improved: Headings in quotations haven't been shown in outline menus.
 - 2.3.20020425
   * Improved: Visibility of the "Extensions" menu in the context menu have been customizable.
   * Modified: A few of internal operations have been modified.
   * Improved: Visibility of separators in the context menu have been customizable.
   * Improved: Policy Manager has been included in the package.
 - 2.3.20020417
   * Improved: Documents which have a content type "application/xhtml+xml" have been regarded as a HTML resource.
   * Modified: Complex rubys have been rendered like simple rubys on NS6.
   * Modified: Some items in the context menu have been hidden in context.
   * Improved: "Clear" button has been added to the keyboard shortcuts form in the "Custom Scripts" preference panel.
   * Added: "Duplicate This Tab" has been added.
   * Fixed: External viewers have been available with "View Frame Source" in the context menu.
 - 2.3.20020411
   * Fixed: Broken RUBY, which contains RT elements with RBSPAN attribute, has been fixed.
   * Improved:
The support of RBSPAN attribute has been realized with TD element. (In
this result, the markup will be invalid. I have priority on the RUBY
support.)
 - 2.3.20020409
   * Fixed: A mistake in Japanese language pack has been fixed.
   * Modified: The number of separators has been incleased in menus.
   * Modified: "Search Words" has been renamed to "Send selected term to."
   * Added:
"Send URI to" has been launched. "Validate HTML", "Open Google's Cache"
and "Find Internet Archive" have been united to it.
   * Improved: The textarea has been focused when the JavaScript Panel is opened.
   * Improved: The JavaScript Panel has been independent from Navigator windows.
 - 2.2.20020407
   * Modified:
The data of several features, "StyleSheets", "Search Words", "Open with
Apps", "Custom Scripts", "UserStyle for each site" and "info of style
selection", has been moved to the private data file of this program.
 - 2.2.20020406
   * Improved: Keyboard shortcuts for custom scripts have been able to set with practical inputs.
   * Modified: Automatic reloading of the User Style Editor has been removed.
   * Modified: Operations about bookmarks have been ignored in MacOS.
   * Modified: Operations of RDF datasources have been modified.
 - 2.2.20020405
   * Fixed: This program has followed up the new menu bar and the new context menu.
   * Fixed: The delay caused by opening "Search" menu has been canceled.
 - 2.2.20020404
   * Fixed: A mistake of converting fullwidth-alphabets (and numbers) to halfwidth-one has been fixed.
 - 2.2.20020403
   * Fixed: A problem, which the bookmark was opened doubly by new and current tab with Ctrl-click, has been fixed.
 - 2.2.20020331
   * Fixed: Some mistakes in the operation of RDF have been fixed.
   * Fixed: RDF-based preferences (ex. "Custom Scripts") have been able to add/update items again.
   * Modified:
The regular expressions to conjecture navigations haven't been
distinguished full-width alphabets and numbers in Japanese fonts (and
so on) from half-width alphabets and numbers
   * Improved: "Search" navigation has been conjectured from the link text.
   * Fixed: StyleSheets Manager has been able to open or edit items certainly again.
   * Modified: Inner operations have been arranged on a few points.
 - 2.2.20020330
   * Fixed: Some mistakes in the operation of RDF have been fixed.
   * Modified: "Outline Viewer" has been removed.
   * Fixed: "Custom Scripts" menu which is opened with keyboard shortcut has had full items again.
   * Fixed: Trees have been replaced to new Tree elements.
   * Fixed: "Custom Scripts" and "Open with Apps" menus which opened by keyboard shortcuts have worked well again.
 - 2.2.20020328
   * Improved:
The preferences of "StyleSheets", "Search Words", "Open with Apps", and
"Custom Scripts" have been improved at following points: 					     * Changings have taken effects without restarting browser.
     * Updating hasn't changed the order of the items.
     * You have been able to change the order of items.
 - 2.2.20020327
   * Fixed: Bookmarks has been able to open with keyboard operations again.
 - 2.2.20020325
   * Modified: The specification of searching selected words in the context menu has been fellow to the one of Mozilla 0.9.9+ later.
   * Fixed: A problem, which the bookmark was opened doubly by new and current tab with Ctrl-click, has been fixed.
 - 2.2.20020324
   * Fixed: The browser has been able to handle URIs of remote resources to external applications in "Exec Apps" again.
   * Fixed: The preferences panel "Use External Apps" has been fixed on a point.
 - 2.2.20020322
   * Fixed: The operation of inputting regular expressions has been fixed.
   * Fixed: The management of cumments in custom scripts has been fixed.
   * Fixed: The short expression " `_run()` " has been able to work with no options.
   * Modified: The checking operation of the browser's version in the installation script has been changed.
 - 2.2.20020320
   * Modified: Availability of popupping of "Top of this page" button has been customizable for each corner.
   * Fixed: Errors with closing tabs maybe have been fixed.
   * Fixed:
No tabs have been opened by links with TARGET attribute when the
browser hasn't allowed to open new windows or tabs by links.
 - 2.2.20020318
   * Fixed: Conjecturing navigation items has been enabled again.
   * Improved: Operations about reading/writing preferences have been improved.
   * Added:  `_setPref()`  and  `_getPref()`  have been added to the short expressions.
 - 2.2.20020317
   * Modified: Preferences panel for "Navigations" has been separated from "General" panel.
   * Fixed: Default settings have been loaded rightly again.
   * Fixed: The lost slash ('/') has been supplemented to the inputted regular expression.
   * Improved: You have been able to customize regular expressions used for conjecturing relations of links.
   * Fixed: A fatal problem, which settings of style rules for labels of viewing inbisible informations were cleared, has been fixed.
   * Fixed: "Navigations" operation has been enabled again.
   * Improved: The keywords of conjecturing navigations have increased.
   * Fixed: The link pointed to "_self", "_top", or "_parent", will be opened in the same window or tab.
   * Fixed: Needless windows haven't been opened even if the link has TARGET attribute or refers to an E-mail address.
 - 2.2.20020314
   * Improved:
I reflect the setting, for tabbed browsing,
"browser.tabs.opentabfor.windowopen", when clicking links which have
TARGET attribute. (Unofficial patch)
   * Fixed: The language pack has been set to English beforehand.
 - 2.2.20020313
   * Fixed: "View Source" operation has been enabled again.
   * Fixed: A few of points have been modified in the "Mozilla" preference panel.
   * Modified: Paths of internal packages have been changed.
 - 2.2.20020312
   * Modified: The features, "Popup ALT Attribute" and "Redirect URN to URL", have been available always.
   * Modified: The features, "Popup ALT Attribute" and "Redirect URN to URL", have been separated from main operation.
 - 2.2.20020311
   * Improved: Stylesheets Manager has been able to open the target URI.
   * Modified: "Up" hasn't loaded the current directory if the file name includes "index".
   * Added: A new sample custom script has been launched.
   * Improved: URN redirection has been operated by browser-self.
   * Improved: URN redirection hasn't change the document's data.
   * Fixed: User Styles Editor and Stylesheets Manager have been able to be opened from other windows too.
   * Fixed: URN redirection has worked again with single click.
 - 2.2.20020306
   * Improved: The extension of the temporary file has been extracted from the document's content type.
 - 2.2.20020305
   * Improved: You can hand additional options to external mailer.
   * Improved: The browser has been able to convert the URI to local file path on each platform.
   * Improved: You can change the source viewer to an external application.
   * Improved: You can use the external source viewer for remote files too (with temporary files).
 - 2.2.20020303
   * Fixed: The operation, which is called when an element with CITE attribute is pointed, has been amended.
   * Fixed: A installation bug has been (perhaps) fixed.
   * Fixed: Bugs following about bookmarks have been fixed again.
 - 2.2.2002022701
   * Fixed: Bugs following about bookmarks have been fixed again.
 - 2.2.20020226
   * Fixed:
Problems which related to the feature "View Comments" and the operation
gathering inner texts of elements have been fixed.
   * Improved: Navigations will be conjectured from the inner texts of the elements.
   * Fixed: Problems which related to the operations of reading default settings have been fixed.
   * Fixed: The feature switching stylesheets has been enabled again.
   * Fixed:
A fatal problem, which bookmarks didn't work if the preference
"browser.tabs.opentabfor.bookmarks" was disabled, has been fixed.
 - 2.2.20020223
   * Fixed: Some features hadn't worked in frames
   * Fixed: The unregistration operations of RDF data sources have been remade.
   * Modified:
The confirmation question about removing user settings on the
unregistration has been rewrited to question about "saving" them.
 - 2.2.20020222
   * Improved: You can install this package to NS6 or Mozilla equally.
   * Fixed: The checks of automatic reloading of the dialogs "User Styles Editor" and "Outline View" have been enabled again.
   * Modified:
The behavior of the feature "Up" has been modified. You will move to
the current directory at first, and next move to the parent.
   * Improved:
You can open bookmarks (of the Menubar or the Personal Toolbar) in new
tab by middle click (or Ctrl+click). This feature is controlled by the
preference "browser.tabs.opentabfor.bookmarks".
   * Fixed: Each dialogs have worked independently completely.
   * Modified: The dialogs, "JavaScript Panel" and "Outline View", have been closed automatically when all Navigator windows closed.
   * Improved:
Two keyboard shortcuts, "Ctrl+Q (or W)" for closing and "Ctrl+R" for
running, have been launched to the JavaScript Panel.
   * Fixed: The operation supplementing broken ruby markups has been worked again.
   * Fixed: The keyboard shortcuts for opening menus have been based on the new FullScreen mode (Nightly Build ID:20020221 later).
   * Improved: You can edit user style rules from the User Styles &amp; Selected Styles Manager.
   * Fixed: Many many bugs have been fixed and many many operations have been changed. I can't memorize all of them! X-(
 - 2.1.20020214
   * Improved:
Some keyboard shortcuts appended for the dialogs "Outline Viewer",
"User Styles Editor" and "User Styles &amp; Selected Styles Manager".
   * Fixed: Automatic unregisteration has been to work well.
   * Improved: Automatic unregisteration has been able to remove your private settings.
   * Fixed: A problem, which the keyboard shortcuts were available in text forms, has been corrected.
   * Fixed: A fatal problem, which the preferences dialog could be opened only once in Mozilla 0.9.8 later, has been corrected.
   * Fixed:
A problem, which the context menu couldn't be opened on the elements
which have CITE attributes or the links to E-mail addresses, has been
corrected.
   * Fixed: A few of inner operations have been corrected or improved.
 - 2.1.20020202
   * Fixed: Operations about timers have been corrected.
   * Fixed:
The at-import rule has been treated as an XML processing instruction if
the additional stylesheet contains only an at-import rule.
 - 2.1.20020201
   * Improved: You have been able to change the mailer which is called when you click a link to an E-mail address.
   * Improved: Inner operations have been improved on a few points.
   * Corredted: The operations about stylesheets have been improved greatly.
 - 2.1.20020130
   * Fixed: The Outline Viewer has been replaced to the tree widget version.
   * Improved: The settings of switching stylesheets have been stored in the localstore.rdf.
   * Improved:
You have been able to manage the settings of switching stylesheets and
user style rules for each site from the "Style Sheets" preferences
panel.
   * Improved: Two features have been launched to the dialog
which is for managing settings of switching stylesheets and user
styles. You can select and remove multiple rows at once, and can do the
operation from the context menu.
   * Improved: The dialog, which is
for managing settings of switching stylesheets and user styles, has
cooperated with another one which is for editing user styles.
 - 2.1.20020123
   * Improved:
Some operations have been skipped when the context menu is opened, if
"Site Navigations" or "Outline of this Page" is disabled.
   * Fixed: The source codes has been arranged.
   * Fixed: Error messages will be displayed on the status bar when the menu which called by it's keyboard shortcut has no items.
   * Improved: The short expression " `_run()` " have been able to receive the arguments as a string.
 - 2.1.20020122
   * Fixed: A problem about sensitive area of automatic popup has been corrected.
   * Fixed: A problem, which items of menus opened by keyboard shortcuts were duplicated, has been corrected.
   * Improved:
Mozilla has been able to conjecture more navigations from the links of
the documents by the relation of URLs. (But this conjecture is often
failed.)
 - 2.1.20020121
   * Added: A new feature, "Top of this page" button has been launched.
   * Fixed: A problem, which the menu of Custom Scripts popped up by the keyboard shortcut didn't work, has been corrected.
 - 2.1.20020119
   * Fixed: The naming syntax of sources in this package has been arranged.
   * Fixed: The Custom Scripts have been managed as a method of the window object.
   * Improved: The labels of the items of the "Extensions" menu have been changed on context.
   * Improved: The URIs of the navigation items have been displayed on the status bar when you move the cursor on them.
 - 2.1.20020118
   * Improved: You have been able to use some features ("Go to Next/Prev. Heading", etc.) in frames too.
   * Improved:
You have been able to open menus of the menubar by their accesskeys
when Mozilla is in FullScreen Mode. (*This feature has been checked in
only Windows)
 - 2.1.20020116
   * Added: A new feature which is a dialog window for testing JavaScripts has been launched.
   * Improved: You can open some popup menus by their keyboard shortcuts.
   * Improved: The dialog for choosing navigations has been replaced to popup menu.
   * Improved: You can jump to more kinds of navigations by their keyboard shortcuts.
 - 2.1.20020115
   * Improved: Calling a navigation from it's keyboard shortcut, you can choose a link when plural links have the linktype.
   * Fixed:
A problem, which the keyboard shortcut of the Site Navigation didn't
work before popping up the context menu, has been corrected.
   * Modified: In the Site Navigation menu, their keyboard shortcuts have been displayed.
   * Improved: You can use keyboard shortcuts for the items of the Site Navigation Bar, even if the bar is hidden.
 - 2.1.20020114
   * Coorect: A problem, which the help document(this) wasn't loadable, has been corrected.
   * Added: You can assign keyboard shortcuts for the Site Navigation Bar.
   * Fixed: A management about adding stylesheets has been improved.
   * Fixed: A problem, which the function adding stylesheets didn't work, has been corrected.
   * Modified: TreeWalkers (DOM2 Traversal) is working in some functions.
 - 2.1.20020109
   * Modified: The source texts of selected range have been returned with their original markups.
   * Fixed: A management about popuping ruby texts has been improved.
 - 2.1.20020106
   * Fixed: A problem about the help document has been corrected.
   * Added: "Show NOFRAMES" has been added to the sample scripts of  "Custom Scripts".
   * Modified: The preferences' tree and outline viewer's tree have been remade with outliner widget.
   * Fixed: A problem, which Mozilla made no action when the Enter key is pressed in the URL bar, has been corrected.
 - 2.0.20020106
   * Modified: The help descriptions of the Expert Prefs have been shown only in the Expert Prefs mode.
   * Fixed: Some problems, which useless separators or menus were shown in the menu, have been corrected.
   * Added: The "Test Run" button has been added to the "Custom Scripts" preferences panel.
   * Fixed:
A problem, which empty menu items were left in the menus "Custom
Scripts" and so on after some items were removed, has been corrected.
 - 2.0.20011225
   * Modified: Additional stylesheets have been edited on the preference panel, like "Custom Scripts".
   * Fixed: Some at-rules (@import, @namespace, etc.) have been available in the user styles for each site.
But sometimes some rules may not work.
   * Fixed:
Additional stylesheets have been disabled when the check has been
turned off in "StyleSheets" (or "Use Stylesheets") menu.
   * Modified: Old settings of additional stylesheets have been destructed, because it's system has been radically changed.
If you would like to remove them, you have to do by your hand-operation.
   * Fixed: A problem, which some menu items were changed when sub menus opened in the context menu, has been corrected.
   * Modified: User styles for each site have been saved in the file "localstore.rdf" instead of "prefs.js".
   * Fixed: A problem, which the user styles' dialog didn't reload automatically, has been corrected.
   * Modified: Alternate texts of IMG elements have been poped up without changing of HTML source.
 - 1.9.20011224
   * Modified: ABBR and ACRONYM elements have been displayed as the ruby by the XBL binding.
   * Modified: RP elements which are outside of RUBY elements have been removed.
   * Fixed: A fatal problem, which Mozilla often crashes when the page contains RUBY, ABBR or ACRONYM elements, has been corrected.
 - 1.9.20011220
   * Modified:
When the quotation (and so on) contains CITE attribute, the cursor has
been changed to the one which is on links, and the CITE attribute has
been displayed on the status bar.
   * Fixed: A problem, which the Expert Prefs Mode checkbox didn't remember it's status, has been corrected.
 - 1.9.20011217
   * Fixed:
A problem, which Mozilla causes a runtime error when you dragged a
"Site Navigation" menu item of stylesheets to somewhere, has been
corrected.
   * Fixed: A fatal problem, which "Get Links List" didn't work when regular expression was entered, has been corrected.
   * Modified: The un-important preferences have been classified in "Expert Prefs", and hidden from the beginning.
 - 1.9.20011216
   * Fixed: A problem, which is in a sample script "Make the outline list", has been corrected.
   * Fixed: A problem, which the charset menu wasn't displayed on in the "Search Words" panel, has been corrected.
   * Modify/Added:
The sample items in "StyleSheets", "Search Words", "Open with Apps",
and "Custom Scripts" panel have been arranged, and some samples have
been added into them.
   * Fixed: A fatal problem, which "%s" wasn't replaced to the selected string, has been corrected.
 - 1.9.20011215
   * Remove: "Make links list" has been removed from the sample scripts.
   * Added: "Make the outline list" and "Escape a string to Unicode-escape" have been added to the sample scripts.
   * Fixed: A problem, which Mozilla causes an error when the custom script contains "//" in the string literal, has been corrected.
   * Fixed:
A problem, which the custom script which was checked to "In the
context-menu, hide this item" isn't shown in "Extensions" menu of the
menubar, has been corrected.
   * Fixed: Keyboard shortcuts of the custom scripts have been indicated in the menubar.
   * Fixed: The errors of the preferences panels have been corrected.
   * Fixed: The hidden menuitems haven't been focused.
   * Modified: Features in the menu bar have been rearranged into the "Extensions" menu.
   * Modified: The indications "Wayback Machine" have been renamed to "Internet Archive".
   * Fixed:
A fatal problem, that settings disappear when the setting is updated in
"StyleSheets", "Search Words", "Open with Apps", or "Custom Scripts"
panel.
   * Modified: A sample script, "Quote from the selection
with original markup", has been able to switch properly the element
type of the made strings.
 - 1.9.20011213
   * Fixed:
A problem, which the headings are duplicated in the preferences dialog
window on a recent versions Mozilla, has been corrected.
   * Added: A feature to support uninstalling has been added to the preferences panel.
 - 1.9.20011210
   * Added: "Outline of This Page" has been added to the context menu.
   * Added: A setting, when Mozilla updates the "Outline"/"Site Navigation" menu at, has been added.
 - 1.9.20011209
   * Fixed: Your original scripts for "Custom Scripts" have been able to contain comments.
   * Modified: "Custom Scripts" has indicated a worning of the scripts' error.
   * Modified: A few points have been modified.
   * Fixed: A fatal problem, which a few of features haven't worked after Mozilla causes an error, has been corrected.
 - 1.9.20011208
   * Mdify: Some of ways of hundling events have been changed.
   * Modified: In the "Site Navigation" menu, the links referring to stylesheets have been put into the sub menu.
   * Fixed: A fatal problem, which Mozilla clashes when loading some pages, may has been corrected.
   * Modified: "Go To Next/Previous Heading" and "Outline Viewer"  have been working without generated IDs.
   * Added: " `_run()` " has been added to the short expressions for "Custom Scripts".
   * Correctement: A few points have been corrected.
 - 1.8.20011205
   * Modified: The short expression "_getSelectionSource" has returned the selected range with the XML markup.
   * Modified: The elements generated by the features "View ..." have been original XML elements.
 - 1.8.20011203
   * Add/Correctment: The short expressions for "Custom Scripts" have been arranged, and some new expressions are added.
   * Modified: "Outline Viewer" has shown users the document's URI when it doesn't have it's title.
   * Correctement: Some points have been corrected.
 - 1.8.20011202
   * Modified:
"Extensions", "Site Navigation", and "StyleSheets(Use Stylesheet)" have
been available in menu only when the URI contains "http", "https", or
"file" in the head.
   * Fixed: Mozilla have been able to be rendering all link types properly in the "Site Navigation".
 - 1.8.20011201
   * Modified: All of features have been able to be used from the menubar.
   * Modified: Inner management has been modified on a few point.
   * Fixed: In the context menu, some menu-items have reflected the selected string again.
   * Fixed: "Custom Scripts" have been able to be called by the keyboard shortcut again.
   * Modified: "Headings List" has been renamed to "Outline Viewer".
 - 1.8.20011129
   * Fixed: This program also have been able to work with MultiZilla again.
   * Fixed:
A fatal problem, which Mozilla was't able to jump to the next/previous
heading when "S"/"W" key is pressed, has been corrected.
   * Modified: Mozilla hasn't jumped to the next/previous heading when "S"/"W" key is pressed in any form items.
 - 1.8.20011128
   * Modified: Menu-items of the context-menu have been moved to each suitable places.
   * Fixed: Inner management has been corrected on a few point.
   * Modified: English help has been modified on a few point.
   * Modified: Japanese help has been modified on a few point.
   * Fixed: Preference panels have been corrected on a few point.
 - 1.8.20011127
   * Added: Switching of HTML validators has been added.
