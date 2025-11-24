import { shapes } from "../../../../mermaid/shapes.mjs";
import { linkNext } from "../../../languages/c/mappings/common/common.mjs";

// Helper function to create decision shape with text
const decisionShape = (text) => shapes.decision.replace('{}', text);

/**
 * Map if statement to Mermaid flowchart nodes
 * Creates decision node with Yes/No branches
 * @param {Object} node - Normalized if statement node
 * @param {Object} ctx - Context for flowchart generation
 * @param {Function} mapper - Function to map child nodes
 */
export function mapIfStatement(node, ctx, mapper) {
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

  // Process the alternate (else) branch
  if (node.alternate) {
    // Enter the else branch
    if (typeof ctx.enterBranch === 'function') {
      ctx.enterBranch('else');
    }

    // Process statements in the alternate block
    if (node.alternate.body && Array.isArray(node.alternate.body)) {
      node.alternate.body.forEach(stmt => {
        if (stmt && mapper) {
          mapper(stmt, ctx);
        }
      });
    } else if (mapper) {
      // Handle single statement (not in a block)
      mapper(node.alternate, ctx);
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