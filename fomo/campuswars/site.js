'use strict';
(() => {
  const { chapters } = JSON.parse(document.getElementById('chapters-data').textContent);
  const byId = new Map(chapters.map(chapter => [chapter.id, chapter]));
  const neighborhood = document.getElementById('neighborhood');
  const cards = [...document.querySelectorAll('.house-card')];
  const panel = document.getElementById('chapter-panel');
  const panelShare = document.getElementById('panel-share');
  const panelClaim = document.getElementById('panel-claim');
  const canonicalUrl = 'https://milomessina.com/fomo/campuswars/';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let selectedId = 'sigma-chi-sdsu';
  const text = (id, value) => { document.getElementById(id).textContent = value; };

  const partyToggle = document.getElementById('party-toggle');
  let partyPaused = reducedMotion;
  partyToggle.hidden = reducedMotion;
  partyToggle.addEventListener('click', () => {
    partyPaused = !partyPaused;
    partyToggle.textContent = partyPaused ? 'Resume activity' : 'Pause activity';
    partyToggle.setAttribute('aria-pressed', String(partyPaused));
    document.dispatchEvent(new CustomEvent('party:pause', {detail: {paused: partyPaused}}));
  });

  function selectChapter(id, { writeHash = true, scroll = false, emit = true } = {}) {
    const chapter = byId.get(id);
    if (id !== 'empty' && !chapter) return;
    selectedId = id;
    cards.forEach(card => {
      const selected = card.dataset.chapter === id;
      card.classList.toggle('selected', selected);
      card.setAttribute('aria-pressed', String(selected));
      if (selected && scroll) {
        neighborhood.scrollTo({
          left: Math.max(0, neighborhood.scrollLeft + card.getBoundingClientRect().left - neighborhood.getBoundingClientRect().left - (neighborhood.clientWidth - card.offsetWidth) / 2),
          behavior: reducedMotion ? 'instant' : 'smooth'
        });
      }
    });
    panelShare.hidden = !chapter;
    panelClaim.hidden = Boolean(chapter);
    panel.classList.toggle('claim-mode', !chapter);
    if (chapter) {
      const target = Math.ceil(chapter.active * 0.8);
      const remaining = Math.max(0, target - chapter.joined);
      text('panel-letters', chapter.letters);
      text('panel-school', chapter.school.toUpperCase());
      text('panel-name', chapter.name);
      text('panel-target', chapter.joined<15 ? `${15-chapter.joined} more to build your house.` : remaining ? `${remaining} more to qualify.` : 'Your house reached 80%.');
      text('panel-detail', `${chapter.joined} joined · ${target} needed · ${chapter.active} active members`);
      panelShare.setAttribute('aria-label', `Share ${chapter.name}’s Campus Wars progress`);
    } else {
      text('panel-letters', '+');
      text('panel-school', 'YOUR HOUSE BELONGS HERE');
      text('panel-name', 'Your house starts here.');
      text('panel-target', 'Claim your place on the row.');
      text('panel-detail', 'Get your invite link. Bring your people. Build your house.');
    }
    if (writeHash) history.replaceState(null, '', `${location.pathname}${location.search}#chapter=${encodeURIComponent(id)}`);
    if (emit) document.dispatchEvent(new CustomEvent('chapter:select', {detail: {id, focus: true}}));
  }

  document.addEventListener('village:select', event => selectChapter(event.detail.id, {emit: false}));
  document.querySelectorAll('[data-visit]').forEach(button=>button.addEventListener('click',()=>{
    selectChapter(button.dataset.visit,{scroll:true});
    document.getElementById('village').scrollIntoView({block:'start',behavior:reducedMotion?'instant':'smooth'});
    const canvas=document.querySelector('#village-viewport canvas');
    canvas?.focus({preventScroll:true});
  }));

  let drag = null;
  let dragged = false;
  neighborhood.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    drag = { x: event.clientX, left: neighborhood.scrollLeft, pointer: event.pointerId };
    dragged = false;
  });
  neighborhood.addEventListener('pointermove', event => {
    if (!drag) return;
    const delta = event.clientX - drag.x;
    if (Math.abs(delta) > 6) {
      dragged = true;
      neighborhood.classList.add('dragging');
      if (!neighborhood.hasPointerCapture(drag.pointer)) neighborhood.setPointerCapture(drag.pointer);
      neighborhood.scrollLeft = drag.left - delta;
      event.preventDefault();
    }
  });
  function finishDrag() {
    if (drag && neighborhood.hasPointerCapture(drag.pointer)) neighborhood.releasePointerCapture(drag.pointer);
    drag = null;
    neighborhood.classList.remove('dragging');
  }
  neighborhood.addEventListener('pointerup', finishDrag);
  neighborhood.addEventListener('pointercancel', finishDrag);
  neighborhood.addEventListener('lostpointercapture', () => {drag = null; neighborhood.classList.remove('dragging');});
  neighborhood.addEventListener('click', event => {
    if (dragged) {event.preventDefault();event.stopImmediatePropagation();dragged = false;}
  }, true);
  cards.forEach(card => {
    card.addEventListener('click', () => selectChapter(card.dataset.chapter));
    card.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const visible = cards.filter(item => !item.hidden);
      const index = visible.indexOf(card);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? visible.length - 1 : Math.min(visible.length - 1, Math.max(0, index + (event.key === 'ArrowRight' ? 1 : -1)));
      visible[next].focus({preventScroll: true});
      selectChapter(visible[next].dataset.chapter, {scroll: true});
    });
  });

  const toast = document.querySelector('.toast');
  let toastTimer;
  function notify(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 4500);
  }
  async function share(chapter) {
    const target = chapter ? Math.ceil(chapter.active * 0.8) : 0;
    const url = chapter ? `${canonicalUrl}#chapter=${encodeURIComponent(chapter.id)}` : canonicalUrl;
    const data = {
      title: chapter ? `${chapter.letters} — fomo Campus Wars` : 'Get your frat paid — fomo Campus Wars',
      text: chapter ? `${chapter.name}: ${chapter.joined} in, ${Math.max(0, target - chapter.joined)} more to hit 80% in this registration snapshot. Let’s get the house on fomo.` : 'There’s an empty lot for our chapter in the Greek village. $500,000 committed. Who’s getting our house on the map?',
      url
    };
    if (navigator.share) {
      try { await navigator.share(data); return; }
      catch (error) { if (error.name === 'AbortError') return; }
    }
    try {
      await navigator.clipboard.writeText(url);
      notify('Link copied. Send it to the group chat.');
    } catch (_) {
      const fallback = document.querySelector('.copy-fallback');
      fallback.hidden = false;
      const input = fallback.querySelector('input');
      input.value = url;
      input.focus();
      input.select();
      input.scrollIntoView({block:'center',behavior:reducedMotion?'instant':'smooth'});
      notify('Select and copy the link below.');
    }
  }
  panelShare.addEventListener('click', () => share(byId.get(selectedId)));
  document.querySelectorAll('[data-share]').forEach(button => button.addEventListener('click', () => share()));
  function readHash() {
    const id = new URLSearchParams(location.hash.slice(1)).get('chapter');
    if (id && (id === 'empty' || byId.has(id))) {
      selectChapter(id, {writeHash: false, scroll: true});
    }
  }
  addEventListener('hashchange', readHash);
  selectChapter(selectedId, {writeHash: false, emit: false});
  readHash();
  import('./village.js?v=30').catch(error => {
    console.error('Unable to load Greek village:', error);
    document.getElementById('village-loading').textContent = 'The village couldn’t load. Browse every chapter’s progress below.';
    document.getElementById('village').classList.add('village-unavailable');
  });
  if ('IntersectionObserver' in window) {
    const dock = document.querySelector('.mobile-dock');
    new IntersectionObserver(([entry]) => dock.classList.toggle('visible', !entry.isIntersecting), {threshold:0}).observe(document.getElementById('village'));
  }
})();
