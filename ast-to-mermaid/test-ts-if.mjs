import { generateFlowchart } from './ast-to-mermaid/src/mappings/languages/typescript/pipeline/flow.mjs';

// Test TypeScript if statement
const testCode = `
let x: number = 10;
if (x > 5) {
  console.log("x is greater than 5");
} else {
  console.log("x is less than or equal to 5");
}
console.log("Done");
`;

console.log('Testing TypeScript if statement:');
console.log('Input code:');
console.log(testCode);
console.log('\nGenerated flowchart:');
console.log(generateFlowchart(testCode));