// API communication functions

// Make API request
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Add auth token if available
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// Auth API
async function register(email, password, display_name, role) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, display_name, role })
  });
}

async function login(email, password) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

// Videos API //comment: public and protected video endpoints
async function getVideos() {
  return apiRequest('/videos', {
    method: 'GET'
  });
}

async function getUserVideos(userId) {
  return apiRequest(`/videos/users/${userId}`, {
    method: 'GET'
  });
}

async function submitVideo(videoData) {
  return apiRequest('/videos', {
    method: 'POST',
    body: JSON.stringify(videoData)
  });
}

// User API //comment: basic user listing/profile
async function getUserProfile(userId) {
  return apiRequest(`/users/${userId}`, {
    method: 'GET'
  });
}

async function getAllUsers() {
  return apiRequest('/users', {
    method: 'GET'
  });
}

// Profile API //comment: structured CV-style profile endpoints
async function getUserProfileById(userId) {
  return apiRequest(`/users/${userId}/profile`, {
    method: 'GET'
  });
}

async function updateMyProfile(profileData) {
  return apiRequest('/users/me/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  });
}

// Auth API - Change Password
async function changePassword(currentPassword, newPassword) {
  return apiRequest('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword
    })
  });
}
