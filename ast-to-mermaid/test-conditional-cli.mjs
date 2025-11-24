import { generateFlowchart } from './src/mappings/languages/pascal/pipeline/flow.mjs';
import { readFileSync } from 'fs';

console.log('Testing Pascal conditional statements...\n');

// Test 1: If statements
console.log('=== Test 1: If Statements ===');
try {
  const ifSource = readFileSync('test-if.pas', 'utf8');
  const ifFlowchart = generateFlowchart(ifSource);
  console.log(ifFlowchart);
} catch (error) {
  console.error('Error generating flowchart for if statements:', error.message);
}

console.log('\n=== Test 2: Case Statements ===');
try {
  const caseSource = readFileSync('test-case.pas', 'utf8');
  const caseFlowchart = generateFlowchart(caseSource);
  console.log(caseFlowchart);
} catch (error) {
  console.error('Error generating flowchart for case statements:', error.message);
}

console.log('\nAll tests completed.');