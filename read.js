const reader = require("fs");
const parser = require("@solidity-parser/parser");
const { Rules } = require('./Rules');

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

function handleAST(ast){
	Rules(ast);
}

module.exports = {
	parse,
}