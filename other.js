function checkRequire(ast){
	console.log(ast);
}

function checkSendUsage(ast){
	parser.visit(ast, {
		FunctionDefinition: function(parent){
			console.log("Visiting function");
			parser.visit(parent, {
				ExpressionStatement: function(child){
					console.log("Visiting Statement");
					console.log(child);
					if(child.expression.type === 'FunctionCall'){
						console.log("Found a Function Call");
						
					}
				}
			}
		)}
	})
}

function checkMethodVisibility(ast){
	parser.visit(ast, 
		{
			FunctionDefinition: function(node){
				if(node.visibility === 'default'){
						
				}
			}
		}
	)
}
