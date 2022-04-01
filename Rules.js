const { ExternalCallRule } = require('./Rules/ExternalCallRule');
const { OutdatedCompilerRule } = require('./Rules/OutdatedCompilerRule');
const { IntegerRolloverRule } = require('./Rules/IntegerRolloverRule');
const { VisibilityRule } = require('./Rules/VisibilityRule');

const Rules = (ast) => {
    OutdatedCompilerRule(ast);
    IntegerRolloverRule(ast);
    VisibilityRule(ast);
    ExternalCallRule(ast);
};

module.exports = {
    Rules
};