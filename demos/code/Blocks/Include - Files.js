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
        this.setDataStr("isClass", true);
		
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
		this.getVar_;
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
			this.classVarPublic_ = (ptr.classVarPublic_);
			this.classFuncProp_ = (ptr.classFuncProp_);
			this.classFuncParam_ = (ptr.classFuncParam_);
			this.classConProp_ = (ptr.classConProp_);
			this.classConParam_ = (ptr.classConParam_);
			
			this.classVarPrivate_ = (ptr.classVarPrivate_);
			this.classFuncPropPrivate_ = (ptr.classFuncPropPrivate_);
			this.classFuncParamPrivate_ = (ptr.classFuncParamPrivate_);
			this.classConPropPrivate_ = (ptr.classConPropPrivate_);
			this.classConParamPrivate_ = (ptr.classConParamPrivate_);
			
			this.getVar_ = ptr.getVar_;
			
			break;
		}
		
		var CV_manage = C_Var;
		CV_manage.get.saveClassInfo(this);
		console.log(this.getVar_);
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
            .appendField("#include ")
			.appendField(new Blockly.FieldDropdown(this.allocateDropdown.bind(this)), "classDropdown");
			
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(includeHUE);
        this.setTooltip("");
        this.setHelpUrl("");
        this.setDataStr("isClass", true);
		
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
		this.getVar_;
    },
	
    allocateDropdown: function () {
        var options = [["", ""]];

		/** add list of defined classes from map to dropdown to select from */
		if (classArrayList !== 0){
			for(var i =0; i < classArrayList.length; i++) { 
				options.push([classArrayList[i].className_, classArrayList[i].className_]);
			}
	
        return options;
		}
	},
	
	onchange: function () {
		this.allocateValues();
	},
	
	allocateValues: function () {
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
		
		this.className_ = this.getField('classDropdown').getText();
		
		var ptr;
		if (classArrayList !== 0) {
			for(var i =0; i < classArrayList.length; i++) { 
				if (classArrayList[i].className_ === this.getField('classDropdown').getText()) {
					ptr = classArrayList[i];
					break;
				}
			}
		}
		
		if (ptr) {
			this.classVarPublic_ = (ptr.classVarPublic_);
			this.classFuncProp_ = (ptr.classFuncProp_);
			this.classFuncParam_ = (ptr.classFuncParam_);
			this.classConProp_ = (ptr.classConProp_);
			this.classConParam_ = (ptr.classConParam_);
			
			this.classVarPrivate_ = (ptr.classVarPrivate_);
			this.classFuncPropPrivate_ = (ptr.classFuncPropPrivate_);
			this.classFuncParamPrivate_ = (ptr.classFuncParamPrivate_);
			this.classConPropPrivate_ = (ptr.classConPropPrivate_);
			this.classConParamPrivate_ = (ptr.classConParamPrivate_);
			
			this.getVar_ = ptr.getVar_;
		}
		console.log(this);
		console.log(ptr);
		console.log(this.getVar_);
		console.log(ptr.getVar_);
	}
};

//Translate to C code output on right.
Blockly.C['include_file'] = function (block) {
    // TODO: Assemble C into code variable.

    var code = "#include file.h\n";
    return code;
};



