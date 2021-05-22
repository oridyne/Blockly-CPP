/** Author: Joseph Pauplis
 * 	Version: 0.1
 */

C_Var = {};

C_Var.get = {};

var classArrayList = [];

/// A function for returning the data of parameter blocks.
C_Var.get.parameters = function(block){
	let ptr = block;
	var options = [];
	while(ptr)
	{
		/// If the block is not a parameter block, exit loop.
		if (ptr.type !== "func_parameters" && ptr.type !== "class_parameters")
		{
			return;
		}
		/// If it is, begin streaming variables.
		if (ptr.paramProp_)
		{
			options.push(ptr.paramProp_);
			//console.log(options);
		}
		/// Get next parameter block.
		ptr = ptr.childBlocks_[0];
	}
	return options;
};

/** A function for returning the data of class parameter blocks,
 *	allowing the copy constructor to pass in a class object,
 *	and be able to call that object's public member functions. 
 */
C_Var.get.classParameterMembers = function(block){
	let ptr = block;
	var options = [];
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
		//console.log(ptr);
		/// Get the next parameter block.
		ptr = ptr.childBlocks_[0];
	}
	//console.log(options);
	return options;
};

//Save information from define block, include block copies that information
C_Var.get.saveClassInfo = function(block) {
	var tempBlock = block;

	var doesExist = false;
	for(var i =0; i < classArrayList.length; i++) { 
		if(classArrayList[i].className_ === block.className_) {
		doesExist = true; 
		break;
		}
	}
	
	if(!doesExist && (block.className_ !== 'Main.cpp')) {
		classArrayList.push(block);
	}
	console.log(classArrayList);
}


