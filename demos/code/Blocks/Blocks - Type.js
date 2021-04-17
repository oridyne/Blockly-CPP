
//A block that can be used for types
Blockly.Blocks['get_type'] = {
	init: function() {
		
		this.types = [
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
		
		this.appendDummyInput()
			.appendField(new Blockly.FieldDropdown(this.types), 'type');
		
		this.setOutput(true);
		this.setColour(0);
		this.setTooltip("text");
		this.setHelpUrl("");
		
		//If this block gets a variable
		this.isGetter_ = true;
	},
	
	onchange: function(){
		this.allocateValues();
		this.allocateWarnings();
	},
	
	allocateValues: function(){
		this.typeName_ = this.getFieldValue('type');
	},
	
	allocateWarnings: function(){
		var TT = "";

		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	}
};
Blockly.C['get_type'] = function(block) {
	var code = '';

	code += this.typeName_;
	
	return [code, Blockly.C.ORDER_NONE];
};

//A block that can be used for any type
Blockly.Blocks['get_input'] = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldTextInput(""), "input");
		
		this.setOutput(true);
		this.setColour(stringHUE);
		this.setTooltip("This block is used for text in a printf.");
		this.setHelpUrl("");
	},
	
	onchange: function(){

		this.allocateValues();
		this.allocateWarnings();
	},

	allocateValues: function(){
		this.value_ = this.getField('input').getText();
	},

	allocateWarnings: function(){
		var TT = "";

		if(!this.parentBlock_){
			TT += 'Block warning, this block has a return and must be connected.\n';
		}
		else {
			if(this.parentBlock_.type !== "printf"){
				TT += 'Block Error, this block is used for printf text.\n';
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
Blockly.C['get_input'] = function(block) {
	var code = '';

	code += this.value_;
	
	return [code, Blockly.C.ORDER_NONE];
};

Blockly.Blocks['get_var'] = {
	init: function() {

		this.paramNames_ = [["", ""]];
		
		this.appendDummyInput()
			.appendField(new Blockly.FieldDropdown(this.allocateDropdown.bind(this)),
				"VAR");
		this.setOutput(true, null);
		this.setColour(variableHUE);
		this.setTooltip("A block to get variables.");
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
						this.typeName_ = ptr.typeName_;
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
						for(var i = 0; i < ptr.funcParam_.length; ++i){
							options.push([ptr.funcParam_[i][3], ptr.funcParam_[i][3]]);
							
							if(this.getVar_ === ptr.funcParam_[i][3]){
								this.isConst_ = ptr.funcParam_[i][0];
								this.typeName_ = ptr.funcParam_[i][1];
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
		this.typeName_ = "";
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
							if(this.get_var_ === ptr.funcParam_[i][3]){
								this.isConst_ = ptr.funcParam_[i][0];
								this.typeName_ = ptr.funcParam_[i][1];
								this.ptrType_ = ptr.funcParam_[i][2];
								this.isInitialized_ = ptr.funcParam_[i][4];
							}
						}
					}
					break;
				case 'isStruct':
					for(var i = 0; i < ptr.classVar_.length; ++i){
						if(this.get_var_ === ptr.classVar_[i][3]){
							this.isConst_ = ptr.classVar_[i][0];
							this.typeName_ = ptr.classVar_[i][1];
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

		//Set typeName_
		ptr = this.parentBlock_;
		while(ptr){
			
			switch(ptr.getDataStr()){
				case 'isVar':
				
				//Stream data from var declaration block
				if(this.get_var_ === ptr.get_var_){

					this.typeName_ = ptr.typeName_;
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
Blockly.C['get_var'] = function(block) {
	var code = '';
	
	for(var i = 0; i < this.ptrLevel_; ++i){
		code += '*';
	}
	
	code += this.getVar_;
	
	return [code, Blockly.C.ORDER_NONE];
};

Blockly.Blocks['get_func_void'] = {
	init: function(){

		this.appendValueInput('valinp1').setCheck(null);

		this.setInputsInline(false);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(funcHUE);

		this.setTooltip("A block used for void functions.");
		this.setHelpUrl("");

	},

	onchange: function(){
		this.allocateBlock();
		this.allocateWarnings();
	},

	allocateBlock: function(){
		let block = this.getInputTargetBlock('valinp1');

		if(block){
			block.setColour(this.getColour());
			block.setMovable(false);
			block.setDeletable(false);
		}
	},
	
	allocateWarnings: function(){
		var TT = "";
		
		let block = this.getInputTargetBlock('valinp1');
		
		if(block){
			if(block.typeName_ !== "void"){
				TT += 'Warning, non-void function return is ignored.\n';
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
Blockly.C['get_func_void'] = function(block){
	var val1 =  Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);

	var code = "";

	code += val1 + ';\n';

	return code;
};

// Mutator blocks for the mutator
Blockly.Blocks['get_func_mutator'] = {
	init: function(){
		this.setColour(funcHUE);
		this.appendDummyInput().appendField('parameters');
		this.appendStatementInput('STACK');

		this.setPreviousStatement(false);
		this.setNextStatement(false);
		this.setTooltip('');
		this.contextMenu = false;
	}
};
Blockly.Blocks['get_func_add'] = {
	init: function(){
		this.setColour(funcHUE);
		this.appendDummyInput().appendField('add');
		
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip('');
		this.contextMenu = false;
	}
};

Blockly.Blocks['get_num'] = {
	init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldNumber(0), "NUM");

		this.setOutput(true, null);
		this.setColour(230);
		this.setTooltip("");
		this.setHelpUrl("");

		//The value
		this.value_ = "";
		//The type
		this.typeName_ = "int";
	},
	
	/**
	 * Is called upon every change
	 */
	onchange: function(){

		this.allocateValues();
		this.allocateWarnings();
	},
	/**
	 * Sets all the variables needed
	 */
	allocateValues: function(){
		// Added by David Hazell (SP21)
		this.type_ = "int";
		//the user inputted value to be updated.
		this.value_ = this.getField('NUM').getText();
		this.typeName_ = "int";

		//parse into a float, parseInt is tautological
		var valueInt = parseFloat(this.value_);

		//Deduce its type, never assume size_t can be 0,
		//because it's used to measure containers.
		//A container can never be 0 unless it is 
		//uncreated or uninitialized.

		if(valueInt % 1 == 0){
			this.typeName_ = "int";
		}
		else {
			this.typeName_ = "double";
		}
		
		
	},
	/**
	 * Sets all the warnings
	 */
	allocateWarnings: function(){
		var TT = "";
		
		//If there is a non number somewhere
		for(var i = 0; i < this.value_.length; ++i){
			if( !( this.value_[i] >= '0' && this.value_[i] <= '9' )){
				if( ( this.value_[i] !== '-' && this.value_[i] !== '.' ) ){
					TT += "Error, this input must contain only numbers.\n";
					break;
				}
			}
		}
		
		//If this block's return is not connected
		if(this.parentBlock_ === null){
			TT += 'Block warning, this block has a return and must be connected.\n';
		}

		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	}
};
Blockly.C['get_num'] = function(block) {
	var code = '';

	code += this.value_;

	return [code, Blockly.C.ORDER_NONE];
};

Blockly.Blocks['get_char'] = {
	init: function() {
		this.appendDummyInput()
			.appendField("'")
			.appendField(new Blockly.FieldTextInput("a"), "myChar")
			.appendField("'");

		this.setOutput(true, null);
		this.setColour(stringHUE);
		this.setTooltip("");
		this.setHelpUrl("");

		//The value
		this.value_ = "";
		//The type
		this.typeName_ = "char";
	},
	
	/**
	 * Is called upon every change
	 */
	onchange: function(){

		this.allocateValues();
		this.allocateWarnings();
	},
	
	/**
	 * Sets all the variables needed
	 */
	allocateValues: function(){
		
		//Get input from myChar
		this.value_ = this.getFieldValue("myChar");
	},
	
	/**
	 * Sets all the warnings
	 */
	allocateWarnings: function(){
		var TT = "";
		
		let C = C_Logic;
		
		//Char formatting warnings and errors
		TT += C.logic.char_format(this.value_);
		
		//If this block's return is not connected
		if(!this.parentBlock_){
			TT += 'Block warning, this block has a return and must be connected.\n';
		}

		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	}
};
Blockly.C['get_char'] = function(block) {
	
	var code = "'" + this.value_ + "'";
	

	return [code, Blockly.C.ORDER_NONE];
};

Blockly.Blocks['get_str'] = {
	init: function() {
		this.appendDummyInput()
			.appendField('"')
			.appendField(new Blockly.FieldTextInput("str"), "myStr")
			.appendField('"');

		this.setOutput(true, null);
		this.setColour(stringHUE);
		this.setTooltip("");
		this.setHelpUrl("");

		//The value
		this.value_ = "";
		//The type
		this.typeName_ = "string";
	},
	
	/**
	 * Is called upon every change
	 */
	onchange: function(){

		this.allocateValues();
		this.allocateWarnings();
	},
	/**
	 * Sets all the variables needed
	 */
	allocateValues: function(){
		this.value_ = this.getFieldValue("myStr");
	},
	
	/**
	 * Sets all the warnings
	 */
	allocateWarnings: function(){
		var TT = "";
		
		let C = C_Logic;
		
		//String format warnings and errors
		TT += C.logic.string_format(this.value_);
		
		//If this block's return is not connected
		if(!this.parentBlock_){
			TT += 'Block warning, this block has a return and must be connected.\n';
		}

		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	}
};
Blockly.C['get_str'] = function(block) {
	
	var code = '"' + this.value_ + '"';
	
	return [code, Blockly.C.ORDER_NONE];
};

Blockly.Blocks['get_arr'] = {
	init: function() {
		
		this.paramNames_ = [["", ""]];
		
		this.appendDummyInput()
			.appendField(new Blockly.FieldDropdown(this.allocateDropdown.bind(this)), "VAR");
		this.setOutput(true, null);
		this.setColour(arrayHUE);
		this.setTooltip("");
		this.setHelpUrl("");
		
		this.typeName_ = "";
		this.get_var_ = "";
		
		this.paramCount_ = 0;

		this.isInitialized_ = false;
		this.size_ = 0;
		
		this.objArr_ = [];
		
		//If this block gets a variable
		this.isGetter_ = true;
	},
	
	onchange: function(){
		
		let block = this.parentBlock_;
		
		//If the left block is a ds_member block
		if(block){
			if(block.type === "ds_member" || (block.parentBlock_ && block.parentBlock_.type === "ds_member") ){
				this.allocateMembers();
			}
			else {
				this.allocateVariables();
			}
		}
		else {
			this.paramNames_ = [["", ""]];
		}
	
		
		this.allocateType();
		this.allocateValues();
		this.allocateWarnings();
	},

	allocateValues: function(){
		this.get_var_ = "";

		if(this.getFieldValue('VAR') && this.getFieldValue('VAR').length > 0){
			this.get_var_ = this.getFieldValue('VAR');
		}

	},
	
	allocateVariables: function(){
		var options = [];
		
		options.push(["", ""]);
		
		//Previous declaration
		
		let ptr = this.parentBlock_;
		
		while(ptr){
			
			if(this.get_var_ === ptr.get_var_){
				this.isInitialized_ = ptr.isInitialized_;
				this.size_ = ptr.size_;
			}

			switch(ptr.getDataStr()){
				case 'isArr':
				
				(ptr && ptr.get_var_ ) ? (options.push([ptr.get_var_, ptr.get_var_])) : (0);

				break;
				
				case 'isVar':

				(ptr && ptr.typeName_ === "string" ) ? 
					(options.push([ptr.get_var_, ptr.get_var_]))
					: (0);

				break;
			}
			
			ptr = ptr.parentBlock_;
		}
		this.paramNames_ = options;

	},
	
	allocateMembers: function(){
		var options = [];
		options.push(["", ""]);
		
		let ptr = this.parentBlock_;
		
		var j = 1;
		
		while(ptr){
			
			if(ptr.type === "ds_member"){
				this.objArr_ = ptr.classArr_;
				for(var i = 0; ptr.classArr_ && i < ptr.classArr_.length; ++i){
					options.push([ptr.classArr_[i][3], ptr.classArr_[i][3]]);
				}
				j++;
			}
			
			
			if(j > 2){
				break;
			}
			
			ptr = ptr.parentBlock_;
		}
		
		this.paramNames_ = options;
	},

	allocateType: function(){
		//Set typeName_
		let ptr = this.parentBlock_;
		while(ptr){
			
			switch(ptr.getDataStr()){
				case 'isArr':
				
				if(this.get_var_ === ptr.get_var_){
					this.typeName_ = ptr.typeName_;
					return;
				}

				break;

			}
			
			ptr = ptr.parentBlock_;
		}
	},
	
	allocateDropdown: function(){
		return this.paramNames_;
	},
	
	allocateWarnings: function(){
		var TT = "";
		
		if(!this.parentBlock_){
			TT += "Block warning, this block has a return and must be connected.\n";
		}

		if(this.size_ < 1){
			//TT += 'Warning, attempting to return uninitialized array "' + this.get_var_ + '".\n';
		}
		
		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	}
	
};
Blockly.C['get_arr'] = function(block) {
	var code = '';
	
	code += this.get_var_;
	
	return [code, Blockly.C.ORDER_NONE];
};

Blockly.Blocks['get_vec'] = {
	init: function() {
		
		this.paramNames_ = [["", ""]];
		
		this.appendDummyInput()
			.appendField(new Blockly.FieldDropdown(this.allocateDropdown.bind(this)), "VAR");
		
		this.setOutput(true, null);
		this.setColour(vectorHUE);
		this.setTooltip("");
		this.setHelpUrl("");
		
		this.typeName_ = "";
		this.get_var_ = "";
		
		this.paramCount_ = 0;

		this.isInitialized_ = false;
		
		//If this block gets a variable
		this.isGetter_ = true;
		
		//this.setMovable(false);
		//this.setDeletable(false);
	},
	
	onchange: function(){
		
		this.allocateValues();
		this.allocateVariables();
		this.allocateWarnings();
	},
	
	allocateValues: function(){

		if(this.getFieldValue('VAR') && this.getFieldValue('VAR').length > 0){
			this.get_var_ = this.getFieldValue('VAR');
		}
		else {
			this.get_var_ = "";
		}
		
	},

	allocateVariables: function(){
		var options = [];
		
		options.push(["", ""]);
		
		//Previous declaration
		
		let ptr = this.parentBlock_;
		
		while(ptr){
			
			if(this.get_var_ === ptr.get_var_){
				this.isInitialized_ = ptr.isInitialized_;
			}

			switch(ptr.getDataStr()){
				case 'isVec':
				
				(ptr && ptr.get_var_ ) ? (options.push([ptr.get_var_, ptr.get_var_])) : (0);

				break;
			}
			
			ptr = ptr.parentBlock_;
		}
		this.paramNames_ = options;
		
		this.allocateType();

	},

	allocateType: function(){
		//Set typeName_
		let ptr = this.parentBlock_;
		while(ptr){
			
			switch(ptr.getDataStr()){
				case 'isVec':
				
				if(this.get_var_ === ptr.get_var_){
					this.typeName_ = ptr.typeName_;
					return;
				}

				break;
			}
			
			ptr = ptr.parentBlock_;
		}
	},
	
	allocateDropdown: function(){
		return this.paramNames_;
	},
	
	allocateWarnings: function(){
		var TT = "";
		
		if(!this.parentBlock_){
			TT += "Block warning, this block has a return and must be connected.\n";
		}
		
		if(this.parentBlock_ == null){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	}
	
};
Blockly.C['get_vec'] = function(block) {
	var code = '';
	
	code += this.get_var_;
	
	return [code, Blockly.C.ORDER_NONE];
};

Blockly.Blocks['get_objects'] = {
	init: function() {
		
		this.paramNames_ = [["", ""]];
		
		this.appendDummyInput()
			.appendField(new Blockly.FieldDropdown(this.allocateDropdown.bind(this)), "VAR");
		
		
		
		this.setOutput(true, null);
		this.setColour(classHue);
		this.setTooltip("");
		this.setHelpUrl("");
		
		this.typeName_ = "";
		this.get_var_ = "";
		
		this.paramCount_ = 0;

		this.isInitialized_ = false;
		
		//If this block gets a variable
		this.isGetter_ = true;
	},
	
	onchange: function(){
		
		this.allocateValues();
		this.allocateVariables();
		this.allocateWarnings();
	},
	
	allocateValues: function(){
		this.typeName_ = this.getFieldValue('VAR');
	},

	allocateVariables: function(){
		var options = [];
		
		options.push(["", ""]);
		
		//Previous declaration
		
		let ptr = this.parentBlock_;
		
		while(ptr){
			
			switch(ptr.getDataStr()){
				case 'isStruct':
				case 'isClass':
				
				options.push([ptr.get_var_, ptr.get_var_]);
				
				break;
			}
			
			ptr = ptr.parentBlock_;
		}
		this.paramNames_ = options;
	},
	
	allocateDropdown: function(){
		return this.paramNames_;
	},
	
	allocateWarnings: function(){
		var TT = "";
		
		if(!this.parentBlock_){
			TT += "Block warning, this block has a return and must be connected.\n";
		}
		
		if(this.parentBlock_ == null){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	}
	
};
Blockly.C['get_objects'] = function(block) {
	var code = '';
	
	code += this.typeName_;
	
	return [code, Blockly.C.ORDER_NONE];
};






















