/** Author: Joseph Pauplis
 * 	Version: 0.1
 */

/*TODO:
	How to access current file name
	Set current file name for define/include blocks
	Create a way to pass information between workspaces
	



*/

var includeHUE = 125;
//Define a header file
Blockly.Blocks['define_file'] = {
		init: function () {
		/** Adds a notch to connect up. */
		this.setPreviousStatement(true, null);
		/** Adds a notch to connect down. */
		this.setNextStatement(true, null);
		/** Sets color of the block. */
		this.setColour(includeHUE);
		/** This tooltip text appears when hovering block. */
		this.setTooltip("");
		/** The Help URL directs to hyperlink when a block is right clicked and Help is selected. */
		this.setHelpUrl("");
		
		//append text areas
		this.appendDummyInput()
			.appendField("#ifndef")
			.appendField("FILE_H", "ifndefText");
		
		this.appendDummyInput()
			.appendField("#define")
			.appendField("FILE_H", "defineText");
			
        this.appendStatementInput("statementInput").setCheck(null);
		
        this.appendDummyInput()
            .appendField("#endif");
			
		//hold all of the info from the class (already held just push in from declaration)
		this.classVarPublic_ = [];
        this.classFuncProp_ = [];
        this.classFuncParam_ = [];
        this.classConProp_ = [];
        this.classConParam_ = [];
		
		this.classVarPrivate_ = [];
        this.classFuncPropPrivate_ = [];
        this.classFuncParamPrivate_ = [];
        this.classConPropPrivate_ = [];
        this.classConParamPrivate_ = [];
		
		this.className_ = 'FILE_H';
	},
	
	onchange: function () {
		this.allocateValues();
	},
	
	allocateValues: function () {
		//TODO: Get the workspace's current file name to replace default <file name>
		this.setFieldValue(currentFile, "ifndefText");
		this.setFieldValue(currentFile, "defineText");
		this.className_ = currentFile;
		
		this.classVarPublic_ = [];
        this.classFuncProp_ = [];
        this.classFuncParam_ = [];
        this.classConProp_ = [];
        this.classConParam_ = [];
		
		this.classVarPrivate_ = [];
        this.classFuncPropPrivate_ = [];
        this.classFuncParamPrivate_ = [];
        this.classConPropPrivate_ = [];
        this.classConParamPrivate_ = [];
		
		//only get info from the class declaration block, probably add include here later
		let ptr = this.getInputTargetBlock("statementInput");
		while (ptr) {
			if (ptr.type !== "ds_class") {
				break;
			}
			this.classVarPublic_.push(ptr.classVarPublic_);
			this.classFuncProp_.push(ptr.classFuncProp_);
			this.classFuncParam_.push(ptr.classFuncParam_);
			this.classConProp_.push(ptr.classConProp_);
			this.classConParam_.push(ptr.classConParam_);
			
			this.classVarPrivate_.push(ptr.classVarPrivate_);
			this.classFuncPropPrivate_.push(ptr.classFuncPropPrivate_);
			this.classFuncParamPrivate_.push(ptr.classFuncParamPrivate_);
			this.classConPropPrivate_.push(ptr.classConPropPrivate_);
			this.classConParamPrivate_.push(ptr.classConParamPrivate_);
			
			ptr = ptr.nextConnection.targetBlock();
		}
		const CV_manage = C_Var;
		const currentWorkspace = allWorkspaces.get(this.className_);
		const currWorkspaceXML = Blockly.Xml.workspaceToDom(currentWorkspace);
		const nodeList = currWorkspaceXML.getElementsByTagName("block");
		for(let i = 0; i < nodeList.length; i++) {
			const typeName = nodeList.item(i).getAttribute("type");
			if( typeName === "define_file") {
				CV_manage.get.saveClassInfo(this);
			}
		}
	}
};

//c code
Blockly.C['define_file'] = function (block) {
    var statementCode = 
		Blockly.C.statementToCode(block, "statementInput");
	
	var code = "";
    code += "#ifndef " + this.className_ + "\n";
	code += "#define " + this.className_ + "\n";
	code += statementCode;
	code += "#endif " + "\n";
    return code;
};

//Include a header file
Blockly.Blocks['include_file'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("#include file.h");
			
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(includeHUE);
        this.setTooltip("");
        this.setHelpUrl("");
		
    }
};

//Translate to C code output on right.
Blockly.C['include_file'] = function (block) {
    // TODO: Assemble C into code variable.

    var code = "#include file.h\n";
    return code;
};



