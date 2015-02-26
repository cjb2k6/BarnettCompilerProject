//Global Variables
var lineNum = 1; //Keep track of the line number
var stringLine = 0;//Keep track of what line a string literal should be defined on
var isString = false;

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
	var charLeft = line.length;
	
	for(var j = 0; j < line.length; j++){
		//Test for space
		if(line[j].match(/\s/)){ //Is the space in a string?
			if(isString){
				processToken(lineNum, "T_SPACE", " "); //Create the space token, add to tokens
			}
			//Else, do nothing, just skip the space
			charLeft--;
			
		//Test for character a-z-----------------------------------------------
		}else if(line[j].match(/[a-z]/)){
			var aKeyword = false; //Initialize this every loop
			//If its in a string, then its a char
			if(isString){
				//Is the string still on the line it started on?
				if(stringLine == lineNum){
					processToken(lineNum, "T_CHAR", line[j]);
				} else {
					putMessage("Error: No ending \" found on line " + stringLine + ".");
					isString = false;
				}
			//If not in a string, it could be an identifier
			//If it appears at the end of a line, then it must be an identifier
			} else if(charLeft == 1){
					processToken(lineNum, "T_ID", line[j]);
			
			} else if(charLeft > 1){
				//Check if next char is a space or valid symbol
				if(line[j+1].match(/\s|\+|\=|\!|\|\)|\"|\)|\(/)){
					processToken(lineNum, "T_ID", line[j]);
				} else {
					aKeyword = true;
				}
			//If not an identifier, could be a keyword
			}
			if(aKeyword){
				var tempStr = "";
				switch(line[j]){
					//If its an I, it could be "if" or "int"
					case "i": 
							if(line[j+1] == "f"){
								processToken(lineNum, "T_IF", "if");
								j++; //Account for the extra char read
								charLeft--;
							}else if(line[j+1] == "n"){
								if(charLeft > 2){
									if(line[j+2] == "t"){
										processToken(lineNum, "T_TYPE", "int");
										j += 2; //Account for the extra char reads
										charLeft -= 2;
									}
								}
							}else {
							 putMessage("Token \"i\" on line " + lineNum + " should not have a letter following it.");
							 errorCount++;
							}
					break;
					
					//If its a t, it could be "true"
					case "t":
							if(charLeft > 3){
								for(var k = 0; k < 4; k++){
									tempStr += line[j+k]
								}
								if(tempStr == "true"){
									processToken(lineNum, "T_BOOLVAL", "true");
									j += 3; //Account for the extra char reads
									charLeft -= 3;
								} else{
									putMessage(tempStr + " != to true");
								}
							}else {
							 putMessage("Token \"t\" on line " + lineNum + " should not have a letter following it.");
							 errorCount++;
							}
					break;
					
					//If its an f, it could be "false"
					case "f":
							if(charLeft > 4){
								for(var k = 0; k < 5; k++){
									tempStr += line[j+k]
								}
								if(tempStr == "false"){
									processToken(lineNum, "T_BOOLVAL", "false");
									j += 4; //Account for the extra char reads
									charLeft -= 4;
								} else{
									putMessage(tempStr + " != to true");
								}
							}else {
							 putMessage("Token \"f\" on line " + lineNum + " should not have a letter following it.");
							 errorCount++;
							}
					break;
					
					//If its an s, it could be "string"
					case "s":
							if(charLeft > 5){
								for(var k = 0; k < 6; k++){
									tempStr += line[j+k]
								}
								if(tempStr == "string"){
									processToken(lineNum, "T_TYPE", "string");
									j += 5; //Account for the extra char reads
									charLeft -= 5;
								} else{
									putMessage(tempStr + " != to true");
								}
							}else {
							 putMessage("Token \"s\" on line " + lineNum + " should not have a letter following it.");
							 errorCount++;
							}
					break;
					
					//If its a b, it could be "boolean"
					case "b":
							if(charLeft > 6){
								for(var k = 0; k < 7; k++){
									tempStr += line[j+k]
								}
								if(tempStr == "boolean"){
									processToken(lineNum, "T_TYPE", "boolean");
									j += 6; //Account for the extra char reads
									charLeft -= 6;
								} else{
									putMessage(tempStr + " != to true");
								}
							}else {
							 putMessage("Token \"b\" on line " + lineNum + " should not have a letter following it.");
							 errorCount++;
							}
					break;
					
					//If its a p, it might be "print"
					case "p":
							if(charLeft > 4){
								for(var k = 0; k < 5; k++){
									tempStr += line[j+k]
								}
								if(tempStr == "print"){
									processToken(lineNum, "T_PRINT", "print");
									j += 4; //Account for the extra char reads
									charLeft -= 4;
								} else{
									putMessage(tempStr + " != to true");
								}
							}else {
							 putMessage("Token \"p\" on line " + lineNum + " should not have a letter following it.");
							 errorCount++;
							}
					break;
					
					//If its a w, it could be "while"
					case "w":
							if(charLeft > 4){
								for(var k = 0; k < 5; k++){
									tempStr += line[j+k]
								}
								if(tempStr == "while"){
									processToken(lineNum, "T_WHILE", "while");
									j += 4; //Account for the extra char reads
									charLeft -= 4;
								} else{
									putMessage(tempStr + " != to true");
								}
							}else {
							 putMessage("Token \"w\" on line " + lineNum + " should not have a letter following it.");
							 errorCount++;
							}
					break;
					
					default:
						//error message
						putMessage("Error on line " + lineNum +": Identifiers must be a single alphabetic character.");
						errorCount++;
					
						//Skip the illegal sequence of characters
						while(!line[j].match(/\s/) && charLeft > 0){
							putMessage("Skipping char: " + line[j] + " on line " + lineNum);
							j++;
							charLeft--;
						}
					
				}
			}
			charLeft--;
			
		//Test for digits
		}else if(line[j].match(/[0-9]/)){
			if(isString){
				processToken(lineNum, "T_CHAR", line[j]);
			}else{
			processToken(lineNum, "T_DIGIT", line[j]);
			}
			charLeft--;
		
		}else{
		
			//Test for symbols
			//If it is currently processing a string, read it as a char
			if(isString && line[j] != "\""){
				if(line[j].match(/[a-z]|\s/)){
					processToken(lineNum, "T_CHAR", line[j]);
					charLeft--;
					}else{
					 putMessage("Error on line " + lineNum + ". " + line[j] + " is not valid in a string.");
					 errorCount++;
					}
			}else{
				switch(line[j]){
			
				case "\"":
						isString = !isString;
						stringLine = lineNum;
						processToken(lineNum, "T_DBLQUOTE", line[j]);
						charLeft--;
				break;
				
				case "+":
						processToken(lineNum, "T_INTOP", line[j]);
						charLeft--;
				break;
				
				case "$":
						processToken(lineNum, "T_EOF", line[j]);
						charLeft--;
				break;
				
				case "(":
						processToken(lineNum, "T_LEFTPAREN", line[j]);
						charLeft--;
				break;
				
				case ")":
						processToken(lineNum, "T_RIGHTPAREN", line[j]);
						charLeft--;
				break;
				
				case "{":
						processToken(lineNum, "T_LEFTBRACE", line[j]);
						charLeft--;
				break;
				
				case "}":
						processToken(lineNum, "T_RIGHTBRACE", line[j]);
						charLeft--;
				break;
				
				case "=":
						if(charLeft > 1){
							//Is next char "="?
							if(line[j+1] == "="){
								processToken(lineNum, "T_BOOLOP", "==");
								j++;
								charLeft -= 2;
								break;
								}
						}
							processToken(lineNum, "T_ASSIGNOP", line[j]);
						charLeft--;
				break;
				
				case "!":
						if(charLeft > 1){
						//Is next char "!"?
							if(line[j+1] == "=")
								processToken(lineNum, "T_BOOLOP", "!=");
								j++;
								charLeft--;
						}else{
							tokens[tokenIndex] = "No Match for " + line[j];
							tokenIndex++;
						}
						charLeft--;
				break;
				
				default:
					tokens[tokenIndex] = "No Match for " + line[j];
					tokenIndex++;
					charLeft--;
				}
			}
		}
		//putMessage("charLeft = " + charLeft);
	}
	
}

//Splits the source code up by line
function splitByLine(src){
	src = src.split("\n");
	return src;
}

//Creates a token, places it into the token array, then points to next spot in token array
function processToken(ln, t, v){
	tokens[tokenIndex] = new tokenObj(ln, t, v);
	tokenIndex++;
	//putMessage("Processed: " + v + " on line " + ln);
}

//OBJECT CONSTRUCTORS-----------------------------------------------------------------
/* --------  
   Token Object Constructor
   Params: 	lineNum:int  - the line number the token is on, 1 is the first line number
			type:String  - the type of token it is
			value:String - the actual token itself
			
   Methods: toString() - overrides default toString, prints the three values in one line.
   -------- */
function tokenObj(lineNumber, type, value){
	this.lineNumber = lineNumber;
	this.type = type;
	this.value = value;
	this.toString = function(){
		return "" + this.lineNumber + " " + this.type + " \"" + this.value + "\"";
	};
}