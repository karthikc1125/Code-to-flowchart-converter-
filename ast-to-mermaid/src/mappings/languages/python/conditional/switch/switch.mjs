import { shapes } from "../../mermaid/shapes.mjs";
import { linkNext } from "../../../c/mappings/common/common.mjs";

// Helper function to create decision shape with text
const decisionShape = (text) => shapes.diamond.replace('{}', text);

// Helper function to create process shape with text
const processShape = (text) => shapes.box.replace('{}', text);

/**
 * Map Python Match statement to Mermaid flowchart nodes
 * Creates decision node for match statement
 * @param {Object} node - Normalized Match statement node
 * @param {Object} ctx - Context for flowchart generation
 */
export function mapMatch(node, ctx) {
  // Set up the switch end node placeholder before processing the switch
  if (!ctx.switchEndNodes) {
    ctx.switchEndNodes = [];
  }
  ctx.switchEndNodes.push(null); // Placeholder for end node ID
  
  // Create the match node
  const id = ctx.next();
  ctx.add(id, decisionShape("match " + (node.subject?.text || "expression")));
  
  // Connect to previous node using shared linking logic
  linkNext(ctx, id);
  
  // Store the match node ID for later use in case connections
  ctx.currentSwitchId = id;
  
  // Initialize tracking for case connections
  ctx.caseEndNodes = [];
}

/**
 * Map Python case statement to Mermaid flowchart nodes
 * Creates process node for case statement
 * @param {Object} node - Normalized case statement node
 * @param {Object} ctx - Context for flowchart generation
 */
export function mapCase(node, ctx) {
  if (!node || !ctx) return;
  
  // Create process node for case statement
  const caseId = ctx.next();
  const caseText = `case ${node.pattern?.text || ""}:`;
  ctx.add(caseId, processShape(caseText));
  
  // Connect from match node to each case
  if (ctx.currentSwitchId) {
    ctx.addEdge(ctx.currentSwitchId, caseId);
  }
  
  // Set this as the last node so the body connects to it
  ctx.last = caseId;
}

/**
 * Map Python default case to Mermaid flowchart nodes
 * Creates process node for default case
 * @param {Object} node - Normalized default case node
 * @param {Object} ctx - Context for flowchart generation
 */
export function mapDefault(node, ctx) {
  if (!node || !ctx) return;
  
  // Create process node for default case
  const defaultId = ctx.next();
  const defaultText = "default:";
  ctx.add(defaultId, processShape(defaultText));
  
  // Connect from match node to default case
  if (ctx.currentSwitchId) {
    ctx.addEdge(ctx.currentSwitchId, defaultId);
  }
  
  // Set this as the last node so the body connects to it
  ctx.last = defaultId;
}