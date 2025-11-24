import { extractTypeScript } from './ast-to-mermaid/src/mappings/languages/typescript/extractors/typescript-extractor.mjs';

// TypeScript code with imports
const typescriptCode = `
import { readFileSync } from 'fs';
let x: number = 10;
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