function parse(){
	currentToken = getNextToken();
	
	parseProgram();
	
	putMessage("Parsing found " + errorCount + " error(s).");
}

function parseProgram(){
	parseBlock();
	matchToken("T_EOF");
}

function parseBlock(){
	matchToken("T_LEFTBRACE");
	parseStatementList();
	matchToken("T_RIGHTBRACE");
}

function parseStatementList(){
	putMessage("Stuff to parse statement list.")
}

//Function from Alan's Example
function getNextToken() {
        var thisToken = EOF;    // Let's assume that we're at the EOF.
        if (tokenIndex < tokens.length)
        {
            // If we're not at EOF, then return the next token in the stream and advance the index.
            thisToken = tokens[tokenIndex];
            putMessage("Current token:" + thisToken.type);
            tokenIndex++;
        }
        return thisToken;
    }
	
function matchToken(expectedType){
	switch(expectedType){
		case "T_EOF":
					putMessage("Expecting EOF");
					if(currentToken.type == "T_EOF"){
						putMessage("Got EOF!");
					} else {
						putMessage("Error: Got " + currentToken.type + " instead.");
						errorCount++;
					}
		break;
		
		case "T_LEFTBRACE":
					putMessage("Expecting a Left Brace");
					if(currentToken.type == "T_LEFTBRACE"){
						putMessage("Got a Left Brace!");
					} else {
						putMessage("Error: Got " + currentToken.type + " instead.");
						errorCount++;
					}
		break;
		
		case "T_RIGHTBRACE":
					putMessage("Expecting a Right Brace");
					if(currentToken.type == "T_RIGHTBRACE"){
						putMessage("Got a Right Brace!");
					} else {
						putMessage("Error: Got " + currentToken.type + " instead.");
						errorCount++;
					}
		break;
		
		default:
					putMessage("Match Token Failed");
					errorCount++;
		
	}
	currentToken = getNextToken();
}