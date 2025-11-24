import { generateFlowchart } from './src/mappings/languages/pascal/pipeline/flow.mjs';
import fs from 'fs';

console.log('Pascal Conditional Statements to Mermaid Converter\n');

// Read the Pascal test file
const sourceFile = 'pascal-conditional-demo.pas';
console.log(`Reading Pascal file: ${sourceFile}`);

try {
  const sourceCode = fs.readFileSync(sourceFile, 'utf8');
  console.log('\nSource code:');
  console.log(sourceCode);
  
  // Convert to Mermaid flowchart
  console.log('\nConverting to Mermaid flowchart...\n');
  const mermaidDiagram = generateFlowchart(sourceCode);
  
  // Display the result
  console.log('Generated Mermaid diagram:');
  console.log(mermaidDiagram);
  
  // Save to output file
  const outputFile = 'pascal-conditional-demo-output.mmd';
  fs.writeFileSync(outputFile, mermaidDiagram);
  console.log(`\nMermaid diagram saved to: ${outputFile}`);
  
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}