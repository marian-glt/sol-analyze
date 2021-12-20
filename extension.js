// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const reader = require('fs');
const parser = require('@solidity-parser/parser');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "sol-analyze" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('sol-analyze.exec', function () {
		// The code you place here will be executed every time your command is executed
		let message = '';
		if(vscode.workspace.workspaceFolders !== undefined){
			let file = vscode.window.activeTextEditor.document.uri.fsPath;
			let ext = file.split('.').pop();
			ext === 'sol' ? parse(file): messenger('Sol-Analyzer: Cannot execute on a non-Solidity file, please try again.');
		} else {
			messenger("Sol-Analyzer: Working folder not found, open a folder then try again.");
		}
		// Display a message box to the user
		vscode.window.showInformationMessage(message);
	});

	context.subscriptions.push(disposable);
}

function messenger(text){
	vscode.window.showInformationMessage(text);
}

function parse(filePath){
	messenger(`Sol-Analyzer executing on: ${filePath}`);

	reader.readFile(filePath, 'utf-8', function(err, code){
		try {
			const ast = parser.parse(code);
			console.log(ast);
		} catch (e) {
			if (e instanceof parser.ParserError) {
				console.error(e.errors)
			}
		}
	});
}
// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
