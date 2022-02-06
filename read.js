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

const find = (str, regex) => {
	return (str.match(regex) || []);
}

function handleAST(ast){
	importCheck(ast);
}

function pragmaCheck(ast){
	const opReg = new RegExp('[>|<]+=?|\\^', 'g');
	const verReg = new RegExp('(0\.(1\.[0-7])|(2\.[0-2])|(3\.[0-6])|(4\.[1-2]?[0-9])|(5\.1?[0-9])|(6\.1?[0-9])|(7\.[0-6])){1}');
	let isOldVersion = false;
	parser.visit(ast, 
		{
			PragmaDirective: function(node){
				const pragma = node.value;
				const matches = find(node.value, opReg);
				
				if(matches.includes('^') && verReg.test(pragma)){
					//for contracts that use the "^" sign, e.g. "pragma solidity ^0.7.0"
					isOldVersion = true;
				} else if(opReg.test(pragma)){
					const signMatches = find(pragma, opReg);
					if(signMatches.length === 2){
						//for contracts that have 2 limitation signs, e.g. "pragma solidity >0.6.0 <=0.8.0"
						pragma.replace(opReg, '');
						const firstHalf = pragma.substring(0, pragma.indexOf(signMatches[1]))
						const secondHalf = pragma.substring(pragma.indexOf(signMatches[1]));
						const pragmaArr = [firstHalf, secondHalf];
						for (let i = 0; i < pragmaArr.length; i++) {
							verReg.test(pragmaArr[i]) ? isOldVersion = true : null;
						}
					} else if(signMatches.length === 1 && verReg.test(pragma)){
						//for contracts with one limitation sign e.g. "pragma solidity ^0.8.11"
						isOldVersion = true;
					} else {
						//for contracts that do not have a limitation sign, but just the solidity version specified e.g. "pragma solidity 0.6.0"
						verReg.test(pragma) ? isOldVersion = true : null;
					}
				}
			}
		}
	)

	return isOldVersion;
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
	let hasOperation = false;
	parser.visit(ast, 
		{
		FunctionDefinition : function(func_node){
			parser.visit(func_node, 
				{
					ExpressionStatement : function(exp_node){
						const exp_type = exp_node.expression.type;
						if(exp_type === 'UnaryOperation'){
							hasOperation = true;
							visitUnaryOperation(ast, exp_node);
						}else if(exp_type === 'BinaryOperation'){
							hasOperation = true;
							visitBinaryOperation(ast, exp_node);
						}
				}
			})
		}
	})

	return hasOperation;
}
function visitUnaryOperation(ast, parent_node){
	parser.visit(parent_node, {
		UnaryOperation : function(op_node){
			if(op_node.subExpression.type === 'Identifier'){
				const var_used = op_node.subExpression
				variableCheck(ast, var_used);
			}
		},
	})
}
function visitBinaryOperation(ast, parent_node){
	parser.visit(parent_node, {
		BinaryOperation : function(op_node){
			if(op_node.left.type === 'Identifier'){
				const var_used = op_node.left
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
	pragmaCheck,
	importCheck,
	findOperation,

}