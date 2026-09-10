import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.min.js';
import {prewarmVillage} from '../village-prewarm.js';

function harness(fail=false){
  const scene=new THREE.Scene(),mesh=new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshBasicMaterial());
  const effects=new THREE.Group();effects.visible=false;scene.add(mesh,effects);
  const originalScissor=new THREE.Vector4(4,8,640,480),scissor=originalScissor.clone(),calls=[];
  let scissorTest=false,lighting=0;
  const renderer={
    shadowMap:{needsUpdate:false},
    getScissor:target=>target.copy(scissor),getScissorTest:()=>scissorTest,
    setScissor(x,y,z,w){if(x.isVector4)scissor.copy(x);else scissor.set(x,y,z,w);},setScissorTest:value=>{scissorTest=value;},
    async compileAsync(){calls.push(['compile',lighting]);assert(effects.visible);assert.equal(mesh.frustumCulled,false);if(fail)throw new Error('context lost');},
    render(){calls.push(['render',lighting]);assert.deepEqual(scissor.toArray(),[0,0,1,1]);assert(scissorTest);}
  };
  const applyLighting=night=>{lighting=night;},moneyRain={update(){effects.visible=true;},clear(){effects.visible=false;}};
  return {calls,run:()=>prewarmVillage(THREE,renderer,scene,new THREE.PerspectiveCamera(),applyLighting,moneyRain),assertRestored(){
    assert.equal(lighting,0);assert.equal(effects.visible,false);assert.equal(mesh.frustumCulled,true);
    assert.deepEqual(scissor,originalScissor);assert.equal(scissorTest,false);assert(renderer.shadowMap.needsUpdate);
  }};
}

test('night and day compile and render with effects before restoring playback state',async()=>{
  const h=harness();await h.run();
  assert.deepEqual(h.calls,[['compile',1],['render',1],['compile',0],['render',0]]);h.assertRestored();
});

test('failed warmup still restores lighting, effects, culling and the canvas',async()=>{
  const h=harness(true);await assert.rejects(h.run(),/context lost/);h.assertRestored();
});


test('mobile startup renders daytime with normal culling without compiling or uploading the entire world',async()=>{
  const scene=new THREE.Scene(),mesh=new THREE.Mesh();scene.add(mesh);let renders=0,cleared=false;
  await prewarmVillage(THREE,{render(){renders++;assert(mesh.frustumCulled);assert(cleared);}},scene,new THREE.PerspectiveCamera(),night=>assert.equal(night,0),{clear(){cleared=true;}},{mobile:true});
  assert.equal(renders,1);
});
