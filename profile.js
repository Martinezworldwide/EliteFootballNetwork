// Profile page logic

document.addEventListener('DOMContentLoaded', async () => {
  // Require authentication
  if (!requireAuth()) {
    return;
  }

  await loadProfile();
});

// Load user profile and videos
async function loadProfile() {
  const userInfoDiv = document.getElementById('userInfo');
  const videosContainer = document.getElementById('videosContainer');

  try {
    const user = getUser();
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    // Display user info
    userInfoDiv.innerHTML = `
      <p><strong>Email:</strong> ${escapeHtml(user.email)}</p>
      <p><strong>Display Name:</strong> ${escapeHtml(user.display_name)}</p>
      <p><strong>Role:</strong> ${escapeHtml(user.role)}</p>
    `;

    // Load user videos
    videosContainer.innerHTML = '<p class="loading">Loading videos...</p>';
    
    const response = await getUserVideos(user.id);
    const videos = response.videos || [];

    if (videos.length === 0) {
      videosContainer.innerHTML = '<p class="empty-state">You haven\'t submitted any videos yet. <a href="submit.html">Submit your first video</a>!</p>';
      return;
    }

    videosContainer.innerHTML = videos.map(video => createVideoCard(video)).join('');
  } catch (error) {
    console.error('Error loading profile:', error);
    videosContainer.innerHTML = `<p class="error-message">Error loading profile: ${error.message}</p>`;
  }
}

// Create video card HTML (reuse from index.js)
function createVideoCard(video) {
  const embedUrl = getEmbedUrl(video.youtube_url);
  if (!embedUrl) return '';

  const date = formatDate(video.created_at);

  return `
    <div class="video-card">
      <div class="video-embed">
        <iframe src="${embedUrl}" allowfullscreen></iframe>
      </div>
      <div class="video-info">
        <h3>${escapeHtml(video.title)}</h3>
        <div class="video-meta">
          ${video.position ? `<span>📍 ${escapeHtml(video.position)}</span>` : ''}
          ${video.team ? `<span>⚽ ${escapeHtml(video.team)}</span>` : ''}
          <span>📅 ${date}</span>
        </div>
        ${video.description ? `<p class="video-description">${escapeHtml(video.description)}</p>` : ''}
        ${video.tags ? `<p class="video-meta">🏷️ ${escapeHtml(video.tags)}</p>` : ''}
      </div>
    </div>
  `;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
