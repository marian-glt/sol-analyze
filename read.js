const reader = require("fs");
const parser = require("@solidity-parser/parser");

const parse = (filePath) => {
	reader.readFile(filePath, 'utf-8', function(err, code){
		try {
			handleAST(parser.parse(code, {loc: true}));
		} catch (e) {
			if (e instanceof parser.ParserError) {
				console.error(e.errors);
			}
		}
	});
}

const find = (str, regex) => {
	return (str.match(regex) || []);
}

function handleAST(ast){
	checkSafeMathUsage(ast);
}

function checkPragma(ast){
	const opReg = new RegExp('[>|<]+=?|\\^', 'g');
	const verReg = new RegExp('(0\.(1\.[0-7])|(2\.[0-2])|(3\.[0-6])|(4\.[1-2]?[0-9])|(5\.1?[0-9])|(6\.1?[0-9])|(7\.[0-6])){1}');
	parser.visit(ast, 
		{
			PragmaDirective: function(node){
				const pragma = node.value;
				const matches = find(node.value, opReg);
				
				if(matches.includes('^') && verReg.test(pragma)){
					//warning message
					console.log("Compiling with an old version of Solidity, please change to a newer version.");
				} else if(opReg.test(pragma)){
					const signMatches = find(pragma, opReg);
					if(signMatches.length === 2){
						pragma.replace(opReg, '');
						let oldVersion = false;
						const firstHalf = pragma.substring(0, pragma.indexOf(signMatches[1]))
						const secondHalf = pragma.substring(pragma.indexOf(signMatches[1]));
						const pragmaArr = [firstHalf, secondHalf]
						for (let i = 0; i < pragmaArr.length; i++) {
							verReg.test(pragmaArr[i]) ? oldVersion = true : console.log("no matches")
							
						}
						oldVersion ? console.log("Contract can run on older Solidity, consider changing to a newer version") : null;
					} else if(signMatches.length === 1 && verReg.test(pragma)){
						console.log("Compiling with an old version of Solidity, please change to a newer version.")
					} else {
						verReg.test(pragma) ? console.log("Compiling with an old version of Solidity, please set compiler to a newer version.") : null;
					}
				}
			}
		}
	)
}
const results = []
const checkSafeMathUsage = (ast) =>{
	parser.visit(ast, 
		{
			ImportDirective : function (node){
				const fullPath = 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/math/SafeMath.sol'
				const shortPath = '@openzeppelin/contracts/math/SafeMath.sol'

				node.path.startsWith(fullPath) || node.path.startsWith(shortPath) ? console.log("Import Found"): console.log("Import not Found");
			},

			FunctionDefinition : function(func_node){
				parser.visit(func_node, 
					{
						ExpressionStatement : function(exp_node){
							const exp_type = exp_node.expression.type;
							if(exp_type === 'UnaryOperation'){
								visitUnaryOperation(ast, exp_node);
							}else if(exp_type === 'BinaryOperation'){
								visitBinaryOperation(ast, exp_node);
							}
					}
				})
			},

			UsingForDeclaration : function(node){
				node.libraryName === 'SafeMath' ? console.log("SafeMath Use Found") : console.log('SafeMath Use Not Found');
			},
	})
}

function visitUnaryOperation(ast, parent_node){
	parser.visit(parent_node, {
		UnaryOperation : function(op_node){
			if(op_node.subExpression.type === 'Identifier'){
				const var_used = op_node.subExpression
				parser.visit(ast, {
					StateVariableDeclaration : function(decl_node){
						if(decl_node.variables.length === 1) {
							const var_declared = decl_node.variables[0];
							var_declared.identifier.name === var_used.name ? console.log("Variables Match") : null
						}
					}
				})
			}
		},
	})
}

function visitBinaryOperation(ast, parent_node){
	parser.visit(parent_node, {
		BinaryOperation : function(op_node){
			if(op_node.left.type === 'Identifier'){
				const var_used = op_node.left
				parser.visit(ast, {
					StateVariableDeclaration : function(decl_node){
						if(decl_node.variables.length === 1) {
							const var_declared = decl_node.variables[0];
							var_declared.identifier.name === var_used.name ? console.log("Variables Match") : null
						}
					}
				})
			}
		}
	})
}
function checkUsingDeclaration(ast){
	parser.visit(ast, {
		UsingForDeclaration: function(node){
			node.libraryName === 'SafeMath' ? console.log("SafeMath Use Found") : console.log('SafeMath Use Not Found');
		}
	})
}

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


module.exports = {
	parse
}