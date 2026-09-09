import {bannerIdentity,paintChapterBanner} from './village-banner-art.js?v=27';
export {bannerIdentity} from './village-banner-art.js?v=27';
// Chapter-specific artwork on shared sewn cloth and mounting hardware.
const hardware=new WeakMap();
export function createChapterBanner(T,chapter,width){
  const height=2.17;
  let map,bumpMap,paint;
  if(typeof document!=='undefined'){
    const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=Math.round(canvas.width*height/width);
    const ctx=canvas.getContext('2d'),h=canvas.height,w=canvas.width;
    paint=()=>paintChapterBanner(ctx,chapter,w,h);
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
  const banner=new T.Mesh(geometry,new T.MeshPhysicalMaterial({color:map?0xffffff:bannerIdentity(chapter).primary,...(map?{map,bumpMap,bumpScale:.018}:{}),roughness:.88,sheen:.65,sheenColor:0xf0e9db,sheenRoughness:.9,side:T.DoubleSide}));
  banner.name=`chapter-banner-${chapter.id}`;banner.userData={chapter:chapter.id,name:chapter.name,joined:chapter.joined,active:chapter.active,design:bannerIdentity(chapter).key};
  if(!hardware.has(T))hardware.set(T,{geometry:new T.TorusGeometry(.045,.012,6,16),material:new T.MeshStandardMaterial({color:0xb4ab91,metalness:.65,roughness:.35})});
  const kit=hardware.get(T);
  for(const x of [-width/2+.14,width/2-.14])for(const y of [-height/2+.14,height/2-.14]){
    const ring=new T.Mesh(kit.geometry,kit.material);ring.position.set(x,y,.038);banner.add(ring);
  }
  return banner;
}
