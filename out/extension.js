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
            const testTemplate = generateTestTemplate(analysisResult, fileName); // Ajustado para "EpisodeComponent"
            console.log("Test Template Generated:\n", testTemplate);
            fs.writeFileSync(testFilePath, testTemplate);
            if (!fs.existsSync(testFilePath)) {
                vscode.window.showInformationMessage(`Test file created: ${testFilePath}`);
            }
            else {
                vscode.window.showWarningMessage(`Test file updated: ${testFilePath}`);
            }
        }
    });
    context.subscriptions.push(disposable);
}
function generateTestTemplate(analysisResult, fileName) {
    const { className, dependencies = {}, methodsUsed = {}, imports = [] } = analysisResult;
    const dependencyMocks = Object.entries(dependencies)
        .map(([alias, dep]) => `let ${alias}: ${dep};`)
        .join('\n\t');
    const dependencyAssignments = Object.entries(dependencies)
        .map(([alias, dep]) => {
        const methods = methodsUsed[dep] || [];
        const methodsList = methods.map((method) => `'${method.fullPath.split('.').pop()}'`).join(', ');
        return `{ provide: ${dep}, useValue: jasmine.createSpyObj('${alias}', [${methodsList}]) }`;
    })
        .filter(Boolean)
        .join(',\n\t\t\t\t');
    const importStatements = imports
        .map((imp) => `import { ${imp.split(' from ')[0]} } from ${imp.split(' from ')[1]};`)
        .join('\n');
    return `${importStatements}
import { TestBed } from '@angular/core/testing';
import { ${className} } from './${fileName}';  // Importação dinâmica

describe('${className} Tests', () => {
	${dependencyMocks}
	let component: ${className};

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
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