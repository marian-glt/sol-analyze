const parser = require("@solidity-parser/parser");

const VisiblityRule = (ast) =>{
    parser.visit(ast, {
        FunctionDefinition : function(node){
            if(!node.isFallback && !node.isConstructor){
                if(node.visibility === 'default'){
                    console.log("You may have a function that does not have a set visibility at lines: %s", node.loc);
                }
            }
        }
    })
}
module.exports = {
    VisiblityRule
}