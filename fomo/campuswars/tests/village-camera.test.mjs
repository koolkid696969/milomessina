import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as THREE from '../vendor/three.module.min.js';
import {INTRO_DURATION,openingView,introViewAt,introCaptionAt} from '../village-intro.js';

function cameraHarness(reduced=false,initialHash=''){
  const elements=new Map(),events=new Map(),selections=[];let intersection,frame,camera;
  function element(id){if(!elements.has(id))elements.set(id,{clientWidth:1200,clientHeight:650,hidden:false,style:{setProperty(){}},querySelectorAll:()=>[],classList:{add(){},remove(){},toggle(){}},getAttribute:()=> 'false',setAttribute(){},prepend(){},focus(){},setPointerCapture(){},addEventListener(type,fn){events.set(id+':'+type,fn);}});return elements.get(id);}
  element('chapters-data').textContent='{"chapters":[]}';
  const canvas=element('canvas');
  class Renderer{constructor(){this.domElement=canvas;this.shadowMap={};}setPixelRatio(){}setSize(){}render(scene,view){camera=view;}}
  const sandbox={INTRO_DURATION,openingView,introViewAt,introCaptionAt,THREE:{...THREE,WebGLRenderer:Renderer},createVillage:()=>({world:new THREE.Group(),anchors:[{id:'sigma-chi-sdsu',lot:{x:-20,z:-19}}],selection:new THREE.Object3D(),competition:{badges:[]},animateCrowd(){},animateEffects(){}}),createDistricts:()=>({root:new THREE.Group(),update(){return false;},animate(){}}),CustomEvent:class{constructor(type,options={}){this.type=type;this.detail=options.detail;}},document:{getElementById:element,addEventListener(type,fn){events.set('document:'+type,fn);},dispatchEvent(event){if(event.type==='village:select')selections.push(event.detail.id);},hidden:false},matchMedia:query=>({matches:query.includes('reduced-motion')&&reduced}),devicePixelRatio:1,location:{hash:initialHash},URLSearchParams,ResizeObserver:class{observe(){}},IntersectionObserver:class{constructor(fn){intersection=fn;}observe(){}},addEventListener(){},requestAnimationFrame:fn=>{frame=fn;return 1;},cancelAnimationFrame(){}};
  const source=fs.readFileSync(new URL('../village.js',import.meta.url),'utf8').replace(/^import .*;$/gm,'');
  vm.runInNewContext(source,sandbox);
  let now=100;
  return {selections,element,fire(name){events.get(name)();},show(visible){intersection([{isIntersecting:visible}]);},step(seconds,fps=60){for(let t=0;t<seconds;t+=1/fps){now+=1000/fps;const fn=frame;frame=null;fn?.(now);}return camera.position.clone();},drag(){events.get('canvas:pointerdown')({button:0,pointerId:1,clientX:0,clientY:0});},reset(){events.get('village-overview:click')();}};
}
test('entrance falls from the campus overview into the row in five seconds and does not replay',()=>{
  const h=cameraHarness();h.show(true);const high=h.step(.02);assert(high.y>75);
  const low=h.step(5);assert(low.y<14);assert(low.distanceTo(high)>60);
  h.show(false);h.step(1);h.show(true);assert(h.step(.02).y<14);
});
test('taking control cancels the descent immediately and reset remains usable',()=>{
  const h=cameraHarness();h.show(true);h.step(1);h.drag();const at=h.step(.02),later=h.step(5);assert(at.distanceTo(later)<.001);
  h.reset();assert(h.step(2).y<14);
});
test('reduced motion opens directly on the row',()=>{
  const h=cameraHarness(true);h.show(true);const a=h.step(.02);assert(a.y<14);assert(a.distanceTo(h.step(5))<.001);
});
test('startup preserves a new chapter deep link while waiting for live registrations',()=>{
  const h=cameraHarness(false,'#chapter=chapter-new');h.show(true);h.step(4);
  assert.deepEqual(h.selections,[],'fallback selection must not overwrite the requested live chapter');
});

test('captions follow the tour, clear at five seconds, and replay on request',()=>{
  const h=cameraHarness();h.show(true);h.step(.02);
  assert.equal(h.element('village-intro').hidden,false);
  assert.equal(h.element('intro-title').textContent,'Greek Wars.');
  h.step(1.6);assert.equal(h.element('intro-title').textContent,'Bring your people.');
  h.step(1.7);assert.equal(h.element('intro-title').textContent,'$500,000 committed.');
  h.step(1.8);assert.equal(h.element('village-intro').hidden,true);
  h.fire('document:village:replay');h.step(.02);
  assert.equal(h.element('village-intro').hidden,false);
  assert.equal(h.element('intro-title').textContent,'Greek Wars.');
});
test('slow rendering does not stretch the intro beyond five visible seconds',()=>{
  const h=cameraHarness();h.show(true);h.step(.1,10);h.step(5,10);
  assert.equal(h.element('village-intro').hidden,true);
});
test('leaving the viewport pauses the intro clock',()=>{
  const h=cameraHarness();h.show(true);h.step(1);h.show(false);h.step(10);
  assert.equal(h.element('village-intro').hidden,false);
  h.show(true);h.step(1);assert.equal(h.element('intro-title').textContent,'Bring your people.');
  h.step(4);assert.equal(h.element('village-intro').hidden,true);
});
test('skip and direct camera interaction both clear the captions',()=>{
  for(const action of ['skip','drag']){
    const h=cameraHarness();h.show(true);h.step(1);
    if(action==='skip')h.fire('intro-skip:click');else h.drag();
    assert.equal(h.element('village-intro').hidden,true);
    if(action==='skip')assert(h.step(2).y<14);
  }
});
test('reduced motion keeps the camera still while explaining the game',()=>{
  const h=cameraHarness(true);h.show(true);const start=h.step(.02);
  assert.equal(h.element('village-intro').hidden,false);
  assert(start.distanceTo(h.step(5.1))<.001);
  assert.equal(h.element('village-intro').hidden,true);
});
