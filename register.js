// Registration page logic

document.addEventListener('DOMContentLoaded', () => {
  // Redirect if already logged in
  if (isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  const form = document.getElementById('registerForm');
  const errorMessage = document.getElementById('errorMessage');
  const successMessage = document.getElementById('successMessage');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const display_name = document.getElementById('display_name').value;
    const role = document.getElementById('role').value;
    const security_question = document.getElementById('security_question').value;
    const security_answer = document.getElementById('security_answer').value;

    try {
      await register(email, password, display_name, role, security_question, security_answer);
      
      successMessage.textContent = 'Registration successful! Redirecting to login...';
      successMessage.style.display = 'block';
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    } catch (error) {
      errorMessage.textContent = error.message || 'Registration failed. Please try again.';
      errorMessage.style.display = 'block';
    }
  });
});
