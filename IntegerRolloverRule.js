const parser = require("@solidity-parser/parser");

function IntegerRolloverRule(ast){
	const imports = hasImport(ast);
	findOperation(ast);
}

function hasImport(ast){
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

function findOperation(ast){
	const functions = GetFunctions(ast);
	let hasUnsafeVariable = false;
	functions.forEach(func => {
		parser.visit(func, {
            ExpressionStatement : function(expNode){
				const expType = expNode.expression.type;
				if(expType === 'UnaryOperation' || expType === 'BinaryOperation'){
					let varUsed;
					//console.log("We have an op");
					if(expType === 'UnaryOperation') {
						varUsed = expNode.expression.subExpression;
					} else {
						varUsed = expNode.expression.left;
					}
					hasUnsafeVariable = variableDeclarationCheck(ast, varUsed);
				}
            }
        })
	});

	return hasUnsafeVariable;
}

function variableDeclarationCheck(ast, varUsed){
	let isUsingSafeMath = false;
	parser.visit(ast, {
		StateVariableDeclaration : function(node){
			if(node.variables.length === 1){
				const toCheck = node.variables[0];
				if(toCheck.identifier.name === varUsed.name){
					const discoveredBefore = protectedTypes(toCheck.typeName['name'], false);
					if(discoveredBefore != true){
						isUsingSafeMath = usingDeclarationCheck(ast, toCheck.typeName['name']);
					} else if(discoveredBefore){
						isUsingSafeMath = true;
						return 0;
					}
					console.log(isUsingSafeMath)
				}
			}
		}
	})

	return isUsingSafeMath;
}

function usingDeclarationCheck(ast, varType){
	let typeProtected = false;
	parser.visit(ast, {
		UsingForDeclaration : function(usingNode){
			if(usingNode.libraryName === 'SafeMath' && usingNode.typeName['name'] === varType){
				typeProtected = true;
				protectedTypes(varType, true);
			}
		}
	})

	return typeProtected;
}
function GetFunctions(ast){
    const functions = []
    parser.visit(ast, {
        FunctionDefinition : function(node){
            functions.push(node);
        }
    })
    return functions;
}

function protectedTypes(typeName, add){
	let newType = false;
	types.forEach(type => {
		type === typeName ? newType = false: null
	});

	if(add){
		types.push(typeName);
		newType = true;
	}
	
	return newType;
}

const types = []


module.exports = {
    IntegerRolloverRule
}