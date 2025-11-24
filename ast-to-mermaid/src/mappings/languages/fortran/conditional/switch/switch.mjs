import { shapes } from "../../mermaid/shapes.mjs";
import { linkNext } from "../../../c/mappings/common/common.mjs";

// Helper function to create decision shape with text (escaping double quotes)
const decisionShape = (text) => {
  // Remove any existing double quotes from the text
  const escapedText = text.replace(/"/g, '');
  return shapes.diamond.replace('{}', escapedText);
};

// Helper function to create process shape with text (escaping double quotes)
const processShape = (text) => {
  // Remove any existing double quotes from the text
  const escapedText = text.replace(/"/g, '');
  return shapes.box.replace('{}', escapedText);
};

/**
 * Map select case statement to Mermaid flowchart nodes
 * Creates decision node for select case with case branches
 * @param {Object} node - Normalized select case statement node
 * @param {Object} ctx - Context for flowchart generation
 * @param {Function} mapper - Recursive mapper function
 */
export function mapSelectCase(node, ctx, mapper) {
  // Set up the select case end node placeholder before processing the select case
  if (!ctx.switchEndNodes) {
    ctx.switchEndNodes = [];
  }
  ctx.switchEndNodes.push(null); // Placeholder for end node ID
  
  // Create the select case node
  const selectCaseId = ctx.next();
  const discriminantText = node.discriminant?.text || "expression";
  ctx.add(selectCaseId, decisionShape("select case (" + discriminantText + ")"));
  
  // Connect to previous node manually, but don't use linkNext which would create an automatic connection
  if (ctx.last) {
    ctx.addEdge(ctx.last, selectCaseId);
  }
  
  // Don't set ctx.last to selectCaseId to prevent automatic connections to next statement
  // Preserve the previous last node so the flow continues correctly after the switch block
  
  // Store the select case node ID for later use in case connections
  ctx.currentSwitchId = selectCaseId;
  
  // Initialize case tracking
  ctx.switchCaseEnds = [];
  
  // Process the cases using the mapper
  if (node.cases && Array.isArray(node.cases) && mapper) {
    node.cases.forEach(caseNode => {
      mapper(caseNode, ctx, mapper);
    });
  }
  
  // After processing all cases, update ctx.last to point to the end of the select case block
  // We'll use the last case end node for this purpose
  if (ctx.switchCaseEnds && ctx.switchCaseEnds.length > 0) {
    ctx.last = ctx.switchCaseEnds[ctx.switchCaseEnds.length - 1];
  }
  
  // Don't set nextSwitchNode to prevent automatic connections
  // Cases will connect to the next statement in finalizeFlowContext
  
  // Clean up
  ctx.currentSwitchId = null;
}

/**
 * Map case statement to Mermaid flowchart nodes
 * Creates process node for case statement
 * @param {Object} node - Normalized case statement node
 * @param {Object} ctx - Context for flowchart generation
 * @param {Function} mapper - Recursive mapper function
 */
export function mapCase(node, ctx, mapper) {
  if (!node || !ctx) return;
  
  // Create process node for case statement
  const caseId = ctx.next();
  const caseValue = node.test ? (node.test.value !== undefined ? node.test.value : node.test.text) : "";
  const caseText = `case (${caseValue})`;
  ctx.add(caseId, processShape(caseText));
  
  // Connect from select case node to this case
  if (ctx.currentSwitchId) {
    ctx.addEdge(ctx.currentSwitchId, caseId);
  }
  
  // Process the consequent statements
  let lastStatementId = caseId;
  if (node.consequent && Array.isArray(node.consequent) && mapper) {
    node.consequent.forEach(statement => {
      // Create a temporary context with the last statement ID
      const tempCtx = {...ctx, last: lastStatementId};
      mapper(statement, tempCtx, mapper);
      lastStatementId = tempCtx.last;
    });
  }
  
  // Add this case end to the list of cases that need to connect to the end of the switch block
  if (!ctx.switchCaseEnds) {
    ctx.switchCaseEnds = [];
  }
  ctx.switchCaseEnds.push(lastStatementId);
  
  // Track the previous case for sequential connection
  ctx.previousCaseId = caseId;
}

/**
 * Map default case to Mermaid flowchart nodes
 * Creates process node for default case
 * @param {Object} node - Normalized default case node
 * @param {Object} ctx - Context for flowchart generation
 * @param {Function} mapper - Recursive mapper function
 */
export function mapCaseDefault(node, ctx, mapper) {
  if (!node || !ctx) return;
  
  // Create process node for default case
  const defaultId = ctx.next();
  const defaultText = "case default";
  ctx.add(defaultId, processShape(defaultText));
  
  // Connect from select case node to default case
  if (ctx.currentSwitchId) {
    ctx.addEdge(ctx.currentSwitchId, defaultId);
  }
  
  // Process the consequent statements
  let lastStatementId = defaultId;
  if (node.consequent && Array.isArray(node.consequent) && mapper) {
    node.consequent.forEach(statement => {
      // Create a temporary context with the last statement ID
      const tempCtx = {...ctx, last: lastStatementId};
      mapper(statement, tempCtx, mapper);
      lastStatementId = tempCtx.last;
    });
  }
  
  // Add this case end to the list of cases that need to connect to the end of the switch block
  if (!ctx.switchCaseEnds) {
    ctx.switchCaseEnds = [];
  }
  ctx.switchCaseEnds.push(lastStatementId);
  
  // Track the previous case for sequential connection
  ctx.previousCaseId = defaultId;
}