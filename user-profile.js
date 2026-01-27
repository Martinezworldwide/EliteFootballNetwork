// User profile page logic (for viewing other users)

document.addEventListener('DOMContentLoaded', async () => {
  updateNavigation();
  
  const downloadCvBtn = document.getElementById('downloadCvBtn');
  if (downloadCvBtn) {
    downloadCvBtn.addEventListener('click', async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get('id');
      if (userId) {
        await downloadUserCV(userId);
      }
    });
  }

  const shareProfileBtn = document.getElementById('shareProfileBtn');
  if (shareProfileBtn) {
    shareProfileBtn.addEventListener('click', () => {
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get('id');
      if (userId) {
        shareProfile(userId);
      }
    });
  }
  
  await loadUserProfile();
});

// Load user profile from URL parameter
async function loadUserProfile() {
  const userInfoDiv = document.getElementById('userInfo');
  const scoutingCard = document.getElementById('publicScoutingCard');
  const videosContainer = document.getElementById('videosContainer');

  try {
    // Get user ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    if (!userId) {
      userInfoDiv.innerHTML = '<p class="error-message">No user ID provided</p>';
      return;
    }

    // Load basic public profile (no email) //comment: uses /users/:id/profile
    userInfoDiv.innerHTML = '<p class="loading">Loading profile...</p>';
    scoutingCard.innerHTML = '<p class="loading">Loading scouting data...</p>';
    videosContainer.innerHTML = '<p class="loading">Loading videos...</p>';

    const publicProfile = await getUserProfileById(userId);

    userInfoDiv.innerHTML = `
      <p><strong>Display Name:</strong> ${escapeHtml(publicProfile.user.display_name)}</p>
      <p><strong>Role:</strong> ${escapeHtml(publicProfile.user.role)}</p>
      <p><strong>Member Since:</strong> ${formatDate(publicProfile.user.created_at)}</p>
    `;

    renderPublicScoutingCard(scoutingCard, publicProfile.profile || {});

    // Load user videos using videos endpoint (reuses existing API)
    const videosResponse = await getUserVideos(userId);
    const videos = videosResponse.videos || [];

    if (videos.length === 0) {
      videosContainer.innerHTML = '<p class="empty-state">This user hasn\'t submitted any videos yet.</p>';
      return;
    }

    videosContainer.innerHTML = videos.map((video) => createVideoCard(video)).join('');
  } catch (error) {
    console.error('Error loading user profile:', error);
    userInfoDiv.innerHTML = `<p class="error-message">Error loading profile: ${error.message}</p>`;
    scoutingCard.innerHTML = '';
    videosContainer.innerHTML = '';
  }
}

// Render public scouting-style profile card //comment: only non-sensitive fields
function renderPublicScoutingCard(container, p) {
  const previousTeams = (p.previous_teams || []).join(', ');

  const vitals = [];
  if (p.height_cm) vitals.push(`${p.height_cm} cm`);
  if (p.weight_kg) vitals.push(`${p.weight_kg} kg`);
  if (p.dominant_foot) vitals.push(`Dominant foot: ${p.dominant_foot}`);

  const experience = [];
  if (p.years_experience !== null && p.years_experience !== undefined) {
    experience.push(`${p.years_experience} years experience`);
  }
  if (p.league_level) experience.push(p.league_level);
  if (p.location) experience.push(p.location);

  const avatar = p.avatar_url
    ? `<div style="text-align:center;margin-bottom:1rem;"><img src="${escapeHtml(
        p.avatar_url
      )}" alt="Avatar" style="max-width:120px;border-radius:50%;object-fit:cover;"></div>`
    : '';

  // Calculate age from birthdate
  let ageText = '';
  if (p.birthdate) {
    const birthDate = new Date(p.birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    ageText = `Age: ${age} • `;
  }

  // Social links HTML
  let socialLinksHtml = '';
  if (p.social_links && Object.keys(p.social_links).length > 0) {
    const platformNames = {
      instagram: 'Instagram',
      twitter: 'Twitter',
      facebook: 'Facebook',
      linkedin: 'LinkedIn',
      tiktok: 'TikTok',
      youtube: 'YouTube',
      website: 'Website',
      other: 'Other'
    };
    
    const links = [];
    for (const [platform, url] of Object.entries(p.social_links)) {
      if (url) {
        const platformName = platformNames[platform] || platform.charAt(0).toUpperCase() + platform.slice(1);
        links.push(`<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(platformName)}</a>`);
      }
    }
    if (links.length > 0) {
      socialLinksHtml = `<p><strong>Social Media & Links:</strong> ${links.join(' • ')}</p>`;
    }
  }

  // Custom links HTML
  let customLinksHtml = '';
  if (p.custom_links && Array.isArray(p.custom_links) && p.custom_links.length > 0) {
    const customLinks = p.custom_links.map(link => {
      if (link.label && link.url) {
        return `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)}</a>`;
      }
      return '';
    }).filter(Boolean);
    if (customLinks.length > 0) {
      customLinksHtml = `<p><strong>Additional Links:</strong> ${customLinks.join(' • ')}</p>`;
    }
  }

  container.innerHTML = `
    ${avatar}
    ${p.real_name ? `<p><strong>Real Name:</strong> ${escapeHtml(p.real_name)}</p>` : ''}
    <p><strong>Primary Position:</strong> ${escapeHtml(p.primary_position || '')}</p>
    <p><strong>Secondary Position:</strong> ${escapeHtml(p.secondary_position || '')}</p>
    <p><strong>Vitals:</strong> ${ageText}${escapeHtml(vitals.join(' • ') || 'N/A')}</p>
    <p><strong>Current Team:</strong> ${escapeHtml(p.current_team || 'N/A')}</p>
    <p><strong>Previous Teams:</strong> ${escapeHtml(previousTeams || 'N/A')}</p>
    <p><strong>Experience & Location:</strong> ${escapeHtml(experience.join(' • ') || 'N/A')}</p>
    <p><strong>Bio:</strong> ${escapeHtml(p.bio || '')}</p>
    <p><strong>Style of Play:</strong> ${escapeHtml(p.style_of_play || '')}</p>
    <p><strong>Strengths:</strong> ${escapeHtml(p.strengths || '')}</p>
    <p><strong>Weaknesses:</strong> ${escapeHtml(p.weaknesses || '')}</p>
    <p><strong>Availability:</strong> ${escapeHtml(p.availability || '')}</p>
    <p><strong>Preferred Contact:</strong> ${escapeHtml(p.preferred_contact || '')}</p>
    ${socialLinksHtml}
    ${customLinksHtml}
  `;
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
