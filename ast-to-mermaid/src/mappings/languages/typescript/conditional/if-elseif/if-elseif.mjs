import shapes from "../../mermaid/shapes.mjs";
import { linkNext } from "../../../../languages/c/mappings/common/common.mjs";

// Helper function to create decision shape with text
const decisionShape = (text) => shapes.decision.replace('{}', text);

/**
 * Map if-elseif statement to Mermaid flowchart nodes
 * Creates decision node with Yes / No branches
 * @param { Object } node - Normalized if-elseif statement node
 * @param { Object } ctx - Context for flowchart generation
 * @param { Function } mapper - Function to map child nodes
 */
export function mapIfElseIfStatement(node, ctx, mapper) {
  if (!node || !ctx) return;

  // Create decision node for condition
  const conditionId = ctx.next();

  // Determine if this is an "if" or "else if" statement
  // Check if we're currently in an else branch of a parent if
  const currentIf = ctx.currentIf && typeof ctx.currentIf === 'function' ? ctx.currentIf() : null;
  const isElseIf = currentIf && currentIf.activeBranch === 'else';
  const prefix = isElseIf ? 'else if ' : 'if ';

  // Remove parentheses from condition text
  let conditionText = node.test?.text || "condition";
  if (conditionText.startsWith('(') && conditionText.endsWith(')')) {
    conditionText = conditionText.substring(1, conditionText.length - 1);
  }

  // Add prefix to show if/else if
  const labelText = prefix + conditionText;
  ctx.add(conditionId, decisionShape(labelText));

  // Connect to previous node using shared linking logic
  // But don't connect sequentially if this is an else if statement
  if (!isElseIf) {
    linkNext(ctx, conditionId);
  }

  // Register if context for branch handling
  if (typeof ctx.registerIf === 'function') {
    ctx.registerIf(conditionId, !!node.alternate);
  }

  // Process the consequent (then) branch
  if (node.consequent) {
    // Enter the then branch
    if (typeof ctx.enterBranch === 'function') {
      ctx.enterBranch('then');
    }

    // Process statements in the consequent block
    if (node.consequent.body && Array.isArray(node.consequent.body)) {
      node.consequent.body.forEach(stmt => {
        if (stmt && mapper) {
          mapper(stmt, ctx);
        }
      });
    } else if (mapper) {
      // Handle single statement (not in a block)
      mapper(node.consequent, ctx);
    }

    // Exit the then branch
    if (typeof ctx.exitBranch === 'function') {
      ctx.exitBranch('then');
    }
  }

  // Process the alternate (else if/else) branch
  if (node.alternate) {
    // Enter the else branch
    if (typeof ctx.enterBranch === 'function') {
      ctx.enterBranch('else');
    }

    // Process the alternate statement (could be another if statement or a block)
    if (mapper) {
      // If this is another if statement, we need to connect the No branch directly
      if (node.alternate.type === 'If') {
        // For if-else-if chains, we need to connect the No branch directly
        // We'll temporarily override the addEdge function to capture when
        // the next condition is added, then connect the No branch to it
        const originalAddEdge = ctx.addEdge;
        let nextConditionId = null;

        // Temporarily override the add function to capture the next condition ID
        const originalAdd = ctx.add;
        ctx.add = function (id, shape) {
          // If this is a decision node (contains '{'), capture its ID
          if (shape && shape.includes('{') && !nextConditionId) {
            nextConditionId = id;
          }
          return originalAdd.call(this, id, shape);
        };

        // Temporarily override addEdge to prevent the automatic No branch connection
        ctx.addEdge = function (from, to, label) {
          // If this is trying to connect the current condition's No branch,
          // and we're about to connect to the next condition, skip it
          if (from === conditionId && label === 'No' && nextConditionId && to === nextConditionId) {
            // This is the connection we want to make, so allow it
            return originalAddEdge.call(this, from, to, label);
          } else if (from === conditionId && label === 'No') {
            // This is an automatic connection we want to prevent
            // Don't call the original addEdge
            return;
          } else {
            // For all other connections, use the original function
            return originalAddEdge.call(this, from, to, label);
          }
        };

        mapper(node.alternate, ctx);

        // If we captured the next condition ID, connect the No branch to it
        if (nextConditionId) {
          ctx.addEdge(conditionId, nextConditionId, 'No');
        }

        // Restore the original functions
        ctx.add = originalAdd;
        ctx.addEdge = originalAddEdge;
      } else {
        // Handle else block
        if (node.alternate.body && Array.isArray(node.alternate.body)) {
          node.alternate.body.forEach(stmt => {
            if (stmt && mapper) {
              mapper(stmt, ctx);
            }
          });
        } else {
          mapper(node.alternate, ctx);
        }
      }
    }

    // Exit the else branch
    if (typeof ctx.exitBranch === 'function') {
      ctx.exitBranch('else');
    }
  }

  // Complete the if statement and handle branch merging
  if (typeof ctx.completeIf === 'function') {
    ctx.completeIf();
  }
}