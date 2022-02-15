const parser = require("@solidity-parser/parser")

const ExternalCallRule = (ast) => {
    findCall(ast);
}

function findCall(ast) {
    parser.visit(ast, {
        FunctionDefinition : function(node){
            console.log(node);
        }
    })
}
/**
 * @function findLonelyCall — Looks for any instance in the source code where a transaction function may be called on its own.
 * e.g. _to.transfer(msg.value)
 * @param {import("@solidity-parser/parser/dist/src/ast-types").Block} block 
 * Block contains all statements that can be part of a method in the case of this application.  
 * */
function findLonelyCall(block){
    let functionCall;
    let searchResult;
    let lonelyCallFindings = []
    parser.visit(block, {
        ExpressionStatement : function(exp_node){
            if(exp_node.expression['type'] === 'FunctionCall' && exp_node.expression['expression'].type === 'MemberAccess'){
                functionCall = exp_node.expression['expression'];
                if(externalCall(functionCall.memberName)){
                    searchResult = {
                        'functionCalled' : functionCall.memberName,
                        'start' : functionCall.loc.start,
                        'end' : functionCall.loc.end
                    }
                    lonelyCallFindings.push(searchResult);
                }
            }
        }
    })
    console.log(lonelyCallFindings.length);
    return lonelyCallFindings;
}

const externalCall = (memberName) =>{
    const possibleCalls = ['call', 'callcode', 'delegatecall', 'send', 'transfer'];
    let matches = false;
    for (const call in possibleCalls) {
        memberName === call ? matches = true : null;
    }

    return matches;
}
module.exports = {
    ExternalCallRule
}
