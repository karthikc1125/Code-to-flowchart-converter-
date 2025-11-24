#!/usr/bin/env node

import { convertCodeToMermaid } from './src/index.mjs';

// TypeScript code to test
const typescriptCode = `
if (true) {
  // body
}

if (false) {
  // then body
} else {
  // else body
}

if (true) {
  // first body
} else if (false) {
  // second body
} else {
  // else body
}
`;

console.log('Testing TypeScript conditional statements conversion to Mermaid...');

try {
  const result = convertCodeToMermaid(typescriptCode, 'typescript');
  console.log('Mermaid Diagram:');
  console.log(result);
} catch (error) {
  console.error('Error occurred while converting TypeScript code:', error.message);
  console.error(error.stack);
}