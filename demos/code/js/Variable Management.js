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
	a = a.filter(function (item) {
		return seen.hasOwnProperty(item) ? false : (seen[item] = true);
	});

	if (a.length <= 0) {
		a = [["", ""]]
		if (fieldVal) block.setFieldValue('', fieldName);
		return a;
	}

	if (fieldVal) {
		let fieldValIsNotPresent = true;
		a.map(item => {
			if (item[0] === fieldVal) {
				fieldValIsNotPresent = false;
			}
		});
		if (fieldValIsNotPresent) {
			block.setFieldValue('', fieldName);
		}
	}

	return a;
}