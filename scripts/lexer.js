//FUNCTIONS---------------------------------------------------------------------------
//This is the main function of the lexer.
function lex(){
	// Get the source code from the text area.
    var sourceCode = document.getElementById("taSourceCode").value;
	
	//Eliminate the leading and trailing spaces from the  source code.
	sourceCode = trim(sourceCode);
	
	//Split the source code up by individual lines
	var lineStrings = splitByLine(sourceCode);
	
	//Process each line of input in the source code
	for(var i = 0; i < lineStrings.length; i++){
			processLine(i);
	}
}
//Processes each line of the source code into tokens
function processLine(index){
	//Split the line into an array of characters
	charArray = lineStrings[index].split("");
	//More Stuff
}

//Splits the source code up by line
function splitByLine(src){
	src = src.split("\n");
	return src;
}

//OBJECT CONSTRUCTORS-----------------------------------------------------------------
/* --------  
   Token Object Constructor
   Params: lineNum:int  - the line number the token is on, 1 is the first line number
		   type:String  - the type of token it is
		   value:String - the actual token itself
   -------- */
function tokenObj(lineNum, type, value){
	this.lineNum = lineNum;
	this.type = type;
	this.value = value;
}