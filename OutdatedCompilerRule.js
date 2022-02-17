const parser = require("@solidity-parser/parser");

const OutdatedCompilerRule = (ast) => {
	let importCase;
	parser.visit(ast, 
		{
			PragmaDirective: function(node){
				const pragma = node.value;
				const isUsingOperators = find(pragma, operators);
				if(isUsingOperators[0] === '^'){
					importCase = checkCompilerVersion(pragma);
				} else if(operators(pragma)){
					importCase = checkForTwo(pragma);
				}
			}
		}
	)

	return importCase;
}

const checkCompilerVersion = (version) =>{
	if(isNewVersion(version)){
		return'>=0.8.0'
	} else if(isOldVersion(version)){
		return '<0.8.0'
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

const isOldVersion = (version) =>{
	const oldVersions = '(0\.)+((1\.[0-7])|' + 
							   '(2\.[0-2])|' + 
							   '(3\.[0-6])|' + 
							   '(4\.\b([0-9]|1[0-9]|2[0-6])\b)|' + 
							   '(5\.\b([0-9]|1[0-7])\b)|' + 
							   '(6\.\b([0-9]|1[0-2])\b)| '+ 
							   '(7\.[0-6])){1}'
	const regex = new RegExp(oldVersions);

	return regex.test(version);
}

const isNewVersion = (version) =>{
	const newVersions = new RegExp('(0\.(8\.\b([0-9]|1[0-2])\b)');

	return newVersions.test(version);
}

const checkForTwo = (pragma) =>{
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
		}
	}
}

const find = (str, regex) => {
	return (str.match(regex) || []);
}

const reportFindings = (results) =>{
	if(results === undefined){
		console.log("I could not find the compiler version declaration, chances are it doesn't exist.");
	} else if(typeof results !== 'string'){
		//analyse returns
	}
}

module.exports = {
    OutdatedCompilerRule
}