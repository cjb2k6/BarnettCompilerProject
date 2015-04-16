//FUNCTIONS------------------------------------------------------------------------------
//This is the tree class definition.
function Tree(){
	//Tree Variables------------------------------------------------------------
	this.root = null;
	this.current = {};
	
	//Tree Functions------------------------------------------------------------
	//Function to add a new branch off of the current node and go to that branch
	this.addBranchNode = function(name){
		var node = { token:{}, 
					name: name,
					children: [],
					parent: {}
					};
		
		// Check to see if it needs to be the root node.
        if ( (this.root == null) || (!this.root) ){
            // This is the root node.
            this.root = node;
			//putMessage("Created Root Node: " + node.name);
        }else{
			//Assign the current node to be this node's parent.
            node.parent = this.current;
			//Add this node to the children of its parent
			//putMessage("Created Branch Node: " + node.name);
            this.current.children.push(node);
        }
		//Assign this node to be the current node
		this.current = node;
    };
	
	//Function to add a new scope node for Symbol Table only
	this.addScopeNode = function(level){
		var node = { scope:new scope(level), 
					name: "Scope " + level,
					children: [],
					parent: {}
					};
		
		// Check to see if it needs to be the root node.
        if ( (this.root == null) || (!this.root) ){
            // This is the root node.
            this.root = node;
			//putMessage("Created Root Node: " + node.name);
        }else{
			//Assign the current node to be this node's parent.
            node.parent = this.current;
			//Add this node to the children of its parent
			//putMessage("Created Branch Node: " + node.name);
            this.current.children.push(node);
        }
		//Assign this node to be the current node
		this.current = node;
    };
	
	//Function to add a new leaf off of the current node
	this.addLeafNode = function(token){
		var node = {token: token,
					name: token.value,
					children: [],
					parent: {}
					};
		
		// Check to see if this is the root node, this should not happen.
        if ( (this.node == this.root)){
			putMessage("The root node cannot be a leaf node.");
		}else{
			//Assign the current node to be this node's parent.
            node.parent = this.current;
			//Add this node to the children of its parent
            this.current.children.push(node);
		}
	};
	
	//Function to Return to Parent node.
	this.rtp = function(){
		//putMessage("Returning to parent: " + this.current.parent.name);
		this.current = this.current.parent;
	};
		
	//Function from jsTreeDemo to print the tree.
	// Return a string representation of the tree.
    this.toString = function() {
        // Initialize the result string.
        var traversalResult = "";

        // Recursive function to handle the expansion of the nodes.
        function expand(node, depth)
        {
            // Space out based on the current depth so
            // this looks at least a little tree-like.
            for (var i = 0; i < depth; i++)
            {
                traversalResult += "-";
            }

            // If there are no children (i.e., leaf nodes)...
            if (!node.children || node.children.length === 0)
            {
                // ... note the leaf node.
                traversalResult += "[" + node.name + "]";
                traversalResult += "\n";
            }
            else
            {
                // There are children, so note these interior/branch nodes and ...
                traversalResult += "<" + node.name + "> \n";
                // .. recursively expand them.
                for (var i = 0; i < node.children.length; i++)
                {
                    expand(node.children[i], depth + 1);
                }
            }
        }
        // Make the initial call to expand from the root.
        expand(this.root, 0);
        // Return the result.
        return traversalResult;
    };
	
	this.printSymbTab = function() {
        // Initialize the result string.
        var traversalResult = "";

        // Recursive function to handle the expansion of the nodes.
        function expand(node, depth)
        {
			// There are children, so note these interior/branch nodes and ...
			traversalResult += "\n" + node.name + " " + node.scope;
			// .. recursively expand them.
			for (var i = 0; i < node.children.length; i++)
			{
				expand(node.children[i], depth + 1);
			}
        }
        // Make the initial call to expand from the root.
		putMessage("Scope\tType\tId\tLnNum");
		putMessage("-----------------------------");
        expand(this.root, 0);
        // Return the result.
        return traversalResult;
    };
	
}