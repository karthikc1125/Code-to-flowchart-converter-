import { extractTypeScript } from './ast-to-mermaid/src/mappings/languages/typescript/extractors/typescript-extractor.mjs';

// TypeScript code with imports
const typescriptCode = `
import { readFileSync } from 'fs';

let x: number = 10;
`;

console.log('Extracting TypeScript AST...');
const ast = extractTypeScript(typescriptCode);
console.log('AST:', JSON.stringify(ast, null, 2));