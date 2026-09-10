// The exchange accepts only data returned by the fomo server adapter.
// Authentication remains on the server; there is no alternate provider.
export const MARKET_SOURCE='fomo';
export const MARKET_PAIRS=['SOL-USD'];
export const MARKET_LINK='https://fomo.family/';
export const marketPrice=value=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(value);
export const marketChange=market=>(market.price/market.candles[0].open-1)*100;
export function normalizeMarket(pair,rows,now=Date.now()){
  if(!MARKET_PAIRS.includes(pair)||!Array.isArray(rows)||rows.length>400)throw new Error('Invalid market');
  const hour=Math.floor(now/3600000)*3600,seen=new Set();
  const candles=rows.map(row=>{
    if(!row||![row.time,row.low,row.high,row.open,row.close].every(Number.isFinite))throw new Error('Invalid candle');
    const {time,low,high,open,close}=row;
    if(!Number.isSafeInteger(time)||time%3600!==0||low<=0||low>Math.min(open,close)||high<Math.max(open,close)||seen.has(time))throw new Error('Invalid candle');
    seen.add(time);return {time,low,high,open,close};
  }).filter(c=>c.time<=hour&&c.time>=hour-23*3600).sort((a,b)=>a.time-b.time);
  if(candles.length<2||candles.at(-1).time<hour-3600)throw new Error('Market history unavailable');
  return {pair,symbol:pair.split('-')[0],price:candles.at(-1).close,candles};
}
export function validateMarketSnapshot(value,now=Date.now()){
  if(value?.source!==MARKET_SOURCE||!Number.isFinite(value.updatedAt)||value.updatedAt>now+60000||now-value.updatedAt>180000||!Array.isArray(value.markets)||value.markets.length!==1)throw new Error('Invalid fomo snapshot');
  return {status:'live',source:MARKET_SOURCE,updatedAt:value.updatedAt,markets:value.markets.map(m=>normalizeMarket(m.pair,m.candles,now))};
}
export function marketStatus(state){
  if(!state?.markets?.length)return state?.status==='connection-required'?'Fomo connection required':state?.status==='unavailable'?'Fomo feed unavailable':'Connecting to fomo';
  const stamp=new Date(state.updatedAt).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',timeZone:'UTC',hour12:false});
  return `${state.status==='live'?'Updated':'Last update'} ${stamp} UTC${state.status==='stale'?' · Feed interrupted':''}`;
}
export function startMarketFeed({onUpdate,fetchImpl=fetch,documentRef=document,now=Date.now,schedule=setTimeout,cancel=clearTimeout,interval=60000}){
  let timer,controller,running=false,stopped=false,state={status:'connecting',markets:[]};
  async function refresh(){
    if(stopped||running||documentRef.hidden)return;
    cancel(timer);running=true;controller=new AbortController();
    const timeout=schedule(()=>controller.abort(),12000);
    try{
      const response=await fetchImpl('/api/campus-market',{signal:controller.signal,credentials:'omit',headers:{Accept:'application/json'},cache:'no-store'});
      if(!response.ok){
        let code;try{code=(await response.json()).code;}catch{}
        if(code==='FOMO_AUTH_REQUIRED'&&!stopped){state={status:'connection-required',markets:[]};onUpdate(state);return;}
        throw new Error('Fomo feed unavailable');
      }
      const snapshot=validateMarketSnapshot(await response.json(),now());
      if(!stopped){state=snapshot;onUpdate(state);}
    }catch{
      if(!stopped){state={...state,status:state.markets.length?'stale':'unavailable'};onUpdate(state);}
    }finally{
      cancel(timeout);running=false;
      if(!stopped&&!documentRef.hidden)timer=schedule(refresh,interval);
    }
  }
  function visibility(){cancel(timer);if(!documentRef.hidden)refresh();}
  documentRef.addEventListener('visibilitychange',visibility);refresh();
  return {refresh,stop(){stopped=true;cancel(timer);controller?.abort();documentRef.removeEventListener('visibilitychange',visibility);}};
}
