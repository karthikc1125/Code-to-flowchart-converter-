import { extractJavaScript } from '../extractors/javascript-extractor.mjs';
import { normalizeJavaScript } from '../normalizer/normalize-javascript.mjs';
import { walk } from '../walkers/walk.mjs';
import { ctx } from '../mermaid/context.mjs';
import { finalizeFlowContext } from '../mermaid/finalize-context.mjs';

// Import mapping functions (using JavaScript-specific mappings)
import { mapIfStatement } from '../conditional/if.mjs';
import { mapIfElseStatement } from '../conditional/if-else/if-else.mjs';
import { mapIfElseIfStatement } from '../conditional/if-elseif/if-elseif.mjs';
import { mapSwitchStatement, mapCase, mapDefault } from '../conditional/switch/switch.mjs';
import { mapFor } from '../../c/loops/for.mjs';
import { mapWhile } from '../../c/loops/while.mjs';
import { mapFunction } from '../../c/functions/function-definition.mjs';
import { mapReturn } from '../../c/other-statements/return.mjs';
import { mapAssign } from '../../c/other-statements/assign.mjs';
import { mapIO } from '../../c/io/io.mjs';
import { mapDecl } from '../../c/other-statements/declaration.mjs';
import { mapExpr } from '../../c/other-statements/expression.mjs';
import { mapBreakStatement } from '../other-statements/break.mjs';
import { completeSwitch } from '../mappings/common/common.mjs';

/**
 * Map JavaScript nodes to Mermaid flowchart nodes
 * @param {Object} node - Normalized JavaScript node
 * @param {Object} ctx - Context for flowchart generation
 * @param {Function} mapper - Recursive mapper function
 */
export function mapNodeJavaScript(node, ctx, mapper) {
  switch (node.type) {
    case "If": 
      // Check if this is a simple if, if-else, or if-else-if statement
      if (node.alternate) {
        if (node.alternate.type === 'If') {
          // This is an if-else-if statement
          return mapIfElseIfStatement(node, ctx, mapper);
        } else {
          // This is an if-else statement
          return mapIfElseStatement(node, ctx, mapper);
        }
      } else {
        // This is a simple if statement
        return mapIfStatement(node, ctx, mapper);
      }
    case "Switch": return mapSwitchStatement(node, ctx, mapper);
    case "Case": 
      // Map the case and process its consequent statements
      return mapCase(node, ctx, mapper);
    case "Default": 
      // Map the default and process its consequent statements
      return mapDefault(node, ctx, mapper);
    case "For": return mapFor(node, ctx);
    case "While": return mapWhile(node, ctx);
    case "Function": return mapFunction(node, ctx);
    case "Return": return mapReturn(node, ctx);
    case "Assign": return mapAssign(node, ctx);
    case "IO": return mapIO(node, ctx);
    case "Decl": return mapDecl(node, ctx);
    case "Expr": return mapExpr(node, ctx);
    case "Break": return mapBreakStatement(node, ctx);
  }
}

/**
 * Generate VTU-style Mermaid flowchart from JavaScript source code
 * @param {string} sourceCode - JavaScript source code
 * @returns {string} - Mermaid flowchart
 */
export function generateFlowchart(sourceCode) {
  
  // 1. Extract AST using Tree-sitter
  const ast = extractJavaScript(sourceCode);
  
  // 2. Normalize AST to unified node types
  const normalized = normalizeJavaScript(ast);
  
  // 3. Create context for flowchart generation
  const context = ctx();
  
  // Define the recursive mapper function
  const mapper = (node, ctx) => {
    if (node && node.type) {
      mapNodeJavaScript(node, ctx, mapper);
      // After processing a switch statement, complete it to connect break statements
      if (node.type === 'Switch') {
        completeSwitch(ctx);
      }
    }
  };
  
  // Manually set the start node
  // The context.emit() method already adds START and END nodes
  
  // 4. Walk and generate nodes using mapping functions
  if (normalized) {
    // Find the main program and process its body directly
    let mainProgramBody = null;
    
    // Check if normalized is the main program itself
    if (normalized.type === 'Program') {
      mainProgramBody = normalized.body;
    }
    
    // If we found the main program, process its body directly
    if (mainProgramBody) {
      // Walk each node in the main program's body
      mainProgramBody.forEach(node => {
        mapper(node, context);
      });
    } else {
      // If no main program found, walk the entire normalized AST
      mapper(normalized, context);
    }
  }
  
  // Finalize the context
  finalizeFlowContext(context);
  
  // 5. Emit final Mermaid flowchart
  return context.emit();
}