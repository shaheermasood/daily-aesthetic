const API_BASE_URL = 'http://localhost:3000/api';

// Check if already logged in
function checkAuth() {
  const token = localStorage.getItem('adminToken');
  if (token) {
    // Redirect to dashboard
    window.location.href = 'index.html';
  }
}

// Show error message
function showError(message) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
  errorDiv.classList.remove('hidden');
}

// Hide error message
function hideError() {
  const errorDiv = document.getElementById('error-message');
  errorDiv.classList.add('hidden');
}

// Handle login form submission
async function handleLogin(e) {
  e.preventDefault();
  hideError();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const loginBtn = document.getElementById('login-btn');

  // Disable button
  loginBtn.disabled = true;
  loginBtn.textContent = 'Signing in...';

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Store token and user info
    localStorage.setItem('adminToken', data.token);
    localStorage.setItem('adminUser', JSON.stringify(data.user));

    // Redirect to dashboard
    window.location.href = 'index.html';
  } catch (error) {
    showError(error.message);
    loginBtn.disabled = false;
    loginBtn.textContent = 'Sign In';
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();

  const form = document.getElementById('login-form');
  form.addEventListener('submit', handleLogin);

  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});
