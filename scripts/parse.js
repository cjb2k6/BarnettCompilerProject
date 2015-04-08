//The main parse function
function parse(){
	//Create an artificial root for the CST
	cst.addBranchNode("ROOT");
	
	putMessage("Begin Parse");
	//Read in the first token
	currentToken = getNextToken();
	//Start the parse
	parseProgram();
	
	if(tokenIndex < tokens.length){
		putMessage("\nWARNING! There should not be any code after the EOF symbol($).\n");
	}
	putMessage("--------------------------");
	putMessage("Parsing Finished");
	putMessage("Parsing found " + errorCount + " error(s).");
}

function parseProgram(){
	cst.addBranchNode("Program");
	parseBlock();
	matchToken("T_EOF");
	cst.rtp();
}

function parseBlock(){
	cst.addBranchNode("Block");
	cst.addLeafNode(currentToken);
	matchToken("T_LEFTBRACE");
	parseStatementList();
	cst.addLeafNode(currentToken);
	matchToken("T_RIGHTBRACE");
	cst.rtp();
}

function parseStatementList(){
	cst.addBranchNode("StatementList");
	var t = currentToken.type;
	if(t == "T_PRINT" || t == "T_ID" || t == "T_TYPE" ||  t == "T_WHILE" || t == "T_IF" || t == "T_LEFTBRACE"){
		parseStatement();
		parseStatementList();
	}else{
		//Epsilon Thingy
		cst.addLeafNode(epsilon);
	}
	cst.rtp();
}

function parseStatement(){
	cst.addBranchNode("Statement");
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
		
		case "T_LEFTBRACE":
			parseBlock();
		break;
		
		default:
			putMessage("Could not parseStatement " + currentToken.type);
	}
	cst.rtp();
}

function parsePrintStatement(){
	cst.addBranchNode("PrintStatement");
	cst.addLeafNode(currentToken);
	matchToken("T_PRINT");
	cst.addLeafNode(currentToken);
	matchToken("T_LEFTPAREN");
	parseExpr();
	cst.addLeafNode(currentToken);
	matchToken("T_RIGHTPAREN");
	cst.rtp();
}

function parseAssignmentStatement(){
	cst.addBranchNode("AssignmentStatement");
	cst.addLeafNode(currentToken);
	matchToken("T_ID");
	cst.addLeafNode(currentToken);
	matchToken("T_ASSIGNOP");
	parseExpr();
	cst.rtp();
}

function parseVarDecl(){
	cst.addBranchNode("VarDecl");
	cst.addLeafNode(currentToken);
	matchToken("T_TYPE");
	cst.addLeafNode(currentToken);
	matchToken("T_ID");
	cst.rtp();
}

function parseWhileStatement(){
	cst.addBranchNode("WhileStatement");
	cst.addLeafNode(currentToken);
	matchToken("T_WHILE");
	parseBooleanExpr();
	parseBlock();
	cst.rtp();
}

function parseIfStatement(){
	cst.addBranchNode("IfStatement");
	cst.addLeafNode(currentToken);
	matchToken("T_IF");
	parseBooleanExpr();
	parseBlock();
	cst.rtp();
}

function parseExpr(){
	cst.addBranchNode("Expr");
	switch(currentToken.type){
		case "T_DIGIT":
			parseIntExpr();
		break;
		
		case "T_DBLQUOTE":
			parseStringExpr();
		break;
		
		case "T_LEFTPAREN":
			parseBooleanExpr();
		break;
		
		case "T_BOOLVAL":
			parseBooleanExpr();
		break;
		
		case "T_ID":
			cst.addLeafNode(currentToken);
			matchToken("T_ID");
		break;
		
		default:
			putMessage("Could not parseExpr " + currentToken.type);
	}
	cst.rtp();
}

function parseIntExpr(){
	cst.addBranchNode("IntExpr");
	cst.addLeafNode(currentToken);
	matchToken("T_DIGIT");
	if(currentToken.type == "T_INTOP"){
		cst.addLeafNode(currentToken);
		matchToken("T_INTOP");
		parseExpr();
	}
	cst.rtp();
}

function parseStringExpr(){
	cst.addBranchNode("StringExpr");
	cst.addLeafNode(currentToken);
	matchToken("T_DBLQUOTE");
	parseCharList();
	cst.addLeafNode(currentToken);
	matchToken("T_DBLQUOTE");
	cst.rtp()
}

function parseBooleanExpr(){
	cst.addBranchNode("BooleanExpr");
	if(currentToken.type == "T_LEFTPAREN"){
		cst.addLeafNode(currentToken);
		matchToken("T_LEFTPAREN");
		parseExpr();
		cst.addLeafNode(currentToken);
		matchToken("T_BOOLOP");
		parseExpr();
		cst.addLeafNode(currentToken);
		matchToken("T_RIGHTPAREN");
	}else{
		cst.addLeafNode(currentToken);
		matchToken("T_BOOLVAL");
	}
	cst.rtp();
}

function parseCharList(){
	cst.addBranchNode("CharList");
	var t = currentToken.type;
	if(t == "T_CHAR" || t == "T_SPACE"){
		if(t == "T_CHAR"){
			cst.addLeafNode(currentToken);
			matchToken("T_CHAR");
			parseCharList();
		}else{
			cst.addLeafNode(currentToken);
			matchToken("T_SPACE");
			parseCharList();
		}
	} else {
		//Epsilon Thingy
		cst.addLeafNode(epsilon);
	}
	cst.rtp();
}

//Function from Alan's example, modified a bit
function getNextToken() {
        var thisToken = EOF;    // Let's assume that we're at the EOF.
		if(tokenIndex == tokens.length - 1){
			if(tokens[tokenIndex].type != "T_EOF"){
				putMessage("\nWARNING! No $ detected at the end of file, one will be added automatically.\n");
				tokens[tokens.length] = EOF;
			}
		}
        if (tokenIndex < tokens.length)
        {
            // If we're not at EOF, then return the next token in the stream and advance the index.
            thisToken = tokens[tokenIndex];
			putMessage("--------------------------");
            putMessage("Current token:" + thisToken.type + ": " + thisToken.value);
            tokenIndex++;
        }
        return thisToken;
    }

//This function will check to see if the current token is the same type as the expected token type
function matchToken(expectedType){
	switch(expectedType){
		case "T_EOF":
					putMessage("Expecting EOF");
						if(currentToken.type == "T_EOF"){
							putMessage("Got EOF!");
						} else {
							putMessage("\nError: Got " + currentToken.type + " instead on line " + currentToken.lineNumber + "\n");
							errorCount++;
						}
		break;
		
		case "T_LEFTBRACE":
					putMessage("Expecting a Left Brace");
					if(currentToken.type == "T_LEFTBRACE"){
						putMessage("Got a Left Brace!");
					} else {
						putMessage("\nError: Got " + currentToken.type + " instead on line " + currentToken.lineNumber + "\n");
						errorCount++;
					}
		break;
		
		case "T_RIGHTBRACE":
					putMessage("Expecting a Right Brace");
					if(currentToken.type == "T_RIGHTBRACE"){
						putMessage("Got a Right Brace!");
					} else {
						putMessage("\nError: Got " + currentToken.type + " instead on line " + currentToken.lineNumber + "\n");
						errorCount++;
					}
		break;
		
		case "T_PRINT":
					putMessage("Expecting Print Keyword");
					if(currentToken.type == "T_PRINT"){
						putMessage("Got a Print Keyword!");
					} else {
						putMessage("\nError: Got " + currentToken.type + " instead on line " + currentToken.lineNumber + "\n");
						errorCount++;
					}
		break;
		
		case "T_ID":
					putMessage("Expecting Identifier");
					if(currentToken.type == "T_ID"){
						putMessage("Got an Identifier!");
					} else {
						putMessage("\nError: Got " + currentToken.type + " instead on line " + currentToken.lineNumber + "\n");
						errorCount++;
					}
		break;
		
		case "T_TYPE":
					putMessage("Expecting a Type Keyword");
					if(currentToken.type == "T_TYPE"){
						putMessage("Got a Type Keyword!");
					} else {
						putMessage("\nError: Got " + currentToken.type + " instead on line " + currentToken.lineNumber + "\n");
						errorCount++;
					}
		break;
		
		case "T_WHILE":
					putMessage("Expecting While Keyword");
					if(currentToken.type == "T_WHILE"){
						putMessage("Got the While Keyword!");
					} else {
						putMessage("\nError: Got " + currentToken.type + " instead on line " + currentToken.lineNumber + "\n");
						errorCount++;
					}
		break;
		
		case "T_IF":
					putMessage("Expecting If Keyword");
					if(currentToken.type == "T_IF"){
						putMessage("Got the If Keyword!");
					} else {
						putMessage("\nError: Got " + currentToken.type + " instead on line " + currentToken.lineNumber + "\n");
						errorCount++;
					}
		break;
		
		case "T_LEFTPAREN":
					putMessage("Expecting Left Paren");
					if(currentToken.type == "T_LEFTPAREN"){
						putMessage("Got a Left Paren!");
					} else {
						putMessage("\nError: Got " + currentToken.type + " instead on line " + currentToken.lineNumber + "\n");
						errorCount++;
					}
		break;
		
		case "T_RIGHTPAREN":
					putMessage("Expecting Right Paren");
					if(currentToken.type == "T_RIGHTPAREN"){
						putMessage("Got a RIGHT Paren!");
					} else {
						putMessage("\nError: Got " + currentToken.type + " instead on line " + currentToken.lineNumber + "\n");
						errorCount++;
					}
		break;
		
		case "T_INTOP":
					putMessage("Expecting an Int Operator");
					if(currentToken.type == "T_INTOP"){
						putMessage("Got an Int Operator!");
					} else {
						putMessage("\nError: Got " + currentToken.type + " instead on line " + currentToken.lineNumber + "\n");
						errorCount++;
					}
		break;
		
		case "T_DBLQUOTE":
					putMessage("Expecting a Double Quotation Mark");
					if(currentToken.type == "T_DBLQUOTE"){
						putMessage("Got a Double Quotation Mark!");
					} else {
						putMessage("\nError: Got " + currentToken.type + " instead on line " + currentToken.lineNumber + "\n");
						errorCount++;
					}
		break;
		
		case "T_BOOLVAL":
					putMessage("Expecting a Boolean Value");
					if(currentToken.type == "T_BOOLVAL"){
						putMessage("Got a Boolean!");
					} else {
						putMessage("\nError: Got " + currentToken.type + " instead on line " + currentToken.lineNumber + "\n");
						errorCount++;
					}
		break;
		
		case "T_BOOLOP":
					putMessage("Expecting a Boolean Operator");
					if(currentToken.type == "T_BOOLOP"){
						putMessage("Got a Boolean Operator!");
					} else {
						putMessage("\nError: Got " + currentToken.type + " instead on line " + currentToken.lineNumber + "\n");
						errorCount++;
					}
		break;
		
		case "T_ASSIGNOP":
					putMessage("Expecting an Assignment Operator");
					if(currentToken.type == "T_ASSIGNOP"){
						putMessage("Got an Assignment Operator!");
					} else {
						putMessage("\nError: Got " + currentToken.type + " instead on line " + currentToken.lineNumber + "\n");
						errorCount++;
					}
		break;
		
		case "T_DIGIT":
					putMessage("Expecting a Digit");
					if(currentToken.type == "T_DIGIT"){
						putMessage("Got a Digit!");
					} else {
						putMessage("\nError: Got " + currentToken.type + " instead on line " + currentToken.lineNumber + "\n");
						errorCount++;
					}
		break;
		
		case "T_CHAR":
					putMessage("Expecting a Character");
					if(currentToken.type == "T_CHAR"){
						putMessage("Got a Character!");
					} else {
						putMessage("\nError: Got " + currentToken.type + " instead on line " + currentToken.lineNumber + "\n");
						errorCount++;
					}
		break;
		
		case "T_SPACE":
					putMessage("Expecting a Space");
					if(currentToken.type == "T_SPACE"){
						putMessage("Got a Space!");
					} else {
						putMessage("\nError: Got " + currentToken.type + " instead on line" + currentToken.lineNumber + "\n");
						errorCount++;
					}
		break;
		
		default:
					putMessage("\nMatch Token Failed on Line " + currentToken.lineNumber + "\n");
					errorCount++;
		
	}
	//Read the next token
	currentToken = getNextToken();
}