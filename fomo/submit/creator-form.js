export const creatorRoutes = {
  ugc_application: {
    label: 'Your TikTok profile',
    placeholder: 'https://www.tiktok.com/@you',
    hint: 'Link the TikTok account with your previous UGC ad work so we can review it.',
    confirmation: 'This is my TikTok account, I have made UGC ads before, and my work is accessible for review.',
    button: 'apply with TikTok →',
  },
  concept_application: {
    label: 'Your concept video link',
    placeholder: 'https://…',
    hint: 'Explain your content ideas and what you can create on campus for fomo. A public or accessible unlisted video link works.',
    confirmation: 'This is my own concept video. It explains my ideas and what I can create on campus, and the link is accessible for review.',
    button: 'send my concept →',
  },
  paid_video: {
    label: 'Link to your TikTok video',
    placeholder: 'https://www.tiktok.com/@you/video/...',
    hint: 'Original, organic TikTok content only. No cross-posts, reposts, paid promotion, or purchased views. Keep it public until views are counted.',
    confirmation: 'I am an approved fomo creator. This is my original TikTok video, it is not cross-posted or previously submitted, and I have not bought views or paid to promote it. I will keep it public until views are counted.',
    button: 'send this video →',
  },
};

const hostIs = (host, domain) => host === domain || host.endsWith('.' + domain);
export function platformForLink(value) {
  try {
    const host = new URL(value).hostname.toLowerCase();
    if (hostIs(host, 'tiktok.com')) return 'TikTok';
  } catch {}
  return '';
}
export function validateCreatorLink(route, value, selectedPlatform = '') {
  if (!creatorRoutes[route]) return 'Choose how you want to apply or submit a video.';
  let url;
  try { url = new URL(value); } catch { return 'Paste a full link that we can open.'; }
  if (!['https:', 'http:'].includes(url.protocol)) return 'Use an http or https video link.';
  if (url.username || url.password) return 'Use a public link without login details in the address.';
  const platform = platformForLink(value);
  const path = url.pathname;
  if (route === 'ugc_application' && (platform !== 'TikTok' || !/^\/@[\w.-]+\/?$/.test(path))) {
    return 'Paste your TikTok profile link, such as https://www.tiktok.com/@yourhandle.';
  }
  if (route === 'paid_video') {
    const tiktokPost = platform === 'TikTok' && (/^\/@[\w.-]+\/video\/\d+\/?$/.test(path) ||
      (['vm.tiktok.com', 'vt.tiktok.com'].includes(url.hostname.toLowerCase()) && /^\/[\w-]+\/?$/.test(path)) || /^\/t\/[\w-]+\/?$/.test(path));
    if (!tiktokPost) return 'Paste a link to your TikTok video, not a profile or homepage. Only TikTok videos are eligible for pay per view.';
    if (selectedPlatform && selectedPlatform !== platform) return 'The selected platform does not match your video link.';
  }
  return '';
}

if (typeof document !== 'undefined') {
  const form = document.getElementById('subForm');
  const route = document.getElementById('submission-type');
  const url = document.getElementById('vurl');
  const platform = document.getElementById('plat');
  const handle = document.getElementById('creator-handle');
  function updateRoute() {
    const config = creatorRoutes[route.value];
    const paid = route.value === 'paid_video';
    document.getElementById('link-label').textContent = config?.label || 'Your TikTok or video link';
    document.getElementById('link-hint').textContent = config?.hint || 'Choose a submission type above, then paste your link.';
    url.placeholder = config?.placeholder || 'https://…';
    document.getElementById('platform-field').hidden = !paid;
    platform.disabled = !paid;
    platform.value = paid ? 'TikTok' : '';
    handle.required = paid || route.value === 'ugc_application';
    document.getElementById('handle-label').textContent = handle.required ? 'Your social handle' : 'Your social handle (optional)';
    form.elements.c_rules.checked = false;
    document.getElementById('submission-confirmation').textContent = config?.confirmation || 'The account or video is mine, the information is accurate, and my link is accessible for review.';
    document.getElementById('submission-button').textContent = config?.button || 'send for review →';
    document.getElementById('submission-note').textContent = paid ? 'for approved creators' : 'creator approval comes first';
    document.getElementById('submission-explanation').textContent = paid
      ? 'We review each post within five business days. For approved posts, qualifying views are measured 30 days after submission and paid on the next 1st or 15th.'
      : 'We email you a decision within five business days. The one-time $25 bonus is paid when you are approved as a creator. Approval also unlocks pay per view for original, organic TikTok videos. Sending an application does not automatically approve you.';
    document.querySelector('.done h2').textContent = paid ? 'video sent.' : 'application sent.';
    document.querySelector('.done .msg').textContent = paid
      ? 'We email you a decision within five business days. For approved posts, qualifying views are measured 30 days after submission and paid on the next 1st or 15th.'
      : 'We email you a decision within five business days. The one-time $25 bonus is paid when your creator application is approved. You can then submit original, organic TikTok videos for pay per view.';
  }
  route.addEventListener('change', updateRoute);
  document.querySelectorAll('[data-creator-route]').forEach(link => link.addEventListener('click', () => {
    route.value = link.dataset.creatorRoute;
    updateRoute();
  }));
  updateRoute();
  wireForm(form, {
    extra(showErr) {
      const error = validateCreatorLink(route.value, url.value.trim(), platform.value);
      if (!error) return null;
      const field = creatorRoutes[route.value] ? url : route;
      showErr(field, error);
      return field;
    },
  });
}
