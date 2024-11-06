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
function extractDependencies(fileContent) {
    const constructorRegex = /constructor\s*\((.*?)\)\s*{/s;
    const paramRegex = /private\s+(\w+):\s+(\w+)/g;
    const importRegex = /import\s+\{?\s*([\w\s,{}]+)\s*\}?\s+from\s+['"]([^'"]+)['"]/g;
    const classRegex = /export\s+class\s+(\w+)/;
    const dependencies = {};
    const imports = [];
    let className = 'UnknownClass';
    let match;
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
            const type = match[2]; // Ex.: 'ActivatedRoute'
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
function findMethodsUsed(fileContent, dependencies) {
    const methodsUsed = {};
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
async function analyzeFile(filePath) {
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
//# sourceMappingURL=resolve-dependecies.js.map