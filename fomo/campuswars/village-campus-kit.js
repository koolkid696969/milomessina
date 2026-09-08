// Shared architectural parts, textures and landscape geometry. All static parts
// are instanced per streamed block; texture resources live across block changes.
export function createCampusKit(T){
  const geometries={box:new T.BoxGeometry(1,1,1),cylinder:new T.CylinderGeometry(1,1,1,12),sphere:new T.SphereGeometry(1,12,8),leaf:new T.SphereGeometry(1,10,7),cone:new T.ConeGeometry(1,1,12),wheel:new T.TorusGeometry(.34,.045,6,14),dome:new T.SphereGeometry(1,24,12,0,Math.PI*2,0,Math.PI/2)};
  const maps=new Map(),materials=new Map();
  function texture(kind){
    if(maps.has(kind))return maps.get(kind);
    if(typeof document==='undefined')return null;
    const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');
    ctx.fillStyle=kind==='brick'?'#b7a696':'#d8d4c9';ctx.fillRect(0,0,256,256);
    if(kind==='brick')for(let y=0;y<16;y++)for(let x=-1;x<5;x++){const value=173+(x*17+y*13+256)%40;ctx.fillStyle=`rgb(${value},${value-9},${value-15})`;ctx.fillRect(x*64+(y%2)*32+1,y*16+1,62,14);}
    else for(let i=0;i<1500;i++){ctx.fillStyle=i%2?'#bdbdb322':'#ffffff22';ctx.fillRect((i*71)%256,(i*113)%256,1+(i%3),1);}
    const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(kind==='brick'?4:2,kind==='brick'?3:2);map.anisotropy=4;maps.set(kind,map);return map;
  }
  function material(color,kind=''){const key=color+kind;if(!materials.has(key)){const map=kind?texture(kind):null;materials.set(key,new T.MeshLambertMaterial({color,...(map?{map}:{})}));}return materials.get(key);}
  function mesh(p,geo,x,y,z,sx,sy,sz,color,kind=''){const m=new T.Mesh(typeof geo==='string'?geometries[geo]:geo,typeof color==='object'?color:material(color,kind));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;p.add(m);return m;}
  const box=(p,x,y,z,w,h,d,c,k='')=>mesh(p,'box',x,y,z,w,h,d,c,k);
  const cylinder=(p,x,y,z,r,h,c)=>mesh(p,'cylinder',x,y,z,r,h,r,c);
  function bar(p,a,b,r,color){const d=new T.Vector3().subVectors(new T.Vector3(...b),new T.Vector3(...a));const m=mesh(p,'cylinder',(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,r,d.length(),r,color);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m;}
  function sign(p,words,x,y,z,w,h){
    if(typeof document==='undefined'||!words)return;
    const c=document.createElement('canvas');c.width=1024;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#e4ddc9';ctx.fillRect(0,0,1024,128);ctx.fillStyle='#323c46';ctx.font='600 57px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(words,512,67,955);
    const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;const m=mesh(p,new T.PlaneGeometry(w,h),x,y,z,1,1,1,new T.MeshLambertMaterial({map}));m.userData.ownedTexture=true;return m;
  }
  function roof(p,w,d,y,height=3){
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([-w/2,0,-d/2,w/2,0,-d/2,w/2,0,d/2,-w/2,0,d/2,-w*.28,height,0,w*.28,height,0],3));g.setIndex([0,1,5,0,5,4,1,2,5,2,3,4,2,4,5,3,0,4]);g.computeVertexNormals();const mat=material(0x414b54).clone();mat.side=T.DoubleSide;const m=mesh(p,g,0,y,0,1,1,1,mat);m.userData.ownedGeometry=true;return m;
  }
  function tree(p,x,z,seed=0,size=1){
    const h=(4.2+seed%4*.65)*size;
    cylinder(p,x,h*.36,z,.15*size,h*.72,0x76624e);
    for(let i=0;i<3;i++){const a=i*2.4+seed;bar(p,[x,h*.46,z],[x+Math.cos(a)*size,h*.76,z+Math.sin(a)*size],.075*size,0x76624e);}
    const palette=[0x647a45,0x526b43,0x7d894e,0x6a7e53,0x9b9659];
    for(let i=0;i<7;i++){const a=i*2.399+seed,r=i?1.05*size:0;const m=mesh(p,'leaf',x+Math.cos(a)*r,h+(i%3)*.34*size,z+Math.sin(a)*r,(1.25+i%2*.3)*size,(1.45+i%3*.2)*size,1.4*size,palette[(seed+i)%palette.length]);m.rotation.y=a;}
  }
  function bench(p,x,z,turn=0){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=turn;p.add(g);for(let i=0;i<4;i++){box(g,0,.5,-.28+i*.16,2,.075,.12,0x94734e);box(g,0,.7+i*.13,-.37,2,.075,.08,0x94734e);}for(const x of [-.75,.75]){box(g,x,.27,0,.08,.48,.55,0x404b4d);box(g,x,.83,-.37,.07,.75,.07,0x404b4d);}}
  function lamp(p,x,z){cylinder(p,x,2.25,z,.07,4.5,0x424f52);const neck=bar(p,[x,4.4,z],[x+.5,4.7,z],.065,0x424f52);box(p,x+.55,4.68,z,.6,.08,.35,0xdcd9bf);neck.castShadow=false;}
  function table(p,x,z,umbrella=false){cylinder(p,x,.8,z,.72,.1,0x9b805a);cylinder(p,x,.4,z,.06,.8,0x414b50);if(umbrella){cylinder(p,x,1.9,z,.045,2.2,0x695a49);mesh(p,'cone',x,2.9,z,1.55,.52,1.55,0xe4d6b9);}for(const side of [-1,1]){box(p,x+side*1.05,.49,z,.6,.09,.55,0x9b805a);box(p,x+side*1.05,.26,z,.065,.5,.065,0x414b50);}}
  function path(p,a,b,width=2,color=0xc7c3b4){const dx=b[0]-a[0],dz=b[1]-a[1];const m=box(p,(a[0]+b[0])/2,.12,(a[1]+b[1])/2,width,.08,Math.hypot(dx,dz),color);m.rotation.y=Math.atan2(dx,dz);return m;}
  function facadeWindows(p,w,d,h,modern=false){
    for(let side=0;side<4;side++){
      const face=new T.Group();face.rotation.y=side*Math.PI/2;p.add(face);const span=side%2?d:w,depth=side%2?w:d;
      const columns=Math.max(3,Math.floor((span-2)/3.2)),floors=Math.max(2,Math.floor(h/3.2));
      for(let row=0;row<floors;row++)for(let col=0;col<columns;col++){
        const x=(col-(columns-1)/2)*(span-3)/columns,y=2+row*(h-2)/floors;
        box(face,x,y,depth/2+.055,modern?2.4:1.35,modern?2.35:1.8,.09,0xddd7c7);
        box(face,x,y,depth/2+.115,modern?2.26:1.12,modern?2.19:1.58,.035,(col+row+side)%7===0?0xbab690:0x506876);
        if(!modern){box(face,x,y,depth/2+.15,.045,1.6,.035,0xdcd8ca);box(face,x,y,depth/2+.15,1.12,.045,.035,0xdcd8ca);}
      }
    }
  }
  function building(p,s,ox,oz){
    const g=new T.Group();g.name=s.type;g.position.set(s.x-ox,0,s.z-oz);g.rotation.y=s.rotation;p.add(g);
    const w=s.width,d=s.depth,h=s.height,modern=['science','union','gym','arts'].includes(s.type);
    const brick=[0xb67f62,0xae7057,0xc29c7c,0x916d5c][s.seed%4];
    box(g,0,.3,0,w+.65,.55,d+.65,0xbdb7a7,'stone');
    box(g,0,h/2+.55,0,w,h,d,modern?0xc7c4b4:brick,modern?'stone':'brick');
    facadeWindows(g,w,d,h,modern);
    if(!modern){box(g,0,h+.7,0,w+.7,.35,d+.7,0xe4deca);roof(g,w+1,d+1,h+.9,s.type==='residence'?1.8:2.7);for(let y=3.7;y<h;y+=3.5)box(g,0,y,0,w+.2,.14,d+.2,0xc8b69b);}
    else {box(g,0,h+.8,0,w+1.2,.4,d+1.2,0xf0e9d7);for(let x=-w/2+2;x<w/2;x+=5)box(g,x,h+1.4,-d*.25,2,.8,2,0x839090);}
    // Recessed double entrance and broad steps, with a shaded canopy.
    box(g,0,1.7,d/2+.22,3.2,2.8,.1,0x354f59);box(g,0,1.7,d/2+.3,.06,2.8,.05,0xdbd8c8);
    for(let k=0;k<3;k++)box(g,0,.14+k*.15,d/2+1.4-k*.34,5.4,.22,1.8,0xc9c4b6);
    if(s.type==='library'){
      for(const x of [-12,-8,-4,4,8,12]){cylinder(g,x,5.8,d/2+2,.4,10.6,0xe5dfce);cylinder(g,x,.7,d/2+2,.65,.4,0xe5dfce);cylinder(g,x,11.2,d/2+2,.62,.35,0xe5dfce);}
      box(g,0,11.7,d/2+1.5,29,.6,4.5,0xe5dfce);sign(g,'UNIVERSITY LIBRARY',0,11.73,d/2+3.8,23,.6);
      cylinder(g,0,h+3.4,0,4.5,3,0xdad4c0);mesh(g,'dome',0,h+4.9,0,4.7,3.2,4.7,0x8a9b8d);cylinder(g,0,h+8.5,0,.09,1,0xe1d1ac);
    }else if(s.type==='science'){
      box(g,-w*.2,h*.58,d/2+.3,w*.31,h*.94,.5,0x577785);
      for(let x=-w*.36;x<-w*.04;x+=1.7)box(g,x,h*.58,d/2+.61,.065,h*.94,.07,0xc2c9c6);
      for(let y=2;y<h;y+=2)box(g,-w*.2,y,d/2+.64,w*.31,.08,.06,0xc2c9c6);
      box(g,3,4.1,d/2+1.8,12,.3,4.8,0xe3dfcc);
    }else if(s.type==='union'){
      box(g,0,3.5,d/2+.25,w-2,5.3,.3,0x57747b);box(g,0,6.5,d/2+2,w+2,.35,5,0xeee4cd);
      for(let x=-w/2+2;x<w/2;x+=2.3)box(g,x,3.5,d/2+.5,.09,5.3,.08,0xd5d7cd);
      for(let x=-w/2+3;x<w/2;x+=5)table(g,x,d/2+5,true);
    }else if(s.type==='gym'){
      const barrel=new T.CylinderGeometry(d*.58,d*.58,w+1.5,24,1,false,0,Math.PI);barrel.rotateZ(Math.PI/2);const m=mesh(g,barrel,0,h+.9,0,1,.3,1,0x9baba9);m.userData.ownedGeometry=true;
      box(g,0,4,d/2+.3,w-4,5.8,.2,0x62818a);
    }else if(s.type==='arts'){
      const tower=box(g,-w*.32,h*.68,-d*.25,w*.27,h*1.36,d*.5,brick,'brick');tower.rotation.y=.09;
      box(g,w*.12,3.4,d/2+.4,w*.62,4.8,.3,0x64808a);box(g,w*.12,6.2,d/2+2,w*.72,.25,5,0xe4ded0);
      const sculpture=mesh(g,'wheel',w*.28,2.8,d/2+6,6,6,6,0xa26e49);sculpture.rotation.y=.6;
    }else if(s.type==='residence'){
      // An L-shaped hall encloses a courtyard instead of another detached villa.
      box(g,-w*.35,h*.46,-d*.65,w*.3,h*.92,d*.42,brick,'brick');
      for(let y=3;y<h;y+=3)box(g,0,y,d/2+.65,w-2,.12,1.3,0xc5bdac);
      for(let x=-w/2+1;x<w/2;x+=2.8)box(g,x,h/2,d/2+1.1,.07,h,.07,0x636e6d);
    }else if(s.type==='shops'||s.type==='townhouse'){
      const colors=[0xb5896a,0xd0c3a7,0x8c9c92,0xb8a199];
      for(let i=0;i<4;i++){const x=(i-1.5)*w/4;box(g,x,h/2+.5,d/2+.1,w/4-.1,h,.2,colors[(s.seed+i)%4]);box(g,x,1.9,d/2+.25,w/4-.8,2.5,.12,0x49636c);for(let y=5;y<h;y+=3)box(g,x,y,d/2+.25,w/4-1.7,1.6,.12,0x59707a);box(g,x,3.6,d/2+1,w/4-.25,.2,2, i%2?0xb48360:0xe2d6ba);}
    }else{for(const x of [-3.4,3.4])cylinder(g,x,2.15,d/2+1,.2,3.8,0xe6deca);box(g,0,4.2,d/2+1,8,.35,2.8,0xe6deca);}
    if(s.type!=='library')sign(g,s.label,0,modern?6.85:4.7,d/2+.72,Math.min(19,w-2),.62);
    return g;
  }
  function disposeChunk(p){p.traverse(m=>{if(m.isInstancedMesh)m.dispose();if(m.userData.ownedMaterial)m.material.dispose();if(m.userData.ownedTexture){m.material.map.dispose();m.material.dispose();m.geometry.dispose();}else if(m.userData.ownedGeometry){m.geometry.dispose();if(![...materials.values()].includes(m.material))m.material.dispose();}});}
  return {geometries,material,mesh,box,cylinder,bar,tree,bench,lamp,table,path,sign,building,disposeChunk};
}
