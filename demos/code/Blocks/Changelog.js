'use strict';

//Function for readme button
function updateLog(){
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


//function to load
function readFile(input){

	let files = input.files;
	if (window.confirm("Replace existing files?")) {
		deleteAllFiles();
		var j = 0;
	}
	else {
		var j = allFiles.length;
	}
	for (var i = 0; i < files.length; i++) {
		let file = input.files[i];
		let reader = new FileReader();
		reader.readAsText(file);
		var fileName = file.name;
		fileName = fileName.substring(0, (fileName.length - 4)) ;
		newFile(fileName);

		reader.onload = function () {
			j++
			Code.workspace = allWorkspaces.get(allFiles[j-1]);
			let saveXML = reader.result;
			let textToDom = Blockly.Xml.textToDom(saveXML);
			Blockly.Xml.domToWorkspace(textToDom, Code.workspace);
        }
		reader.onerror = function () {
			console.log(reader.error);
		};
	}
}



//Function to save
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
		var codeBlob = new Blob(codeArray, { type: "text/plain;charset=utf-8" });
		saveAs(codeBlob, allFiles[i] + ".xml");
	}
}
function saveAs(Blob, fName) {
	if (window.navigator.msSaveOrOpenBlob) {
		window.navigator.msSaveOrOpenBlob(Blob, fName);
	}
	else {
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










