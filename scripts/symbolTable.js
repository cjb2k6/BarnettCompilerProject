//Variables
var scopeNum = -1;//Scope number for naming purposes
var currentScope = -1;
var currentDepth = -1;
//Functions
//Function to build symbol table
function symbolTable(){
	//Initialize variables
	scopeNum = -1;
	currentScope = -1;
	currentDepth = -1;
	putMessage("--------------------------");
	putMessage("Building Symbol Table");
	buildSymbolTable();
	putMessage("Symbol Table Finished with " + errorCount + " error(s).");
}
function buildSymbolTable(){
	// Recursive function to handle the expansion of the nodes.
	function expand(node, depth)
	{
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
					for (var i = 0; i < node.children.length; i++)
					{
						expand(node.children[i], depth + 1);
					}
				break;
				case "while":
					for (var i = 0; i < node.children.length; i++)
					{
						expand(node.children[i], depth + 1);
					}
				break;
				case "EqualComp":
					scopeAndTypeCheck(node);
				break;
				case "NotEqualComp":
					scopeAndTypeCheck(node);
				break;
				case "VarDecl":
					if(symtab.current.scope.checkExists(node.children[1].name)){
						errorCount++;
						putMessage("-------------------------");
						putMessage("Error! Variable " + node.children[1].name + " on line " + node.children[1].token.lineNumber + " has already been declared in this scope.");
						putMessage("-------------------------");
					}else{
						var type = node.children[0].name;
						var id = node.children[1].name;
						var lineNum = node.children[0].token.lineNum;
						symtab.current.scope.add(new symbolObj(id, type, lineNum, currentScope));
						//putMessage("Added a VarDecl: " + type + " " + id);
					}
				break;
				case "AssignmentStatement":
						scopeAndTypeCheck(node);
				break;
				case "PrintStatement":
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
						putMessage("-------------------------");
						putMessage("Error! Variable " + symbol + " on line " + node.children[0].token.lineNumber + " has not been declared.");
						putMessage("-------------------------");
					}
				break;
				default:
					putMessage("The default case of the build symbol table switch has occurred. This should not have happened. THIS SHOULD NOT HAVE HAPPENED!!!");
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
	//putMessage("New Scope: " + symtab.current.name);
}

function closeScope(){
	currentDepth--;
	if(currentScope === 0){
		currentScope = -1;
		symtab.rtp();
	}else{
		symtab.rtp();
		currentScope = symtab.current.scope.level;
	}
	//putMessage("Scope back up to: " + symtab.current.name);
}

function scopeAndTypeCheck(node){
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
							putMessage("-------------------------");
							putMessage("Error! Variable " + symbol + " on line " + node.children[0].token.lineNumber + " has not been declared.");
							putMessage("-------------------------");
						}else{
							//Check to see if the types match
							//putMessage("Type found: " + currScopeNode.scope.table[symbol].type);
							switch(currScopeNode.scope.table[symbol].type){
								case "int":
									if(node.children[1].token.type !== "T_DIGIT"){
										errorCount++;
										putMessage("-------------------------");
										putMessage("Error! Type mismatch. Variable " + symbol + " on line " + node.children[0].token.lineNumber + " only be assigned int values.");
										putMessage("-------------------------");
									}
								break;
								case "string":
									if(node.children[1].token.type !== "T_StringLiteral"){
										errorCount++;
										putMessage("-------------------------");
										putMessage("Error! Type mismatch. Variable " + symbol + " on line " + node.children[0].token.lineNumber + " only be assigned string values.");
										putMessage("-------------------------");
									}
								break;
								case "boolean":
									if(node.children[1].token.type !== "T_BOOLVAL"){
										errorCount++;
										putMessage("-------------------------");
										putMessage("Error! Type mismatch. Variable " + symbol + " on line " + node.children[0].token.lineNumber + " only be assigned boolean values.");
										putMessage("-------------------------");
									}
								break;
								default:putMessage("Somehow, it could not match any of the three types in the grammar. IMPOSSIBRU!");
							}
						}
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
	this.size = 0;
	//Params: symbolObj:symbolObj - the object of the symbol to add to the table
	this.add = function(symbolObj){
		this.table[symbolObj.name] = symbolObj;
	};
	//Params: symbol:String - the symbol name
	this.checkExists = function(symbolName){
		if(this.table[symbolName] != null){
			return true;
		}
		return false;
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
	this.scopeLevel = scopeLevel;
	this.toString = function(){
		return "" + this.name + " " + this.type + " \"" + this.lineNum + "\"" + this.scopeLevel;
	};
}