import {INTRO_DURATION, introCaptionAt} from '/fomo/campuswars/village-intro.js?v=44';

const opening = document.getElementById('opening');
const video = document.getElementById('intro-video');
const page = document.getElementById('page');
const programs = document.getElementById('programs');
const replay = document.getElementById('replay-intro');
const progress = document.getElementById('film-progress');
const caption = document.getElementById('film-caption');
const title = document.getElementById('film-title');
const description = document.getElementById('film-description');
const transition = document.getElementById('intro-transition');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let active = false, resumeOnVisible = false, finishTimer, raf = 0;

function paint() {
  const seconds = Math.min(INTRO_DURATION, video.currentTime || 0);
  const copy = introCaptionAt(seconds);
  title.textContent = copy.index === 1 ? "IF YOU'RE IN A CHAPTER." : copy.title;
  description.textContent = copy.description;
  caption.style.opacity = video.paused ? '1' : String(copy.copyOpacity * copy.opacity);
  caption.style.transform = `translateY(${video.paused ? 0 : copy.lift}px) scale(${video.paused ? 1 : copy.scale})`;
  progress.style.transform = `scaleX(${Math.min(1, seconds / INTRO_DURATION)})`;
  transition.style.setProperty('--outro', String(Math.max(0, Math.min(1, (seconds - (INTRO_DURATION - 1.4)) / 1.4))));
}
function tick() {
  paint();
  if (active && !video.paused) raf = requestAnimationFrame(tick);
}
function syncPlayback() {
  cancelAnimationFrame(raf);
  if (video.readyState >= 2) video.classList.add('has-frame');
  if (active) tick();
}
function play() {
  const pending = video.play();
  if (pending) pending.catch(() => { if (active) finish(); });
}
function finish({scroll = true, cinematic = false} = {}) {
  if (!active) return;
  active = false;
  cancelAnimationFrame(raf);
  video.pause();
  opening.inert = true;
  const revealPage = () => {
    opening.hidden = true;
    document.documentElement.classList.remove('intro-initial');
    document.body.classList.remove('intro-active');
    page.inert = false;
    if (scroll) {
      window.scrollTo({top: 0, behavior: 'instant'});
      programs.focus({preventScroll: true});
    }
    if (cinematic && !reduced.matches) {
      page.classList.add('hero-arriving');
      transition.classList.add('is-leaving');
      finishTimer = setTimeout(() => {
        transition.hidden = true;
        page.classList.remove('hero-arriving');
      }, 900);
    } else transition.hidden = true;
  };
  if (cinematic && !reduced.matches) {
    transition.style.setProperty('--outro', '1');
    finishTimer = setTimeout(revealPage, 320);
  } else revealPage();
}
function start({replay: replaying = false} = {}) {
  clearTimeout(finishTimer);
  active = true; resumeOnVisible = false;
  transition.hidden = false;
  transition.classList.remove('is-leaving');
  transition.style.setProperty('--outro', '0');
  page.classList.remove('hero-arriving');
  document.documentElement.classList.remove('skip-intro');
  document.body.classList.add('intro-active');
  opening.hidden = false; opening.inert = false; page.inert = true;
  if (replaying) video.currentTime = 0;
  if (!video.getAttribute('src')) {
    video.src = matchMedia('(max-width:700px)').matches ? '/landingpage/assets/intro-mobile-hd.mp4' : '/landingpage/assets/intro-desktop-hd.mp4';
  }
  window.scrollTo({top: 0, behavior: 'instant'});
  paint();
  play();
  syncPlayback();
}
video.addEventListener('playing', syncPlayback);
video.addEventListener('pause', syncPlayback);
video.addEventListener('loadeddata', syncPlayback);
video.addEventListener('ended', () => finish({cinematic: true}));
video.addEventListener('error', () => finish());
document.getElementById('skip-intro').addEventListener('click', () => finish());
document.querySelector('.skip-link').addEventListener('click', () => finish({scroll: false}));
document.addEventListener('keydown', event => { if (event.key === 'Escape') finish(); });
document.addEventListener('visibilitychange', () => {
  if (!active) return;
  if (document.hidden) { resumeOnVisible = !video.paused; video.pause(); }
  else if (resumeOnVisible) { resumeOnVisible = false; play(); }
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
