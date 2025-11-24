import { generateFlowchart } from './src/mappings/languages/pascal/pipeline/flow.mjs';
import fs from 'fs';

// Test files
const testFiles = [
  { name: 'Simple If Statement', file: 'test-if.pas' },
  { name: 'Case Statement', file: 'test-case.pas' },
  { name: 'Complex Conditional Statements', file: 'test-complex-conditional.pas' }
];

console.log('Testing Pascal Conditional Statements\n');

for (const { name, file } of testFiles) {
  try {
    console.log(`=== ${name} ===`);
    console.log(`File: ${file}`);
    
    // Check if file exists
    if (!fs.existsSync(file)) {
      console.log(`File ${file} not found, skipping...\n`);
      console.log('-'.repeat(50) + '\n');
      continue;
    }
    
    // Read the test file
    const sourceCode = fs.readFileSync(file, 'utf8');
    console.log('Source code:');
    console.log(sourceCode);
    
    // Generate Mermaid flowchart
    console.log('\nGenerated Mermaid diagram:');
    const mermaidDiagram = generateFlowchart(sourceCode);
    console.log(mermaidDiagram);
    
    // Save to file
    const outputFile = file.replace('.pas', '-output.mmd');
    fs.writeFileSync(outputFile, mermaidDiagram);
    console.log(`Output saved to: ${outputFile}\n`);
    console.log('-'.repeat(50) + '\n');
    
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
    console.log('-'.repeat(50) + '\n');
  }
}