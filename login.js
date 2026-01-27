// Login page logic

document.addEventListener('DOMContentLoaded', () => {
  // Redirect if already logged in
  if (isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  const form = document.getElementById('loginForm');
  const errorMessage = document.getElementById('errorMessage');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.style.display = 'none';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const response = await login(email, password);
      
      // Save auth data
      saveAuth(response.token, response.user);
      
      // Redirect to feed
      window.location.href = 'index.html';
    } catch (error) {
      errorMessage.textContent = error.message || 'Login failed. Please check your credentials.';
      errorMessage.style.display = 'block';
    }
  });
});
