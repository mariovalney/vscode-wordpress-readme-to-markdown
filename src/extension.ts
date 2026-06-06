import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { convertReadmeToMarkdown } from './converter';

export function activate(context: vscode.ExtensionContext): void {
  const convertCommand = vscode.commands.registerCommand(
    'wpReadme.convert',
    async (uri?: vscode.Uri) => {
      const fileUri = uri ?? vscode.window.activeTextEditor?.document.uri;

      if (!fileUri) {
        vscode.window.showErrorMessage('No file selected. Open a readme.txt file and try again.');
        return;
      }

      await convertFile(fileUri);
    }
  );

  const onSaveListener = vscode.workspace.onDidSaveTextDocument(async (document) => {
    const config = vscode.workspace.getConfiguration('wpReadme');
    const fileName = path.basename(document.fileName).toLowerCase();
    const dir = path.dirname(document.fileName);

    if (fileName === 'readme.txt' && config.get<boolean>('convertOnSave')) {
      await convertFile(document.uri);
      return;
    }

    if (fileName === 'readme.md' && config.get<boolean>('warnOnReadmeMdSave')) {
      const readmeTxtPath = path.join(dir, 'readme.txt');
      if (fs.existsSync(readmeTxtPath)) {
        vscode.window.showWarningMessage(
          'This folder has a readme.txt. Changes to README.md may be overwritten by WP Readme to Markdown.',
          'Open readme.txt'
        ).then(action => {
          if (action === 'Open readme.txt') {
            vscode.workspace.openTextDocument(readmeTxtPath).then(doc => vscode.window.showTextDocument(doc));
          }
        });
      }
    }
  });

  context.subscriptions.push(convertCommand, onSaveListener);
}

async function convertFile(uri: vscode.Uri): Promise<void> {
  const filePath = uri.fsPath;

  if (path.basename(filePath).toLowerCase() !== 'readme.txt') {
    vscode.window.showErrorMessage('Only readme.txt files can be converted.');
    return;
  }

  let content: string;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch {
    vscode.window.showErrorMessage(`Could not read file: ${filePath}`);
    return;
  }

  const markdown = convertReadmeToMarkdown(content);

  const outputPath = path.join(path.dirname(filePath), 'README.md');
  try {
    fs.writeFileSync(outputPath, markdown, 'utf-8');
  } catch {
    vscode.window.showErrorMessage(`Could not write README.md to: ${path.dirname(filePath)}`);
    return;
  }

  const openDoc = await vscode.window.showInformationMessage(
    `README.md created successfully.`,
    'Open README.md'
  );

  if (openDoc) {
    const doc = await vscode.workspace.openTextDocument(outputPath);
    await vscode.window.showTextDocument(doc);
  }
}

export function deactivate(): void {}
