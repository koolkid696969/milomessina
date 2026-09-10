import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.min.js';
import {normalizeMarket,validateMarketSnapshot,startMarketFeed,marketStatus,marketChange} from '../market-feed.js';
import {fetchFomoMarket,normalizeFomoBars,FOMO_BARS_URL} from '../../../server/campus-market-source.mjs';
import {createMarketHandler} from '../../../api/campus-market.mjs';
import {createDistricts} from '../village-districts.js';
import {paintMarketChart,paintMarketTicker} from '../village-market.js';
const now=Date.parse('2026-09-10T15:15:00Z'),hour=Math.floor(now/3600000)*3600;
const rows=Array.from({length:24},(_,i)=>({time:hour-i*3600,low:90+i,high:110+i,open:100+i,close:105+i}));
const state={status:'live',source:'fomo',updatedAt:now,markets:['SOL-USD'].map(pair=>normalizeMarket(pair,rows,now))};
const flush=()=>new Promise(resolve=>setImmediate(resolve));

test('fomo candles are ordered, bounded and preserve OHLC and timestamp gaps',()=>{
  const result=normalizeMarket('SOL-USD',[...rows,{time:hour-30*3600,low:1,high:3,open:2,close:2}],now);
  assert.equal(result.candles.length,24);assert.equal(result.price,105);
  assert.deepEqual(result.candles.at(-1),{time:hour,low:90,high:110,open:100,close:105});
  assert.equal(marketChange(result),(105/123-1)*100);
  assert.equal(normalizeMarket('SOL-USD',rows.filter((_,i)=>i!==5),now).candles.length,23);
  for(const bad of [[],[{...rows[0],low:0}],[{...rows[0],high:95}],[{...rows[0],low:'90'}],[...rows,rows[0]],rows.slice(3)])assert.throws(()=>normalizeMarket('SOL-USD',bad,now));
  assert.throws(()=>normalizeMarket('UNTRUSTED',rows,now));
});
test('one shared feed polls without credentials, retains stale quotes, recovers and sleeps while hidden',async()=>{
  const updates=[],timers=new Map();let n=0,visibility,calls=0,fail=false;
  const documentRef={hidden:false,addEventListener:(_,fn)=>visibility=fn,removeEventListener(){visibility=null;}};
  const feed=startMarketFeed({documentRef,now:()=>now,onUpdate:s=>updates.push(s),schedule:(fn,delay)=>{timers.set(++n,{fn,delay});return n;},cancel:id=>timers.delete(id),fetchImpl:async(url,options)=>{
    calls++;assert.equal(url,'/api/campus-market');assert.equal(options.credentials,'omit');assert(!options.headers.Authorization);
    return {ok:!fail,json:async()=>state};
  }});
  await flush();assert.equal(calls,1);assert.equal(updates.at(-1).status,'live');assert([...timers.values()].some(t=>t.delay===60000));
  fail=true;await feed.refresh();assert.equal(updates.at(-1).status,'stale');assert.deepEqual(updates.at(-1).markets,state.markets);assert.match(marketStatus(updates.at(-1)),/Feed interrupted/);
  fail=false;await feed.refresh();assert.equal(updates.at(-1).status,'live');
  documentRef.hidden=true;visibility();const count=calls;await feed.refresh();assert.equal(calls,count);assert.equal(timers.size,0);
  documentRef.hidden=false;visibility();await flush();assert.equal(calls,count+1);feed.stop();assert.equal(timers.size,0);assert.equal(visibility,null);
});
test('concurrent refreshes coalesce and stop prevents late updates',async()=>{
  let release,calls=0;const updates=[],held=new Promise(resolve=>release=resolve);
  const feed=startMarketFeed({documentRef:{hidden:false,addEventListener(){},removeEventListener(){}},now:()=>now,onUpdate:s=>updates.push(s),fetchImpl:async()=>{calls++;await held;return {ok:true,json:async()=>state};}});
  await feed.refresh();assert.equal(calls,1);feed.stop();release();await flush();assert.equal(updates.length,0);
});
test('an offline first visit never invents market prices',async()=>{
  let state;
  const feed=startMarketFeed({documentRef:{hidden:false,addEventListener(){},removeEventListener(){}},onUpdate:s=>state=s,fetchImpl:async()=>({ok:false})});
  await flush();feed.stop();assert.equal(state.status,'unavailable');assert.deepEqual(state.markets,[]);assert.equal(marketStatus(state),'Fomo feed unavailable');
});
test('charts name fomo and mark stale data visibly',()=>{
  const words=[];const ctx=new Proxy({fillText:t=>words.push(t),measureText:t=>({width:t.length*25})},{get:(o,key)=>key in o?o[key]:()=>{}});
  paintMarketChart(ctx,state);assert(words.some(w=>w.includes('SOURCE: FOMO.FAMILY')));assert(words.includes('SOL / USD'));assert(words.includes('$105.00'));
  words.length=0;paintMarketTicker(ctx,{...state,status:'stale'});assert(words.includes('DELAYED'));
  words.length=0;paintMarketChart(ctx,{status:'unavailable',markets:[]});assert(words.includes('Fomo feed unavailable'));assert(!words.some(w=>w.startsWith('$')));
});
test('exchanges survive district streaming with the latest snapshot and release their screens',()=>{
  const ctx=new Proxy({measureText:t=>({width:t.length*25})},{get:(o,key)=>key in o?o[key]:()=>{}});
  const previous=globalThis.document,previousPath=globalThis.Path2D;
  globalThis.Path2D=class{};
  globalThis.document={createElement:()=>({getContext:()=>ctx})};
  let districts;
  try{
    districts=createDistricts(T);districts.setMarket(state);
    const exchange=districts.chunks.get('1,-1').exchanges[0];assert(exchange.chart);assert.equal(exchange.ticker.panel.parent,exchange.root);
    districts.animate(10,73,-121);const offset=exchange.ticker.map.offset.x;assert(offset>0);
    districts.animate(10,73,-121);assert.equal(exchange.ticker.map.offset.x,offset,'absolute time honors the existing pause clock');
    const map=exchange.chart.map;let disposed=false;map.addEventListener('dispose',()=>disposed=true);
    districts.update(500,500);assert(disposed);districts.update(0,0);assert.equal(districts.chunks.size,9);
    const next=districts.chunks.get('1,-1').exchanges[0];assert.notEqual(next,exchange);assert(next.chart.map.version>0);
    const version=map.version;exchange.setMarket(state);assert.equal(map.version,version,'disposed screens ignore updates');
  }finally{districts?.dispose();globalThis.document=previous;globalThis.Path2D=previousPath;}
});

const bars={responseObject:{t:rows.map(c=>c.time),o:rows.map(c=>c.open),h:rows.map(c=>c.high),l:rows.map(c=>c.low),c:rows.map(c=>c.close)}};
test('only authentic-source snapshots and matching fomo bar arrays are accepted',()=>{
  assert.deepEqual(normalizeFomoBars(bars,now).markets,state.markets);
  for(const payload of [{source:'other-provider'},{updatedAt:now-240000},{markets:[]},{markets:[{pair:'BTC-USD',candles:rows}]}])assert.throws(()=>validateMarketSnapshot({...state,...payload},now));
  assert.throws(()=>normalizeFomoBars({responseObject:{...bars.responseObject,c:[1]}},now));
});
test('server calls only fomo and never returns credentials or unrelated response fields',async()=>{
  const snapshot=await fetchFomoMarket({token:'test-only',now,fetchImpl:async(url,options)=>{
    assert.equal(url,FOMO_BARS_URL);assert.equal(options.redirect,'error');assert.equal(options.headers.Authorization,'Bearer test-only');
    assert.deepEqual(JSON.parse(options.body),{from:hour-23*3600,to:Math.floor(now/1000),resolution:'60',symbol:'So11111111111111111111111111111111111111112:1399811149'});
    return {ok:true,status:200,json:async()=>({...bars,privateAccount:'PRIVATE'})};
  }});
  assert(!JSON.stringify(snapshot).includes('PRIVATE'));assert(!JSON.stringify(snapshot).includes('test-only'));
  for(const status of [401,403,431])await assert.rejects(fetchFomoMarket({token:'test-only',fetchImpl:async()=>({ok:false,status})}),{code:'FOMO_AUTH_REQUIRED'});
});
test('server rejects writes, requires fomo access, coalesces reads and sanitizes errors',async()=>{
  const response=()=>({code:200,headers:{},setHeader(k,v){this.headers[k]=v;},status(code){this.code=code;return this;},json(body){this.body=body;return this;}});
  let token='',calls=0,release,fail=false;const held=new Promise(resolve=>release=resolve);
  const handler=createMarketHandler({getToken:()=>token,now:()=>now,read:async()=>{calls++;await held;if(fail)throw new Error('PRIVATE');return state;}});
  const missing=response();await handler({method:'GET'},missing);assert.equal(missing.code,503);assert.equal(missing.body.code,'FOMO_AUTH_REQUIRED');assert.equal(calls,0);
  const write=response();await handler({method:'POST'},write);assert.equal(write.code,405);
  token='test-only';const a=response(),b=response(),pending=Promise.all([handler({method:'GET'},a),handler({method:'GET'},b)]);release();await pending;
  assert.equal(calls,1);assert.deepEqual(a.body,b.body);assert.equal(a.headers['Cache-Control'],'no-store');
  const errorHandler=createMarketHandler({getToken:()=>token,read:async()=>{throw new Error('PRIVATE');}}),error=response();await errorHandler({method:'GET'},error);assert.equal(error.code,502);assert(!JSON.stringify(error.body).includes('PRIVATE'));
});
test('lost fomo authorization clears previous quotes instead of relabeling them',async()=>{
  const updates=[];let authorized=true;
  const feed=startMarketFeed({documentRef:{hidden:false,addEventListener(){},removeEventListener(){}},now:()=>now,onUpdate:s=>updates.push(s),fetchImpl:async()=>({ok:authorized,json:async()=>authorized?state:{code:'FOMO_AUTH_REQUIRED'}})});
  await flush();assert.equal(updates.at(-1).markets.length,1);authorized=false;await feed.refresh();feed.stop();
  assert.equal(updates.at(-1).status,'connection-required');assert.deepEqual(updates.at(-1).markets,[]);assert.equal(marketStatus(updates.at(-1)),'Fomo connection required');
});
