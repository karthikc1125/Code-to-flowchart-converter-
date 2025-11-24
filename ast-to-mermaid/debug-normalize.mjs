import { extractPascal } from './src/mappings/languages/pascal/extractors/pascal-extractor.mjs';
import { normalizePascal } from './src/mappings/languages/pascal/normalizer/normalize-pascal.mjs';
import { readFileSync } from 'fs';

console.log('Debugging Pascal normalization...\n');

// Test if statements
console.log('=== Test 1: If Statements ===');
try {
  const ifSource = readFileSync('test-if.pas', 'utf8');
  const ifAST = extractPascal(ifSource);
  console.log('Extracted AST:', JSON.stringify(ifAST, null, 2));
  
  const normalized = normalizePascal(ifAST);
  console.log('Normalized AST:', JSON.stringify(normalized, null, 2));
} catch (error) {
  console.error('Error in if statement processing:', error.message);
}

console.log('\n=== Test 2: Case Statements ===');
try {
  const caseSource = readFileSync('test-case.pas', 'utf8');
  const caseAST = extractPascal(caseSource);
  console.log('Extracted AST:', JSON.stringify(caseAST, null, 2));
  
  const normalized = normalizePascal(caseAST);
  console.log('Normalized AST:', JSON.stringify(normalized, null, 2));
} catch (error) {
  console.error('Error in case statement processing:', error.message);
}