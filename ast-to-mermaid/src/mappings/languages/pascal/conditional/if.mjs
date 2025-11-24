import { shapes } from "../mermaid/shapes.mjs";
import { linkNext } from "../../c/mappings/common/common.mjs";

// Helper function to create decision shape with text
const decisionShape = (text) => shapes.decision.replace('{}', text);

// Helper function to create process shape with text
const processShape = (text) => shapes.process.replace('{}', text);

/**
 * Map if statement to Mermaid flowchart nodes
 * Creates decision node with Yes/No branches
 * @param {Object} node - Normalized if statement node
 * @param {Object} ctx - Context for flowchart generation
 */
export function mapIf(node, ctx) {
  if (!node || !ctx) return;
  
  // Create decision node for condition
  const conditionId = ctx.next();
  
  // Remove parentheses from condition text
  let conditionText = node.cond?.text || "condition";
  if (conditionText.startsWith('(') && conditionText.endsWith(')')) {
    conditionText = conditionText.substring(1, conditionText.length - 1);
  }
  
  // Determine if this is an "if" or "else if" statement
  // Check if we're currently in an else branch of a parent if
  const currentIf = ctx.currentIf && typeof ctx.currentIf === 'function' ? ctx.currentIf() : null;
  const isElseIf = currentIf && currentIf.activeBranch === 'else';
  const prefix = isElseIf ? 'else if ' : 'if ';
  
  // Add prefix to show if/else if
  const labelText = prefix + conditionText;
  ctx.add(conditionId, decisionShape(labelText));
  
  // Connect to previous node using shared linking logic
  linkNext(ctx, conditionId);
  
  // Register if context for branch handling
  if (typeof ctx.registerIf === 'function') {
    ctx.registerIf(conditionId, !!node.else);
  }
  
  // Set the condition node as the last node
  ctx.last = conditionId;
}