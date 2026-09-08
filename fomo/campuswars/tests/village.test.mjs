import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../vendor/three.module.min.js';
import {createVillage} from '../village-world.js';
import {createStreetNetwork} from '../village-streets.js';
import {createDistricts} from '../village-districts.js';
import {LOTS,crowdMembers,toWorld,activityPose} from '../village-layout.js';
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
  for(const member of village.members.filter(m=>m.walking)){assert.notEqual(activityPose(member,0).x,activityPose(member,10).x);}
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

test('street texture aligns continuously with the world grid and intersections',()=>{
  const paint=[];
  const context={scale(){},clearRect(){},fillRect(x,z,w,d){paint.push({x,z,w,d,color:this.fillStyle});}};
  const original=globalThis.document;
  globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>context})};
  let streets;
  try{streets=createStreetNetwork(THREE);}finally{if(original===undefined)delete globalThis.document;else globalThis.document=original;}
  assert.deepEqual(streets.material.map.offset.toArray(),[.5,.5]);
  assert.deepEqual(streets.material.map.repeat.toArray(),[200,200]);
  const at=(x,z)=>{
    const u=((x/100+.5)%1+1)%1*100,v=((-z/100+.5)%1+1)%1*100;
    return paint.findLast(r=>u>=r.x&&u<r.x+r.w&&v>=r.z&&v<r.z+r.d)?.color;
  };
  for(const [x,z] of [[0,0],[0,100],[-100,0],[20,50],[0,50],[100,-50]])assert.equal(at(x,z),'#424954');
  assert.equal(at(20,0),'#626c62');assert.equal(at(6.8,0),'#afb2ac');
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
