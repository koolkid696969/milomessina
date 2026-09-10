import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.min.js';
import {constructionPlan} from '../village-construction-layout.js';
import {crowdMembers,activityPose} from '../village-layout.js';
import {humanPose} from '../village-human-motion.js';
import {createVillage} from '../village-world.js';
const chapter=(joined,id='construction-test')=>({id,name:'Alpha Beta',letters:'ΑΒ',school:'Virginia Tech',shortSchool:'Virginia Tech',joined,active:80});

test('each chapter has a distinct reproducible architectural plan independent of its count',()=>{
  const plans=Array.from({length:100},(_,i)=>constructionPlan(chapter(7,`chapter-${i}`)));
  const shapes=plans.map(({key,progress,...shape})=>JSON.stringify(shape));
  assert.equal(new Set(shapes).size,100);assert.equal(new Set(plans.map(p=>p.form)).size,5);
  assert.deepEqual(plans,Array.from({length:100},(_,i)=>constructionPlan(chapter(7,`chapter-${i}`))));
  const {progress:before,...a}=constructionPlan(chapter(1)),{progress:after,...b}=constructionPlan(chapter(14));
  assert.deepEqual(a,b);assert(before<after);
  assert.notEqual(constructionPlan(chapter(2,'phi-kappa-psi-vt')).form,constructionPlan(chapter(2,'tau-kappa-epsilon-tampa')).form);
});
test('every under-15 member is exactly one builder and zero-member lots stay unstaffed',()=>{
  for(let joined=0;joined<=15;joined++){
    const members=crowdMembers([chapter(joined)]);
    assert.equal(members.length,joined);assert.equal(new Set(members.map(m=>m.member)).size,joined);
    assert.equal(members.filter(m=>m.action==='build').length,joined<15?joined:0);
  }
});
test('builders fetch, carry, install and work with continuous routes clear of other workers',()=>{
  const people=crowdMembers([chapter(14)]);
  assert.equal(new Set(people.map(p=>p.construction.role)).size,4);
  for(const person of people){
    const seen=new Set();let previous;
    for(let time=0;time<person.construction.period*2;time+=.02){
      const pose=activityPose(person,time),rig=humanPose(person,pose,time);seen.add(pose.construction.mode);
      assert([...Object.values(pose).filter(n=>typeof n==='number'),...rig.arms.flatMap(a=>a.hand)].every(Number.isFinite));
      if(previous)assert(Math.hypot(pose.x-previous.x,pose.z-previous.z)<.03,'workers must not teleport between tasks');
      if(pose.construction.mode==='work'){assert.equal(pose.walking,false);assert(pose.construction.effort>=0);}
      if(!pose.walking)assert(rig.legs.every(l=>l.ankle[1]===.13),'working feet stay on the ground');
      previous=pose;
    }
    for(const mode of ['pickup','carry','work','return'])assert(seen.has(mode));
    assert.deepEqual(activityPose(person,10),activityPose(person,10),'pause and replay use absolute time');
  }
  for(let time=0;time<60;time+=.25){
    const poses=people.map(p=>activityPose(p,time));
    for(let i=0;i<poses.length;i++)for(let j=i+1;j<poses.length;j++)assert(Math.hypot(poses[i].x-poses[j].x,poses[i].z-poses[j].z)>.8);
    for(let i=0;i<poses.length;i++){
      const person=people[i],pose=poses[i],a=person.lot.rotation,dx=pose.x-person.lot.x,dz=pose.z-person.lot.z;
      const x=dx*Math.cos(a)-dz*Math.sin(a),z=dx*Math.sin(a)+dz*Math.cos(a);
      assert(Math.abs(x)<5&&Math.abs(z)<5.5,'routes remain inside the construction lot');
      assert(Math.abs(z)>=Math.abs(person.construction.workZ)-1e-8,'workers stay outside walls and framing');
    }
  }
});
test('tool rigs animate, materials are delivered, and crew resources disappear on completion',()=>{
  const village=createVillage(T,[chapter(14)]),builders=village.members;
  assert.equal(village.construction.root.children.length,5);
  for(const mesh of Object.values(village.construction.meshes))assert.equal(mesh.count,14);
  const before=[...village.construction.meshes.load.instanceMatrix.array];village.animateCrowd(3);
  assert.notDeepEqual([...village.construction.meshes.load.instanceMatrix.array],before);
  for(const person of builders){
    const job=person.construction,time=job.pickup+job.turn+job.travel+1-job.offset;
    const pose=activityPose(person,time),next=activityPose(person,time+.25);
    assert.equal(pose.construction.mode,'work');assert.equal(pose.construction.delivered,1);
    assert.notDeepEqual(humanPose(person,pose,time).arms[1].hand,humanPose(person,next,time+.25).arms[1].hand);
  }
  for(const t of [0,20,300,3600]){
    village.animateCrowd(t);
    for(const mesh of Object.values(village.construction.meshes))assert([...mesh.instanceMatrix.array].every(Number.isFinite));
  }
  let disposed=0;for(const mesh of Object.values(village.construction.meshes))mesh.addEventListener('dispose',()=>disposed++);
  const finished=createVillage(T,[chapter(15)],{streets:village.streets});village.dispose();
  assert.equal(disposed,5);assert.equal(finished.construction.root.children.length,0);
  assert(finished.world.getObjectByName('chapter-house-construction-test'));assert(!finished.world.getObjectByName('chapter-construction-construction-test'));
  finished.dispose();
});

test('empty sites have five distinct preparation silhouettes and no invented workers',()=>{
  const input=Array.from({length:35},(_,i)=>chapter(0,`empty-${i}`));
  const village=createVillage(T,input),staging=new Set(input.map(c=>constructionPlan(c).staging));
  assert.equal(staging.size,5);assert.equal(village.members.length,0);
  for(const c of input){const site=village.world.getObjectByName(`chapter-construction-${c.id}`);assert(site.getObjectByName(`site-preparation-${constructionPlan(c).staging}`));}
  village.dispose();
});
