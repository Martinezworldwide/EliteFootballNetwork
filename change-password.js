// Change password page logic

document.addEventListener('DOMContentLoaded', () => {
  // Require authentication
  if (!requireAuth()) {
    return;
  }

  const form = document.getElementById('changePasswordForm');
  const errorMessage = document.getElementById('errorMessage');
  const successMessage = document.getElementById('successMessage');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';

    const currentPassword = document.getElementById('current_password').value;
    const newPassword = document.getElementById('new_password').value;
    const confirmPassword = document.getElementById('confirm_password').value;

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      errorMessage.textContent = 'New passwords do not match';
      errorMessage.style.display = 'block';
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      errorMessage.textContent = 'New password must be at least 6 characters';
      errorMessage.style.display = 'block';
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      
      successMessage.textContent = 'Password changed successfully!';
      successMessage.style.display = 'block';
      
      // Clear form
      form.reset();
      
      // Redirect to profile after 2 seconds
      setTimeout(() => {
        window.location.href = 'profile.html';
      }, 2000);
    } catch (error) {
      errorMessage.textContent = error.message || 'Failed to change password. Please check your current password.';
      errorMessage.style.display = 'block';
    }
  });
});
