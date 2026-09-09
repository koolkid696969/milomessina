'use strict';
(() => {
  const opening = document.getElementById('opening');
  const frame = document.getElementById('intro-frame');
  const page = document.getElementById('page');
  const programs = document.getElementById('programs');
  const pause = document.getElementById('pause-intro');
  const replay = document.getElementById('replay-intro');
  const status = document.getElementById('opening-status');
  const progress = document.getElementById('film-progress');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active = false, paused = false, started = false, timeout, finishTimer;
  let elapsed = 0, lastTime = 0, raf = 0;
  function tick(now) {
    if (!active) return;
    if (started && !paused && !document.hidden && lastTime) elapsed += (now - lastTime) / 1000;
    lastTime = now;
    progress.style.transform = `scaleX(${Math.min(1, elapsed / 13.6)})`;
    raf = requestAnimationFrame(tick);
  }
  function finish({scroll = true} = {}) {
    if (!active) return;
    active = false;
    clearTimeout(timeout);
    cancelAnimationFrame(raf);
    document.body.classList.remove('intro-active');
    document.body.classList.add('intro-leaving');
    page.inert = false;
    opening.inert = true;
    // Removing the browsing context stops the renderer, animations and network work.
    frame.removeAttribute('src');
    if (scroll) {
      programs.focus({preventScroll: true});
      page.scrollIntoView({behavior: reduced.matches ? 'instant' : 'smooth', block: 'start'});
    }
    finishTimer = setTimeout(() => {
      const contentScroll = Math.max(0, window.scrollY - opening.offsetHeight);
      opening.hidden = true;
      document.body.classList.remove('intro-leaving');
      if (scroll) window.scrollTo({top: contentScroll, behavior: 'instant'});
    }, reduced.matches ? 0 : 850);
  }
  function start() {
    clearTimeout(finishTimer);
    active = true; paused = false; started = false; elapsed = 0; lastTime = 0;
    progress.style.transform = 'scaleX(0)';
    opening.hidden = false; opening.inert = false; page.inert = true;
    pause.hidden = true; pause.textContent = 'Pause intro'; pause.setAttribute('aria-pressed', 'false');
    status.textContent = 'Getting campus ready…';
    document.body.classList.remove('intro-leaving');
    document.body.classList.add('intro-active');
    window.scrollTo({top: 0, behavior: 'instant'});
    frame.src = '/landingpage/intro.html';
    // A device that cannot initialize 3D should still reach every program.
    timeout = setTimeout(() => finish(), 30000);
    raf = requestAnimationFrame(tick);
  }
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== frame.contentWindow || !active) return;
    if (event.data?.type === 'campus:intro-start') {
      started = true; lastTime = 0; pause.hidden = false;
      status.textContent = 'Welcome to campus.';
      clearTimeout(timeout);
    }
    if (event.data?.type === 'campus:intro-end' || event.data?.type === 'campus:intro-error') finish();
  });
  pause.addEventListener('click', () => {
    if (!started || !active) return;
    paused = !paused; lastTime = 0;
    pause.textContent = paused ? 'Resume intro' : 'Pause intro';
    pause.setAttribute('aria-pressed', String(paused));
    frame.contentWindow.postMessage({type: 'campus:pause'}, location.origin);
  });
  document.getElementById('skip-intro').addEventListener('click', () => finish());
  document.querySelector('.skip-link').addEventListener('click', () => finish({scroll: false}));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && active) finish(); });
  document.addEventListener('visibilitychange', () => { lastTime = 0; });
  reduced.addEventListener('change', () => { replay.hidden = reduced.matches; if (reduced.matches) finish(); });
  replay.hidden = reduced.matches;
  replay.addEventListener('click', () => { start(); document.getElementById('skip-intro').focus({preventScroll: true}); });
  // Direct program links and reduced-motion visits go straight to the content.
  if (!reduced.matches && !location.hash) start();
  if ('IntersectionObserver' in window && !reduced.matches) {
    const reveal = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('reveal');
        reveal.unobserve(entry.target);
      }
    }, {threshold: .08});
    document.querySelectorAll('.program-copy,.role-card,.creator-rate,.greek-steps').forEach(node => reveal.observe(node));
  }
})();
