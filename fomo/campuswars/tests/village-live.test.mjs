import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.min.js';
import {createVillage} from '../village-world.js';
import {createLots,rowExtension,activityPose} from '../village-layout.js';
import {createDistricts} from '../village-districts.js';
const chapters = count => Array.from({length:count},(_,i)=>({id:`test-${i}`,name:'Alpha Beta',letters:'ΑΒ',school:`School ${i}`,shortSchool:`School ${i}`,joined:i%2?15:1,active:100}));

test('the row adds a selectable lot for every chapter and retains one claim lot',()=>{
  const village=createVillage(THREE,chapters(14));
  assert.equal(village.anchors.length,15);assert.equal(village.anchors.filter(a=>a.id==='empty').length,1);assert.equal(village.extension,95);
  assert.deepEqual(createLots(5).map(({x,z})=>[x,z]),[[-20,-19],[20,-19],[-20,0],[20,0],[-20,19],[20,19]]);
  assert.equal(new Set(village.anchors.map(a=>`${a.lot.x},${a.lot.z}`)).size,15);
  village.world.updateMatrixWorld(true);
  for(const anchor of village.anchors){const ray=new THREE.Raycaster(new THREE.Vector3(anchor.lot.x,40,anchor.lot.z),new THREE.Vector3(0,-1,0));assert.equal(ray.intersectObjects(village.pickables)[0]?.object.userData.chapter,anchor.id);}
  for(const mesh of Object.values(village.parts))assert([...mesh.instanceMatrix.array].every(Number.isFinite));
  assert.equal(village.members.length,112);assert(village.competition.board.position.z>village.anchors.at(-1).lot.z+15);village.dispose();
});
test('new members complete a new chapter house while shared terrain survives scene replacement',()=>{
  const input=chapters(7),old=createVillage(THREE,input),street=old.streets;let disposed=false;street.geometry.addEventListener('dispose',()=>disposed=true);
  assert(old.world.getObjectByName('chapter-construction-test-6'));
  input[6].joined=15;const next=createVillage(THREE,input,{streets:street});old.dispose();
  assert.equal(next.streets,street);assert.equal(disposed,false);assert(next.world.getObjectByName('chapter-house-test-6'));
  assert.equal(next.members.filter(m=>m.chapter==='test-6').length,15);next.dispose();
});
test('long-row crowds remain inside their rendering bounds and scenery clears the end of the row',()=>{
  const village=createVillage(THREE,chapters(20)),districts=createDistricts(THREE,village.extension);
  for(const m of village.members){const p=activityPose(m,5);for(const part of Object.values(village.parts))assert(part.boundingSphere.containsPoint(new THREE.Vector3(p.x,1.5,p.z)));}
  assert.equal(districts.chunks.get('0,1').group.position.z,100+village.extension);
  assert(districts.traffic.loops[0].sample(200).z<=50+village.extension);
  districts.update(0,village.anchors.at(-1).lot.z);assert.equal(districts.chunks.size,9);districts.dispose();village.dispose();
});
test('street geometry inserts continuous sections without overlapping floors',()=>{
  const village=createVillage(THREE,chapters(6)),g=village.streets.geometry;
  assert.equal(rowExtension(6),19);assert.equal(village.streets.userData.extension,19);
  assert([...g.attributes.position.array,...g.attributes.uv.array].every(Number.isFinite));
  const z=[...g.attributes.position.array].filter((_,i)=>i%3===1).map(y=>-y);assert(z.includes(30)&&z.includes(49));
  for(let i=0;i<g.attributes.normal.count;i++)assert(g.attributes.normal.getZ(i)>.99);
  village.dispose();
});
