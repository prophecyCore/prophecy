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
}

export async function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('extension.generateTest', async () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const filePath = editor.document.uri.fsPath;
			const fileName = path.basename(filePath, '.ts');
			const testFilePath = filePath.replace(/\.ts$/, '.spec.ts');

			const analysisResult: AnalysisResult = await analyzeFile(filePath);
			const testTemplate = generateTestTemplate("EpisodeComponent", analysisResult);  // Ajustado para "EpisodeComponent"

			console.log("Test Template Generated:\n", testTemplate);

			fs.writeFileSync(testFilePath, testTemplate);

			if (!fs.existsSync(testFilePath)) {
				vscode.window.showInformationMessage(`Test file created: ${testFilePath}`);
			} else {
				vscode.window.showWarningMessage(`Test file updated: ${testFilePath}`);
			}
		}
	});
	context.subscriptions.push(disposable);
}

function generateTestTemplate(className: string, analysisResult: AnalysisResult): string {
	console.log("analysisResult:", analysisResult);

	const { dependencies = {}, methodsUsed = {}, imports = [] } = analysisResult;

	console.log("Dependencies:", dependencies);
	console.log("Methods Used:", methodsUsed);
	console.log("Imports:", imports);

	// Geração dos mocks de dependências
	const dependencyMocks = Object.entries(dependencies)
		.map(([alias, dep]) => `let ${alias}: jasmine.SpyObj<${dep}>;`)
		.join('\n\t');

	// Tratamento para assignments de dependências
	const dependencyAssignments = Object.entries(dependencies)
		.map(([alias, dep]) => {
			const methods = methodsUsed[dep] || [];
			const methodsList = methods.map((method) => `'${method.fullPath.split('.').pop()}'`).join(', ');
			return `{ provide: ${dep}, useValue: jasmine.createSpyObj('${alias}', [${methodsList}]) }`;
		})
		.filter(Boolean)
		.join(',\n\t\t\t\t');

	// Argumentos do construtor com alias das dependências
	const importStatements = imports
		.map((imp) => `import { ${imp} } from './${imp.toLowerCase()}.ts';`)
		.join('\n');

	return `${importStatements}
import { TestBed } from '@angular/core/testing';
import { ${className} } from './episode.component';  // Ajustado para rota

describe('${className} Tests', () => {
	${dependencyMocks}
	let component: ${className};

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				${dependencyAssignments}
			]
		});

		// Inject dependencies
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
