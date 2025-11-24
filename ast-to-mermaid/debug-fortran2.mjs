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
  
  // Find the select case statement in the AST
  function findSelectCase(node) {
    if (!node) return null;
    if (node.type === 'select_case_statement') {
      return node;
    }
    if (node.children) {
      for (const child of node.children) {
        const result = findSelectCase(child);
        if (result) return result;
      }
    }
    return null;
  }
  
  const selectCaseNode = findSelectCase(ast);
  if (selectCaseNode) {
    console.log('Select case node:');
    console.log(JSON.stringify(selectCaseNode, null, 2));
    
    // Look for parenthesized expressions
    const parenExpr = selectCaseNode.children.find(child => child.type === 'parenthesized_expression');
    if (parenExpr) {
      console.log('\nParenthesized expression:');
      console.log(JSON.stringify(parenExpr, null, 2));
      console.log('Text:', parenExpr.text);
    }
    
    // Look for case statements
    const caseStatements = selectCaseNode.children.filter(child => 
      child.type === 'case_statement' || child.type === 'case_default_statement'
    );
    console.log('\nCase statements:');
    caseStatements.forEach((caseStmt, index) => {
      console.log(`Case ${index}:`);
      console.log(JSON.stringify(caseStmt, null, 2));
      
      // Look for parenthesized expressions in case statement
      const caseParenExpr = caseStmt.children.find(child => child.type === 'parenthesized_expression');
      if (caseParenExpr) {
        console.log('  Parenthesized expression:');
        console.log(JSON.stringify(caseParenExpr, null, 2));
        console.log('  Text:', caseParenExpr.text);
      }
    });
  }
} catch (error) {
  console.error('Error:', error);
}