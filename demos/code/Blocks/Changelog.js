'use strict';

//Function for readme button
function updateLog() {
    var code = Blockly.C.workspaceToCode(Blockly.getMainWorkspace());
    document.getElementById('code').value = code;
}


//Function to download code
function downloadCode() {
    var code = Blockly.C.workspaceToCode();
    var codeArray = [];
    codeArray.push(code);

    var codeBlob = new Blob(codeArray, {type: "text/plain;charset=utf-8"});
    saveAs(codeBlob, "main.cpp");
}

var yesNoCancelLoadBtn = 'Cancel';

//function to load
function readFile(input) {
    if (yesNoCancelLoadBtn == 'Cancel') {
        return;
    }
    let files = input.files;
    // Checks if user wants to clear existing workspaces.
    if (yesNoCancelLoadBtn == 'Yes') {
        deleteAllFiles();
        var filesToRead = 0;
    } else if (yesNoCancelLoadBtn == 'No') {
        // Checks if workspace names are already in use and removes existing if true.
        do {
            var wasFileDeleted = 0;
            for (var i = 0; i < files.length; i++) {
                for (var j = 0; j < allFiles.length; j++) {
                    let file = input.files[i];
                    var fileName = file.name;
                    fileName = fileName.substring(0, (fileName.length - 4));
                    var existingFile = allFiles[j];
                    if (fileName == existingFile) {
                        deleteFileConfirm(fileName);
                        wasFileDeleted++;
                    }
                }
            }
        } while (wasFileDeleted != 0);
        var filesToRead = allFiles.length;
    }
    for (var i = 0; i < files.length; i++) {
        let file = input.files[i];
        let reader = new FileReader();
        reader.readAsText(file);
        var fileName = file.name;
        fileName = fileName.substring(0, (fileName.length - 4));
        newFile(fileName);
        /// Reads files contents into new workspaces.
        reader.onload = function () {
            filesToRead++
            Code.workspace = allWorkspaces.get(allFiles[filesToRead - 1]);
            let saveXML = reader.result;
            let textToDom = Blockly.Xml.textToDom(saveXML);
            Blockly.Xml.domToWorkspace(textToDom, Code.workspace);
            input.value = '';
        }
        reader.onerror = function () {
            console.log(reader.error);
        };
    }
}


// Reads code from workspace into XML.
function downloadXML() {
    //Grab the workspace XML
    for (var i = 0; i < allFiles.length; i++) {
        Code.workspace = allWorkspaces.get(allFiles[i]);
        let codeXML = Blockly.Xml.workspaceToDom(Code.workspace);
        //Prettify the XML
        let saveXML = Blockly.Xml.domToPrettyText(codeXML);
        var codeArray = [];
        codeArray.push(saveXML);
        console.log(Code.workspace);
        console.log(saveXML);
        var codeBlob = new Blob(codeArray, {type: "text/plain;charset=utf-8"});
        saveAs(codeBlob, allFiles[i] + ".xml");
    }
}

// Saves XML blob
function saveAs(Blob, fName) {
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(Blob, fName);
    } else {
        var saveFileTag = document.createElement('a');
        var saveFileTagName = window.URL.createObjectURL(Blob);
        saveFileTag.href = saveFileTagName;
        saveFileTag.download = fName;
        document.body.appendChild(saveFileTag);
        saveFileTag.click();
        window.URL.revokeObjectURL(saveFileTagName);
        document.body.removeChild(saveFileTag);
    }
}










