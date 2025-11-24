import { generateFlowchart } from './src/mappings/languages/typescript/pipeline/flow.mjs';
import fs from 'fs';

// Read the test file with body content
const bodyContent = fs.readFileSync('./test-body-content.ts', 'utf8');

console.log("=== If Statement with Body Content ===");
console.log(generateFlowchart(bodyContent));