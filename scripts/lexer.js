//Global Variables
var lineNum = 1; //Keep track of the line number

//FUNCTIONS---------------------------------------------------------------------------
//This is the main function of the lexer.
function lex(){
	//Initialize
	lineNum = 1;
	
	// Get the source code from the text area.
    var sourceCode = document.getElementById("taSourceCode").value;
	
	//Eliminate the leading and trailing spaces from the  source code.
	sourceCode = trim(sourceCode);
	
	//Split the source code up by individual lines
	var lineStrings = splitByLine(sourceCode);
	
	//Process each line of input in the source code
	for(var i = 0; i < lineStrings.length; i++){
			processLine(lineStrings[i]);
			lineNum++;
	}
}
//Processes each line of the source code into tokens
function processLine(line){
	var isString = false;
	
	for(var j = 0; j < line.length; j++){
		//Test for space
		if(line[j].match(/\s/)){
			//Is the space in a string?
			if(isString){
				//Create the space token, add to tokens
				tokens[tokenIndex] = new tokenObj(lineNum, "T_SPACE", " ");
				tokenIndex++;
			}
			//Else, do nothing, just skip the space
			
		//Test for character a-z
		}else if(line[j].match(/[a-z]/)){
			//If its in a string, then its a char
			if(isString){
				tokens[tokenIndex] = new tokenObj(lineNum, "T_CHAR", line[j]);
				tokenIndex++;
				
			//If not in a string, it could be an identifier or part of a keyword
			} else {
				tokens[tokenIndex] = new tokenObj(lineNum, "T_ID", line[j]);
				tokenIndex++;
			}
			
		
		}else{
		 tokens[tokenIndex] = "No Match.";
		 tokenIndex++;
		}
	}
	
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
function tokenObj(lineNumber, type, value){
	this.lineNumber = lineNumber;
	this.type = type;
	this.value = value;
	this.toString = function(){
		return "" + this.lineNumber + " " + this.type + " \"" + this.value + "\"";
	};
}