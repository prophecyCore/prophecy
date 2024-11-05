import * as fs from 'fs/promises';

interface MethodDetail {
	fullPath: string;
	isTerminal: boolean;
	type?: string;
}

interface AnalysisResult {
	dependencies: Record<string, string>; // Mudamos para armazenar alias e tipos
	methodsUsed: Record<string, MethodDetail[]>;
	imports: string[]; // Adicionamos para armazenar as importações
}

// Função para extrair dependências do construtor e as importações
function extractDependencies(fileContent: string): { dependencies: Record<string, string>; imports: string[] } {
	const constructorRegex = /constructor\s*\((.*?)\)\s*{/s;
	const paramRegex = /private\s+(\w+):\s+(\w+)/g;
	const importRegex = /import\s+\{?(\w+(?:\s*,\s*\w+)*)\}?\s+from\s+['"]([^'"]+)['"]/g;

	const dependencies: Record<string, string> = {};
	const imports: string[] = [];
	const constructorMatch = fileContent.match(constructorRegex);

	// Extraindo dependências do construtor
  let match: any;
	if (constructorMatch) {
		const params = constructorMatch[1];
		while ((match = paramRegex.exec(params)) !== null) {
			const alias = match[1]; // Ex.: 'route'
			const type = match[2];  // Ex.: 'ActivatedRoute'
			dependencies[alias] = type;
		}
	}

	// Extraindo as importações
	while ((match = importRegex.exec(fileContent)) !== null) {
		const importedItems = match[1].split(',').map((item: any) => item.trim());
		imports.push(...importedItems.map((item: any) => `${item} from '${match[2]}'`));
	}

	return { dependencies, imports };
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
			const fullPath = match[1]; // Caminho completo do método, ex.: 'params.subscribe'
			const pathParts = fullPath.split('.');

			const isTerminal = true; // Marcamos todas as chamadas como terminais (todas devem ser mockadas)

			methodsUsed[type].push({
				fullPath,   // Mantém a cadeia completa, ex.: 'params.subscribe'
				isTerminal, // Indica que é parte da chamada a ser mockada
				type: 'any' // Placeholder para tipo, se precisar mapear mais tarde
			});
		}
	});

	return methodsUsed;
}

// Função principal para análise do arquivo
export async function analyzeFile(filePath: string): Promise<AnalysisResult> {
	const fileContent = await fs.readFile(filePath, 'utf-8');

	const { dependencies, imports } = extractDependencies(fileContent);
	console.log("Dependências encontradas:", dependencies);

	const methodsUsed = findMethodsUsed(fileContent, dependencies);
	console.log("Métodos usados por dependência:", methodsUsed);

	return {
		dependencies: dependencies, // Mantemos como um objeto para alias e tipos
		methodsUsed,
		imports // Incluímos as importações
	};
}

// Exemplo de uso
// const filePath = './seu-arquivo.ts';
// analyzeFile(filePath)
// 	.then((result) => console.log("Análise concluída:", result))
// 	.catch((err) => console.error("Erro ao analisar o arquivo:", err));
