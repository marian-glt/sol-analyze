const parser = require("@solidity-parser/parser")

const ExternalCallRule = (ast) => {
    findCall(ast);
}

function findCall(ast) {
    parser.visit(ast, {
        FunctionDefinition : function(node){
            findLonelyCall(node.body);
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
    const lonelyCallFindings = []
    parser.visit(block, {
        ExpressionStatement : function(exp_node){
            if(exp_node.expression['type'] === 'FunctionCall' && exp_node.expression['expression'].type === 'MemberAccess'){
                functionCall = exp_node.expression['expression'];
                if(externalCall(functionCall.memberName)){
                    const searchResult = {
                        'function' : functionCall.memberName,
                        'start' : functionCall.loc.start,
                        'end' : functionCall.loc.end,
                    }
                    lonelyCallFindings.push(searchResult);
                }
            }
        }
    })
    return lonelyCallFindings;
}
/**
 * Check if the function call passed is any of the possible functions that need an external check.
 * @param {String} memberName - The function called in the analyzed statement
 * @returns True - If the function called is one of Ethereum's transfer functions.
 */
function externalCall(memberName){
    const possibleCalls = ['call', 'callcode', 'delegatecall', 'send', 'transfer'];
    let matches = false;
    possibleCalls.forEach(element => {
        memberName === element ? matches = true : null;
    });
    return matches;
}
module.exports = {
    ExternalCallRule
}
