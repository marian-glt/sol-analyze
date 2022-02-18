const { ExternalCallRule } = require('./Rules/ExternalCallRule');
const { OutdatedCompilerRule } = require('./Rules/OutdatedCompilerRule');
const { IntegerRolloverRule } = require('./Rules/IntegerRolloverRule');
const { VisibilityRule } = require('./Rules/VisibilityRule');

const Rules = (ast) => {
    const ocr = OutdatedCompilerRule(ast);
    ocr ? IntegerRolloverRule(ast) : null;
    ExternalCallRule(ast);
    VisibilityRule(ast);
};

module.exports = {
    Rules
};