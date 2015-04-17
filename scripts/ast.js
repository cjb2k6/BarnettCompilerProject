var compMode = false;
var addMode = false;
var firstChild = {};
var strMode = false;
var strBuild = "";
var strLineNum = -1;
function makeAST(){
	// Recursive function to handle the expansion of the nodes.
	function expand(node, depth)
	{
		// If there are no children (i.e., leaf nodes)...
		if ((!node.children || node.children.length === 0) && node.name !== "while")
		{
			var n = node.name;
			//See if the node is a skippable leaf node
			if(n !== "{" && n !== "}" && n !== "(" && n !== "print" && n !== "=" && n !== "epsilon" && n !== "+"){
				//If the node is a "
				if(n === "\""){
					//We are dealing with a string, tack a " on to the string builder
					strBuild += "\"";
					//If we are in string mode already
					if(strMode){
						//Then this " must indicate the end of the string
						var str = new tokenObj(strLineNum, "T_StringLiteral", strBuild);
						ast.addLeafNode(str);
						strMode = false;
						strBuild = "";
						strLineNum = -1;
					}else{
						//This " must indicate the start of a string
						strLineNum = node.token.lineNum; //Take the line num of the " as the line num of the string
						strMode = true; //We are now in string mode
					}
				//If we are in the middle of a string
				}else if(strMode){
					//Add the char to the string builder
					strBuild += node.token.value;
				//Else, this leaf has nothing to do with a string
				}else if(node.token.type === "T_BOOLOP"){
					//If it is an Equals comparison
					if(n === "=="){
						//Make the new comparison branch
						ast.current.name = "EqualComp";
						ast.current.token = node.token;
					//If it is a Not Equals comparison
					}else if(n === "!="){
						//Make the new comparison branch
						ast.current.name = "NotEqualComp";
						ast.current.token = node.token;
					}else{
						//Should never happen
						putMessage("Something went horribly wrong with the BOOLOP in the AST");
					}
				//If we are still in the process or reassigning the leaf under the new comparison branch
				}else if(n == ")"){
					//Do nothing
				}else{
				ast.addLeafNode(node.token);
				}
			}
		}
		//Node is a branch
		else
		{
			
			var n = node.name;
			//Is this an important branch?
			if(n === "Block" || n === "VarDecl" || n === "PrintStatement" || n === "AssignmentStatement"){
				ast.addBranchNode(node.name);
				
				for (var i = 0; i < node.children.length; i++)
				{
					expand(node.children[i], depth + 1);
				}
				//Return to the parent of the current AST node
				ast.rtp();
			}else if(n === "BooleanExpr"){
				if(node.children[0].name === "true" || node.children[0].name === "false"){
					expand(node.children[0], depth + 1);
					
				}else{
					ast.addBranchNode("BooleanExpr");
					for (var i = 0; i < node.children.length; i++)
				{
					expand(node.children[i], depth + 1);
				}
				//Return to the parent of the current AST node
				ast.rtp();
				}
				
			}else if(n === "IntExpr"){
				if(node.children[0].name === "+"){
					ast.addBranchNode("+");
					for (var i = 0; i < node.children.length; i++)
				{
					expand(node.children[i], depth + 1);
				}
				//Return to the parent of the current AST node
				ast.rtp();
				}else{
					expand(node.children[0], depth + 1);
					//ast.rtp();
				}
				
			}else if(n == "if" || n == "while"){ 
				ast.addBranchNode(node.name);
				
				for (var i = 0; i < node.children.length; i++)
				{
					expand(node.children[i], depth + 1);
				}
			}else{
				for (var i = 0; i < node.children.length; i++)
				{
					expand(node.children[i], depth + 1);
				}
			}
		}
	}
	// Make the initial call to expand from the root.
	ast.addBranchNode("ROOT");
	expand(cst.root, 0);
};