// Main feed page logic

// Load videos on page load
document.addEventListener('DOMContentLoaded', async () => {
  updateNavigation();
  await loadVideos();
});

// Load and display videos
async function loadVideos() {
  const container = document.getElementById('videosContainer');
  
  try {
    container.innerHTML = '<p class="loading">Loading videos...</p>';
    
    const response = await getVideos();
    const videos = response.videos || [];

    if (videos.length === 0) {
      container.innerHTML = '<p class="empty-state">No videos yet. Be the first to submit one!</p>';
      return;
    }

    container.innerHTML = videos.map(video => createVideoCard(video)).join('');
  } catch (error) {
    console.error('Error loading videos:', error);
    container.innerHTML = `<p class="error-message">Error loading videos: ${error.message}</p>`;
  }
}

// Create video card HTML
function createVideoCard(video) {
  const embedUrl = getEmbedUrl(video.youtube_url);
  if (!embedUrl) return '';

  const date = formatDate(video.created_at);
  const userInfo = video.user ? `<p class="video-user">By ${video.user.display_name} (${video.user.role})</p>` : '';

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
        ${userInfo}
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
