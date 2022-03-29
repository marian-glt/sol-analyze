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
                            console.log(vd_node.variables[0]['name']);
                            findRequireCall(block, vd_node);
                        } else if(call.includes('transfer')){
                            //log transfer call
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