import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../vendor/three.module.min.js';
import {schoolIdentity} from '../village-school-banners.js';
import {createVillage} from '../village-world.js';
const {chapters}=JSON.parse(fs.readFileSync(new URL('../chapters.json',import.meta.url)));

test('school branding follows the university independently of chapter identity',()=>{
  assert.deepEqual(chapters.map(c=>schoolIdentity(c).key),['sdsu','coastal','tampa','vt','tampa']);
  assert.equal(schoolIdentity({id:'new-live-id',school:' Florida   International University '}).key,'fiu');
  assert.equal(schoolIdentity({school:'Virginia Polytechnic Institute and State University'}).key,'vt');
  assert.equal(schoolIdentity({school:'University of South Florida',shortSchool:'USF'}).logo,null);
  for(const c of [...chapters,{school:'FIU'}])assert(fs.existsSync(new URL(`../assets/schools/${schoolIdentity(c).logo}`,import.meta.url)));
});
test('completed houses and construction sites have selectable school banners on both sides',()=>{
  const village=createVillage(THREE,chapters);village.world.updateMatrixWorld(true);
  for(const chapter of chapters){
    const banners=[];village.world.traverse(o=>{if(o.name===`school-banner-${chapter.id}`)banners.push(o);});
    assert.equal(banners.length,2);
    assert.deepEqual(banners.map(b=>Math.sign(b.position.x)),[-1,1]);
    for(const banner of banners){
      assert(village.pickables.includes(banner));assert.equal(banner.userData.school,chapter.school);
      const size=banner.getWorldScale(new THREE.Vector3());
      assert(Math.abs(size.x-size.y)<1e-8,'school marks must retain their proportions as buildings grow');
      const center=banner.getWorldPosition(new THREE.Vector3()),normal=new THREE.Vector3(0,0,1).transformDirection(banner.matrixWorld);
      const ray=new THREE.Raycaster(center.clone().addScaledVector(normal,2),normal.negate());
      assert.equal(ray.intersectObjects(village.pickables)[0]?.object.userData.chapter,chapter.id);
    }
  }
  let disposed=0;village.world.traverse(o=>{if(o.name.startsWith('school-banner-'))o.material.addEventListener('dispose',()=>disposed++);});
  village.dispose();assert.equal(disposed,10);
});
