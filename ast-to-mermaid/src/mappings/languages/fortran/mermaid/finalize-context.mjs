export function finalizeFlowContext(context) {
  if (!context) return null;

  // Handle switch case connections
  // Connect all switch case ends directly to the next statement
  if (context.switchCaseEnds && context.switchCaseEnds.length > 0) {
    // Find the next node after the switch statement
    let nextNodeId = null;
    
    // Method 1: Look at nodeOrder to find the next node after case ends
    if (context.nodes && context.nodeOrder && context.nodeOrder.length > 0) {
      // Find the maximum index of case end nodes
      let maxCaseEndIndex = -1;
      context.switchCaseEnds.forEach(caseEndId => {
        const index = context.nodeOrder.indexOf(caseEndId);
        if (index > maxCaseEndIndex) {
          maxCaseEndIndex = index;
        }
      });
      
      // The next node in order is our target
      if (maxCaseEndIndex !== -1 && maxCaseEndIndex < context.nodeOrder.length - 1) {
        nextNodeId = context.nodeOrder[maxCaseEndIndex + 1];
      }
    }
    
    // Method 2: If we couldn't find it through nodeOrder, try to find it through context.last
    if (!nextNodeId && context.last) {
      nextNodeId = context.last;
    }
    
    // Method 3: If we still couldn't find it, try to deduce it from existing edges
    if (!nextNodeId && context.edges && context.edges.length > 0) {
      // Look for a node that case end nodes might already be connecting to
      const targetNodes = new Set();
      context.switchCaseEnds.forEach(caseEndId => {
        context.edges.forEach(edge => {
          const match = edge.match(new RegExp(`${caseEndId} --> (N\\d+)`));
          if (match) {
            targetNodes.add(match[1]);
          }
        });
      });
      
      // If all case ends connect to the same node, that's our target
      if (targetNodes.size === 1) {
        nextNodeId = Array.from(targetNodes)[0];
      }
    }
    
    // Connect each case end to the next statement
    if (nextNodeId) {
      context.switchCaseEnds.forEach(caseEndId => {
        // Only add the edge if it doesn't already exist
        const edgeExists = context.edges && context.edges.some(edge => 
          edge === `${caseEndId} --> ${nextNodeId}` || edge.startsWith(`${caseEndId} --> ${nextNodeId} `)
        );
        
        if (!edgeExists) {
          context.addEdge(caseEndId, nextNodeId);
        }
      });
    }
  }

  // Complete any remaining branches
  if (typeof context.completeBranches === 'function') {
    context.completeBranches();
  }

  // Handle switch break statements properly
  // They should connect to the next statement after the switch block, not to the end node
  if (context.pendingJoins && context.pendingJoins.length > 0) {
    // Check if these pending joins are from switch break statements
    let hasSwitchBreaks = false;
    const breakNodeIds = new Set();
    
    // Look for break statements in the nodes
    context.nodes.forEach(node => {
      const match = node.match(/^(N\d+)\["break;"\]/);
      if (match) {
        breakNodeIds.add(match[1]);
      }
    });
    
    // Check if any pending joins are from break statements
    context.pendingJoins.forEach(join => {
      join.edges.forEach(edge => {
        if (breakNodeIds.has(edge.from)) {
          hasSwitchBreaks = true;
        }
      });
    });
    
    if (hasSwitchBreaks) {
      // For switch break statements, we need to connect them to the next statement
      // Find the next statement after switch blocks
      if (context.nodes && context.edges) {
        // Get all node IDs in order
        const nodeInfos = [];
        context.nodes.forEach(node => {
          const nodeIdMatch = node.match(/^(N\d+)/);
          if (nodeIdMatch) {
            nodeInfos.push({id: nodeIdMatch[1], node: node});
          }
        });
        
        // Find switch statements and their positions
        const switchPositions = [];
        nodeInfos.forEach((nodeInfo, index) => {
          if (nodeInfo.node.includes('select case')) {
            switchPositions.push(index);
          }
        });
        
        // For each switch statement, find the first statement after it that's not part of the switch
        if (switchPositions.length > 0) {
          switchPositions.forEach(switchIndex => {
            const switchId = nodeInfos[switchIndex].id;
            
            // Find all case statements that connect from this switch
            const caseEdges = context.edges.filter(edge => 
              edge.startsWith(`${switchId} -->`)
            );
            
            // Find the first non-switch-related statement after the switch
            let nextStatementId = null;
            for (let i = switchIndex + 1; i < nodeInfos.length; i++) {
              const nodeInfo = nodeInfos[i];
              const nodeId = nodeInfo.id;
              
              // Check if this node is part of the switch
              const isSwitchRelated = 
                nodeInfo.node.includes('case ') || 
                nodeInfo.node.includes('default:') ||
                caseEdges.some(edge => edge.includes(`--> ${nodeId}`));
              
              if (!isSwitchRelated) {
                nextStatementId = nodeId;
                break;
              }
            }
            
            // If we found the next statement, connect all pending joins to it
            if (nextStatementId) {
              const joins = context.pendingJoins.splice(0);
              joins.forEach(join => {
                join.edges.forEach(({ from, label }) => {
                  if (!from) return;
                  if (label) {
                    context.addEdge(from, nextStatementId, label);
                  } else {
                    context.addEdge(from, nextStatementId);
                  }
                });
              });
            }
          });
        }
      }
    }
  }

  // If we still have pending joins, resolve them to the end node
  if (context.pendingJoins && context.pendingJoins.length > 0) {
    const endId = context.next();
    context.add(endId, '(["end"])');
    
    const joins = context.pendingJoins.splice(0);
    joins.forEach(join => {
      join.edges.forEach(({ from, label }) => {
        if (!from) return;
        if (label) {
          context.addEdge(from, endId, label);
        } else {
          context.addEdge(from, endId);
        }
      });
    });
    
    return endId;
  }

  // Note: pendingBreaks should be empty here if completeSwitch was called properly
  // Only connect breaks that are still pending (shouldn't happen in normal flow)
  if (context.pendingBreaks && context.pendingBreaks.length > 0) {
    const endId = context.next();
    context.add(endId, '(["end"])');
    
    context.pendingBreaks.forEach(breakInfo => {
      // Connect orphaned breaks directly to end
      context.addEdge(breakInfo.breakId, endId);
    });
    context.pendingBreaks = [];
    
    return endId;
  }

  // Add end node and connect last node to it
  const endId = context.next();
  context.add(endId, '(["end"])');
  
  if (context.last) {
    context.addEdge(context.last, endId);
  }
  
  return endId;
}