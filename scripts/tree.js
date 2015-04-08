//FUNCTIONS------------------------------------------------------------------------------
//This is the tree class definition.
function Tree(){
	//Tree Variables------------------------------------------------------------
	this.root = null;
	this.current = {};
	
	//Tree Functions------------------------------------------------------------
	//Function to add a new branch off of the current node and go to that branch
	this.addBranchNode = function(name){
		var node = { name: name,
					children: [],
					parent: {}
					};
		
		// Check to see if it needs to be the root node.
        if ( (this.root == null) || (!this.root) ){
            // This is the root node.
            this.root = node;
        }else{
			//Assign the current node to be this node's parent.
            node.parent = this.current;
			//Add this node to the children of its parent
            this.current.children.push(node);
        }
		//Assign this node to be the current node
		this.current = this.node;
    };
	
	//Function to add a new leaf off of the current node
	this.addLeafNode = function(name){
		var node = { name: name,
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
	this.rtp(){
		this.current = current.parent;
	};
	
}