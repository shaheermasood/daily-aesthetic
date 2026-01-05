/**
 * API Client for The Daily Aesthetic Backend
 * Handles all HTTP requests to the backend API
 */

import API_BASE_URL from './config.js';

const api = {
  /**
   * Fetch projects with pagination
   * @param {number} offset - Starting index
   * @param {number} limit - Number of items to fetch
   * @returns {Promise<Object>} Response with data and pagination info
   */
  async getProjects(offset = 0, limit = 6) {
    try {
      const response = await fetch(`${API_BASE_URL}/projects?offset=${offset}&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  /**
   * Fetch a single project by ID
   * @param {number} id - Project ID
   * @returns {Promise<Object>} Project data
   */
  async getProject(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  },

  /**
   * Fetch articles with pagination
   * @param {number} offset - Starting index
   * @param {number} limit - Number of items to fetch
   * @returns {Promise<Object>} Response with data and pagination info
   */
  async getArticles(offset = 0, limit = 1) {
    try {
      const response = await fetch(`${API_BASE_URL}/articles?offset=${offset}&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }
  },

  /**
   * Fetch a single article by ID
   * @param {number} id - Article ID
   * @returns {Promise<Object>} Article data
   */
  async getArticle(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching article:', error);
      throw error;
    }
  },

  /**
   * Fetch products with pagination
   * @param {number} offset - Starting index
   * @param {number} limit - Number of items to fetch
   * @returns {Promise<Object>} Response with data and pagination info
   */
  async getProducts(offset = 0, limit = 6) {
    try {
      const response = await fetch(`${API_BASE_URL}/products?offset=${offset}&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  /**
   * Fetch a single product by ID
   * @param {number} id - Product ID
   * @returns {Promise<Object>} Product data
   */
  async getProduct(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }
};

export default api;
