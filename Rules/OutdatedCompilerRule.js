const parser = require("@solidity-parser/parser");

function OutdatedCompilerRule(ast){
	let importCase = null;
	parser.visit(ast, 
		{
			PragmaDirective: function(node){
				const pragma = node.value;
				const isUsingOperators = find(pragma, operators(undefined));
				if(isUsingOperators.includes('^')){
					importCase = checkCompilerVersion(pragma);
				} else{
					importCase = checkForOtherOperators(pragma);
				}
			}
		}
	)

	return reportFindings(importCase);
}

function checkCompilerVersion(version){
	console.log(version);
	if(isNewVersion(version)){
		return '>=0.8.0';
	} else if(isOldVersion(version)){
		return '<0.8.0';
	} else {
		return 'invalid';
	}
}

const operators = (operator) =>{
	const operands = new RegExp('[>|<]+=?|\\^', 'g');
	const illegalOperands = new RegExp('=>|=<', 'g');

	if(typeof operator !== "undefined"){
		return (operands.test(operator) && !illegalOperands.test(operator));
	} 
	
	return operands;
}

function isOldVersion(version){
	const oldVersions = '(0\.)+((1\.[0-7])|(2\.[0-2])|(3\.[0-6])|(4\.\b([0-9]|1[0-9]|2[0-6])\b)|(5\.\b([0-9]|1[0-7])\b)|(6\.\b([0-9]|1[0-2])\b)|(7\.[0-6])){1}'
	const regex = new RegExp(oldVersions);
	return regex.test(version);
}

const isNewVersion = (version) =>{
	const newVersions = new RegExp('(0\.)+(8\.\b([0-9]|1[0-2])\b)');
	return newVersions.test(version);
}

const checkForOtherOperators = (pragma) =>{
	const hasOperators = operators(pragma);
	if(hasOperators){
		const usedOperators = find(pragma, operators(undefined));
		/** In case the developer specifies a range of compiler versions for which the contract can execute.
		 * For example, pragma solidity >0.6.0 <=0.8.11 */
		if(usedOperators.length === 2){
			pragma = pragma.replace(operators(undefined), '');
			const usedVersions = pragma.split(' ', 2);
			const versionsStatus = []
			usedVersions.forEach(version => {
				versionsStatus.push(checkCompilerVersion(version));
			});

			return versionsStatus;

		/** In case the developer uses only 1 or no operator to specify what compiler versions can be used with this contract.
		 * For example:
		 * pragma solidity >0.5.5
		 * or
		 * pragma solidity 0.8.0
		 */
		} else if(usedOperators.length <= 1){
			return checkCompilerVersion(pragma);
		}
	}
}

const find = (str, regex) => {
	return (str.match(regex) || []);
}
/**
 * This function will report back a message based on what compiler version the user allows their contracts to compile with.
 * @param {Array | string} results 
 */
const reportFindings = (results) =>{
	let message = null;
	let isUsingOldCompiler = null;
	if(typeof results === 'string'){
		if(results === '>=0.8.0'){
			message = "Good! The contract is using a newer version of the compiler.";
			isUsingOldCompiler = false;
		} else if(results === '<0.8.0'){
			message = "Warning! The contract can compile on an older version of Solidity.";
			isUsingOldCompiler = true;
		} else{
			message = "Error! I think you're using an invalid compiler version, consider changing to something like 0.x.0, or lookup what the latest version of Solidity is."
			isUsingOldCompiler = null;
		}
		
	} else if(results.constructor === Array){
		if(results.includes('>=0.8.0')){
			isUsingOldCompiler = false;
		} else if(results.includes('<0.8.0')){
			message = "Warning! The contract can compile on an older version of Solidity.";
			isUsingOldCompiler = true;
		} else {
			message = "Error! I think you're using an invalid compiler version, consider changing to something like 0.x.0, or lookup what the latest version of Solidity is."
			isUsingOldCompiler = null;
		}

	} else{
		message = "Uh oh! It seems like you haven't specified what compiler version should the contract work on.";
	}

	console.log(message)

	return isUsingOldCompiler;
}

module.exports = {
    OutdatedCompilerRule
}