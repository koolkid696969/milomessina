import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../vendor/three.module.min.js';
import {createVillage} from '../village-world.js';
import {createStreetNetwork} from '../village-streets.js';
import {createDistricts} from '../village-districts.js';
import {LOTS,crowdMembers,toWorld,activityPose} from '../village-layout.js';
import {campusPeople,campusPose} from '../village-campus-life.js';
import {roundedLoop} from '../village-district-layout.js';
const {chapters}=JSON.parse(fs.readFileSync(new URL('../chapters.json',import.meta.url)));
const village=createVillage(THREE,chapters);
test('each onboarded member appears exactly once at their own chapter',()=>{
  assert.equal(village.members.length,117);
  for(const c of chapters){const members=village.members.filter(m=>m.chapter===c.id);assert.equal(members.length,c.joined);assert.equal(new Set(members.map(m=>m.member)).size,c.joined);}
  assert.equal(village.members.filter(m=>m.chapter==='empty').length,0);
});
test('crowds are reproducible and reject invalid registration counts',()=>{
  assert.deepEqual(crowdMembers(chapters),crowdMembers(chapters));
  for(const joined of [-1,.5,NaN,'60'])assert.throws(()=>crowdMembers([{...chapters[0],joined}]));
});
test('all six lots face the shared boulevard and are individually selectable',()=>{
  village.world.updateMatrixWorld(true);const ray=new THREE.Raycaster();
  for(const anchor of village.anchors){const front=toWorld(anchor.lot,0,10);assert(Math.abs(front.x)<Math.abs(anchor.lot.x));ray.set(new THREE.Vector3(anchor.lot.x,40,anchor.lot.z),new THREE.Vector3(0,-1,0));assert.equal(ray.intersectObjects(village.pickables)[0]?.object.userData.chapter,anchor.id);}
  assert.equal(village.anchors.length,6);assert.equal(LOTS.length,6);
});

test('conversation gestures update articulated bodies with finite transforms',()=>{
  const before=Array.from(village.parts.armL.instanceMatrix.array);village.animateCrowd(.7);assert.notDeepEqual(Array.from(village.parts.armL.instanceMatrix.array),before);
  for(const time of [0,1.2,47,3600]){village.animateCrowd(time);for(const part of Object.values(village.parts)){assert.equal(part.count,117);assert([...part.instanceMatrix.array].every(Number.isFinite));}}
});
test('repeated architecture is batched for a bounded draw count',()=>{
  let drawables=0;village.world.traverse(object=>{if(object.isMesh)drawables++;});assert(drawables<150,`Too many scene meshes: ${drawables}`);
});

test('most members stay in conversation groups with only five chapter walkers',()=>{
  assert.equal(village.members.filter(m=>m.walking).length,5);
  const standing=village.members.filter(m=>!m.walking);assert(standing.every(m=>m.groupSize>=2));
  for(const member of standing){const a=activityPose(member,0),b=activityPose(member,15);assert.equal(a.x,b.x);assert.equal(a.z,b.z);assert(Math.abs(a.breath)<.01&&Math.abs(b.breath)<.01);}
  const groups=Map.groupBy(standing,m=>m.chapter+':'+m.groupPhase);
  for(const t of [0,4,13,27])for(const group of groups.values())assert.equal(group.filter(m=>activityPose(m,t).speaking).length,1);
  for(const member of village.members.filter(m=>m.walking)){const a=activityPose(member,0),b=activityPose(member,10);assert(Math.hypot(a.x-b.x,a.z-b.z)>1);}
});

test('the surrounding village streams a bounded number of repeatable blocks',()=>{
  const districts=createDistricts(THREE);
  for(const [x,z] of [[0,0],[500,500],[-900,300],[0,0]]){
    districts.update(x,z);districts.animate(18);assert.equal(districts.chunks.size,9);
    let drawables=0;districts.root.traverse(o=>{if(o.isMesh)drawables++;if(o.isInstancedMesh)assert([...o.instanceMatrix.array].every(Number.isFinite));});assert(drawables<270);
  }
  assert(districts.chunks.has('0,0'));assert.equal(village.members.length,117);
});
test('crowd culling bounds contain all chapter activity positions',()=>{
  for(const time of [0,8,24,50])for(const member of village.members){
    const pose=activityPose(member,time);
    for(const part of Object.values(village.parts))assert(part.boundingSphere.containsPoint(new THREE.Vector3(pose.x,1.5,pose.z)));
  }
  const districts=createDistricts(THREE);assert.equal(districts.update(0,0),false);assert.equal(districts.update(150,0),true);
  for(const chunk of districts.chunks.values())assert.equal(chunk.group.matrixAutoUpdate,false);
});

function paintedFloor(){
  const paint=[];let path=[];
  const context={scale(){},fillRect(x,z,w,d){paint.push({kind:'rect',x,z,w,d,color:this.fillStyle});},beginPath(){path=[];},arc(x,z,r){path.push({x,z,r});},moveTo(x,z){path.push({x,z});},lineTo(x,z){path.push({x,z});},fill(){paint.push({kind:'circle',...path[0],color:this.fillStyle});},stroke(){for(let i=1;i<path.length;i++)paint.push({kind:'line',a:path[i-1],b:path[i],width:this.lineWidth,color:this.strokeStyle});}};
  const original=globalThis.document;globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>context})};
  let streets;try{streets=createStreetNetwork(THREE);}finally{if(original===undefined)delete globalThis.document;else globalThis.document=original;}
  const at=(x,z)=>{
    const u=((x/300+.5)%1+1)%1*300,v=((-z/300+.5)%1+1)%1*300;
    return paint.findLast(r=>{
      if(r.kind==='rect')return u>=r.x&&u<r.x+r.w&&v>=r.z&&v<r.z+r.d;
      if(r.kind==='circle')return Math.hypot(u-r.x,v-r.z)<=r.r;
      const dx=r.b.x-r.a.x,dz=r.b.z-r.a.z,t=Math.max(0,Math.min(1,((u-r.a.x)*dx+(v-r.a.z)*dz)/(dx*dx+dz*dz)));
      return Math.hypot(u-r.a.x-t*dx,v-r.a.z-t*dz)<=r.width/2;
    })?.color;
  };
  return {streets,at};
}
test('the opaque campus floor has connected roads and pedestrian-only academic axes',()=>{
  const {streets,at}=paintedFloor();
  assert.deepEqual(streets.material.map.offset.toArray(),[.5,.5]);assert.deepEqual(streets.material.map.repeat.toArray(),[200/3,200/3]);
  for(const [x,z] of [[1,0],[101,0],[-101,0],[20,51],[1,50],[101,-50],[301,0]])assert.equal(at(x,z),'#505a60');
  assert.equal(at(0,100),'#c4c2b3');assert.equal(at(0,-85),'#c4c2b3');
  assert.equal(at(7,0),'#bfc0b5');
});
test('cars and bicycles stay on the painted street network through every corner',()=>{
  const {at}=paintedFloor();const roads=new Set(['#505a60','#c5bea5','#d9d6c7','#a5b4a4','#4b555b','#566066','#485259','#788083','#414c53','#586567']);
  for(const path of [roundedLoop(2.4,-47.6,97.6,47.6,7.8),roundedLoop(-97.6,-47.6,-2.4,47.6,7.8),roundedLoop(4.7,-45.3,95.3,45.3,8),roundedLoop(-95.3,-45.3,-4.7,45.3,8)]){
    for(let distance=0;distance<path.length;distance+=1.7){const p=path.sample(distance);assert(roads.has(at(p.x,p.z)),`Traffic leaves pavement at ${p.x}, ${p.z}: ${at(p.x,p.z)}`);}
    const start=path.sample(0),end=path.sample(path.length-1e-5);assert(Math.hypot(start.x-end.x,start.z-end.z)<.001);
  }
});
test('campus activity varies and stays outside building footprints',()=>{
  const districts=createDistricts(THREE),actions=new Set();
  for(const chunk of districts.chunks.values())for(const person of chunk.people){
    actions.add(person.action);
    for(const time of [0,7,19,45,90]){
      const pose=campusPose(person,time);assert([pose.x,pose.z,pose.angle].every(Number.isFinite));
      for(const spec of chunk.specs){const dx=pose.x-(spec.x-chunk.group.position.x),dz=pose.z-(spec.z-chunk.group.position.z),a=spec.rotation,x=dx*Math.cos(a)-dz*Math.sin(a),z=dx*Math.sin(a)+dz*Math.cos(a);assert(!(Math.abs(x)<spec.width/2+.15&&Math.abs(z)<spec.depth/2+.15),`${person.action} intersects ${spec.type}`);}
    }
  }
  for(const action of ['walk','jog','talk','study','sit','lawn','queue','basketball'])assert(actions.has(action));
  assert.equal(districts.traffic.cars.length,8);assert.equal(districts.traffic.cyclists.length,12);
  for(const time of [0,1,240,10000]){districts.animate(time);districts.root.traverse(o=>{if(o.isInstancedMesh)assert([...o.instanceMatrix.array].every(Number.isFinite));});}
});
test('streaming neighborhoods never replaces or removes the street network',()=>{
  const districts=createDistricts(THREE),street=village.streets,parent=street.parent;
  for(const [x,z] of [[49,0],[51,0],[-51,150],[0,0]]){districts.update(x,z);assert.equal(street.parent,parent);assert.equal(street,village.streets);}
  assert.equal(street.geometry.parameters.width,20000);assert.equal(street.position.y,.045);
});

test('terrain and roads use one opaque floor without a competing large plane',()=>{
  const floors=[];
  village.world.traverse(o=>{if(o.isMesh&&o.geometry.type==='PlaneGeometry'&&o.geometry.parameters.width>=1000)floors.push(o);});
  assert.equal(floors.length,1);assert.equal(floors[0],village.streets);
  assert.equal(floors[0].material.alphaTest,0);assert.equal(floors[0].material.transparent,false);assert.equal(floors[0].material.depthWrite,true);
});

test('registered chapters stay under construction until the fifteenth member',()=>{
  for(const joined of [0,2,14,15]){
    const data=chapters.map((chapter,index)=>index===0?{...chapter,joined}:chapter),scene=createVillage(THREE,data),id=data[0].id;
    assert.equal(Boolean(scene.world.getObjectByName(`chapter-construction-${id}`)),joined<15);
    assert.equal(Boolean(scene.world.getObjectByName(`chapter-house-${id}`)),joined>=15);
    const banner=scene.world.getObjectByName(`chapter-banner-${id}`);
    assert.equal(banner.userData.joined,joined);assert(scene.pickables.includes(banner));
    assert.equal(scene.members.filter(member=>member.chapter===id).length,joined);
    assert.equal(scene.anchors.length,6);
  }
});

test('seeded campus details and appearances reproduce across independent builds',async()=>{
  const {hash,appearance,palettes}=await import('../village-district-layout.js');
  const {createHash}=await import('node:crypto');
  const samples=Array.from({length:300},(_,i)=>appearance('campus',i));
  assert.deepEqual(samples,Array.from({length:300},(_,i)=>appearance('campus',i)));
  assert(new Set(samples.map(p=>p.shirt)).size>20);assert(new Set(samples.map(p=>p.skin)).size===palettes.skin.length);
  for(const p of samples){assert(p.height>=.9&&p.height<=1.1);assert(p.hairLength>=0&&p.hairLength<1);}
  for(const key of ['shirt','skin','height'])assert.notEqual(hash(-2,7,key),hash(-2,8,key));
  const digest=d=>{const h=createHash('sha256');d.root.traverse(o=>{if(o.isInstancedMesh){h.update(o.geometry.type+o.count);h.update(Buffer.from(o.instanceMatrix.array.buffer));if(o.instanceColor)h.update(Buffer.from(o.instanceColor.array.buffer));}});return h.digest('hex');};
  const a=createDistricts(THREE),b=createDistricts(THREE);assert.equal(digest(a),digest(b));
  a.animate(17);b.animate(17);assert.equal(digest(a),digest(b));
});

test('a denser campus retains bounded instances and a persistent static horizon',()=>{
  const districts=createDistricts(THREE),horizon=districts.horizon;
  const counts=[...districts.chunks.values()].map(c=>c.people.length);
  assert(counts.reduce((a,b)=>a+b,0)>=400);assert(Math.max(...counts)>Math.min(...counts)*2);
  const horizonMatrix=horizon.matrixWorld.toArray(),horizonChildren=horizon.children.length;
  for(const [x,z] of [[0,0],[500,500],[-900,300],[2000,-3000],[0,0]]){
    districts.update(x,z);assert.equal(districts.chunks.size,9);
    let instances=0,drawables=0;districts.root.traverse(o=>{if(o.isMesh)drawables++;if(o.isInstancedMesh)instances+=o.count;});
    assert(instances<22000,`Unbounded instances: ${instances}`);assert(drawables<200,`Unbounded meshes: ${drawables}`);
    for(const time of [0,8,16,23.99,240,10000]){districts.animate(time,x,z);districts.root.traverse(o=>{assert(o.matrixWorld.elements.every(Number.isFinite));if(o.isInstancedMesh)assert(o.instanceMatrix.array.every(Number.isFinite));});}
    assert.equal(districts.horizon,horizon);assert.equal(horizon.parent,districts.root);assert.deepEqual(horizon.matrixWorld.toArray(),horizonMatrix);assert.equal(horizon.children.length,horizonChildren);
  }
});

test('new campus activities have deterministic paths and parked cars clear buildings',()=>{
  const districts=createDistricts(THREE),actions=new Set();let cars=0;
  for(const c of districts.chunks.values()){
    for(const person of c.people){actions.add(person.action);if(person.action==='doorway'){assert(campusPose(person,8-person.offset).hidden);assert(!campusPose(person,17-person.offset).hidden);}}
    c.group.traverse(o=>{if(o.name!=='parked-campus-car')return;cars++;
      for(const [x,z] of [[0,0],[-.9,-2.1],[-.9,2.1],[.9,-2.1],[.9,2.1]]){
        const point=o.localToWorld(new THREE.Vector3(x,0,z));
        for(const spec of c.specs){const dx=point.x-spec.x,dz=point.z-spec.z,a=spec.rotation,lx=dx*Math.cos(a)-dz*Math.sin(a),lz=dx*Math.sin(a)+dz*Math.cos(a);assert(!(Math.abs(lx)<spec.width/2+.2&&Math.abs(lz)<spec.depth/2+.2),`Parked car intersects ${spec.type}`);}
      }
    });
  }
  assert(cars>=70);for(const action of ['doorway','dogwalk','skate','frisbee','groundskeeper'])assert(actions.has(action));
  assert.equal(districts.traffic.cars.length,8);assert.equal(districts.traffic.cyclists.length,12);
});

test('member conversations spread across the lawn and porch without body overlap',()=>{
  const members=crowdMembers(chapters);
  for(const chapter of chapters){const standing=members.filter(m=>m.chapter===chapter.id&&!m.walking);
    for(let i=0;i<standing.length;i++)for(let j=i+1;j<standing.length;j++)assert(Math.hypot(standing[i].x-standing[j].x,standing[i].z-standing[j].z)>.5);
    if(chapter.joined>=15){assert(standing.some(m=>m.ground>.3));assert(new Set(standing.map(m=>m.groupSize)).size>=3);}
  }
});

// Locomotion regressions: check physical constraints, not just changing matrices.
const {footstep,gaitPhase,humanPose,speechGesture}=await import('../village-human-motion.js');
test('feet hold ground during stance and return smoothly across each stride',()=>{
  for(const height of [.9,1,1.1])for(const speed of [.65,1,1.6])for(const jog of [false,true]){
    const person={height,phase:0},cycle=(jog?1.48:1.08)*height,samples=[.1,.2,.3];
    const positions=samples.map(u=>{const distance=u*cycle,foot=footstep(gaitPhase(distance,person,jog),jog);assert(foot.planted);assert.equal(foot.lift,0);return distance+foot.z*height;});
    assert(Math.max(...positions)-Math.min(...positions)<1e-9,'A planted foot slides');
    for(const u of [0,jog?.48:.62,1]){
      const a=footstep((u-1e-6)*Math.PI*2,jog),b=footstep((u+1e-6)*Math.PI*2,jog);
      assert(Math.abs(a.z-b.z)<1e-4&&Math.abs(a.lift-b.lift)<1e-4&&Math.abs(a.pitch-b.pitch)<1e-4,'Foot pops at stride boundary');
    }
    assert(footstep(.8*Math.PI*2,jog).lift>.05);
    const dt=.001,d=.2*cycle,a=footstep(gaitPhase(d,person,jog),jog),b=footstep(gaitPhase(d+dt*speed,person,jog),jog);
    assert(Math.abs(speed+(b.z-a.z)*height/dt)<1e-8);
  }
});
test('knees bend forward without stretching legs and standing feet stay still',()=>{
  const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
  for(const action of ['walk','jog'])for(let t=0;t<8;t+=.025){
    const p={action,height:1,phase:.7},rig=humanPose(p,{walking:true,gait:gaitPhase(t,p,action==='jog')},t);
    for(const leg of rig.legs){assert(Math.abs(distance(leg.hip,leg.knee)-.43)<.002);assert(Math.abs(distance(leg.knee,leg.ankle)-.43)<.002);assert(leg.knee[2]>(leg.hip[2]+leg.ankle[2])/2);}
  }
  const p={height:1,phase:2},a=humanPose(p,{walking:false},0),b=humanPose(p,{walking:false},17);
  assert.deepEqual(a.legs.map(l=>l.ankle),b.legs.map(l=>l.ankle));assert.notDeepEqual(a.chest,b.chest);
});
test('chapter walkers keep an even pace and clear their conversation groups',()=>{
  const members=crowdMembers(chapters);
  for(const p of members.filter(m=>m.walking))for(let t=0;t<70;t+=.2){
    const a=activityPose(p,t),b=activityPose(p,t+.001);
    assert(Math.abs(Math.hypot(b.x-a.x,b.z-a.z)/.001-.76)<.001);
    assert(Math.cos(a.rotation)*(b.z-a.z)+Math.sin(a.rotation)*(b.x-a.x)>0);
    for(const other of members.filter(m=>!m.walking&&m.chapter===p.chapter))assert(Math.hypot(a.x-other.x,a.z-other.z)>.5);
  }
});
test('conversation hands settle before speaker changes and routes turn continuously',()=>{
  for(const boundary of [0,1,2,10])assert(speechGesture(boundary-1e-6,6*boundary,2)<1e-8&&speechGesture(boundary+1e-6,6*boundary,2)<1e-8);
  const people=campusPeople('greek',0,0);
  for(const p of people.filter(p=>['walk','jog','groundskeeper'].includes(p.action)))for(let t=0;t<240;t+=.5){
    const a=campusPose(p,t),b=campusPose(p,t+.001),turn=Math.atan2(Math.sin(b.angle-a.angle),Math.cos(b.angle-a.angle));
    assert(Math.abs(turn)<.01,'Instant direction reversal');
  }
});
