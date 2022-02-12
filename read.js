const reader = require("fs");
const parser = require("@solidity-parser/parser");

const parse = (filePath) => {
	reader.readFile(filePath, 'utf-8', function(e, code){
		try {
			handleAST(parser.parse(code));
		} catch (e) {
			if (e instanceof parser.ParserError) {
				console.error(e.errors);
			}
		}
	});
}

function handleAST(ast){
	console.log(ast);
}

function importCheck(ast){
	let hasImport = false;
	parser.visit(ast, 
		{
			ImportDirective : function (node){
				const fullPath = 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/math/SafeMath.sol'
				const shortPath = '@openzeppelin/contracts/math/SafeMath.sol'

				node.path.startsWith(fullPath) || node.path.startsWith(shortPath) ? hasImport = true : null;
			}
	})
	
	return hasImport;
}

function findOperation(ast) {
	parser.visit(ast, 
		{
		FunctionDefinition : function(func_node){
			visitExpression(ast, func_node);
		}
	})
}

function visitExpression(ast, func_node){
	parser.visit(func_node, 
		{
			ExpressionStatement : function(exp_node){
				let var_used;
				const exp_type = exp_node.expression.type;
				if(exp_type === 'UnaryOperation' || exp_type === 'BinaryOperation'){
					if(exp_type === 'UnaryOperation') {
						var_used = exp_node.expression.subExpression;
					} else {
						var_used = exp_node.expression.left;
					}
					variableCheck(ast, var_used);
				}
		}
	})
}
function variableCheck(ast, var_used) {
	let isUsingSafeMath = false;
	parser.visit(ast, {
		StateVariableDeclaration : function(decl_node){
			if(decl_node.variables.length === 1) {
				const var_declared = decl_node.variables[0];
				if(var_declared.identifier.name === var_used.name){
					isUsingSafeMath = findDeclForType(ast, var_declared.typeName)
				}
			}
		}
	})

	return isUsingSafeMath;
}
function findDeclForType(ast, var_type){
	let libraryFound = false;
	parser.visit(ast, {
		UsingForDeclaration : function(node){
			console.log(node);
			if(node.libraryName === 'SafeMath' && node.typeName['name'] === var_type['name']){
				libraryFound = true;
			}
		}
	})

	return libraryFound;
}

module.exports = {
	parse,
	importCheck,
	findOperation,
}