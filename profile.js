// Profile page logic

document.addEventListener('DOMContentLoaded', async () => {
  // Require authentication //comment: only logged-in users can see their profile
  if (!requireAuth()) {
    return;
  }

  const downloadCvBtn = document.getElementById('downloadCvBtn');
  if (downloadCvBtn) {
    downloadCvBtn.addEventListener('click', async () => {
      const user = getUser();
      if (user && user.id) {
        await downloadUserCV(user.id);
      }
    });
  }

  const shareProfileBtn = document.getElementById('shareProfileBtn');
  if (shareProfileBtn) {
    shareProfileBtn.addEventListener('click', () => {
      const user = getUser();
      if (user && user.id) {
        shareProfile(user.id);
      }
    });
  }

  await loadProfile();
});

// Load user profile and videos
async function loadProfile() {
  const userInfoDiv = document.getElementById('userInfo');
  const scoutingCard = document.getElementById('scoutingCard');
  const videosContainer = document.getElementById('videosContainer');

  try {
    const user = getUser();
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    // Basic user info
    userInfoDiv.innerHTML = `
      <p><strong>Email:</strong> ${escapeHtml(user.email)}</p>
      <p><strong>Display Name:</strong> ${escapeHtml(user.display_name)}</p>
      <p><strong>Role:</strong> ${escapeHtml(user.role)}</p>
      <p><a href="edit-profile.html">Edit Profile</a></p>
    `;

    // Load structured profile //comment: fetch CV-style profile data
    scoutingCard.innerHTML = '<p class="loading">Loading detailed profile...</p>';
    const profileResponse = await getUserProfileById(user.id);
    renderScoutingCard(scoutingCard, profileResponse.profile || {});

    // Load user videos
    videosContainer.innerHTML = '<p class="loading">Loading videos...</p>';
    const response = await getUserVideos(user.id);
    const videos = response.videos || [];

    if (videos.length === 0) {
      // comment: show message when user has no videos yet (string uses single backslash to escape apostrophe)
      videosContainer.innerHTML = '<p class="empty-state">You haven\'t submitted any videos yet. <a href="submit.html">Submit your first video</a>!</p>';
      return;
    }

    videosContainer.innerHTML = videos.map((video) => createVideoCard(video)).join('');
  } catch (error) {
    console.error('Error loading profile:', error);
    videosContainer.innerHTML = `<p class="error-message">Error loading profile: ${error.message}</p>`;
  }
}

// Render scouting-style profile card //comment: show CV data in sections
function renderScoutingCard(container, p) {
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

