C_Var = {};

C_Var.get = {};

C_Var.get.parameters = function(block){
	let ptr = block;
	
	var options = [];

	while(ptr)
	{
		if (ptr.type !== "func_parameters" && ptr.type !== "class_parameters")
		{
			return;
		}
		
		if (ptr.paramProp_)
		{
			options.push(ptr.paramProp_);
			
		}
		
		ptr = ptr.childBlocks_[0];
	}
	
	return options;
};

C_Var.get.classParameterMembers = function(block){
	let ptr = block;
	
	var options = [];
	
	while (ptr)
	{
		if (ptr.type === "class_parameters")
		{
			options.push([
				ptr.classVarPublic_,
				ptr.classFuncProp_,
				ptr.classFuncParam_
			]);
		}
		console.log(ptr);
		ptr = ptr.childBlocks_[0];
	}
	console.log(options);
	return options;
};