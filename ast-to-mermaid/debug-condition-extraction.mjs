import { extractPascal } from './src/mappings/languages/pascal/extractors/pascal-extractor.mjs';
import { readFileSync } from 'fs';

console.log('Debugging condition extraction in detail...\n');

// Test if statements
console.log('=== Test 1: If Statements ===');
try {
  const ifSource = readFileSync('test-if.pas', 'utf8');
  const ifAST = extractPascal(ifSource);
  
  console.log('First if statement:');
  const firstIf = ifAST.body[0];
  console.log('Type:', firstIf.type);
  console.log('Start position:', firstIf.start);
  console.log('Has source code:', !!firstIf.sourceCode);
  
  if (firstIf.sourceCode) {
    console.log('Source code preview:');
    console.log(firstIf.sourceCode.substring(0, 200) + '...');
    
    // Try to extract condition using our method
    try {
      // Parse the start position to get line and column
      const startPos = firstIf.start.split(',').map(Number);
      const lineIndex = startPos[0] - 1; // Convert to 0-based index
      const colIndex = startPos[1] - 1; // Convert to 0-based index
      
      console.log('Line index:', lineIndex);
      console.log('Column index:', colIndex);
      
      // Get the line containing the if statement
      const lines = firstIf.sourceCode.split('\n');
      console.log('Total lines:', lines.length);
      
      if (lineIndex < lines.length) {
        const line = lines[lineIndex];
        console.log('Line content:', JSON.stringify(line));
        
        // The start position [5, 2] means line 5, column 2, which should be the "if" keyword
        // Let's check if the "if" keyword is at the expected position
        if (line.length > colIndex && line.substring(colIndex, colIndex + 2) === 'if') {
          console.log('Found "if" at expected position');
          
          // Extract condition between "if" and "then"
          const conditionMatch = line.match(/if\s+(.*?)\s+then/i);
          console.log('Condition match result:', conditionMatch);
          
          if (conditionMatch) {
            console.log('Extracted condition:', conditionMatch[1].trim());
          } else {
            console.log('No condition match found in the line');
            
            // Let's try to find the actual if statement line
            console.log('Searching for if statement in nearby lines...');
            for (let i = lineIndex; i < Math.min(lineIndex + 3, lines.length); i++) {
              const searchLine = lines[i];
              console.log(`Line ${i + 1}:`, JSON.stringify(searchLine));
              const searchMatch = searchLine.match(/if\s+(.*?)\s+then/i);
              if (searchMatch) {
                console.log(`Found if statement on line ${i + 1}:`, searchMatch[1].trim());
                break;
              }
            }
          }
        } else {
          console.log('Expected "if" not found at position', colIndex);
          console.log('Character at position:', line.charAt(colIndex));
        }
      } else {
        console.log('Line index out of bounds');
      }
    } catch (error) {
      console.error('Error in condition extraction:', error);
    }
  }
  
} catch (error) {
  console.error('Error in if statement processing:', error.message);
  console.error('Stack:', error.stack);
}