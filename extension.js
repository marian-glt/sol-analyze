// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

const { parse } = require("./read")
const vscode = require("vscode");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('sol-analyze.exec', function () {
		// The code you place here will be executed every time your command is executed
		if(vscode.workspace.workspaceFolders !== undefined){
			let file = vscode.window.activeTextEditor.document.uri;
			vscode.window.createOutputChannel("Hello world");
			let ext = file.fsPath.split('.').pop();
			ext === 'sol' ? send_to_read(file): messenger('Sol-Analyzer: Cannot execute on a non-Solidity file, please try again.');
		} else {
			messenger("Sol-Analyzer: Working folder not found, open a folder then try again.");
		}
	});

	context.subscriptions.push(disposable);
}

function messenger(text){
	vscode.window.showInformationMessage(text);
}

function send_to_read(file){
	messenger(`Sol-Analyzer executing on: ${file.path}`);
	parse(file.fsPath);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
