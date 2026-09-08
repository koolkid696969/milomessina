// A tailored chapter flag: Greek-letter panel, readable membership and a sewn hem.
const hardware=new WeakMap();
export function createChapterBanner(T,chapter,width){
  const height=2.17;
  let map,bumpMap,paint;
  if(typeof document!=='undefined'){
    const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=Math.round(canvas.width*height/width);
    const ctx=canvas.getContext('2d'),h=canvas.height,w=canvas.width;
    paint=()=>{
      ctx.clearRect(0,0,w,h);ctx.fillStyle='#ece8dc';ctx.fillRect(0,0,w,h);
      const panel=w*.30;ctx.fillStyle='#252a51';ctx.fillRect(0,0,panel,h);
      ctx.fillStyle='#969fd8';ctx.fillRect(panel,0,6,h);
      // Woven fibers and stitching are printed into the texture, keeping geometry light.
      for(let y=0;y<h;y+=5){ctx.fillStyle=y%10?'#ffffff09':'#111a3006';ctx.fillRect(0,y,w,1);}
      ctx.strokeStyle='#cec7b3';ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.strokeRect(23,23,w-46,h-46);ctx.setLineDash([]);
      ctx.strokeStyle='#8088b0';ctx.strokeRect(34,34,panel-68,h-68);
      ctx.textAlign='center';ctx.textBaseline='middle';ctx.letterSpacing='0px';
      let fontSize=chapter.letters.length>2?205:255;
      ctx.font=`700 ${fontSize}px Georgia, serif`;ctx.fillStyle='#f5f0e2';ctx.fillText(chapter.letters,panel/2,h*.47,panel-82);
      ctx.font='500 35px Aeonik, Arial, sans-serif';ctx.fillStyle='#b4bddf';ctx.letterSpacing='4px';ctx.fillText('FOMO CAMPUS',panel/2,h*.78,panel-80);
      const left=panel+76,right=w-78,center=(left+right)/2,available=right-left;
      ctx.letterSpacing='1px';ctx.fillStyle='#252a44';
      // Fit the real font before drawing instead of squeezing the letterforms.
      fontSize=90;ctx.font=`700 ${fontSize}px Aeonik, Arial, sans-serif`;
      while(ctx.measureText(chapter.name.toUpperCase()).width>available&&fontSize>48){fontSize-=2;ctx.font=`700 ${fontSize}px Aeonik, Arial, sans-serif`;}
      ctx.fillText(chapter.name.toUpperCase(),center,h*.20);
      ctx.letterSpacing='-6px';ctx.font='700 258px Aeonik, Arial, sans-serif';
      const joined=String(chapter.joined),joinedWidth=ctx.measureText(joined).width;
      ctx.letterSpacing='-3px';ctx.font='500 158px Aeonik, Arial, sans-serif';const total=`/ ${chapter.active}`,totalWidth=ctx.measureText(total).width;
      const start=center-(joinedWidth+34+totalWidth)/2;
      ctx.textAlign='left';ctx.fillStyle='#222846';ctx.font='700 258px Aeonik, Arial, sans-serif';ctx.letterSpacing='-6px';ctx.fillText(joined,start,h*.49);
      ctx.fillStyle='#646a83';ctx.font='500 158px Aeonik, Arial, sans-serif';ctx.letterSpacing='-3px';ctx.fillText(total,start+joinedWidth+34,h*.52);
      ctx.textAlign='center';ctx.fillStyle='#505876';ctx.font='700 42px Aeonik, Arial, sans-serif';ctx.letterSpacing='5px';ctx.fillText('MEMBERS ON FOMO',center,h*.75);
      ctx.fillStyle='#73788b';ctx.font='500 38px Aeonik, Arial, sans-serif';ctx.letterSpacing='0px';ctx.fillText(chapter.shortSchool,center,h*.88);
    };
    paint();map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=16;map.minFilter=T.LinearMipmapLinearFilter;
    const weave=document.createElement('canvas');weave.width=weave.height=64;const c=weave.getContext('2d');c.fillStyle='#888888';c.fillRect(0,0,64,64);
    for(let i=0;i<64;i+=4){c.fillStyle='#999999';c.fillRect(i,0,1,64);c.fillStyle='#777777';c.fillRect(0,i+2,64,1);}
    bumpMap=new T.CanvasTexture(weave);bumpMap.wrapS=bumpMap.wrapT=T.RepeatWrapping;bumpMap.repeat.set(width*5,height*5);bumpMap.anisotropy=8;
    if(document.fonts)Promise.all([document.fonts.load('700 90px Aeonik'),document.fonts.load('500 158px Aeonik')]).then(()=>{paint();map.needsUpdate=true;document.dispatchEvent(new Event('village:artwork'));});
  }
  const geometry=new T.PlaneGeometry(width,height,48,16),positions=geometry.attributes.position;
  for(let i=0;i<positions.count;i++){
    const x=positions.getX(i),y=positions.getY(i),drop=(height/2-y)/height;
    positions.setY(i,y-.055*Math.cos(x/width*Math.PI)*drop);
    positions.setZ(i,.025*Math.sin(x/width*Math.PI*6)*drop+.045*Math.sin(drop*Math.PI));
  }
  geometry.computeVertexNormals();
  const banner=new T.Mesh(geometry,new T.MeshPhysicalMaterial({color:map?0xffffff:0xece8dc,...(map?{map,bumpMap,bumpScale:.018}:{}),roughness:.88,sheen:.65,sheenColor:0xf0e9db,sheenRoughness:.9,side:T.DoubleSide}));
  banner.name=`chapter-banner-${chapter.id}`;banner.userData={chapter:chapter.id,name:chapter.name,joined:chapter.joined,active:chapter.active};
  if(!hardware.has(T))hardware.set(T,{geometry:new T.TorusGeometry(.045,.012,6,16),material:new T.MeshStandardMaterial({color:0xb4ab91,metalness:.65,roughness:.35})});
  const kit=hardware.get(T);
  for(const x of [-width/2+.14,width/2-.14])for(const y of [-height/2+.14,height/2-.14]){
    const ring=new T.Mesh(kit.geometry,kit.material);ring.position.set(x,y,.038);banner.add(ring);
  }
  return banner;
}
