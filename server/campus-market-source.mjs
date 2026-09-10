import {normalizeMarket,MARKET_SOURCE} from '../fomo/campuswars/market-feed.js';

// The same SOL chart request used by fomo.family's token page. The server must
// have an authorized fomo access token; anonymous access is not supported.
export const FOMO_BARS_URL='https://prod-api.fomo.family/proxy/getBars';
export function normalizeFomoBars(value,now=Date.now()){
  const bars=value?.responseObject,keys=['t','o','h','l','c'];
  if(!bars||!keys.every(k=>Array.isArray(bars[k]))||!keys.every(k=>bars[k].length===bars.t.length)||bars.t.length>400)throw new Error('Invalid fomo bars');
  const candles=bars.t.map((time,i)=>({time,open:bars.o[i],high:bars.h[i],low:bars.l[i],close:bars.c[i]}));
  return {source:MARKET_SOURCE,updatedAt:now,markets:[normalizeMarket('SOL-USD',candles,now)]};
}
export async function fetchFomoMarket({token,fetchImpl=fetch,now=Date.now()}){
  if(!token)throw Object.assign(new Error('Fomo connection required'),{code:'FOMO_AUTH_REQUIRED'});
  const to=Math.floor(now/1000),from=Math.floor(to/3600)*3600-23*3600;
  const response=await fetchImpl(FOMO_BARS_URL,{
    method:'POST',redirect:'error',cache:'no-store',signal:AbortSignal.timeout(10000),
    headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},
    body:JSON.stringify({from,to,resolution:'60',symbol:'So11111111111111111111111111111111111111112:1399811149'})
  });
  if([401,403,431].includes(response.status))throw Object.assign(new Error('Fomo connection required'),{code:'FOMO_AUTH_REQUIRED'});
  if(!response.ok)throw new Error('Fomo feed unavailable');
  return normalizeFomoBars(await response.json(),now);
}
