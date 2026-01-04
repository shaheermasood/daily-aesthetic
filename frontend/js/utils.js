/**
 * Utility functions for The Daily Aesthetic
 */

/**
 * Safe HTML escape helper
 * Used for strings injected into HTML to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * DOM query helper - single element
 * @param {string} sel - CSS selector
 * @param {Element} root - Root element (default: document)
 * @returns {Element|null}
 */
export const $ = (sel, root = document) => root.querySelector(sel);

/**
 * DOM query helper - multiple elements
 * @param {string} sel - CSS selector
 * @param {Element} root - Root element (default: document)
 * @returns {Array<Element>}
 */
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/**
 * Append HTML to a container using template element for performance
 * @param {Element} container - Target container
 * @param {string} html - HTML string to append
 */
export function appendHTML(container, html) {
  const tpl = document.createElement("template");
  tpl.innerHTML = html.trim();
  container.appendChild(tpl.content);
}

/**
 * Format database field names to match frontend expectations
 * Converts snake_case to camelCase and maps database fields
 * @param {Object} dbRecord - Database record
 * @returns {Object} Formatted object
 */
export function formatDataFromDB(dbRecord) {
  return {
    id: dbRecord.id,
    title: dbRecord.title,
    date: dbRecord.date,
    image: dbRecord.image_url,
    excerpt: dbRecord.excerpt,
    description: dbRecord.description,
    tags: dbRecord.tags,
    author: dbRecord.author,
    content: dbRecord.content,
    price: dbRecord.price
  };
}
