const reader = require("fs");
const parser = require("@solidity-parser/parser");
const read = (filePath) => {
	
	return reader.readFile(filePath, 'utf-8', function(err, code){
		try {
			const ast = parser.parse(code, {loc: true});
			return ast;
		} catch (e) {
			if (e instanceof parser.ParserError) {
				console.error(e.errors);
			}
		}
	});
}

const parse = (file) =>{
	read(file);
}
module.exports = {
	read,
	parse
}