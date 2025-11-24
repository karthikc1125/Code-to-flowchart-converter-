/**
 * Shared helper functions for TypeScript language mapping
 */

/**
 * Sanitize node text according to VTU flowchart rules
 * @param {string} text - Raw node text
 * @returns {string} - Sanitized text
 */
export const sanitizeNodeText = (text, options = {}) => {
  const { wrap = true } = options;
  if (!text) return "";
  
  // Remove inner double quotes
  let sanitized = text.replace(/"/g, "");
  
  // Replace newlines with escaped newlines
  sanitized = sanitized.replace(/\n/g, "\\n");
  
  // Trim spaces
  sanitized = sanitized.trim();
  
  if (wrap) {
    return `"${sanitized}"`;
  }
  
  return sanitized;
};

export function generateId(prefix = 'typescript') {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}