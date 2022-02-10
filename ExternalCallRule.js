const parser = require("@solidity-parser/parser")

const ExternalCallRule = (ast) => {
    const contracts = extractContracts(ast);
}

//extract contracts in file to avoid passing the whole AST throughout the execution
const extractContracts = (ast) => {
    var contracts = []
    parser.visit(ast, {
        ContractDefinition : function(node){
            contracts.push(node);
        }
    })

    return contracts;
}
