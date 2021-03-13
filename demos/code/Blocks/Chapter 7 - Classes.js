var classHue = 35;

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
		
		//public
		let ptr = this.getInputTargetBlock("statePublic");
		while (ptr) {
			switch (ptr.getDataStr()){

				case "isVar":
				this.classVarPublic_.push(ptr.varProp_);
				break;
				
				case 'isFunc':
				//If the function is not a constructor
				if(!ptr.isConstructor_){
					this.classFuncProp_.push(ptr.funcProp_);
					this.classFuncParam_.push(ptr.funcParam_);
				}
				//If the function is a constructor
				else{
					this.classConProp_.push(ptr.funcProp_);
					this.classConParam_.push(ptr.funcParam_);
				}
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
				if(!ptr.isConstructor_){
					this.classFuncProp_.push(ptr.funcProp_);
					this.classFuncParam_.push(ptr.funcParam_);
				}
				//If the function is a constructor
				else{
					this.classConProp_.push(ptr.funcProp_);
					this.classConParam_.push(ptr.funcParam_);
				}
				break;
			}
			ptr = ptr.nextConnection.targetBlock();
		}
		
		console.log(this.classVarPublic_);		
		console.log(this.classVarPrivate_);
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



