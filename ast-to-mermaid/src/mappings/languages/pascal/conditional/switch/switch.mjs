import { shapes } from "../../mermaid/shapes.mjs";
import { linkNext } from "../../mappings/common/common.mjs";

// Helper function to create decision shape with text
const decisionShape = (text) => shapes.decision.replace('{}', text);

// Helper function to create process shape with text
const processShape = (text) => shapes.process.replace('{}', text);

/**
 * Map Pascal Case statement to Mermaid flowchart nodes
 * Creates decision node for case statement
 * @param {Object} node - Normalized Case statement node
 * @param {Object} ctx - Context for flowchart generation
 */
export function mapCase(node, ctx) {
  // Create the case node
  const id = ctx.next();
  ctx.add(id, decisionShape("case " + (node.cond?.text || "expression")));
  
  // Connect to previous node using shared linking logic
  linkNext(ctx, id);
  
  // Store the case node ID for later use in case connections
  ctx.currentCaseId = id;
  
  // Initialize case tracking
  ctx.caseOptions = [];
}

/**
 * Map Pascal case option to Mermaid flowchart nodes
 * Creates process node for case option
 * @param {Object} node - Normalized case option node
 * @param {Object} ctx - Context for flowchart generation
 */
export function mapCaseOption(node, ctx) {
  if (!node || !ctx) return;
  
  // Create process node for case option
  const optionId = ctx.next();
  const optionText = `case ${node.value || ""}:`;
  ctx.add(optionId, processShape(optionText));
  
  // Store the case option for later connection
  if (!ctx.caseOptions) {
    ctx.caseOptions = [];
  }
  ctx.caseOptions.push(optionId);
  
  // Connect from case node to this option
  if (ctx.currentCaseId) {
    ctx.addEdge(ctx.currentCaseId, optionId);
  }
  
  // Set this as the last node so the body connects to it
  ctx.last = optionId;
}

/**
 * Map Pascal else case (default) to Mermaid flowchart nodes
 * Creates process node for else case
 * @param {Object} node - Normalized else case node
 * @param {Object} ctx - Context for flowchart generation
 */
export function mapElseCase(node, ctx) {
  if (!node || !ctx) return;
  
  // Create process node for else case
  const elseId = ctx.next();
  const elseText = "else:";
  ctx.add(elseId, processShape(elseText));
  
  // Store the else case for later connection
  if (!ctx.caseOptions) {
    ctx.caseOptions = [];
  }
  ctx.caseOptions.push(elseId);
  
  // Connect from case node to else case
  if (ctx.currentCaseId) {
    ctx.addEdge(ctx.currentCaseId, elseId);
  }
  
  // Set this as the last node so the body connects to it
  ctx.last = elseId;
}