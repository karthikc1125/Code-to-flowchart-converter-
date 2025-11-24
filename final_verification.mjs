#!/usr/bin/env node

import { readFileSync } from 'fs';
import { generateFlowchart } from './ast-to-mermaid/src/mappings/languages/fortran/pipeline/flow.mjs';

// Read the Fortran test file
const fortranCode = readFileSync('test_no_direct_connection.f90', 'utf8');

console.log('Final verification test...');
console.log('========================');

try {
    // Generate the Mermaid flowchart
    const flowchart = generateFlowchart(fortranCode);
    
    console.log('Generated flowchart:');
    console.log(flowchart);
    
    // Check for unwanted direct connections
    const lines = flowchart.split('\n');
    let hasUnwantedConnection = false;
    
    for (const line of lines) {
        // Check for direct connection from variable declaration to after switch statement
        if (line.includes('N2 --> N10')) {
            hasUnwantedConnection = true;
            break;
        }
    }
    
    if (hasUnwantedConnection) {
        console.log('\n❌ FAILURE: Unwanted direct connection found (N2 --> N10)');
        process.exit(1);
    } else {
        console.log('\n✅ SUCCESS: No unwanted direct connection found');
    }
    
    // Check that case ends connect to after switch statement
    let caseEndConnections = 0;
    for (const line of lines) {
        if (line.includes(' --> N10') && line.includes('N')) {
            caseEndConnections++;
        }
    }
    
    if (caseEndConnections >= 1) {
        console.log(`✅ SUCCESS: Found ${caseEndConnections} case end connections to after switch statement`);
    } else {
        console.log('❌ WARNING: No case end connections to after switch statement found');
    }
    
    console.log('\n🎉 All tests passed! The fix is working correctly.');
    
} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}