#!/usr/bin/env node

/**
 * CLI for AST to Mermaid converter
 */

import { convertAST } from '../src/index.mjs';
import { generateFlowchart as generateCFlowchart } from '../src/mappings/languages/c/pipeline/flow.mjs';
import { generateFlowchart as generateCppFlowchart } from '../src/mappings/languages/cpp/pipeline/flow.mjs';
import { generateFlowchart as generatePythonFlowchart } from '../src/mappings/languages/python/pipeline/flow.mjs';
import { generateFlowchart as generateFortranFlowchart } from '../src/mappings/languages/fortran/pipeline/flow.mjs';
import fs from 'fs';

function showHelp() {
  console.log(`
Usage: ast2mermaid [options] <file>

Options:
  -h, --help     Show help
  -o, --output   Output file (default: stdout)
  -l, --language Language of the input file

Examples:
  ast2mermaid -l javascript example.js
  ast2mermaid -l python -o diagram.mmd example.py
  `);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  const positional = [];
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '-h' || arg === '--help') {
      showHelp();
      process.exit(0);
    } else if (arg === '-o' || arg === '--output') {
      options.output = args[++i];
    } else if (arg === '-l' || arg === '--language') {
      options.language = args[++i];
    } else {
      positional.push(arg);
    }
  }
  
  options.input = positional[0];
  return options;
}

async function main() {
  try {
    const options = parseArgs();
    
    if (!options.input) {
      console.error('Error: No input file specified');
      showHelp();
      process.exit(1);
    }
    
    if (!options.language) {
      console.error('Error: Language must be specified');
      showHelp();
      process.exit(1);
    }
    
    // Read the input file
    const sourceCode = fs.readFileSync(options.input, 'utf8');
    
    // Convert AST to Mermaid
    let mermaidDiagram;
    if (options.language === 'c') {
      // Use our new VTU-style flowchart generator for C
      mermaidDiagram = generateCFlowchart(sourceCode);
    } else if (options.language === 'cpp') {
      // Use our new VTU-style flowchart generator for C++
      mermaidDiagram = generateCppFlowchart(sourceCode);
    } else if (options.language === 'python') {
      // Use our new VTU-style flowchart generator for Python
      mermaidDiagram = generatePythonFlowchart(sourceCode);
    } else if (options.language === 'fortran') {
      // Use our new VTU-style flowchart generator for Fortran
      mermaidDiagram = generateFortranFlowchart(sourceCode);
    } else {
      // Use the existing converter for other languages
      mermaidDiagram = await convertAST(sourceCode, options.language);
    }
    
    // Output result
    if (options.output) {
      fs.writeFileSync(options.output, mermaidDiagram);
      console.log(`Mermaid diagram written to ${options.output}`);
    } else {
      console.log(mermaidDiagram);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the CLI
main();