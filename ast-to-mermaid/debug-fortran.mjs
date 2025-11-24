import { extractFortran } from './src/mappings/languages/fortran/extractors/fortran-extractor.mjs';
import { normalizeFortran } from './src/mappings/languages/fortran/normalizer/normalize-fortran.mjs';
import fs from 'fs';
const sourceCode = fs.readFileSync('../test-fortran-switch.f90', 'utf8');

console.log('Source code:');
console.log(sourceCode);
console.log('\n---\n');

try {
  // Extract AST
  const ast = extractFortran(sourceCode);
  console.log('Raw AST:');
  console.log(JSON.stringify(ast, null, 2));
  console.log('\n---\n');
  
  // Normalize AST
  const normalized = normalizeFortran(ast, sourceCode);
  console.log('Normalized AST:');
  console.log(JSON.stringify(normalized, null, 2));
} catch (error) {
  console.error('Error:', error);
}