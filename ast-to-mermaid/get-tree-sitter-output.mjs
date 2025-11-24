import { execSync } from 'child_process';
import { writeFileSync, unlinkSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const sourceCode = readFileSync('test-if.pas', 'utf8');
const tempFile = join(tmpdir(), `temp-pascal-${Date.now()}.pas`);

try {
  // Write source to a temporary file
  writeFileSync(tempFile, sourceCode);

  // Use the tree-sitter CLI from the local tree-sitter-pascal clone
  const cliOutput = execSync(`npx tree-sitter parse "${tempFile}"`, {
    cwd: join('./parsers/tree-sitter-pascal'),
    encoding: 'utf8'
  });

  console.log('Tree-sitter CLI output:');
  console.log(cliOutput);

  // Clean up temp file
  unlinkSync(tempFile);
} catch (error) {
  console.error('Error:', error.message);
  try {
    unlinkSync(tempFile);
  } catch {}
}