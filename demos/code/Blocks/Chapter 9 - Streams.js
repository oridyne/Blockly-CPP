/** Author: Jacob Patzer
 *      Version: 0.1   
 */

/**Set the color of blocks to purple */
var classHue = 50;

/** in-Filestream initialization block */
Blockly.Blocks["inFS"] = {
    init: function () {
        /** Adds a notch to connect up. */
        this.setPreviousStatement(true, null);
        /** Adds a notch to connect down. */
        this.setNextStatement(true, null);
        /** Sets color of the block. */
        this.setColour(classHue);
        /** This tooltip text appears when hovering block. */
        this.setTooltip("This block declares an file input stream.");
        /** The Help URL directs to hyperlink when a block is right clicked and Help is selected. */
        this.setHelpUrl("https://www.cplusplus.com/doc/tutorial/files/");

        /** parameter area */
        this.appendValueInput('valinp1') /** name of filestream */
            .appendField(new Blockly.FieldDropdown([['', ''], ['~', '~']]), 'con_type')
            .appendField('stream name', 'con_name')
            .appendField('(');
        this.appendDummyInput()
            .appendField(')');

        /** Blocks will appear connected across one line. */
        this.setInputsInline(true);

    
    

    },

    /** The onchange function is called when a block is moved or updated. */
    onchange: function () {
        this.allocateValues();
    },

}

Blockly.Blocks['FS_input'] = {
    init: function () {

        this.appendValueInput("valinp0")
            .setCheck(this.setCinCheck)
            .appendField("inFS >>")
            .setAlign(Blockly.ALIGN_RIGHT);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(classHue);
        this.setTooltip("Grabs input from file.\nRequires - <fstream>");
        this.setHelpUrl("https://www.cplusplus.com/doc/tutorial/files/");

        this.setMutator(new Blockly.Mutator(['cin_stream_add']));

        this.cinStreamCount_ = 0;

        this.setCinCheck = 'Variable';

    },
}
    