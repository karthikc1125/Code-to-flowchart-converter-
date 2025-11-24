/**
 * Common mapping utilities for TypeScript language
 */

/**
 * Link a new node to the previous node in the flow
 * @param {Object} ctx - Context for flowchart generation
 * @param {string} nodeId - ID of the new node to link
 * @param {string} [label] - Optional label for the edge
 */
export function linkNext(ctx, nodeId, label) {
  if (!ctx || !nodeId) return;
  
  // If there's a previous node, connect it to this node
  if (ctx.last) {
    ctx.addEdge(ctx.last, nodeId, label);
  }
  
  // Set this node as the last node for future connections
  ctx.last = nodeId;
}

/**
 * Complete a switch statement by connecting all case branches
 * @param {Object} ctx - Context for flowchart generation
 */
export function completeSwitch(ctx) {
  if (!ctx || typeof ctx.completeSwitch !== 'function') return;
  
  // Delegate to context's completeSwitch method
  ctx.completeSwitch();
}