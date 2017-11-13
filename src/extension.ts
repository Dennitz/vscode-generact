'use strict';
import { getComponentFiles, getComponentFolder, replicate } from 'generact';
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
      projectPrompt().then((projectItem: vscode.QuickPickItem | undefined) => {
        console.log('projectItem', projectItem);
        if (projectItem) {
          const root = projectItem.description;
          componentPrompt(
            root,
          ).then(async (componentItem: vscode.QuickPickItem | undefined) => {
            if (componentItem) {
              const name = (await namePrompt(componentItem.label)) || '';
              const folder =
                (await folderPrompt(
                  getComponentFolder(componentItem.description),
                  name,
                )) || getComponentFolder(componentItem.description);

              try {
                await replicate(
                  root + componentItem.description,
                  { name, folder },
                  root,
                );
              } catch (e) {
                vscode.window.showWarningMessage(
                  'An Error occured while writing.',
                );
                console.log(e);
              }
            }
          });
        }
      });
    },
  );

  context.subscriptions.push(disposable);
}

function projectPrompt() {
  const options: vscode.QuickPickOptions = {
    placeHolder: 'Choose a project.',
  };

  let projects: vscode.QuickPickItem[] = [];
  if (vscode.workspace.workspaceFolders) {
    projects = vscode.workspace.workspaceFolders.map(f => ({
      label: f.name,
      description: f.uri.fsPath,
    }));
  }

  return vscode.window.showQuickPick(projects, options);
}

function componentPrompt(projectRoot: string) {
  const options: vscode.QuickPickOptions = {
    matchOnDescription: true,
    placeHolder: 'Which component do you want to replicate?',
  };

  const components: Promise<vscode.QuickPickItem[]> = getComponentFiles(
    projectRoot,
    '/',
  ).then(files =>
    files.map(f => ({
      label: f.short,
      description: f.value.substring(projectRoot.length), // results in relative path
    })),
  );

  return vscode.window.showQuickPick(components, options);
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
