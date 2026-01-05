const API_BASE_URL = 'http://localhost:3000/api';

let currentTab = 'projects';
let currentEditId = null;
let currentDeleteId = null;

// Check authentication
function checkAuth() {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    window.location.href = 'login.html';
    return null;
  }
  return token;
}

// Get auth headers
function getAuthHeaders() {
  const token = checkAuth();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// Load user info
function loadUserInfo() {
  const userStr = localStorage.getItem('adminUser');
  if (userStr) {
    const user = JSON.parse(userStr);
    document.getElementById('admin-name').textContent = user.full_name || user.username;
    document.getElementById('admin-email').textContent = user.email;
  }
}

// Logout
function logout() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  window.location.href = 'login.html';
}

// Tab switching
function switchTab(tabName) {
  currentTab = tabName;

  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    if (btn.dataset.tab === tabName) {
      btn.classList.add('active', 'border-black', 'text-gray-900');
      btn.classList.remove('border-transparent', 'text-gray-500');
    } else {
      btn.classList.remove('active', 'border-black', 'text-gray-900');
      btn.classList.add('border-transparent', 'text-gray-500');
    }
  });

  // Update tab panels
  document.querySelectorAll('.tab-panel').forEach(panel => {
    if (panel.id === `${tabName}-tab`) {
      panel.classList.remove('hidden');
      panel.classList.add('active');
    } else {
      panel.classList.add('hidden');
      panel.classList.remove('active');
    }
  });

  // Load data for the tab
  loadData(tabName);
}

// Load data for a specific content type
async function loadData(type) {
  try {
    const response = await fetch(`${API_BASE_URL}/${type}?limit=100`);
    const data = await response.json();

    renderList(type, data.data);
  } catch (error) {
    console.error(`Error loading ${type}:`, error);
    alert(`Failed to load ${type}`);
  }
}

// Render list of items
function renderList(type, items) {
  const listContainer = document.getElementById(`${type}-list`);

  if (items.length === 0) {
    listContainer.innerHTML = `
      <div class="text-center py-12 text-gray-500">
        <p class="text-lg">No ${type} found</p>
        <p class="text-sm mt-2">Click "Add ${type.slice(0, -1)}" to create one</p>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = items.map(item => {
    const typeConfig = getTypeConfig(type);
    return `
      <div class="bg-white border border-gray-200 hover:border-black transition p-6 flex items-start space-x-6">
        ${item.image_url ? `
          <img
            src="${item.image_url}"
            alt="${item.title}"
            class="w-32 h-32 object-cover grayscale flex-shrink-0"
          />
        ` : ''}

        <div class="flex-grow">
          <h3 class="text-xl font-bold mb-2">${item.title}</h3>
          ${item.author ? `<p class="text-sm text-gray-600 mb-2">By ${item.author}</p>` : ''}
          ${item.price ? `<p class="text-sm text-gray-600 mb-2">Price: $${item.price}</p>` : ''}
          ${item.date ? `<p class="text-sm text-gray-500 mb-2">${item.date}</p>` : ''}
          ${item.excerpt ? `<p class="text-sm text-gray-700 mb-2">${truncate(item.excerpt, 150)}</p>` : ''}
          ${item.description ? `<p class="text-sm text-gray-700 mb-2">${truncate(item.description, 150)}</p>` : ''}
          ${item.tags ? `<div class="flex flex-wrap gap-2 mt-2">
            ${(Array.isArray(item.tags) ? item.tags : []).map(tag =>
              `<span class="text-xs px-2 py-1 bg-gray-100 text-gray-700">${tag}</span>`
            ).join('')}
          </div>` : ''}
        </div>

        <div class="flex flex-col space-y-2 flex-shrink-0">
          <button
            onclick="editItem('${type}', ${item.id})"
            class="p-2 hover:bg-gray-100 rounded transition"
            title="Edit"
          >
            <i data-lucide="edit-2" class="w-5 h-5"></i>
          </button>
          <button
            onclick="confirmDelete('${type}', ${item.id})"
            class="p-2 hover:bg-red-50 text-red-600 rounded transition"
            title="Delete"
          >
            <i data-lucide="trash-2" class="w-5 h-5"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Re-initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// Truncate text
function truncate(text, length) {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
}

// Get type configuration
function getTypeConfig(type) {
  const configs = {
    projects: {
      singular: 'Project',
      fields: ['title', 'date', 'image_url', 'excerpt', 'description', 'tags']
    },
    articles: {
      singular: 'Article',
      fields: ['title', 'author', 'date', 'image_url', 'content']
    },
    products: {
      singular: 'Product',
      fields: ['title', 'price', 'date', 'image_url', 'description', 'tags']
    }
  };
  return configs[type];
}

// Show edit modal
async function editItem(type, id = null) {
  const typeConfig = getTypeConfig(type);
  const modal = document.getElementById('edit-modal');
  const modalTitle = document.getElementById('modal-title');
  const form = document.getElementById('edit-form');

  currentEditId = id;

  // Set modal title
  modalTitle.textContent = id ? `Edit ${typeConfig.singular}` : `Add ${typeConfig.singular}`;

  // Load item data if editing
  let itemData = {};
  if (id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${type}/${id}`);
      itemData = await response.json();
    } catch (error) {
      console.error('Error loading item:', error);
      alert('Failed to load item');
      return;
    }
  }

  // Build form fields
  form.innerHTML = typeConfig.fields.map(field => {
    const value = itemData[field] || '';
    const displayName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    if (field === 'content' || field === 'description') {
      return `
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            ${displayName}
          </label>
          <textarea
            name="${field}"
            rows="6"
            class="w-full px-4 py-2 border border-gray-300 focus:border-black focus:outline-none transition"
            placeholder="Enter ${displayName.toLowerCase()}"
          >${value}</textarea>
        </div>
      `;
    } else if (field === 'tags') {
      const tagsValue = Array.isArray(value) ? value.join(', ') : '';
      return `
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            ${displayName} <span class="text-xs text-gray-500">(comma-separated)</span>
          </label>
          <input
            type="text"
            name="${field}"
            value="${tagsValue}"
            class="w-full px-4 py-2 border border-gray-300 focus:border-black focus:outline-none transition"
            placeholder="minimalism, design, art"
          />
        </div>
      `;
    } else if (field === 'price') {
      return `
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            ${displayName}
          </label>
          <input
            type="number"
            name="${field}"
            value="${value}"
            step="0.01"
            class="w-full px-4 py-2 border border-gray-300 focus:border-black focus:outline-none transition"
            placeholder="0.00"
          />
        </div>
      `;
    } else {
      return `
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            ${displayName}
          </label>
          <input
            type="text"
            name="${field}"
            value="${value}"
            class="w-full px-4 py-2 border border-gray-300 focus:border-black focus:outline-none transition"
            placeholder="Enter ${displayName.toLowerCase()}"
          />
        </div>
      `;
    }
  }).join('');

  // Show modal
  modal.classList.remove('hidden');
}

// Close modal
function closeModal() {
  document.getElementById('edit-modal').classList.add('hidden');
  currentEditId = null;
}

// Save item
async function saveItem(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const data = {};

  // Process form data
  for (const [key, value] of formData.entries()) {
    if (key === 'tags') {
      // Convert comma-separated string to array
      data[key] = value.split(',').map(t => t.trim()).filter(t => t);
    } else if (key === 'price') {
      data[key] = value ? parseFloat(value) : null;
    } else {
      data[key] = value;
    }
  }

  try {
    const url = currentEditId
      ? `${API_BASE_URL}/${currentTab}/${currentEditId}`
      : `${API_BASE_URL}/${currentTab}`;

    const method = currentEditId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save item');
    }

    closeModal();
    loadData(currentTab);
    alert(`${getTypeConfig(currentTab).singular} ${currentEditId ? 'updated' : 'created'} successfully!`);
  } catch (error) {
    console.error('Error saving item:', error);
    alert(error.message);
  }
}

// Confirm delete
function confirmDelete(type, id) {
  currentDeleteId = id;
  currentTab = type;
  document.getElementById('delete-modal').classList.remove('hidden');
}

// Cancel delete
function cancelDelete() {
  document.getElementById('delete-modal').classList.add('hidden');
  currentDeleteId = null;
}

// Delete item
async function deleteItem() {
  if (!currentDeleteId) return;

  try {
    const response = await fetch(`${API_BASE_URL}/${currentTab}/${currentDeleteId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to delete item');
    }

    cancelDelete();
    loadData(currentTab);
    alert(`${getTypeConfig(currentTab).singular} deleted successfully!`);
  } catch (error) {
    console.error('Error deleting item:', error);
    alert(error.message);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadUserInfo();

  // Load initial data
  loadData('projects');

  // Event listeners
  document.getElementById('logout-btn').addEventListener('click', logout);

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  document.getElementById('add-project-btn').addEventListener('click', () => editItem('projects'));
  document.getElementById('add-article-btn').addEventListener('click', () => editItem('articles'));
  document.getElementById('add-product-btn').addEventListener('click', () => editItem('products'));

  document.getElementById('close-modal-btn').addEventListener('click', closeModal);
  document.getElementById('cancel-modal-btn').addEventListener('click', closeModal);
  document.getElementById('edit-form').addEventListener('submit', saveItem);

  document.getElementById('cancel-delete-btn').addEventListener('click', cancelDelete);
  document.getElementById('confirm-delete-btn').addEventListener('click', deleteItem);

  // Close modals on overlay click
  document.getElementById('edit-modal').addEventListener('click', (e) => {
    if (e.target.id === 'edit-modal') closeModal();
  });
  document.getElementById('delete-modal').addEventListener('click', (e) => {
    if (e.target.id === 'delete-modal') cancelDelete();
  });

  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});

// Make functions globally available for onclick handlers
window.editItem = editItem;
window.confirmDelete = confirmDelete;
