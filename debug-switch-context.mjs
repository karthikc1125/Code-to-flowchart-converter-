import { extractTypeScript } from './ast-to-mermaid/src/mappings/languages/typescript/extractors/typescript-extractor.mjs';
import { normalizeTypescriptAst } from './ast-to-mermaid/src/mappings/languages/typescript/normalizer/normalize-typescript.mjs';
import { ctx } from './ast-to-mermaid/src/mappings/languages/typescript/mermaid/context.mjs';
import { mapNodeTypescript } from './ast-to-mermaid/src/mappings/languages/typescript/pipeline/flow.mjs';
import { finalizeFlowContext } from './ast-to-mermaid/src/mappings/languages/typescript/mermaid/finalize-context.mjs';

// TypeScript code with switch statement
const typescriptCode = `
let x: number = 2;

switch (x) {
    case 1:
        console.log("x is 1");
        break;
    default:
        console.log("x is something else");
        break;
}

console.log("End of switch");
`;

console.log('Testing switch statement context...');

// Extract and normalize
const ast = extractTypeScript(typescriptCode);
const normalized = normalizeTypescriptAst(ast);

// Create context
const context = ctx();

// Define mapper
const mapper = (node, ctx) => {
  if (node && node.type) {
    mapNodeTypescript(node, ctx, mapper);
  }
};

// Process nodes
if (normalized) {
  let mainProgramBody = null;
  if (normalized.type === 'Program') {
    mainProgramBody = normalized.body;
  }
  
  if (mainProgramBody) {
    mainProgramBody.forEach(node => {
      mapper(node, context);
    });
  } else {
    mapper(normalized, context);
  }
}

console.log('Context before finalize:');
console.log('Nodes:', context.nodes);
console.log('Edges:', context.edges);
console.log('Pending breaks:', context.pendingBreaks);
console.log('Last:', context.last);

// Finalize context
finalizeFlowContext(context);

console.log('\nContext after finalize:');
console.log('Nodes:', context.nodes);
console.log('Edges:', context.edges);
console.log('Pending breaks:', context.pendingBreaks);
console.log('Last:', context.last);