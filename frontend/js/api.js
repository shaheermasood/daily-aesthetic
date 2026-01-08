/**
 * API Client for The Daily Aesthetic Backend
 * Handles all HTTP requests to the backend API
 */

import API_BASE_URL from './config.js';

const api = {
  /**
   * Fetch projects with pagination and filters
   * @param {number} offset - Starting index
   * @param {number} limit - Number of items to fetch
   * @param {Object} filters - Optional filters (search, tag)
   * @returns {Promise<Object>} Response with data and pagination info
   */
  async getProjects(offset = 0, limit = 6, filters = {}) {
    try {
      const params = new URLSearchParams({
        offset: offset.toString(),
        limit: limit.toString()
      });

      if (filters.search) params.append('search', filters.search);
      if (filters.tag) params.append('tag', filters.tag);

      const response = await fetch(`${API_BASE_URL}/projects?${params.toString()}`);
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
   * Fetch articles with pagination and filters
   * @param {number} offset - Starting index
   * @param {number} limit - Number of items to fetch
   * @param {Object} filters - Optional filters (search, author)
   * @returns {Promise<Object>} Response with data and pagination info
   */
  async getArticles(offset = 0, limit = 1, filters = {}) {
    try {
      const params = new URLSearchParams({
        offset: offset.toString(),
        limit: limit.toString()
      });

      if (filters.search) params.append('search', filters.search);
      if (filters.author) params.append('author', filters.author);

      const response = await fetch(`${API_BASE_URL}/articles?${params.toString()}`);
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
   * Fetch products with pagination and filters
   * @param {number} offset - Starting index
   * @param {number} limit - Number of items to fetch
   * @param {Object} filters - Optional filters (search, tag, minPrice, maxPrice)
   * @returns {Promise<Object>} Response with data and pagination info
   */
  async getProducts(offset = 0, limit = 6, filters = {}) {
    try {
      const params = new URLSearchParams({
        offset: offset.toString(),
        limit: limit.toString()
      });

      if (filters.search) params.append('search', filters.search);
      if (filters.tag) params.append('tag', filters.tag);
      if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());

      const response = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
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
