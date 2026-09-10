import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.min.js';
import {createStreetNavigation,streetStep,streetStops} from '../village-street-navigation.js';
test('invisible road targets extend with the block and provide selectable destinations',()=>{
  for(const extension of [0,19,95]){
    const nav=createStreetNavigation(T,extension),stops=streetStops(extension);
    assert.equal(stops[0],-28.5);assert.equal(stops.at(-1),28.5+extension);
    assert.equal(streetStep(stops[0],-1,extension),stops[0]);assert.equal(streetStep(stops.at(-1),1,extension),stops.at(-1));
    nav.root.traverse(object=>{if(object.isMesh)assert.equal(object.material.visible,false,'navigation must draw no ground overlays');});
    nav.root.visible=true;nav.update(0,0);nav.root.updateMatrixWorld(true);
    for(const hit of nav.pickables.filter(o=>o.parent.visible)){
      const z=hit.userData.streetZ;const ray=new T.Raycaster(new T.Vector3(0,3,z),new T.Vector3(0,-1,0));
      assert.equal(ray.intersectObject(hit)[0]?.object.userData.streetZ,z);
    }
    let disposed=0;nav.pickables[0].geometry.addEventListener('dispose',()=>disposed++);nav.dispose();assert.equal(disposed,1);
  }
});
