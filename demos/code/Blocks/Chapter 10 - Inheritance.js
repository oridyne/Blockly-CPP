/** Set the color of blocks to beige. */
var classHue = 35;

/** Class definition block. */
Blockly.Blocks["ds_superclass"] = {
    init: function () {
		/** Adds a notch to connect up. */
        this.setPreviousStatement(true, null);
		/** Adds a notch to connect down. */
        this.setNextStatement(true, null);
		/** Sets color of the block. */
        this.setColour(classHue);
		/** Sets data structure to class. */
        this.setDataStr("isClass", true);
		/** This tooltip text appears when hovering block. */
        this.setTooltip("This block declares a class.");
		/** The Help URL directs to hyperlink when a block is right clicked and Help is selected. */
        this.setHelpUrl("http://www.cplusplus.com/doc/tutorial/classes/");

		/** Initializing variables to pass in public variable, function, function parameter, class constructor, and class constructor parameter blocks. */
        this.classVarPublic_ = [];
        this.classFuncProp_ = [];
        this.classFuncParam_ = [];
        this.classConProp_ = [];
        this.classConParam_ = [];
		this.classObjPublic_ = [];
		

		/** Initializing variables to pass in private variable, function, function parameter, class constructor, and class constructor parameter blocks. */
        this.classVarPrivate_ = [];
        this.classFuncPropPrivate_ = [];
        this.classFuncParamPrivate_ = [];
        this.classConPropPrivate_ = [];
        this.classConParamPrivate_ = [];
		this.classObjPrivate_ = [];
		
        this.classVarProtected_ = [];
        this.classFuncPropProtected_ = [];
        this.classFuncParamProtected_ = [];
        this.classConPropProtected_ = [];
        this.classConParamProtected_ = [];
		this.classObjProtected_ = [];

		/** Text input to name class. */
        this.appendDummyInput()
            .appendField("class")
            .appendField(new Blockly.FieldTextInput("myClass"), "myClassDec")
			.appendField(" {");

		/** Area for blocks to be defined in public class section. */
        this.appendDummyInput()
            .appendField("public:");
        this.appendStatementInput("statePublic")
            .setCheck(null);
			
        this.appendDummyInput()
            .appendField("protected:");
        this.appendStatementInput("stateProtected")
            .setCheck(null);			
			

		/** Area for blocks to be defined in private class section. */
        this.appendDummyInput()
            .appendField("private:");
        this.appendStatementInput("statePrivate")
            .setCheck(null);
			
        this.appendDummyInput()
            .appendField('}');
    },

	/** The onchange function is called when a block is moved or updated. */
    onchange: function () {
        this.allocateValues();
    },

	/** The allocateValues function is where we stream values into arrays. */
    allocateValues: function () {
		/** Class name updated with user input text. */
        this.getVar_ = this.getField("myClassDec").getText();

		/** Variables always being set to empty when a block is changed to prevent data from appearing when it shouldn't. */
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
		
		this.classObjPublic_ = [];
		this.classObjPrivate_ = [];
		
        this.classVarProtected_ = [];
        this.classFuncPropProtected_ = [];
        this.classFuncParamProtected_ = [];
        this.classConPropProtected_ = [];
        this.classConParamProtected_ = [];
		this.classObjProtected_ = [];

        /** Public. */
        let ptr = this.getInputTargetBlock("statePublic");
        while (ptr) {
            switch (ptr.getDataStr()) {
				/** If the block is a variable then push data. */
                case "isVar":
                    this.classVarPublic_.push(ptr.varProp_);
                    break;
					
				/** If the block is a function then push data. */
                case 'isFunc':
					if (ptr.type === 'class_function_declaration')
					{
						//constructor
						if (ptr.getVar_ === this.getVar_)
						{
							this.classConProp_.push(ptr.funcProp_);
							this.classConParam_.push(ptr.funcParam_);
						}
					} 
                    this.classFuncProp_.push(ptr.funcProp_);
                    this.classFuncParam_.push(ptr.funcParam_);
					
                    break;
            }
			
			/** If the block is a constructor then push data (including attached parameters). */
            switch (ptr.type) {
                case "class_constructor":
                    this.classConProp_.push(ptr.funcProp_);
                    this.classConParam_.push(ptr.funcParam_);
                    break;
				case "ds_object":
					this.classObjPublic_.push(ptr.objProp_);
					break;	
            }
			
            ptr = ptr.nextConnection.targetBlock();
			
        }
		
		/** Protected. */
        ptr = this.getInputTargetBlock("stateProtected");
        while (ptr) {
            switch (ptr.getDataStr()) {
				/** If the block is a variable then push data. */
                case "isVar":
                    this.classVarProtected_.push(ptr.varProp_);
                    break;
				/** If the block is a function then push data. */
                case 'isFunc':
                    this.classFuncPropProtected_.push(ptr.funcProp_);
                    this.classFuncParamProtected_.push(ptr.funcParam_);
                    break;
            }
			
			/** If the block is a constructor then push data (including attached parameters). */
            switch (ptr.type) {
                case "class_constructor":
                    this.classConPropProtected_.push(ptr.funcProp_);
                    this.classConParamProtected_.push(ptr.funcParam_);
                    break;
				case "ds_object":
					this.classObjProtected_.push(ptr.objProp_);
					break;				
            }
            ptr = ptr.nextConnection.targetBlock();
        }

        /** Private. */
        ptr = this.getInputTargetBlock("statePrivate");
        while (ptr) {
            switch (ptr.getDataStr()) {
				/** If the block is a variable then push data. */
                case "isVar":
                    this.classVarPrivate_.push(ptr.varProp_);
                    break;
				/** If the block is a function then push data. */
                case 'isFunc':
                    this.classFuncPropPrivate_.push(ptr.funcProp_);
                    this.classFuncParamPrivate_.push(ptr.funcParam_);
                    break;
            }
			
			/** If the block is a constructor then push data (including attached parameters). */
            switch (ptr.type) {
                case "class_constructor":
                    this.classConPropPrivate_.push(ptr.funcProp_);
                    this.classConParamPrivate_.push(ptr.funcParam_);
                    break;
				case "ds_object":
					this.classObjPrivate_.push(ptr.objProp_);
					break;				
            }
            ptr = ptr.nextConnection.targetBlock();
        }
    }
};

/** Class definition C code. */
Blockly.C["ds_superclass"] = function (block) {
	/** Generate public C code with helper function. */
    var codeStatePublic =
        Blockly.C.statementToCode(block, "statePublic");
	/** Generate private C code with helper function. */
    var codestatePrivate =
        Blockly.C.statementToCode(block, "statePrivate");
	var codestateProtected =
        Blockly.C.statementToCode(block, "stateProtected");
	
	
	/** Initialize variable. */
    var code = "";
	
	/** Begin class declaration with user input text; class myClass{ */
    code += "class " + this.getVar_ + " {\n";

	/** Formate public code. */
	if (codeStatePublic) {
    code += "public:\n";
    code += codeStatePublic;
	}
	
	if (codestateProtected) {
	code += "protected:\n";
	code += codestateProtected;
	}

	/** Format private code. */
	if (codestatePrivate) {
    code += "private:\n";
    code += codestatePrivate;
	}

	/** End class declaration. */
    code += "};\n";

    return code;
};

/** Class definition block. */
Blockly.Blocks["ds_subclass"] = {
    init: function () {
		/** Adds a notch to connect up. */
        this.setPreviousStatement(true, null);
		/** Adds a notch to connect down. */
        this.setNextStatement(true, null);
		/** Sets color of the block. */
        this.setColour(classHue);
		/** Sets data structure to class. */
        this.setDataStr("isClass", true);
		/** This tooltip text appears when hovering block. */
        this.setTooltip("This block declares a class.");
		/** The Help URL directs to hyperlink when a block is right clicked and Help is selected. */
        this.setHelpUrl("http://www.cplusplus.com/doc/tutorial/classes/");

		/** Initializing variables to pass in public variable, function, function parameter, class constructor, and class constructor parameter blocks. */
        this.classVarPublic_ = [];
        this.classFuncProp_ = [];
        this.classFuncParam_ = [];
        this.classConProp_ = [];
        this.classConParam_ = [];
		this.classObjPublic_ = [];
		

		/** Initializing variables to pass in private variable, function, function parameter, class constructor, and class constructor parameter blocks. */
        this.classVarPrivate_ = [];
        this.classFuncPropPrivate_ = [];
        this.classFuncParamPrivate_ = [];
        this.classConPropPrivate_ = [];
        this.classConParamPrivate_ = [];
		this.classObjPrivate_ = [];
		
        this.classVarProtected_ = [];
        this.classFuncPropProtected_ = [];
        this.classFuncParamProtected_ = [];
        this.classConPropProtected_ = [];
        this.classConParamProtected_ = [];
		this.classObjProtected_ = [];
		
		this.parentClass_ = "";

		/** Text input to name class. */
        this.appendDummyInput()
            .appendField("class")
            .appendField(new Blockly.FieldTextInput("myClass"), "myClassDec")
			.appendField(" : public ")
			.appendField(new Blockly.FieldDropdown(this.allocateDropdown.bind(this)), 'DS')
			.appendField(" {");

		/** Area for blocks to be defined in public class section. */
        this.appendDummyInput()
            .appendField("public:");
        this.appendStatementInput("statePublic")
            .setCheck(null);
			
        this.appendDummyInput()
            .appendField("protected:");
        this.appendStatementInput("stateProtected")
            .setCheck(null);		
			
		/** Area for blocks to be defined in private class section. */
        this.appendDummyInput()
            .appendField("private:");
        this.appendStatementInput("statePrivate")
            .setCheck(null);
			
        this.appendDummyInput()
            .appendField('}');
    },

	/** The onchange function is called when a block is moved or updated. */
    onchange: function () {
		this.allocateDropdown();
        this.allocateValues();
    },
	
	//just adding name of classes to the dropdown
    allocateDropdown: function () {
        var options = [["",""]];
		
        let ptr = this.parentBlock_;
        while (ptr) {
            if (ptr.type === "ds_superclass"){
               
                    options.push([ptr.getVar_, ptr.getVar_]);
            }
            ptr = ptr.parentBlock_;
        }
        return options;
    },

	/** The allocateValues function is where we stream values into arrays. */
    allocateValues: function () {
		/** Class name updated with user input text. */
        this.getVar_ = this.getField("myClassDec").getText();

		/** Variables always being set to empty when a block is changed to prevent data from appearing when it shouldn't. */
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
		
		this.classObjPublic_ = [];
		this.classObjPrivate_ = [];
		
        this.classVarProtected_ = [];
        this.classFuncPropProtected_ = [];
        this.classFuncParamProtected_ = [];
        this.classConPropProtected_ = [];
        this.classConParamProtected_ = [];
		this.classObjProtected_ = [];
		
		this.parentClass_ = this.getField("DS").getText();

        /** Public. */
        let ptr = this.getInputTargetBlock("statePublic");
        while (ptr) {
            switch (ptr.getDataStr()) {
				/** If the block is a variable then push data. */
                case "isVar":
                    this.classVarPublic_.push(ptr.varProp_);
                    break;
					
				/** If the block is a function then push data. */
                case 'isFunc':
					if (ptr.type === 'class_function_declaration')
					{
						//constructor
						if (ptr.getVar_ === this.getVar_)
						{
							this.classConProp_.push(ptr.funcProp_);
							this.classConParam_.push(ptr.funcParam_);
						}
					} 
                    this.classFuncProp_.push(ptr.funcProp_);
                    this.classFuncParam_.push(ptr.funcParam_);
					
                    break;
            }
			
			/** If the block is a constructor then push data (including attached parameters). */
            switch (ptr.type) {
                case "class_constructor":
                    this.classConProp_.push(ptr.funcProp_);
                    this.classConParam_.push(ptr.funcParam_);
                    break;
				case "ds_object":
					this.classObjPublic_.push(ptr.objProp_);
					break;	
            }
			
            ptr = ptr.nextConnection.targetBlock();
			
        }
		
		/** Protected. */
        ptr = this.getInputTargetBlock("stateProtected");
        while (ptr) {
            switch (ptr.getDataStr()) {
				/** If the block is a variable then push data. */
                case "isVar":
                    this.classVarProtected_.push(ptr.varProp_);
                    break;
				/** If the block is a function then push data. */
                case 'isFunc':
                    this.classFuncPropProtected_.push(ptr.funcProp_);
                    this.classFuncParamProtected_.push(ptr.funcParam_);
                    break;
            }
			
			/** If the block is a constructor then push data (including attached parameters). */
            switch (ptr.type) {
                case "class_constructor":
                    this.classConPropProtected_.push(ptr.funcProp_);
                    this.classConParamProtected_.push(ptr.funcParam_);
                    break;
				case "ds_object":
					this.classObjProtected_.push(ptr.objProp_);
					break;				
            }
            ptr = ptr.nextConnection.targetBlock();
        }

        /** Private. */
        ptr = this.getInputTargetBlock("statePrivate");
        while (ptr) {
            switch (ptr.getDataStr()) {
				/** If the block is a variable then push data. */
                case "isVar":
                    this.classVarPrivate_.push(ptr.varProp_);
                    break;
				/** If the block is a function then push data. */
                case 'isFunc':
                    this.classFuncPropPrivate_.push(ptr.funcProp_);
                    this.classFuncParamPrivate_.push(ptr.funcParam_);
                    break;
            }
			
			/** If the block is a constructor then push data (including attached parameters). */
            switch (ptr.type) {
                case "class_constructor":
                    this.classConPropPrivate_.push(ptr.funcProp_);
                    this.classConParamPrivate_.push(ptr.funcParam_);
                    break;
				case "ds_object":
					this.classObjPrivate_.push(ptr.objProp_);
					break;				
            }
            ptr = ptr.nextConnection.targetBlock();
        }
		
		ptr = this.parentBlock_;
		while (ptr) {
			if (ptr.getVar_ === this.parentClass_)
			{
				for (var i = 0; i < ptr.classVarProtected_.length; i++) {
					this.classVarPublic_.push(ptr.classVarProtected_[i]);
				}
				for (var i = 0; i < ptr.classVarPublic_.length; i++) {
					this.classVarPublic_.push(ptr.classVarPublic_[i]);
				}
				
				for (var i = 0; i < ptr.classFuncPropProtected_.length; i++) {
					this.classFuncProp_.push(ptr.classFuncPropProtected_[i]);
				}
				for (var i = 0; i < ptr.classFuncProp_.length; i++) {
					this.classFuncProp_.push(ptr.classFuncProp_[i]);
				}
				
				for (var i = 0; i < ptr.classFuncParamProtected_.length; i++) {
					this.classFuncParam_.push(ptr.classFuncParamProtected_[i]);
				}
				for (var i = 0; i < ptr.classFuncParam_.length; i++) {
					this.classFuncParam_.push(ptr.classFuncParam_[i]);
				}

				for (var i = 0; i < ptr.classConPropProtected_.length; i++) {
					this.classConProp_.push(ptr.classConPropProtected_[i]);
				}
				for (var i = 0; i < ptr.classConProp_.length; i++) {
					this.classConProp_.push(ptr.classConProp_[i]);
				}
				
				for (var i = 0; i < ptr.classConParamProtected_.length; i++) {
					this.classConParam_.push(ptr.classConParamProtected_[i]);
				}
				for (var i = 0; i < ptr.classConParam_.length; i++) {
					this.classConParam_.push(ptr.classConParam_[i]);
				}
				
				for (var i = 0; i < ptr.classObjProtected_.length; i++) {
					this.classObjPublic_.push(ptr.classObjProtected_[i]);
				}
				for (var i = 0; i < ptr.classObjPublic_.length; i++) {
					this.classObjPublic_.push(ptr.classObjPublic_[i]);
				}
			}
			ptr = ptr.parentBlock_;
		}
    }
};

/** Class definition C code. */
Blockly.C["ds_subclass"] = function (block) {
	/** Generate public C code with helper function. */
    var codeStatePublic =
        Blockly.C.statementToCode(block, "statePublic");
	/** Generate private C code with helper function. */
    var codestatePrivate =
        Blockly.C.statementToCode(block, "statePrivate");
	var codestateProtected =
        Blockly.C.statementToCode(block, "stateProtected");
	
	/** Initialize variable. */
    var code = "";
	
	/** Begin class declaration with user input text; class myClass{ */
    code += "class " + this.getVar_ + " : public " + this.parentClass_ + " {\n";

	/** Formate public code. */
	if (codeStatePublic) {
    code += "public:\n";
    code += codeStatePublic;
	}
	
	if (codestateProtected) {
	code += "protected:\n";
	code += codestateProtected;
	}

	/** Format private code. */
	if (codestatePrivate) {
    code += "private:\n";
    code += codestatePrivate;
	}

	/** End class declaration. */
    code += "};\n";
	
    return code;
};
