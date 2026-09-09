import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {INTRO_DURATION,introCaptionAt} from '../../fomo/campuswars/village-intro.js';

function harness({reduced=false,hash='',blocked=false}={}) {
  const nodes=new Map(),events=new Map(),timers=new Map();let timerId=0,animation;
  function node(id) {
    if(!nodes.has(id))nodes.set(id,{
      hidden:false,inert:false,offsetHeight:800,style:{},
      classList:{add(){},remove(){}},
      addEventListener(type,fn){events.set(`${id}:${type}`,fn);},
      setAttribute(key,value){this[key]=value;},getAttribute(key){return this[key]||null;},
      focus(){this.focused=true;},scrollIntoView(){this.scrolled=true;}
    });
    return nodes.get(id);
  }
  const video=node('intro-video');
  Object.assign(video,{paused:true,currentTime:0,readyState:2,
    play(){if(blocked)return Promise.reject(new Error('Autoplay blocked'));this.paused=false;events.get('intro-video:playing')?.();return Promise.resolve();},
    pause(){this.paused=true;events.get('intro-video:pause')?.();}
  });
  const doc={body:node('body'),documentElement:node('html'),getElementById:node,querySelector:node,hidden:false,
    addEventListener(type,fn){events.set(`document:${type}`,fn);}};
  vm.runInNewContext(fs.readFileSync(new URL('../main.js',import.meta.url),'utf8').replace(/^import .*;\n/,''),{
    INTRO_DURATION,introCaptionAt,document:doc,
    window:{scrollY:800,scrollTo(){}},location:{hash},
    matchMedia:query=>({matches:query.includes('reduced-motion')&&reduced,addEventListener(type,fn){events.set('media:'+type,fn);}}),
    setTimeout(fn,delay){timers.set(++timerId,{fn,delay});return timerId;},clearTimeout(id){timers.delete(id);},
    requestAnimationFrame(fn){animation=fn;return 1;},cancelAnimationFrame(){animation=null;}
  });
  return {node,doc,video,timers,fire(name,event={}){events.get(name)(event);},step(time){video.currentTime=time;animation?.();}};
}
test('intro streams a video immediately without constructing the 3D village',()=>{
  const h=harness();assert.equal(h.video.src,'/landingpage/assets/intro-desktop.mp4');assert.equal(h.video.paused,false);assert.equal(h.node('page').inert,true);
  const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.match(html,/<video[^>]*muted autoplay playsinline preload="auto"/);
  assert.match(html,/class="opening-poster"/);assert.doesNotMatch(html,/<iframe|Getting campus ready/);
});
test('reduced motion and direct program links do not download or play the video',()=>{
  for(const options of [{reduced:true},{hash:'#internship'}]){const h=harness(options);assert.equal(h.video.src,undefined);assert.equal(h.node('opening').hidden,true);assert.equal(h.node('page').inert,false);}
});
test('caption and progress timing follow the actual video clock',()=>{
  const h=harness();h.step(3);assert.equal(h.node('film-title').textContent,"IF YOU'RE IN A FRAT.");h.step(6.8);assert.equal(h.node('film-progress').style.transform,'scaleX(0.5)');
});
test('pause, resume and replay control media playback',()=>{
  const h=harness();h.fire('pause-intro:click');assert.equal(h.video.paused,true);h.fire('pause-intro:click');assert.equal(h.video.paused,false);
  h.video.currentTime=13.6;h.fire('intro-video:ended');assert.equal(h.node('page').inert,false);h.fire('replay-intro:click');assert.equal(h.video.currentTime,0);assert.equal(h.video.paused,false);
});
test('completion, skip, Escape and failed video release the page',()=>{
  for(const action of [h=>h.fire('intro-video:ended'),h=>h.fire('skip-intro:click'),h=>h.fire('document:keydown',{key:'Escape'}),h=>h.fire('intro-video:error')]){const h=harness();action(h);assert.equal(h.node('page').inert,false);assert.equal(h.video.paused,true);assert.equal(h.node('programs').focused,true);}
});
test('autoplay restrictions leave the opening frame and a working play control',async()=>{
  const h=harness({blocked:true});await Promise.resolve();assert.equal(h.video.paused,true);assert.equal(h.node('pause-intro').textContent,'Play intro');assert.equal(h.node('opening').hidden,false);
});
test('hidden tabs pause playback and respect a deliberate user pause',()=>{
  const h=harness();h.doc.hidden=true;h.fire('document:visibilitychange');assert.equal(h.video.paused,true);h.doc.hidden=false;h.fire('document:visibilitychange');assert.equal(h.video.paused,false);
  h.fire('pause-intro:click');h.doc.hidden=true;h.fire('document:visibilitychange');h.doc.hidden=false;h.fire('document:visibilitychange');assert.equal(h.video.paused,true);
});
