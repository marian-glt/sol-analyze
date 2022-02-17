// @ts-nocheck
const parser = require("@solidity-parser/parser")

const OutdatedCompilerRule = (ast) => {
	let isOldVersion = false;
	parser.visit(ast, 
		{
			PragmaDirective: function(node){
				const pragma = node.value;
				const matches = find(node.value, opRegEx);
				
				if(matches.includes('^') && oldVerRegEx(pragma)){
					//for contracts that use the "^" sign, e.g. "pragma solidity ^0.7.0"
					isOldVersion = true;
				} else if(opRegEx(pragma)){
					const signMatches = find(pragma, opRegEx());
					if(signMatches.length === 2){
						//for contracts that have 2 limitation signs, e.g. "pragma solidity >0.6.0 <=0.8.0"
						pragma.replace(opRegEx, '');
						const firstHalf = pragma.substring(0, pragma.indexOf(signMatches[1]))
						const secondHalf = pragma.substring(pragma.indexOf(signMatches[1]));
						const pragmaArr = [firstHalf, secondHalf];
						for (let i = 0; i < pragmaArr.length; i++) {
							oldVerRegEx(pragmaArr[i]) ? isOldVersion = true : null;
						}
					} else if(signMatches.length === 1 && oldVerRegEx(pragma)){
						//for contracts with one limitation sign e.g. "pragma solidity ^0.8.11"
						isOldVersion = true;
					} else {
						//for contracts that do not have a limitation sign, but just the solidity version specified e.g. "pragma solidity 0.6.0"
						oldVerRegEx(pragma) ? isOldVersion = true : null;
					}
				}
			}
		}
	)

	return isOldVersion;
}
const opRegEx = (value) =>{
	const operands = new RegExp('[>|<]+=?|\\^', 'g');

	const illegalOperands = new RegExp('=>|=<', 'g');

	if(typeof value !== "undefined"){
		return (operands.test(value) && !illegalOperands.test(value))
	} 
	
	return operands;
}

const oldVerRegEx = (value) =>{
	const oldVersions = new RegExp('(0\.(1\.[0-7])|' + 
								'(2\.[0-2])|' + 
								'(3\.[0-6])|' + 
								'(4\.\b([0-9]|1[0-9]|2[0-6])\b)|' + 
								'(5\.\b([0-9]|1[0-7])\b)|' + 
								'(6\.\b([0-9]|1[0-2])\b)|' + 
								'(7\.[0-6])){1}');
	return oldVersions.test(value);
}

const newVerRegEx = (value) =>{
	const newVersions = new RegExp('(0\.(8\.\b([0-9]|1[0-2])\b)');

	return newVersions.test(value);
}
const checkPragmaValues = (pragma) =>{
	pragma.replace()
}

const find = (str, regex) => {
	return (str.match(regex) || []);
}

module.exports = {
    OutdatedCompilerRule
}