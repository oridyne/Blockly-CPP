var classHue = 35;

//Able to be inserted

Blockly.Blocks["ds_class"] = {
	init: function(){ 
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(classHue);
		this.setDataStr("isClass", true);
		this.setTooltip("This block declares a class.");
		this.setHelpUrl("http://www.cplusplus.com/doc/tutorial/classes/");
		
		this.classVarPublic_ = [];
		this.classVarPrivate_ = [];
		this.classFuncProp_ = [];
		this.classFuncParam_ = [];
		this.classConProp_ = [];
		this.classConParam_ = [];
		this.classFuncPropPrivate_ = [];
		this.classFuncParamPrivate_ = [];
		this.classConPropPrivate_ = [];
		this.classConParamPrivate_ = [];
		
		
		this.appendDummyInput()
			.appendField("class")
			.appendField(new Blockly.FieldTextInput("myClass"), "myClassDec");
			
		this.appendDummyInput()
			.appendField("public:");

			
		this.appendStatementInput("statePublic")
			.setCheck(null);
			
		this.appendDummyInput()
			.appendField("private:");
			
		this.appendStatementInput("statePrivate")
			.setCheck(null);
	},
	
	onchange: function() {
		this.allocateValues();

	},
	
	allocateValues: function() {
		this.getVar_ = this.getField("myClassDec").getText();
		
		this.classVarPublic_ = [];
		this.classVarPrivate_ = [];
		this.classFuncProp_ = [];
		this.classFuncParam_ = [];
		this.classConProp_ = [];
		this.classConParam_ = [];
		this.classFuncPropPrivate_ = [];
		this.classFuncParamPrivate_ = [];
		this.classConPropPrivate_ = [];
		this.classConParamPrivate_ = [];
		
		//public
		let ptr = this.getInputTargetBlock("statePublic");
		while (ptr) {
			switch (ptr.getDataStr()){

				case "isVar":
				this.classVarPublic_.push(ptr.varProp_);
				break;
				
				case 'isFunc':
				//If the function is not a constructor
					this.classFuncProp_.push(ptr.funcProp_);
					this.classFuncParam_.push(ptr.funcParam_);

				break;
			}

			switch (ptr.type){
				case "class_constructor":
					this.classConProp_.push(ptr.funcProp_);
					this.classConParam_.push(ptr.funcParam_);
				break;
			}
			
			
			ptr = ptr.nextConnection.targetBlock();
		}
		
		//private
		ptr = this.getInputTargetBlock("statePrivate");
		while (ptr) {
			switch (ptr.getDataStr()){
				case "isVar":
				this.classVarPrivate_.push(ptr.varProp_);
				break;

				case 'isFunc':
				//If the function is not a constructor
					this.classFuncPropPrivate_.push(ptr.funcProp_);
					this.classFuncParamPrivate_.push(ptr.funcParam_);

				break;
			}
			
			switch (ptr.type){
				case "class_constructor":
					this.classConPropPrivate_.push(ptr.funcProp_);
					this.classConParamPrivate_.push(ptr.funcParam_);
				break;
			}
			ptr = ptr.nextConnection.targetBlock();
		}
		
	}
};

Blockly.C["ds_class"] = function(block) {
	var codeStatePublic = Blockly.C.statementToCode(block, "statePublic");
	var codestatePrivate = Blockly.C.statementToCode(block, "statePrivate");
	
	var code = "";
	code += "class " + this.getVar_ + "{\n";
	
	code += "public:\n";
	code += codeStatePublic;
	
	code += "private:\n";
	code += codestatePrivate;
	
	code += "};\n";
	
	return code;
};

//Standalone block to allow set functions to be used

Blockly.Blocks['ds_member2'] = {
	init: function(){

		this.appendValueInput('valinp1').setCheck(null);

		this.setInputsInline(false);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(classHue);

		this.setTooltip("This block calls a class object");
		this.setHelpUrl("http://www.cplusplus.com/doc/tutorial/classes/");

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
		
		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else {
			this.setWarningText(null);
		}
	}

};


Blockly.C['ds_member2'] = function(block){
	var val1 =  Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);

	var code = "";

	code += val1 + ';\n';

	return code;
};

Blockly.Blocks['class_constructor'] = {
	init: function(){
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(classHue);
		this.setTooltip("This block creates constructors/ destructors.");
		this.setHelpUrl("https://www.geeksforgeeks.org/rule-of-three-in-cpp/");
		
		this.appendValueInput('valinp1')
			.appendField(new Blockly.FieldDropdown([['', ''], ['~', '~']]), 'con_type')
			.appendField('class name', 'con_name')
			.appendField('(');
		this.appendDummyInput()
			.appendField(') {');
		this.appendStatementInput("stateinp1").setCheck(null);

		this.appendDummyInput()
			.appendField('}');
		
		this.setInputsInline(true);
		
		this.paramCount_ = 0;
		
		this.isConstructor_ = true;
		
		this.isDestructor_ = false;
		
		this.constructorType_ = "";
		this.constructorName_ = "class name";
		
		this.funcProp_= [];
		this.funcParam_ = [];
		
		//info from the classes in parameters
		this.funcParamClassMembers_ = [];
	},
	
	onchange: function(){
		this.allocateVariables();
		this.allocateValues();
	},
	
	allocateValues: function(){
		var CV_manage = C_Var;
		
		this.funcParam_ = CV_manage.get.parameters(this.getInputTargetBlock('valinp1'));
		
		this.funcParamClassMembers_ = CV_manage.get.classParameterMembers(this.getInputTargetBlock('valinp1'));
		console.log(this.funcParamClassMembers_);
	},
	
	allocateVariables: function(){
		this.setFieldValue("class name", "con_name");

		
		if (this.constructorType_ != '')
		{
			this.isConstructor_ = false;
			this.isDestructor_ = true;
		}


		let ptr = this.getSurroundParent();
		
		while (ptr){
			if (ptr.getDataStr() === 'isClass'){
				this.setFieldValue(ptr.getVar_, 'con_name');
				break;				
			}
			
			ptr = ptr.getSurroundParent();
		}
		
		this.constructorType_ = this.getFieldValue('con_type');
		this.constructorName_ = this.getFieldValue('con_name');
	}
};

Blockly.C['class_constructor'] = function(block) {
	var stateinp1 = Blockly.C.statementToCode(block, 'stateinp1');
	
	var val1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);

	
	var code = "";
	
	code += block.constructorType_;
	
	code += block.constructorName_;
	
	code += '(';
	
	code += val1;
	
	code += ')';
	
	code += '{\n';

	code += stateinp1;

	code += '}\n';
	
	return code;
};


Blockly.Blocks['class_parameters'] = {
	init: function() {
		
		this.pPtrs_ = [
			["", ""], 
			["&", "&"]
		];
		
		this.appendValueInput('valinp1')
			.appendField(new Blockly.FieldDropdown([['', ''], ['const', 'const']]), 'const')
			.appendField(new Blockly.FieldDropdown(this.allocateDropdown.bind(this)), 'type')
			.appendField(new Blockly.FieldDropdown(this.pPtrs_), 'ptr')
			.appendField(new Blockly.FieldTextInput('param'), 'var');
		
    	this.setInputsInline(false);

		this.setPreviousStatement(false);
		this.setNextStatement(false);

    	this.setOutput(true);
    	this.setColour(classHue);
		this.setTooltip("");
		this.setHelpUrl("");

		/**
		 * Parameter properties
		 * 
		 * [0] = constant | boolean
		 * 
		 * [1] = type | string
		 * 
		 * [2] = pointers/dereferences | string
		 * 
		 * [3] = name | string
		 * 
		 * [4] = is initialized | boolean
		 */
		this.paramProp_ = [false, "", "" ,"", true];
		
		this.classVarPublic_ = [];
		this.classFuncProp_ = [];
		this.classFuncParam_ = [];
	},
	
	onchange: function(){
		this.allocateValues();
		this.allocateVariables();
		this.allocateWarnings();
	},
	
	allocateValues: function(){
		this.isConst_ = (this.getFieldValue('const') === 'const')
		this.typeName_ = this.getField('type').getText();
		console.log(this.typeName_);
		this.addPtr_ = this.getField('ptr').getText();
		this.getVar_ = this.getField('var').getText();

		this.paramProp_[0] = this.isConst_;
		this.paramProp_[1] = this.typeName_;
		this.paramProp_[2] = this.addPtr_;
		this.paramProp_[3] = this.getVar_;
		//Default initialization to true
		this.paramProp_[4] = true;

		this.classVarPublic_ = [];
		this.classFuncProp_ = [];
		this.classFuncParam_ = [];



	},
	
	allocateVariables: function() {		
		let ptr = this.parentBlock_;
		
		while (ptr){		
		console.log(ptr.getDataStr());
		console.log(this.typeName_ + " " + ptr.getVar_);
			if (ptr.getDataStr() === 'isClass' && this.typeName_ === ptr.getVar_){
				this.classVarPublic_ = ptr.classVarPublic_;
				this.classFuncProp_ = ptr.classFuncProp_;
				this.classFuncParam_ = ptr.classFuncParam_;
				console.log(this.classVarPublic_);
				console.log(this.classFuncProp_);
				console.log(this.classFuncParam_);
			}
			ptr = ptr.parentBlock_;
		}		
	},

	allocateDropdown: function(){
		var options = [["",""]];
		
		let ptr = this.parentBlock_;
		
		while (ptr){
			if (ptr.getDataStr() === 'isClass'){
				
				options.push([ptr.getVar_, ptr.getVar_]);
			}
			ptr = ptr.parentBlock_;
		}
		
		return options;
	},


	allocateWarnings: function(){
		var TT = "";
		
		let ptr = this.getSurroundParent();
		
		if(!this.parentBlock_){
			TT += 'Error, parameter block must be connected to a parameter block or a constructor block.\n';
		}
		else if(ptr.type !== "func_parameters" && ptr.type !== "user_function" && ptr.type !== "class_constructor"){
			TT += 'Error, parameter block must be connected to a parameter block or a constructor block.\n';
		}

		
		
		
		
		if(TT.length > 0){
			this.setWarningText(TT);
		}
		else{
			this.setWarningText(null);
		}
	}

};

Blockly.C['class_parameters'] = function(block){
	var val = Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_ATOMIC);
	var code = "";
	
	var std = '';
	
	var C = C_Include;
	if(!C.using.std(this) && this.typeName_ === 'string'){
		std = 'std::';
	}
	
	if(this.getVar_.length > 0){
		
		if(this.isConst_){
			code += 'const ';
		}
		
		code += std + this.typeName_ + this.addPtr_ + ' ' + this.getVar_;
	}
	
	if(val.length > 0){
		code += ', ' + val;
	}

	return [code, Blockly.C.ORDER_NONE];
};
