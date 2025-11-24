import { extractPascal } from './src/mappings/languages/pascal/extractors/pascal-extractor.mjs';
import { normalizePascal } from './src/mappings/languages/pascal/normalizer/normalize-pascal.mjs';
import { readFileSync } from 'fs';

console.log('Debugging normalizer...\n');

// Test if statements
console.log('=== Test 1: If Statements ===');
try {
  const ifSource = readFileSync('test-complex-conditional.pas', 'utf8');
  const ifAST = extractPascal(ifSource);
  
  console.log('Extracted AST:');
  console.log(JSON.stringify(ifAST, null, 2));
  
  // Normalize the AST
  const normalized = normalizePascal(ifAST);
  
  console.log('\nNormalized AST:');
  console.log(JSON.stringify(normalized, null, 2));
  
} catch (error) {
  console.error('Error in if statement processing:', error.message);
  console.error('Stack:', error.stack);
}