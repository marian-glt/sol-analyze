const parser = require("@solidity-parser/parser");

function IntegerRolloverRule(ast){
	const imports = hasImport(ast);
	findOperation(ast);
	handleResults(imports);
}

function handleResults(imports){
	if(unprotTypes.length >= 1 && imports === false){
		console.log("You have variables that are at risk of rollover, you should import SafeMath and declare it for their types.")
	}
	unprotTypes.forEach(type => {
		console.log("I've detected that you variables with type '" + type + "' that are not protected using SafeMath.")
	});
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
			} else {
				unProtectedTypes(varType);
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
function unProtectedTypes(typeName){
	let isUnprotType = false
	unprotTypes.forEach(type => {
		type === typeName ? isUnprotType = false: null
	});

	if(!isUnprotType){
		unprotTypes.push(typeName);
	}
}
function protectedTypes(typeName, add){
	let newType = false;
	protTypes.forEach(type => {
		type === typeName ? newType = false: null
	});

	if(add){
		protTypes.push(typeName);
		newType = true;
	}
	
	return newType;
}

const protTypes = []
const unprotTypes = []

module.exports = {
    IntegerRolloverRule
}