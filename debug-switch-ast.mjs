import { extractTypeScript } from './ast-to-mermaid/src/mappings/languages/typescript/extractors/typescript-extractor.mjs';
import { normalizeTypescriptAst } from './ast-to-mermaid/src/mappings/languages/typescript/normalizer/normalize-typescript.mjs';

// TypeScript code with switch statement
const typescriptCode = `
let x: number = 2;

switch (x) {
    case 1:
        console.log("x is 1");
        break;
    case 2:
        console.log("x is 2");
        break;
    case 3:
        console.log("x is 3");
        break;
    default:
        console.log("x is something else");
        break;
}

console.log("End of switch");
`;

console.log('Extracting TypeScript AST...');
const ast = extractTypeScript(typescriptCode);
console.log('AST:', JSON.stringify(ast, null, 2));

console.log('\nNormalizing AST...');
const normalized = normalizeTypescriptAst(ast);
console.log('Normalized:', JSON.stringify(normalized, null, 2));