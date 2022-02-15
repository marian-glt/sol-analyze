const parser = require("@solidity-parser/parser")

const OutdatedCompilerRule = (ast) => {
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

const find = (str, regex) => {
	return (str.match(regex) || []);
}

module.exports = {
    OutdatedCompilerRule
}