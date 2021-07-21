'use strict';

/**
 *Function for readme button
 */
function updateLog() {
    document.getElementById('code').value = Blockly.C.workspaceToCode(Blockly.getMainWorkspace());
}

/**
 * Function to download code
 */
function downloadCode() {
    const code = Blockly.C.workspaceToCode(Blockly.getMainWorkspace());
    const codeArray = [];
    codeArray.push(code);

    const codeBlob = new Blob(codeArray, {type: "text/plain;charset=utf-8"});
    saveAs(codeBlob, "main.cpp");
}

let yesNoCancelLoadBtn = 'Cancel';

/**
 * Reads input files and adds them to active workspaces
 * @param input
 */
function readFiles(input) {
    let wasFileDeleted = 0;
    let filesToRead;
    let i;
    let fileName;
    if (yesNoCancelLoadBtn === 'Cancel') {
        return;
    }
    let files = input.files;
    // Checks if user wants to clear existing workspaces.
    if (yesNoCancelLoadBtn === 'Yes') {
        deleteAllFiles();
        filesToRead = 0;
    } else if (yesNoCancelLoadBtn === 'No') {
        // Checks if workspace names are already in use and removes existing if true.
        while (wasFileDeleted !== 0) {
            wasFileDeleted = 0;
            for (i = 0; i < files.length; i++) {
                for (let j = 0; j < allFiles.length; j++) {
                    let file = input.files[i];
                    fileName = file.name;
                    fileName = fileName.substring(0, (fileName.length - 4));
                    const existingFile = allFiles[j];
                    if (fileName === existingFile) {
                        deleteFileConfirm(fileName);
                        wasFileDeleted++;
                    }
                }
            }
        }
        filesToRead = allFiles.length;
    }
    for (i = 0; i < files.length; i++) {
        let file = input.files[i];
        let reader = new FileReader();
        reader.readAsText(file);
        fileName = file.name;
        fileName = fileName.substring(0, (fileName.length - 4));
        newFile(fileName);
        /// Reads files contents into new workspaces.
        reader.onload = function () {
            filesToRead++
            let currFile = allFiles[filesToRead - 1];
            Code.workspace = allWorkspaces.get(currFile);
            currentFile = currFile;
            let saveXML = reader.result;
            let textToDom = Blockly.Xml.textToDom(saveXML.toString());
            Blockly.Xml.domToWorkspace(textToDom, Code.workspace);
            input.value = '';
            console.log("current file is " + currFile);
            const nodeList = textToDom.getElementsByTagName("block");
            for(let i = 0; i < nodeList.length; i++) {
                let currItem = nodeList.item(i);
                const typeName = currItem.getAttribute("type");
                if (typeName === "define_file") {
                    if (!classList.has(currFile)) {
                        nodeList.item(i).className = currFile;
                        currItem = nodeList.item(i);
                        allWorkspaces.get(currFile).getBlockById(currItem.id).onchange();
                    }
                }
                else if(typeName === "include_file") {
                    allWorkspaces.get(currFile).getBlockById(currItem.id).onchange();
                }
            }
        }
        reader.onerror = function () {
            console.log(reader.error);
        };
    }
}


/**
 * Reads code from workspace into XML.
 */
function downloadXML() {
    //Grab the workspace XML
    for (let i = 0; i < allFiles.length; i++) {
        Code.workspace = allWorkspaces.get(allFiles[i]);
        let codeXML = Blockly.Xml.workspaceToDom(Code.workspace);
        //Prettify the XML
        let saveXML = Blockly.Xml.domToPrettyText(codeXML);
        const codeArray = [];
        codeArray.push(saveXML);
        console.log(Code.workspace);
        console.log(saveXML);
        const codeBlob = new Blob(codeArray, {type: "text/plain;charset=utf-8"});
        saveAs(codeBlob, allFiles[i] + ".xml");
    }
}

/**
 * Saves XML blob
 * @param Blob blob to save
 * @param fName filename
 */
function saveAs(Blob, fName) {
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(Blob, fName);
    } else {
        const saveFileTag = document.createElement('a');
        const saveFileTagName = window.URL.createObjectURL(Blob);
        saveFileTag.href = saveFileTagName;
        saveFileTag.download = fName;
        document.body.appendChild(saveFileTag);
        saveFileTag.click();
        window.URL.revokeObjectURL(saveFileTagName);
        document.body.removeChild(saveFileTag);
    }
}










