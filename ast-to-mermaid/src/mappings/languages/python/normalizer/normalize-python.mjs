/**
 * Normalize Python AST to unified node types
 * @param {Object} node - AST node
 * @returns {Object} - Normalized node
 */
export function normalizePython(node) {
  if (!node) return null;
  
  // Convert Python-specific AST nodes to unified node types
  switch (node.type) {
    case "module":
      return {
        type: "Program",
        name: "main",
        body: node.children ? node.children.map(normalizePython).filter(Boolean) : []
      };
      
    case "function_definition":
      // Check if this is the main function
      const functionName = node.child(1)?.text || "unknown";
      if (functionName === "main") {
        // Get the block (body) of the function
        const bodyNode = node.child(4); // This should be the block
        return {
          type: "Program",
          name: "main",
          body: bodyNode ? normalizePython(bodyNode).body || [] : []
        };
      }
      return {
        type: "Function",
        name: functionName,
        body: node.children ? node.children.map(normalizePython).filter(Boolean) : []
      };
      
    case "block":
      // This is a block - process its children
      return {
        type: "Block",
        body: node.children ? node.children.map(normalizePython).filter(Boolean) : []
      };
      
    case "if_statement":
      // Handle if/elif/else chains properly
      const result = {
        type: "If",
        cond: normalizePython(node.child(1)), // condition is typically at index 1 (after 'if')
        then: normalizePython(node.child(3)), // then block is typically at index 3
        else: null
      };
      
      // Process elif and else clauses
      // In tree-sitter-python, elif clauses and else clauses are separate child nodes
      // We need to chain them properly: if -> elif -> elif -> else
      let currentIf = result;
      
      // Process all children starting from index 4
      for (let i = 4; i < node.childCount; i++) {
        const child = node.child(i);
        if (child && child.type === 'elif_clause') {
          // Convert elif to nested if structure
          const elifCond = normalizePython(child.child(1)); // condition after 'elif'
          const elifBody = normalizePython(child.child(3)); // body after ':'
          
          // Create a new if statement for the elif
          const elifIf = {
            type: "If",
            cond: elifCond,
            then: elifBody,
            else: null
          };
          
          // Attach this elif if to the current else chain
          currentIf.else = elifIf;
          currentIf = elifIf;
        } else if (child && child.type === 'else_clause') {
          // Handle else clause - this is the final else
          currentIf.else = normalizePython(child.child(2)); // body after 'else' and ':'
        }
      }
      
      return result;
      
    case "for_statement":
      return {
        type: "For",
        init: null, // Python for loops don't have traditional init
        cond: normalizePython(node.child(3)), // condition is typically at index 3
        update: null, // Python for loops don't have traditional update
        body: normalizePython(node.child(5)) // body is typically at index 5
      };
      
    case "while_statement":
      return {
        type: "While",
        cond: normalizePython(node.child(1)), // condition is typically at index 1
        body: normalizePython(node.child(3)) // body is typically at index 3
      };
      
    case "expression_statement":
      return normalizePython(node.child(0)); // Process the actual expression
      
    case "assignment":
      return {
        type: "Assign",
        text: node.text
      };
      
    case "call":
      // Handle print statements
      if (node.text && node.text.includes('print')) {
        return {
          type: "IO",
          text: node.text
        };
      }
      return {
        type: "Expr",
        text: node.text
      };
      
    case "match_statement":
      // Handle Python match (switch) statements
      // console.log('Processing match_statement:', node.text);
      // console.log('Children count:', node.childCount);
      
      // Log all children to understand the structure
      // for (let i = 0; i < node.childCount; i++) {
      //   const child = node.child(i);
      //   if (child) {
      //     console.log(`  Child ${i}: ${child.type} = "${child.text}"`);
      //   }
      // }
      
      const matchCases = [];
      
      // Cases are inside the block child (index 3)
      const blockChild = node.child(3);
      if (blockChild && blockChild.type === 'block') {
        // console.log('Processing block child with', blockChild.childCount, 'children');
        for (let i = 0; i < blockChild.childCount; i++) {
          const caseChild = blockChild.child(i);
          if (caseChild && caseChild.type === 'case_clause') {
            const normalizedCase = normalizePython(caseChild);
            // console.log('Normalized case:', JSON.stringify(normalizedCase, null, 2));
            matchCases.push(normalizedCase);
          }
        }
      }
      
      const matchResult = {
        type: "Match",
        subject: normalizePython(node.child(1)), // subject is typically at index 1 (after 'match')
        cases: matchCases
      };
      
      // console.log('Final match result:', JSON.stringify(matchResult, null, 2));
      return matchResult;
      
    case "case_clause":
      // Handle individual case clauses in match statements
      // console.log('Processing case_clause:', node.text);
      // console.log('Children count:', node.childCount);
      
      // Log all children to understand the structure
      // for (let i = 0; i < node.childCount; i++) {
      //   const child = node.child(i);
      //   if (child) {
      //     console.log(`  Child ${i}: ${child.type} = "${child.text}"`);
      //   }
      // }
      
      return {
        type: "Case",
        pattern: normalizePython(node.child(1)), // pattern is typically at index 1 (after 'case')
        body: normalizePython(node.child(3)) // body is typically at index 3 (after ':')
      };
      
    case "return_statement":
      return {
        type: "Return",
        text: node.text
      };
      
    default:
      // For simple nodes with text, convert to expression
      if (node.text) {
        return {
          type: "Expr",
          text: node.text
        };
      }
      return null;
  }
}