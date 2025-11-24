export function walk(node, ctx) {
  if (!node) return;

  // Handle the current node
  if (ctx && typeof ctx.handle === 'function') {
    ctx.handle(node);
  }

  // Process node bodies for all node types, not just specific ones
  if (node.body) {
    if (Array.isArray(node.body)) {
      node.body.forEach(child => walk(child, ctx));
    } else {
      walk(node.body, ctx);
    }
  }
  
  // Special handling for If nodes to process then and else branches
  if (node.type === 'If') {
    if (node.then) {
      // Process then branch
      if (typeof ctx?.enterBranch === 'function') {
        ctx.enterBranch('then');
        walk(node.then, ctx);
        if (typeof ctx.exitBranch === 'function') {
          ctx.exitBranch('then');
        }
      }
    }
    
    if (node.else) {
      // Process else branch
      if (typeof ctx?.enterBranch === 'function') {
        ctx.enterBranch('else');
        walk(node.else, ctx);
        if (typeof ctx.exitBranch === 'function') {
          ctx.exitBranch('else');
        }
      }
    }
    
    // Complete the if statement
    if (typeof ctx?.completeIf === 'function') {
      ctx.completeIf();
    }
  }
  
  // Handle then and else properties directly (for normalized nodes)
  if (node.then && node.type !== 'If') walk(node.then, ctx);
  if (node.else && node.type !== 'If') walk(node.else, ctx);
  
  // Note: We don't walk node.init, node.cond, node.update here
  // because they are handled by the mapping functions that create
  // decision nodes with combined text

  if (node.value) {
    // return statements
  }
}