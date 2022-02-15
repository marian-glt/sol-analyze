const { OutdatedCompilerRule } = require("./OutdatedCompilerRule");
const parser = require("@solidity-parser/parser");

const IntegerRolloverRule = (ast) => {
    let oc = OutdatedCompilerRule(ast);
    if(oc) {
        let ic = ImportCheck(ast);
        let fo = FindOperation(ast, GetFunctions(ast));
    }
}

function ImportCheck(ast){
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

function FindOperation(ast, functions){
    for (const func in functions) {
        parser.visit(func, {
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
}

function variableCheck(ast, var_used){
    let isUsingSafeMath = false;
	let var_type;
	parser.visit(ast, {
		StateVariableDeclaration : function(decl_node){
			if(decl_node.variables.length === 1) {
				const var_declared = decl_node.variables[0];
				if(var_declared.identifier.name === var_used.name){
					var_type = var_declared.typeName;
					parser.visit(ast, {
						UsingForDeclaration : function(node){
							if(node.libraryName === 'SafeMath' && node.typeName['name'] === var_type['name']){
								isUsingSafeMath = true;
							}
						}
					})
				}
			}
		},
	})
	return isUsingSafeMath;
}
function GetFunctions(ast){
    let functions = []
    parser.visit(ast, {
        FunctionDefinition : function(node){
            functions.push(node);
        }
    })

    return functions;
}

module.exports = {
    IntegerRolloverRule
}