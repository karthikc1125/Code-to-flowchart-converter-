import { generateFlowchart } from './src/mappings/languages/pascal/pipeline/flow.mjs';
import fs from 'fs';

// List of Pascal files to convert
const pascalFiles = [
  'if-simple.pas',
  'if-else.pas',
  'nested-if.pas',
  'else-if-chain.pas',
  'case-simple.pas',
  'case-ranges.pas'
];

console.log('Converting Pascal conditional statements to Mermaid format...\n');

for (const file of pascalFiles) {
  try {
    console.log(`Processing ${file}...`);
    
    // Check if file exists
    if (!fs.existsSync(file)) {
      console.log(`  File not found, skipping...\n`);
      continue;
    }
    
    // Read the Pascal source file
    const sourceCode = fs.readFileSync(file, 'utf8');
    
    // Convert to Mermaid flowchart
    const mermaidDiagram = generateFlowchart(sourceCode);
    
    // Save to output file
    const outputFile = file.replace('.pas', '-output.mmd');
    fs.writeFileSync(outputFile, mermaidDiagram);
    
    console.log(`  Saved to ${outputFile}\n`);
    
  } catch (error) {
    console.error(`  Error processing ${file}: ${error.message}\n`);
  }
}

console.log('All conversions completed!');