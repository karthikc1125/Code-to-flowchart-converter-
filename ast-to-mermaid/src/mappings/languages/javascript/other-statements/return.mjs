import { shapes } from "../mermaid/shapes.mjs";
import { linkNext } from "../mappings/common/common.mjs";

// Helper function to create return shape with text
const returnShape = (text) => shapes.return.replace('{}', text);

/**
 * Map return statement to Mermaid flowchart nodes
 * Creates process node for return operation
 * @param {Object} node - Normalized return node
 * @param {Object} ctx - Context for flowchart generation
 */
export function mapReturn(node, ctx) {
  if (!node || !ctx) return;
  
  // Create return node
  const returnId = ctx.next();
  const returnText = `return ${node.value || ""}`.trim();
  ctx.add(returnId, returnShape(returnText));
  
  // Connect to previous node and set as last
  linkNext(ctx, returnId);
}