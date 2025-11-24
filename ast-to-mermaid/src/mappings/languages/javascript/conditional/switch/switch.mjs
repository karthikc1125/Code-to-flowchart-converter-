import { shapes } from "../../../../mermaid/shapes.mjs";
import { linkNext } from "../../../javascript/mappings/common/common.mjs";

// Helper function to create decision shape with text
const decisionShape = (text) => shapes.decision.replace('{}', text);

// Helper function to create process shape with text
const processShape = (text) => shapes.process.replace('{}', text);

/**
 * Map switch statement to Mermaid flowchart nodes
 * Creates decision node for switch with case branches
 * @param {Object} node - Normalized switch statement node
 * @param {Object} ctx - Context for flowchart generation
 */
export function mapSwitchStatement(node, ctx, mapper) {
  // Set up the switch end node placeholder before processing the switch
  if (!ctx.switchEndNodes) {
    ctx.switchEndNodes = [];
  }
  ctx.switchEndNodes.push(null); // Placeholder for end node ID

  // Create the switch node
  const switchId = ctx.next();
  const discriminantText = node.discriminant?.text || "expression";
  ctx.add(switchId, decisionShape("switch (" + discriminantText + ")"));

  // Connect to previous node using shared linking logic
  linkNext(ctx, switchId);

  // Store the switch node ID for later use in case connections
  ctx.currentSwitchId = switchId;
  
  // Initialize tracking for case processing
  ctx.switchCaseNodes = [];
  ctx.switchMergeNode = null;
  
  // Process the cases using the mapper
  if (node.cases && Array.isArray(node.cases) && mapper) {
    node.cases.forEach(caseNode => {
      mapper(caseNode, ctx);
    });
  }
  
  // Don't clear switch-specific context here - let finalize context handle it
  // ctx.currentSwitchId will be cleared in finalizeFlowContext
}

/**
 * Map case statement to Mermaid flowchart nodes
 * Creates process node for case statement
 * @param {Object} node - Normalized case statement node
 * @param {Object} ctx - Context for flowchart generation
 */
export function mapCase(node, ctx, mapper) {
  if (!node || !ctx || !ctx.currentSwitchId) return;

  // Create process node for case statement
  const caseId = ctx.next();
  const caseValue = node.test ? (node.test.value !== undefined ? node.test.value : node.test.text) : "";
  const caseText = `case ${caseValue}:`;
  ctx.add(caseId, processShape(caseText));

  // Track this case node
  if (!ctx.switchCaseNodes) {
    ctx.switchCaseNodes = [];
  }
  ctx.switchCaseNodes.push({ id: caseId, node: node });
  
  // Connect from switch node to this case (will be refined later)
  ctx.addEdge(ctx.currentSwitchId, caseId);

  // Process the consequent statements
  if (node.consequent && Array.isArray(node.consequent) && mapper) {
    // Store the current switch ID to ensure it's available during consequent processing
    const originalSwitchId = ctx.currentSwitchId;
    const originalLast = ctx.last;
    
    // Set the case node as the last node so consequent statements connect to it
    ctx.last = caseId;
    
    // Process each consequent statement
    node.consequent.forEach(statement => {
      mapper(statement, ctx);
    });
    
    // Restore the original context state
    ctx.last = originalLast;
    if (!ctx.currentSwitchId && originalSwitchId) {
      ctx.currentSwitchId = originalSwitchId;
    }
  }
}

/**
 * Map default case to Mermaid flowchart nodes
 * Creates process node for default case
 * @param {Object} node - Normalized default case node
 * @param { Object } ctx - Context for flowchart generation
 */
export function mapDefault(node, ctx, mapper) {
  if (!node || !ctx || !ctx.currentSwitchId) return;

  // Create process node for default case
  const defaultId = ctx.next();
  const defaultText = "default:";
  ctx.add(defaultId, processShape(defaultText));

  // Track this default node
  if (!ctx.switchCaseNodes) {
    ctx.switchCaseNodes = [];
  }
  ctx.switchCaseNodes.push({ id: defaultId, node: node });
  
  // Connect from switch node to this default case
  ctx.addEdge(ctx.currentSwitchId, defaultId);

  // Process the consequent statements
  if (node.consequent && Array.isArray(node.consequent) && mapper) {
    // Store the current switch ID to ensure it's available during consequent processing
    const originalSwitchId = ctx.currentSwitchId;
    const originalLast = ctx.last;
    
    // Set the default node as the last node so consequent statements connect to it
    ctx.last = defaultId;
    
    // Process each consequent statement
    node.consequent.forEach(statement => {
      mapper(statement, ctx);
    });
    
    // Restore the original context state
    ctx.last = originalLast;
    if (!ctx.currentSwitchId && originalSwitchId) {
      ctx.currentSwitchId = originalSwitchId;
    }
  }
}