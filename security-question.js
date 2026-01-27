document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  const statusInfo = document.getElementById('statusInfo');
  const currentQuestionInfo = document.getElementById('currentQuestionInfo');
  const currentQuestionEl = document.getElementById('currentQuestion');
  const securityFormContainer = document.getElementById('securityFormContainer');
  const securityQuestionForm = document.getElementById('securityQuestionForm');
  const errorMessage = document.getElementById('errorMessage');
  const successMessage = document.getElementById('successMessage');
  const submitButton = document.getElementById('submitButton');

  try {
    const status = await getSecurityQuestionStatus();
    
    if (status.has_security_question && status.security_question) {
      statusInfo.innerHTML = `
        <p><strong>Status:</strong> <span style="color: green;">Security question is set</span></p>
        ${status.updated_at ? `<p><strong>Last Updated:</strong> ${new Date(status.updated_at).toLocaleDateString()}</p>` : ''}
      `;
      currentQuestionEl.textContent = status.security_question;
      currentQuestionInfo.style.display = 'block';
    } else {
      statusInfo.innerHTML = `
        <p><strong>Status:</strong> <span style="color: orange;">No security question set</span></p>
        <p>Set up a security question to enable password recovery if you forget your password.</p>
      `;
      currentQuestionInfo.style.display = 'none';
    }
  } catch (error) {
    statusInfo.innerHTML = `<p class="error-message">Error loading security settings: ${error.message}</p>`;
  }

  securityQuestionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
    submitButton.disabled = true;
    submitButton.textContent = 'Saving...';

    const current_password = document.getElementById('current_password').value;
    const security_question = document.getElementById('security_question').value;
    const security_answer = document.getElementById('security_answer').value;

    try {
      await updateSecurityQuestion(current_password, security_question, security_answer);
      
      successMessage.textContent = 'Security question updated successfully!';
      successMessage.style.display = 'block';
      
      securityQuestionForm.reset();
      
      setTimeout(async () => {
        const status = await getSecurityQuestionStatus();
        if (status.has_security_question && status.security_question) {
          statusInfo.innerHTML = `
            <p><strong>Status:</strong> <span style="color: green;">Security question is set</span></p>
            ${status.updated_at ? `<p><strong>Last Updated:</strong> ${new Date(status.updated_at).toLocaleDateString()}</p>` : ''}
          `;
          currentQuestionEl.textContent = status.security_question;
          currentQuestionInfo.style.display = 'block';
        }
      }, 500);
    } catch (error) {
      errorMessage.textContent = error.message || 'Failed to update security question.';
      errorMessage.style.display = 'block';
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Save Security Question';
    }
  });
});
