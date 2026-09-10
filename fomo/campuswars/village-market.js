import {marketPrice,marketChange,marketStatus} from './market-feed.js?v=50';

// The opening northeast town block is the exchange destination. Each streamed
// Campus Market gets the same fomo snapshot without creating its own poller.
export const EXCHANGE_VIEW={x:73,y:4,z:-121,theta:Math.PI/2+.3,phi:.32,radius:49};
const C={ink:0x142b32,stone:0xd6ccb5,brass:0xb89b59,green:0x59cfaa,red:0xe87f77};
export function paintMarketTicker(ctx,state){
  ctx.fillStyle='#10262d';ctx.fillRect(0,0,2048,128);ctx.textBaseline='middle';ctx.font='bold 43px monospace';
  const items=[];
  const write=(label,color)=>items.push({label,color});
  if(state?.markets?.length){
    if(state.status!=='live')write('DELAYED','#f7d18b');
    for(const m of state.markets){const change=marketChange(m);write(`${m.symbol} ${marketPrice(m.price)} ${change>=0?'+':''}${change.toFixed(2)}%`,change>=0?'#7ee3b5':'#ffa59d');}
    write('FOMO.FAMILY · 1H CLOSE','#d8e6e8');
  }else{
    write('CAMPUS MARKET','#8fe1ba');write('FOMO.FAMILY','#f2dfb6');write(state?.status==='connection-required'?'CONNECTION REQUIRED':state?.status==='unavailable'?'FEED UNAVAILABLE':'CONNECTING TO FOMO','#c9d7db');
  }
  const length=items.reduce((sum,item)=>sum+ctx.measureText(item.label).width+40,0);
  ctx.font=`bold ${Math.min(43,Math.floor(43*1970/length))}px monospace`;
  let x=28;for(const item of items){ctx.fillStyle=item.color;ctx.fillText(item.label,x,68);x+=ctx.measureText(item.label).width+40;}
}
export function paintMarketChart(ctx,state){
  const w=1200,h=720;ctx.fillStyle='#10262d';ctx.fillRect(0,0,w,h);ctx.textAlign='left';ctx.textBaseline='alphabetic';
  const text=(s,x,y,size,color='#d9e8e7')=>{ctx.fillStyle=color;ctx.font=`600 ${size}px Arial`;ctx.fillText(s,x,y);};
  text('SOL / USD',50,77,42);text('1H CANDLES  /  PAST 24H',50,116,22,'#9daeb3');
  text('CAMPUS MARKET',820,72,24,'#9bd7ba');
  const market=state?.markets?.find(m=>m.symbol==='SOL');
  if(market){
    const candles=market.candles,change=marketChange(market);
    text(marketPrice(market.price),50,195,58);text(`${change>=0?'+':''}${change.toFixed(2)}% PERIOD`,500,191,29,change>=0?'#7ee3b5':'#ffa59d');
    const low=Math.min(...candles.map(c=>c.low)),high=Math.max(...candles.map(c=>c.high)),padding=Math.max((high-low)*.12,high*.0001),min=low-padding,max=high+padding;
    const y=value=>552-(value-min)/(max-min)*310;
    for(let i=0;i<=4;i++){const value=min+(max-min)*i/4,py=y(value);ctx.strokeStyle='#29424a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(50,py);ctx.lineTo(1000,py);ctx.stroke();text(marketPrice(value),1020,py+7,20,'#98acb3');}
    // Positions use actual timestamps, preserving any gaps in the upstream data.
    const end=candles.at(-1).time,start=end-23*3600,step=950/24;
    for(const c of candles){const x=50+((c.time-start)/3600+.5)*step;ctx.strokeStyle=ctx.fillStyle=c.close>=c.open?'#7ee3b5':'#ffa59d';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y(c.high));ctx.lineTo(x,y(c.low));ctx.stroke();ctx.fillRect(x-step*.28,Math.min(y(c.open),y(c.close)),step*.56,Math.max(3,Math.abs(y(c.open)-y(c.close))));}
    const stamp=t=>new Date(t*1000).toISOString().slice(11,16)+' UTC';text(stamp(start),50,590,20,'#98acb3');text(stamp(end),858,590,20,'#98acb3');
  }else{
    text(state?.status==='connection-required'?'Fomo connection required':state?.status==='unavailable'?'Fomo feed unavailable':'Connecting to fomo',50,330,40,'#f1dfb8');
    text('Visit fomo.family to explore the market.',50,385,26,'#a9bcc1');
  }
  text(marketStatus(state),50,645,23,state?.status==='stale'?'#f1cf95':'#9db2b8');
  text(market?'SOURCE: FOMO.FAMILY':'FOMO.FAMILY  ·  AWAITING CONNECTION',50,688,21,'#9db2b8');text('fomo.family ↗',905,687,25,'#f1dfb8');
}
export function createMarketExchange(T,kit,s,ox=0,oz=0,state){
  const root=new T.Group();root.name='campus-exchange';root.position.set(s.x-ox,0,s.z-oz);root.rotation.y=s.rotation;
  const {box,cylinder,mesh,sign,bench}=kit;
  // Limestone portico and a dark, open trading hall. The frontage stays within
  // the former shops footprint; the plaza stops before the boulevard sidewalk.
  box(root,0,.19,3.5,29,.28,21,C.stone,'stone');
  box(root,0,.38,0,28,.2,14,C.ink);
  box(root,0,3.9,-6.6,28,7.4,.8,C.ink);
  for(const side of [-1,1]){
    box(root,side*13.2,3.9,0,1.6,7.4,14,C.stone,'stone');
    for(const z of [-4,0,4]){box(root,side*14.03,3.8,z,.05,4.6,2.8,0x3f6165);box(root,side*14.08,3.8,z,.05,4.6,.08,C.brass);}
  }
  box(root,0,7.75,0,29,.55,15,C.stone);
  box(root,0,8.8,0,28,1.7,14,C.ink);
  box(root,0,9.8,0,29,.28,15,C.brass);
  for(const x of [-12,-6,6,12]){
    box(root,x,3.9,6.55,.42,7.2,.55,C.brass);
    box(root,x,3.9,6.5,.12,7.1,.65,C.stone);
  }
  // Transparent glazing keeps the monitor islands visible from the street.
  const glass=new T.MeshLambertMaterial({color:0x91c6c0,transparent:true,opacity:.12,depthWrite:false});
  const glassPane=mesh(root,new T.PlaneGeometry(24,6.4),0,4.1,6.7,1,1,1,glass);glassPane.userData.ownedGeometry=true;
  for(const x of [-1.5,1.5])box(root,x,2.1,7,.08,3.5,.1,C.brass);
  box(root,0,3.85,7,3.1,.08,.1,C.brass);
  box(root,0,.47,8,4,.12,2.2,C.brass);
  for(const x of [-8,0,8])for(const z of [-2.8,2.2]){
    box(root,x,1.5,z,5.6,.2,1.8,0xb89c76);box(root,x,1,z,.25,1,1.4,C.ink);
    for(const dx of [-1.7,0,1.7]){
      box(root,x+dx,2.05,z,.06,.95,.08,C.brass);box(root,x+dx,2.55,z,1.4,.9,.12,0x233d46);
      box(root,x+dx,2.55,z+.07,1.2,.7,.02,0x517e83);
      // Monitor lines are UI decoration, without fictitious numerical quotes.
      for(let i=0;i<3;i++)box(root,x+dx-.4+i*.4,2.35+i*.13,z+.09,.28,.06,.02,C.green);
      cylinder(root,x+dx,.85,z+1,.32,.08,C.ink);cylinder(root,x+dx,.61,z+1,.055,.4,C.brass);
    }
  }
  sign(root,'TRADING FLOOR',0,5.4,-6.13,12,.9);
  sign(root,'CAMPUS MARKET',0,10.7,5.6,20,1.35);
  for(const x of [-9,9])cylinder(root,x,10.05,5.5,.045,1.4,C.brass);
  // Three deliberately oversized candlesticks read as sculpture from afar.
  cylinder(root,8,.45,11,3.1,.45,C.ink);
  for(const [x,z,bottom,top,wick,color] of [[5.8,11,1.2,3.8,5.3,C.green],[8,11.7,1.8,3.5,4.5,C.red],[10.2,10.8,2.5,5.1,6.4,C.green]]){
    cylinder(root,x,(wick+.6)/2,z,.065,wick-.6,C.brass);
    box(root,x,(bottom+top)/2,z,1.2,top-bottom,1.2,color);
  }
  bench(root,2,12.5);bench(root,-12,11.8,Math.PI/2);
  for(const x of [-3.8,3.8]){cylinder(root,x,.52,13.7,.1,.7,C.brass);}
  // Canvas screens own their resources, so batching leaves them updateable and
  // chunk eviction disposes the textures along with the other campus signage.
  function screen(name,width,height,x,y,z,pixelsW,pixelsH){
    if(typeof document==='undefined')return null;
    const canvas=document.createElement('canvas');canvas.width=pixelsW;canvas.height=pixelsH;
    const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;
    const panel=mesh(root,new T.PlaneGeometry(width,height),x,y,z,1,1,1,new T.MeshBasicMaterial({map,toneMapped:false}));
    panel.name=name;panel.castShadow=false;panel.userData.ownedTexture=true;
    return {panel,map,ctx:canvas.getContext('2d')};
  }
  const ticker=screen('exchange-ticker',27,1.5,0,8.85,7.06,2048,128);
  if(ticker){ticker.map.wrapS=T.RepeatWrapping;ticker.map.repeat.x=.72;}
  box(root,-7.1,3.55,11.1,8.7,5.4,.4,C.ink);
  for(const x of [-10.4,-3.8])box(root,x,.8,11.1,.14,1.25,.25,C.brass);
  const chart=screen('exchange-chart',8.3,4.98,-7.1,3.55,11.32,1200,720);
  let disposed=false;
  function setMarket(next){if(disposed)return;if(ticker){paintMarketTicker(ticker.ctx,next);ticker.map.needsUpdate=true;}if(chart){paintMarketChart(chart.ctx,next);chart.map.needsUpdate=true;}}
  setMarket(state);
  return {root,ticker,chart,setMarket,animate(time){if(ticker&&!disposed)ticker.map.offset.x=(time*.022)%1;},dispose(){disposed=true;}};
}
