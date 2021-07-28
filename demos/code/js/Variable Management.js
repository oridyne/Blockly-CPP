/**
 * 	@author Joseph Pauplis
 * 	@version 0.1
 */

C_Var = {};

C_Var.get = {};

const classList = new Map();

/**
 * 	A function for returning the data of parameter blocks.
 */
C_Var.get.parameters = function(block){
	let ptr = block;
	const options = [];
	while(ptr)
	{
		/// If the block is not a parameter block, exit loop.
		if (ptr.type !== "func_parameters" && ptr.type !== "class_parameters") {
			return;
		}
		/// If it is, begin streaming variables.
		if (ptr.paramProp_) {
			options.push(ptr.paramProp_);
		}
		/// Get next parameter block.
		ptr = ptr.childBlocks_[0];
	}
	return options;
};

/**
 * A function for returning the data of class parameter blocks,
 *	allowing the copy constructor to pass in a class object,
 *	and be able to call that object's public member functions.
 * @param block
 */
C_Var.get.classParameterMembers = function(block){
	let ptr = block;
	const options = [];
	while (ptr)
	{
		/// Check that the block is a class parameter block.
		if (ptr.type === "class_parameters")
		{
			/// Stream only the public data members.
			options.push([
				ptr.classVarPublic_,
				ptr.classFuncProp_,
				ptr.classFuncParam_
			]);
		}

		/// Get the next parameter block.
		ptr = ptr.childBlocks_[0];
	}
	return options;
};

/**
 * Checks dropdown options for duplicates
 * @param options the list of options to search
 * @param optionName the option to search for
 * @returns {boolean} __True__ if no duplicates
 */
C_Var.get.dropdownCheckOld = function(options, optionName) {
	let doesNotHaveOption = true;
	for(let i = 0; i < options.length; i++) {
		if(options[i][0] === optionName){
			doesNotHaveOption = false;
			break;
		}
	}
	return doesNotHaveOption;
}

/**
 * Removes duplicates from dropdown options
 * Sets empty default if current option is invalid
 * @param a the dropdown options array
 * @param fieldName
 * @param block the block holding the field
 * @returns {string[][]|*}
 */
C_Var.get.checkDropdown = function(a, fieldName, block) {
	let fieldVal = block.getFieldValue(fieldName);
	const seen = {};

	// Filter array to only have unique entries
	a =	a.filter(function(item) {
		return seen.hasOwnProperty(item) ? false : (seen[item] = true);
	});
	if(a.length <= 0) {
		a = [["", ""]]
		if(fieldVal) block.setFieldValue('', fieldName);
		return a;
	}
	if (fieldVal) {
		let fieldValIsNotPresent = true;
		a.map(item => {
			if(item[0] === fieldVal) {
				fieldValIsNotPresent = false;
			}
		});
		if(fieldValIsNotPresent) {
			block.setFieldValue('', fieldName);
		}
		// else {
		// 	let fieldA = block.getField(fieldName);
		// 	if (fieldA) {
		// 		let selectedOp = fieldA.getOptions(!0)[fieldA.selectedIndex_]
		// 		if (selectedOp) {
		// 			if(selectedOp[0] !== fieldVal) {
		// 				for (let i = 0; i < a.length; i++) {
		// 					if (a[i][0] === fieldVal) {
		// 						fieldA.selectedIndex_ = i;
		// 					}
		// 				}
		// 				fieldA.textContent_.data= fieldVal;
		// 			}
		// 		}
		// 	}
		// }
	}
	return a;
}

///TODO find out why dropdowns bug on file switch
/**
 * NOTE: EXPERIMENTAL FUNCTION<br>
 * Updates dropdown text if it is not displaying correct value
 * @param a
 * @param fieldName
 * @param block
 */
C_Var.get.updateDropdownText = function(a, fieldName, block) {
	let fieldA = block.getField(fieldName);
	let fieldVal = '';
	if (fieldA) {
	    fieldVal = fieldA.getValue();
		let selectedOp = fieldA.getOptions(!0)[fieldA.selectedIndex_]
		if (selectedOp) {
			if(selectedOp[0] !== fieldVal) {
				for (let i = 0; i < a.length; i++) {
					if (a[i][0] === fieldVal) {
						fieldA.selectedIndex_ = i;
					}
				}
				fieldA.setValue(selectedOp[0]);
				fieldA.setValue(fieldVal);
				// fieldA.textContent_.data = fieldVal;
			}
		}
	}
}