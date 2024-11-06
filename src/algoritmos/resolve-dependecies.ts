import * as fs from 'fs/promises';

interface MethodDetail {
	fullPath: string;
	isTerminal: boolean;
	type?: string;
}

interface AnalysisResult {
	dependencies: Record<string, string>;
	methodsUsed: Record<string, MethodDetail[]>;
	imports: string[];
	className: string;  // Adicionamos para armazenar o nome da classe
}

function extractDependencies(fileContent: string): { dependencies: Record<string, string>; imports: string[]; className: string } {
	const constructorRegex = /constructor\s*\((.*?)\)\s*{/s;
	const paramRegex = /private\s+(\w+):\s+(\w+)/g;
	const importRegex = /import\s+\{?\s*([\w\s,{}]+)\s*\}?\s+from\s+['"]([^'"]+)['"]/g;
	const classRegex = /export\s+class\s+(\w+)/;

	const dependencies: Record<string, string> = {};
	const imports: string[] = [];
	let className = 'UnknownClass';
	let match: RegExpExecArray | null;

	// Extraindo o nome da classe
	const classMatch = fileContent.match(classRegex);
	if (classMatch) {
		className = classMatch[1];
	}

	// Extraindo dependências do construtor
	const constructorMatch = fileContent.match(constructorRegex);
	if (constructorMatch) {
		const params = constructorMatch[1];
		while ((match = paramRegex.exec(params)) !== null) {
			const alias = match[1]; // Ex.: 'route'
			const type = match[2];  // Ex.: 'ActivatedRoute'
			dependencies[alias] = type;
		}
	}

	// Extraindo as importações e formatando-as corretamente
	while ((match = importRegex.exec(fileContent)) !== null) {
		const importedItems = match[1].replace(/[{}]/g, '').split(',').map((item) => item.trim());
		const fromPath = match[2];

		// Filtrando apenas as dependências que estão no construtor
		importedItems.forEach((item) => {
			if (Object.values(dependencies).includes(item)) {
				imports.push(`${item} from '${fromPath}'`);
			}
		});
	}

	return { dependencies, imports, className };
}


// Função para encontrar e armazenar a cadeia completa dos métodos usados
function findMethodsUsed(fileContent: string, dependencies: Record<string, string>): Record<string, MethodDetail[]> {
	const methodsUsed: Record<string, MethodDetail[]> = {};

	Object.keys(dependencies).forEach((alias) => {
		const type = dependencies[alias];
		const methodRegex = new RegExp(`\\b${alias}\\.(\\w+(?:\\.\\w+)*)\\b`, 'g');
		methodsUsed[type] = [];

		let match;
		while ((match = methodRegex.exec(fileContent)) !== null) {
			const fullPath = match[1];
			const pathParts = fullPath.split('.');
			const isTerminal = true;

			methodsUsed[type].push({
				fullPath,
				isTerminal,
				type: 'any'
			});
		}
	});

	return methodsUsed;
}

// Função principal para análise do arquivo
export async function analyzeFile(filePath: string): Promise<AnalysisResult> {
	const fileContent = await fs.readFile(filePath, 'utf-8');

	const { dependencies, imports, className } = extractDependencies(fileContent);
	console.log("Dependências encontradas:", dependencies);
	console.log("Nome da classe:", className);

	const methodsUsed = findMethodsUsed(fileContent, dependencies);
	console.log("Métodos usados por dependência:", methodsUsed);

	return {
		dependencies,
		methodsUsed,
		imports,
		className
	};
}
