const pointerHue = 200;

/* Pointer Declaration */

Blockly.Blocks['pointer_declare'] = {
	init: function() {
		// HELPER VARIABLES
		this.pointerTypes_ = [
			["int", "int"],
			["size_t", "size_t"],
			["double", "double"],
			["char", "char"],
			["string", "string"],
			["bool", "bool"],
			["short", "short"],
			["long", "long"],
			["long long", "long long"]
		];
		this.setDataStr("isVar", true);
		this.isPointer_ = true;

		// BLOCKLY PROPERTIES
		this.setColour(pointerHue);
		this.setTooltip("Pointer declaration\n\nConstant");
		this.setHelpUrl("https://www.cplusplus.com/doc/tutorial/pointers/");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);

		// INPUT
		// OUTPUT <-- BLOCK <-- INPUT
		this.appendValueInput("valueInput")
			.appendField(new Blockly.FieldDropdown([["",""], ["const","const"]]),
				"const")
			.appendField(new Blockly.FieldDropdown(this.pointerTypes_),
				"type")
			.appendField(" * ")
			.appendField(new Blockly.FieldTextInput('myPointer'),
				'name')
			.appendField(" = ")
			.setCheck(null);

		// OUTPUT
		// OUTPUT <-- BLOCK <-- INPUT
		this.setOutput(false);
	},

	onchange: function(){
		this.allocateValues();
		this.allocateWarnings();
	},

	allocateValues: function(){
		// Get values from block
		this.const_ = ( this.getFieldValue('const') === 'const' );
		this.type_ = this.getField('type').getText();
		this.identifier_ = this.getField('name').getText();
		// The variables below are used across the project for variable declarations
		// I opted to use the proper descriptors 'type' and 'identifier' for pointer declarations
		// I'm still setting these here to be compatible with variable blocks that use these variables
		this.typeName_ = this.getField('type').getText();
		this.getVar_ = this.getField('name').getText();

		// Set properties of block
		this.isInitialized_ = false;
		this.value_ = "";
		this.isNull_ = false;
		this.ptrLevel_ = 0;

		let inputBlock = this.getInputTargetBlock('valueInput');
		let inputBlockCode = Blockly.C.valueToCode(this, 'valueInput', Blockly.C.ORDER_ATOMIC);
		
		if(inputBlock){
			this.value_ = inputBlock.value_;

			//If it's null
			this.isNull_ = inputBlock.isNull_;
		}

		if(inputBlockCode.length > 0){
			this.isInitialized_ = true;
		}

		if(this.type_ === "string"){
			this.size_ = this.value_.length;
		}

		//Array with variable properties
		this.varProp_ = [];
		this.varProp_[0] = this.const_;
		this.varProp_[1] = this.type_;
		this.varProp_[2] = this.identifier_;
	},

	allocateWarnings: function(){
		let warningText = "";

		let identifierFormatOk = C_Logic.logic.variable_format(this.identifier_);
		if(identifierFormatOk !== true){
			for(let i = 1; i < identifierFormatOk.length; ++i){
				warningText += identifierFormatOk[i];
			}
		}

		let inputBlock = this.getInputTargetBlock('valueInput');
		if(inputBlock){
			warningText += C_Logic.logic.type_check(this.type_, inputBlock.type_);
		}

		let parentBlock = this.parentBlock_;
		while(parentBlock){
			if(parentBlock.getDataStr() === "isVar" && parentBlock.identifier_ === this.identifier_){
				warningText += 'Error, variable "' + this.identifier_ + '" has already been declared in this scope.\n';
				break;
			}
			parentBlock = parentBlock.parentBlock_;
		}

		if(this.type_ === "string"){
			let libFound = C_Include.search_library(this, ['include_iostream', 'include_string']);
			if(!libFound){
				warningText += "Error, <iostream> or <string> library must be included.\n";
			}
		}

		if(warningText !== "") {
			this.setWarningText(warningText);
		}
		else {
			this.setWarningText(null);
		}
	},

	customContextMenu: function(options){
		//save the current scope
		let BlockScope = this;

		var librarySearch = C_Include;
		var libFound = librarySearch.search_library(this, ['include_string']);

		//Create the option to automate a string library creation
		if(this.type_ === "string" && !libFound){
			automate_library_string = {
				text: "include <string>",
				enabled: true,

				callback: function(){
					var newBlock = BlockScope.workspace.newBlock('include_string');
					let ptr = BlockScope;

					while(ptr){
						//if we're at the top
						if(!ptr.parentBlock_){
							newBlock.previousConnection.connect(ptr.previousConnection.targetConnection);
							newBlock.nextConnection.connect(ptr.previousConnection);
							newBlock.initSvg();
							newBlock.render();

							return;
						}

						ptr = ptr.parentBlock_;
					}

				}

			}
			options.push(automate_library_string);
		}

	}

};
Blockly.C['pointer_declare'] = function(block) {
	let inputBlock = block.getInputTargetBlock('valueInput');
	let code = '';

	if (block.const_) {
		code += 'const ';
	}

	if (block.type_ === 'string' && !C_Include.using.std(block)){
		code += "std::";
	}

	code += block.type_ + " * " + block.identifier_;

    if (inputBlock) {
    	return code += " = " + Blockly.C.valueToCode(block, 'valueInput', Blockly.C.ORDER_ATOMIC) + ";\n";
	} else {
		return code += " = NULL;\n";
	}

};

/* Pointer Initialization */

Blockly.Blocks['pointer_getter'] = {
	init: function() {
		// HELPER VARIABLES
		this.paramNames_ = [["", ""]];
		this.isPointer_ = true;

		this.appendDummyInput()
			.appendField(new Blockly.FieldDropdown(this.allocateDropdown.bind(this)), "VAR");
		this.setOutput(true, null);
		this.setColour(pointerHue);
		this.setTooltip("Pointer variable getter");
		this.setHelpUrl("");

		this.paramCount_ = 0;

		//value
		this.value_ = "";

		//If this is a const
		this.isConst_ = false;

		//If the main variable has been initialized
		this.isInitialized_ = false;

		//If this block gets a variable
		this.isGetter_ = true;

		this.isInClass_ = false;

	},

	onchange: function(){
		this.allocateValues();
		this.allocateVariableParameters();

		this.allocateVariables();

		this.allocateScope();
		this.allocateWarnings();
	},

	allocateVariables: function(){
		let options = [];
		options.push(["", ""]);

		//Previous declaration
		let parentBlock = this.parentBlock_;
		while(parentBlock){

			switch(parentBlock.getDataStr()){
				case 'isVar':
					if (parentBlock.isPointer_ === true) {
						options.push([parentBlock.identifier_, parentBlock.identifier_]);
					}
					this.paramCount_ = parentBlock.paramCount_;
					break;
			}
			parentBlock = parentBlock.parentBlock_;
		}

		parentBlock = this.getSurroundParent();
		while(parentBlock){
			switch(parentBlock.type){

				case 'loop_for':
				case 'loop_range':
					options.push([parentBlock.getVar_, parentBlock.getVar_]);
					if(this.getVar_ === parentBlock.getVar_){
						this.typegetVar_ = parentBlock.typegetVar_;
					}
					break;
			}
			parentBlock = parentBlock.getSurroundParent();
		}

		for(let i = 0; i < options.length; ++i){
			this.paramNames_.push(options[i]);
		}
	},

	allocateVariableParameters: function(){
		var options = [];
		options.push(["", ""]);

		//Loop through to get function variables
		let ptr = this.getSurroundParent();

		while(ptr){

			switch( ptr.getDataStr() ){
				case 'isFunc':

					if(ptr.funcParam_){

						//Loop through the function array to get the names of parameters
						for(var i = 0; i < ptr.funcParam_.length; ++i){
							options.push([ptr.funcParam_[i][3], ptr.funcParam_[i][3]]);

							if(this.getVar_ === ptr.funcParam_[i][3]){
								this.isConst_ = ptr.funcParam_[i][0];
								this.typegetVar_ = ptr.funcParam_[i][1];
							}
						}

					}

					break;

				case 'isStruct':

					for(var i = 0; i < ptr.classVar_.length; ++i){
						options.push([ptr.classVar_[i][3], ptr.classVar_[i][3]]);
					}

					break;

				case 'isClass':



					break;
			}

			ptr = ptr.getSurroundParent();
		}

		for(var i = 0; i < options.length; ++i){
			this.paramNames_.push(options[i]);
		}

	},

	allocateScope: function(){

		//Get Scope variable

		let ptr = this.getSurroundParent();

		while(ptr){

			switch(ptr.getDataStr()){
				case 'isFunc':

					for(var i = 0; ptr.paramCount_ && i < ptr.paramCount_; ++i){
						(ptr && ptr.paramNames_[i]) ? (this.paramNames_.push([ptr.paramNames_[i], ptr.paramNames_[i]])) : (0);
					}

					break;
			}

			ptr = ptr.getSurroundParent();
		}

	},

	/**
	 * stream through the blocks to find the one we need,
	 * then stream the information such as type
	 */
	allocateValues: function(){
		this.getVar_ = this.getFieldValue('VAR');
		this.typegetVar_ = "";
		this.value_ = "";
		this.isConst_ = false;
		this.ptrType_ = "";
		this.isNull_ = false;
		this.paramNames_ = [["", ""]];
		this.isInClass_ = false;

		//Check function parameters using getSurroundParent()
		let ptr = this.getSurroundParent();

		while(ptr){
			switch(ptr.getDataStr()){
				case 'isFunc':
					//get values from function parameter
					if(ptr.funcParam_){
						for(var i = 0; i < ptr.funcParam_.length; ++i){
							if(this.getVar_ === ptr.funcParam_[i][3]){
								this.isConst_ = ptr.funcParam_[i][0];
								this.typegetVar_ = ptr.funcParam_[i][1];
								this.ptrType_ = ptr.funcParam_[i][2];
								this.isInitialized_ = ptr.funcParam_[i][4];
							}
						}
					}
					break;
				case 'isStruct':
					for(var i = 0; i < ptr.classVar_.length; ++i){
						if(this.getVar_ === ptr.classVar_[i][3]){
							this.isConst_ = ptr.classVar_[i][0];
							this.typegetVar_ = ptr.classVar_[i][1];
							this.ptrType_ = ptr.classVar_[i][2];
							this.isInClass_ = true;
						}
					}
					break;
				case 'isClass':
					break;
			}

			ptr = ptr.getSurroundParent();
		}

		//Set typegetVar_
		ptr = this.parentBlock_;
		while(ptr){

			switch(ptr.getDataStr()){
				case 'isVar':

					//Stream data from var declaration block
					if(this.getVar_ === ptr.getVar_){

						this.typegetVar_ = ptr.typegetVar_;
						//stream input value
						this.value_ = ptr.value_;

						this.isInitialized_ = ptr.isInitialized_;

						this.isNull_ = ptr.isNull_;

						this.ptrType_ = ptr.ptrType_;

						//stream const option
						this.isConst_ = ptr.isConst_;

						return;
					}

					break;
			}



			ptr = ptr.parentBlock_;
		}
	},

	allocateDropdown: function(){
		//Delete any repeating elements in the 2d array
		var temp = [];
		var temp2 = [];

		//grab the data from the matrix
		for(var i = 0; i < this.paramNames_.length; ++i){
			temp.push(this.paramNames_[i][1]);
		}

		this.paramNames_ = [];

		for(var i = 0; i < temp.length; ++i){
			if(temp2.indexOf(temp[i]) == -1){
				temp2.push(temp[i]);
			}
		}

		for(var i = 0; i < temp2.length; ++i){
			this.paramNames_.push([temp2[i], temp2[i]]);
		}

		return this.paramNames_;
	},

	allocateWarnings: function(){
		var TT = "";
		C = C_Logic;

		if(!this.parentBlock_){
			TT += "Block warning, this block has a return and must be connected.\n";
		}

		//Errors if a variable exists
		if(this.getVar_.length > 0){

			var currentVarFound = false;

			for(var i = 1; i < this.paramNames_.length; ++i){
				if(this.getFieldValue('VAR') === this.paramNames_[i][1]){
					currentVarFound = true;
					break;
				}
			}

			if(this.isInClass_){
				let ptr = this.getSurroundParent();

				while(ptr){
					switch(ptr.getDataStr()){
						case 'isStruct':

							for(var i = 0; i < ptr.classVar_.length; ++i){
								if(this.getVar_ === ptr.classVar_[i][3]){
									currentVarFound = true;
									break;
								}
							}

							break;
					}
					ptr = ptr.getSurroundParent();
				}

			}


			if(!currentVarFound){
				TT += 'Block warning, variable "' + this.getVar_ + '" is not declared in this scope.\n';
			}
		}

		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	}

};
Blockly.C['pointer_getter'] = function(block) {
	let code = '';
	code += this.getVar_;
	return [code, Blockly.C.ORDER_NONE];
};

Blockly.Blocks['pointer_reference'] = {
	init: function() {

		this.paramNames_ = [["", ""]];
		this.isPointer_ = true;

		this.appendDummyInput()
			.appendField("&")
			.appendField(new Blockly.FieldDropdown(this.allocateDropdown.bind(this)), "VAR");
		this.setOutput(true, null);
		this.setColour(pointerHue);
		this.setTooltip("A block to get memory of variable");
		this.setHelpUrl("");

		this.paramCount_ = 0;

		//value
		this.value_ = "";

		//If this is a const
		this.isConst_ = false;

		//If the main variable has been initialized
		this.isInitialized_ = false;

		//If this block gets a variable
		this.isGetter_ = true;

		this.isInClass_ = false;

	},

	onchange: function(){
		this.allocateValues();
		this.allocateVariableParameters();

		this.allocateVariables();

		this.allocateScope();
		this.allocateWarnings();
	},

	allocateVariables: function(){
		let C = C_Logic;

		var options = [];
		options.push(["", ""]);

		//Previous declaration
		let ptr = this.parentBlock_;

		while(ptr){

			switch(ptr.getDataStr()){
				case 'isVar':
					if (ptr.isPointer_ != true) {
						options.push([ptr.getVar_, ptr.getVar_]);
					}

					this.paramCount_ = ptr.paramCount_;

					break;
			}

			ptr = ptr.parentBlock_;
		}

		ptr = this.getSurroundParent();

		while(ptr){
			switch(ptr.type){

				case 'loop_for':
				case 'loop_range':
					options.push([ptr.getVar_, ptr.getVar_]);

					if(this.getVar_ === ptr.getVar_){
						this.typegetVar_ = ptr.typegetVar_;
					}

					break;
			}

			ptr = ptr.getSurroundParent();
		}

		for(var i = 0; i < options.length; ++i){
			this.paramNames_.push(options[i]);
		}
	},

	allocateVariableParameters: function(){
		var options = [];
		options.push(["", ""]);

		//Loop through to get function variables
		let ptr = this.getSurroundParent();

		while(ptr){

			switch( ptr.getDataStr() ){
				case 'isFunc':

					if(ptr.funcParam_){

						//Loop through the function array to get the names of parameters
						for(let i = 0; i < ptr.funcParam_.length; ++i){
							options.push([ptr.funcParam_[i][3], ptr.funcParam_[i][3]]);

							if(this.getVar_ === ptr.funcParam_[i][3]){
								this.isConst_ = ptr.funcParam_[i][0];
								this.typegetVar_ = ptr.funcParam_[i][1];
							}
						}
					}
					break;

				case 'isStruct':

					for(let i = 0; i < ptr.classVar_.length; ++i){
						options.push([ptr.classVar_[i][3], ptr.classVar_[i][3]]);
					}
					break;

				case 'isClass':
					break;
			}

			ptr = ptr.getSurroundParent();
		}

		for(let i = 0; i < options.length; ++i){
			this.paramNames_.push(options[i]);
		}

	},

	allocateScope: function(){

		//Get Scope variable

		let ptr = this.getSurroundParent();

		while(ptr){

			switch(ptr.getDataStr()){
				case 'isFunc':

					for(var i = 0; ptr.paramCount_ && i < ptr.paramCount_; ++i){
						(ptr && ptr.paramNames_[i]) ? (this.paramNames_.push([ptr.paramNames_[i], ptr.paramNames_[i]])) : (0);
					}

					break;
			}

			ptr = ptr.getSurroundParent();
		}

	},

	/**
	 * stream through the blocks to find the one we need,
	 * then stream the information such as type
	 */
	allocateValues: function(){
		this.getVar_ = this.getFieldValue('VAR');
		this.typegetVar_ = "";
		this.value_ = "";
		this.isConst_ = false;
		this.ptrType_ = "";
		this.isNull_ = false;
		this.paramNames_ = [["", ""]];
		this.isInClass_ = false;

		//Check function parameters using getSurroundParent()
		let ptr = this.getSurroundParent();

		while(ptr){
			switch(ptr.getDataStr()){
				case 'isFunc':
					//get values from function parameter
					if(ptr.funcParam_){
						for(var i = 0; i < ptr.funcParam_.length; ++i){
							if(this.getVar_ === ptr.funcParam_[i][3]){
								this.isConst_ = ptr.funcParam_[i][0];
								this.typegetVar_ = ptr.funcParam_[i][1];
								this.ptrType_ = ptr.funcParam_[i][2];
								this.isInitialized_ = ptr.funcParam_[i][4];
							}
						}
					}
					break;
				case 'isStruct':
					for(var i = 0; i < ptr.classVar_.length; ++i){
						if(this.getVar_ === ptr.classVar_[i][3]){
							this.isConst_ = ptr.classVar_[i][0];
							this.typegetVar_ = ptr.classVar_[i][1];
							this.ptrType_ = ptr.classVar_[i][2];
							this.isInClass_ = true;
						}
					}
					break;
				case 'isClass':
					break;
			}

			ptr = ptr.getSurroundParent();
		}

		//Set typegetVar_
		ptr = this.parentBlock_;
		while(ptr){

			switch(ptr.getDataStr()){
				case 'isVar':

					//Stream data from var declaration block
					if(this.getVar_ === ptr.getVar_){

						this.typegetVar_ = ptr.typegetVar_;
						//stream input value
						this.value_ = ptr.value_;

						this.isInitialized_ = ptr.isInitialized_;

						this.isNull_ = ptr.isNull_;

						this.ptrType_ = ptr.ptrType_;

						//stream const option
						this.isConst_ = ptr.isConst_;

						return;
					}

					break;
			}



			ptr = ptr.parentBlock_;
		}
	},

	allocateDropdown: function(){
		//Delete any repeating elements in the 2d array
		var temp = [];
		var temp2 = [];

		//grab the data from the matrix
		for(var i = 0; i < this.paramNames_.length; ++i){
			temp.push(this.paramNames_[i][1]);
		}

		this.paramNames_ = [];

		for(var i = 0; i < temp.length; ++i){
			if(temp2.indexOf(temp[i]) == -1){
				temp2.push(temp[i]);
			}
		}

		for(var i = 0; i < temp2.length; ++i){
			this.paramNames_.push([temp2[i], temp2[i]]);
		}

		return this.paramNames_;
	},

	allocateWarnings: function(){
		var TT = "";
		C = C_Logic;

		if(!this.parentBlock_){
			TT += "Block warning, this block has a return and must be connected.\n";
		}

		//Errors if a variable exists
		if(this.getVar_.length > 0){

			var currentVarFound = false;

			for(var i = 1; i < this.paramNames_.length; ++i){
				if(this.getFieldValue('VAR') === this.paramNames_[i][1]){
					currentVarFound = true;
					break;
				}
			}

			if(this.isInClass_){
				let ptr = this.getSurroundParent();

				while(ptr){
					switch(ptr.getDataStr()){
						case 'isStruct':

							for(var i = 0; i < ptr.classVar_.length; ++i){
								if(this.getVar_ === ptr.classVar_[i][3]){
									currentVarFound = true;
									break;
								}
							}

							break;
					}
					ptr = ptr.getSurroundParent();
				}

			}


			if(!currentVarFound){
				TT += 'Block warning, variable "' + this.getVar_ + '" is not declared in this scope.\n';
			}
		}

		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	}

};
Blockly.C['pointer_reference'] = function(block) {
	var code = '';
	code += '&' + this.getVar_;
	return [code, Blockly.C.ORDER_NONE];
};

Blockly.Blocks['pointer_null'] = {
	init: function() {
		this.appendDummyInput()
			.appendField("NULL");
		this.setOutput(true);
		this.setColour(pointerHue);
		this.setTooltip("NULL is 0 (zero) i.e. integer constant zero with C-style typecast to void*");
		this.setHelpUrl("");

		this.isNull_ = true;
	},

	onchange: function(){
		this.allocateWarnings();
		this.allocateValues();
	},

	allocateValues: function(){
		this.getVar_ = "NULL";
		this.isPointer_ = true;
	},

	allocateWarnings(){
		var TT = "";

		if(!this.parentBlock_){
			TT += "Block warning, this block as a return and must be connected.\n";
		}
		//
		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}

	}
};
Blockly.C['pointer_null'] = function() {
	let code = 'NULL';
	return [code, Blockly.C.ORDER_NONE];
};

Blockly.Blocks['pointer_nullptr'] = {
	init: function() {
		this.appendDummyInput()
			.appendField("nullptr");
		this.setOutput(true);
		this.setColour(pointerHue);
		this.setTooltip("nullptr is prvalue of type nullptr_t, which is an integer literal that evaluates to zero");
		this.setHelpUrl("");

		this.isNull_ = true;

	},

	onchange: function(){
		this.allocateValues();
		this.allocateWarnings();
	},

	allocateValues: function(){
		this.getVar_ = "nullptr";
		this.isPointer_ = true;
	},

	allocateWarnings(){
		var TT = "";

		if(!this.parentBlock_){
			TT += "Block warning, this block as a return and must be connected.\n";
		}

		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}


	}
};
Blockly.C['pointer_nullptr'] = function() {
	let code = 'nullptr';
	return [code, Blockly.C.ORDER_NONE];
};

/* Pointer Operators */

Blockly.Blocks['pointer_operator'] = {
	init: function() {
		// BLOCK PROPERTIES
		this.setColour(pointerHue);
		this.setTooltip("C++ provides two pointer operators, which are Address of Operator (&) and Indirection Operator (*)");
		this.setHelpUrl("https://www.tutorialspoint.com/cplusplus/cpp_pointer_operators.htm");

		// INPUT
		this.appendValueInput("valueInput")
			// Check the type of the the value input
			.setCheck(null)
			.appendField(new Blockly.FieldDropdown([["&","&"], ["*","*"]]),
				"pointerOperator");

		// OUTPUT
		this.setOutput(true, null);
	},

	onchange: function(){
		this.allocateValues();
		this.allocateWarnings();
	},

	allocateValues: function() {
		let inputBlock = this.getInputTargetBlock('valueInput');
		if (inputBlock) {
			this.typeName_ = inputBlock.typeName_;
		}
		this.pointerOperator_ = this.getFieldValue('pointerOperator');
	},

	allocateWarnings: function(){
		let warningText = "";

		let inputBlock = this.getInputTargetBlock('valueInput');
		if (inputBlock) {
			if (inputBlock.getDataStr() === "isArr" && this.pointerOperator_ === "&") {
				warningText += "Error, cannot dereference an array."
			}
		}

		if(warningText !== ""){
			this.setWarningText(warningText);
		}
		else {
			this.setWarningText(null);
		}
	}
};
Blockly.C['pointer_operator'] = function(block) {
	// Get the value input block code
	var valueInputCode = Blockly.C.valueToCode(block, 'valueInput', Blockly.C.ORDER_ATOMIC);
	// Construct code
	var code = block.pointerOperator_ + valueInputCode;
	this.getVar_ = code;
	return [code, Blockly.C.ORDER_NONE];
};