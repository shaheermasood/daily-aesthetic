/**
 * Input validation utilities
 */

/**
 * Validation result class
 */
class ValidationResult {
  constructor() {
    this.errors = [];
  }

  addError(field, message) {
    this.errors.push({ field, message });
  }

  isValid() {
    return this.errors.length === 0;
  }

  getErrors() {
    return this.errors;
  }
}

/**
 * Validate required fields
 * @param {Object} data - Data to validate
 * @param {Array<string>} requiredFields - List of required field names
 * @returns {ValidationResult}
 */
function validateRequired(data, requiredFields) {
  const result = new ValidationResult();

  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      result.addError(field, `${field} is required`);
    }
  }

  return result;
}

/**
 * Validate string length
 * @param {Object} data - Data to validate
 * @param {string} field - Field name
 * @param {number} minLength - Minimum length (optional)
 * @param {number} maxLength - Maximum length (optional)
 * @returns {ValidationResult}
 */
function validateLength(data, field, minLength = null, maxLength = null) {
  const result = new ValidationResult();
  const value = data[field];

  if (value !== undefined && value !== null) {
    const length = String(value).length;

    if (minLength !== null && length < minLength) {
      result.addError(field, `${field} must be at least ${minLength} characters`);
    }

    if (maxLength !== null && length > maxLength) {
      result.addError(field, `${field} must not exceed ${maxLength} characters`);
    }
  }

  return result;
}

/**
 * Validate number range
 * @param {Object} data - Data to validate
 * @param {string} field - Field name
 * @param {number} min - Minimum value (optional)
 * @param {number} max - Maximum value (optional)
 * @returns {ValidationResult}
 */
function validateRange(data, field, min = null, max = null) {
  const result = new ValidationResult();
  const value = data[field];

  if (value !== undefined && value !== null) {
    const num = Number(value);

    if (isNaN(num)) {
      result.addError(field, `${field} must be a number`);
      return result;
    }

    if (min !== null && num < min) {
      result.addError(field, `${field} must be at least ${min}`);
    }

    if (max !== null && num > max) {
      result.addError(field, `${field} must not exceed ${max}`);
    }
  }

  return result;
}

/**
 * Validate enum value
 * @param {Object} data - Data to validate
 * @param {string} field - Field name
 * @param {Array} allowedValues - Array of allowed values
 * @returns {ValidationResult}
 */
function validateEnum(data, field, allowedValues) {
  const result = new ValidationResult();
  const value = data[field];

  if (value !== undefined && value !== null && !allowedValues.includes(value)) {
    result.addError(field, `${field} must be one of: ${allowedValues.join(', ')}`);
  }

  return result;
}

/**
 * Validate URL format
 * @param {Object} data - Data to validate
 * @param {string} field - Field name
 * @returns {ValidationResult}
 */
function validateUrl(data, field) {
  const result = new ValidationResult();
  const value = data[field];

  if (value !== undefined && value !== null && value !== '') {
    try {
      new URL(value);
    } catch (e) {
      result.addError(field, `${field} must be a valid URL`);
    }
  }

  return result;
}

/**
 * Validate email format
 * @param {Object} data - Data to validate
 * @param {string} field - Field name
 * @returns {ValidationResult}
 */
function validateEmail(data, field) {
  const result = new ValidationResult();
  const value = data[field];

  if (value !== undefined && value !== null && value !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      result.addError(field, `${field} must be a valid email address`);
    }
  }

  return result;
}

/**
 * Combine multiple validation results
 * @param {Array<ValidationResult>} results - Array of validation results
 * @returns {ValidationResult}
 */
function combineResults(...results) {
  const combined = new ValidationResult();

  for (const result of results) {
    if (result && result.errors) {
      combined.errors.push(...result.errors);
    }
  }

  return combined;
}

/**
 * Validate project data
 * @param {Object} data - Project data
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {ValidationResult}
 */
function validateProject(data, isUpdate = false) {
  const requiredFields = isUpdate ? [] : ['title'];

  return combineResults(
    validateRequired(data, requiredFields),
    validateLength(data, 'title', 1, 255),
    validateLength(data, 'excerpt', 0, 500),
    validateLength(data, 'meta_title', 0, 255),
    validateLength(data, 'meta_description', 0, 500),
    validateEnum(data, 'status', ['draft', 'published', 'archived'])
  );
}

/**
 * Validate article data
 * @param {Object} data - Article data
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {ValidationResult}
 */
function validateArticle(data, isUpdate = false) {
  const requiredFields = isUpdate ? [] : ['title'];

  return combineResults(
    validateRequired(data, requiredFields),
    validateLength(data, 'title', 1, 255),
    validateLength(data, 'author', 0, 100),
    validateLength(data, 'excerpt', 0, 500),
    validateLength(data, 'meta_title', 0, 255),
    validateLength(data, 'meta_description', 0, 500),
    validateEnum(data, 'status', ['draft', 'published', 'archived'])
  );
}

/**
 * Validate product data
 * @param {Object} data - Product data
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {ValidationResult}
 */
function validateProduct(data, isUpdate = false) {
  const requiredFields = isUpdate ? [] : ['title'];

  return combineResults(
    validateRequired(data, requiredFields),
    validateLength(data, 'title', 1, 255),
    validateLength(data, 'meta_title', 0, 255),
    validateLength(data, 'meta_description', 0, 500),
    validateRange(data, 'price', 0),
    validateRange(data, 'sale_price', 0),
    validateRange(data, 'stock_quantity', 0),
    validateEnum(data, 'status', ['draft', 'published', 'archived'])
  );
}

module.exports = {
  ValidationResult,
  validateRequired,
  validateLength,
  validateRange,
  validateEnum,
  validateUrl,
  validateEmail,
  combineResults,
  validateProject,
  validateArticle,
  validateProduct
};
