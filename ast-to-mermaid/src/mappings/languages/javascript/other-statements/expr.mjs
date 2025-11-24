import { shapes } from "../mermaid/shapes.mjs";
import { linkNext } from "../mappings/common/common.mjs";

// Helper function to create process shape with text
const processShape = (text) => shapes.process.replace('{}', text);

/**
 * Map expression statement to Mermaid flowchart nodes
 * Creates process node for expression evaluation
 * @param {Object} node - Normalized expression node
 * @param {Object} ctx - Context for flowchart generation
 */
export function mapExpr(node, ctx) {
  if (!node || !ctx) return;
  
  // Create process node for expression
  const exprId = ctx.next();
  const exprText = node.text || "expression";
  ctx.add(exprId, processShape(exprText));
  
  // Connect to previous node and set as last
  linkNext(ctx, exprId);
}