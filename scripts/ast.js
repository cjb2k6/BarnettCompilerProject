var compMode = false;
var firstChild = {};
var strMode = false;
var strBuild = "";
var strLineNum = -1;
function makeAST(){
	// Recursive function to handle the expansion of the nodes.
	function expand(node, depth)
	{
		// If there are no children (i.e., leaf nodes)...
		if (!node.children || node.children.length === 0)
		{
			var n = node.name
			//See if the node is a skippable leaf node
			if(n !== "{" && n !== "}" && n !== "(" && n !== ")" && n !== "print" && n !== "=" && n !== "epsilon" ){
				//If the node is a "
				if(n === "\""){
					//We are dealing with a string, tack a " on to the string builder
					strBuild += "\"";
					//If we are in string mode already
					if(strMode){
						//Then this " must indicate the end of the string
						ast.addLeafNode(new tokenObj(strLineNum, "T_StringLiteral", strBuild));
						//putMessage("Added " + node.name + " as a leaf in the AST to " + ast.current.name);
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
				//Is the node a BOOLOP?
				}else if(node.token.type === "T_BOOLOP"){
					//Need to reassign the last leaf that was added
					compMode = true;
					//Save the first child of the comparison
					var index = ast.current.children.length - 1
					firstChild = ast.current.children[index].token;
					//putMessage("The old first child was " + ast.current.children[index].token);
					//putMessage("firstChild is now " + firstChild);
					//Remove that first child
					ast.current.children.splice(index,1);
					//If it is an Equals comparison
					if(n === "=="){
						//Make the new comparison branch
						ast.addBranchNode("EqualComp");
						//putMessage("Added EqualComp as a branch in the AST");
					//If it is a Not Equals comparison
					}else if(n === "!="){
						//Make the new comparison branch
						ast.addBranchNode("NotEqualComp");
						//putMessage("Added NotEqualComp as a branch in the AST");
					}else{
						//Should never happen
						putMessage("Something went horribly wrong with the BOOLOP in the AST");
					}
				//If we are still in the process or reassigning the leaf under the new comparison branch
				}else if(compMode){
					//Add the leaf we removed to the new comparison branch
					ast.addLeafNode(firstChild);
					//putMessage("Reassigned " + firstChild.value + " as a leaf in the AST to " + ast.current.name);
					ast.addLeafNode(node.token);
					//putMessage("Added " + node.name + " as a leaf in the AST to " + ast.current.name);
					//Reset the variables
					compMode = false;
					firstChild = {};
					//Move back to the parent in the AST
					ast.rtp();
				//Just a regular leaf node
				}else{
					ast.addLeafNode(node.token);
					//putMessage("Added " + node.name + " as a leaf in the AST to " + ast.current.name);
				}
			}
		}
		//Node is a branch
		else
		{
			var n = node.name;
			//Is this an important branch?
			if(n === "Block" || n === "VarDecl" || n === "AssignmentStatement" || n === "PrintStatement" || n === "while" || n === "if"){
				//putMessage("Added " + n + " as a branch child of " + ast.current.name + " in the AST");
				ast.addBranchNode(node.name);
				
				for (var i = 0; i < node.children.length; i++)
				{
					expand(node.children[i], depth + 1);
				}
				//Return to the parent of the current AST node
				ast.rtp();
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