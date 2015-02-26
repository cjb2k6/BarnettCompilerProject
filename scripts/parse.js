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
	var t = currentToken.type;
	if(t == "T_PRINT" || t == "T_ID" || t == "T_TYPE" ||  t == "T_WHILE" || t == "T_IF"){
		parseStatement();
		parseStatementList();
	} else {
		//Epsilon Thingy
	}
}

function parseStatement(){
	switch(currentToken.type){
		case "T_PRINT":
			parsePrintStatement();
		break;
		
		case "T_ID":
			parseAssignmentStatement();
		break;
		
		case "T_TYPE":
			parseVarDecl();
		break;
		
		case "T_WHILE":
			parseWhileStatement();
		break;
		
		case "T_IF":
			parseIfStatement();
		break;
		
		default:
			putMessage("Could not parseStatement " + currentToken.type);
	}
}

function parsePrintStatement(){
	matchToken("T_PRINT");
}

function parseAssignmentStatement(){
	matchToken("T_ID");
}

function parseVarDecl(){
	matchToken("T_TYPE");
}

function parseWhileStatement(){
	matchToken("T_WHILE");
}

function parseIfStatement(){
	matchToken("T_IF");
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
		
		case "T_PRINT":
					putMessage("Expecting Print Keyword");
					if(currentToken.type == "T_PRINT"){
						putMessage("Got a Print Keyword!");
					} else {
						putMessage("Error: Got " + currentToken.type + " instead.");
						errorCount++;
					}
		break;
		
		case "T_ID":
					putMessage("Expecting Identifier");
					if(currentToken.type == "T_ID"){
						putMessage("Got an Identifier!");
					} else {
						putMessage("Error: Got " + currentToken.type + " instead.");
						errorCount++;
					}
		break;
		
		case "T_TYPE":
					putMessage("Expecting a Type Keyword");
					if(currentToken.type == "T_TYPE"){
						putMessage("Got a Type Keyword!");
					} else {
						putMessage("Error: Got " + currentToken.type + " instead.");
						errorCount++;
					}
		break;
		
		case "T_WHILE":
					putMessage("Expecting While Keyword");
					if(currentToken.type == "T_WHILE"){
						putMessage("Got the While Keyword!");
					} else {
						putMessage("Error: Got " + currentToken.type + " instead.");
						errorCount++;
					}
		break;
		
		case "T_IF":
					putMessage("Expecting If Keyword");
					if(currentToken.type == "T_IF"){
						putMessage("Got the If Keyword!");
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