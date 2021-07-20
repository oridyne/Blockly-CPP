/** Author: Joseph Pauplis
 * 	Version: 1.0
 */

/** Set the color of blocks to beige. */
var classHue = 35;

/** Class definition block. */
Blockly.Blocks["ds_class"] = {
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
Blockly.C["ds_class"] = function (block) {
	/** Generate public C code with helper function. */
    var codeStatePublic =
        Blockly.C.statementToCode(block, "statePublic");
	/** Generate private C code with helper function. */
    var codestatePrivate =
        Blockly.C.statementToCode(block, "statePrivate");
	
	/** Initialize variable. */
    var code = "";
	
	/** Begin class declaration with user input text; class myClass{ */
    code += "class " + this.getVar_ + " {\n";

	if (codeStatePublic) {
	/** Formate public code. */
    code += "public:\n";
    code += codeStatePublic;}

	if (codestatePrivate) {
	/** Format private code. */
    code += "private:\n";
    code += codestatePrivate;}

	/** End class declaration. */
    code += "};\n";

    return code;
};

/** Class object block #2 with next & previous statements allowing placement and void functions to be called. */
Blockly.Blocks['ds_member2'] = {
    init: function () {
		/** Adds a notch to connect right. */
        this.appendValueInput('valinp1').setCheck(null);
		/** Blocks will appear connected across one line  */
        this.setInputsInline(false);
		/** Adds a notch to connect up. */
        this.setPreviousStatement(true);
		/** Adds a notch to connect down. */
        this.setNextStatement(true);
		/** Sets data structure to class. */
        this.setColour(classHue);
		/** This tooltip text appears when hovering block. */
        this.setTooltip("This block declares a class.");
		/** The Help URL directs to hyperlink when a block is right clicked and Help is selected. */
        this.setHelpUrl("http://www.cplusplus.com/doc/tutorial/classes/");
    },

	/** The onchange function is called when a block is moved or updated. */
    onchange: function () {
        this.allocateBlock();
        this.allocateWarnings();
    },

	/** The allocateBlock function creates a class object block and attaches it, functionally allowing it to be placed independantly, thus calling void functions. */
    allocateBlock: function () {
        let block = this.getInputTargetBlock('valinp1');
        if (block) {
            block.setColour(this.getColour());
			/** Don't let the user ruin this. */
            block.setMovable(false);
            block.setDeletable(false);
        }
    },

	/** The allocateWarnings function adds "!" and text popup when hovored with warning text. */
    allocateWarnings: function () {
		//TODO: add warnings
        var TT = "";

        let block = this.getInputTargetBlock('valinp1');

		/** If there are warnings, then display them. */
        if (TT.length > 0) {
            this.setWarningText(TT);
        } else {
            this.setWarningText(null);
        }
    }

};

/** Class object block #2 C code. */
Blockly.C['ds_member2'] = function (block) {
	/** Generate C code with helper function */
    var val1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);

	/** Initialize variable */
    var code = "";

	/** Add C code to variable */
    code += val1 + ';\n';

    return code;
};

/** Class constructor block. */
Blockly.Blocks['class_constructor'] = {
    init: function () {
		/** Adds a notch to connect up. */
        this.setPreviousStatement(true, null);
		/** Adds a notch to connect down. */
        this.setNextStatement(true, null);
		/** Sets color of the block. */
        this.setColour(classHue);
		/** This tooltip text appears when hovering block. */
        this.setTooltip("This block creates constructors/ destructors.");
		/** The Help URL directs to hyperlink when a block is right clicked and Help is selected. */
        this.setHelpUrl("https://www.geeksforgeeks.org/rule-of-three-in-cpp/");

		/** Area for parameters to be placed. */
        this.appendValueInput('valinp1')
            .appendField(new Blockly.FieldDropdown([['', ''], ['~', '~']]), 'con_type')
            .appendField('class name', 'con_name')
            .appendField('(');
        this.appendDummyInput()
            .appendField(') {');
			
		/** Area for functions & variables etc. */
        this.appendStatementInput("stateinp1").setCheck(null);

        this.appendDummyInput()
            .appendField('}');

		/** Blocks will appear connected across one line. */
        this.setInputsInline(true);

		/** Counter for how many attached parameters. */
        this.paramCount_ = 0;

		/** Default to be a constructor. */
        this.isConstructor_ = true;
		/** Not a destructor by default. */
        this.isDestructor_ = false;

		/** Default dropdown to be a constructor (no '~') with text "class name" when not in a class. */
        this.constructorType_ = "";
        this.constructorName_ = "class name";

		/** Able to work with function parameter blocks. */
        this.funcProp_ = [];
        this.funcParam_ = [];

        /** Variable to get info from classes passed in with class parameter block (copy constructor). */
        this.funcParamClassMembers_ = [];
    },

	/** The onchange function is called when a block is moved or updated. */
    onchange: function () {
        this.allocateValues();
    },

	/** The allocateValues function is where we stream values into arrays. */
    allocateValues: function () {
		/** Utilizing prototype helper function to simplify allocateValues function. */
        var CV_manage = C_Var;
        this.funcParam_ = CV_manage.get.parameters(this.getInputTargetBlock('valinp1'));
        //console.log(this.funcParam_);
        this.funcParamClassMembers_ = CV_manage.get.classParameterMembers(this.getInputTargetBlock('valinp1'));
        //console.log(this.funcParamClassMembers_);
		
		/** Default the text for when not in class. */
        this.setFieldValue("class name", "con_name");

		/** If the ~ is selected then it is flagged as a destructor. */
        if (this.constructorType_ != '') {
            this.isConstructor_ = false;
            this.isDestructor_ = true;
        }

		/** Go up the tree to look for class declaration block. */
        let ptr = this.getSurroundParent();
        while (ptr) {
            if (ptr.getDataStr() === 'isClass') {
				/** Set the name of the text to the class name. */
                this.setFieldValue(ptr.getVar_, 'con_name');
                break;
            }
            ptr = ptr.getSurroundParent();
        }
		/** Update values after looping. */
        this.constructorType_ = this.getFieldValue('con_type');
        this.constructorName_ = this.getFieldValue('con_name');
    }
};

/** Class constructor C code. */
Blockly.C['class_constructor'] = function (block) {
	/** Generate constructor C code with helper function. */
    var stateinp1 = Blockly.C.statementToCode(block, 'stateinp1');
	/** Generate parameters C code with helper function. */
    var val1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);

	/** Initialize variable. */
    var code = "";

	/** Constructor or destructor. */
    code += block.constructorType_;

	/** Name of class. */
    code += block.constructorName_;

	/** Output parameter code first. */
    code += '(';
    code += val1;
    code += ')';
	
	/** Output constructor code. */
    code += '{\n';
    code += stateinp1;
    code += '}\n';

    return code;
};

/** Class parameter block. */
Blockly.Blocks['class_parameters'] = {
    init: function () {
		/** Reference */
        this.pPtrs_ = [
            ["", ""],
            ["&", "&"],
			["*", "*"]
        ];

		/** Constant, data type, pointer, name. */
        this.appendValueInput('valinp1')
            .appendField(new Blockly.FieldDropdown([['', ''], ['const', 'const']]), 'const')
            .appendField(new Blockly.FieldDropdown(this.allocateDropdown.bind(this)), 'type')
            .appendField(new Blockly.FieldDropdown(this.pPtrs_), 'ptr')
            .appendField(new Blockly.FieldTextInput('param'), 'var');

		/** Blocks will appear connected across one line. */
        this.setInputsInline(false);

		/** No notch on top or bottom. */
        this.setPreviousStatement(false);
        this.setNextStatement(false);

		/** Notch on right */
        this.setOutput(true);
		
		/** Sets color of the block. */
        this.setColour(classHue);
		/** This tooltip text appears when hovering block. */
        this.setTooltip("This block creates constructors/ destructors.");
		/** The Help URL directs to hyperlink when a block is right clicked and Help is selected. */
        this.setHelpUrl("https://www.geeksforgeeks.org/rule-of-three-in-cpp/");

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
        this.paramProp_ = [false, "", "", "", true];

		/** Only have access to the public members. */
        this.classVarPublic_ = [];
        this.classFuncProp_ = [];
        this.classFuncParam_ = [];
    },

	/** The onchange function is called when a block is moved or updated. */
    onchange: function () {
        this.allocateValues();
        this.allocateWarnings();
		
    },

	/** The allocateValues function is where we stream values into arrays. */
    allocateValues: function () {
        this.isConst_ = (this.getFieldValue('const') === 'const')
        this.typeName_ = this.getField('type').getText();
        this.addPtr_ = this.getField('ptr').getText();
        this.getVar_ = this.getField('var').getText();

        this.paramProp_[0] = this.isConst_;
        this.paramProp_[1] = this.typeName_;
        this.paramProp_[2] = this.addPtr_;
        this.paramProp_[3] = this.getVar_;
        this.paramProp_[4] = true;

		/** Reset to empty to update. */
        this.classVarPublic_ = [];
        this.classFuncProp_ = [];
        this.classFuncParam_ = [];

		/** parentBlock_ looks at block above it. */
        let ptr = this.parentBlock_;

        while (ptr) {
            //console.log(this.typeName_ + " " + ptr.getVar_);
            if (ptr.getDataStr() === 'isClass' && this.typeName_ === ptr.getVar_) {
                this.classVarPublic_ = ptr.classVarPublic_;
                this.classFuncProp_ = ptr.classFuncProp_;
                this.classFuncParam_ = ptr.classFuncParam_;
            }else if (ptr.type === 'include_file')
			{
				for (var i = 0; i < ptr.includedClasses_.length; i++)
				{
					//includedClasses_[i][classname:getvar][funcprop][funcparam]
						if (this.typeName_ === ptr.includedClasses_[i][0])
						{
							
							this.classFuncProp_ = ptr.includedClasses_[i][1];
							this.classFuncParam_ = ptr.includedClasses_[i][2];
						}
				}
			}
            ptr = ptr.parentBlock_;
        }
    },
	
	/** The allocateDropdown function is where we add options to the dropdown menu. */
    allocateDropdown: function () {
        var options = [["", ""]];

		/** parentBlock_ looks at block above it. */
        let ptr = this.parentBlock_;
        while (ptr) {
            if (ptr.getDataStr() === 'isClass') {
				/** Add class name to dropdown list. */
                options.push([ptr.getVar_, ptr.getVar_]);
            }
			if (ptr.type === 'include_file')
			{
				for (var i = 0; i < ptr.includedClasses_.length; i++)
				{
					options.push([ptr.includedClasses_[i][0],ptr.includedClasses_[i][0]]);
				}
			}
            ptr = ptr.parentBlock_;
        }
        return options;
    },

	/** The allocateWarnings function adds "!" and text popup when hovored with warning text. */
    allocateWarnings: function () {
        var TT = "";

		/** get.SurroundParent looks at block it is inside. */
        let ptr = this.getSurroundParent();

		/** Check if the block is connected to a function parameter block, function block, or class constructor block. */
        if (!this.parentBlock_) {
            TT += 'Error, parameter block must be connected to a parameter block or a constructor block.\n';
        } else if (ptr.type !== "func_parameters" && ptr.type !== "function_declaration" && ptr.type !== "class_constructor" && ptr.type !== "class_function_definition" && ptr.type !== "class_function_declaration" ) {
            TT += 'Error, parameter block must be connected to a parameter block or a constructor block.\n';
        }

		/** If there are warnings, then display them. */
        if (TT.length > 0) {
            this.setWarningText(TT);
        } else {
            this.setWarningText(null);
        }
    }

};

/** Class parameter C code. */
Blockly.C['class_parameters'] = function (block) {
	/** Generate attached parameter C code with helper function. */
    var val = Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_ATOMIC);
	
	/** Initialize variables. */
    var code = "";
    var std = '';

	/** If a string data type is selected, and #include string is not, append std:: */
    var C = C_Include;
    if (!C.using.std(this) && this.typeName_ === 'string') {
        std = 'std::';
    }

	/** If the paramater block has text, build code. */
    if (this.getVar_.length > 0) {
        if (this.isConst_) {
            code += 'const ';
        }
        code += std + this.typeName_ + this.addPtr_ + ' ' + this.getVar_;
    }

	/** If there are multiple parameters. */
    if (val.length > 0) {
        code += ', ' + val;
    }

    return [code, Blockly.C.ORDER_NONE];
};
