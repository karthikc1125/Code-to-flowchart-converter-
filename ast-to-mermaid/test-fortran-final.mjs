import { generateFlowchart } from './src/mappings/languages/fortran/pipeline/flow.mjs';
import fs from 'fs';

const sourceCode = fs.readFileSync('../test-fortran-switch.f90', 'utf8');

try {
  const result = generateFlowchart(sourceCode);
  console.log(result);
} catch (error) {
  console.error('Error:', error);
}