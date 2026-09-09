// Original fomo symbol and lowercase lockup from the /fomo/ campus page.
const markPaths=["M36.9747 24.3586C44.1067 24.3587 49.7941 27.9515 52.9484 33.5959C48.7626 38.0418 45.6617 43.7612 44.4679 50.0002C43.2743 56.2391 44.1865 61.9572 46.67 66.4026C41.3555 72.0468 34.2931 75.6408 27.1613 75.6409C18.432 75.6407 11.8659 70.2588 9.46204 62.3196H26.8478C27.4159 62.3193 28.0059 61.8593 28.1691 61.2932L34.6486 38.7043C34.8098 38.1381 34.4815 37.6782 33.9152 37.678H14.1788C19.6213 29.7404 28.2465 24.3588 36.9747 24.3586Z", "M72.3285 24.3586C85.0779 24.3586 93.2156 35.8374 90.5062 49.9993C87.7966 64.1596 75.2646 75.6409 62.515 75.6409C53.7856 75.6408 47.2196 70.2589 44.8158 62.3196H64.1537C64.7218 62.3194 65.3127 61.8594 65.476 61.2932L71.9545 38.7043C72.1157 38.138 71.7876 37.678 71.2211 37.678H49.5316C54.9741 29.7401 63.5999 24.3587 72.3285 24.3586Z"];
export function createCampusBannerTexture(T){
  if(typeof document==='undefined')return null;
  const canvas=document.createElement('canvas');canvas.width=3072;canvas.height=640;
  const ctx=canvas.getContext('2d');ctx.scale(2,2);
  function paint(){
    ctx.fillStyle='#12111a';ctx.fillRect(0,0,1536,320);
    ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.letterSpacing='-7.5px';
    ctx.font='700 150px Aeonik, Arial, sans-serif';const fomoWidth=ctx.measureText('fomo').width;
    ctx.font='600 150px Aeonik, Arial, sans-serif';const campusWidth=ctx.measureText('/campus').width;
    const icon=220,gap=48,total=icon+gap+fomoWidth+gap+campusWidth,start=(1536-total)/2;
    ctx.save();ctx.translate(start,50);ctx.scale(icon/100,icon/100);ctx.fillStyle='#f7f7f7';for(const path of markPaths)ctx.fill(new Path2D(path));ctx.restore();
    ctx.fillStyle='#f7f7f7';ctx.font='700 150px Aeonik, Arial, sans-serif';ctx.fillText('fomo',start+icon+gap,209);
    ctx.fillStyle='#aeb8d5';ctx.font='600 150px Aeonik, Arial, sans-serif';ctx.fillText('/campus',start+icon+gap+fomoWidth+gap,209);
  }
  paint();
  const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;
  if(document.fonts)Promise.all([document.fonts.load('700 150px Aeonik'),document.fonts.load('600 150px Aeonik')]).then(()=>{paint();map.needsUpdate=true;document.dispatchEvent(new Event('village:artwork'));});
  return map;
}

// A painted door graphic; it uses the same fomo symbol as the campus banner.
export function createVehicleLogoTexture(T){
  if(typeof document==='undefined')return null;
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=224;
  const ctx=canvas.getContext('2d');
  function paint(){
    ctx.clearRect(0,0,768,224);ctx.fillStyle='#626cf3';ctx.fillRect(0,8,768,208);
    ctx.save();ctx.translate(22,14);ctx.scale(1.95,1.95);ctx.fillStyle='#ffffff';for(const path of markPaths)ctx.fill(new Path2D(path));ctx.restore();
    ctx.fillStyle='#ffffff';ctx.textAlign='left';ctx.textBaseline='middle';ctx.font='700 176px Aeonik, Arial, sans-serif';ctx.letterSpacing='-7px';ctx.fillText('fomo',220,118,515);
  }
  paint();const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;
  document.fonts?.load('700 176px Aeonik').then(()=>{paint();map.needsUpdate=true;document.dispatchEvent(new Event('village:artwork'));});
  return map;
}

export function createEntranceEyesTexture(T){
  if(typeof document==='undefined')return null;
  const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=512;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#626cf3';ctx.fillRect(0,0,2048,512);
  // Oversized original eyes, with only stitched edges around the purple fabric.
  ctx.strokeStyle='#9ca3ff';ctx.lineWidth=2;ctx.setLineDash([9,8]);
  for(const y of [12,500]){ctx.beginPath();ctx.moveTo(18,y);ctx.lineTo(2030,y);ctx.stroke();}
  ctx.save();ctx.translate(1024-50*8.5,256-50*8.5);ctx.scale(8.5,8.5);ctx.fillStyle='#ffffff';
  for(const path of markPaths)ctx.fill(new Path2D(path));ctx.restore();
  const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;return map;
}
