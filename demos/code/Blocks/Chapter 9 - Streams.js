/** Author: Jacob Patzer
 *      Version: 0.1   
 */

/**Set the color of blocks to purple */
var fileHue = 270;

/** input-Filestream initialization block */
Blockly.Blocks["inFS"] = {
    init: function () {
        /** Adds a notch to connect up. */
        this.setPreviousStatement(true, null);
        /** Adds a notch to connect down. */
        this.setNextStatement(true, null);
        /** Sets color of the block. */
        this.setColour(fileHue);
        /** This tooltip text appears when hovering block. */
        this.setTooltip("This block declares an file input stream.");
        /** The Help URL directs to hyperlink when a block is right clicked and Help is selected. */
        this.setHelpUrl("https://www.cplusplus.com/doc/tutorial/files/");

        /** parameter area */
        this.appendValueInput('valinp1') /** name of filestream */
            .appendField('ifstream ')
            .appendField(new Blockly.FieldTextInput('name'), 'myStream')
            .setCheck(null);
    },

    /** The onchange function is called when a block is moved or updated. */
    onchange: function () {
        this.allocateValues();
    },

    allocateValues: function () {
        this.streamName = (this.getFieldValue('myStream'));
    },

}

Blockly.C["inFS"] = function(block) {
    var code ='ifstream ' + this.myStream + ';\n';
    return code;
}

/** output-Filestream initialization block */
Blockly.Blocks["outFS"] = {
    init: function () {
        /** Adds a notch to connect up. */
        this.setPreviousStatement(true, null);
        /** Adds a notch to connect down. */
        this.setNextStatement(true, null);
        /** Sets color of the block. */
        this.setColour(fileHue);
        /** This tooltip text appears when hovering block. */
        this.setTooltip("This block declares an file output stream.");
        /** The Help URL directs to hyperlink when a block is right clicked and Help is selected. */
        this.setHelpUrl("https://www.cplusplus.com/doc/tutorial/files/");

        /** parameter area */
        this.appendValueInput('valinp1') /** name of filestream */
            .appendField('ofstream ')
            .appendField(new Blockly.FieldTextInput('name'), 'myStream')
            .setCheck(null);

    },

    /** The onchange function is called when a block is moved or updated. */
    onchange: function () {
        this.allocateValues();
    },

    allocateValues: function () {
        this.streamName = (this.getFieldValue('myStream'));
    },

}

Blockly.C["outFS"] = function(block) {
    var code ='ofstream ' + this.myStream + ';\n';
    return code;
}

/** Input String-stream initialization block */
Blockly.Blocks["iStream"] = {
    init: function () {
        /** Adds a notch to connect up. */
        this.setPreviousStatement(true, null);
        /** Adds a notch to connect down. */
        this.setNextStatement(true, null);
        /** Sets color of the block. */
        this.setColour(fileHue);
        /** This tooltip text appears when hovering block. */
        this.setTooltip("This block declares an file output stream.");
        /** The Help URL directs to hyperlink when a block is right clicked and Help is selected. */
        this.setHelpUrl("https://www.cplusplus.com/doc/tutorial/files/");

        /** parameter area */
        this.appendValueInput('valinp1') /** name of filestream */
        .appendField('istringstream ')
        .appendField(new Blockly.FieldTextInput('name'), 'myStream')
        .setCheck(null);

    },

    /** The onchange function is called when a block is moved or updated. */
    onchange: function () {
        this.allocateValues();
    },

    allocateValues: function () {
        this.streamName = (this.getFieldValue('myStream'));
    },

}

Blockly.C["iStream"] = function(block) {
    var code ='istringstream ' + this.streamName + ';\n';
    return code;
}

Blockly.Blocks["oStream"] = {
    init: function () {
        /** Adds a notch to connect up. */
        this.setPreviousStatement(true, null);
        /** Adds a notch to connect down. */
        this.setNextStatement(true, null);
        /** Sets color of the block. */
        this.setColour(fileHue);
        /** This tooltip text appears when hovering block. */
        this.setTooltip("This block declares an file output stream.");
        /** The Help URL directs to hyperlink when a block is right clicked and Help is selected. */
        this.setHelpUrl("https://www.cplusplus.com/doc/tutorial/files/");

        /** parameter area */
        this.appendValueInput('valinp1') /** name of filestream */
            .appendField('ostringstream ')
            .appendField(new Blockly.FieldTextInput('name'), 'myStream')
            .setCheck(null);

    },

    /** The onchange function is called when a block is moved or updated. */
    onchange: function () {
        this.allocateValues();
    },

    allocateValues: function () {
        this.streamName = (this.getFieldValue('myStream'));
    },

}

Blockly.C["oStream"] = function(block) {
    var code = 'ostringstream ' + this.streamName + ';\n';

    return code;
}




Blockly.Blocks["FS_Open"] = {
    init: function () {
        /** Adds a notch to connect up. */
        this.setPreviousStatement(true, null);
        /** Adds a notch to connect down. */
        this.setNextStatement(true, null);
        /** Sets color of the block. */
        this.setColour(fileHue);
        /** This tooltip text appears when hovering block. */
        this.setTooltip("This block declares an file input stream.");
        /** The Help URL directs to hyperlink when a block is right clicked and Help is selected. */
        this.setHelpUrl("https://www.cplusplus.com/doc/tutorial/files/");

        this.setInputsInline(true);

        /** parameter area */
        this.appendValueInput('valinp1') /** name of filestream */
            .appendField(new Blockly.FieldDropdown([['myFS', 'myFS'], ['myFS2', 'myFS2']]), 'fsName')
            .appendField('.open(');
        this.appendDummyInput()
            .appendField(')');
    },

    /** The onchange function is called when a block is moved or updated. */
    onchange: function () {
        this.allocateWarnings;
    },

    allocateWarnings: function () {
        var TT = "";
        
        let librarySearch = C_Include;

        var libFound = librarySearch.search_library(this, ['include_fstream']);

        if (!libFound) {
            TT += "Error, <fstream> library must be included.\n";
        }

        if (TT.length > 0) {
            this.setWarningText(TT);
        } else {
            this.setWarningText(null);
        }

    }

}

Blockly.C["FS_Open"] = function(block) {
    var fsNameVar = this.getFieldValue('fsName');
    var value_name = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);

    var code = fsNameVar + '.open(' + value_name + ')';

    return code + ';\n';
}

Blockly.Blocks["FS_Close"] = {
    init: function () {
        /** Adds a notch to connect up. */
        this.setPreviousStatement(true, null);
        /** Adds a notch to connect down. */
        this.setNextStatement(true, null);
        /** Sets color of the block. */
        this.setColour(fileHue);
        /** This tooltip text appears when hovering block. */
        this.setTooltip("This block declares an file input stream.");
        /** The Help URL directs to hyperlink when a block is right clicked and Help is selected. */
        this.setHelpUrl("https://www.cplusplus.com/doc/tutorial/files/");

        /** parameter area */
        this.appendValueInput('valinp1') /** name of filestream */
            .appendField(new Blockly.FieldDropdown([['myFS', 'myFS'], ['myFS2', 'myFS2']]), 'fsName')
            .appendField('.close(');
        this.appendDummyInput()
            .appendField(')');

    
        /** Blocks will appear connected across one line. */
        this.setInputsInline(true);

    },

    /** The onchange function is called when a block is moved or updated. */
    onchange: function () {
        this.allocateWarnings;
    },

    allocateWarnings: function () {
        let librarySearch = C_Include;

        var libFound = librarySearch.search_library(this, ['include_fstream']);

        if (!libFound) {
            TT += "Error, <fstream> library must be included.\n";
        }
    }

}

Blockly.C["FS_Close"] = function(block) {
    var fsNameVar = this.getFieldValue('fsName');
    var value_name = Blockly.C.valueToCode(block, 'valinp1', Blockly.C.ORDER_ATOMIC);

    var code = fsNameVar + '.close(' + value_name + ')';

    return code + ';\n';
}



Blockly.Blocks['FS_input'] = {
    init: function () {

        this.appendValueInput("valinp0")
            .setCheck(this.setFSCheck)
            .appendField("inFS >>")
            .setAlign(Blockly.ALIGN_RIGHT);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(fileHue);
        this.setTooltip("Grabs input from file.\nRequires - <fstream>");
        this.setHelpUrl("https://www.cplusplus.com/doc/tutorial/files/");

        this.setMutator(new Blockly.Mutator(['FS_stream_add']));

        this.FSStreamCount_ = 0;

        this.setFSCheck = 'Variable';

    },

    mutationToDom: function () {
        if (!this.FSStreamCount_) {
            return null;
        }
        var container = document.createElement('mutation');

        if (this.FSStreamCount_) {
            container.setAttribute('printadd', this.FSStreamCount_);
        }

        return container;
    },

    domToMutation: function (xmlElement) {
        this.FSStreamCount_ = parseInt(xmlElement.getAttribute('printadd'), 10);
        for (var i = 1; i <= this.FSStreamCount_; i++) {
            this.appendValueInput('valinp' + i).setCheck(this.setFSCheck).appendField('inFS >> ').setAlign(Blockly.ALIGN_RIGHT);
        }
    },

    decompose: function (workspace) {
        var containerBlock = workspace.newBlock('FS_stream_mutator');
        containerBlock.initSvg();

        var connection = containerBlock.getInput('STACK').connection;

        for (var i = 1; i <= this.FSStreamCount_; ++i) {
            var add = workspace.newBlock('FS_stream_add');
            add.initSvg();

            console.log(this.FSStreamCount_);
            connection.connect(add.previousConnection);
            connection = add.nextConnection;
        }
        return containerBlock;
    },

    compose: function (containerBlock) {
        for (var i = this.FSStreamCount_; i > 0; i--) {
            this.removeInput('valinp' + i);
        }
        this.FSStreamCount_ = 0;

        var clauseBlock = containerBlock.getInputTargetBlock('STACK');
        while (clauseBlock) {

            switch (clauseBlock.type) {

                case 'FS_stream_add':
                    this.FSStreamCount_++;
                    var printInput = this.appendValueInput('valinp' + this.FSStreamCount_)
                        .setCheck(this.setFSCheck).appendField('inFS >> ').setAlign(Blockly.ALIGN_RIGHT);

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

                case 'FS_stream_add':
                    var inputPrint = this.getInput('valinp' + i);
                    clauseBlock.valueConnection_ = inputPrint && inputPrint.connection.targetConnection;
                    clauseBlock.statementConnection_ = i++;
                    break;

                default:
                    throw 'Unknown block type.';
            }
            clauseBlock = clauseBlock.nextConnection &&
                clauseBlock.nextConnection.targetBlock();
        }
    },

    onchange: Blockly.Blocks.requireInFunction,

    onchange: function () {

        this.allocateWarnings();
    },

    allocateWarnings: function () {
        var TT = "";

        var librarySearch = C_Include;

        var libFound = librarySearch.search_library(this, ['include_fstream']);

        if (!libFound) {
            TT += "Error, <fstream> library must be included.\n";
        }

        if (TT.length > 0) {
            this.setWarningText(TT);
        } else {
            this.setWarningText(null);
        }

    },
    customContextMenu: function (options) {
        //save the current scope
        let BlockScope = this;

        var librarySearch = C_Include;
        var libFound = librarySearch.search_library(this, ['include_fstream']);

        //create an initialization block
        if (!libFound) {

            automate_library_string = {
                text: "include <fstream>",
                enabled: true,

                callback: function () {
                    var newBlock = BlockScope.workspace.newBlock('include_fstream');
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

Blockly.C['FS_input'] = function (block) {
    var val = Blockly.C.valueToCode(block, 'valinp0', Blockly.C.ORDER_NONE);
    // TODO: Assemble C into code variable.
    var code = '';
    var std = '';
    var WT = false;
    //tooltip for warning text

    C = C_Include;
    if (!C.using.std(block)) {
        std = 'std::';
    }

    if (this.FSStreamCount_ < 1 && !val) {
        WT = true;
    } else if (this.FSStreamCount_ < 1 && val) {
        code += std + 'inFS >> ' + val;
    } else if (this.FSStreamCount_ > 0 && !val) {
        WT = true;
    } else {

        code += std + 'inFS >> ' + val;

        for (var i = 1; i <= this.FSStreamCount_; ++i) {
            var arg = Blockly.C.valueToCode(block, 'valinp' + i, Blockly.C.ORDER_NONE);
            var childConnection = this.inputList[i].connection;
            var childBlock = childConnection.targetBlock();


            if (childBlock) {
                code += ' >> ' + arg;
            } else {
                WT = true;
            }
        }
    }

    this.setWarningText(null);
    if (WT == true) {
        this.setWarningText("Block warning: all FS inputs must be attached to a variable block.");
    }

    if (code.length > 0) {
        code += ';\n';
    }

    return code;
};

Blockly.Blocks['FS_output'] = {
    init: function () {

        this.appendValueInput("valinp0")
            .setCheck(this.setFSCheck)
            .appendField("outFS >>")
            .setAlign(Blockly.ALIGN_RIGHT);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(fileHue);
        this.setTooltip("Grabs input from file.\nRequires - <fstream>");
        this.setHelpUrl("https://www.cplusplus.com/doc/tutorial/files/");

        this.setMutator(new Blockly.Mutator(['FS_stream_add']));

        this.FSStreamCount_ = 0;

        this.setFSCheck = 'Variable';

    },

    mutationToDom: function () {
        if (!this.FSStreamCount_) {
            return null;
        }
        var container = document.createElement('mutation');

        if (this.FSStreamCount_) {
            container.setAttribute('printadd', this.FSStreamCount_);
        }

        return container;
    },

    domToMutation: function (xmlElement) {
        this.FSStreamCount_ = parseInt(xmlElement.getAttribute('printadd'), 10);
        for (var i = 1; i <= this.FSStreamCount_; i++) {
            this.appendValueInput('valinp' + i).setCheck(this.setFSCheck).appendField('inFS >> ').setAlign(Blockly.ALIGN_RIGHT);
        }
    },

    decompose: function (workspace) {
        var containerBlock = workspace.newBlock('FS_stream_mutator');
        containerBlock.initSvg();

        var connection = containerBlock.getInput('STACK').connection;

        for (var i = 1; i <= this.FSStreamCount_; ++i) {
            var add = workspace.newBlock('FS_stream_add');
            add.initSvg();

            console.log(this.FSStreamCount_);
            connection.connect(add.previousConnection);
            connection = add.nextConnection;
        }
        return containerBlock;
    },

    compose: function (containerBlock) {
        for (var i = this.FSStreamCount_; i > 0; i--) {
            this.removeInput('valinp' + i);
        }
        this.FSStreamCount_ = 0;

        var clauseBlock = containerBlock.getInputTargetBlock('STACK');
        while (clauseBlock) {

            switch (clauseBlock.type) {

                case 'FS_stream_add':
                    this.FSStreamCount_++;
                    var printInput = this.appendValueInput('valinp' + this.FSStreamCount_)
                        .setCheck(this.setFSCheck).appendField('inFS >> ').setAlign(Blockly.ALIGN_RIGHT);

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

                case 'FS_stream_add':
                    var inputPrint = this.getInput('valinp' + i);
                    clauseBlock.valueConnection_ = inputPrint && inputPrint.connection.targetConnection;
                    clauseBlock.statementConnection_ = i++;
                    break;

                default:
                    throw 'Unknown block type.';
            }
            clauseBlock = clauseBlock.nextConnection &&
                clauseBlock.nextConnection.targetBlock();
        }
    },

    onchange: Blockly.Blocks.requireInFunction,

    onchange: function () {

        this.allocateWarnings();
    },

    allocateWarnings: function () {
        var TT = "";

        var librarySearch = C_Include;

        var libFound = librarySearch.search_library(this, ['include_fstream']);

        if (!libFound) {
            TT += "Error, <fstream> library must be included.\n";
        }

        if (TT.length > 0) {
            this.setWarningText(TT);
        } else {
            this.setWarningText(null);
        }

    },
    customContextMenu: function (options) {
        //save the current scope
        let BlockScope = this;

        var librarySearch = C_Include;
        var libFound = librarySearch.search_library(this, ['include_fstream']);

        //create an initialization block
        if (!libFound) {

            automate_library_string = {
                text: "include <fstream>",
                enabled: true,

                callback: function () {
                    var newBlock = BlockScope.workspace.newBlock('include_fstream');
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

Blockly.C['FS_output'] = function (block) {
    var val = Blockly.C.valueToCode(block, 'valinp0', Blockly.C.ORDER_NONE);
    // TODO: Assemble C into code variable.
    var code = '';
    var std = '';
    var WT = false;
    //tooltip for warning text

    C = C_Include;
    if (!C.using.std(block)) {
        std = 'std::';
    }

    if (this.FSStreamCount_ < 1 && !val) {
        WT = true;
    } else if (this.FSStreamCount_ < 1 && val) {
        code += std + 'inFS >> ' + val;
    } else if (this.FSStreamCount_ > 0 && !val) {
        WT = true;
    } else {

        code += std + 'inFS >> ' + val;

        for (var i = 1; i <= this.FSStreamCount_; ++i) {
            var arg = Blockly.C.valueToCode(block, 'valinp' + i, Blockly.C.ORDER_NONE);
            var childConnection = this.inputList[i].connection;
            var childBlock = childConnection.targetBlock();


            if (childBlock) {
                code += ' >> ' + arg;
            } else {
                WT = true;
            }
        }
    }

    this.setWarningText(null);
    if (WT == true) {
        this.setWarningText("Block warning: all FS inputs must be attached to a variable block.");
    }

    if (code.length > 0) {
        code += ';\n';
    }

    return code;
};

Blockly.Blocks['outSS'] = {
    init: function () {
        this.appendValueInput("valinp0")
            .setCheck(null)
            .appendField("outSS <<");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(fileHue);

        this.setMutator(new Blockly.Mutator(['outSS_stream_add']));

        //count of added outSS's in the stream
        this.outSStreamCount_ = 0;
    },

    mutationToDom: function () {
        if (!this.outSStreamCount_) {
            return null;
        }
        var container = document.createElement('mutation');

        if (this.outSStreamCount_) {
            container.setAttribute('printadd', this.outSStreamCount_);
        }

        return container;
    },

    domToMutation: function (xmlElement) {
        this.OutSStreamCount_ = parseInt(xmlElement.getAttribute('printadd'), 10);
        for (var i = 1; i <= this.outSStreamCount_; ++i) {
            this.appendValueInput('valinp' + i).setCheck(null).appendField(' << ').setAlign(Blockly.ALIGN_RIGHT);
        }
    },

    decompose: function (workspace) {
        var containerBlock = workspace.newBlock('outSS_mutator');
        containerBlock.initSvg();

        var connection = containerBlock.getInput('STACK').connection;
        for (var i = 1; i <= this.outSStreamCount_; ++i) {
            var add = workspace.newBlock('outSS_add');
            add.initSvg();

            connection.connect(add.previousConnection);
            connection = add.nextConnection;
        }

        return containerBlock;
    },

    compose: function (containerBlock) {
        for (var i = this.outSStreamCount_; i > 0; i--) {
            this.removeInput('valinp' + i);
        }
        this.outSStreamCount_ = 0;

        var clauseBlock = containerBlock.getInputTargetBlock('STACK');

        while (clauseBlock) {
            switch (clauseBlock.type) {
                case 'outSS_add':
                    this.outSStreamCount_++;

                    var printInput = this.appendValueInput('valinp' + this.outSStreamCount_)
                        .setCheck(null).appendField(' << ').setAlign(Blockly.ALIGN_RIGHT);

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
                case 'outSS_add':
                    var inputPrint = this.getInput('valinp' + i);

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

    onchange: function () {
    },

};

Blockly.C['outSS'] = function (block) {
    var code = '';
    var std = '';

    C = C_Include;

    if (!C.using.std(block)) {
        std = 'std::';
    }
    
    code += 'outSS';

    for (var i = 0; i <= block.outSStreamCount_; ++i) {
        var arg = Blockly.C.valueToCode(block, 'valinp' + i, Blockly.C.ORDER_NONE);

        if (arg.length > 0) {
            code += ' << ' + arg;
        } else {
            code += ' << ' + std + 'endl';
        }

    }


    code += ';\n';
    return code;
};

Blockly.Blocks['inSS'] = {
    init: function () {
        this.appendValueInput("valinp0")
            .setCheck(null)
            .appendField("inSS <<");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(fileHue);

        this.setMutator(new Blockly.Mutator(['inSS_stream_add']));

        //count of added inSS's in the stream
        this.inSStreamCount_ = 0;
    },

    mutationToDom: function () {
        if (!this.inSStreamCount_) {
            return null;
        }
        var container = document.createElement('mutation');

        if (this.inSStreamCount_) {
            container.setAttribute('printadd', this.inSStreamCount_);
        }

        return container;
    },

    domToMutation: function (xmlElement) {
        this.inSStreamCount_ = parseInt(xmlElement.getAttribute('printadd'), 10);
        for (var i = 1; i <= this.inSStreamCount_; ++i) {
            this.appendValueInput('valinp' + i).setCheck(null).appendField(' << ').setAlign(Blockly.ALIGN_RIGHT);
        }
    },

    decompose: function (workspace) {
        var containerBlock = workspace.newBlock('inSS_mutator');
        containerBlock.initSvg();

        var connection = containerBlock.getInput('STACK').connection;
        for (var i = 1; i <= this.inSStreamCount_; ++i) {
            var add = workspace.newBlock('inSS_add');
            add.initSvg();

            connection.connect(add.previousConnection);
            connection = add.nextConnection;
        }

        return containerBlock;
    },

    compose: function (containerBlock) {
        for (var i = this.inSStreamCount_; i > 0; i--) {
            this.removeInput('valinp' + i);
        }
        this.inSStreamCount_ = 0;

        var clauseBlock = containerBlock.getInputTargetBlock('STACK');

        while (clauseBlock) {
            switch (clauseBlock.type) {
                case 'inSS_add':
                    this.inSStreamCount_++;

                    var printInput = this.appendValueInput('valinp' + this.inSStreamCount_)
                        .setCheck(null).appendField(' << ').setAlign(Blockly.ALIGN_RIGHT);

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
                case 'inSS_add':
                    var inputPrint = this.getInput('valinp' + i);

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

    onchange: function () {
    },

};

Blockly.C['inSS'] = function (block) {
    var code = '';
    var std = '';

    C = C_Include;

    if (!C.using.std(block)) {
        std = 'std::';
    }

    code += 'inSS';

    for (var i = 0; i <= block.inSStreamCount_; ++i) {
        var arg = Blockly.C.valueToCode(block, 'valinp' + i, Blockly.C.ORDER_NONE);

        if (arg.length > 0) {
            code += ' << ' + arg;
        } else {
            code += ' << ' + std + 'endl';
        }

    }


    code += ';\n';
    return code;
};


    