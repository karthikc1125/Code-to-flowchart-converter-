import { extractTypeScript } from './ast-to-mermaid/src/mappings/languages/typescript/extractors/typescript-extractor.mjs';
import { normalizeTypescriptAst } from './ast-to-mermaid/src/mappings/languages/typescript/normalizer/normalize-typescript.mjs';
import { ctx } from './ast-to-mermaid/src/mappings/languages/typescript/mermaid/context.mjs';

// TypeScript code with switch statement
const typescriptCode = `
switch (x) {
    case 1:
        console.log("x is 1");
        break;
    default:
        console.log("x is something else");
        break;
}
`;

console.log('Testing switch statement detailed context...');

// Extract and normalize
const ast = extractTypeScript(typescriptCode);
const normalized = normalizeTypescriptAst(ast);

console.log('Normalized AST:', JSON.stringify(normalized, null, 2));

// Create context
const context = ctx();

console.log('Initial context state:');
console.log('- currentSwitchId:', context.currentSwitchId);
console.log('- switchEndNodes:', context.switchEndNodes);
console.log('- pendingBreaks:', context.pendingBreaks);