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
        this.setTooltip("This block is a superclass.");
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
        this.appendValueInput('valueInput')
            .appendField("class")
            .appendField(new Blockly.FieldTextInput("myClass"), "myClassDec");

		/** Area for blocks to be defined in public class section. */
        this.appendDummyInput();
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

		this.parentClass_ = [];
    },

	/** The onchange function is called when a block is moved or updated. */
    onchange: function () {
        this.allocateValues();
        this.allocateWarnings();
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

		let block1 = this.getInputTargetBlock('valueInput');

		//get parent classes from right block, then add the data to this one
		if (block1) {
			this.parentClass_ = block1.parentClass_;
		}

		ptr = this.parentBlock_;
		while (ptr) {
			for (var i = 0; i < this.parentClass_.length; i++)
			{
				if (ptr.getVar_ === this.parentClass_[i])
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

					/*for (var i = 0; i < ptr.classObjProtected_.length; i++) {
						this.classObjPublic_.push(ptr.classObjProtected_[i]);
					}
					for (var i = 0; i < ptr.classObjPublic_.length; i++) {
						this.classObjPublic_.push(ptr.classObjPublic_[i]);
					}*/
				}
			}
			ptr = ptr.parentBlock_;
		}
    },

    //making a warning so that it only wants a subclass block and nothing else
    allocateWarnings: function () {
        let warn = "";//the warning
        let ptr = this.getInputTargetBlock('valueInput');//the block connected to the superclass

        if ((ptr) && (ptr.getDataStr() !== "isClass")) {
            warn += "Error, the connected block is not a subclass block."
        }

        if (warn.length > 0) {
            this.setWarningText(warn);
        } else {
            this.setWarningText(null);
        }
    }
};

/** Class definition C code. */
Blockly.C["ds_superclass"] = function (block) {
	/** Generate public C code with helper function. */
    var codeStatePublic =
        Blockly.C.statementToCode(block, "statePublic");
	/** Generate private C code with helper function. */
    var codeStatePrivate =
        Blockly.C.statementToCode(block, "statePrivate");
	var codeStateProtected =
        Blockly.C.statementToCode(block, "stateProtected");

    var inheritType = Blockly.C.valueToCode(block, "valueInput", Blockly.C.ORDER_ATOMIC);

	/** Initialize variable. */
    var code = "";

	/** Begin class declaration with user input text; class myClass{ */
    code += "class " + this.getVar_ + " " + inheritType + " {\n";

	/** Formate public code. */
	if (codeStatePublic) {
    code += "public:\n";
    code += codeStatePublic;
	}

	if (codeStateProtected) {
	code += "protected:\n";
	code += codeStateProtected;
	}

	/** Format private code. */
	if (codeStatePrivate) {
    code += "private:\n";
    code += codeStatePrivate;
	}

	/** End class declaration. */
    code += "};\n";

    return code;
};

Blockly.Blocks['inherit_mutator'] = {
    init: function () {

        this.appendDummyInput()
            .appendField('superclass');

        this.appendStatementInput('STACK')
            .setCheck(null);


        this.setPreviousStatement(false);
        this.setNextStatement(false);
        this.setColour(classHue);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['inherit_add'] = {
    init: function () {
        this.appendDummyInput()
            .appendField('add');


        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(classHue);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

/** Class definition block. */
Blockly.Blocks["ds_subclass"] = {
    init: function () {
		/** Sets color of the block. */
        this.setColour(classHue);
		/** Sets data structure to class. */
        this.setDataStr("isClass", true);
		/** This tooltip text appears when hovering block. */
        this.setTooltip("This block inherits from a superclass.");
		/** The Help URL directs to hyperlink when a block is right clicked and Help is selected. */
        this.setHelpUrl("http://www.cplusplus.com/doc/tutorial/classes/");

        this.setInputsInline(true);
        this.setOutput(true, null);

		this.parentClass_ = [];

        this.appendDummyInput()
			.appendField(": public ")
            .appendField(new Blockly.FieldDropdown(this.allocateDropdown.bind(this)), "inheritVar");

		//mutator stuff
        this.setMutator(new Blockly.Mutator(['inherit_add']));

        this.inheritCount_ = 0;
    },

    mutationToDom: function () {
        if (!this.inheritCount_) {
            return null;
        }
        var container = document.createElement('mutation');

        if (this.inheritCount_) {
            container.setAttribute('inherit_add', this.inheritCount_);//added _ to inheritadd
        }

        return container;
    },

    domToMutation: function (xmlElement) {
        this.inheritCount_ = parseInt(xmlElement.getAttribute('inherit_add'), 10);//added _ to inheritadd

        for (var i = 1; i <= this.inheritCount_; ++i) {
            this.appendDummyInput('valueInput' + i)
                .appendField('+')
                .setAlign(Blockly.ALIGN_RIGHT);
        }
    },

    decompose: function (workspace) {
        var containerBlock = workspace.newBlock('inherit_mutator');
        containerBlock.initSvg();

        var connection = containerBlock.getInput('STACK').connection;

        for (var i = 1; i <= this.inheritCount_; ++i) {
            var add = workspace.newBlock('inherit_add');
            add.initSvg();

            connection.connect(add.previousConnection);
            connection = add.nextConnection;
        }

        return containerBlock;
    },

    compose: function (containerBlock) {

        for (var i = this.inheritCount_; i > 0; i--) {
            this.removeInput('valueInput' + i);//valinp???
        }

        this.inheritCount_ = 0;

        var clauseBlock = containerBlock.getInputTargetBlock('STACK');

        while (clauseBlock) {
            switch (clauseBlock.type) {
                case 'inherit_add':
                    this.inheritCount_++;

                    var printInput = this.appendDummyInput('valueInput' + this.inheritCount_)//valinp???
						.appendField(', public ')
						.appendField(new Blockly.FieldDropdown(this.allocateDropdown.bind(this)), 'DS' + this.inheritCount_)
						.setAlign(Blockly.ALIGN_RIGHT);
						/*console.log("hello");
						console.log('DS' + this.inheritCount_);
						console.log(this.getField('DS1').getText());*/

                    if (clauseBlock.valueConnection_) {
                        printInput.connection.connect(clauseBlock.valueConnection_);
                    }

                    break;

                default:
                    throw 'Unknown block type.';
            }
            clauseBlock = clauseBlock.nextConnection
                && clauseBlock.nextConnection.targetBlock();
        }
    },

    saveConnections: function (containerBlock) {
        var clauseBlock = containerBlock.getInputTargetBlock('STACK');
        var i = 1;
        while (clauseBlock) {
            switch (clauseBlock.type) {
                case 'inherit_add':
                    var inputPrint = this.getInput('valueInput' + i);//valinp???
                    clauseBlock.valueConnection_ = inputPrint && inputPrint.connection.targetConnection;
                    clauseBlock.statementConnection_ = i++;
                    break;
                default:
                    throw 'Unknown block type.';
            }
            clauseBlock = clauseBlock.nextConnection
                && clauseBlock.nextConnection.targetBlock();
        }
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

        if (ptr !== null) {
          ptr = ptr.parentBlock_;
        }

        while (ptr) {
            if (ptr.getDataStr() === "isClass"){

                    options.push([ptr.getVar_, ptr.getVar_]);
            }
            if (ptr.type === "include_file"){

                    options.push([ptr.getVar_, ptr.getVar_]);
            }
            ptr = ptr.parentBlock_;
        }
        return options;
    },

	/** The allocateValues function is where we stream values into arrays. */
    allocateValues: function () {
		this.parentClass_ = [];

		/** first one selected */
        this.getVar_ = this.getField("inheritVar").getText();
		this.parentClass_.push(this.getVar_);

		//mutator, multiple inheritance
		for (var i = 0; i <= this.inheritCount_.length; i++)
		{
			console.log('hi');
			this.parentClass_.push(this.getField("DS").getText());
		}

    }
};

/** Class definition C code. */
Blockly.C['ds_subclass'] = function (block) {
  console.log(this);
    var code = '';

    if (this.getVar_.length > 0) {
            code += ": public ";
            code += this.getVar_;

        for (var i = 1; i <= this.inheritCount_; ++i) {
            var arg = Blockly.C.valueToCode(block, 'valueInput' + i, Blockly.C.ORDER_NONE);

            code += arg;

            if (i < this.inheritCount_) {
                code += ", ";
            }
        }
        // code += ' ';
    }

    return [code, Blockly.C.ORDER_NONE];
};

/** Virtual block for overloading */
Blockly.Blocks["virtual"] = {
  init: function() {
    /** Adds a notch to connect up. */
    this.setPreviousStatement(true, null);
    /** Adds a notch to connect down. */
    this.setNextStatement(true, null);
    /** Sets color of the block. */
    this.setColour(classHue);
    /** This tooltip text appears when hovering block. */
    this.setTooltip("This block is for overloading a block.");
    /** The Help URL directs to hyperlink when a block is right clicked and Help is selected. */
    this.setHelpUrl("https://www.cplusplus.com/doc/tutorial/polymorphism/");

    /** allowing blocks to be put in the virtual block */
    this.appendDummyInput()
      .appendField("virtual");
    this.appendStatementInput("stateVirtual")
      .setCheck(null);
  }
};

/** virtual C code. */
Blockly.C["virtual"] = function (block) {
  let code = 'virtual';

  return code;
};

/** friend block */
Blockly.Blocks["friend"] = {
  init: function() {
    /** Adds a notch to connect up. */
    this.setPreviousStatement(true, null);
    /** Adds a notch to connect down. */
    this.setNextStatement(true, null);
    /** Sets color of the block. */
    this.setColour(classHue);
    /** This tooltip text appears when hovering block. */
    this.setTooltip("This block is for creating friends :)");
    /** The Help URL directs to hyperlink when a block is right clicked and Help is selected. */
    this.setHelpUrl("https://www.cplusplus.com/doc/tutorial/inheritance/");

    /** allowing blocks to be put in the virtual block */
    this.appendDummyInput()
      .appendField("friend");
    this.appendStatementInput("stateFriend")
      .setCheck(null);
  }
};

/** friend C code. */
Blockly.C["friend"] = function (block) {
  let code = 'friend';

  return code;
};
/**
  bug: subclass block crashes after getting added class and removed from a superclass block
  bug: when superclass is connected to top of a class it does not add the name of the superclass
 block to the code on the right
*/
