const reader = require("fs");
const parser = require("@solidity-parser/parser");
const { sign } = require("crypto");

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

const find = (str, regex) => {
	return (str.match(regex) || []);
}

function handleAST(ast){
	checkPragma(ast);
}

function checkPragma(ast){
	const opReg = new RegExp('[>|<]+=?|\\^', 'g');
	const verReg = new RegExp('(0\.(1\.[0-7])|(2\.[0-2])|(3\.[0-6])|(4\.[1-2]?[0-9])|(5\.1?[0-9])|(6\.1?[0-9])|(7\.[0-6])){1}');
	parser.visit(ast, 
		{
			PragmaDirective: function(node){
				let pragma = node.value;
				let matches = find(node.value, opReg);
				
				if(matches.includes('^') && verReg.test(pragma)){
					//warning message
					console.log("Compiling with an old version of Solidity, please change to a newer version.");
				} else if(opReg.test(pragma)){
					let signMatches = find(pragma, opReg);
					if(signMatches.length === 2){
						pragma.replace(opReg, '');
						let oldVersion = false;
						let firstHalf = pragma.substring(0, pragma.indexOf(signMatches[1]))
						let secondHalf = pragma.substring(pragma.indexOf(signMatches[1]));
						let pragmaArr = [firstHalf, secondHalf]
						for (let i = 0; i < pragmaArr.length; i++) {
							verReg.test(pragmaArr[i]) ? oldVersion = true : console.log("no matches")
							
						}
						oldVersion ? console.log("Contract can run on older Solidity, consider changing to a newer version") : null;
					} else if(signMatches.length === 1 && verReg.test(pragma)){
						console.log("Compiling with an old version of Solidity, please change to a newer version.")
					}
				}

			}

		}
	)
}

function checkSafeMathUsage(ast){
	parser.visit(ast, 
		{
			ImportDirective : function(node){
				if(!(node.path.includes("@openzeppelin/contracts/math/SafeMath.sol"))){
					
				}
			}
	})
}

function checkRequire(ast){
	console.log(ast);
}

function checkSendUsage(ast){
	parser.visit(ast, {
		FunctionDefinition: function(parent){
			console.log("Visiting function");
			parser.visit(parent, 
				{ExpressionStatement: function(child){
					console.log("Visiting Statement");
					console.log(child);
					if(child.expression.type === 'FunctionCall'){
						console.log("Found a Function Call");
						
					}
				}
			}
			)
		}
	})
}

function checkMethodVisibility(ast){
	parser.visit(ast, 
		{
			FunctionDefinition: function(node){
				if(node.visibility === 'default'){
						
				}
			}
		}
	)
}


module.exports = {
	parse
}