import { extractPascal } from '../extractors/pascal-extractor.mjs';
import { normalizePascal } from '../normalizer/normalize-pascal.mjs';
import { mapNodePascal } from '../map-node-pascal.mjs';
import { walk } from '../walkers/walk.mjs';
import { ctx } from '../mermaid/context.mjs';

/**
 * Generate VTU-style Mermaid flowchart from Pascal source code
 * @param {string} sourceCode - Pascal source code
 * @returns {string} - Mermaid flowchart
 */
export function generateFlowchart(sourceCode) {
  
  // 1. Extract AST using Tree-sitter
  const ast = extractPascal(sourceCode);
  
  // 2. Normalize AST to unified node types
  const normalized = normalizePascal(ast);
  
  // 3. Create context for flowchart generation
  const context = ctx();
  
  // Manually set the start node
  context.add('N1', '(["start"])');
  context.setLast('N1');
  
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
      // Create a walker context that uses the mapping functions
      const walkerContext = {
        handle: (node) => {
          if (node && node.type) {
            // Use the mapping function to add nodes to the context
            mapNodePascal(node, context);
          }
        }
      };
      
      // Walk each node in the main program's body
      mainProgramBody.forEach(node => {
        walk(node, walkerContext);
      });
    } else {
      // If no main program found, walk the entire normalized AST
      const walkerContext = {
        handle: (node) => {
          if (node && node.type) {
            // Use the mapping function to add nodes to the context
            mapNodePascal(node, context);
          }
        }
      };
      
      walk(normalized, walkerContext);
    }
  }
  
  // Complete any pending branches
  if (context.completeBranches) {
    context.completeBranches();
  }
  
  // Handle completed if statements with branch convergence
  if (context.completedIfStatements && context.completedIfStatements.length > 0) {
    context.completedIfStatements.forEach(ifStmt => {
      // Only handle if statements that have both branches completed
      if (ifStmt.thenBranchLast && ifStmt.elseBranchLast) {
        // Create a merge point for the if statement branches
        let mergeId = context.next();
        context.add(mergeId, '["assignment statement"]');  // Generic placeholder
        
        // Connect both branches to the merge point
        context.addEdge(ifStmt.thenBranchLast, mergeId);
        context.addEdge(ifStmt.elseBranchLast, mergeId);
        
        // Process any deferred statements at the merge point
        let lastNodeId = mergeId;
        if (context.deferredStatements && context.deferredStatements.length > 0) {
          context.deferredStatements.forEach(deferred => {
            if (deferred.type === 'assign') {
              const deferredId = context.next();
              context.add(deferredId, `[${deferred.text}]`);
              context.addEdge(lastNodeId, deferredId);
              lastNodeId = deferredId;
            }
          });
          // Clear deferred statements
          context.deferredStatements = [];
        }
        
        // If we're in a loop, connect the merge point back to the loop condition
        if (context.inLoop && context.loopContinueNode) {
          context.addEdge(lastNodeId, context.loopContinueNode);
        }
        
        // Set the merge point as the last node so subsequent nodes connect to it
        context.last = lastNodeId;
      }
    });
    
    // Clear the completed if statements
    context.completedIfStatements = [];
  }
  
  // Handle if statement branches
  // This is a simplified approach - in a full implementation, we would need
  // a more sophisticated control flow analysis
  
  // Create a merge point for if statement branches if needed
  if (context.ifConditionId) {
    // In a full implementation, we would create proper branch convergence
    // For now, we'll just complete any pending branches
    // If we have candidates for merge points, connect them
    if (context.ifMergeCandidate && context.last && context.ifMergeCandidate !== context.last) {
      // Connect the last branch node to the current last node
      // This is a simplified approach to branch convergence
    }
  }
  
  // Add end node
  const endId = context.next();
  context.add(endId, '(["end"])');
  
  // Resolve any pending joins (if statements, case statements, etc.)
  if (typeof context.resolvePendingJoins === 'function') {
    context.resolvePendingJoins(endId);
  }
  
  // For case statements, we need to connect all case end nodes to the end
  if (context.caseEndNodes && context.caseEndNodes.length > 0) {
    context.caseEndNodes.forEach(caseEndId => {
      context.addEdge(caseEndId, endId);
    });
    // Clear the last node since we've connected all case ends
    context.last = null;
  }
  
  // Connect last node to end node (only if there's a last node and it's not null)
  if (context.last) {
    context.addEdge(context.last, endId);
  }
  
  // 5. Emit final Mermaid flowchart
  return context.emit();
}