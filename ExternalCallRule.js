const parser = require("@solidity-parser/parser")

const ExternalCallRule = (ast) => {
    findCall(ast);
}

function findCall(ast) {
    parser.visit(ast, {
        FunctionDefinition : function(node){
            goodCase(node.body);
        }
    })
}
/**
 * @function worstCase — Looks for any instance in the source code where a transaction function may be called on its own.
 * e.g. _to.transfer(msg.value)
 * @param {import("@solidity-parser/parser/dist/src/ast-types").Block} block 
 * Block contains all statements that can be part of a method in the case of this application.  
 * */
function worstCase(block){
    let functionCall = null;
    const wanted = ['call', 'callcode', 'delegatecall', 'send', 'transfer']
    const worstCaseFindings = []
    parser.visit(block, {
        ExpressionStatement : function(exp_node){
            if(exp_node.expression['type'] === 'FunctionCall' && exp_node.expression['expression'].type === 'MemberAccess'){
                functionCall = exp_node.expression['expression'];
                if(externalCall(wanted, functionCall.memberName)){
                    const searchResult = {
                        'function' : functionCall.memberName,
                        'start' : functionCall.loc.start,
                        'end' : functionCall.loc.end,
                    }
                    worstCaseFindings.push(searchResult);
                }
            }
        }
    })
    return worstCaseFindings;
}

function goodCase(block){
    const wanted = ['callcode', 'delegatecall', 'send', 'transfer']
    const goodCaseFindings = []
    parser.visit(block, {
        VariableDeclarationStatement : function(vd_node){
            let boolean = null;
            parser.visit(vd_node, {
                VariableDeclaration : function(variable){
                    if(variable.typeName['name'] === 'bool'){
                        boolean = variable;
                    }
                }
            })

            if(boolean != null && vd_node.initialValue.type === 'FunctionCall'){
                let functionCall = null;
                parser.visit(vd_node.initialValue, {
                    FunctionCall : function(node){
                        const call = node.expression
                        externalCall(wanted, call['memberName']) ? functionCall = call : null
                    }
                })

                if(functionCall != null){
                    parser.visit(block, {
                        ExpressionStatement : function(exp_node){
                            if(exp_node.expression.type === 'FunctionCall'){
                                const exp_sub_node = exp_node.expression;
                                if(exp_sub_node.expression['name'] === 'require'){
                                    const argument = exp_node.expression['arguments']
                                    if(argument[0]['name'] == boolean['name']){
                                        console.log("This is ok, but using call instead of %s is better", functionCall['memberName']);
                                        //underline the function call line
                                    } else {
                                        const searchResult = {
                                            'function' : functionCall['memberName'],
                                            'start' : functionCall.loc.start,
                                            'end' : functionCall.loc.end,
                                        };

                                        goodCaseFindings.push(searchResult);
                                    }
                                }
                            }
                        }
                    })
                }
            }
        }
    })
}

function bestCase(block){

}
/**
 * Check if the function call passed is any of the possible functions that need an external check.
 * @param {Array} possibleCalls - Array of function calls to look out for
 * @param {String} memberName - The function called in the analyzed statement
 * @returns True - If the function called is one of Ethereum's transfer functions.
 */
function externalCall(possibleCalls, memberName){
    let matches = false;
    possibleCalls.forEach(element => {
        memberName === element ? matches = true : null;
    });
    return matches;
}
module.exports = {
    ExternalCallRule
}
