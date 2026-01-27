// Edit profile page logic

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  const user = getUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  await loadExistingProfile(user.id);

  const form = document.getElementById('editProfileForm');
  const errorMessage = document.getElementById('errorMessage');
  const successMessage = document.getElementById('successMessage');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';

    const displayName = document.getElementById('display_name').value.trim();
    const profileData = collectProfileFormData();

    try {
      if (displayName !== getUser().display_name) {
        await updateDisplayName(displayName);
        // Update localStorage with new display name
        const user = getUser();
        user.display_name = displayName;
        localStorage.setItem('user', JSON.stringify(user));
      }
      await updateMyProfile(profileData);
      successMessage.textContent = 'Profile updated successfully.';
      successMessage.style.display = 'block';
      setTimeout(() => {
        window.location.href = 'profile.html';
      }, 1500);
    } catch (err) {
      errorMessage.textContent = err.message || 'Failed to update profile.';
      errorMessage.style.display = 'block';
    }
  });
});

async function loadExistingProfile(userId) {
  try {
    const userResponse = await getUserProfile(userId);
    const user = userResponse.user;
    const result = await getUserProfileById(userId);
    const p = result.profile || {};

    document.getElementById('display_name').value = user.display_name || '';
    document.getElementById('real_name').value = p.real_name || '';
    document.getElementById('avatar_url').value = p.avatar_url || '';
    document.getElementById('primary_position').value = p.primary_position || '';
    document.getElementById('secondary_position').value = p.secondary_position || '';
    document.getElementById('height_cm').value = p.height_cm ?? '';
    document.getElementById('weight_kg').value = p.weight_kg ?? '';
    document.getElementById('dominant_foot').value = p.dominant_foot || '';
    document.getElementById('current_team').value = p.current_team || '';
    document.getElementById('previous_teams').value = (p.previous_teams || []).join(', ');
    document.getElementById('league_level').value = p.league_level || '';
    document.getElementById('location').value = p.location || '';
    document.getElementById('years_experience').value = p.years_experience ?? '';
    document.getElementById('birthdate').value = p.birthdate ? p.birthdate.split('T')[0] : '';
    document.getElementById('bio').value = p.bio || '';
    document.getElementById('style_of_play').value = p.style_of_play || '';
    document.getElementById('strengths').value = p.strengths || '';
    document.getElementById('weaknesses').value = p.weaknesses || '';
    document.getElementById('availability').value = p.availability || '';
    document.getElementById('preferred_contact').value = p.preferred_contact || '';
    
    // Load social links
    const socialLinks = p.social_links || {};
    document.getElementById('social_instagram').value = socialLinks.instagram || '';
    document.getElementById('social_twitter').value = socialLinks.twitter || '';
    document.getElementById('social_facebook').value = socialLinks.facebook || '';
    document.getElementById('social_linkedin').value = socialLinks.linkedin || '';
    document.getElementById('social_tiktok').value = socialLinks.tiktok || '';
    document.getElementById('social_youtube').value = socialLinks.youtube || '';
    document.getElementById('social_website').value = socialLinks.website || '';
    document.getElementById('social_other').value = socialLinks.other || '';
    
    // Load custom links
    const customLinks = p.custom_links || [];
    const container = document.getElementById('customLinksContainer');
    container.innerHTML = '';
    if (customLinks.length === 0) {
      addCustomLink();
    } else {
      customLinks.forEach(link => {
        addCustomLink(link.label, link.url);
      });
    }
  } catch (err) {
    console.error('Error loading existing profile', err);
  }
}

function addCustomLink(label = '', url = '') {
  const container = document.getElementById('customLinksContainer');
  const linkItem = document.createElement('div');
  linkItem.className = 'custom-link-item';
  linkItem.style.cssText = 'margin-bottom: 1rem; padding: 1rem; border: 1px solid #ddd; border-radius: 5px;';
  linkItem.innerHTML = `
    <div class="form-group" style="margin-bottom: 0.5rem;">
      <label>Link Label (e.g., "Sponsor", "Fundraising", "Charity")</label>
      <input type="text" class="custom-link-label" placeholder="Sponsor" maxlength="100" value="${escapeHtml(label)}" />
    </div>
    <div class="form-group" style="margin-bottom: 0.5rem;">
      <label>URL</label>
      <input type="url" class="custom-link-url" placeholder="https://..." value="${escapeHtml(url)}" />
    </div>
    <button type="button" class="btn" style="background: #dc3545; color: white; padding: 0.4rem 1rem; width: auto;" onclick="removeCustomLink(this)">Remove</button>
  `;
  container.appendChild(linkItem);
}

function removeCustomLink(button) {
  button.closest('.custom-link-item').remove();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function collectProfileFormData() {
  const previousTeamsStr = document.getElementById('previous_teams').value || '';
  const previous_teams = previousTeamsStr
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);

  const social_links = {};
  const instagram = document.getElementById('social_instagram').value.trim();
  const twitter = document.getElementById('social_twitter').value.trim();
  const facebook = document.getElementById('social_facebook').value.trim();
  const linkedin = document.getElementById('social_linkedin').value.trim();
  const tiktok = document.getElementById('social_tiktok').value.trim();
  const youtube = document.getElementById('social_youtube').value.trim();
  const website = document.getElementById('social_website').value.trim();
  const other = document.getElementById('social_other').value.trim();
  
  if (instagram) social_links.instagram = instagram;
  if (twitter) social_links.twitter = twitter;
  if (facebook) social_links.facebook = facebook;
  if (linkedin) social_links.linkedin = linkedin;
  if (tiktok) social_links.tiktok = tiktok;
  if (youtube) social_links.youtube = youtube;
  if (website) social_links.website = website;
  if (other) social_links.other = other;

  const custom_links = [];
  const customLinkItems = document.querySelectorAll('.custom-link-item');
  customLinkItems.forEach(item => {
    const label = item.querySelector('.custom-link-label').value.trim();
    const url = item.querySelector('.custom-link-url').value.trim();
    if (label && url) {
      custom_links.push({ label, url });
    }
  });

  return {
    avatar_url: document.getElementById('avatar_url').value,
    real_name: document.getElementById('real_name').value,
    primary_position: document.getElementById('primary_position').value,
    secondary_position: document.getElementById('secondary_position').value,
    height_cm: document.getElementById('height_cm').value,
    weight_kg: document.getElementById('weight_kg').value,
    dominant_foot: document.getElementById('dominant_foot').value,
    current_team: document.getElementById('current_team').value,
    previous_teams,
    league_level: document.getElementById('league_level').value,
    location: document.getElementById('location').value,
    years_experience: document.getElementById('years_experience').value,
    birthdate: document.getElementById('birthdate').value || null,
    bio: document.getElementById('bio').value,
    style_of_play: document.getElementById('style_of_play').value,
    strengths: document.getElementById('strengths').value,
    weaknesses: document.getElementById('weaknesses').value,
    availability: document.getElementById('availability').value,
    preferred_contact: document.getElementById('preferred_contact').value,
    social_links,
    custom_links
  };
}
