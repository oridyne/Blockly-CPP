var classHue = 35;


Blockly.Blocks['ds_struct'] = {
    init: function () {
        this.appendDummyInput()
            .appendField('struct ')
            .appendField(new Blockly.FieldTextInput("myStruct"), "myStructDec");
        this.appendStatementInput("stateinp1")
            .setCheck(null);

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(classHue);
        this.setTooltip("This block declares a struct.");
        this.setHelpUrl("http://www.cplusplus.com/doc/tutorial/structures/");

        //Default this to a struct
        this.setDataStr("isStruct", true);

        this.classVarPublic_ = [];
        this.classArrPublic_ = [];
        this.classVecPublic_ = [];
        this.classFuncProp_ = [];
        this.classFuncParam_ = [];

        //Function constructors
        this.classConProp_ = [];
        this.classConParam_ = [];
    },

    onchange: function () {
        this.allocateValues();

        this.allocateWarnings();
    },

    allocateValues: function () {
        this.getVar_ = this.getField('myStructDec').getText();

        this.classVarPublic_ = [];
        this.classArrPublic_ = [];
        this.classVecPublic_ = [];
        this.classFuncProp_ = [];
        this.classFuncParam_ = [];
        this.classConProp_ = [];
        this.classConParam_ = [];

        //Get the first block in the statement dropdown
        let ptr = this.getInputTargetBlock('stateinp1');
        while (ptr) {
            switch (ptr.getDataStr()) {

                //If the block is a variable
                case 'isVar':
                    this.classVarPublic_.push(ptr.varProp_);
                    break;

                //If the block is an array
                case 'isArr':
                    this.classArrPublic_.push(ptr.varProp_);
                    break;

                //If the block is a vector
                case 'isVec':
                    this.classVecPublic_.push(ptr.varProp_);
                    break;

                //If the block is a function
                case 'isFunc':
                    //If the function is not a constructor
                    if (!ptr.isConstructor_) {
                        this.classFuncProp_.push(ptr.funcProp_);
                        this.classFuncParam_.push(ptr.funcParam_);
                    }
                    //If the function is a constructor
                    else {
                        this.classConProp_.push(ptr.funcProp_);
                        this.classConParam_.push(ptr.funcParam_);
                    }

                    break;
            }

            //Get the next bottom block
            ptr = ptr.nextConnection.targetBlock();
        }

    },

    allocateWarnings: function () {
        var TT = "";


        if (TT.length > 0) {
            this.setWarningText(TT);
        } else {
            this.setWarningText(null);
        }
    }

};

Blockly.C['ds_struct'] = function (block) {
    const variable_mystructdec = Blockly.C.variableDB_.getName(block.getFieldValue('myStructDec'), Blockly.Variables.NAME_TYPE);
    const statements_state1 = Blockly.C.statementToCode(block, 'stateinp1');
    // TODO: Assemble C into code variable.
    let code = '';

    code += 'struct ' + variable_mystructdec + '{\n';

    code += statements_state1;

    code += '};\n';

    return code;
};

Blockly.Blocks['ds_object'] = {
    init: function () {

        this.paramNames_ = [["", ""]];

        this.appendValueInput('valinp1')
            .appendField(new Blockly.FieldDropdown(this.allocateDropdown.bind(this)), "DS")
            .appendField(new Blockly.FieldDropdown([['', ''], ['*', '*']]), 'ptr')
            .appendField(new Blockly.FieldTextInput('myObj'), 'obj');

        this.setOutput(false);
        this.setColour(classHue);
        this.setTooltip("This block declares an object of a class type.");
        this.setHelpUrl("");

        this.setPreviousStatement(true);
        this.setNextStatement(true);

        this.classVarPublic_ = [];
        this.classArrPublic_ = [];
        this.classVecPublic_ = [];
        this.classFuncProp_ = [];
        this.classFuncParam_ = [];

        this.classConProp_ = [];
        this.classConParam_ = [];

        this.typeName_ = "";
        this.getVar_ = "";
        this.ptrType_ = "";
        this.isNew = true;

        //[0] is typeName_ [1] is ptr [2] is var
        this.objProp_ = ["", "", ""];

    },

    onchange: function () {
        this.allocateVariables();
        this.allocateValues();
        this.allocateWarnings();

    },

    allocateVariables: function () {
        const options = [];

        options.push(["", ""]);

        let ptr = this.parentBlock_;

        while (ptr) {
            switch (ptr.getDataStr()) {
                case 'isStruct':
                case 'isClass':
                    options.push([ptr.getVar_, ptr.getVar_]);
                    break;
            }
            ptr = ptr.parentBlock_;
        }

        ptr = this.parentBlock_;
        while (ptr) {
            if (ptr.type === 'include_file') {
                for (let i = 0; i < ptr.includedClasses_.length; i++) {
                    options.push([ptr.includedClasses_[i][0], ptr.includedClasses_[i][0]]);
                }
            }
            ptr = ptr.parentBlock_;
        }

        this.paramNames_ = options;

    },

    allocateValues: function () {
        this.classVarPublic_ = [];
        this.classArrPublic_ = [];
        this.classVecPublic_ = [];
        this.classFuncProp_ = [];
        this.classFuncParam_ = [];
        this.classConProp_ = [];
        this.classConParam_ = [];
        this.isNew = true;

        //variable is the new object
        this.typeName_ = this.getFieldValue('DS');
        this.getVar_ = this.getFieldValue('obj');
        this.ptrType_ = this.getFieldValue('ptr');

        if (this.childBlocks_[0]) {
            if (this.childBlocks_[0].type === 'ds_member') {
                this.isNew = false;
            }
        }

        this.objProp_[0] = this.typeName_;
        this.objProp_[1] = this.ptrType_;
        this.objProp_[2] = this.getVar_;
        this.objProp_[3] = this.isNew;


        let ptr = this.parentBlock_;

        //Loop through to find a struct or class
        while (ptr) {
            //If the block is a struct or class, and if it is the one we want
            if ((ptr.getDataStr() === "isStruct" || ptr.getDataStr() === "isClass") && this.typeName_ === ptr.getVar_) {

                //Stream all information
                this.classVarPublic_ = ptr.classVarPublic_;
                this.classArrPublic_ = ptr.classArrPublic_;
                this.classVecPublic_ = ptr.classVecPublic_;
                this.classFuncProp_ = ptr.classFuncProp_;
                this.classFuncParam_ = ptr.classFuncParam_;
                this.classConProp_ = ptr.classConProp_;
                this.classConParam_ = ptr.classConParam_;
            } else if (ptr.type === 'include_file') {
                for (let i = 0; i < ptr.includedClasses_.length; i++) {
                    //includedClasses_[i][classname:getvar][funcprop][funcparam]
                    if (this.typeName_ === ptr.includedClasses_[i][0]) {
                        this.classFuncProp_ = ptr.includedClasses_[i][1];
                        this.classFuncParam_ = ptr.includedClasses_[i][2];
                        this.classConProp_ = ptr.classConProp_;
                        this.classConParam_ = ptr.classConParam_;
                    }
                }
            }
            ptr = ptr.parentBlock_;
        }

    },

    allocateDropdown: function () {
        return C_Var.get.checkDropdown(this.paramNames_, 'DS', this);
    },

    allocateWarnings: function () {
        let TT = "";

        //If there is no option selected
        if (this.getFieldValue('DS').length < 1) {
            TT += 'Error, type class needed.\n';
        }

        let ptr;
        if (this.childBlocks_[0]) {
            ptr = this.childBlocks_[0];
            if (ptr.type === 'ds_member') {
                if (this.ptrType_ !== ptr.ptrType_) {
                    TT += "Error, pointer level mismatch\n";
                }
            }
        }

        if (TT.length > 0) {
            this.setWarningText(TT);
        } else {
            this.setWarningText(null);
        }
    }
};

Blockly.C['ds_object'] = function (block) {
    const val1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_NONE);
    let nextBlock = block.getInputTargetBlock('valinp1');

    const DS = block.getFieldValue('DS');
    const ptr = block.getFieldValue('ptr');
    const obj = block.getFieldValue('obj');

    let code = "";

    if (nextBlock && nextBlock.type === "ds_member") {

        code += DS;
        if (ptr.length > 0) {
            code += ptr;
        }
        code += ' ' + obj + ' = ' + nextBlock.getVar_ + ';\n';

        return code;
    }

    if (ptr.length > 0) {
        code += DS + ptr + ' ' + obj + ' = new ' + DS;
    } else {
        code += DS + ' ' + obj;
    }

    if (nextBlock && nextBlock.type === "get_func" && val1.length > 0) {
        code += val1;
    }


    code += ';\n';

    return code;
};

Blockly.Blocks['ds_member'] = {
    init: function () {
        this.paramNames_ = [["", ""]];

        this.appendValueInput("valinp1")
            .appendField(new Blockly.FieldDropdown(this.allocateDropdown.bind(this)), 'DS')
            .appendField('', 'operator');

        this.setInputsInline(false);
        this.setOutput(true);
        this.setColour(classHue);
        this.setTooltip("");
        this.setHelpUrl("");

        this.setPreviousStatement(false);
        this.setNextStatement(false);

        this.classVarPublic_ = [];
        this.classArrPublic_ = [];
        this.classVecPublic_ = [];
        this.classFuncProp_ = [];
        this.classFuncParam_ = [];
        this.funcParamClassMembers_ = [];
        this.classObjPrivate_ = [];
        this.isGetter_ = true;

        this.typeName_ = "";
        this.getVar_ = "";
        this.ptrType_ = "";
        this.isNew = true;
    },

    onchange: function () {
        this.allocateValues();
        this.allocateVariables();
        this.allocateWarnings();
        // C_Var.get.updateDropdownText(this.paramNames_, 'DS', this);
    },

    allocateValues: function () {
        let i;
        const val1 = Blockly.C.valueToCode(this, 'valinp1', Blockly.C.ORDER_NONE);
        let dropField = this.getField("DS");
        this.getVar_ = dropField ? this.getFieldValue('DS') : '' ;
        this.typeName_ = "";
        this.ptrType_ = '';
        this.isNew = true;

        this.classVarPublic_ = [];
        this.classArrPublic_ = [];
        this.classVecPublic_ = [];
        this.classFuncProp_ = [];
        this.classFuncParam_ = [];
        this.funcParamClassMembers_ = [];

        this.classObjPrivate_ = [];

        let ptr = this.parentBlock_;
        //actually streaming data values from the initialized block to match ptr level etc
        while (ptr) {
            switch (ptr.type) {
                case 'ds_object':
                    if (this.getVar_ === ptr.getVar_) {
                        this.typeName_ = ptr.typeName_;
                        this.ptrType_ = ptr.ptrType_;
                        this.classVarPublic_ = ptr.classVarPublic_;
                        this.classArrPublic_ = ptr.classArrPublic_;
                        this.classVecPublic_ = ptr.classVecPublic_;
                        this.classFuncProp_ = ptr.classFuncProp_;
                        this.classFuncParam_ = ptr.classFuncParam_;
                        this.isNew = ptr.isNew;
                    }
                    break;
                case 'include_file':
                    for (i = 0; i < ptr.classObjPrivate_.length; i++) {
                        if (this.getVar_ === ptr.classObjPrivate_[i][2]) {
                            this.typeName_ = ptr.classObjPrivate_[i][0];
                            this.ptrType_ = ptr.classObjPrivate_[i][1];
                            this.isNew = ptr.classObjPrivate_[i][3];
                        }
                    }
                    break;
            }
            ptr = ptr.parentBlock_;
        }

        ptr = this.getSurroundParent();
        while (ptr) {
            if (ptr.type === 'class_function_definition') {

                //iterate through param blocks
                for (i = 0; i < ptr.funcParam_.length; i++) {
                    //check if type = function class name to make sure its class param block
                    if (ptr.funcParam_[i][3] === this.getVar_) {
                        //match values
                        this.typeName_ = ptr.funcParam_[i][1];
                        this.ptrType_ = ptr.funcParam_[i][2];
                        this.classFuncProp_ = ptr.childBlocks_[i].classFuncProp_;
                        this.classFuncParam_ = ptr.childBlocks_[i].classFuncParam_;
                        break;

                    }
                }
            }
            ptr = ptr.getSurroundParent();
        }

        if (this.getVar_ === "this") {
            ptr = this.parentBlock_;
            while (ptr) {
                if (ptr.type === 'include_file') {
                    this.typeName_ = ptr.getVar_;
                    this.ptrType_ = '*';
                }
                ptr = ptr.parentBlock_;
            }
        }

        ptr = this.childBlocks_[0];
        if (ptr) {
            this.typeName_ = ptr.typeName_;
        }

        //Allocate pointer type
        if (val1.length > 0) {
            //console.log(this.ptrType_); //for checking pointer types
            if (C_Logic.help.ptr_is_deref(this.ptrType_)) {
                this.setFieldValue('->', 'operator');
            } else {
                this.setFieldValue('.', 'operator');
            }
        } else {
            this.setFieldValue('', 'operator');
        }
    },


    allocateVariables: function () {

        //Only adding class names for the left dropdown list
        const options = [];
        options.push(["", ""],
            ["this", "this"]);

        //checks function parameters
        let ptr = this.getSurroundParent();
        while (ptr) {
            if (ptr.type === 'function_declaration' || ptr.type === 'class_constructor') {
                if (ptr.funcParamClassMembers_) {
                    this.funcParamClassMembers_ = ptr.funcParamClassMembers_;
                    //this.allocateMemberProperties();
                    for (let i = 0; i < ptr.funcParamClassMembers_.length; ++i) {
                        options.push([ptr.funcParamClassMembers_[i][3], ptr.funcParamClassMembers_[i][3]]);

                    }
                }
                break;
            }

            ptr = ptr.getSurroundParent();
        }


        this.paramNames_ = options;
    },

    //doesnt work
    allocateMemberProperties: function () {
        for (let i = 0; i < this.funcParamClassMembers_.length; ++i) {
            for (let j = 0; j < this.funcParamClassMembers_[i].length; ++j) {
                if (this.funcParamClassMembers_[i][j]) {
                    //this.classVarPublic_.push(this.funcParamClassMembers_[i][j]);
                }

            }
        }
    },

    //just adding name of classes to the dropdown
    allocateDropdown: function () {
        let i;
        const options = [["", ""]];

        let ptr = this.parentBlock_;
        while (ptr) {
            if (ptr.type === "ds_object") {
                options.push([ptr.getVar_, ptr.getVar_]);
            } else if (ptr.type === 'include_file') {
                for (i = 0; i < ptr.classObj_.length; i++) {
                    options.push([ptr.classObj_[i][2], ptr.classObj_[i][2]]);
                }
                for (i = 0; i < ptr.classObjPrivate_.length; i++) {
                    options.push([ptr.classObjPrivate_[i][2], ptr.classObjPrivate_[i][2]]);
                }
            }
            ptr = ptr.parentBlock_;
        }

        ptr = this.getSurroundParent();
        while (ptr) {
            if (ptr.type === 'ds_class') {
                for (i = 0; i < ptr.classObjPrivate_.length; i++) {
                    options.push([ptr.classObjPrivate_[i], ptr.classObjPrivate_[i]]);
                }
            }
            ptr = ptr.getSurroundParent();
        }

        ptr = this.getSurroundParent();
        while (ptr) {
            if (ptr.type === 'class_function_definition') {
                for (i = 0; i < ptr.funcParam_.length; i++) {
                    classList.forEach(block => {
                        const blockName = block.className_.substring(0, block.className_.indexOf('.'));
                        if (ptr.funcParam_[i][1] === blockName) {
                            options.push([ptr.funcParam_[i][3], ptr.funcParam_[i][3]]);
                        }
                    });
                }
            }
            ptr = ptr.getSurroundParent();
        }

        ptr = this.getSurroundParent();
        while (ptr) {
            if (ptr.type === 'class_function_definition') {
                options.push(["this", "this"]);
            }
            ptr = ptr.getSurroundParent();
        }
        return C_Var.get.checkDropdown(options, 'DS', this);
    },

    allocateWarnings: function () {
        const TT = "";
        let block = this.getInputTargetBlock('valinp1');

        if (block) {

        }

        if (TT.length > 0) {
            this.setWarningText(TT);
        } else {
            this.setWarningText(null);
        }
    }

};

Blockly.C['ds_member'] = function (block) {
    var val1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_NONE);
    var code = "";

    code += block.getFieldValue('DS');

    if (val1.length > 0) {
        code += block.getFieldValue('operator') + val1;
    }

    return [code, Blockly.C.ORDER_NONE];
};





