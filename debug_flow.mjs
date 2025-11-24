#!/usr/bin/env node

import { readFileSync } from 'fs';
import { parse } from './ast-to-mermaid/src/mappings/languages/fortran/parser/parser.mjs';
import { createContext } from './ast-to-mermaid/src/mappings/languages/fortran/mermaid/context.mjs';
import { mapAST } from './ast-to-mermaid/src/mappings/languages/fortran/pipeline/map.mjs';
import { finalizeFlowContext } from './ast-to-mermaid/src/mappings/languages/fortran/mermaid/finalize-context.mjs';

// Read the Fortran test file
const fortranCode = readFileSync('test_no_direct_connection.f90', 'utf8');

console.log('Debugging flowchart generation...');
console.log('================================');

try {
    // Parse the Fortran code
    const ast = parse(fortranCode);
    console.log('AST parsed successfully');
    
    // Create context
    const context = createContext();
    console.log('Context created');
    
    // Map AST to flowchart nodes
    mapAST(ast, context);
    console.log('AST mapped to flowchart nodes');
    
    console.log('\nBefore finalization:');
    console.log('Context last:', context.last);
    console.log('Context nodes:', context.nodes);
    console.log('Context edges:', context.edges);
    console.log('Context switchCaseEnds:', context.switchCaseEnds);
    
    // Finalize the context
    const endId = finalizeFlowContext(context);
    console.log('\nAfter finalization:');
    console.log('End ID:', endId);
    console.log('Context last:', context.last);
    console.log('Context nodes:', context.nodes);
    console.log('Context edges:', context.edges);
    console.log('Context switchCaseEnds:', context.switchCaseEnds);
    
} catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
}