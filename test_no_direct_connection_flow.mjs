#!/usr/bin/env node

import { readFileSync } from 'fs';
import { generateFlowchart } from './ast-to-mermaid/src/mappings/languages/fortran/pipeline/flow.mjs';

// Read the Fortran test file
const fortranCode = readFileSync('test_no_direct_connection.f90', 'utf8');

console.log('Testing that select case does not directly connect to next statement...');
console.log('====================================================================');

try {
    // Generate the Mermaid flowchart
    const flowchart = generateFlowchart(fortranCode);
    
    // Output the result
    console.log(flowchart);
    
    console.log('\n====================================================================');
    console.log('Flowchart generation completed successfully!');
    
    // Check the flowchart for direct connections from select case to next statement
    const lines = flowchart.split('\n');
    
    // Look for the select case node and the "After switch statement" node
    let selectCaseNode = null;
    let afterSwitchNode = null;
    
    for (const line of lines) {
        if (line.includes('select case')) {
            const match = line.match(/^(N\d+)/);
            if (match) {
                selectCaseNode = match[1];
            }
        }
        if (line.includes('After switch statement')) {
            const match = line.match(/^(N\d+)/);
            if (match) {
                afterSwitchNode = match[1];
            }
        }
    }
    
    // Check if select case node connects directly to after switch node (it shouldn't)
    let directConnection = false;
    if (selectCaseNode && afterSwitchNode) {
        for (const line of lines) {
            if (line.includes(`${selectCaseNode} --> ${afterSwitchNode}`)) {
                directConnection = true;
                break;
            }
        }
    }
    
    if (directConnection) {
        console.log('FAILURE: Direct connection from select case to after switch found!');
        console.log(`Found connection: ${selectCaseNode} --> ${afterSwitchNode}`);
        process.exit(1);
    } else {
        console.log('SUCCESS: No direct connection from select case to after switch.');
    }
    
    // Check if case end nodes connect to after switch node (they should)
    let caseConnections = 0;
    if (afterSwitchNode) {
        for (const line of lines) {
            if (line.includes(` --> ${afterSwitchNode}`) && !line.includes('select case')) {
                caseConnections++;
            }
        }
    }
    
    if (caseConnections > 0) {
        console.log(`SUCCESS: Found ${caseConnections} case connections to after switch statement.`);
    } else {
        console.log('WARNING: No case connections to after switch statement found.');
    }
    
    console.log('Test completed successfully!');
    
} catch (error) {
    console.error('Error generating flowchart:', error.message);
    process.exit(1);
}