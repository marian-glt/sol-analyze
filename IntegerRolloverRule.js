const { OutdatedCompiler } = require("./OutdatedCompilerRule");
const parser = require("@solidity-parser/parser");
const IntegerRollover = (ast) => {
    const oc = OutdatedCompiler(ast);
    oc ? ImportCheck(ast) : null;
}

const ImportCheck = (ast) =>{
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

const GetFunctions = (ast) =>{
    let functions = []
    parser.visit(ast, {
        FunctionDefinition : function(node){
            functions.push(node);
        }
    })

    return functions;
}

const FindOperation = (ast, functions) =>{
    let hasOperation = false;
    for (const func in functions) {
        parser.visit(func, {
            ExpressionStatement : function(exp_node){
                
            }
        })
    }
}