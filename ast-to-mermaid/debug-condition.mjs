import { extractPascal } from './src/mappings/languages/pascal/extractors/pascal-extractor.mjs';
import { readFileSync } from 'fs';

console.log('Debugging condition extraction...\n');

// Test if statements
console.log('=== Test 1: If Statements ===');
try {
  const ifSource = readFileSync('test-if.pas', 'utf8');
  const ifAST = extractPascal(ifSource);
  
  // Find the first if statement in the AST
  const findIfStatement = (node) => {
    if (node.type === 'if') {
      return node;
    }
    if (node.body && Array.isArray(node.body)) {
      for (const child of node.body) {
        const result = findIfStatement(child);
        if (result) return result;
      }
    }
    return null;
  };
  
  const ifNode = findIfStatement(ifAST);
  if (!ifNode) {
    console.log('No if statement found in AST');
    process.exit(1);
  }
  
  console.log('Found if statement:', JSON.stringify(ifNode, null, 2));
  
  console.log('\nRaw content preview:');
  console.log(ifNode.raw);
  
  // Better extraction approach - look for the actual patterns in the raw text
  // Extract LHS identifier
  const lhsMatch = ifNode.raw.match(/lhs:\s*$$identifier\s*$(.*?)$/);
  const lhsValue = lhsMatch ? lhsMatch[1] : '';
  
  // Extract operator
  const operatorMatch = ifNode.raw.match(/operator:\s*$$k(\w+)\s*$(.*?)$/);
  const operatorValue = operatorMatch ? operatorMatch[1] : '';
  
  // Extract RHS literal
  const rhsMatch = ifNode.raw.match(/rhs:\s*$$literal\w+\s*$(.*?)$/);
  const rhsValue = rhsMatch ? rhsMatch[1] : '';
  
  console.log('\nExtracted values:');
  console.log('LHS identifier:', lhsValue);
  console.log('Operator:', operatorValue);
  console.log('RHS literal:', rhsValue);
  
  // Map operator keywords to symbols
  const operatorMap = {
    'Gt': '>',
    'Lt': '<',
    'Ge': '>=',
    'Le': '<=',
    'Eq': '==',
    'Ne': '!='
  };
  
  const operatorSymbol = operatorMap[operatorValue] || operatorValue;
  
  if (lhsValue && operatorSymbol && rhsValue) {
    console.log('\nFull condition:', `${lhsValue} ${operatorSymbol} ${rhsValue}`);
  }
  
  // Let's also try to extract the actual text from the source code
  console.log('\n--- Extracting from source code ---');
  const lines = ifSource.split('\n');
  const ifLine = lines[5]; // Line 6 (0-indexed) contains "if x > 0 then"
  console.log('If line:', ifLine);
  
  // Extract the condition part from the actual source code
  const conditionMatch = ifLine.match(/if\s+(.*?)\s+then/);
  if (conditionMatch) {
    console.log('Actual condition from source:', conditionMatch[1]);
  }
  
} catch (error) {
  console.error('Error in if statement processing:', error.message);
  console.error('Stack:', error.stack);
}