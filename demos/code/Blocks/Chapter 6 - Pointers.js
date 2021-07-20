/* Author:    David J. Hazell                            */
/* Professor: Hao Loi                                    */
/* School:    Quinsigamond Community College             */
/* Class:     CSC212: Introduction to Computer Science   */
/* Semester:  Spring 2021                                */

/* ToDo:                                                 */
/*   * Use global variables for common values like       */
/*     the available variable types, available pointer   */
/*     operators, etc                                    */
/*   * Reduce the amount of "duplicated code" reported   */
/*     by IDEs                                           */
/*   * Use common variable names to describe identical   */
/*     information. (Example: some blocks assign the     */
/*     variable identifier to "this.getVar_" while other */
/*     blocks use "this.name_"                           */
/*   * Test the use of pointers with classes.  This is   */
/*     currently un-tested and may require additional    */
/*     work to be supported.                             */

const pointerBlockHue = 200;

/* ------------------------------------------------------ */
/* Pointer Declaration                                    */
/* ------------------------------------------------------ */

/* This "pointer_declare" block is used to declare a      */
/* pointer.  This block can be initialized using blocks   */
/* defined in the "Pointer Initialization" section below. */
Blockly.Blocks['pointer_declare'] = {
    init: function () {

        // Initialize helper variables
        this.isPointer_ = true;
        this.setDataStr("isVar", true);
        this.types_ = [
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

        // Blockly properties
        this.setColour(pointerBlockHue);
        this.setTooltip("Pointer declaration\n\nConstant");
        this.setHelpUrl("https://www.cplusplus.com/doc/tutorial/pointers/");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);

        // Input
        this.appendValueInput("valueInput")
            .appendField(new Blockly.FieldDropdown([["", ""], ["const", "const"]]),
                "const")
            .appendField(new Blockly.FieldDropdown(this.types_),
                "type")
            .appendField(new Blockly.FieldDropdown([["*", "*"], ["**", "**"], ["***", "***"]]),
                "operator")
            .appendField(new Blockly.FieldTextInput('myPointer'),
                'identifier')
            .appendField(" = ")
            .setCheck(null);

        // Output
        this.setOutput(false);
    },

    onchange: function () {
        this.allocateValues();
        this.allocateWarnings();
    },

    allocateValues: function () {
        // Store values from block
        this.const_ = (this.getFieldValue('const') === 'const');
        this.type_ = this.getField('type').getText();
        this.operator_ = this.getField('operator').getText();
        this.identifier_ = this.getField('identifier').getText();

        // The variables below are used across the project for variable declarations
        // I opted to use the proper descriptors 'type' and 'identifier' for pointer declarations
        // I'm still setting these here to be compatible with variable blocks that use these variables
        this.typeName_ = this.getField('type').getText();
        this.getVar_ = this.getField('identifier').getText();

        // Set properties of block
        this.isInitialized_ = false;
        this.value_ = "";
        this.isNull_ = false;

        // Set pointer level
        this.pointerLevel_ = 0;
        switch (this.operator_) {
            case "*":
                this.pointerLevel_ = 1;
                break;
            case "**":
                this.pointerLevel_ = 2;
                break;
            case "***":
                this.pointerLevel_ = 3;
                break;
            default:
                console.error("Operator '" + this.operator_ + "' not recognized");
                break;
        }

        let inputBlock = this.getInputTargetBlock('valueInput');
        let inputBlockCode = Blockly.C.valueToCode(this, 'valueInput', Blockly.C.ORDER_ATOMIC);

        if (inputBlock) {
            this.value_ = inputBlock.value_;
            this.isNull_ = inputBlock.isNull_;
        }

        if (inputBlockCode.length > 0) {
            this.isInitialized_ = true;
        }

        if (this.type_ === "string") {
            this.size_ = this.value_.length;
        }

        //Array with variable properties
        this.varProp_ = [];
        this.varProp_[0] = this.const_;
        this.varProp_[1] = this.type_;
        this.varProp_[2] = this.identifier_;
    },

    allocateWarnings: function () {
        let warningText = "";

        // Check if identifier is valid format
        let identifierFormatOk = C_Logic.logic.variable_format(this.identifier_);
        if (identifierFormatOk !== true) {
            for (let i = 1; i < identifierFormatOk.length; ++i) {
                warningText += identifierFormatOk[i];
            }
        }

        // Check if identifier has already been declared in current scope
        let parentBlock = this.parentBlock_;
        while (parentBlock) {
            if (parentBlock.getDataStr() === "isVar" && parentBlock.getVar_ === this.identifier_) {
                warningText += 'Error, variable "' + this.identifier_ + '" has already been declared in this scope.\n';
                break;
            }
            parentBlock = parentBlock.parentBlock_;
        }


        let inputBlock = this.getInputTargetBlock('valueInput');
        if (inputBlock) {
            warningText += C_Logic.logic.type_check(this.type_, inputBlock.type_);

            if (!inputBlock.isNull_) {
                if (inputBlock.pointerLevel_ !== this.pointerLevel_) {
                    warningText += "error: cannot convert '" + inputBlock.type_ + inputBlock.operator_ + "' to '"
                        + this.type_ + this.operator_ + "' in initialization";
                }
            }
        }

        if (this.type_ === "string") {
            let libFound = C_Include.search_library(this, ['include_iostream', 'include_string']);
            if (!libFound) {
                warningText += "Error, <iostream> or <string> library must be included.\n";
            }
        }

        if (warningText !== "") {
            this.setWarningText(warningText);
        } else {
            this.setWarningText(null);
        }
    },

    customContextMenu: function (options) {
        //save the current scope
        let BlockScope = this;

        var librarySearch = C_Include;
        var libFound = librarySearch.search_library(this, ['include_string']);

        //Create the option to automate a string library creation
        if (this.type_ === "string" && !libFound) {
            automate_library_string = {
                text: "include <string>",
                enabled: true,

                callback: function () {
                    var newBlock = BlockScope.workspace.newBlock('include_string');
                    let ptr = BlockScope;

                    while (ptr) {
                        //if we're at the top
                        if (!ptr.parentBlock_) {
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
Blockly.C['pointer_declare'] = function (block) {
    let inputBlock = block.getInputTargetBlock('valueInput');
    let code = '';

    if (block.const_) {
        code += 'const ';
    }

    if (block.type_ === 'string' && !C_Include.using.std(block)) {
        code += "std::";
    }

    code += block.type_ + " " + block.operator_ + " " + block.getVar_;

    if (inputBlock) {
        code += " = " + Blockly.C.valueToCode(block, 'valueInput', Blockly.C.ORDER_ATOMIC) + ";\n";
        return code;
    } else {
        code += ";\n";
        return code;
    }

};

/* ------------------------------------------------------ */
/* Pointer Initialization                                 */
/* ------------------------------------------------------ */

/* The "pointer_getter" block returns a list of pointers  */
/* in the current scope.  This can be used to assign the  */
/* value of a pointer to another pointer.                 */
Blockly.Blocks['pointer_getter'] = {
    init: function () {

        // Initialize helper variables
        this.isPointer_ = true;
        this.isConst_ = false;
        this.isInitialized_ = false;
        this.isGetter_ = true;
        this.isInClass_ = false;
        this.value_ = "";
        this.paramCount_ = 0;
        this.paramNames_ = [["", ""]];

        // BLOCKLY PROPERTIES
        this.setColour(pointerBlockHue);
        this.setTooltip("Pointer variable getter");
        this.setHelpUrl("");
        this.setPreviousStatement(false);
        this.setNextStatement(false);

        // INPUT
        // BLOCK <-- INPUT
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown(this.allocateDropdown.bind(this)),
                "identifier");

        // OUTPUT
        // OUTPUT <-- BLOCK
        this.setOutput(true, null);

    },

    onchange: function () {
        this.allocateValues();
        this.allocateVariableParameters();
        this.allocateVariables();
        this.allocateScope();
        this.allocateWarnings();
    },

    allocateValues: function () {
        this.identifier_ = this.getFieldValue('identifier');
        this.getVar_ = this.getFieldValue('identifier');
        this.typegetVar_ = "";
        this.value_ = "";
        this.isConst_ = false;
        this.ptrType_ = "";
        this.isNull_ = false;
        this.paramNames_ = [["", ""]];
        this.isInClass_ = false;

        //Check function parameters using getSurroundParent()
        let parentBlock = this.getSurroundParent();
        while (parentBlock) {
            switch (parentBlock.getDataStr()) {
                case 'isFunc':
                    //get values from function parameter
                    if (parentBlock.funcParam_) {
                        for (var i = 0; i < parentBlock.funcParam_.length; ++i) {
                            if (this.getVar_ === parentBlock.funcParam_[i][3]) {
                                this.isConst_ = parentBlock.funcParam_[i][0];
                                this.typegetVar_ = parentBlock.funcParam_[i][1];
                                this.ptrType_ = parentBlock.funcParam_[i][2];
                                this.isInitialized_ = parentBlock.funcParam_[i][4];
                            }
                        }
                    }
                    break;
                case 'isStruct':
                    for (var i = 0; i < parentBlock.classVar_.length; ++i) {
                        if (this.getVar_ === parentBlock.classVar_[i][3]) {
                            this.isConst_ = parentBlock.classVar_[i][0];
                            this.typegetVar_ = parentBlock.classVar_[i][1];
                            this.ptrType_ = parentBlock.classVar_[i][2];
                            this.isInClass_ = true;
                        }
                    }
                    break;
                case 'isClass':
                    break;
            }

            parentBlock = parentBlock.getSurroundParent();
        }

        //Set typegetVar_
        parentBlock = this.parentBlock_;
        while (parentBlock) {

            switch (parentBlock.getDataStr()) {
                case 'isVar':

                    //Stream data from var declaration block
                    if (this.getVar_ === parentBlock.getVar_) {
                        this.typegetVar_ = parentBlock.typegetVar_;
                        //stream input value
                        this.value_ = parentBlock.value_;
                        this.isInitialized_ = parentBlock.isInitialized_;
                        this.isNull_ = parentBlock.isNull_;
                        this.ptrType_ = parentBlock.ptrType_;
                        this.type_ = parentBlock.type_;

                        //stream const option
                        this.isConst_ = parentBlock.isConst_;

                        // Set pointer level
                        this.pointerLevel_ = parentBlock.pointerLevel_;
                        switch (this.pointerLevel_) {
                            case 1:
                                this.operator_ = "*";
                                break;
                            case 2:
                                this.operator_ = "**";
                                break;
                            case 3:
                                this.operator_ = "***";
                                break;
                        }

                        // console.debug("pointer_getter: identifier_    = " + this.getVar_);
                        // console.debug("pointer_getter: pointerLevel_  =  " + this.pointerLevel_);
                        // console.debug("");

                        return;
                    }
                    break;
            }
            parentBlock = parentBlock.parentBlock_;
        }
    },

    allocateVariableParameters: function () {
        var options = [];
        options.push(["", ""]);

        //Loop through to get function variables
        let ptr = this.getSurroundParent();

        while (ptr) {

            switch (ptr.getDataStr()) {
                case 'isFunc':

                    if (ptr.funcParam_) {

                        //Loop through the function array to get the names of parameters
                        for (var i = 0; i < ptr.funcParam_.length; ++i) {
                            options.push([ptr.funcParam_[i][3], ptr.funcParam_[i][3]]);

                            if (this.getVar_ === ptr.funcParam_[i][3]) {
                                this.isConst_ = ptr.funcParam_[i][0];
                                this.typegetVar_ = ptr.funcParam_[i][1];
                            }
                        }

                    }

                    break;

                case 'isStruct':

                    for (var i = 0; i < ptr.classVar_.length; ++i) {
                        options.push([ptr.classVar_[i][3], ptr.classVar_[i][3]]);
                    }

                    break;

                case 'isClass':


                    break;
            }

            ptr = ptr.getSurroundParent();
        }

        for (var i = 0; i < options.length; ++i) {
            this.paramNames_.push(options[i]);
        }

    },

    allocateVariables: function () {
        let options = [];
        options.push(["", ""]);

        //Previous declaration
        let parentBlock = this.parentBlock_;
        while (parentBlock) {

            switch (parentBlock.getDataStr()) {
                case 'isVar':
                    if (parentBlock.isPointer_ === true) {
                        options.push([parentBlock.getVar_, parentBlock.getVar_]);
                    }
                    this.paramCount_ = parentBlock.paramCount_;
                    break;
            }
            parentBlock = parentBlock.parentBlock_;
        }

        parentBlock = this.getSurroundParent();
        while (parentBlock) {
            switch (parentBlock.type) {

                case 'loop_for':
                case 'loop_range':
                    options.push([parentBlock.getVar_, parentBlock.getVar_]);
                    if (this.getVar_ === parentBlock.getVar_) {
                        this.typegetVar_ = parentBlock.typegetVar_;
                    }
                    break;
            }
            parentBlock = parentBlock.getSurroundParent();
        }

        for (let i = 0; i < options.length; ++i) {
            this.paramNames_.push(options[i]);
        }
    },

    allocateScope: function () {

        //Get Scope variable

        let ptr = this.getSurroundParent();

        while (ptr) {

            switch (ptr.getDataStr()) {
                case 'isFunc':

                    for (var i = 0; ptr.paramCount_ && i < ptr.paramCount_; ++i) {
                        (ptr && ptr.paramNames_[i]) ? (this.paramNames_.push([ptr.paramNames_[i], ptr.paramNames_[i]])) : (0);
                    }

                    break;
            }

            ptr = ptr.getSurroundParent();
        }

    },

    allocateWarnings: function () {
        var TT = "";
        C = C_Logic;

        if (!this.parentBlock_) {
            TT += "Block warning, this block has a return and must be connected.\n";
        }

        //Errors if a variable exists
        if (this.getVar_.length > 0) {

            var currentVarFound = false;

            for (var i = 1; i < this.paramNames_.length; ++i) {
                if (this.getFieldValue('identifier') === this.paramNames_[i][1]) {
                    currentVarFound = true;
                    break;
                }
            }

            if (this.isInClass_) {
                let ptr = this.getSurroundParent();

                while (ptr) {
                    switch (ptr.getDataStr()) {
                        case 'isStruct':

                            for (var i = 0; i < ptr.classVar_.length; ++i) {
                                if (this.getVar_ === ptr.classVar_[i][3]) {
                                    currentVarFound = true;
                                    break;
                                }
                            }

                            break;
                    }
                    ptr = ptr.getSurroundParent();
                }

            }


            if (!currentVarFound) {
                TT += 'Block warning, variable "' + this.getVar_ + '" is not declared in this scope.\n';
            }
        }

        if (TT.length > 0) {
            this.setWarningText(TT);
        } else {
            this.setWarningText(null);
        }
    },

    allocateDropdown: function () {
        //Delete any repeating elements in the 2d array
        var temp = [];
        var temp2 = [];

        //grab the data from the matrix
        for (var i = 0; i < this.paramNames_.length; ++i) {
            temp.push(this.paramNames_[i][1]);
        }

        this.paramNames_ = [];

        for (var i = 0; i < temp.length; ++i) {
            if (temp2.indexOf(temp[i]) == -1) {
                temp2.push(temp[i]);
            }
        }

        for (var i = 0; i < temp2.length; ++i) {
            this.paramNames_.push([temp2[i], temp2[i]]);
        }

        return this.paramNames_;
    },

};
Blockly.C['pointer_getter'] = function (block) {
    let code = '';
    code += this.getVar_;
    return [code, Blockly.C.ORDER_NONE];
};

/* The "pointer_reference" block returns a list of        */
/* non-pointer variables in the current scope. The block  */
/* inserts the "address of" (&) operator before the       */
/* non-pointer variable name and returns the address of   */
/* the variable which can be assigned to a pointer using  */
/* both the "pointer_declare" and "pointer_assignment"    */
/* blocks.                                                */
Blockly.Blocks['pointer_reference'] = {
    init: function () {

        this.paramNames_ = [["", ""]];
        this.isPointer_ = true;

        this.appendDummyInput()
            .appendField("&")
            .appendField(new Blockly.FieldDropdown(this.allocateDropdown.bind(this)), "VAR");
        this.setOutput(true, null);
        this.setColour(pointerBlockHue);
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

    onchange: function () {
        this.allocateValues();
        this.allocateVariableParameters();
        this.allocateVariables();
        this.allocateScope();
        this.allocateWarnings();
    },

    /**
     * stream through the blocks to find the one we need,
     * then stream the information such as type
     */
    allocateValues: function () {
        this.getVar_ = this.getFieldValue('VAR');
        this.typegetVar_ = "";
        this.value_ = "";
        this.isConst_ = false;
        this.ptrType_ = "";
        this.isNull_ = false;
        this.paramNames_ = [["", ""]];
        this.isInClass_ = false;

        // First check function parameters using getSurroundParent()
        let parentBlock = this.getSurroundParent();
        while (parentBlock) {
            switch (parentBlock.getDataStr()) {
                case 'isFunc':
                    //get values from function parameter
                    if (parentBlock.funcParam_) {
                        for (let i = 0; i < parentBlock.funcParam_.length; ++i) {
                            if (this.getVar_ === parentBlock.funcParam_[i][3]) {
                                this.isConst_ = parentBlock.funcParam_[i][0];
                                this.typegetVar_ = parentBlock.funcParam_[i][1];
                                this.ptrType_ = parentBlock.funcParam_[i][2];
                                this.isInitialized_ = parentBlock.funcParam_[i][4];
                            }

                            // Set pointer level
                            if (parentBlock.isPointer_) {
                                this.pointerLevel_ = 1 + parentBlock.pointerLevel_;
                            } else {
                                this.pointerLevel_ = 1;
                            }
                            switch (this.pointerLevel_) {
                                case 1:
                                    this.operator_ = "*";
                                    break;
                                case 2:
                                    this.operator_ = "**";
                                    break;
                                case 3:
                                    this.operator_ = "***";
                                    break;
                            }
                        }
                    }
                    break;
                case 'isStruct':
                    for (let i = 0; i < parentBlock.classVar_.length; ++i) {
                        if (this.getVar_ === parentBlock.classVar_[i][3]) {
                            this.isConst_ = parentBlock.classVar_[i][0];
                            this.typegetVar_ = parentBlock.classVar_[i][1];
                            this.ptrType_ = parentBlock.classVar_[i][2];
                            this.isInClass_ = true;
                        }
                    }
                    break;
                case 'isClass':
                    break;
            }

            parentBlock = parentBlock.getSurroundParent();
        }

        //Set typegetVar_
        parentBlock = this.parentBlock_;
        while (parentBlock) {

            switch (parentBlock.getDataStr()) {
                case 'isVar':
                    //Stream data from var declaration block
                    if (this.getVar_ === parentBlock.getVar_) {
                        this.typegetVar_ = parentBlock.typegetVar_;
                        //stream input value
                        this.value_ = parentBlock.value_;
                        this.isInitialized_ = parentBlock.isInitialized_;
                        this.isNull_ = parentBlock.isNull_;
                        this.ptrType_ = parentBlock.ptrType_;
                        this.type_ = parentBlock.type_;
                        this.typeName_ = parentBlock.type_;

                        //stream const option
                        this.isConst_ = parentBlock.isConst_;

                        // Set pointer level
                        if (parentBlock.isPointer_) {
                            this.pointerLevel_ = 1 + parentBlock.pointerLevel_;
                        } else {
                            this.pointerLevel_ = 1;
                        }
                        switch (this.pointerLevel_) {
                            case 1:
                                this.operator_ = "*";
                                break;
                            case 2:
                                this.operator_ = "**";
                                break;
                            case 3:
                                this.operator_ = "***";
                                break;
                        }

                        // console.debug("pointer_reference: identifier_   = " + this.getVar_);
                        // console.debug("pointer_reference: pointerLevel_ = " + this.pointerLevel_);
                        // console.debug("");

                        return;
                    }
                    break;
            }
            parentBlock = parentBlock.parentBlock_;
        }
    },

    allocateVariableParameters: function () {
        let options = [];
        options.push(["", ""]);

        //Loop through to get function variables
        let ptr = this.getSurroundParent();

        while (ptr) {

            switch (ptr.getDataStr()) {
                case 'isFunc':

                    if (ptr.funcParam_) {

                        //Loop through the function array to get the names of parameters
                        for (let i = 0; i < ptr.funcParam_.length; ++i) {
                            options.push([ptr.funcParam_[i][3], ptr.funcParam_[i][3]]);

                            if (this.getVar_ === ptr.funcParam_[i][3]) {
                                this.isConst_ = ptr.funcParam_[i][0];
                                this.typegetVar_ = ptr.funcParam_[i][1];
                            }
                        }
                    }
                    break;

                case 'isStruct':

                    for (let i = 0; i < ptr.classVar_.length; ++i) {
                        options.push([ptr.classVar_[i][3], ptr.classVar_[i][3]]);
                    }
                    break;

                case 'isClass':
                    break;
            }

            ptr = ptr.getSurroundParent();
        }

        for (let i = 0; i < options.length; ++i) {
            this.paramNames_.push(options[i]);
        }

    },

    allocateVariables: function () {
        let C = C_Logic;

        var options = [];
        options.push(["", ""]);

        //Previous declaration
        let ptr = this.parentBlock_;

        while (ptr) {

            switch (ptr.getDataStr()) {
                case 'isVar':
                    options.push([ptr.getVar_, ptr.getVar_]);
                    this.paramCount_ = ptr.paramCount_;
                    break;
            }

            ptr = ptr.parentBlock_;
        }
        ptr = this.getSurroundParent();

        while (ptr) {
            switch (ptr.type) {

                case 'loop_for':
                case 'loop_range':
                    options.push([ptr.getVar_, ptr.getVar_]);

                    if (this.getVar_ === ptr.getVar_) {
                        this.typegetVar_ = ptr.typegetVar_;
                    }

                    break;
            }

            ptr = ptr.getSurroundParent();
        }

        for (var i = 0; i < options.length; ++i) {
            this.paramNames_.push(options[i]);
        }
    },

    allocateScope: function () {

        //Get Scope variable

        let ptr = this.getSurroundParent();

        while (ptr) {

            switch (ptr.getDataStr()) {
                case 'isFunc':

                    for (var i = 0; ptr.paramCount_ && i < ptr.paramCount_; ++i) {
                        (ptr && ptr.paramNames_[i]) ? (this.paramNames_.push([ptr.paramNames_[i], ptr.paramNames_[i]])) : (0);
                    }

                    break;
            }

            ptr = ptr.getSurroundParent();
        }

    },

    allocateWarnings: function () {
        var TT = "";
        C = C_Logic;

        if (!this.parentBlock_) {
            TT += "Block warning, this block has a return and must be connected.\n";
        }

        //Errors if a variable exists
        if (this.getVar_.length > 0) {

            var currentVarFound = false;

            for (var i = 1; i < this.paramNames_.length; ++i) {
                if (this.getFieldValue('VAR') === this.paramNames_[i][1]) {
                    currentVarFound = true;
                    break;
                }
            }

            if (this.isInClass_) {
                let ptr = this.getSurroundParent();

                while (ptr) {
                    switch (ptr.getDataStr()) {
                        case 'isStruct':

                            for (var i = 0; i < ptr.classVar_.length; ++i) {
                                if (this.getVar_ === ptr.classVar_[i][3]) {
                                    currentVarFound = true;
                                    break;
                                }
                            }

                            break;
                    }
                    ptr = ptr.getSurroundParent();
                }

            }


            if (!currentVarFound) {
                TT += 'Block warning, variable "' + this.getVar_ + '" is not declared in this scope.\n';
            }
        }

        if (TT.length > 0) {
            this.setWarningText(TT);
        } else {
            this.setWarningText(null);
        }
    },

    allocateDropdown: function () {
        //Delete any repeating elements in the 2d array
        var temp = [];
        var temp2 = [];

        //grab the data from the matrix
        for (var i = 0; i < this.paramNames_.length; ++i) {
            temp.push(this.paramNames_[i][1]);
        }

        this.paramNames_ = [];

        for (var i = 0; i < temp.length; ++i) {
            if (temp2.indexOf(temp[i]) == -1) {
                temp2.push(temp[i]);
            }
        }

        for (var i = 0; i < temp2.length; ++i) {
            this.paramNames_.push([temp2[i], temp2[i]]);
        }

        return this.paramNames_;
    }

};
Blockly.C['pointer_reference'] = function (block) {
    var code = '';
    code += '&' + this.getVar_;
    return [code, Blockly.C.ORDER_NONE];
};

/* The "pointer_null" block is a simple NULL value that   */
/* can be assigned to a pointer using both the            */
/* "pointer_declare" and "pointer_assignment" blocks.     */
Blockly.Blocks['pointer_null'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("NULL");
        this.setOutput(true);
        this.setColour(pointerBlockHue);
        this.setTooltip("NULL is 0 (zero) i.e. integer constant zero with C-style typecast to void*");
        this.setHelpUrl("");

        this.isNull_ = true;
    },

    onchange: function () {
        this.allocateWarnings();
        this.allocateValues();
    },

    allocateValues: function () {
        this.getVar_ = "NULL";
        this.isPointer_ = true;
    },

    allocateWarnings() {
        var TT = "";

        if (!this.parentBlock_) {
            TT += "Block warning, this block as a return and must be connected.\n";
        }
        //
        if (TT.length > 0) {
            this.setWarningText(TT);
        } else {
            this.setWarningText(null);
        }

    }
};
Blockly.C['pointer_null'] = function () {
    let code = 'NULL';
    return [code, Blockly.C.ORDER_NONE];
};

/* The "pointer_nullptr" block is a simple nullptr value  */
/* that can be assigned to a pointer using both the       */
/* "pointer_declare" and "pointer_assignment" blocks.     */
Blockly.Blocks['pointer_nullptr'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("nullptr");
        this.setOutput(true);
        this.setColour(pointerBlockHue);
        this.setTooltip("nullptr is prvalue of type nullptr_t, which is an integer literal that evaluates to zero");
        this.setHelpUrl("");

        this.isNull_ = true;
    },

    onchange: function () {
        this.allocateValues();
        this.allocateWarnings();
    },

    allocateValues: function () {
        this.getVar_ = "nullptr";
        this.isPointer_ = true;
    },

    allocateWarnings() {
        var TT = "";

        if (!this.parentBlock_) {
            TT += "Block warning, this block as a return and must be connected.\n";
        }

        if (TT.length > 0) {
            this.setWarningText(TT);
        } else {
            this.setWarningText(null);
        }


    }
};
Blockly.C['pointer_nullptr'] = function () {
    let code = 'nullptr';
    return [code, Blockly.C.ORDER_NONE];
};

/* ------------------------------------------------------ */
/* Pointer Assignment                                     */
/* ------------------------------------------------------ */

/* The "pointer_assignment" block is used to assign value */
/* to pointers that have already been declared in the     */
/* current scope.                                         */
Blockly.Blocks['pointer_assignment'] = {
    init: function () {

        this.appendValueInput("valinp1")
            .setCheck(null)
            .appendField("Set");

        this.appendValueInput("valinp2")
            .setCheck(null)
            .appendField("to");

        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(pointerBlockHue);
        this.setTooltip("Sets the variable.");
        this.setHelpUrl("");

    },

    onchange: function () {
        this.allocateValues();
        this.allocateWarnings();

        let block1 = this.getInputTargetBlock('valinp1');
        let block2 = this.getInputTargetBlock('valinp2');
    },

    allocateValues: function () {

        let block = this.getInputTargetBlock('valinp1');
        if (block) {
            this.type_ = block.type_;
            this.identifier_ = block.identifier_;
            this.typeName_ = block.typeName_;

            // Set pointer level
            if (block.isPointer_) {
                this.pointerLevel_ = 1 + block.pointerLevel_;
            } else {
                this.pointerLevel_ = 1;
            }
            switch (this.pointerLevel_) {
                case 1:
                    this.operator_ = "*";
                    break;
                case 2:
                    this.operator_ = "**";
                    break;
                case 3:
                    this.operator_ = "***";
                    break;
            }

        }
    },

    allocateWarnings: function () {
        var TT = "";

        //Input the two input blocks in the array
        let block = [
            this.getInputTargetBlock('valinp1'),
            this.getInputTargetBlock('valinp2')
        ];

        //To compare values, the second block must have an input
        if (block[1]) {

            // console.debug("block[1].isNull_ = " + block[1].isNull_);

            if (!block[1].isNull_) {
                if (block[0].type_ !== block[1].type_) {
                    TT += 'Error, first input is of type "' + block[0].type_ + '", second input is of type "' + block[1].type_ + '".\n';
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
Blockly.C['pointer_assignment'] = function (block) {
    var val1 = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);
    var val2 = Blockly.C.valueToCode(block, 'valinp2', Blockly.C.ORDER_ATOMIC);
    // TODO: Assemble C into code variable.
    var code = '';

    if (val1.length > 0 && val2.length > 0) {
        if (val1 === val2) {
            code += 'this->';
        }

        //output myVar and initialization.
        code += val1 + " = " + val2 + ';\n';
    }

    return code;
};

/* ------------------------------------------------------ */
/* Pointer Operators */
/* ------------------------------------------------------ */

/* The "pointer_operator" block is meant to provide       */
/* flexible use of the "address of" (&) and "dereference" */
/* (*) operators. This block can be placed both before    */
/* and after other blocks.                                */
Blockly.Blocks['pointer_operator'] = {
    init: function () {
        // BLOCK PROPERTIES
        this.setColour(pointerBlockHue);
        this.setTooltip("C++ provides two pointer operators, which are Address of Operator (&) and Indirection Operator (*)");
        this.setHelpUrl("https://www.tutorialspoint.com/cplusplus/cpp_pointer_operators.htm");

        // INPUT
        this.appendValueInput("valueInput")
            // Check the type of the the value input
            .setCheck(null)
            .appendField(new Blockly.FieldDropdown([["&", "&"], ["*", "*"]]),
                "pointerOperator");

        // OUTPUT
        this.setOutput(true, null);
    },

    onchange: function () {
        this.allocateValues();
        this.allocateWarnings();
    },

    allocateValues: function () {
        this.pointerOperator_ = this.getFieldValue('pointerOperator');

        let inputBlock = this.getInputTargetBlock('valueInput');
        if (inputBlock) {
            this.type_ = inputBlock.type_;
            this.typeName_ = inputBlock.typeName_;

            // Set pointer level
            if (inputBlock.isPointer_) {
                this.pointerLevel_ = 1 + inputBlock.pointerLevel_;
            } else {
                this.pointerLevel_ = 1;
            }
            switch (this.pointerLevel_) {
                case 1:
                    this.operator_ = "*";
                    break;
                case 2:
                    this.operator_ = "**";
                    break;
                case 3:
                    this.operator_ = "***";
                    break;
            }

            // console.debug("pointer_operator: identifier_   = " + this.getVar_);
            // console.debug("pointer_operator: pointerLevel_ = " + this.pointerLevel_);
            // console.debug("");
        }
    },

    allocateWarnings: function () {
        let warningText = "";

        let inputBlock = this.getInputTargetBlock('valueInput');
        if (inputBlock) {

            if (this.pointerOperator_ === "&") {
                if (inputBlock.getDataStr() === "isArr" && this.pointerOperator_ === "&") {
                    warningText += "Error, cannot dereference an array.";
                }
                //if (inputBlock.isPointer_) {
                //	warningText += "Error, cannot dereference a pointer.";
                //}
            }
        }

        if (warningText !== "") {
            this.setWarningText(warningText);
        } else {
            this.setWarningText(null);
        }
    }
};
Blockly.C['pointer_operator'] = function (block) {
    // Get the value input block code
    var valueInputCode = Blockly.C.valueToCode(block, 'valueInput', Blockly.C.ORDER_ATOMIC);
    // Construct code
    var code = block.pointerOperator_ + valueInputCode;
    this.getVar_ = code;
    return [code, Blockly.C.ORDER_NONE];
};



