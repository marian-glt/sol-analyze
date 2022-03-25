const parser = require("@solidity-parser/parser");

function OutdatedCompilerRule(ast){
    let searchResult = null;
    parser.visit(ast, 
        {
            PragmaDirective: function(node){
                const compilerValue = node.value;
                if(isValidOperands){
                    const operandsUsed = find(compilerValue, operands);
                    if(operandsUsed.length == 2 && !operandsUsed.includes('^')){
                        const versionsString = compilerValue.replace(operands, '');
                        const versionArray = versionsString.split(' ', 2);
                        const comparisonArray =[]
                        versionArray.forEach(version => {
                            comparisonArray.push(checkVersion(version));
                        })
                        searchResult = comparisonArray;
                    } else if(operandsUsed.length <= 1){
                        searchResult = checkVersion(compilerValue);
                    }
                }
            }
        }
    )

    return reportFindings(searchResult);
}
function checkVersion(ver){
    if(isNewVersion(ver)){
        return '>=0.8.0';
    } else if(isOldVersion(ver)){
        return '<0.8.0';
    } else {
        return 'invalid';
    }
}
function isOldVersion(version){
	//const oldVersions = '(0\.)+((4\.\b([0-9]|1[0-9]|2[0-6])\b)|(5\.\b([0-9]|1[0-7])\b)|(6\.\b([0-9]|1[0-2])\b)|(7\.[0-6])){1}'
    const oldVersions = '(0\.+((4\.([0-9]|1[0-9]|2[0-6]))|(5\.([0-9]|1[0-7]))|(6\.([0-9]|1[0-2]))|(7\.[0-6])))'
	const regex = new RegExp(oldVersions, 'g');
	return regex.test(version);
}

function isNewVersion(version){
	const newVersions = new RegExp('(0\.)+(8\.([0-9]|1[0-2]))');
	return newVersions.test(version);
}
const isValidOperands = (op) =>{
    return (operands.test(op) && !invalidOperands.test(op));
}
const find = (str, regex) => {
	return (str.match(regex) || []);
}
const operands = new RegExp('[>|<]+=?|\\^', 'g');
const invalidOperands = new RegExp('=>|=<', 'g');

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
        if(results.includes('invalid')){
            message = "Error! I think you're using an invalid compiler version, consider changing to something like 0.x.0, or lookup what the latest version of Solidity is."
			isUsingOldCompiler = null;
        } else {
            if(results.includes('>=0.8.0')){
                isUsingOldCompiler = false;
            }

            if(results.includes('<0.8.0')){
                message = "Warning! The contract can compile on an older version of Solidity.";
                isUsingOldCompiler = true;
            }
        }
	} else{
		message = "Uh oh! It seems like you haven't specified what compiler version should the contract work on.";
	}

	message !== null ? console.log(message) : null;

	return isUsingOldCompiler;
}
module.exports = {
    OutdatedCompilerRule
}