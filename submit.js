// Video submission page logic

document.addEventListener('DOMContentLoaded', () => {
  // Require authentication
  if (!requireAuth()) {
    return;
  }

  const form = document.getElementById('submitForm');
  const errorMessage = document.getElementById('errorMessage');
  const successMessage = document.getElementById('successMessage');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';

    const youtube_url = document.getElementById('youtube_url').value;
    const title = document.getElementById('title').value;
    const position = document.getElementById('position').value;
    const team = document.getElementById('team').value;
    const tags = document.getElementById('tags').value;
    const description = document.getElementById('description').value;

    try {
      await submitVideo({
        youtube_url,
        title,
        position,
        team,
        tags,
        description
      });

      successMessage.textContent = 'Video submitted successfully!';
      successMessage.style.display = 'block';
      
      // Reset form
      form.reset();
      
      // Redirect to feed after 2 seconds
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
    } catch (error) {
      errorMessage.textContent = error.message || 'Failed to submit video. Please check your YouTube URL and try again.';
      errorMessage.style.display = 'block';
    }
  });
});
