const { ExternalCallRule } = require('./ExternalCallRule');
const { OutdatedCompilerRule } = require('./OutdatedCompilerRule');
const { IntegerRolloverRule } = require('./IntegerRolloverRule');
const { VisibilityRule } = require('./VisibilityRule');

const Rules = (ast) => {
    const ecr = ExternalCallRule(ast);
    const ocr = OutdatedCompilerRule(ast);
    const irr = IntegerRolloverRule(ast);
    const vr = VisibilityRule(ast);
};

module.exports = {
    Rules
};