// User profile page logic (for viewing other users)

document.addEventListener('DOMContentLoaded', async () => {
  updateNavigation();
  await loadUserProfile();
});

// Load user profile from URL parameter
async function loadUserProfile() {
  const userInfoDiv = document.getElementById('userInfo');
  const videosContainer = document.getElementById('videosContainer');

  try {
    // Get user ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    if (!userId) {
      userInfoDiv.innerHTML = '<p class="error-message">No user ID provided</p>';
      return;
    }

    // Load user profile
    userInfoDiv.innerHTML = '<p class="loading">Loading profile...</p>';
    videosContainer.innerHTML = '<p class="loading">Loading videos...</p>';
    
    const response = await getUserProfile(userId);
    
    // Display user info
    userInfoDiv.innerHTML = `
      <p><strong>Display Name:</strong> ${escapeHtml(response.user.display_name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(response.user.email)}</p>
      <p><strong>Role:</strong> ${escapeHtml(response.user.role)}</p>
      <p><strong>Member Since:</strong> ${formatDate(response.user.created_at)}</p>
      <p><strong>Total Videos:</strong> ${response.stats.total_videos}</p>
    `;

    // Load user videos
    const videos = response.videos || [];

    if (videos.length === 0) {
      videosContainer.innerHTML = '<p class="empty-state">This user hasn\'t submitted any videos yet.</p>';
      return;
    }

    videosContainer.innerHTML = videos.map(video => createVideoCard(video)).join('');
  } catch (error) {
    console.error('Error loading user profile:', error);
    userInfoDiv.innerHTML = `<p class="error-message">Error loading profile: ${error.message}</p>`;
    videosContainer.innerHTML = '';
  }
}

// Create video card HTML
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
