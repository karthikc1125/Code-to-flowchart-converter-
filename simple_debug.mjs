#!/usr/bin/env node

import { readFileSync } from 'fs';
import { generateFlowchart } from './ast-to-mermaid/src/mappings/languages/fortran/pipeline/flow.mjs';

// Read the Fortran test file
const fortranCode = readFileSync('test_no_direct_connection.f90', 'utf8');

console.log('Debugging flowchart generation...');
console.log('================================');

try {
    // Generate the Mermaid flowchart
    const flowchart = generateFlowchart(fortranCode);
    
    // Output the result
    console.log(flowchart);
    
} catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
}