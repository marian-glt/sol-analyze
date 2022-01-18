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

const count = (str, regex) => {
	return (str.match(regex) || []).length;
}

function handleAST(ast){
	let operandRegex = new RegExp('[>|<]+=?|\^');
	let versionRegex = new RegExp('[0\.[4-7]\.1?[0-9]]')
	parser.visit(ast, 
		{
			PragmaDirective: function(node){
				console.log(count(node.value, operandRegex));
			}

		}
	)
}
module.exports = {
	parse
}