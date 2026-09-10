export function validateSnapshot(value) {
  if (!value || !Array.isArray(value.chapters) || value.live !== true || !Number.isFinite(Date.parse(value.updatedAt))) throw new Error('Invalid chapter update');
  const ids = new Set();
  for (const c of value.chapters) {
    if (!c || !/^[a-z0-9-]+$/.test(c.id) || c.id === 'empty' || ids.has(c.id) || !['name','letters','school','shortSchool','type','registered'].every(k => typeof c[k] === 'string' && c[k].length > 0) || !Number.isSafeInteger(c.joined) || c.joined < 0 || !Number.isSafeInteger(c.active) || c.active <= 0) throw new Error('Invalid chapter update');
    ids.add(c.id);
  }
  return value;
}

const SNAPSHOT_KEY='campuswars:last-good-chapters:v1';
function browserStorage(){try{return globalThis.localStorage;}catch{return null;}}

export function startChapterFeed({initialSnapshot,storageRef=browserStorage(),onUpdate, onStatus, fetchImpl=fetch, documentRef=document, interval=30000, schedule=setTimeout, cancel=clearTimeout}) {
  let timer, stopped=false, running=false, controller, signature='';
  // Restore public chapter aggregates before the first network request. Storage
  // is optional: Safari private mode and quota failures must not stop the feed.
  try{
    const cached=validateSnapshot(JSON.parse(storageRef?.getItem(SNAPSHOT_KEY)||'null'));
    if(!initialSnapshot?.updatedAt||Date.parse(cached.updatedAt)>Date.parse(initialSnapshot.updatedAt)){
      onUpdate({...cached,live:false});signature=JSON.stringify(cached.chapters);
      onStatus({live:false,updatedAt:cached.updatedAt});
    }
  }catch{}

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
      try{storageRef?.setItem(SNAPSHOT_KEY,JSON.stringify(snapshot));}catch{}
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
