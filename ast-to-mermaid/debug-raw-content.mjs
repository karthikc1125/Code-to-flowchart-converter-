import { extractPascal } from './src/mappings/languages/pascal/extractors/pascal-extractor.mjs';
import fs from 'fs';

console.log('Debugging raw content structure...\n');

try {
  // Read the test file
  const sourceCode = fs.readFileSync('test-full-pascal.pas', 'utf8');
  
  // Extract AST
  const ast = extractPascal(sourceCode);
  
  // Look at the first if statement raw content
  const firstIf = ast.body[0];
  console.log('First if statement raw content:');
  console.log(firstIf.raw);
  console.log('\n---\n');
  
  // Look at the if-else statement raw content
  const ifElse = ast.body[1];
  console.log('If-else statement raw content:');
  console.log(ifElse.raw);
  console.log('\n---\n');
  
  // Look at the nested if statement raw content
  const nestedIf = ast.body[2];
  console.log('Nested if statement raw content:');
  console.log(nestedIf.raw);
  console.log('\n---\n');
  
  // Look at the case statement raw content
  const caseStmt = ast.body[3];
  console.log('Case statement raw content:');
  console.log(caseStmt.raw);
  
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}