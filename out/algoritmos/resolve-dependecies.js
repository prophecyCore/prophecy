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
exports.analyzeFile = analyzeFile;
const fs = __importStar(require("fs/promises"));
// Função para extrair dependências do construtor e as importações
function extractDependencies(fileContent) {
    const constructorRegex = /constructor\s*\((.*?)\)\s*{/s;
    const paramRegex = /private\s+(\w+):\s+(\w+)/g;
    const importRegex = /import\s+\{?(\w+(?:\s*,\s*\w+)*)\}?\s+from\s+['"]([^'"]+)['"]/g;
    const dependencies = {};
    const imports = [];
    const constructorMatch = fileContent.match(constructorRegex);
    // Extraindo dependências do construtor
    let match;
    if (constructorMatch) {
        const params = constructorMatch[1];
        while ((match = paramRegex.exec(params)) !== null) {
            const alias = match[1]; // Ex.: 'route'
            const type = match[2]; // Ex.: 'ActivatedRoute'
            dependencies[alias] = type;
        }
    }
    // Extraindo as importações
    while ((match = importRegex.exec(fileContent)) !== null) {
        const importedItems = match[1].split(',').map((item) => item.trim());
        imports.push(...importedItems.map((item) => `${item} from '${match[2]}'`));
    }
    return { dependencies, imports };
}
// Função para encontrar e armazenar a cadeia completa dos métodos usados
function findMethodsUsed(fileContent, dependencies) {
    const methodsUsed = {};
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
                fullPath, // Mantém a cadeia completa, ex.: 'params.subscribe'
                isTerminal, // Indica que é parte da chamada a ser mockada
                type: 'any' // Placeholder para tipo, se precisar mapear mais tarde
            });
        }
    });
    return methodsUsed;
}
// Função principal para análise do arquivo
async function analyzeFile(filePath) {
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
//# sourceMappingURL=resolve-dependecies.js.map