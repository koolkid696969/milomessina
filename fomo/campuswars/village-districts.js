import {BLOCK,districtSpecs,districtAt,districtKind,mod} from './village-district-layout.js?v=17';
import {createCampusKit} from './village-campus-kit.js?v=17';
import {createCampusPeople,createCampusTraffic} from './village-campus-life.js?v=17';

export function createDistricts(T){
  const root=new T.Group(),chunks=new Map(),kit=createCampusKit(T);
  const {box,mesh,cylinder,bar,tree:plantTree,bench,lamp,table,path,sign}=kit;
  function tree(p,x,z,seed,size){
    const blocked=(p.userData.specs||[]).some(s=>{const dx=x-(s.x-p.position.x),dz=z-(s.z-p.position.z),a=s.rotation;return Math.abs(dx*Math.cos(a)-dz*Math.sin(a))<s.width/2+2&&Math.abs(dx*Math.sin(a)+dz*Math.cos(a))<s.depth/2+3;});
    if(!blocked)plantTree(p,x,z,seed,size);
  }
  const traffic=createCampusTraffic(T,kit);root.add(traffic.root);
  function bikeRack(p,x,z){
    for(let i=0;i<5;i++){
      const a=x+i*.75;bar(p,[a,.1,z],[a,.9,z],.035,0x7a898b);bar(p,[a,.9,z],[a,.9,z+1],.035,0x7a898b);bar(p,[a,.9,z+1],[a,.1,z+1],.035,0x7a898b);
      if(i%2===0){for(const offset of [-.1,1.2]){const w=mesh(p,'wheel',a+.16,.4,z+offset,1,1,1,0x384649);w.rotation.y=Math.PI/2;}
        bar(p,[a+.16,.4,z-.1],[a+.16,.9,z+.35],.033,0xa78059);bar(p,[a+.16,.9,z+.35],[a+.16,.4,z+1.2],.033,0xa78059);bar(p,[a+.16,.4,z-.1],[a+.16,.4,z+1.2],.033,0xa78059);
      }
    }
  }
  function corePlaces(p){
    box(p,41,.07,-18,16,.08,18,0xc4bcaa);box(p,41,1.95,-20,8,3.6,5.5,0xc5b599,'stone');box(p,41,3.92,-20,9,.22,6.2,0x626961);box(p,41,2,-17.17,6.8,1.8,.08,0x49616b);
    for(let i=0;i<8;i++)box(p,37.5+i,3.2,-16.5,1,.12,2.2,i%2?0xb4805d:0xe9dfc7);
    sign(p,'CAMPUS COFFEE',41,3.6,-17.12,7,.6);
    for(const x of [37,43,46])table(p,x,-11,x!==43);
    bikeRack(p,34,-25);
    // A low fountain and curved seating edge anchor the social lawn.
    cylinder(p,42,.3,14,3.2,.45,0xc9c2b1);cylinder(p,42,.56,14,2.85,.07,0x729ca1);cylinder(p,42,.8,14,.35,.7,0xd6cdb6);
    for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const water=bar(p,[42,.9,14],[42+Math.cos(a)*1.1,.68,14+Math.sin(a)*1.1],.025,0xb6cfca);water.castShadow=false;}
    bench(p,36,12,Math.PI/2);bench(p,48,12,-Math.PI/2);bench(p,42,21);bench(p,35,23,.4);
    // Court lines sit on one raised sports slab, with a visible curb clearance.
    box(p,-42,.2,10,18,.24,28,0x718888);
    for(const x of [-50,-34])box(p,x,.335,10,.09,.025,25,0xe8e0cd);
    for(const z of [-2.5,10,22.5])box(p,-42,.335,z,16,.025,.09,0xe8e0cd);
    for(const z of [-1.5,21.5]){cylinder(p,-42,1.8,z,.07,3.2,0x8a9590);box(p,-42,3.35,z,1.55,1,.1,0xe4dfcb);const hoop=mesh(p,'wheel',-42,3.05,z+(z<0?.5:-.5),1.15,1.15,1.15,0xb37350);hoop.rotation.x=Math.PI/2;}
    bench(p,-32,7,Math.PI/2);bench(p,-32,14,Math.PI/2);
    for(const z of [-34,-7,31]){tree(p,-42,z,mod(z,9),1.1);tree(p,43,z+2,mod(z+3,9),1.0);}
    for(const side of [-1,1]){path(p,[side*30.8,-39],[side*30.8,39],2.6);path(p,[side*7,34],[side*45,34],2.2);}
    for(const [x,z] of [[-52,-30],[53,-22],[55,5],[-56,25],[-52,-9],[55,34]])tree(p,x,z,mod(x+z,9),1.15);
  }
  function landscape(p,kind,cx,cz){
    const spine=['library','athletics','commons'].includes(kind),seed=mod(cx*17+cz*41,27);
    // Staggered groves and varied setbacks replace the repeated fence of trees.
    if(kind==='greek'){corePlaces(p);return;}
    if(spine){
      path(p,[0,kind==='athletics'?-39:-7],[0,41],5);path(p,[-38,34],[38,34],2.5);if(kind!=='athletics')path(p,[-19,0],[19,27],2.2);else path(p,[-35,-8],[35,-8],2.2);
      for(const side of [-1,1]){bench(p,side*12,36);for(const z of [8,24,39])tree(p,side*(22+(z%3)*3),z,seed+mod(z,8),1.15);}
      for(let i=0;i<4;i++){box(p,(kind==='athletics'?13:-20)+i*2.1,.16,(kind==='athletics'?-21:15)+(i%2)*2,1.8,.025,1.3,[0xad8769,0x78899a,0xd0c4a5,0x8f9586][i]);}
      if(kind==='athletics'){
        for(const x of [-22,-2])for(const z of [-33,-14]){cylinder(p,x,1.1,z,.065,2.1,0xe2deca);}
        for(const z of [-33,-14])bar(p,[-22,2.1,z],[-2,2.1,z],.025,0xd8d5c7);
        sign(p,'INTRAMURAL FIELD',-12,1.5,-10,12,.55);
      }
    }else{
      for(const side of [-1,1]){
        path(p,[side*7,38],[side*42,38],2.3);bench(p,side*29,38);
        for(const z of [-39,5,39])tree(p,side*(40+(z%3)),z,seed+mod(z,8),.95+seed%3*.1);
        bikeRack(p,side>0?11:-16,30);
      }
      if(kind==='town'){
        for(let i=0;i<3;i++){table(p,18+i*4.2,5,i!==1);}
      }
    }
    for(const side of [-1,1])for(const z of [-35,17])lamp(p,side*8,z);
    // Bus shelters and campus noticeboards make the curb useful.
    if(kind==='science'||kind==='arts'){
      const x=kind==='science'?8.8:-8.8;for(const z of [-30,-24])cylinder(p,x,1.4,z,.045,2.8,0x657774);
      box(p,x,2.86,-27,2.5,.14,7.2,0x748984);box(p,x+(x>0?1:-1),1.5,-27,.08,2.4,6,0x90aaa5);bench(p,x,-27,Math.PI/2);
      sign(p,'CAMPUS SHUTTLE',x,2.7,-23.35,2,.35);
    }
    for(let i=0;i<4;i++){
      const x=(i%2?1:-1)*(45+(seed%3)),z=-32+i*19;
      tree(p,x,z,seed+i,.8+(i%3)*.17);
    }
  }
  function makeChunk(cx,cz){
    const p=new T.Group();p.position.set(cx*BLOCK,0,cz*BLOCK);root.add(p);
    const kind=districtKind(cx,cz),specs=districtSpecs(cx,cz);p.userData.specs=specs;
    for(const spec of specs)kit.building(p,spec,cx*BLOCK,cz*BLOCK);
    landscape(p,kind,cx,cz);
    const activity=createCampusPeople(T,kit,kind,cx,cz);p.add(activity.root);
    p.updateMatrixWorld(true);
    const batches=new Map();p.traverse(m=>{
      if(!m.isMesh||m.isInstancedMesh||m.userData.ownedGeometry||m.userData.ownedTexture)return;
      const key=m.geometry.uuid+(m.material.map?.uuid||'plain')+m.castShadow+m.receiveShadow;
      if(!batches.has(key))batches.set(key,[]);batches.get(key).push(m);
    });
    const inverse=new T.Matrix4().copy(p.matrixWorld).invert(),matrix=new T.Matrix4();
    for(const meshes of batches.values()){
      if(meshes.length<2)continue;
      const first=meshes[0],material=first.material.clone();material.color.set(0xffffff);const batch=new T.InstancedMesh(first.geometry,material,meshes.length);batch.userData.ownedMaterial=true;batch.castShadow=first.castShadow;batch.receiveShadow=first.receiveShadow;
      meshes.forEach((m,i)=>{matrix.multiplyMatrices(inverse,m.matrixWorld);batch.setMatrixAt(i,matrix);batch.setColorAt(i,m.material.color);m.removeFromParent();});batch.instanceMatrix.needsUpdate=true;batch.computeBoundingSphere();p.add(batch);
    }
    p.updateMatrixWorld(true);p.traverse(o=>o.matrixAutoUpdate=false);
    return {group:p,kind,specs,people:activity.people,animate:activity.animate,dispose(){activity.dispose();kit.disposeChunk(p);}};
  }
  let lastKey='';
  function update(x,z){
    const center=districtAt(x,z),key=`${center.x},${center.z}`;if(key===lastKey)return false;lastKey=key;
    const wanted=new Set();
    for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const a=center.x+dx,b=center.z+dz,id=`${a},${b}`;wanted.add(id);if(!chunks.has(id))chunks.set(id,makeChunk(a,b));}
    for(const [id,chunk] of chunks)if(!wanted.has(id)){chunk.group.removeFromParent();chunk.dispose();chunks.delete(id);}
    root.updateMatrixWorld(true);return true;
  }
  function animate(time,x=0,z=0){
    for(const chunk of chunks.values())if(Math.hypot(chunk.group.position.x-x,chunk.group.position.z-z)<165)chunk.animate(time);
    traffic.animate(time,x,z);
  }
  update(0,0);
  return {root,update,animate,chunks,traffic};
}
