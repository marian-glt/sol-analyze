const vscode = require("vscode");

const SolDiag = (range, message, severity) =>{
    return new vscode.Diagnostic(range, message, severity);
}

module.exports = {
    SolDiag
}