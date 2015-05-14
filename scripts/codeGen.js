//Global Variables
var code;
var headPointer;
var tailPointer;
var tempVarCount;
var tempJumpCount;
var addressOffset;
var weHaveAddedBefore;
var varTable;
var jumpTable;
var noCodeGenForYou;

//FUNCTIONS------------------------------------------------------------------------------
//The main code generation function
function codeGeneration(){
	//initialize variables
	code = [];
	headPointer = 0;
	tailPointer = 255;
	tempVarCount = 0;
	tempJumpCount = 0;
	addressOffset = 0;
	weHaveAddedBefore = false;
	noCodeGenForYou = "";
	varTable = new tempVarTable();
	jumpTable = {};
	buildCode();
	//outputCG(code);
	allocateVars();
	backpatch();
	
	if(noCodeGenForYou !== ""){
		outputCG(noCodeGenForYou);
	}else{
		outputCG(printCode());	
	}
}
//Function to traverse the AST to build the code
function buildCode(){
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
				for (var i = 0; i < node.children.length; i++)
				{
					expand(node.children[i], depth + 1);
				}
			break;
			case "if":
				var tempJumpName = "J" + tempJumpCount;
				//Expand the comparison
				expand(node.children[0], depth + 1);
				
				var oldHeadPointer = headPointer - 1;
				//Expand the block
				for (var i = 1; i < node.children.length; i++)
				{
					expand(node.children[i], depth + 1);
				}
				var jumpDist = (headPointer - oldHeadPointer) - 1;
				jumpTable[tempJumpName] = jumpDist;
			break;
			case "while":
				var tempJumpName = "J" + tempJumpCount;
				//Expand the comparison
				expand(node.children[0], depth + 1);
				
				var oldHeadPointer = headPointer - 1;
				//Expand the block
				for (var i = 1; i < node.children.length; i++)
				{
					expand(node.children[i], depth + 1);
				}
				var jumpDist = (255 - headPointer);
				jumpTable[tempJumpName] = jumpDist;
			break;
			case "EqualComp":
				//Conditions for the second child--------------------
				if(node.children[1].token.type === "T_ID"){
					loadXFromMem(varTable.table[node.children[1].name + "@" + node.children[1].scope].name);
				}else if(node.children[1].token.type === "T_DIGIT"){
					loadXConst("0" + node.children[1].name);
				}else if(node.children[1].token.type === "T_StringLiteral"){
					noCodeGenForYou += "Sorry, the comparison of String Literals is not yet supported.";
				}else if(node.children[1].token.type === "T_BOOLVAL"){
					if(node.children[1].name === "true"){
						outputCG("Loaded true into X");
						loadXConst("01");
					}else{
						outputCG("Loaded false into X");
						loadXConst("00");
					}
				}
				
				//Conditions for the first child---------------------
				if(node.children[0].token.type === "T_ID"){
					compareToX(varTable.table[node.children[0].name + "@" + node.children[0].scope].name);
				}else if(node.children[0].token.type === "T_DIGIT"){
					loadAccConst("0" + node.children[0].token.value);
					//Load the constant into a new variable
					var variable = "Const" + tempVarCount;
					varTable.add(variable, -1);
					storeAccInMem("T" + tempVarCount);
					tempVarCount++;
					variable += "@-1";
					compareToX(varTable.table[variable].name);
				}else if(node.children[0].token.type === "T_StringLiteral"){
					noCodeGenForYou += "Sorry, the comparison of String Literals is not yet supported.";
				}else if(node.children[0].token.type === "T_BOOLVAL"){
					if(node.children[0].name === "true"){
						outputCG("Loaded true into acc");
						loadAccConst("01");
					}else{
						outputCG("Loaded false into acc");
						loadAccConst("00");
					}
					var variable = "Const" + tempVarCount;
					varTable.add(variable, -1);
					storeAccInMem("T" + tempVarCount);
					tempVarCount++;
					variable += "@-1";
					compareToX(varTable.table[variable].name);
				}
				bne();
			break;
			case "NotEqualComp":
				
			break;
			case "VarDecl":
				if(node.children[0].name === "int"){
					varTable.add(node.children[1].name, node.children[1].scope);
					loadAccConst("00");
					storeAccInMem("T" + tempVarCount);
					tempVarCount++;
				}else if(node.children[0].name === "string"){
					varTable.add(node.children[1].name, node.children[1].scope);
					tempVarCount++;
				}else if(node.children[0].name === "boolean"){
					varTable.add(node.children[1].name, node.children[1].scope);
					loadAccConst("00");
					storeAccInMem("T" + tempVarCount);
					tempVarCount++;
				}
			break;
			case "AssignmentStatement":
				if(node.children[1].token.type === "T_DIGIT"){
					loadAccConst("0" + node.children[1].token.value);
					storeAccInMem(varTable.table[node.children[0].name + "@" + node.children[0].scope].name);
				}else if(node.children[1].token.type == "T_ID"){
					loadAccFromMem(varTable.table[node.children[1].name + "@" + node.children[1].scope].name);
					storeAccInMem(varTable.table[node.children[0].name + "@" + node.children[0].scope].name);
				}else if(node.children[1].token.type == "T_StringLiteral"){
					//Add string to heap
					var str = node.children[1].token.value;
					//Trim the quotes
					str = str.substring(1, str.length - 1);
					addStringToHeap(node, str);
					//Add pointer to string in heap
					loadAccConst(tailPointer.toString(16).toUpperCase());
					storeAccInMem(varTable.table[node.children[0].name + "@" + node.children[0].scope].name);
					tailPointer--;
				}else if(node.children[1].name === "+"){
					loadAccConst("00");
					expand(node.children[1], depth - 1);
					storeAccInMem(varTable.table[node.children[0].name + "@" + node.children[0].scope].name);
				}else if(node.children[1].token.type === "T_BOOLVAL"){
					if(node.children[1].name === "true"){
						loadAccConst("01");
						varTable.table[node.children[0].name + "@" + node.children[0].scope].boolval = true;
					}else{
						loadAccConst("00");
					}
						storeAccInMem(varTable.table[node.children[0].name + "@" + node.children[0].scope].name);
				}
			break;
			case "PrintStatement":
				if(node.children[0].token.type === "T_ID"){
					if(node.children[0].type === "boolean"){
						if(varTable.table[node.children[0].name + "@" + node.children[0].scope].boolval){
							printTrue(node);
						}else{
							printFalse(node);
						}
						loadXConst("02");
					}else{
						loadYFromMem(varTable.table[node.children[0].name + "@" + node.children[0].scope].name);
						if(node.children[0].type === "int"){
							loadXConst("01");
						}else{
							loadXConst("02");
						}
					}
				}else if(node.children[0].token.type === "T_BOOLVAL"){
					if(node.children[0].name === "true"){
						printTrue(node);
					}else{
						printFalse(node);
					}
					loadXConst("02");
				}else if(node.children[0].token.type === "T_StringLiteral"){
					//Add string to heap
					var str = node.children[0].token.value;
					//Trim the quotes
					str = str.substring(1, str.length - 1);
					
					varTable.add(str, -1);
					addStringToHeap(node, str);
					//Add pointer to string in heap
					loadAccConst(tailPointer.toString(16).toUpperCase());
					storeAccInMem(varTable.table[str + "@-1"].name);
					tailPointer--;
					
					loadYFromMem(varTable.table[str + "@-1"].name);
					loadXConst("02");
				}else if(node.children[0].token.type === "T_DIGIT"){
					loadYConst("0" + node.children[0].name);
					loadXConst("01");
				}
				SysCall();
			break;
			case "+":
					//Only need to do this once if the program has addition
					if(!weHaveAddedBefore){
						//Create a new variable to do accumulator swaps
						varTable.add("Acc", -1);
						weHaveAddedBefore = true;
					}
					if(node.children[1].name === "+"){
						addConstant(node, 0);
						expand(node.children[1], depth + 1);
					}else if(node.children[1].token.type === "T_DIGIT"){
						addConstant(node, 0);
						addConstant(node, 1);
					}else if(node.children[1].token.type === "T_ID"){
						addConstant(node, 0);
						addWithCarry(varTable.table[node.children[1].name + "@" + node.children[1].scope].name);
					}
			break;
			default: outputSA("Found " + node.name);	
		}
	}
	// Make the initial call to expand from the root.
	expand(ast.root, 0);
	addCode("00"); //End of code, break
}
//Function to calculate the addresses for all the variables
function allocateVars(){
	for(i = 0; i < varTable.size; i++){
		varTable.table[varTable.list[i]].address = headPointer + varTable.table[varTable.list[i]].address;
	}
}
//Function to replace temp codes with real values
function backpatch(){
	for(i = 0; i < 255; i++){
		//Replace empty array indices with 00
		if(typeof code[i] === "undefined") {
			code[i] = "00";
		//Replace the XXs with 00
		}else if(code[i] === "XX"){
			code[i] = "00";
		//Replace the jump temps with the jump distance value
		}else if(code[i].match(/\J/)){
			code[i] = jumpTable[code[i]].toString(16).toUpperCase();
			if(code[i].length < 2){
				code[i] = "0" + code[i];
			}
		//Replace the temp variable references with real ones
		}else if(code[i].match(/\T/)){
			code[i] = varTable.table[varTable.list[parseInt(code[i].substring(1, code[i].length))]].address.toString(16).toUpperCase();
			if(code[i].length < 2){
				code[i] = "0" + code[i];
			}
		}
	}
}
//Output the code in a ready to execute format
function printCode(){
	var str = "";
	for(i = 0; i < code.length; i++){
		str += code[i] + " ";
	}
	return str;
}
//The routine for adding a constant to the accumulator
function addConstant(node, child){
	storeAccInMem(varTable.table["Acc@-1"].name);
	loadAccConst("0" + node.children[child].token.value);
	addWithCarry(varTable.table["Acc@-1"].name);
}

function addStringToHeap(node, str){
	//Add string to heap
	code[tailPointer] = "00";
	tailPointer -= str.length;
	for(i = 0; i < str.length; i++){
		code[tailPointer + i] = str.charCodeAt(i).toString(16).toUpperCase();
	}
}

function printTrue(node){
	if(typeof varTable.table["true@-1"] === "undefined"){
		//Write true to the heap
		varTable.add("true", -1);
		addStringToHeap(node, "true");
		//Add pointer to string in heap
		loadAccConst(tailPointer.toString(16).toUpperCase());
		storeAccInMem(varTable.table["true@-1"].name);
		tailPointer--;
	}
	loadYFromMem(varTable.table["true@-1"].name);
}

function printFalse(node){
	if(typeof varTable.table["false@-1"] === "undefined"){
		//Write true to the heap
		varTable.add("false", -1);
		addStringToHeap(node, "false");
		//Add pointer to string in heap
		loadAccConst(tailPointer.toString(16).toUpperCase());
		storeAccInMem(varTable.table["false@-1"].name);
		tailPointer--;
	}
	loadYFromMem(varTable.table["false@-1"].name);
}


//Codes----------------------------------------------------------------------------------
function addCode(str){
	if(typeof code[headPointer] === "undefined"){
		code[headPointer] = str;
		headPointer++;
	}else{
		noCodeGenForYou += "Error: Out Of Memory\n";
	}
}
function addWithCarry(temp){
	addCode("6D");
	addCode(temp);
	addCode("XX");
}
function loadAccConst(con){
	addCode("A9");
	addCode(con);
}
function loadAccFromMem(temp){
	addCode("AD");
	addCode(temp);
	addCode("XX");
}
function storeAccInMem(temp){
	addCode("8D");
	addCode(temp);
	addCode("XX");
}
function loadYFromMem(temp){
	addCode("AC");
	addCode(temp);
	addCode("XX");
}
function loadYConst(con){
	addCode("A0");
	addCode(con);
}
function loadXFromMem(temp){
	addCode("AE");
	addCode(temp);
	addCode("XX");
}
function loadXConst(con){
	addCode("A2");
	addCode(con);
}
function compareToX(temp){
	addCode("EC");
	addCode(temp);
	addCode("XX");
}
function SysCall(){
	addCode("FF");
}
function bne(){
	addCode("D0");
	addCode("J" + tempJumpCount);
	jumpTable["J" + tempJumpCount] = 0;
	tempJumpCount++;
}
//---------------------------------------------------------------------------------------
//Output to code generation area
function outputCG(str){
	cgOut += str + "\n";
}

//OBJECT CONSTRUCTORS--------------------------------------------------------------------
	/* --------  
   Temp Variable Table Object Constructor
   Methods: add() - put a new symbol at this scope
			checkExists() - see if a symbol already exists at this scope level
   -------- */
function tempVarTable(){
	this.table = {};
	this.list = [];
	this.size = 0;
	//Params: symbolObj:symbolObj - the object of the symbol to add to the table
	this.add = function(variable, scope){
		var t = new tempVarObj("T" + tempVarCount, variable + "@" + scope, scope, addressOffset);
		this.table[t.variable] = t;
		this.list.push(t.variable);
		this.size++;
		addressOffset++;
	};
	//Params: tempVarName:String - the temporary variable name
	this.checkExists = function(tempVarName){
		if(this.table[tempVarName] != null){
			return true;
		}
		return false;
	};
	this.toString = function(){
		var str = "";
		for(var i = 0; i < this.list.length; i++){
			str += this.table[this.list[i]].name + "\t" + this.table[this.list[i]].variable + "\t" + this.table[this.list[i]].scope + "\t +" + this.table[this.list[i]].address + "\n";
		}
		return str;
	};
}

/* --------  
Temp Var Object Constructor
Params: name:string - the name of the temp reference
		variable:String  - the name of the variable
		scope:int - the scope of the variable
		address:int - the address offset
		
Methods: toString() - overrides default toString, prints the four values in one line.
   -------- */
function tempVarObj(name, variable, scope, address){
	this.name = name;
	this.variable = variable;
	this.scope = scope;
	this.address = address;
	this.boolval = false;
	this.toString = function(){
		return "" + this.name + " " + this.type + " \"" + this.lineNum + "\"" + this.scopeLevel;
	};
}