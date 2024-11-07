"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const resolve_dependecies_1 = require("./algoritmos/resolve-dependecies");
async function activate(context) {
    const disposable = vscode.commands.registerCommand('extension.generateTest', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const filePath = editor.document.uri.fsPath;
            const fileName = path.basename(filePath, '.ts');
            const testFilePath = filePath.replace(/\.ts$/, '.spec.ts');
            const analysisResult = await (0, resolve_dependecies_1.analyzeFile)(filePath);
            const testTemplate = generateTestTemplate(analysisResult, fileName);
            console.log("Test Template Generated:\n", testTemplate);
            fs.writeFileSync(testFilePath, testTemplate);
            if (!fs.existsSync(testFilePath)) {
                vscode.window.showInformationMessage(`✨ The prophecy is fulfilled! A new test file has been crafted: ${testFilePath}`);
            }
            else {
                vscode.window.showWarningMessage(`🔄 The prophecy endures: Existing test file renewed at ${testFilePath}`);
            }
        }
    });
    context.subscriptions.push(disposable);
}
function objectToString(obj) {
    return `{ ${Object.entries(obj)
        .map(([key, value]) => {
        if (typeof value === 'object') {
            return `${key}: ${objectToString(value)}`;
        }
        return `${key}: ${value}`;
    })
        .join(', ')} }`;
}
function createNestedMock(methodPath, isObservable) {
    const levels = methodPath.split('.');
    let mock = {};
    let current = mock;
    for (let i = 0; i < levels.length; i++) {
        const level = levels[i];
        if (i === levels.length - 1) {
            current[level] = isObservable ? '() => of()' : '() => {}';
        }
        else {
            current[level] = {};
            current = current[level];
        }
    }
    return mock;
}
function generateTestTemplate(analysisResult, fileName) {
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
        }
        else {
            const methodsList = methods.map((method) => `'${method.fullPath}'`).join(', ');
            return `{ provide: ${dep}, useValue: jasmine.createSpyObj('${alias}', [${methodsList}]) }`;
        }
    })
        .filter(Boolean)
        .join(',\n\t\t\t\t');
    const importStatements = imports
        .map((imp) => `import { ${imp.split(' from ')[0]} } from ${imp.split(' from ')[1]};`)
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
//# sourceMappingURL=extension.js.map