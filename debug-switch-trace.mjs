import { extractTypeScript } from './ast-to-mermaid/src/mappings/languages/typescript/extractors/typescript-extractor.mjs';
import { normalizeTypescriptAst } from './ast-to-mermaid/src/mappings/languages/typescript/normalizer/normalize-typescript.mjs';
import { ctx } from './ast-to-mermaid/src/mappings/languages/typescript/mermaid/context.mjs';

// Simple switch statement
const typescriptCode = `
switch (x) {
    case 1:
        break;
    default:
        break;
}
`;

console.log('Extracting and normalizing...');
const ast = extractTypeScript(typescriptCode);
const normalized = normalizeTypescriptAst(ast);

console.log('Normalized AST:');
console.log(JSON.stringify(normalized, null, 2));

// Create context and trace operations
const context = ctx();

// Override addEdge to trace connections
const originalAddEdge = context.addEdge.bind(context);
context.addEdge = function(from, to, label) {
  console.log(`Adding edge: ${from} -->${label ? `|${label}|` : ' '} ${to}`);
  return originalAddEdge(from, to, label);
};

// Override add to trace node creation
const originalAdd = context.add.bind(context);
context.add = function(id, shape) {
  console.log(`Adding node: ${id}${shape}`);
  return originalAdd(id, shape);
};

// Override setLast to trace last node changes
const originalSetLast = context.setLast.bind(context);
context.setLast = function(id) {
  console.log(`Setting last node to: ${id}`);
  return originalSetLast(id);
};

console.log('\nProcessing nodes...');

// Process the switch statement manually to trace what happens
if (normalized && normalized.body && normalized.body[0]) {
  const switchNode = normalized.body[0];
  console.log('Processing switch node:', switchNode.type);
  
  // Import and call the switch mapper
  import('./ast-to-mermaid/src/mappings/languages/typescript/conditional/switch/switch.mjs')
    .then(({ mapSwitchStatement }) => {
      const mapper = (node, ctx) => {
        console.log(`Mapping node type: ${node.type}`);
        if (node.type === 'Case' || node.type === 'Default') {
          import('./ast-to-mermaid/src/mappings/languages/typescript/conditional/switch/switch.mjs')
            .then(({ mapCase, mapDefault }) => {
              if (node.type === 'Case') {
                console.log('Calling mapCase');
                mapCase(node, ctx, mapper);
              } else {
                console.log('Calling mapDefault');
                mapDefault(node, ctx, mapper);
              }
            });
        }
      };
      
      console.log('Calling mapSwitchStatement');
      mapSwitchStatement(switchNode, context, mapper);
      
      console.log('\nFinal context state:');
      console.log('- currentSwitchId:', context.currentSwitchId);
      console.log('- nodes:', context.nodes);
      console.log('- edges:', context.edges);
      console.log('- last:', context.last);
    });
}