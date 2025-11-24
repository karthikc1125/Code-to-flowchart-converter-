#!/usr/bin/env node

/**
 * Simple script to test TypeScript conditional statements via CLI
 */

import { generateFlowchart } from './ast-to-mermaid/src/mappings/languages/typescript/pipeline/flow.mjs';
import fs from 'fs';

// TypeScript code with various conditional statements
const typescriptCode = `
let x: number = 10;
let y: number = 20;

// Simple if statement
if (x > 5) {
    console.log("x is greater than 5");
}

// If-else statement
if (x > y) {
    console.log("x is greater than y");
} else {
    console.log("x is not greater than y");
}

// If-else-if chain
if (x === y) {
    console.log("x equals y");
} else if (x < y) {
    console.log("x is less than y");
} else {
    console.log("x is greater than y");
}
`;

console.log('Testing TypeScript conditional statements conversion to Mermaid...');
console.log('Input TypeScript code:');
console.log(typescriptCode);

try {
  // Generate the Mermaid diagram
  const result = generateFlowchart(typescriptCode);
  
  console.log('\nGenerated Mermaid Diagram:');
  console.log(result);
  
  // Save to file
  fs.writeFileSync('typescript-cli-output.mmd', result);
  console.log('\nMermaid diagram saved to typescript-cli-output.mmd');
  
} catch (error) {
  console.error('Error occurred while converting TypeScript code:', error.message);
  console.error(error.stack);
}