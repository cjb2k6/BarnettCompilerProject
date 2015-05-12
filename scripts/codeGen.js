var code;
var headPointer;
var tailPointer;
var tempVarCount;
var tempJumpCount;
var addressOffset;
var varTable;
var jumpTable;

function codeGeneration(){
	//initialize variables
	code = [];
	headPointer = 0;
	tailPointer = 255;
	tempVarCount = 0;
	tempJumpCount = 0;
	addressOffset = 0;
	varTable = new tempVarTable();
	jumpTable = {};
	buildCode();
	outputCG(code);
	outputCG("--------------------------");
	outputCG(varTable);
	//outputCG(jumpTable["J0"]);
	outputCG("--------------------------");
	allocateVars();
	outputCG(varTable);
	outputCG("--------------------------");
	backpatch();
	outputCG(printCode());
}

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
				expand(node.children[0], depth + 1);
				var oldHeadPointer = headPointer - 1;
				for (var i = 1; i < node.children.length; i++)
				{
					expand(node.children[i], depth + 1);
				}
				//outputCG("hp:" + headPointer + " ohp:" + oldHeadPointer);
				jumpTable[tempJumpName] = headPointer - oldHeadPointer;
			break;
			case "while":
				
			break;
			case "EqualComp":
				if(node.children[1].token.type === "T_ID"){
					loadXFromMem(varTable.table[node.children[1].name + "@" + node.children[1].scope].name);
				}else if(node.children[1].token.type === "T_DIGIT"){
					loadXConst("0" + node.children[1].name);
				}
				
				if(node.children[0].token.type === "T_ID"){
					compareToX(varTable.table[node.children[0].name + "@" + node.children[0].scope].name);
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
					outputCG("You still need to implement boolean vardecls!");
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
					str = str.substring(1, str.length - 1);
					code[tailPointer] = "00";
					tailPointer -= str.length;
					for(i = 0; i < str.length; i++){
						code[tailPointer + i] = str.charCodeAt(i).toString(16).toUpperCase();
					}
					//Add pointer to string in heap
					loadAccConst(tailPointer.toString(16).toUpperCase());
					storeAccInMem(varTable.table[node.children[0].name + "@" + node.children[0].scope].name);
					tailPointer--;
				}
			break;
			case "PrintStatement":
				if(node.children[0].token.type === "T_ID"){
					outputCG(node.children[0].name + "@" + node.children[0].scope);
					loadYFromMem(varTable.table[node.children[0].name + "@" + node.children[0].scope].name);
					if(node.children[0].type == "int"){
						loadXConst("01");
					}else{
						loadXConst("02");
					}
					SysCall();
				}
			break;
			case "+":
					
			break;
			default: outputSA("Found " + node.name);
				
				
		}
	}
	// Make the initial call to expand from the root.
	expand(ast.root, 0);
	addCode("00"); //End of code, break
}
function allocateVars(){
	for(i = 0; i < varTable.size; i++){
		varTable.table[varTable.list[i]].address = headPointer + varTable.table[varTable.list[i]].address;
	}
}
function backpatch(){
	for(i = 0; i < 255; i++){
		if(typeof code[i] === 'undefined') {
			code[i] = "00";
		}else if(code[i] === "XX"){
			code[i] = "00";
		}else if(code[i].match(/\J/)){
			code[i] = jumpTable[code[i]].toString(16).toUpperCase();
			if(code[i].length < 2){
				code[i] = "0" + code[i];
			}
		}else if(code[i].match(/\T/)){
			code[i] = varTable.table[varTable.list[parseInt(code[i].substring(1, code[i].length))]].address.toString(16).toUpperCase();
			if(code[i].length < 2){
				code[i] = "0" + code[i];
			}
		}
	}
}

function printCode(){
	var str = "";
	for(i = 0; i < code.length; i++){
		str += code[i] + " ";
	}
	return str;
}

function addCode(str){
	code[headPointer] = str;
	headPointer++;
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
	this.toString = function(){
		return "" + this.name + " " + this.type + " \"" + this.lineNum + "\"" + this.scopeLevel;
	};
}