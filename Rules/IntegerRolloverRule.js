const parser = require("@solidity-parser/parser");

function IntegerRolloverRule(ast){
    findOperation(ast);
}

function findOperation(ast){
    const functions = GetFunctions(ast);

    let has_unsafe_var = false;
    functions.forEach(func =>{
        parser.visit(func, {
            ExpressionStatement: function(exp_node){
                const exp_type = exp_node.expression.type;

                if(exp_type === 'UnaryOperation' || exp_type === 'BinaryOperation'){
                    let var_used;
                    if(!hasSafeMath(ast)) {
                        if(exp_type === 'UnaryOperation'){
                            var_used = exp_node.expression.subExpression;
                        } else {
                            var_used = exp_node.expression.left;
                        }

                        has_unsafe_var = findVariableDeclaration(ast, var_used);

                        if(!has_unsafe_var){
                            console.log("Integer Variable at risk of rollover, found at line: " + var_used.loc.start.line + ", consider importing and declaring the variable with SafeMath.");
                        }
                    }

                    
                }
            }
        })
    })
    return has_unsafe_var;
}

function findVariableDeclaration(ast, var_used){
    let is_using_SafeMath = false;

    parser.visit(ast, {
        StateVariableDeclaration : function(node){
            if(node.variables.length === 1){
                const var_to_check = node.variables[0];

                if(var_to_check.identifier.name === var_used.name){
                    const discoved_before = protected_types.includes(var_to_check.typeName['name']);
                    if(!discoved_before){
                        is_using_SafeMath = findUsingDeclaration(ast, var_to_check.typeName['name']);
                    } else {
                        is_using_SafeMath = true;
                    }
                }
            }
        }
    })

    return is_using_SafeMath;
}

function findUsingDeclaration(ast, var_type){
    let is_protected = false;
    parser.visit(ast, {
        UsingForDeclaration : function(node){
            if(node.libraryName === 'SafeMath' && node.typeName['name'] === var_type){
                is_protected = true;
                protected_types.push(var_type);
            }
        }
    })

    return is_protected;
}

function GetFunctions(ast){
    const functions = []

    parser.visit(ast, {
        FunctionDefinition: function(node){
            functions.push(node);
        }}
    )

    return functions;
}

function hasSafeMath(ast){
    let has_import = false;

    parser.visit(ast, {
        ImportDirective : function(node) {
            const fullPath = 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/math/SafeMath.sol'
            const shortPath = '@openzeppelin/contracts/math/SafeMath.sol'

            node.path.startsWith(fullPath) || node.path.startsWith(shortPath) ? has_import = true : null;
        }
    })

    return has_import;
}

const protected_types = [];

module.exports = {
    IntegerRolloverRule
}