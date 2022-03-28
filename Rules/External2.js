const parser = require("@solidity-parser/parser");

function ExternalCallRule(ast){
    parser.visit(ast, {
        FunctionDefinition : function(node){
            //findLonelyCall(node.body);
            findStoredCall2(node.body);

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


function findStoredCall2(block){
    let call = null;
    parser.visit(block, {
        VariableDeclarationStatement : function(vd_node){
            if(vd_node.initialValue.type === 'FunctionCall'){
                parser.visit(vd_node.initialValue, {
                    FunctionCall : function(node){
                        ///CANT CHECK REQUIRE STATEMENT, I THINK THAT ON AN ARRAY VARIABLE IT IS NOT PASSED PROPERLY
                        console.log(vd_node);
                        if(node.expression.type === 'MemberAccess'){
                            call = isMatch(node.expression.memberName);
                        } else if(node.expression.type === 'NameValueExpression'){
                            call = isMatch(node.expression.expression['memberName']);
                        }
                        
                        if(call.includes('send') || call.includes('call')){
                            findRequireCall(block, node);
                        } else if(call.includes('transfer')){
                            //log transfer call
                        }
                    }
                })
            }
        }
    })
}
function findStoredCall(block){
    let results = [];
    parser.visit(block, {
        VariableDeclarationStatement : function(vd_node){
            let variable = isBool(vd_node);
            console.log(variable)
            if(variable != null && vd_node.initialValue.type === 'FunctionCall'){
                console.log(vd_node);
                parser.visit(vd_node.initialValue, {
                    FunctionCall : function(node){
                        const call = isMatch(node.expression.memberName);
                        console.log(call);
                        if(call.includes('send') || call.includes('call')){
                            findRequireCall(block, variable);
                        } else if(isMatch(call).includes('transfer')){
                            //useless transfer
                        }
                    }
                })
            }
        }
    })
}

function findRequireCall(block, boolean){
    let unChecked = true;
    parser.visit(block, {
        ExpressionStatement : function(exp_node){
            if(exp_node.expression.type === 'FunctionCall'){
                const functionCall = exp_node.expression;

                if(functionCall.expression['name'] === 'require'){
                    const argument = functionCall.arguments[0];

                    if(argument['name'] === boolean['name']){
                        unChecked = false;
                    }
                }
            }
        }
    })

    return unChecked;
}

function isBool(vd_node){
    let boolean = null;
    parser.visit(vd_node, {
        VariableDeclaration : function(variable) {
            variable.typeName['name'] === 'bool' ? boolean = variable : null
        }
    })

    return boolean;
}

function isExternalCall(exp_node){
    if(exp_node.expression.type === 'FunctionCall' && exp_node.expression['expression'].type === 'MemberAccess'){
        return true;
    }

    return false;
}

const isMatch = (func) => {
    let regex = new RegExp('(transfer)|(send)|(call)', 'g');
    console.log(func);
    return (func.match(regex) || []);
}
module.exports = {
    ExternalCallRule
}