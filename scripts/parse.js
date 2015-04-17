//The main parse function
function parse(){
	//Create an artificial root for the CST
	cst.addBranchNode("ROOT");
	
	outputParse("Begin Parse");
	//Read in the first token
	currentToken = getNextToken();
	//Start the parse
	parseProgram();
	
	if(tokenIndex < tokens.length){
		outputParse("\nWARNING! There should not be any code after the EOF symbol($).\n");
	}
	outputParse("--------------------------");
	outputParse("Parsing Finished");
	outputParse("Parsing found " + errorCount + " error(s).");
	if(errorCount > 0){
		output("parse"); //Show the parse output
	}
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
			outputParse("Could not parseStatement " + currentToken.type);
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
	cst.addBranchNode("if");
	matchToken("T_IF");
	parseBooleanExpr();
	parseBlock();
	cst.rtp();
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
			outputParse("Could not parseExpr " + currentToken.type);
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
				outputParse("\nWARNING! No $ detected at the end of file, one will be added automatically.\n");
				tokens[tokens.length] = EOF;
			}
		}
        if (tokenIndex < tokens.length)
        {
            // If we're not at EOF, then return the next token in the stream and advance the index.
            thisToken = tokens[tokenIndex];
			outputParse("--------------------------");
            outputParse("Current token:" + thisToken.type + ": " + thisToken.value);
            tokenIndex++;
        }
        return thisToken;
    }

//This function will check to see if the current token is the same type as the expected token type
function matchToken(expectedType){
	switch(expectedType){
		case "T_EOF":
					outputParse("Expecting EOF");
						if(currentToken.type == "T_EOF"){
							outputParse("Got EOF!");
						} else {
							outputParse("\nError: Got " + currentToken.type + " instead on line " + currentToken.lineNumber + "\n");
							errorCount++;
						}
		break;
		
		case "T_LEFTBRACE":
					outputParse("Expecting a Left Brace");
					if(currentToken.type == "T_LEFTBRACE"){
						outputParse("Got a Left Brace!");
					} else {
						outputParse("\nError: Got " + currentToken.type + " instead on line " + currentToken.lineNumber + "\n");
						errorCount++;
					}
		break;
		
		case "T_RIGHTBRACE":
					outputParse("Expecting a Right Brace");
					if(currentToken.type == "T_RIGHTBRACE"){
						outputParse("Got a Right Brace!");
					} else {
						outputParse("\nError: Got " + currentToken.type + " instead on line " + currentToken.lineNumber + "\n");
						errorCount++;
					}
		break;
		
		case "T_PRINT":
					outputParse("Expecting Print Keyword");
					if(currentToken.type == "T_PRINT"){
						outputParse("Got a Print Keyword!");
					} else {
						outputParse("\nError: Got " + currentToken.type + " instead on line " + currentToken.lineNumber + "\n");
						errorCount++;
					}
		break;
		
		case "T_ID":
					outputParse("Expecting Identifier");
					if(currentToken.type == "T_ID"){
						outputParse("Got an Identifier!");
					} else {
						outputParse("\nError: Got " + currentToken.type + " instead on line " + currentToken.lineNumber + "\n");
						errorCount++;
					}
		break;
		
		case "T_TYPE":
					outputParse("Expecting a Type Keyword");
					if(currentToken.type == "T_TYPE"){
						outputParse("Got a Type Keyword!");
					} else {
						outputParse("\nError: Got " + currentToken.type + " instead on line " + currentToken.lineNumber + "\n");
						errorCount++;
					}
		break;
		
		case "T_WHILE":
					outputParse("Expecting While Keyword");
					if(currentToken.type == "T_WHILE"){
						outputParse("Got the While Keyword!");
					} else {
						outputParse("\nError: Got " + currentToken.type + " instead on line " + currentToken.lineNumber + "\n");
						errorCount++;
					}
		break;
		
		case "T_IF":
					outputParse("Expecting If Keyword");
					if(currentToken.type == "T_IF"){
						outputParse("Got the If Keyword!");
					} else {
						outputParse("\nError: Got " + currentToken.type + " instead on line " + currentToken.lineNumber + "\n");
						errorCount++;
					}
		break;
		
		case "T_LEFTPAREN":
					outputParse("Expecting Left Paren");
					if(currentToken.type == "T_LEFTPAREN"){
						outputParse("Got a Left Paren!");
					} else {
						outputParse("\nError: Got " + currentToken.type + " instead on line " + currentToken.lineNumber + "\n");
						errorCount++;
					}
		break;
		
		case "T_RIGHTPAREN":
					outputParse("Expecting Right Paren");
					if(currentToken.type == "T_RIGHTPAREN"){
						outputParse("Got a RIGHT Paren!");
					} else {
						outputParse("\nError: Got " + currentToken.type + " instead on line " + currentToken.lineNumber + "\n");
						errorCount++;
					}
		break;
		
		case "T_INTOP":
					outputParse("Expecting an Int Operator");
					if(currentToken.type == "T_INTOP"){
						outputParse("Got an Int Operator!");
					} else {
						outputParse("\nError: Got " + currentToken.type + " instead on line " + currentToken.lineNumber + "\n");
						errorCount++;
					}
		break;
		
		case "T_DBLQUOTE":
					outputParse("Expecting a Double Quotation Mark");
					if(currentToken.type == "T_DBLQUOTE"){
						outputParse("Got a Double Quotation Mark!");
					} else {
						outputParse("\nError: Got " + currentToken.type + " instead on line " + currentToken.lineNumber + "\n");
						errorCount++;
					}
		break;
		
		case "T_BOOLVAL":
					outputParse("Expecting a Boolean Value");
					if(currentToken.type == "T_BOOLVAL"){
						outputParse("Got a Boolean!");
					} else {
						outputParse("\nError: Got " + currentToken.type + " instead on line " + currentToken.lineNumber + "\n");
						errorCount++;
					}
		break;
		
		case "T_BOOLOP":
					outputParse("Expecting a Boolean Operator");
					if(currentToken.type == "T_BOOLOP"){
						outputParse("Got a Boolean Operator!");
					} else {
						outputParse("\nError: Got " + currentToken.type + " instead on line " + currentToken.lineNumber + "\n");
						errorCount++;
					}
		break;
		
		case "T_ASSIGNOP":
					outputParse("Expecting an Assignment Operator");
					if(currentToken.type == "T_ASSIGNOP"){
						outputParse("Got an Assignment Operator!");
					} else {
						outputParse("\nError: Got " + currentToken.type + " instead on line " + currentToken.lineNumber + "\n");
						errorCount++;
					}
		break;
		
		case "T_DIGIT":
					outputParse("Expecting a Digit");
					if(currentToken.type == "T_DIGIT"){
						outputParse("Got a Digit!");
					} else {
						outputParse("\nError: Got " + currentToken.type + " instead on line " + currentToken.lineNumber + "\n");
						errorCount++;
					}
		break;
		
		case "T_CHAR":
					outputParse("Expecting a Character");
					if(currentToken.type == "T_CHAR"){
						outputParse("Got a Character!");
					} else {
						outputParse("\nError: Got " + currentToken.type + " instead on line " + currentToken.lineNumber + "\n");
						errorCount++;
					}
		break;
		
		case "T_SPACE":
					outputParse("Expecting a Space");
					if(currentToken.type == "T_SPACE"){
						outputParse("Got a Space!");
					} else {
						outputParse("\nError: Got " + currentToken.type + " instead on line" + currentToken.lineNumber + "\n");
						errorCount++;
					}
		break;
		
		default:
					outputParse("\nMatch Token Failed on Line " + currentToken.lineNumber + "\n");
					errorCount++;
		
	}
	//Read the next token
	currentToken = getNextToken();
}
function outputParse(str){
	parseOut += str + "\n";
}