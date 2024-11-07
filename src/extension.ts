import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { analyzeFile } from './algoritmos/resolve-dependecies';

interface MethodDetail {
  fullPath: string;
  isTerminal: boolean;
  type?: string;
}

interface AnalysisResult {
  dependencies: Record<string, string>;
  methodsUsed: Record<string, MethodDetail[]>;
  imports: string[];
  className: string;
}

export async function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('extension.generateTest', async () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const filePath = editor.document.uri.fsPath;
      const fileName = path.basename(filePath, '.ts');
      const testFilePath = filePath.replace(/\.ts$/, '.spec.ts');

      const analysisResult: AnalysisResult = await analyzeFile(filePath);
      const testTemplate = generateTestTemplate(analysisResult, fileName);

      console.log("Test Template Generated:\n", testTemplate);

      fs.writeFileSync(testFilePath, testTemplate);

      if (!fs.existsSync(testFilePath)) {
        vscode.window.showInformationMessage(`✨ The prophecy is fulfilled! A new test file has been crafted: ${testFilePath}`);

      } else {
        vscode.window.showWarningMessage(`🔄 The prophecy endures: Existing test file renewed at ${testFilePath}`);

      }
    }
  });
  context.subscriptions.push(disposable);
}

function objectToString(obj: any): string {
  return `{ ${Object.entries(obj)
    .map(([key, value]) => {
      if (typeof value === 'object') {
        return `${key}: ${objectToString(value)}`;
      }
      return `${key}: ${value}`;
    })
    .join(', ')} }`;
}

function createNestedMock(methodPath: string, isObservable: boolean): any {
  const levels = methodPath.split('.');
  let mock = {};
  let current = mock as any;

  for (let i = 0; i < levels.length; i++) {
    const level = levels[i];
    if (i === levels.length - 1) {
      current[level] = isObservable ? '() => of()' : '() => {}';
    } else {
      current[level] = {};
      current = current[level];
    }
  }
  return mock;
}

function generateTestTemplate(analysisResult: AnalysisResult, fileName: string): string {
  const { className, dependencies, methodsUsed, imports } = analysisResult;

  const dependencyMocks = Object.entries(dependencies)
    .map(([alias, dep]) => `let ${alias}: ${dep};`)
    .join('\n\t');

  const dependencyAssignments = Object.entries(dependencies)
    .map(([alias, dep]) => {
      const methods = methodsUsed[dep] || [];
      const requiresComplexMock = methods.some(method => method.fullPath.includes('.'));

      if (requiresComplexMock) {
        const mockProperties = methods.map(method => {
          const methodMock = createNestedMock(method.fullPath, method.type === 'Observable');
          return `${objectToString(methodMock)}`;
        }).join(', ');

        return `{ provide: ${dep}, useValue: ${mockProperties} }`;
      } else {
        const methodsList = methods.map((method) => `'${method.fullPath}'`).join(', ');
        return `{ provide: ${dep}, useValue: jasmine.createSpyObj('${alias}', [${methodsList}]) }`;
      }
    })
    .filter(Boolean)
    .join(',\n\t\t\t\t');

  const importStatements = imports
    .map((imp: string) => `import { ${imp.split(' from ')[0]} } from ${imp.split(' from ')[1]};`)
    .join('\n');

  return `${importStatements}
import { TestBed } from '@angular/core/testing';
import { ${className} } from './${fileName}';

describe('${className} Tests', () => {
  ${dependencyMocks}
  let component: ${className};

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ${className},
        ${dependencyAssignments}
      ]
    });

    ${Object.keys(dependencies)
      .map(alias => `${alias} = TestBed.inject(${dependencies[alias]});`)
      .join('\n\t\t')}

    component = TestBed.inject(${className});
  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });
});
`;
}
