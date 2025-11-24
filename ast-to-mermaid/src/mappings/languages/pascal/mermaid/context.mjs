// Context for Mermaid diagram generation
let nodeId = 2; // Start from 2 since N1 is reserved for start node

export function ctx() {
  const context = {
    nodes: [],
    edges: [],
    last: null,
    switchEndNodes: [],
    pendingBreaks: [],
    currentSwitchId: null,
    inLoop: false,
    loopContinueNode: null,
    deferredStatements: [],
    // If statement tracking
    ifStack: [],
    
    next() {
      return `N${nodeId++}`;
    },
    
    add(id, label) {
      this.nodes.push(`${id}${label}`);
    },
    
    addEdge(from, to, label = null) {
      if (label) {
        this.edges.push(`${from} -- ${label} --> ${to}`);
      } else {
        this.edges.push(`${from} --> ${to}`);
      }
    },
    
    setLast(id) {
      this.last = id;
    },
    
    // If statement management
    registerIf(conditionId, hasElse) {
      const frame = {
        conditionId,
        hasElse,
        then: { started: false, last: null },
        else: { started: false, last: null },
        activeBranch: null
      };
      this.ifStack.push(frame);
    },
    
    currentIf() {
      return this.ifStack[this.ifStack.length - 1] || null;
    },
    
    enterBranch(type) {
      const frame = this.currentIf();
      if (!frame) return;
      frame.activeBranch = type === 'else' ? 'else' : 'then';
    },
    
    exitBranch(type) {
      const frame = this.currentIf();
      if (!frame) return;
      if (frame.activeBranch === type) {
        frame.activeBranch = null;
      }
    },
    
    handleBranchConnection(nodeId, { skipEdge = false } = {}) {
      const frame = this.currentIf();
      if (!frame || !frame.activeBranch) return false;

      const branchInfo = frame[frame.activeBranch];
      if (!skipEdge) {
        if (!branchInfo.started) {
          const label = frame.activeBranch === 'then' ? 'Yes' : 'No';
          this.addEdge(frame.conditionId, nodeId, label);
        } else if (branchInfo.last) {
          this.addEdge(branchInfo.last, nodeId);
        }
      }

      branchInfo.started = true;
      branchInfo.last = nodeId;
      this.last = nodeId;
      return true;
    },
    
    completeIf() {
      const frame = this.ifStack.pop();
      if (!frame) return null;
      this.queueJoinForFrame(frame);
      
      // Check if this if was inside a parent if's branch
      const parentFrame = this.currentIf();
      if (parentFrame && parentFrame.activeBranch) {
        const parentBranch = parentFrame[parentFrame.activeBranch];
        // If the parent branch's last node is this if's condition,
        // it means this if was the first statement in the parent's branch.
        // Update the parent branch to have no single last node since joins are queued.
        if (parentBranch.last === frame.conditionId) {
          parentBranch.last = null;
        }
      }
      
      // Don't leave ctx.last pointing to this if's condition node
      // because that would cause the parent to think the branch ends at the condition
      // Instead, set it to null to indicate no single last node (joins are queued)
      this.last = null;
      
      return frame;
    },
    
    queueJoinForFrame(frame) {
      const edges = [];

      if (frame.then.last) {
        edges.push({ from: frame.then.last, label: null });
      } else {
        edges.push({ from: frame.conditionId, label: 'Yes' });
      }

      if (frame.hasElse) {
        if (frame.else.last) {
          edges.push({ from: frame.else.last, label: null });
        } else if (frame.else.started) {
          // Else branch was started but has no last node.
          // This means it contains only control flow structures (nested ifs)
          // that have queued their own joins. Don't add an edge from condition.
        } else {
          // Else branch was never started (empty), edge from condition
          edges.push({ from: frame.conditionId, label: 'No' });
        }
      } else {
        edges.push({ from: frame.conditionId, label: 'No' });
      }

      this.pendingJoins = this.pendingJoins || [];
      this.pendingJoins.push({ edges });
    },
    
    resolvePendingJoins(targetId) {
      if (!this.pendingJoins || this.pendingJoins.length === 0) return false;
      const joins = this.pendingJoins.splice(0);
      joins.forEach(join => {
        join.edges.forEach(({ from, label }) => {
          if (!from) return;
          if (label) {
            this.addEdge(from, targetId, label);
          } else {
            this.addEdge(from, targetId);
          }
        });
      });
      return joins.length > 0;
    },
    
    completeBranches() {
      // Handle any remaining pending joins
      if (this.pendingJoins && this.pendingJoins.length > 0) {
        // This would be handled when connecting to the end node
      }
    },
    
    emit() {
      return [
        'flowchart TD',
        ...this.nodes,
        ...this.edges
      ].join('\n');
    }
  };
  
  return context;
}