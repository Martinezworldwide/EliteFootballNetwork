document.addEventListener('DOMContentLoaded', () => {
  if (isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (!token) {
    document.getElementById('errorMessage').textContent = 'Invalid reset link. Please request a new password reset.';
    document.getElementById('errorMessage').style.display = 'block';
    document.getElementById('resetFormContainer').style.display = 'none';
    return;
  }

  const resetPasswordForm = document.getElementById('resetPasswordForm');
  const errorMessage = document.getElementById('errorMessage');
  const successMessage = document.getElementById('successMessage');
  const resetFormContainer = document.getElementById('resetFormContainer');

  resetPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';

    const new_password = document.getElementById('new_password').value;
    const confirm_password = document.getElementById('confirm_password').value;

    if (new_password !== confirm_password) {
      errorMessage.textContent = 'Passwords do not match.';
      errorMessage.style.display = 'block';
      return;
    }

    if (new_password.length < 6) {
      errorMessage.textContent = 'Password must be at least 6 characters.';
      errorMessage.style.display = 'block';
      return;
    }

    try {
      await resetPassword(token, new_password);
      resetFormContainer.style.display = 'none';
      successMessage.style.display = 'block';
    } catch (error) {
      errorMessage.textContent = error.message || 'Failed to reset password. Token may be invalid or expired.';
      errorMessage.style.display = 'block';
    }
  });
});
