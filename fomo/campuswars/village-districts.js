import {BLOCK,districtSpecs,districtAt} from './village-district-layout.js';

// Stream a 3×3 neighborhood around the camera. Distant blocks fade into the haze.
export function createDistricts(THREE){
  const root=new THREE.Group(),chunks=new Map(),materials=new Map();
  const cube=new THREE.BoxGeometry(1,1,1),sphere=new THREE.SphereGeometry(1,8,6),roofGeometry=new THREE.ConeGeometry(1,1,4),ringGeometry=new THREE.TorusGeometry(.32,.045,5,12);
  function material(color){if(!materials.has(color))materials.set(color,new THREE.MeshLambertMaterial({color}));return materials.get(color);}
  function mesh(parent,geometry,x,y,z,sx,sy,sz,color,turn=0){const m=new THREE.Mesh(geometry,material(color));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.y=turn;m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  const box=(p,x,y,z,w,h,d,c)=>mesh(p,cube,x,y,z,w,h,d,c);
  function tree(parent,x,z,seed){box(parent,x,1.5,z,.24,3,.24,0x71604c);mesh(parent,sphere,x,3.3,z,1.8,2.3,1.6,[0x536555,0x606e5b,0x71806b][seed%3]);}
  function bench(parent,x,z,turn=0){const p=new THREE.Group();p.position.set(x,0,z);p.rotation.y=turn;parent.add(p);box(p,0,.58,0,2,.14,.65,0x9c8261);box(p,0,.94,-.3,2,.6,.12,0x9c8261);for(const x of [-.7,.7])box(p,x,.25,0,.12,.5,.5,0x484c4e);}
  function text(parent,words,x,y,z,w,h,color='#eee9d9'){
    if(typeof document==='undefined')return;
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const context=canvas.getContext('2d');context.fillStyle='#3d514f';context.fillRect(0,0,1024,256);context.font='600 82px Arial';context.textAlign='center';context.textBaseline='middle';context.fillStyle=color;context.fillText(words,512,130,930);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:texture}));m.position.set(x,y,z);parent.add(m);
  }
  function makeChunk(cx,cz){
    const p=new THREE.Group();p.position.set(cx*BLOCK,0,cz*BLOCK);root.add(p);
    box(p,0,-.025,0,11,.12,100,0x424954);box(p,0,-.024,-50,100,.12,11,0x424954);
    for(const side of [-1,1]){box(p,side*6.8,.02,0,2.5,.23,85,0xafb2ac);box(p,0,.02,-50+side*6.8,100,.23,2.5,0xafb2ac);}
    for(let z=-36;z<=36;z+=9)box(p,0,.05,z,.13,.025,2,0xcac1a8);
    for(let x=-40;x<=40;x+=9)box(p,x,.05,-50,2,.025,.13,0xcac1a8);
    for(const side of [-1,1])for(let z=-35;z<=35;z+=18){tree(p,side*34,z,Math.abs(cx+cz+z)%3);if(z%2){box(p,side*7.8,1.7,z,.1,3.4,.1,0x54595e);box(p,side*7.8,3.45,z,.6,.15,.6,0xddd5b5);}}
    const core=cx===0&&cz===0;
    const specs=districtSpecs(cx,cz),colliders=[];
    for(const spec of specs){
      const h=new THREE.Group();h.position.set(spec.x-cx*BLOCK,0,spec.z-cz*BLOCK);h.rotation.y=spec.rotation;p.add(h);const color=[0xa77864,0xb89272,0xbab9a6,0x9e786b,0x8f817c][spec.variant],w=spec.width,d=spec.depth,tall=spec.height;
      box(h,0,.25,0,w+1,.5,d+1,0xc0b6a0);box(h,0,tall/2+.5,0,w,tall,d,color);box(h,0,tall+.6,0,w+.5,.24,d+.5,0xe1dbca);
      mesh(h,roofGeometry,0,tall+1.8,0,w*.77,2.4,d*.77,0x49505a,Math.PI/4);
      box(h,0,1.5,d/2+.08,1.1,2,.13,0x39474e);box(h,0,.23,d/2+4,1.4,.1,8,0xadafa1);
      for(let floor=0;floor<2;floor++)for(let col=-2;col<=2;col++)if(col||floor){box(h,col*2,2+floor*3,d/2+.05,.95,1.6,.13,0xe3dcc7);box(h,col*2,2+floor*3,d/2+.13,.68,1.33,.09,0x869793);}
      const portico=spec.variant%2===0;
      for(const x of [-3.1,-1.05,1.05,3.1])box(h,x,(portico?tall:3.2)/2+.4,d/2+1.6,.28,portico?tall:3.2,.28,0xe3dcc7);
      box(h,0,(portico?tall:3.2)+.55,d/2+.9,7.3,.38,2.7,0xe0d9c5);
      if(portico)mesh(h,roofGeometry,0,tall+1.5,d/2+.9,5.5,1.5,2.4,0xe0d9c5,Math.PI/4);
      box(h,-w*.25,tall+1.5,-1,.7,2.5,.8,color);
      for(const x of [-5,5])mesh(h,sphere,x,.65,d/2+2,.65,.6,.65,0x596c59);
      colliders.push({x:spec.x,z:spec.z,w:d+4,d:w+2,h:tall+3});
    }
    if(core){
      // Coffee terrace: counter, striped awning, outdoor tables and bicycle parking.
      box(p,41,.02,-18,16,.13,18,0xbab5a5);box(p,41,1.9,-20,8,3.6,5.5,0xd4c8ac);box(p,41,3.9,-20,9,.25,6.2,0x565e59);box(p,41,2,-17.17,6.8,1.8,.08,0x526b70);
      for(let i=0;i<8;i++)box(p,37.5+i,3.2,-16.5,1,.12,2.2,i%2?0xd4a47c:0xeae4d0);
      text(p,'THE COFFEE CORNER',41,3.6,-17.1,7,.8);
      for(const x of [37.5,42,46]){box(p,x,.83,-11.5,1.3,.1,1.3,0x8f7757);box(p,x,.4,-11.5,.15,.8,.15,0x6b6c64);bench(p,x,-10);}
      for(let i=0;i<3;i++){const x=35+i*1.3;for(const z of [-24.5,-23.3]){const wheel=mesh(p,ringGeometry,x,.45,z,1,1,1,0x343c40,Math.PI/2);wheel.castShadow=false;}box(p,x,.8,-23.9,.1,.1,1.2,0x8e9fd2);box(p,x,1.05,-23.35,.09,.7,.09,0x8e9fd2);}
      // The quad with a low fountain, benches, paths and mature trees.
      box(p,42,.04,14,18,.18,20,0xafb4a5);mesh(p,new THREE.CylinderGeometry(3,3,.4,24),42,.35,14,1,1,1,0xd3cbb6);mesh(p,new THREE.CylinderGeometry(2.65,2.65,.1,24),42,.59,14,1,1,1,0x72979f);box(p,42,1.1,14,.5,1.2,.5,0xd3cbb6);
      bench(p,36,12,Math.PI/2);bench(p,48,12,-Math.PI/2);bench(p,42,21);text(p,'THE QUAD',42,1.3,25,5,.8);
      for(const x of [33,51])for(const z of [4,24])tree(p,x,z,2);
      // Outdoor courts and a shaded picnic edge, connected to the central row.
      box(p,-42,.08,10,18,.18,28,0x697c80);for(const x of [-50,-34])box(p,x,.19,10,.1,.02,25,0xdddcca);for(const z of [-2.5,10,22.5])box(p,-42,.19,z,16,.02,.1,0xdddcca);
      for(const z of [-1.5,21.5]){box(p,-42,1.6,z,.14,3.2,.14,0xc1c3bc);box(p,-42,3.2,z,1.5,1,.1,0xe4dfcb);const hoop=mesh(p,ringGeometry,-42,2.9,z+(z<0?.4:-.4),1.15,1.15,1.15,0xb77357);hoop.rotation.x=Math.PI/2;}
      bench(p,-32,7,Math.PI/2);bench(p,-32,14,Math.PI/2);text(p,'THE COURTS',-42,1.3,26,6,.8);
      for(const z of [-9,31])tree(p,-43,z,1);
      for(const x of [-42,42])box(p,x/2,.08,34,Math.abs(x),.13,2.2,0xa9b09f);
    }else if((cx+cz)%4===0){
      for(const side of [-1,1]){box(p,side*23,.04,0,20,.2,19,0x788474);bench(p,side*23,4);tree(p,side*23-5,-3,1);tree(p,side*23+5,-3,2);}
    }
    // Ambient campus visitors are scenery, distinct from the chapter member rigs.
    const population=core?20:8,people=[];
    for(let i=0;i<population;i++)people.push({phase:i*1.67+cx+cz,side:i%2?1:-1,walking:!core||i<8});
    const bodies=new THREE.InstancedMesh(cube,material(0xc6bda9),population),heads=new THREE.InstancedMesh(sphere,material(0xc59370),population),legs=new THREE.InstancedMesh(cube,material(0x4b5660),population*2);
    for(const m of [bodies,heads,legs]){m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.frustumCulled=true;m.boundingSphere=new THREE.Sphere(new THREE.Vector3(0,1,0),62);p.add(m);}
    const dummy=new THREE.Object3D();
    function pose(instance,index,x,y,z,sx,sy,sz,angle=0){dummy.position.set(x,y,z);dummy.rotation.set(0,angle,0);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();instance.setMatrixAt(index,dummy.matrix);}
    function animate(t){people.forEach((person,i)=>{
      let x,z,angle=0,gait=0;
      if(person.walking){const u=(t*.009+person.phase/7)%1;z=-39+78*(u<.5?u*2:2-u*2);x=person.side*(core?31:6.7);angle=u<.5?0:Math.PI;gait=Math.sin(t*3.6+person.phase);}
      else{const group=Math.floor((i-8)/3),seat=(i-8)%3,a=seat*Math.PI*2/3;const gx=group<2?38+group*6:38+(group-2)*7,gz=group<2?-11:20;x=gx+Math.sin(a)*.8;z=gz+Math.cos(a)*.8;angle=a+Math.PI;}
      pose(bodies,i,x,.77,z,.34,.55,.25,angle);pose(heads,i,x,1.2+Math.sin(t+person.phase)*.009,z,.15,.17,.15);
      for(let leg=0;leg<2;leg++)pose(legs,i*2+leg,x+(leg?-.1:.1),.3,z+gait*(leg?.15:-.15),.13,.55,.13);
    });for(const m of [bodies,heads,legs])m.instanceMatrix.needsUpdate=true;}
    animate(0);
    p.updateMatrixWorld(true);
    const batches=new Map();p.traverse(m=>{if(!m.isMesh||m.isInstancedMesh)return;const key=m.geometry.uuid+m.material.uuid;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(m);});
    const inverse=new THREE.Matrix4().copy(p.matrixWorld).invert(),matrix=new THREE.Matrix4();
    for(const meshes of batches.values()){
      if(meshes.length<2)continue;const first=meshes[0],batch=new THREE.InstancedMesh(first.geometry,first.material,meshes.length);batch.castShadow=true;batch.receiveShadow=true;
      meshes.forEach((m,i)=>{matrix.multiplyMatrices(inverse,m.matrixWorld);batch.setMatrixAt(i,matrix);m.removeFromParent();});batch.instanceMatrix.needsUpdate=true;batch.computeBoundingSphere();p.add(batch);
    }
    p.updateMatrixWorld(true);p.traverse(object=>object.matrixAutoUpdate=false);
    return {group:p,animate,colliders};
  }
  let lastKey='';
  function update(x,z){const center=districtAt(x,z),key=`${center.x},${center.z}`;if(key===lastKey)return false;lastKey=key;const wanted=new Set();
    for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const a=center.x+dx,b=center.z+dz,id=`${a},${b}`;wanted.add(id);if(!chunks.has(id))chunks.set(id,makeChunk(a,b));}
    for(const [id,chunk] of chunks)if(!wanted.has(id)){chunk.group.removeFromParent();chunk.group.traverse(m=>{if(m.isInstancedMesh)m.dispose();if(m.isMesh){if(m.material.map){m.material.map.dispose();m.material.dispose();}if(![cube,sphere,roofGeometry,ringGeometry].includes(m.geometry))m.geometry.dispose();}});chunks.delete(id);}
    root.updateMatrixWorld(true);return true;
  }
  function animate(time,x=0,z=0){for(const chunk of chunks.values())if(Math.hypot(chunk.group.position.x-x,chunk.group.position.z-z)<125)chunk.animate(time);}
  update(0,0);
  return {root,update,animate,chunks};
}
