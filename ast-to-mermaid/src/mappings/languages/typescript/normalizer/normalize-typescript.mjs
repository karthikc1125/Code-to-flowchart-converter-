/**
 * Normalize TypeScript AST to unified node types
 * @param {Object} node - AST node
 * @returns {Object} - Normalized node
 */
export function normalizeTypescriptAst(node) {
  if (!node) return null;
  
  // Convert TypeScript-specific AST nodes to unified node types
  switch (node.type) {
    case "program":
      return {
        type: "Program",
        name: "main",
        body: node.children ? node.children.map(normalizeTypescriptAst).filter(Boolean) : []
      };
      
    case "function_declaration":
      // Check if this is the main function
      const functionName = node.child(1)?.text || "unknown";
      return {
        type: "Function",
        name: functionName,
        body: node.children ? node.children.map(normalizeTypescriptAst).filter(Boolean) : []
      };
      
    case "statement_block":
      // This is a block {} - process its children
      return {
        type: "Block",
        body: node.children ? node.children.slice(1, -1).map(normalizeTypescriptAst).filter(Boolean) : [] // Remove { and }
      };
      
    case "if_statement":
      // Handle if-else-if chains properly
      let alternate = null;
      // Check if there's an else clause (typically at index 3 in 0-indexed array)
      if (node.child(3)) {
        alternate = normalizeTypescriptAst(node.child(3));
      }
      
      return {
        type: "If",
        test: normalizeTypescriptAst(node.child(1)), // condition is at index 1 (the parenthesized expression)
        consequent: normalizeTypescriptAst(node.child(2)), // then block is at index 2
        alternate: alternate
      };
      
    case "for_statement":
      return {
        type: "For",
        init: normalizeTypescriptAst(node.child(2)), // init is typically at index 2
        cond: normalizeTypescriptAst(node.child(4)), // condition is typically at index 4
        update: normalizeTypescriptAst(node.child(6)), // update is typically at index 6
        body: normalizeTypescriptAst(node.child(8)) // body is typically at index 8
      };
      
    case "while_statement":
      return {
        type: "While",
        cond: normalizeTypescriptAst(node.child(2)), // condition is typically at index 2
        body: normalizeTypescriptAst(node.child(4)) // body is typically at index 4
      };
      
    case "expression_statement":
      return normalizeTypescriptAst(node.child(0)); // Process the actual expression
      
    case "assignment_expression":
      return {
        type: "Assign",
        text: node.text
      };
      
    case "call_expression":
      // Handle console.log statements
      if (node.text && node.text.includes('console.log')) {
        return {
          type: "IO",
          text: node.text
        };
      }
      return {
        type: "Expr",
        text: node.text
      };
      
    case "return_statement":
      return {
        type: "Return",
        text: node.text
      };
      
    case "switch_statement":
      // Handle switch statements
      // The switch_body is typically at index 2
      const switchBody = node.child(2);
      const cases = [];
      
      // Extract cases from switch_body children
      if (switchBody && switchBody.children) {
        // Skip the first '{' and last '}' tokens
        for (let i = 1; i < switchBody.children.length - 1; i++) {
          const child = switchBody.children[i];
          const normalized = normalizeTypescriptAst(child);
          if (normalized) {
            cases.push(normalized);
          }
        }
      }
      
      return {
        type: "Switch",
        discriminant: normalizeTypescriptAst(node.child(1)), // switch expression is typically at index 1
        cases: cases
      };
      
    case "switch_case":
      return {
        type: "Case",
        test: normalizeTypescriptAst(node.child(1)), // case value is typically at index 1
        consequent: node.children ? node.children.slice(3).map(normalizeTypescriptAst).filter(Boolean) : [] // Skip 'case', value, and ':'
      };
      
    case "switch_default":
      return {
        type: "Default",
        test: null, // default case has no test value
        consequent: node.children ? node.children.slice(2).map(normalizeTypescriptAst).filter(Boolean) : [] // Skip 'default' and ':'
      };
      
    case "else_clause":
      // Process the statement that follows 'else'
      // This could be a single statement or another if_statement
      if (node.children && node.children.length > 1) {
        // The actual statement is typically at index 1
        return normalizeTypescriptAst(node.children[1]);
      }
      return null;
      
    case "import_statement":
      // Skip import statements - they should be ignored
      return null;
      
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