const parser = require("@solidity-parser/parser");
function ExternalCallRule(ast){
    parser.visit(ast, {
        FunctionDefinition : function(node){
            const bestResults = properLowLevelCheck(node.body);
            const goodResults = goodLowLevelCheck(node.body);
            const worstResults = uncheckedLowLevel(node.body);
        }
    })
}

/**
 * @function uncheckedLowLevel — Looks for any instance in the source code where a transaction function may be called on its own.
 * e.g. _to.send(msg.value)
 * @param {import("@solidity-parser/parser/dist/src/ast-types").Block} block 
 * Block contains all statements that can be part of a method in the case of this application.  
 * */
function uncheckedLowLevel(block){
    let functionCall = null;
    const wanted = ['call', 'callcode', 'delegatecall', 'send', 'transfer']
    const worstCaseFindings = []
    parser.visit(block, {
        ExpressionStatement : function(exp_node){
            if(exp_node.expression['type'] === 'FunctionCall' && exp_node.expression['expression'].type === 'MemberAccess'){
                functionCall = exp_node.expression['expression'];
                if(externalCall(wanted, functionCall['memberName'])){
                    const searchResult = {
                        'function' : functionCall['memberName'],
                        'start' : functionCall.loc.start.line,
                        'end' : functionCall.loc.end.line,
                    }
                    console.log("Unchecked External Call '" + searchResult.function + "' found at line " + searchResult.start);
                    worstCaseFindings.push(searchResult);
                }
            }
        }
    })
    return worstCaseFindings;
}
/**
 * @function goodCase Looks for any instance in the source code where a transaction function is called AND checked using require,
 * but the developer doesn't use 'call' as the function for the transaction to be performed, which is the recommended way of doing it.
 * @param {import("@solidity-parser/parser/dist/src/ast-types").Block} functionBody 
 */
function goodLowLevelCheck(functionBody){
    const wanted = ['callcode', 'delegatecall', 'send']
    const goodCaseFindings = []
    parser.visit(functionBody, {
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

                        let result = findRequire(functionBody, functionCall, boolean);
                        result != null ? goodCaseFindings.push(result) : null
                    }
                })
            }
        }
    })
}

function properLowLevelCheck(functionBody){
    const bestCaseFindings = []
    parser.visit(functionBody, {
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
                    NameValueExpression : function(nve_node){
                        if(nve_node.expression['type'] === 'MemberAccess' && nve_node.expression['memberName'] === 'call'){
                                functionCall = nve_node.expression;
                        }
                    }
                })

                let result = findRequire(functionBody, functionCall, boolean);
                result != null ? bestCaseFindings.push(result) : null
            }
        }
    })
}

function findRequire(functionBody, lowLevelCall, boolean){
    let result = null;
    parser.visit(functionBody, {
        ExpressionStatement : function(expNode){
            if(expNode.expression.type === 'FunctionCall'){
                const functionCall = expNode.expression;
                if(functionCall.expression['name'] === 'require'){
                    const argument = functionCall.arguments[0];
                    let searchResult = null;
                    if(argument['name'] === boolean['name']){
                        let functionName = lowLevelCall['memberName'];
                        searchResult = {
                            'function' : functionName,
                            'start' : lowLevelCall.loc.start.line,
                            'end' : lowLevelCall.loc.end.line,
                            'hasRequire' : true,
                        }

                    }

                    result = searchResult;
                }
            }
        }
    })

    return result;
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
