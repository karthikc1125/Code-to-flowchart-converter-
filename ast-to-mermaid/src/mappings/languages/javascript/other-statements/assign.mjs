import { process } from "../mappings/common/common.mjs";
import { linkNext } from "../mappings/common/common.mjs";

export function mapAssign(node, ctx) {
  // If we're in a loop, defer this statement until after control flow convergence
  if (ctx.inLoop && ctx.deferredStatements) {
    ctx.deferredStatements.push({
      type: 'assign',
      node: node,
      text: node.text
    });
    return;
  }
  
  const id = ctx.next();
  ctx.add(id, process(node.text));
  
  // Connect to previous node and set as last
  linkNext(ctx, id);
}