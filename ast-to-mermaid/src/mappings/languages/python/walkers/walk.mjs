export function walk(node, ctx) {
  if (!node) return;

  // Handle the current node
  if (ctx && typeof ctx.handle === 'function') {
    ctx.handle(node);
  }

  // Special handling for Match statements to manage switch cases properly
  if (node.type === 'Match') {
    // Store the last node before the match statement
    const lastBeforeMatch = ctx.last;
    
    // Get the actual context object
    const actualCtx = typeof ctx.getContext === 'function' ? ctx.getContext() : ctx;
    
    // Track if this is a switch context
    const wasInSwitch = actualCtx.inSwitch;
    actualCtx.inSwitch = true;
    
    // Walk each case in the match statement
    if (node.cases && Array.isArray(node.cases)) {
      node.cases.forEach(caseNode => {
        walk(caseNode, ctx);
      });
    }
    
    // Reset switch context
    actualCtx.inSwitch = wasInSwitch;
    
    return;
  }

  // Special handling for Case nodes to avoid duplicate processing
  if (node.type === 'Case') {
    // Store the last node before processing the case
    const lastBeforeCase = ctx.last;
    
    // Process the body separately to avoid duplicate processing
    if (node.body) {
      if (Array.isArray(node.body)) {
        node.body.forEach(child => walk(child, ctx));
      } else {
        walk(node.body, ctx);
      }
    }
    
    // If we're in a switch context, track the end of this case
    // Get the actual context object
    const actualCtx = typeof ctx.getContext === 'function' ? ctx.getContext() : ctx;
    if (actualCtx.inSwitch && actualCtx.last && actualCtx.last !== lastBeforeCase) {
      if (!actualCtx.caseEndNodes) {
        actualCtx.caseEndNodes = [];
      }
      actualCtx.caseEndNodes.push(actualCtx.last);
    }
    
    return;
  }

  // Special handling for If statements to manage branches properly
  if (node.type === 'If') {
    // Walk the then branch
    if (node.then) {
      if (typeof ctx?.enterBranch === 'function') {
        ctx.enterBranch('then');
      }
      
      // If then is a block, walk its body
      if (node.then.type === 'Block' && node.then.body) {
        if (Array.isArray(node.then.body)) {
          node.then.body.forEach(child => walk(child, ctx));
        } else {
          walk(node.then.body, ctx);
        }
      } else {
        walk(node.then, ctx);
      }
      
      if (typeof ctx?.exitBranch === 'function') {
        ctx.exitBranch('then');
      }
    }

    // Walk the else branch
    if (node.else) {
      if (typeof ctx?.enterBranch === 'function') {
        ctx.enterBranch('else');
      }
      
      // If else is a block, walk its body
      if (node.else.type === 'Block' && node.else.body) {
        if (Array.isArray(node.else.body)) {
          node.else.body.forEach(child => walk(child, ctx));
        } else {
          walk(node.else.body, ctx);
        }
      } else if (node.else.type === 'If') {
        // Handle elif (nested if in else branch)
        walk(node.else, ctx);
      } else {
        walk(node.else, ctx);
      }
      
      if (typeof ctx?.exitBranch === 'function') {
        ctx.exitBranch('else');
      }
    }

    if (typeof ctx?.completeIf === 'function') {
      ctx.completeIf();
    }

    return;
  }

  // General body processing for other node types
  if (node.body) {
    if (Array.isArray(node.body)) {
      node.body.forEach(child => walk(child, ctx));
    } else {
      walk(node.body, ctx);
    }
  }
  
  if (node.then) walk(node.then, ctx);
  if (node.else) walk(node.else, ctx);
  // Note: We don't walk node.init, node.cond, node.update here
  // because they are handled by the mapping functions that create
  // decision nodes with combined text

  if (node.value) {
    // return statements
  }
}