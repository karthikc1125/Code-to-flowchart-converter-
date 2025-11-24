import { extractPascal } from './src/mappings/languages/pascal/extractors/pascal-extractor.mjs';
import { normalizePascal } from './src/mappings/languages/pascal/normalizer/normalize-pascal.mjs';
import fs from 'fs';

console.log('Debugging Pascal AST generation...\n');

try {
  // Read the test file
  const sourceCode = fs.readFileSync('test-full-pascal.pas', 'utf8');
  console.log('Source code:');
  console.log(sourceCode);
  
  // Extract AST
  console.log('\n--- Extracting AST ---');
  const ast = extractPascal(sourceCode);
  console.log('Extracted AST:');
  console.log(JSON.stringify(ast, null, 2));
  
  // Normalize AST
  console.log('\n--- Normalizing AST ---');
  const normalized = normalizePascal(ast);
  console.log('Normalized AST:');
  console.log(JSON.stringify(normalized, null, 2));
  
} catch (error) {
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}