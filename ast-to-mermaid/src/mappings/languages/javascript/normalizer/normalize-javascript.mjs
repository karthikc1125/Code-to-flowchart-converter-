/**
 * Normalize JavaScript AST to unified node types
 * @param {Object} node - AST node
 * @returns {Object} - Normalized node
 */
export function normalizeJavaScript(node) {
  if (!node) return null;
  
  // Convert JavaScript-specific AST nodes to unified node types
  switch (node.type) {
    case "program":
      return {
        type: "Program",
        name: "main",
        body: node.children ? node.children.map(normalizeJavaScript).filter(Boolean) : []
      };
      
    case "function_declaration":
      // Check if this is the main function
      const functionName = node.child(1)?.text || "unknown";
      if (functionName === "main") {
        // Get the block (body) of the function
        const bodyNode = node.child(3); // This should be the block
        return {
          type: "Program",
          name: "main",
          body: bodyNode ? normalizeJavaScript(bodyNode).body || [] : []
        };
      }
      // Skip function declarations - they should be ignored until first executable line
      return null;
      
    case "statement_block":
      // This is a block {} - process its children
      return {
        type: "Block",
        body: node.children ? node.children.slice(1, -1).map(normalizeJavaScript).filter(Boolean) : [] // Remove { and }
      };
      
    case "if_statement":
      // Handle if-else-if chains properly
      let alternate = null;
      // Check if there's an else clause (typically at index 3 in 0-indexed array)
      if (node.child(3)) {
        alternate = normalizeJavaScript(node.child(3));
      }
      
      return {
        type: "If",
        test: normalizeJavaScript(node.child(1)), // condition is at index 1 (the parenthesized expression)
        consequent: normalizeJavaScript(node.child(2)), // then block is at index 2
        alternate: alternate
      };
      
    case "for_statement":
      return {
        type: "For",
        init: normalizeJavaScript(node.child(2)), // init is typically at index 2
        test: normalizeJavaScript(node.child(4)), // condition is typically at index 4
        update: normalizeJavaScript(node.child(6)), // update is typically at index 6
        body: normalizeJavaScript(node.child(8)) // body is typically at index 8
      };
      
    case "while_statement":
      return {
        type: "While",
        test: normalizeJavaScript(node.child(2)), // condition is typically at index 2
        body: normalizeJavaScript(node.child(4)) // body is typically at index 4
      };
      
    case "switch_statement":
      // The switch_body is typically at index 2
      const switchBody = node.child(2);
      const cases = [];
      
      // Extract cases from switch_body children
      if (switchBody && switchBody.children) {
        // Skip the first '{' and last '}' tokens
        for (let i = 1; i < switchBody.children.length - 1; i++) {
          const child = switchBody.children[i];
          const normalized = normalizeJavaScript(child);
          if (normalized) {
            cases.push(normalized);
          }
        }
      }
      
      return {
        type: "Switch",
        discriminant: normalizeJavaScript(node.child(1)), // switch expression is typically at index 1
        cases: cases
      };
      
    case "switch_case":
      return {
        type: "Case",
        test: normalizeJavaScript(node.child(1)), // case value is typically at index 1
        consequent: node.children ? node.children.slice(3).map(normalizeJavaScript).filter(Boolean) : [] // Skip 'case', value, and ':'
      };
      
    case "switch_default":
      return {
        type: "Default",
        consequent: node.children ? node.children.slice(2).map(normalizeJavaScript).filter(Boolean) : [] // Skip 'default' and ':'
      };
      
    case "expression_statement":
      return normalizeJavaScript(node.child(0)); // Process the actual expression
      
    case "assignment_expression":
      return {
        type: "Assign",
        text: node.text
      };
      
    case "lexical_declaration":
    case "variable_declaration":
      // Check if this is a variable declaration with initialization
      // Skip variable declarations without values
      if (node.text && node.text.includes('=')) {
        return {
          type: "Decl",
          text: node.text
        };
      }
      // Skip variable declarations without initialization
      return null;
      
    case "import_statement":
    case "import_clause":
      // Skip import statements - they should be ignored
      return null;
      
    case "export_statement":
      // Skip export statements - they should be ignored
      return null;
      
    case "class_declaration":
      // Skip class declarations - they should be ignored
      return null;
      
    case "else_clause":
      // Process the statement that follows 'else'
      // This could be a single statement or another if_statement
      if (node.children && node.children.length > 1) {
        // The actual statement is typically at index 1
        return normalizeJavaScript(node.children[1]);
      }
      return null;
      
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
      
    case "break_statement":
      return {
        type: "Break",
        text: node.text
      };
      
    default:
      // For simple nodes with text, convert to expression
      // But skip comments and directives
      if (node.text) {
        // Skip comments
        if (node.type === "comment") {
          return null;
        }
        
        // Skip directives like "use strict"
        if (node.text.trim() === '"use strict";' || node.text.trim() === "'use strict';") {
          return null;
        }
        
        // Skip empty statements
        if (node.text.trim() === ';') {
          return null;
        }
        
        return {
          type: "Expr",
          text: node.text
        };
      }
      return null;
  }
}