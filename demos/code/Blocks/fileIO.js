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
/// TODO fix class methods not being included correctly
async function readFiles(input) {
    let wasFileDeleted = 0;
    let i;
    let fileName;
    switch(yesNoCancelLoadBtn) {
        case "Cancel":
            return;
        // Checks if user wants to clear existing workspaces.
        case "Yes":
            deleteAllFiles()
            break;
        // Checks if workspace names are already in use and removes existing if true.
        case "No":
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
            break;
        case "default":
            return;
    }
    let files = input.files;
    for (i = 0; i < files.length; i++) {
        let file = input.files[i];
        let saveXMLPromise = file.text();
        /// Reads files contents into new workspaces.
        saveXMLPromise.then(saveXML => {
            fileName = file.name;
            fileName = fileName.substring(0, (fileName.length - 4));
            newFile(fileName);
            let textToDom = Blockly.Xml.textToDom(saveXML.toString());
            Blockly.Xml.domToWorkspace(textToDom, Code.workspace);
            input.value = '';
            allWorkspaces.forEach(workspace => {
                workspace.getAllBlocks().forEach(block => {
                    if (block.onchange) {
                        block.onchange();
                    }
                });
            });
        });
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










