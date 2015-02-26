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
	matchToken("T_LEFTPAREN");
	parseExpr();
	matchToken("T_RIGHTPAREN");
}

function parseAssignmentStatement(){
	matchToken("T_ID");
	matchToken("T_ASSIGNOP");
	parseExpr();
}

function parseVarDecl(){
	matchToken("T_TYPE");
	matchToken("T_ID");
}

function parseWhileStatement(){
	matchToken("T_WHILE");
	parseBooleanExpr();
	parseBlock();
}

function parseIfStatement(){
	matchToken("T_IF");
	parseBooleanExpr();
	parseBlock();
}

function parseExpr(){
	switch(currentToken.type){
		case "T_DIGIT":
			parseIntExpr();
		break;
		
		case "T_DBLQUOTE":
			parseStringExpr();
		break;
		
		case "T_RIGHTPAREN":
			parseBooleanExpr();
		break;
		
		case "T_BOOLVAL":
			parseBooleanExpr();
		break;
		
		case "T_ID":
			matchToken("T_ID");
		break;
		
		default:
			putMessage("Could not parseExpr " + currentToken.type);
	}
}

function parseIntExpr(){
	matchToken("T_DIGIT");
	if(currentToken.type == "T_INTOP"){
		matchToken("T_INTOP");
		parseExpr();
	}
}

function parseStringExpr(){
	matchToken("T_DBLQUOTE");
	parseCharList();
	matchToken("T_DBLQUOTE");
}

function parseBooleanExpr(){
	if(currentToken.type == "T_LEFTPAREN"){
		matchToken("T_LEFTPAREN");
		parseExpr();
		matchToken("T_BOOLOP");
		parseExpr();
		matchToken("T_RIGHTPAREN");
	}else{
		matchToken("T_BOOLVAL");
	}
}

function parseCharList(){
	var t = currentToken.type;
	if(t == "T_CHAR" || t == "T_SPACE"){
		if(t == "T_CHAR"){
			matchToken("T_CHAR");
			parseCharList();
		}else{
			matchToken("T_SPACE");
			parseCharList();
		}
	} else {
		//Epsilon Thingy
	}
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
						putMessage("Error: Got " + currentToken.type + " instead on line " + currentToken.lineNumber);
						errorCount++;
					}
		break;
		
		case "T_LEFTBRACE":
					putMessage("Expecting a Left Brace");
					if(currentToken.type == "T_LEFTBRACE"){
						putMessage("Got a Left Brace!");
					} else {
						putMessage("Error: Got " + currentToken.type + " instead on line " + currentToken.lineNumber);
						errorCount++;
					}
		break;
		
		case "T_RIGHTBRACE":
					putMessage("Expecting a Right Brace");
					if(currentToken.type == "T_RIGHTBRACE"){
						putMessage("Got a Right Brace!");
					} else {
						putMessage("Error: Got " + currentToken.type + " instead on line " + currentToken.lineNumber);
						errorCount++;
					}
		break;
		
		case "T_PRINT":
					putMessage("Expecting Print Keyword");
					if(currentToken.type == "T_PRINT"){
						putMessage("Got a Print Keyword!");
					} else {
						putMessage("Error: Got " + currentToken.type + " instead on line " + currentToken.lineNumber);
						errorCount++;
					}
		break;
		
		case "T_ID":
					putMessage("Expecting Identifier");
					if(currentToken.type == "T_ID"){
						putMessage("Got an Identifier!");
					} else {
						putMessage("Error: Got " + currentToken.type + " instead on line " + currentToken.lineNumber);
						errorCount++;
					}
		break;
		
		case "T_TYPE":
					putMessage("Expecting a Type Keyword");
					if(currentToken.type == "T_TYPE"){
						putMessage("Got a Type Keyword!");
					} else {
						putMessage("Error: Got " + currentToken.type + " instead on line " + currentToken.lineNumber);
						errorCount++;
					}
		break;
		
		case "T_WHILE":
					putMessage("Expecting While Keyword");
					if(currentToken.type == "T_WHILE"){
						putMessage("Got the While Keyword!");
					} else {
						putMessage("Error: Got " + currentToken.type + " instead on line " + currentToken.lineNumber);
						errorCount++;
					}
		break;
		
		case "T_IF":
					putMessage("Expecting If Keyword");
					if(currentToken.type == "T_IF"){
						putMessage("Got the If Keyword!");
					} else {
						putMessage("Error: Got " + currentToken.type + " instead on line " + currentToken.lineNumber);
						errorCount++;
					}
		break;
		
		case "T_LEFTPAREN":
					putMessage("Expecting Left Paren");
					if(currentToken.type == "T_LEFTPAREN"){
						putMessage("Got a Left Paren!");
					} else {
						putMessage("Error: Got " + currentToken.type + " instead on line " + currentToken.lineNumber);
						errorCount++;
					}
		break;
		
		case "T_RIGHTPAREN":
					putMessage("Expecting Right Paren");
					if(currentToken.type == "T_RIGHTPAREN"){
						putMessage("Got a RIGHT Paren!");
					} else {
						putMessage("Error: Got " + currentToken.type + " instead on line " + currentToken.lineNumber);
						errorCount++;
					}
		break;
		
		case "T_INTOP":
					putMessage("Expecting an Int Operator");
					if(currentToken.type == "T_INTOP"){
						putMessage("Got an Int Operator!");
					} else {
						putMessage("Error: Got " + currentToken.type + " instead on line " + currentToken.lineNumber);
						errorCount++;
					}
		break;
		
		case "T_DBLQUOTE":
					putMessage("Expecting a Double Quotation Mark");
					if(currentToken.type == "T_DBLQUOTE"){
						putMessage("Got a Double Quotation Mark!");
					} else {
						putMessage("Error: Got " + currentToken.type + " instead on line " + currentToken.lineNumber);
						errorCount++;
					}
		break;
		
		case "T_BOOLVAL":
					putMessage("Expecting a Boolean Value");
					if(currentToken.type == "T_BOOLVAL"){
						putMessage("Got a Boolean!");
					} else {
						putMessage("Error: Got " + currentToken.type + " instead on line " + currentToken.lineNumber);
						errorCount++;
					}
		break;
		
		case "T_BOOLOP":
					putMessage("Expecting a Boolean Operator");
					if(currentToken.type == "T_BOOLOP"){
						putMessage("Got a Boolean Operator!");
					} else {
						putMessage("Error: Got " + currentToken.type + " instead on line " + currentToken.lineNumber);
						errorCount++;
					}
		break;
		
		case "T_ASSIGNOP":
					putMessage("Expecting an Assignment Operator");
					if(currentToken.type == "T_ASSIGNOP"){
						putMessage("Got an Assignment Operator!");
					} else {
						putMessage("Error: Got " + currentToken.type + " instead on line " + currentToken.lineNumber);
						errorCount++;
					}
		break;
		
		case "T_DIGIT":
					putMessage("Expecting a Digit");
					if(currentToken.type == "T_DIGIT"){
						putMessage("Got a Digit!");
					} else {
						putMessage("Error: Got " + currentToken.type + " instead on line " + currentToken.lineNumber);
						errorCount++;
					}
		break;
		
		case "T_CHAR":
					putMessage("Expecting a Character");
					if(currentToken.type == "T_CHAR"){
						putMessage("Got a Character!");
					} else {
						putMessage("Error: Got " + currentToken.type + " instead on line " + currentToken.lineNumber);
						errorCount++;
					}
		break;
		
		case "T_SPACE":
					putMessage("Expecting a Space");
					if(currentToken.type == "T_SPACE"){
						putMessage("Got a Space!");
					} else {
						putMessage("Error: Got " + currentToken.type + " instead on line" + currentToken.lineNumber);
						errorCount++;
					}
		break;
		
		default:
					putMessage("Match Token Failed on Line " + currentToken.lineNumber);
					errorCount++;
		
	}
	currentToken = getNextToken();
}