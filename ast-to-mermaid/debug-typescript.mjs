import { extractTypeScript } from './src/mappings/languages/typescript/extractors/typescript-extractor.mjs';
import { normalizeTypescriptAst } from './src/mappings/languages/typescript/normalizer/normalize-typescript.mjs';

const code = `
if (true) {
  console.log("Inside if body");
  let x = 10;
  x = x + 5;
} else {
  console.log("Inside else body");
  let y = 20;
}
`;

console.log("=== Raw AST ===");
const ast = extractTypeScript(code);
console.log(JSON.stringify(ast, null, 2));

console.log("\n=== Normalized AST ===");
const normalized = normalizeTypescriptAst(ast);
console.log(JSON.stringify(normalized, null, 2));

// Let's also check what child nodes are available
if (ast && ast.children) {
  console.log("\n=== AST Children ===");
  ast.children.forEach((child, index) => {
    console.log(`Child ${index}:`, child.type, child.text);
    if (child.children) {
      child.children.forEach((subchild, subindex) => {
        console.log(`  Subchild ${subindex}:`, subchild.type, subchild.text);
      });
    }
    
    // Specifically check if_statement structure
    if (child.type === 'if_statement' && child.children) {
      console.log(`  if_statement children:`);
      child.children.forEach((subchild, subindex) => {
        console.log(`    ${subindex}:`, subchild.type, subchild.text);
      });
    }
  });
}