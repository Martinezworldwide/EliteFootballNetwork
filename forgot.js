document.addEventListener('DOMContentLoaded', () => {
  if (isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const step3 = document.getElementById('step3');
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  const verifyAnswerForm = document.getElementById('verifyAnswerForm');
  const errorMessage = document.getElementById('errorMessage');
  const securityQuestionEl = document.getElementById('securityQuestion');
  const resetLinkEl = document.getElementById('resetLink');
  
  let currentEmail = '';

  forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.style.display = 'none';

    const email = document.getElementById('email').value;
    currentEmail = email;

    try {
      const response = await forgotPassword(email);
      securityQuestionEl.textContent = response.security_question;
      step1.style.display = 'none';
      step2.style.display = 'block';
    } catch (error) {
      errorMessage.textContent = error.message || 'Failed to retrieve security question.';
      errorMessage.style.display = 'block';
    }
  });

  verifyAnswerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.style.display = 'none';

    const security_answer = document.getElementById('security_answer').value;

    try {
      const response = await verifySecurityAnswer(currentEmail, security_answer);
      const fullResetUrl = `${window.location.origin}${window.location.pathname.replace('forgot.html', 'reset.html')}?token=${response.reset_token}`;
      resetLinkEl.href = fullResetUrl;
      step2.style.display = 'none';
      step3.style.display = 'block';
    } catch (error) {
      errorMessage.textContent = error.message || 'Incorrect security answer.';
      errorMessage.style.display = 'block';
    }
  });
});
