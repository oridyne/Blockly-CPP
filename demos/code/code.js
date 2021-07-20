/**
 * @license
 * Copyright 2012 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview JavaScript for Blockly's Code demo.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Create a namespace for the application.
 */
var Code = {};

/**
 * Lookup for names of supported languages.  Keys should be in ISO 639 format.
 */
Code.LANGUAGE_NAME = {
    'ar': 'العربية',
    'be-tarask': 'Taraškievica',
    'br': 'Brezhoneg',
    'ca': 'Català',
    'cs': 'Česky',
    'da': 'Dansk',
    'de': 'Deutsch',
    'el': 'Ελληνικά',
    'en': 'English',
    'es': 'Español',
    'et': 'Eesti',
    'fa': 'فارسی',
    'fr': 'Français',
    'he': 'עברית',
    'hrx': 'Hunsrik',
    'hu': 'Magyar',
    'ia': 'Interlingua',
    'is': 'Íslenska',
    'it': 'Italiano',
    'ja': '日本語',
    'kab': 'Kabyle',
    'ko': '한국어',
    'mk': 'Македонски',
    'ms': 'Bahasa Melayu',
    'nb': 'Norsk Bokmål',
    'nl': 'Nederlands, Vlaams',
    'oc': 'Lenga d\'òc',
    'pl': 'Polski',
    'pms': 'Piemontèis',
    'pt-br': 'Português Brasileiro',
    'ro': 'Română',
    'ru': 'Русский',
    'sc': 'Sardu',
    'sk': 'Slovenčina',
    //'sq': 'Shqip',
    'sr': 'Српски',
    'sv': 'Svenska',
    'ta': 'தமிழ்',
    'th': 'ภาษาไทย',
    'tlh': 'tlhIngan Hol',
    'tr': 'Türkçe',
    'uk': 'Українська',
    'vi': 'Tiếng Việt',
    'zh-hans': '简体中文',
    'zh-hant': '正體中文'
};

/**
 * List of RTL languages.
 */
Code.LANGUAGE_RTL = ['ar', 'fa', 'he', 'lki'];

/**
 * Blockly's main workspace.
 * @type {Blockly.WorkspaceSvg}
 */
Code.workspace = null;

/**
 * Extracts a parameter from the URL.
 * If the parameter is absent default_value is returned.
 * @param {string} name The name of the parameter.
 * @param {string} defaultValue Value to return if parameter not found.
 * @return {string} The parameter value or the default value if not found.
 */

Code.getStringParamFromUrl = function (name, defaultValue) {
    const val = location.search.match(new RegExp('[?&]' + name + '=([^&]+)'));
    return val ? decodeURIComponent(val[1].replace(/\+/g, '%20')) : defaultValue;
};

/**
 * Get the language of this user from the URL.
 * @return {string} User's language.
 */
Code.getLang = function () {
    let lang = Code.getStringParamFromUrl('lang', '');
    if (Code.LANGUAGE_NAME[lang] === undefined) {
        // Default to English.
        lang = 'en';
    }
    return lang;
};

/**
 * Is the current language (Code.LANG) an RTL language?
 * @return {boolean} True if RTL, false if LTR.
 */
Code.isRtl = function () {
    return Code.LANGUAGE_RTL.indexOf(Code.LANG) !== -1;
};

/**
 * Load blocks saved on App Engine Storage or in session/local storage.
 * @param {string} defaultXml Text representation of default blocks.
 */
Code.loadBlocks = function (defaultXml) {
    let loadOnce;
    let xml;
    try {
        loadOnce = window.sessionStorage.loadOnceBlocks;
    } catch (e) {
        // Firefox sometimes throws a SecurityError when accessing sessionStorage.
        // Restarting Firefox fixes this, so it looks like a bug.
        loadOnce = null;
    }
    if ('BlocklyStorage' in window && window.location.hash.length > 1) {
        // An href with #key trigers an AJAX call to retrieve saved blocks.
        BlocklyStorage.retrieveXml(window.location.hash.substring(1));
    } else if (loadOnce) {
        // Language switching stores the blocks during the reload.
        delete window.sessionStorage.loadOnceBlocks;
        xml = Blockly.Xml.textToDom(loadOnce);
        Blockly.Xml.domToWorkspace(xml, Code.workspace);
    } else if (defaultXml) {
        // Load the editor with default starting blocks.
        xml = Blockly.Xml.textToDom(defaultXml);
        Blockly.Xml.domToWorkspace(xml, Code.workspace);
    } else if ('BlocklyStorage' in window) {
        // Restore saved blocks in a separate thread so that subsequent
        // initialization is not affected from a failed load.
        window.setTimeout(BlocklyStorage.restoreBlocks, 0);
    }
};

/**
 * Save the blocks and reload with a different language.
 */
Code.changeLanguage = function () {
    // Store the blocks for the duration of the reload.
    // MSIE 11 does not support sessionStorage on file:// URLs.
    if (window.sessionStorage) {
        const xml = Blockly.Xml.workspaceToDom(Code.workspace);
        window.sessionStorage.loadOnceBlocks = Blockly.Xml.domToText(xml);
    }

    const languageMenu = document.getElementById('languageMenu');
    const newLang = encodeURIComponent(
        languageMenu.options[languageMenu.selectedIndex].value);
    let search = window.location.search;
    if (search.length <= 1) {
        search = '?lang=' + newLang;
    } else if (search.match(/[?&]lang=[^&]*/)) {
        search = search.replace(/([?&]lang=)[^&]*/, '$1' + newLang);
    } else {
        search = search.replace(/\?/, '?lang=' + newLang + '&');
    }

    window.location = window.location.protocol + '//' +
        window.location.host + window.location.pathname + search;
};

/**
 * Bind a function to a button's click event.
 * On touch enabled browsers, ontouchend is treated as equivalent to onclick.
 * @param {!Element|string} el Button element or ID thereof.
 * @param {!Function} func Event handler to bind.
 */
Code.bindClick = function (el, func) {
    if (typeof el == 'string') {
        el = document.getElementById(el);
    }
    el.addEventListener('click', func, true);
    el.addEventListener('touchend', func, true);
};

/**
 * Load the Prettify CSS and JavaScript.
 */
Code.importPrettify = function () {
    const script = document.createElement('script');
    script.setAttribute('src', 'https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js');
    document.head.appendChild(script);
};

/**
 * Compute the absolute coordinates and dimensions of an HTML element.
 * @param {!Element} element Element to match.
 * @return {!Object} Contains height, width, x, and y properties.
 * @private
 */
Code.getBBox_ = function (element) {
    const height = element.offsetHeight;
    const width = element.offsetWidth;
    let x = 0;
    let y = 0;
    do {
        x += element.offsetLeft;
        y += element.offsetTop;
        element = element.offsetParent;
    } while (element);
    return {
        height: height,
        width: width,
        x: x,
        y: y
    };
};

/**
 * User's language (e.g. "en").
 * @type {string}
 */
Code.LANG = Code.getLang();

/**
 * List of tab names.
 * @private
 */
Code.TABS_ = ['blocks', 'c', 'term']; // Added C

Code.selected = 'blocks';

/**
 * Switch the visible pane when a tab is clicked.
 * @param {string} clickedName Name of tab clicked.
 */
Code.tabClick = function (clickedName) {
    // If the XML tab was open, save and render the content.
    if (document.getElementById('tab_xml').className === 'tabon') {
        const xmlTextarea = document.getElementById('content_xml');
        const xmlText = xmlTextarea.value;
        let xmlDom = null;
        try {
            xmlDom = Blockly.Xml.textToDom(xmlText);
        } catch (e) {
            const q =
                window.confirm(MSG['badXml'].replace('%1', e));
            if (!q) {
                // Leave the user on the XML tab.
                return;
            }
        }
        if (xmlDom) {
            Code.workspace.clear();
            Blockly.Xml.domToWorkspace(xmlDom, Code.workspace);
        }
    }

    if (document.getElementById('tab_blocks').className === 'tabon') {
        Code.workspace.setVisible(false);
    }
    // Deselect all tabs and hide all panes.
    for (let i = 0; i < Code.TABS_.length; i++) {
        const name = Code.TABS_[i];
        document.getElementById('tab_' + name).className = 'taboff';
        if (name === 'blocks') {
            for (var j = 0; j < allFiles.length; j++) {
                document.getElementById(allFiles[j]).style.visibility = 'hidden';
            }
        } else {
            document.getElementById('content_' + name).style.visibility = 'hidden';
        }
    }
    // Hao Loi: turn off c_text element
    document.getElementById('c_text').style.visibility = 'hidden';
    // Select the active tab.
    Code.selected = clickedName;
    if (clickedName === 'c') {
        document.getElementById('tab_' + clickedName).className = 'tabon';
        // Show the selected pane.
        document.getElementById('content_' + clickedName).style.visibility =
            'visible';
    } else if (clickedName === 'term') {
        document.getElementById('tab_' + clickedName).className = 'tabon';
        // Show the selected pane.
        document.getElementById('content_' + clickedName).style.visibility =
            'visible';
    }
  
    if (clickedName == 'blocks') {
        document.getElementById('tab_' + clickedName).className = 'tabon';
        Code.workspace.setVisible(true);
        
        document.getElementById(currentFile).style.visibility = 'visible';
		    // Hao Loi: turn on c_text element
        document.getElementById('c_text').style.visibility = 'visible';	
        Code.attemptCodeGeneration(Blockly.C);
    }
    Code.renderContent();
    Blockly.svgResize(Code.workspace);

};

/**
 * Populate the currently selected pane with content generated from the blocks.
 */
Code.renderContent = function () {
    let content;
    if (Code.selected === 'blocks') {
        content = document.getElementById(currentFile);
    } else {
        content = document.getElementById('content_' + Code.selected);
    }
    // Initialize the pane.
    if (content.id === 'content_xml') {
        const xmlTextarea = document.getElementById('content_xml');
        const xmlDom = Blockly.Xml.workspaceToDom(Code.workspace);
        xmlTextarea.value = Blockly.Xml.domToPrettyText(xmlDom);
        xmlTextarea.focus();
    }
    if (content.id === 'content_c') {
        Code.attemptCodeGeneration(Blockly.C);
    }
    if (typeof PR == 'object') {
        PR.prettyPrint();
    }
};

/**
 * Attempt to generate the code and display it in the UI, pretty printed.
 * @param generator {!Blockly.Generator} The generator to use.
 */
Code.attemptCodeGeneration = function (generator) {

    let code;
    if (Code.checkAllGeneratorFunctionsDefined(generator) && Code.selected === 'c') {
        const content = document.getElementById('content_' + Code.selected);
        content.textContent = '';
        console.log("C tab generated code.");
        code = generator.workspaceToCode(Code.workspace);
        content.textContent = code;
        // Remove the 'prettyprinted' class, so that Prettify will recalculate.
        content.className = content.className.replace('prettyprinted', '');
    }
    if (Code.checkAllGeneratorFunctionsDefined(generator) && Code.selected === "blocks") {
        // Hao Loi: generate code to c_text element when blocks tab is selected.
        const c_text = document.getElementById('c_text');
        c_text.textContent = '';
        code = generator.workspaceToCode(Code.workspace);
        c_text.textContent = code;
        c_text.className = c_text.className.replace('prettyprinted', '');
    }

};

/**
 * Check whether all blocks in use have generator functions.
 * @param generator {!Blockly.Generator} The generator to use.
 */
Code.checkAllGeneratorFunctionsDefined = function (generator) {
    const blocks = Code.workspace.getAllBlocks(false);
    const missingBlockGenerators = [];
    for (let i = 0; i < blocks.length; i++) {
        const blockType = blocks[i].type;
        if (!generator[blockType]) {
            if (missingBlockGenerators.indexOf(blockType) === -1) {
                missingBlockGenerators.push(blockType);
            }
        }
    }

    const valid = missingBlockGenerators.length === 0;
    if (!valid) {
        const msg = 'The generator code for the following blocks not specified for ' +
            generator.name_ + ':\n - ' + missingBlockGenerators.join('\n - ');
        Blockly.alert(msg); // Assuming synchronous. No callback.
    }
    return valid;
};

/**
 * Initialize Blockly.  Called on page load.
 */
Code.init = function () {
    Code.initLanguage();

    const rtl = Code.isRtl();
    const container = document.getElementById('content_area');
    const onresize = function (e) {
        const bBox = Code.getBBox_(container);
        // Sets initial code/ workspace areas dimensions and resizes them on change.
        for (let i = 0; i < Code.TABS_.length; i++) {
            if (Code.TABS_[i] === 'blocks') {
                for (let j = 0; j < allFiles.length; j++) {
                    const el = document.getElementById(allFiles[j]);
                    el.style.top = bBox.y + 'px';
                    el.style.left = bBox.x + 'px';
                    el.style.height = bBox.height + 'px';
                    el.style.height = (2 * bBox.height - el.offsetHeight) + 'px';
                    el.style.width = bBox.width + 'px';
                    el.style.width = (2 * bBox.width - el.offsetWidth) + 'px';
                }
                // Hao Loi: add c_text box to tab_blocks.  Set c_text visible; Important
                // console.log('blocks');
                const code_area = document.getElementById('code_area');
                const bBox1 = Code.getBBox_(code_area);
                const el1 = document.getElementById('c_text');
                el1.style.top = bBox1.y + 'px';
                el1.style.left = bBox1.x + 'px';
                el1.style.height = bBox1.height + 'px';
                el1.style.height = (2 * bBox1.height - el1.offsetHeight) + 'px';
                el1.style.width = bBox1.width + 'px';
                el1.style.width = (2 * bBox1.width - el1.offsetWidth) + 'px';
                el1.style.visibility = 'visible';
            } else {
                const el2 = document.getElementById('content_' + Code.TABS_[i]);
                el2.style.top = bBox.y + 'px';
                el2.style.left = bBox.x + 'px';
                // Height and width need to be set, read back, then set again to
                // compensate for scrollbars.
                el2.style.height = bBox.height + 'px';
                el2.style.height = (2 * bBox.height - el2.offsetHeight) + 'px';
                el2.style.width = bBox.width + 'px';
                el2.style.width = (2 * bBox.width - el2.offsetWidth) + 'px';
            }
        }
        // Make the 'Blocks' tab line up with the toolbox.
        if (Code.workspace && Code.workspace.toolbox_.width) {
            document.getElementById('tab_blocks').style.minWidth =
                (Code.workspace.toolbox_.width - 38) + 'px';
            // Account for the 19 pixel margin and on each side.
        }
    };
    window.addEventListener('resize', onresize, false);

    // The toolbox XML specifies each category name using Blockly's messaging
    // format (eg. `<category name="%{BKY_CATLOGIC}">`).
    // These message keys need to be defined in `Blockly.Msg` in order to
    // be decoded by the library. Therefore, we'll use the `MSG` dictionary that's
    // been defined for each language to import each category name message
    // into `Blockly.Msg`.
    // TODO: Clean up the message files so this is done explicitly instead of
    // through this for-loop.
    for (const messageKey in MSG) {
        if (messageKey.indexOf('cat') === 0) {
            Blockly.Msg[messageKey.toUpperCase()] = MSG[messageKey];
        }
    }

    // Construct the toolbox XML, replacing translated variable names.
    var toolboxText = document.getElementById('toolbox').outerHTML;
    toolboxText = toolboxText.replace(/(^|[^%]){(\w+)}/g,
        function (m, p1, p2) {
            return p1 + MSG[p2];
        });
    var toolboxXml = Blockly.Xml.textToDom(toolboxText);

    Code.workspace = Blockly.inject('Main.cpp', {
        grid: {
            spacing: 25,
            length: 3,
            colour: '#ccc',
            snap: true
        },
        media: '../../media/',
        rtl: rtl,
        toolbox: toolboxXml,
        zoom: {
            controls: true,
            wheel: true
        }
    });
    // Hao Loi: realtime code generation.
    Code.workspace.addChangeListener(Code.generateCode);


    // Blockly.workspace.addChangeListener(Code.generateCode);
    // Add to reserved word list: Local variables in execution environment (runJS)
    // and the infinite loop detection function.
    Blockly.C.addReservedWords('code,timeouts,checkTimeout');

    Code.loadBlocks('');

    if ('BlocklyStorage' in window) {
        // Hook a save function onto unload.
        BlocklyStorage.backupOnUnload(Code.workspace);
    }

    Code.tabClick(Code.selected);

    Code.bindClick('trashButton',
        function () {
            Code.discard();
            Code.renderContent();
        });
    Code.bindClick('runButton', Code.runJS);
    // Disable the link button if page isn't backed by App Engine storage.
    const linkButton = document.getElementById('linkButton');
    if ('BlocklyStorage' in window) {
        BlocklyStorage['HTTPREQUEST_ERROR'] = MSG['httpRequestError'];
        BlocklyStorage['LINK_ALERT'] = MSG['linkAlert'];
        BlocklyStorage['HASH_ERROR'] = MSG['hashError'];
        BlocklyStorage['XML_ERROR'] = MSG['xmlError'];
        Code.bindClick(linkButton,
            function () {
                BlocklyStorage.link(Code.workspace);
            });
    } else if (linkButton) {
        linkButton.className = 'disabled';
    }

    for (let i = 0; i < Code.TABS_.length; i++) {
        const name = Code.TABS_[i];
        Code.bindClick('tab_' + name,
            function (name_) {
                return function () {
                    Code.tabClick(name_);
                };
            }
            (name));
    }
    onresize();
    Blockly.svgResize(Code.workspace);

    // Hao Loi add main block to the workspace
    const workspace = Code.workspace; // your current workspace name what you given
    const blockName = "main"; // Name of block to add

    allWorkspaces.set("Main.cpp", workspace);
    const newBlock = workspace.newBlock(blockName);
    newBlock.initSvg();
    newBlock.render();
    // move the block to the right and down by 20,50 pixels
    newBlock.moveBy(30, 50);
    // Hao Loi: simulate click on the tab_c


    //
    // Lazy-load the syntax-highlighting.
    window.setTimeout(Code.importPrettify, 1);
};


/**
 *  Simulate click tabc then click tab_blocks to generate code.
 */
Code.generateCode = function (event) {
    // Code.tabClick('c');
    // Code.tabClick('blocks');
    Code.attemptCodeGeneration(Blockly.C);
};


/**
 * Initialize the page language.
 */
Code.initLanguage = function () {
    let lang;
// Set the HTML's language and direction.
    const rtl = Code.isRtl();
    document.dir = rtl ? 'rtl' : 'ltr';
    document.head.parentElement.setAttribute('lang', Code.LANG);

    // Sort languages alphabetically.
    const languages = [];
    for (lang in Code.LANGUAGE_NAME) {
        languages.push([Code.LANGUAGE_NAME[lang], lang]);
    }
    var comp = function (a, b) {
        // Sort based on first argument ('English', 'Русский', '简体字', etc).
        if (a[0] > b[0])
            return 1;
        if (a[0] < b[0])
            return -1;
        return 0;
    };
    languages.sort(comp);
    // Populate the language selection menu.
    const languageMenu = document.getElementById('languageMenu');
    languageMenu.options.length = 0;
    for (let i = 0; i < languages.length; i++) {
        const tuple = languages[i];
        lang = tuple[tuple.length - 1];
        const option = new Option(tuple[0], lang);
        if (lang === Code.LANG) {
            option.selected = true;
        }
        languageMenu.options.add(option);
    }
    languageMenu.addEventListener('change', Code.changeLanguage, true);

    // Inject language strings.
    document.title += ' ' + MSG['title'];
    //document.getElementById('title').textContent = MSG['title'];
    document.getElementById('tab_blocks').textContent = MSG['blocks'];

    document.getElementById('linkButton').title = MSG['linkTooltip'];
    document.getElementById('runButton').title = MSG['runTooltip'];
    document.getElementById('trashButton').title = MSG['trashTooltip'];
};

/**
 * Execute the user's code.
 * Just a quick and dirty eval.  Catch infinite loops.
 */
Code.runJS = function () {
    Blockly.C.INFINITE_LOOP_TRAP = 'checkTimeout();\n';
    let timeouts = 0;
    const checkTimeout = function () {
        if (timeouts++ > 1000000) {
            throw MSG['timeout'];
        }
    };
    const code = Blockly.C.workspaceToCode(Code.workspace);
    Blockly.C.INFINITE_LOOP_TRAP = null;
    try {
        eval(code);
    } catch (e) {
        alert(MSG['badCode'].replace('%1', e));
    }
};

/**
 * Discard all blocks from the workspace.
 */
Code.discard = function () {
    const count = Code.workspace.getAllBlocks(false).length;
    if (count < 2 ||
        window.confirm(Blockly.Msg['DELETE_ALL_BLOCKS'].replace('%1', count))) {
        Code.workspace.clear();
        if (window.location.hash) {
            window.location.hash = '';
        }
    }
};

// Load the Code demo's language strings.
document.write('<script src="msg/' + Code.LANG + '.js"></script>\n');
// Load Blockly's language strings.
document.write('<script src="../../msg/js/' + Code.LANG + '.js"></script>\n');

window.addEventListener('load', Code.init);

function autoInclude(libname, BlockScope, options) {
    const libstring = 'include_' + libname;
    //save the current scope
    // let BlockScope = this;

    const librarySearch = C_Include;
    const libFound = librarySearch.search_library(this, [libstring]);


    //Create the option to automate a string library creation
    if (!libFound) {
        const automate_library = {
            text: 'include <' + libname + '>',
            enabled: true,

            callback: function () {
                const newBlock = BlockScope.workspace.newBlock(libstring);
                let ptr = BlockScope;

                while (ptr) {
                    //if we're at the top
                    if (!ptr.parentBlock_) {
                        newBlock.previousConnection.connect(ptr.previousConnection.targetConnection);
                        newBlock.nextConnection.connect(ptr.previousConnection);
                        newBlock.initSvg();
                        newBlock.render();

                        return;
                    }

                    ptr = ptr.parentBlock_;
                }

            }

        };
        options.push(automate_library);
    }
}

// Holds the name of each workspace.
var allFiles = ["Main.cpp",];
// Tracks the currently visible workspace.
var currentFile = "Main.cpp";
// Map of all the divs holding workspaces.
let allWorkspaces = new Map();

// Gets user input for name of new workspace.

function newFileName() {     
    const initialFileName = document.getElementById("fileTypeName").value;
    if (initialFileName == "") {
        window.alert("File name cannot be empty.");
        return;
    }
    const fileTypeList = document.getElementsByName("fileTypeButton");
    let fileType
    // Checks radio button for selected file type(.h/.c)
    for (let i = 0; i < fileTypeList.length; i++) {
        if (fileTypeList[i].checked === true) {
            fileType = fileTypeList[i].value;
        }
        fileTypeList[i].checked = false;
    }
    const newFileName = initialFileName + fileType;
    //check for repeat names    
    const isNameTaken = checkFileName(newFileName);
    if (isNameTaken === true || !newFileName) {
        return;
    }
    newFile(newFileName);
    hideFilePopUp('newFilePopUp');
}

// Creates a new workspace that represents a file.
function newFile(newFileName) {
    // Create new file drop down anchor tag (file access).
    const newFileTag = document.createElement('a');
    newFileTag.href = "javascript:void(0)";
    newFileTag.innerText = newFileName;
    newFileTag.id = newFileName + "_file"
    newFileTag.addEventListener('click', function () {
        makeFileVisible(newFileName)
    });
    document.getElementById("fileDropDown").appendChild(newFileTag);
    // Create new file drop down anchor tag (delete button).
    const newDeleteTag = document.createElement('a');
    newDeleteTag.href = "javascript:void(0)";
    newDeleteTag.innerText = "X";
    newDeleteTag.id = newFileName + "_del";
    newDeleteTag.addEventListener('click', function () {
        deleteFile(newFileName)
    });
    document.getElementById("fileDropDownDelete").appendChild(newDeleteTag);
    // Create new div(workspace).
    const newFileDiv = document.createElement('div');
    newFileDiv.id = newFileName;
    newFileDiv.className = "content";
    const rtl = Code.isRtl();
    document.body.insertBefore(newFileDiv, document.getElementById('content_c'));
    // Gives dimensions to new workspace.
    const container = document.getElementById('content_c');
    const bBox = Code.getBBox_(container);
    newFileDiv.style.top = bBox.y + 'px';
    newFileDiv.style.left = bBox.x + 'px';
    newFileDiv.style.height = bBox.height + 'px';
    newFileDiv.style.height = (2 * bBox.height - newFileDiv.offsetHeight) + 'px';
    newFileDiv.style.width = bBox.width + 'px';
    newFileDiv.style.width = (2 * bBox.width - newFileDiv.offsetWidth) + 'px';
    newFileDiv.style.visibility = 'visible';
    // Injects blockly into new div
    var newWorkspace = Blockly.inject(newFileDiv, {
        grid: {
            spacing: 25,
            length: 3,
            colour: '#ccc',
            snap: true
        },
        media: '../../media/',
        rtl: rtl,
        toolbox: document.getElementById('toolbox'),
        zoom: {
            controls: true,
            wheel: true
        }
    });
    allWorkspaces.set(newFileName, newWorkspace);
    allFiles.push(newFileName);
    makeFileVisible(newFileName);
}

// Indicated workspace generates c code, is resized, becomes visible, and all other workspaces become hidden.
function makeFileVisible(fileName) {
    for (let i = 0; i < allFiles.length; i++) {
        const showOrHide = document.getElementById(allFiles[i]);
        if (allFiles[i] === fileName) {
            showOrHide.style.visibility = 'visible';
            currentFile = fileName;
            document.getElementById("fileDisplayName").innerHTML = "Current File:   " + currentFile;
            Code.workspace = allWorkspaces.get(allFiles[i]);
            Code.attemptCodeGeneration(Blockly.C);
            Code.workspace.addChangeListener(Code.generateCode);
            Blockly.svgResize(Code.workspace);
        } else {
            showOrHide.visibility = 'hidden';
        }
    }
    // Simulates click on tab 'blocks'
    Code.tabClick('blocks');
}

// Checks to see if User-Entered File Name is valid.
function checkFileName(newEntry) {
    let i;
    let fileToCheck;
    let projectedNameFileType;
    const projectedName = newEntry;
    // Checks for any existing workspaces.
    if (allFiles.length > 0) {
        for (i = 0; i < allFiles.length; i++) {
            fileToCheck = allFiles[i];
            // User entered nothing.
            if (projectedName == null) {
                return true;
            }
            if (projectedName.substring(projectedName.length - 2, projectedName.length) === ".h") {
                projectedNameFileType = projectedName.substring(projectedName.length - 2, projectedName.length);
            } else if (projectedName.substring(projectedName.length - 4, projectedName.length) === ".cpp") {
                projectedNameFileType = projectedName.substring(projectedName.length - 4, projectedName.length);
            }
            // User entered file name that already exists.
            if (projectedName === fileToCheck) {
                window.alert("File name is already in use");
                return true;
            }
            // User didnt specify a file type.
            if ((projectedNameFileType !== ".h") && (projectedNameFileType !== ".cpp")) {
                window.alert("Please enter a valid file type( .h ) / ( .cpp )")
                return true;
            }
        }
        return false;
    } else {
        fileToCheck = allFiles[i];
        // User entered nothing.
        if (projectedName == null) {
            return true;
        }
        // User entered file name that already exists.
        if (projectedName.substring(projectedName.length - 2, projectedName.length) === ".h") {
            projectedNameFileType = projectedName.substring(projectedName.length - 2, projectedName.length);
        } else if (projectedName.substring(projectedName.length - 4, projectedName.length) === ".cpp") {
            projectedNameFileType = projectedName.substring(projectedName.length - 4, projectedName.length);
        }
        if (projectedName === fileToCheck) {
            window.alert("File name is already in use");

            return true;
        }
        // User didnt specify a file type.
        if ((projectedNameFileType !== ".h") && (projectedNameFileType !== ".cpp")) {
            window.alert("Please enter a valid file type( .h ) / ( .cpp )")

            return true;
        }
    }
    return false;
}

// Checks if indicated workspace exists.
function deleteFile() {
    var filesToBeDeleted = document.getElementById("deleteAllFilesCB").checked;
    var fileToBeDeleted = document.getElementById("originDeleteFileDD1").value;
    if (filesToBeDeleted == true && fileToBeDeleted != "") {
        var checker = window.confirm("Are you sure you want to delete all files? This action cannot be undone.")
        if (checker == true) {
            deleteAllFiles();
            hideFilePopUp('deleteFilePopUp');
            window.alert("All Files succesfully deleted.");
            return;
        }
        if (checker == false) {
            return;
        }
    }
    if (fileToBeDeleted != "") {
        deleteFileConfirm(fileToBeDeleted);
        hideFilePopUp('deleteFilePopUp');
        window.alert("File succesfully deleted.");
    } else {
        hideFilePopUp('deleteFilePopUp');
        window.alert("There are no files to delete.");
    }
}

// Deletes indicated workspace.
function deleteFileConfirm(fileToBeDeleted) {
    const deletedFile = document.getElementById(fileToBeDeleted);
    for (let i = 0; i < allFiles.length; i++) {
        const fileTracker = allFiles[i];
        // Finds the indicated workspace in allFiles.
        if (fileTracker === fileToBeDeleted) {
            // If the current workspace is the indicated file it switches to a different workspace.

            if ((currentFile === fileToBeDeleted) && (allFiles.length > 1)) {
                if (currentFile === allFiles[0]) {
                    currentFile = allFiles[1];
                } else {
                    currentFile = allFiles[0];
                }
            }
            if (allFiles.length == 1) {
                Code.workspace.clear();
                Code.attemptCodeGeneration(Blockly.C);
                document.getElementById('c_text').style.visibility = 'hidden';
            }
            // Removes all HTML elements associated with the indicated workspace and removes indicated workspace from the map and array.
            Code.workspace = allWorkspaces.get(allFiles[i]);
            allFiles.splice(i, 1);
            const fileButton = document.getElementById(fileToBeDeleted + "_file");
            fileButton.remove();
            deletedFile.remove();
            allWorkspaces.delete(fileTracker);
            document.getElementById("fileDisplayName").innerHTML = "Current File:   None";
            if (allFiles.length !== 0) {
                makeFileVisible(currentFile);
            }
        }
    }
}

// Deletes all HTML elements associated with any workspaces, clears the workspace array and map.
function deleteAllFiles() {
    Code.workspace.clear();
    Code.attemptCodeGeneration(Blockly.C);
    for (let i = 0; i < allFiles.length; i++) {
        const deletedFile = document.getElementById(allFiles[i]);
        Code.workspace = allWorkspaces.get(allFiles[i]);
        const fileButton = document.getElementById(allFiles[i] + "_file");
        fileButton.remove();
        deletedFile.remove();
        allWorkspaces.delete(allFiles[i]);
    }
    currentFile = "";
    allFiles = [];
    document.getElementById('c_text').style.visibility = 'hidden';
    document.getElementById("fileDisplayName").innerHTML = "Current File:   None";
}
// Displays the New File pop out box. 
function showFilePopUp(popUpShow) {
    populateDropDowns("originDeleteFileDD1");
    populateDropDowns("originCopyFileDD1");
    var popUp = document.getElementById(popUpShow);
    const toolbox = document.querySelectorAll(".blocklyToolboxDiv.blocklyNonSelectable");
    if (toolbox) {
        for (var i = 0; i < toolbox.length; i++) {
            toolbox[i].style.display = "none";
        }
    }
    popUp.style.display = "block";
    toolbox.style.display = "none";
}

// Hides the New File pop out box
function hideFilePopUp(popUpHide) {
    var popUp = document.getElementById(popUpHide);
    var toolbox = document.querySelectorAll(".blocklyToolboxDiv.blocklyNonSelectable");
    if (toolbox) {
        for (var i = 0; i < toolbox.length; i++) {
            toolbox[i].style.display = "block";
        }
    }
    popUp.style.display = "none";
}

function saveFileCheck() {
    downloadXML();
    hideFilePopUp('saveFilePopUp');
}


function renameFileChecker() {   
    var newFileName = document.getElementById("renameFileName").value;
    if (newFileName == "") {
        window.alert("File name cannot be empty.");
        return;
    }
    var newFileTypeList = document.getElementsByName("renameFileTypeButton");
    // Checks radio button for selected file type(.h/.c)
    for (var i = 0; i < newFileTypeList.length; i++) {
        if (newFileTypeList[i].checked == true) {
            var fileType = newFileTypeList[i].value;
        }
        newFileTypeList[i].checked = false;
    }
    var newFileName = newFileName + fileType;
    //check for repeat names    
    var isNameTaken = checkFileName(newFileName);
    if (isNameTaken == true || !newFileName) {
        return;
    }
    renameFile(newFileName);
    hideFilePopUp('renameFilePopUp');
}
function renameFile(newName) {
    document.getElementById("fileDisplayName").innerHTML = "Current File:   " + newName;
    var oldFileName = document.getElementById("originCopyFileDD1").value;
    Code.workspace = allWorkspaces.get(oldFileName);
    allWorkspaces.delete(oldFileName);
    for (var i = 0; i < allFiles.length; i++) {
        if (allFiles[i] == oldFileName) {
            allFiles[i] = newName;
        }
    }
    var oldFile = document.getElementById(oldFileName);
    oldFile.id = newName;
    var newFileTag = document.getElementById(oldFileName + "_file");
    newFileTag.innerText = newName;
    newFileTag.id = newName + "_file"
    newFileTag.removeAttribute("onclick");
    newFileTag.removeEventListener('click', makeFileVisible);
    newFileTag.addEventListener('click', function () { makeFileVisible(newName) });
    allWorkspaces.set(newName, Code.workspace);
    makeFileVisible(newName);  
}
function populateDropDowns(ddName) {
    var dropDown = document.getElementById(ddName);
    if (dropDown.options.length) {
        for (var i = dropDown.options.length - 1; i >= 0; i--) {
            dropDown.remove(i);
        }
    }
    for (var i = 0; i < allFiles.length; i++) {
        var newOptionName = allFiles[i];
        var newOption = document.createElement("option");
        newOption.text = newOptionName;
        newOption.value = newOptionName;
        dropDown.add(newOption);
    }
}

