// Authentication utilities

// Get token from localStorage
function getToken() {
  return localStorage.getItem('token');
}

// Get user from localStorage
function getUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Save token and user to localStorage
function saveAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

// Clear authentication
function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// Check if user is authenticated
function isAuthenticated() {
  return getToken() !== null;
}

// Get auth headers for API requests
function getAuthHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

// Logout function
function logout() {
  clearAuth();
  window.location.href = 'index.html';
}

// Update navigation based on auth status
function updateNavigation() {
  const isAuth = isAuthenticated();
  const loginLink = document.getElementById('loginLink');
  const registerLink = document.getElementById('registerLink');
  const submitLink = document.getElementById('submitLink');
  const profileLink = document.getElementById('profileLink');
  const logoutLink = document.getElementById('logoutLink');

  if (loginLink) loginLink.style.display = isAuth ? 'none' : 'inline';
  if (registerLink) registerLink.style.display = isAuth ? 'none' : 'inline';
  if (submitLink) submitLink.style.display = isAuth ? 'inline' : 'none';
  if (profileLink) profileLink.style.display = isAuth ? 'inline' : 'none';
  if (logoutLink) logoutLink.style.display = isAuth ? 'inline' : 'none';
}

// Redirect to login if not authenticated
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}
