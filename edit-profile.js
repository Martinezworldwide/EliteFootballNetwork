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

    const profileData = collectProfileFormData();

    try {
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
    const result = await getUserProfileById(userId);
    const p = result.profile || {};

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
  } catch (err) {
    console.error('Error loading existing profile', err);
  }
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

  return {
    avatar_url: document.getElementById('avatar_url').value,
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
    social_links
  };
}
