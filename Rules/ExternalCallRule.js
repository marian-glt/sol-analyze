const parser = require("@solidity-parser/parser");

function ExternalCallRule(ast){
    parser.visit(ast, {
        FunctionDefinition : function(node){
            findLonelyCall(node.body);
            findStoredCall(node.body);

        }
    })
}

function findLonelyCall(block){
    let results = []
    parser.visit(block, {
        ExpressionStatement : function(exp_node){
            if(isExternalCall(exp_node)){
                let calledFunction = exp_node.expression['expression']['memberName'];
                if(isMatch(calledFunction).length === 1){
                    results.push(exp_node);
                }
            }
        }
    })
    results.forEach(call => {
        let calledFunction = call.expression['expression']['memberName'];
        
        if(calledFunction.startsWith('transfer')){
            console.log("transfer() call found at line " + call.loc.start.line + ", consider using call() and checking its return value using require().")
        } else {
            console.log("Unchecked External Call " + call + "() found at line " + call.loc.start.line + " consider checking the return value using require().");
        }
    });
    return results;
}


function findStoredCall(block){
    let call = null;
    parser.visit(block, {
        VariableDeclarationStatement : function(vd_node){
            if(vd_node.initialValue.type === 'FunctionCall'){
                parser.visit(vd_node.initialValue, {
                    FunctionCall : function(node){

                        if(node.expression.type === 'MemberAccess'){
                            call = isMatch(node.expression.memberName);
                        } else if(node.expression.type === 'NameValueExpression'){
                            call = isMatch(node.expression.expression['memberName']);
                        }
                        
                        if(call.includes('send') || call.includes('call')){
                            console.log(call)
                            const require_call = findRequireCall(block, vd_node)
                            if(!require_call){
                                console.log("Unchecked External Call " + call + " at line " + node.loc.start.line);
                            }
                        } else if(call.includes('transfer')){
                            console.log("transfer() Call " + call + " at line " + node.loc.start.line + " consider using call() and check it's return value.");
                        }
                    }
                })
            }
        }
    })
}

function findRequireCall(block, boolean_var){
    let unChecked = true;
    parser.visit(block, {
        ExpressionStatement : function(exp_node){
            if(exp_node.expression.type === 'FunctionCall'){
                const functionCall = exp_node.expression;

                if(functionCall.expression['name'] === 'require'){
                    const parameter_var = functionCall.arguments[0].name;
                    const boolean_var_name = boolean_var.variables[0].name;
                    if(parameter_var === boolean_var_name){
                        unChecked = false;
                    } else {
                        unChecked = true;
                    }
                }
            }
        }
    })

    return unChecked;
}

function isExternalCall(exp_node){
    if(exp_node.expression.type === 'FunctionCall' && exp_node.expression['expression'].type === 'MemberAccess'){
        return true;
    }

    return false;
}

const isMatch = (func) => {
    let regex = new RegExp('(transfer)|(send)|(call)', 'g');
    return (func.match(regex) || []);
}
module.exports = {
    ExternalCallRule
}