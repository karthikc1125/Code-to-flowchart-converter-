import { extractTypeScript } from '../extractors/typescript-extractor.mjs';
import { normalizeTypescriptAst } from '../normalizer/normalize-typescript.mjs';
import { walk } from '../walkers/walk.mjs';
import { ctx } from '../mermaid/context.mjs';
import { finalizeFlowContext } from '../mermaid/finalize-context.mjs';

// Import TypeScript mapping functions
import { mapIfStatement } from '../conditional/if.mjs';
import { mapIfElseStatement } from '../conditional/if-else/if-else.mjs';
import { mapIfElseIfStatement } from '../conditional/if-elseif/if-elseif.mjs';
import { mapSwitchStatement, mapCase, mapDefault } from '../conditional/switch/switch.mjs';
import { completeSwitch } from '../mappings/common/common.mjs';

/**
 * Map TypeScript nodes to Mermaid flowchart nodes
 * @param {Object} node - Normalized TypeScript node
 * @param {Object} ctx - Context for flowchart generation
 * @param {Function} mapper - Recursive mapper function
 */
export function mapNodeTypescript(node, ctx, mapper) {
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
    case "IO": 
      // Handle IO statements (console.log)
      if (node.text) {
        const id = ctx.next();
        // Remove quotes from the text for cleaner display
        let displayText = node.text;
        if (displayText.includes('console.log')) {
          // Extract content between parentheses and remove quotes
          const match = displayText.match(/console\.log\s*\((.*)\)/);
          if (match && match[1]) {
            displayText = match[1].trim();
            // Remove surrounding quotes if present
            if ((displayText.startsWith('"') && displayText.endsWith('"')) || 
                (displayText.startsWith("'") && displayText.endsWith("'"))) {
              displayText = displayText.substring(1, displayText.length - 1);
            }
          }
        }
        ctx.add(id, `[/"console.log(${displayText})"/]`); // IO shape
        // Use branch connection logic if we're in a branch, otherwise use direct connection
        if (typeof ctx.handleBranchConnection === 'function' && ctx.currentIf && ctx.currentIf()) {
          ctx.handleBranchConnection(id);
        } else {
          if (ctx.last) {
            ctx.addEdge(ctx.last, id);
          }
          ctx.setLast(id);
        }
      }
      break;
    case "Decl": 
      // Handle variable declarations
      if (node.text) {
        const id = ctx.next();
        ctx.add(id, `["${node.text}"]`); // Process shape
        // Use branch connection logic if we're in a branch, otherwise use direct connection
        if (typeof ctx.handleBranchConnection === 'function' && ctx.currentIf && ctx.currentIf()) {
          ctx.handleBranchConnection(id);
        } else {
          if (ctx.last) {
            ctx.addEdge(ctx.last, id);
          }
          ctx.setLast(id);
        }
      }
      break;
    case "Assign": 
      // Handle assignments
      if (node.text) {
        const id = ctx.next();
        ctx.add(id, `["${node.text}"]`); // Process shape
        // Use branch connection logic if we're in a branch, otherwise use direct connection
        if (typeof ctx.handleBranchConnection === 'function' && ctx.currentIf && ctx.currentIf()) {
          ctx.handleBranchConnection(id);
        } else {
          if (ctx.last) {
            ctx.addEdge(ctx.last, id);
          }
          ctx.setLast(id);
        }
      }
      break;
    case "Expr": 
      // Handle expressions
      // Special handling for break statements
      if (node.text === 'break;') {
        // Handle break statements in switch cases
        if (ctx.currentSwitchId) {
          // Create a break node
          const breakId = ctx.next();
          ctx.add(breakId, `["break;"\]`);
          
          // Connect to the previous statement
          if (ctx.last) {
            ctx.addEdge(ctx.last, breakId);
          }
          ctx.setLast(breakId);
          
          // Track this break statement for later connection to the end of the switch
          if (!ctx.pendingBreaks) {
            ctx.pendingBreaks = [];
          }
          
          // Get the current switch level
          const switchLevel = ctx.switchEndNodes ? ctx.switchEndNodes.length - 1 : 0;
          ctx.pendingBreaks.push({
            breakId: breakId,
            switchLevel: switchLevel,
            nextStatementId: 'NEXT_AFTER_SWITCH' // Will be resolved in finalize context
          });
          break;
        } else {
          // Break outside of switch (e.g., in loops) - treat as regular statement
          const id = ctx.next();
          ctx.add(id, `["break;"\]`);
          if (ctx.last) {
            ctx.addEdge(ctx.last, id);
          }
          ctx.setLast(id);
          break;
        }
      }
      
      if (node.text) {
        const id = ctx.next();
        ctx.add(id, `["${node.text}"]`); // Process shape
        // Use branch connection logic if we're in a branch, otherwise use direct connection
        if (typeof ctx.handleBranchConnection === 'function' && ctx.currentIf && ctx.currentIf()) {
          ctx.handleBranchConnection(id);
        } else {
          if (ctx.last) {
            ctx.addEdge(ctx.last, id);
          }
          ctx.setLast(id);
        }
      }
      break;
    case "Switch":
      // Handle switch statements
      return mapSwitchStatement(node, ctx, mapper);
    case "Case":
      // Handle case statements
      return mapCase(node, ctx, mapper);
    case "Default":
      // Handle default case
      return mapDefault(node, ctx, mapper);
    case "Break":
      // Handle break statements in switch cases
      if (ctx.currentSwitchId) {
        // Create a break node
        const breakId = ctx.next();
        ctx.add(breakId, `["break;"\]`);
        
        // Connect to the previous statement
        if (ctx.last) {
          ctx.addEdge(ctx.last, breakId);
        }
        ctx.setLast(breakId);
        
        // Track this break statement for later connection to the end of the switch
        if (!ctx.pendingBreaks) {
          ctx.pendingBreaks = [];
        }
        
        // Get the current switch level
        const switchLevel = ctx.switchEndNodes ? ctx.switchEndNodes.length - 1 : 0;
        ctx.pendingBreaks.push({
          breakId: breakId,
          switchLevel: switchLevel,
          nextStatementId: 'NEXT_AFTER_SWITCH' // Will be resolved in finalize context
        });
      } else {
        // Break outside of switch (e.g., in loops) - treat as regular statement
        const id = ctx.next();
        ctx.add(id, `["break;"\]`);
        if (ctx.last) {
          ctx.addEdge(ctx.last, id);
        }
        ctx.setLast(id);
      }
      break;
    default:
      // For unhandled node types, create a generic process node
      if (node.text) {
        const id = ctx.next();
        ctx.add(id, `["${node.text}"]`);
        // Use branch connection logic if we're in a branch, otherwise use direct connection
        if (typeof ctx.handleBranchConnection === 'function' && ctx.currentIf && ctx.currentIf()) {
          ctx.handleBranchConnection(id);
        } else {
          if (ctx.last) {
            ctx.addEdge(ctx.last, id);
          }
          ctx.setLast(id);
        }
      }
  }
}

/**
 * Generate VTU-style Mermaid flowchart from TypeScript source code
 * @param {string} sourceCode - TypeScript source code
 * @returns {string} - Mermaid flowchart
 */
export function generateFlowchart(sourceCode) {
  
  // 1. Extract AST using Tree-sitter
  const ast = extractTypeScript(sourceCode);
  
  // 2. Normalize AST to unified node types
  const normalized = normalizeTypescriptAst(ast);
  
  // 3. Create context for flowchart generation
  const context = ctx();
  
  // Define the recursive mapper function
  const mapper = (node, ctx) => {
    if (node && node.type) {
      mapNodeTypescript(node, ctx, mapper);
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