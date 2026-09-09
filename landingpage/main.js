import {INTRO_DURATION, introCaptionAt} from '/fomo/campuswars/village-intro.js?v=44';

const opening = document.getElementById('opening');
const video = document.getElementById('intro-video');
const page = document.getElementById('page');
const programs = document.getElementById('programs');
const pause = document.getElementById('pause-intro');
const replay = document.getElementById('replay-intro');
const progress = document.getElementById('film-progress');
const caption = document.getElementById('film-caption');
const title = document.getElementById('film-title');
const description = document.getElementById('film-description');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let active = false, pausedByUser = false, resumeOnVisible = false, finishTimer, raf = 0;

function paint() {
  const seconds = Math.min(INTRO_DURATION, video.currentTime || 0);
  const copy = introCaptionAt(seconds);
  title.textContent = copy.title;
  description.textContent = copy.description;
  caption.style.opacity = video.paused ? '1' : String(copy.copyOpacity * copy.opacity);
  caption.style.transform = `translateY(${video.paused ? 0 : copy.lift}px) scale(${video.paused ? 1 : copy.scale})`;
  progress.style.transform = `scaleX(${Math.min(1, seconds / INTRO_DURATION)})`;
}
function tick() {
  paint();
  if (active && !video.paused) raf = requestAnimationFrame(tick);
}
function syncPlayback() {
  cancelAnimationFrame(raf);
  pause.textContent = video.paused ? 'Play intro' : 'Pause intro';
  pause.setAttribute('aria-pressed', String(video.paused));
  if (video.readyState >= 2) video.classList.add('has-frame');
  if (active) tick();
}
function play() {
  const pending = video.play();
  if (pending) pending.catch(() => { if (active) syncPlayback(); });
}
function finish({scroll = true} = {}) {
  if (!active) return;
  active = false;
  cancelAnimationFrame(raf);
  video.pause();
  document.documentElement.classList.remove('intro-initial');
  document.body.classList.remove('intro-active');
  page.inert = false;
  opening.inert = true;
  if (scroll) {
    programs.focus({preventScroll: true});
    page.scrollIntoView({behavior: reduced.matches ? 'instant' : 'smooth', block: 'start'});
  }
  finishTimer = setTimeout(() => {
    const contentScroll = Math.max(0, window.scrollY - opening.offsetHeight);
    opening.hidden = true;
    if (scroll) window.scrollTo({top: contentScroll, behavior: 'instant'});
  }, reduced.matches ? 0 : 850);
}
function start({replay: replaying = false} = {}) {
  clearTimeout(finishTimer);
  active = true; pausedByUser = false; resumeOnVisible = false;
  document.documentElement.classList.remove('skip-intro');
  document.body.classList.add('intro-active');
  opening.hidden = false; opening.inert = false; page.inert = true;
  if (replaying) video.currentTime = 0;
  if (!video.getAttribute('src')) {
    video.src = matchMedia('(max-width:700px)').matches ? '/landingpage/assets/intro-mobile.mp4' : '/landingpage/assets/intro-desktop.mp4';
  }
  window.scrollTo({top: 0, behavior: 'instant'});
  paint();
  play();
  syncPlayback();
}
video.addEventListener('playing', syncPlayback);
video.addEventListener('pause', syncPlayback);
video.addEventListener('loadeddata', syncPlayback);
video.addEventListener('ended', () => finish());
video.addEventListener('error', () => finish());
pause.addEventListener('click', () => {
  if (!active) return;
  pausedByUser = !video.paused;
  if (video.paused) play(); else video.pause();
});
document.getElementById('skip-intro').addEventListener('click', () => finish());
document.querySelector('.skip-link').addEventListener('click', () => finish({scroll: false}));
document.addEventListener('keydown', event => { if (event.key === 'Escape') finish(); });
document.addEventListener('visibilitychange', () => {
  if (!active) return;
  if (document.hidden) { resumeOnVisible = !video.paused; video.pause(); }
  else if (resumeOnVisible && !pausedByUser) { resumeOnVisible = false; play(); }
});
reduced.addEventListener('change', () => { replay.hidden = reduced.matches; if (reduced.matches) finish(); });
replay.hidden = reduced.matches;
replay.addEventListener('click', () => { start({replay: true}); document.getElementById('skip-intro').focus({preventScroll: true}); });
if (!reduced.matches && !location.hash) start();
else { video.pause(); opening.hidden = true; document.documentElement.classList.remove('intro-initial'); }

if ('IntersectionObserver' in window && !reduced.matches) {
  const reveal = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('reveal');
      reveal.unobserve(entry.target);
    }
  }, {threshold: .08});
  document.querySelectorAll('.program-copy,.role-card,.creator-rate,.greek-steps').forEach(node => reveal.observe(node));
}
