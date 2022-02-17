const { ExternalCallRule } = require('./ExternalCallRule');
const { OutdatedCompilerRule } = require('./OutdatedCompilerRule');
const { IntegerRolloverRule } = require('./IntegerRolloverRule');
const { VisibilityRule } = require('./VisibilityRule');

const Rules = (ast) => {
    const ocr = OutdatedCompilerRule(ast);
    ocr ? IntegerRolloverRule(ast) : null;
    const ecr = ExternalCallRule(ast);
    const vr = VisibilityRule(ast);
};

module.exports = {
    Rules
};