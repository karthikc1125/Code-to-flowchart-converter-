import { extractTypeScript } from './ast-to-mermaid/src/mappings/languages/typescript/extractors/typescript-extractor.mjs';

// Simple TypeScript code with switch statement
const typescriptCode = `
switch (x) {
    default:
        console.log("default case");
        break;
}
`;

console.log('Extracting TypeScript AST...');
const ast = extractTypeScript(typescriptCode);

// Simple traversal to find node types
function traverse(node, depth = 0) {
  const indent = '  '.repeat(depth);
  if (node.type) {
    console.log(`${indent}${node.type}: ${node.text || ''}`);
  }
  if (node.children) {
    node.children.forEach(child => traverse(child, depth + 1));
  }
}

traverse(ast);