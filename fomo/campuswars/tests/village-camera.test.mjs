import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as THREE from '../vendor/three.module.min.js';

function cameraHarness(reduced=false){
  const elements=new Map(),events=new Map();let intersection,frame,camera;
  function element(id){if(!elements.has(id))elements.set(id,{clientWidth:1200,clientHeight:650,hidden:false,classList:{add(){},toggle(){}},getAttribute:()=> 'false',setAttribute(){},prepend(){},focus(){},setPointerCapture(){},addEventListener(type,fn){events.set(id+':'+type,fn);}});return elements.get(id);}
  element('chapters-data').textContent='{"chapters":[]}';
  const canvas=element('canvas');
  class Renderer{constructor(){this.domElement=canvas;this.shadowMap={};}setPixelRatio(){}setSize(){}render(scene,view){camera=view;}}
  const sandbox={THREE:{...THREE,WebGLRenderer:Renderer},createVillage:()=>({world:new THREE.Group(),anchors:[],competition:{badges:[]},animateCrowd(){},animateEffects(){}}),createDistricts:()=>({root:new THREE.Group(),update(){return false;},animate(){}}),document:{getElementById:element,addEventListener(){},hidden:false},matchMedia:query=>({matches:query.includes('reduced-motion')&&reduced}),devicePixelRatio:1,location:{hash:''},URLSearchParams,ResizeObserver:class{observe(){}},IntersectionObserver:class{constructor(fn){intersection=fn;}observe(){}},addEventListener(){},requestAnimationFrame:fn=>{frame=fn;return 1;},cancelAnimationFrame(){}};
  const source=fs.readFileSync(new URL('../village.js',import.meta.url),'utf8').replace(/^import .*;$/gm,'');
  vm.runInNewContext(source,sandbox);
  let now=100;
  return {show(visible){intersection([{isIntersecting:visible}]);},step(seconds){for(let t=0;t<seconds;t+=1/60){now+=1000/60;const fn=frame;frame=null;fn?.(now);}return camera.position.clone();},drag(){events.get('canvas:pointerdown')({button:0,pointerId:1,clientX:0,clientY:0});},reset(){events.get('village-overview:click')();}};
}
test('entrance falls from the campus overview into the row in four seconds and does not replay',()=>{
  const h=cameraHarness();h.show(true);const high=h.step(.02);assert(high.y>100);
  const low=h.step(4);assert(low.y<14);assert(low.distanceTo(high)>90);
  h.show(false);h.step(1);h.show(true);assert(h.step(.02).y<14);
});
test('taking control cancels the descent immediately and reset remains usable',()=>{
  const h=cameraHarness();h.show(true);h.step(1);h.drag();const at=h.step(.02),later=h.step(5);assert(at.distanceTo(later)<.001);
  h.reset();assert(h.step(2).y<14);
});
test('reduced motion opens directly on the row',()=>{
  const h=cameraHarness(true);h.show(true);const a=h.step(.02);assert(a.y<14);assert(a.distanceTo(h.step(5))<.001);
});
