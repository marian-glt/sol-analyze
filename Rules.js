const { ExternalCallRule } = require('./Rules/ExternalCallRule');
const { OutdatedCompilerRule } = require('./Rules/OutdatedCompilerRule');
const { IntegerRolloverRule } = require('./Rules/IntegerRolloverRule');
const { VisibilityRule } = require('./Rules/VisibilityRule');

const Rules = (ast) => {
    const ocr = OutdatedCompilerRule(ast);
    ocr ? IntegerRolloverRule(ast) : null;
    const ecr = ExternalCallRule(ast);
    const vr = VisibilityRule(ast);
};

module.exports = {
    Rules
};