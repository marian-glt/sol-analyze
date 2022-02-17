const parser = require("@solidity-parser/parser");

const VisibilityRule = (ast) =>{
    parser.visit(ast, {
        FunctionDefinition : function(node){
            if(!node.isFallback && !node.isConstructor){
                if(node.visibility === 'default'){
                    console.log("You may have a function with default visibility at line: " + node.loc.start.line);
                }
            }
        }
    })
}
module.exports = {
    VisibilityRule
}