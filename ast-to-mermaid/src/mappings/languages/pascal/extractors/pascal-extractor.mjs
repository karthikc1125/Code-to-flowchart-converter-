import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Parse tree-sitter CLI output into a structured AST
 * @param {string} cliOutput - Raw tree-sitter CLI output
 * @param {string} sourceCode - Original source code
 * @returns {Object} - Structured AST
 */
function parsePascalCLIOutput(cliOutput, sourceCode) {
  // Split the output into lines
  const lines = cliOutput.split('\n');
  const statements = [];
  
  // Look for if and case statements
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Match if statements
    const ifMatch = line.match(/^\s*\((if(?:Else)?) \[([^\]]+)\] - \[([^\]]+)\]/);
    if (ifMatch) {
      const type = ifMatch[1];
      const start = ifMatch[2];
      const end = ifMatch[3];
      
      // Extract the content of this statement by counting parentheses
      let content = '';
      let parenCount = 1;
      let j = i + 1;
      
      while (j < lines.length && parenCount > 0) {
        const nextLine = lines[j];
        content += nextLine + '\n';
        
        // Count opening and closing parentheses
        const openCount = (nextLine.match(/\(/g) || []).length;
        const closeCount = (nextLine.match(/\)/g) || []).length;
        parenCount += openCount - closeCount;
        
        j++;
      }
      
      statements.push({
        type: type,
        start: start,
        end: end,
        raw: content,
        sourceCode: sourceCode // Pass the source code for condition extraction
      });
      
      // Skip the lines we've already processed
      i = j - 1;
    }
    
    // Match case statements
    const caseMatch = line.match(/^\s*\(case \[([^\]]+)\] - \[([^\]]+)\]/);
    if (caseMatch) {
      const start = caseMatch[1];
      const end = caseMatch[2];
      
      // Extract the content of this statement by counting parentheses
      let content = '';
      let parenCount = 1;
      let j = i + 1;
      
      while (j < lines.length && parenCount > 0) {
        const nextLine = lines[j];
        content += nextLine + '\n';
        
        // Count opening and closing parentheses
        const openCount = (nextLine.match(/\(/g) || []).length;
        const closeCount = (nextLine.match(/\)/g) || []).length;
        parenCount += openCount - closeCount;
        
        j++;
      }
      
      statements.push({
        type: 'case',
        start: start,
        end: end,
        raw: content,
        sourceCode: sourceCode // Pass the source code for condition extraction
      });
      
      // Skip the lines we've already processed
      i = j - 1;
    }
  }
  
  return {
    type: 'Program',
    body: statements
  };
}

/**
 * Extract Pascal AST using the local tree-sitter-pascal grammar via CLI
 * @param {string} sourceCode - Pascal source code
 * @returns {Object} - Parsed (simplified) AST
 */
export function extractPascal(sourceCode) {
  try {
    const tempFile = join(tmpdir(), `temp-pascal-${Date.now()}.pas`);

    try {
      // Write source to a temporary file
      writeFileSync(tempFile, sourceCode);

      // Use the tree-sitter CLI from the local tree-sitter-pascal clone
      const cliOutput = execSync(`npx tree-sitter parse "${tempFile}"`, {
        cwd: join(__dirname, '../../../../../parsers/tree-sitter-pascal'),
        encoding: 'utf8'
      });

      // Clean up temp file
      unlinkSync(tempFile);

      // Convert CLI output into a simplified AST structure
      return parsePascalCLIOutput(cliOutput, sourceCode);
    } catch (cliError) {
      console.error('Pascal CLI parsing failed:', cliError.message);
      try {
        unlinkSync(tempFile);
      } catch {}
      throw cliError;
    }
  } catch (error) {
    console.error('Error extracting Pascal AST:', error);
    return {
      type: 'Program',
      body: []
    };
  }
}