'use strict';
import {
  getComponentFiles,
  getComponentFolder,
  replicate,
} from 'generact';
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    'extension.generact',
    async () => {
      // The code you place here will be executed every time your command is executed
      const absoluteRoot = vscode.workspace.rootPath;
      if (!absoluteRoot) {
        vscode.window.showInformationMessage('You must open a folder first');
        return;
      }

      const options: vscode.QuickPickOptions = {
        matchOnDescription: true,
        placeHolder: 'Which component do you want to replicate?',
      };

      const components: Promise<vscode.QuickPickItem[]> = getComponentFiles(
        absoluteRoot,
        absoluteRoot,
      ).then(files =>
        files.map(f => ({
          label: f.short,
          description: f.value.substring(absoluteRoot.length), // results in relative path
        })),
      );

      vscode.window
        .showQuickPick(components, options)
        .then(async (item: vscode.QuickPickItem) => {
          const name = (await namePrompt(item.label)) || '';
          const folder =
            (await folderPrompt(getComponentFolder(item.description), name)) ||
            getComponentFolder(item.description);

          try {
            await replicate(
              absoluteRoot + item.description,
              { name, folder },
              absoluteRoot,
            );
          } catch (e) {
            vscode.window.showWarningMessage('An Error occured while writing.');
            console.log(e);
          }
        });
    },
  );

  context.subscriptions.push(disposable);
}

function namePrompt(originalName: string) {
  const options: vscode.InputBoxOptions = {
    prompt: 'How do you want to name the component?',
    value: originalName,
  };
  return vscode.window.showInputBox(options);
}

function folderPrompt(originalFolder: string, newName: string) {
  const options: vscode.InputBoxOptions = {
    prompt: `In which folder do you want to put ${newName} component?`,
    value: originalFolder,
  };
  return vscode.window.showInputBox(options);
}

// this method is called when your extension is deactivated
export function deactivate() {
  // nothing to be done
}
