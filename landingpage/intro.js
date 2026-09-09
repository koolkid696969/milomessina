// Reuse the village itself: identical geometry, camera flight, captions and effects.
const notify = type => parent.postMessage({type}, location.origin);
document.addEventListener('village:introstart', () => notify('campus:intro-start'));
document.addEventListener('village:introend', () => notify('campus:intro-end'));
window.addEventListener('message', event => {
  if (event.source !== parent || event.origin !== location.origin) return;
  if (event.data?.type === 'campus:pause') document.getElementById('intro-pause').click();
});
const shell = document.getElementById('village');
new MutationObserver(() => {
  if (shell.classList.contains('village-unavailable')) notify('campus:intro-error');
}).observe(shell, {attributes: true, attributeFilter: ['class']});
try {
  const response = await fetch('/fomo/campuswars/chapters.json');
  if (!response.ok) throw new Error('Village scene data unavailable');
  const snapshot = await response.json();
  document.getElementById('chapters-data').textContent = JSON.stringify(snapshot);
  await import('/fomo/campuswars/village.js?v=landing-1');
} catch (error) {
  console.error('Campus intro unavailable:', error);
  notify('campus:intro-error');
}
