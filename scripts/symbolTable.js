//Variables
var scopeNum;//Scope number for naming purposes
var currentScope;
var currentDepth;
//Functions
function symbolTable(){
	//Initialize variables
	scopeNum = -1;
	currentScope = -1;
	currentDepth = -1;
	buildSymbolTable();
	outputSA("--------------------------");
	outputSA("Semantic Analysis Finished with " + errorCount + " error(s).");
}
//Function to build the Symbol Table and perform Semantic Analysis
function buildSymbolTable(){
	// Recursive function to handle the expansion of the nodes.
	function expand(node, depth)
	{
		outputSA("--------------------------");
		switch(node.name){
			case "ROOT":
				for (var i = 0; i < node.children.length; i++)
				{
					expand(node.children[i], depth + 1);
				}
			break;
			case "Block":
				openScope();
				for (var i = 0; i < node.children.length; i++)
				{
					expand(node.children[i], depth + 1);
				}
				closeScope();
			break;
			case "if":
				outputSA("Found if");
				for (var i = 0; i < node.children.length; i++)
				{
					expand(node.children[i], depth + 1);
				}
			break;
			case "while":
				outputSA("Found while");
				for (var i = 0; i < node.children.length; i++)
				{
					expand(node.children[i], depth + 1);
				}
			break;
			case "EqualComp":
				outputSA("Found EqualComp");
				checkComparison(node);
			break;
			case "NotEqualComp":
				outputSA("Found NotEqualComp");
				checkComparison(node);
			break;
			case "VarDecl":
				outputSA("Found VarDecl");
				if(symtab.current.scope.checkExists(node.children[1].name)){
					errorCount++;
					outputSA("-------------------------");
					outputSA("Error! Variable " + node.children[1].name + " on line " + node.children[1].token.lineNumber + " has already been declared in this scope.");
					outputSA("-------------------------");
				}else{
					var type = node.children[0].name;
					var id = node.children[1].name;
					var lineNum = node.children[0].token.lineNumber;
					symtab.current.scope.add(new symbolObj(id, type, lineNum, currentScope));
				}
			break;
			case "AssignmentStatement":
					outputSA("Found AssignmentStatement");
					var type = scopeCheck(node, 0, true);
					outputSA(node.children[0].name);
					typeCheck(node, type, node.children[1].token.type)
					if(node.children.length > 2){
						expand(node.children[2], depth + 1);
					}
			break;
			case "PrintStatement":
				outputSA("Found PrintStatement");
				if(node.children[0].token.type == "T_ID"){
					var symbol = node.children[0].name; //The symbol to check, left child of AssignmentStatement
					var currScopeNode = symtab.current
					var found = false;
					var depth = currentDepth;
					//Check to see if symbol is declared in current scope or above
					//Get the declaration
					while(!found &&  depth >= 0){
						if(currScopeNode.scope.checkExists(symbol)){
							found = true;
						}else{
							depth--;
							currScopeNode = currScopeNode.parent;
						}
					}
					
					if(!found){
						errorCount++;
						outputSA("-------------------------");
						outputSA("Error! Variable " + symbol + " on line " + node.children[0].token.lineNumber + " has not been declared.");
						outputSA("-------------------------");
					}else{
						currScopeNode.scope.table[symbol].used = true;
					}
				}
			break;
			case "+":
					outputSA("Found +");
					/*
					if(node.children[0].token.type === "T_ID"){
						var type = scopeCheck(node, 0);
						typeCheck(node, type, "T_DIGIT")
					}
					*/
					for (var i = 0; i < node.children.length; i++)
					{
						if(node.children[i].token.type === "T_INTOP"){
							expand(node.children[i], depth + 1);
						}
					}
					
			break;
			default: outputSA("Found " + node.name);
				
				
		}
	}
	// Make the initial call to expand from the root.
	expand(ast.root, 0);
}
function openScope(){
	scopeNum++;
	currentDepth++;
	symtab.addScopeNode(scopeNum);
	currentScope = symtab.current.scope.level;
	outputSA("Found Block, opening new scope: Scope " + scopeNum + ".");
}

function closeScope(){
	outputSA("-------------------------");
	outputSA("Block ended, closing Scope " + currentScope + ".");
	currentDepth--;
	if(currentScope === 0){
		currentScope = -1;
		symtab.rtp();
	}else{
		symtab.rtp();
		currentScope = symtab.current.scope.level;
	}
}
function checkComparison(node){
				var type1 = node.children[0].token.type;
				var type2 = node.children[1].token.type;
				//If both are IDs
				if(type1 === "T_ID" && type2 === "T_ID"){
					type1 = scopeCheck(node, 0, false);
					type2 = scopeCheck(node, 1, false);
					if(type1 !== type2){
						typeCheck(node, type1, type2);
					}
				//If 1st is ID and 2nd is not
				}else if(type1 === "T_ID" && type2 !== "T_ID"){
					type1 = scopeCheck(node, 0, false);
					typeCheck(node, type1, type2);
				//If 1st is not an ID, but 2nd is
				}else if (type1 !== "T_ID" && type2 === "T_ID"){
					type2 = scopeCheck(node, 1, false);
					typeCheck(node, type2, type1);
				//If neither are IDs
				}else{
					if(type1 !== type2){
						errorCount++;
						outputSA("-------------------------");
						outputSA("Error! Type mismatch. Cannot compare " + type1 + " to " + type2 +" on line " + node.children[0].token.lineNumber + ".");
						outputSA("-------------------------");
					}
				}
}
function scopeCheck(node, child1, isAssign){
	var symbol = node.children[child1].name; //The symbol to check, left child of AssignmentStatement
	var currScopeNode = symtab.current
	var found = false;
	var depth = currentDepth;
	//Check to see if symbol is declared in current scope or above
	//Get the declaration
	outputSA("Checking Variable:" + symbol + " on line " + node.children[0].token.lineNumber + ".");
	while(!found &&  depth >= 0){
		if(currScopeNode.scope.checkExists(symbol)){
			found = true;
			outputSA("A declaration for Variable:" + symbol + " was found in " + currScopeNode.name);
		}else{
			depth--;
			currScopeNode = currScopeNode.parent;
		}
	}
	//If we did not find the symbol in scopes above, throw an error
	if(!found){
		errorCount++;
		outputSA("-------------------------");
		outputSA("Error! Variable " + symbol + " on line " + node.children[0].token.lineNumber + " has not been declared.");
		outputSA("-------------------------");
		return "";
	}else{
		//typeCheck(node, currScopeNode.scope.table[symbol].type, node.children[child2].token.type);
		if(isAssign){
			currScopeNode.scope.table[symbol].initialized = true;
		}
		return currScopeNode.scope.table[symbol].type;
	}
}
//Type Checking, takes in a type ("int", "string", "boolean"), compares to tokenType (such as T_DIGIT for an int)
function typeCheck(node, type, tokenType){
		//Check to see if the types match
		switch(type){
			case "int":
				if(tokenType !== "T_DIGIT"){
					errorCount++;
					outputSA("-------------------------");
					outputSA("Error! Type mismatch. Variable " + node.children[0].name + " on line " + node.children[0].token.lineNumber + " is only compatible with int values.");
					outputSA("-------------------------");
				}
			break;
			case "string":
				if(tokenType !== "T_StringLiteral"){
					errorCount++;
					outputSA("-------------------------");
					outputSA("Error! Type mismatch. Variable " + node.children[0].name + " on line " + node.children[0].token.lineNumber + " is only compatible with string values.");
					outputSA("-------------------------");
				}
			break;
			case "boolean":
				if(tokenType !== "T_BOOLVAL"){
					errorCount++;
					outputSA("-------------------------");
					outputSA("Error! Type mismatch. Variable " + node.children[0].name + " on line " + node.children[0].token.lineNumber + " is only compatible with boolean values.");
					outputSA("-------------------------");
				}
			break;
			//This should not happen. Ever.
			default:outputSA("Somehow, it could not match any of the three types in the grammar. IMPOSSIBRU!");
		}
}
//A function to print messages to the Semantic Analysis output. Made so I could just 'Find and Replace'
//all of the putMessage calls I had during construction
function outputSA(str){
	saOut += str + "\n";
}
//OBJECT CONSTRUCTORS--------------------------------------------------------------------
	/* --------  
   Scope Object Constructor
   Params: 	level:int  - the level of the scope, basically its name, top level is 0
			
   Methods: add() - put a new symbol at this scope
			checkExists() - see if a symbol already exists at this scope level
   -------- */
function scope(level){
	this.level = level;
	this.table = {};
	this.list = [];
	this.size = 0;
	//Params: symbolObj:symbolObj - the object of the symbol to add to the table
	this.add = function(symbolObj){
		this.table[symbolObj.name] = symbolObj;
		this.list.push(symbolObj.name);
		this.size++;
	};
	//Params: symbol:String - the symbol name
	this.checkExists = function(symbolName){
		if(this.table[symbolName] != null){
			return true;
		}
		return false;
	};
	this.toString = function(){
		var str = "";
		for(var i = 0; i < this.list.length; i++){
			str += this.table[this.list[i]].type + "\t" + this.table[this.list[i]].name + "\t" + this.table[this.list[i]].lineNum + "\n        ";
		}
		return str;
	};
	//Generates table output of variables that were never initialized
	this.getUninitialized = function(){
		var str = "Scope " + this.level;
		var found = false;
		for(var i = 0; i < this.list.length; i++){
			if(!this.table[this.list[i]].initialized && this.size > 0){
				found = true;
				str += "\t" + this.table[this.list[i]].type + "\t" + this.table[this.list[i]].name + "\t" + this.table[this.list[i]].lineNum + "\n";
			}
		}
		if(found){
			return str;
		}
		return "";
	};
	//Generates table output of variables that were never used
	this.getUnused = function(){
		var str = "Scope " + this.level;
		var found = false;
		for(var i = 0; i < this.list.length; i++ ){
			if(!this.table[this.list[i]].used && this.size > 0){
				found = true;
				str += "\t" + this.table[this.list[i]].type + "\t" + this.table[this.list[i]].name + "\t" + this.table[this.list[i]].lineNum + "\n";
			}
		}
		if(found){
			return str;
		}
		return "";
	};
}

/* --------  
Symbol Object Constructor
Params: 	name:string  - the name of the symbol which is the symbol itself
		type:String  - the type of symbol it is
		scopeLevel:int - the number of the scope that this symbol belongs to
		
Methods: toString() - overrides default toString, prints the four values in one line.
   -------- */
function symbolObj(name, type, lineNum, scopeLevel){
	this.name = name;
	this.type = type;
	this.lineNum = lineNum;
	this.scopeLevel = scopeLevel;
	this.initialized = false;
	this.used = false;
	this.toString = function(){
		return "" + this.name + " " + this.type + " \"" + this.lineNum + "\"" + this.scopeLevel;
	};
}