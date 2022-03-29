const parser = require("@solidity-parser/parser");

function VisibilityRule(ast){
    parser.visit(ast, {
        FunctionDefinition : function(node){
            if(!node.isFallback && !node.isConstructor){
                if(node.visibility === 'default'){
                    console.log("Your function " + node.name + " has default visibility at line: " + node.loc.start.line);
                }
            }

        }
    })
}
module.exports = {
    VisibilityRule
}