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
  className: string;
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

  const classMatch = fileContent.match(classRegex);
  if (classMatch) {
    className = classMatch[1];
  }

  const constructorMatch = fileContent.match(constructorRegex);
  if (constructorMatch) {
    const params = constructorMatch[1];
    while ((match = paramRegex.exec(params)) !== null) {
      const alias = match[1];
      const type = match[2];
      dependencies[alias] = type;
    }
  }

  while ((match = importRegex.exec(fileContent)) !== null) {
    const importedItems = match[1].replace(/[{}]/g, '').split(',').map((item) => item.trim());
    const fromPath = match[2];

    importedItems.forEach((item) => {
      if (Object.values(dependencies).includes(item)) {
        imports.push(`${item} from '${fromPath}'`);
      }
    });
  }

  return { dependencies, imports, className };
}

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
      const isTerminal = pathParts.length === 1;

      methodsUsed[type].push({
        fullPath,
        isTerminal,
        type: isTerminal ? 'any' : 'Observable<any>'
      });
    }
  });

  return methodsUsed;
}

export async function analyzeFile(filePath: string): Promise<AnalysisResult> {
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const { dependencies, imports, className } = extractDependencies(fileContent);
  const methodsUsed = findMethodsUsed(fileContent, dependencies);

  return {
    dependencies,
    methodsUsed,
    imports,
    className
  };
}

