export function validateSnapshot(value) {
  if (!value || !Array.isArray(value.chapters) || value.live !== true || !Number.isFinite(Date.parse(value.updatedAt))) throw new Error('Invalid chapter update');
  const ids = new Set();
  for (const c of value.chapters) {
    if (!c || !/^[a-z0-9-]+$/.test(c.id) || c.id === 'empty' || ids.has(c.id) || !['name','letters','school','shortSchool','type','registered'].every(k => typeof c[k] === 'string' && c[k].length > 0) || !Number.isSafeInteger(c.joined) || c.joined < 0 || !Number.isSafeInteger(c.active) || c.active <= 0) throw new Error('Invalid chapter update');
    ids.add(c.id);
  }
  return value;
}

export function startChapterFeed({onUpdate, onStatus, fetchImpl=fetch, documentRef=document, interval=30000, schedule=setTimeout, cancel=clearTimeout}) {
  let timer, stopped=false, running=false, controller, signature='';
  async function refresh() {
    if (stopped || running || documentRef.hidden) return;
    cancel(timer); running=true; controller=new AbortController();
    const timeout=schedule(()=>controller.abort(),25000);
    try {
      const response=await fetchImpl('/api/campuswars',{cache:'no-store',signal:controller.signal});
      if (!response.ok) throw new Error('Chapter update unavailable');
      const snapshot=validateSnapshot(await response.json());
      if (stopped) return;
      const next=JSON.stringify(snapshot.chapters);
      if (next!==signature) {onUpdate(snapshot); signature=next;}
      onStatus({live:true,updatedAt:snapshot.updatedAt});
    } catch {
      if (!stopped) onStatus({live:false});
    } finally {
      cancel(timeout);running=false;
      if (!stopped && !documentRef.hidden) timer=schedule(refresh,interval);
    }
  }
  function visibility() {cancel(timer);if (!documentRef.hidden) refresh();}
  documentRef.addEventListener('visibilitychange',visibility);
  refresh();
  return {refresh,stop(){stopped=true;cancel(timer);controller?.abort();documentRef.removeEventListener('visibilitychange',visibility);}};
}
