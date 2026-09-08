import * as THREE from './vendor/three.module.min.js';
import {createVillage} from './village-world.js?v=18';
import {createDistricts} from './village-districts.js?v=17';

const shell=document.getElementById('village');
const viewport=document.getElementById('village-viewport');
const loading=document.getElementById('village-loading');
const chapters=JSON.parse(document.getElementById('chapters-data').textContent).chapters;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}catch(error){
  loading.textContent='Your chapter standings are below. This device can’t open the 3D village.';
  shell.classList.add('village-unavailable');
}
if(renderer)startVillage();
function startVillage(){
  renderer.setPixelRatio(Math.min(devicePixelRatio,matchMedia('(pointer: coarse)').matches?1:1.25));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
  viewport.prepend(renderer.domElement);const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label','3D Greek village. Drag to rotate, shift-drag to pan, or select a house. Arrow keys rotate the view; Escape resets it.');
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x98a7ba);scene.fog=new THREE.FogExp2(0x98a7ba,.0035);
  const camera=new THREE.PerspectiveCamera(48,1,1,450);
  scene.add(new THREE.HemisphereLight(0xc2d5ff,0x74675b,2.1));
  const sun=new THREE.DirectionalLight(0xffdcb6,3.0);sun.position.set(-35,55,30);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-48,right:48,top:48,bottom:-48,near:1,far:150});sun.shadow.normalBias=.05;sun.shadow.bias=-.00015;scene.add(sun);scene.add(sun.target);
  const fill=new THREE.DirectionalLight(0x788eff,.8);fill.position.set(30,15,-25);scene.add(fill);
  const village=createVillage(THREE,chapters);scene.add(village.world);
  const districts=createDistricts(THREE);scene.add(districts.root);
  let autoOrbit=!reduced;
  function takeControl(){autoOrbit=false;}
  document.addEventListener('pointerdown',takeControl,{once:true,capture:true});
  document.addEventListener('village:artwork',()=>{viewDirty=true;wake();});
  let selected='sigma-chi-sdsu',paused=reduced||document.getElementById('party-toggle').getAttribute('aria-pressed')==='true',visible=false,drag=null,dragDistance=0,raf=0,lastTime=0,partyTime=0,lastActivity=0,lastRender=0,viewDirty=true,shadowX=NaN,shadowZ=NaN;
  const target=new THREE.Vector3(0,0,0),wantedTarget=new THREE.Vector3(0,0,0),raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
  let theta=.68,phi=.79,radius=95,wantedTheta=theta,wantedPhi=phi,wantedRadius=radius;
  function overviewRadius(){return viewport.clientWidth<650?145:viewport.clientWidth<1000?112:95;}
  function resetView(){wantedTarget.set(0,0,0);wantedRadius=overviewRadius();wantedPhi=.79;wantedTheta=.68;wake();}
  function choose(id,focus=false){
    const anchor=village.anchors.find(a=>a.id===id);if(!anchor)return;selected=id;viewDirty=true;
    village.selection.position.set(anchor.lot.x,.22,anchor.lot.z);
    if(focus){takeControl();wantedTarget.set(anchor.lot.x*.69,2,anchor.lot.z);wantedRadius=viewport.clientWidth<650?38:30;wantedPhi=.67;wantedTheta=anchor.lot.x<0?1.08:-1.08;}
    document.dispatchEvent(new CustomEvent('village:select',{detail:{id}}));wake();
  }
  document.addEventListener('chapter:select',e=>choose(e.detail.id,Boolean(e.detail.focus)));
  document.addEventListener('party:pause',e=>{paused=e.detail.paused;wake();});
  document.getElementById('village-overview').addEventListener('click',()=>{takeControl();resetView();});
  document.getElementById('village-zoom-in').addEventListener('click',()=>{takeControl();wantedRadius=Math.max(20,wantedRadius*.8);wake();});
  document.getElementById('village-zoom-out').addEventListener('click',()=>{takeControl();wantedRadius=Math.min(160,wantedRadius*1.25);wake();});
  const expand=document.getElementById('village-expand');expand.hidden=!shell.requestFullscreen;
  expand.addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await shell.requestFullscreen();}catch{expand.disabled=true;expand.title='Full screen is unavailable in this browser.';}});
  document.addEventListener('fullscreenchange',()=>{expand.textContent=document.fullscreenElement?'Exit full screen ↙':'Full screen ↗';resize();});
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;canvas.focus({preventScroll:true});drag={id:e.pointerId,x:e.clientX,y:e.clientY,pan:e.shiftKey};dragDistance=0;canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;dragDistance+=Math.abs(dx)+Math.abs(dy);if(drag.pan){const scale=radius*.0015;wantedTarget.x+=(-dx*Math.cos(theta)+dy*Math.sin(theta))*scale;wantedTarget.z+=(dx*Math.sin(theta)+dy*Math.cos(theta))*scale;}else{wantedTheta-=dx*.006;wantedPhi=Math.max(.22,Math.min(1.3,wantedPhi+dy*.004));}drag.x=e.clientX;drag.y=e.clientY;wake();});
  function rayAt(e){const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-((e.clientY-rect.top)/rect.height)*2+1);raycaster.setFromCamera(pointer,camera);}
  canvas.addEventListener('pointerup',e=>{
    if(!drag||drag.id!==e.pointerId)return;drag=null;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
    if(dragDistance>8)return;rayAt(e);const hit=raycaster.intersectObjects(village.pickables,false)[0];
    if(hit){choose(hit.object.userData.chapter,true);return;}
  });
  canvas.addEventListener('pointercancel',()=>{drag=null;});canvas.addEventListener('lostpointercapture',()=>{drag=null;});
  canvas.addEventListener('wheel',e=>{if(document.activeElement!==canvas&&!document.fullscreenElement)return;e.preventDefault();takeControl();wantedRadius=Math.max(20,Math.min(160,wantedRadius*Math.exp(e.deltaY*.001)));wake();},{passive:false});
  canvas.addEventListener('keydown',event=>{
    takeControl();
    if(event.code==='Escape'||event.code==='Home'){event.preventDefault();resetView();return;}
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.code))return;
    event.preventDefault();
    if(event.code==='ArrowLeft')wantedTheta-=.13;
    if(event.code==='ArrowRight')wantedTheta+=.13;
    if(event.code==='ArrowUp')wantedPhi=Math.min(1.3,wantedPhi+.07);
    if(event.code==='ArrowDown')wantedPhi=Math.max(.22,wantedPhi-.07);
    wake();
  });
  function releasePointer(){drag=null;}
  canvas.addEventListener('blur',releasePointer);addEventListener('blur',releasePointer);
  function resize(){const w=viewport.clientWidth,h=viewport.clientHeight;if(!w||!h)return;viewDirty=true;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();wake();}
  new ResizeObserver(resize).observe(viewport);
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(!visible)releasePointer();wake();},{rootMargin:'80px'}).observe(shell);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)releasePointer();lastTime=0;wake();});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();visible=false;cancelAnimationFrame(raf);raf=0;loading.hidden=false;loading.textContent='The village paused. Reload to return, or browse chapter standings below.';shell.classList.add('village-unavailable');});
  function wake(){if(!raf&&!document.hidden)raf=requestAnimationFrame(frame);}
  function frame(now){
    raf=0;
    const cameraMoving=target.distanceToSquared(wantedTarget)>.0001||Math.abs(radius-wantedRadius)>.01||Math.abs(theta-wantedTheta)>.001||Math.abs(phi-wantedPhi)>.001;
    // Idle scenery needs fewer frames; camera input keep full responsiveness.
    if((!cameraMoving||autoOrbit)&&!drag&&!viewDirty&&now-lastRender<1000/30){wake();return;}
    const dt=lastTime?Math.min((now-lastTime)/1000,.05):0;lastTime=now;
    if(autoOrbit&&!paused&&visible&&!document.hidden)wantedTheta+=dt*.035;
    const ease=reduced?1:1-Math.exp(-dt*7);target.lerp(wantedTarget,ease);theta+=(wantedTheta-theta)*ease;phi+=(wantedPhi-phi)*ease;radius+=(wantedRadius-radius)*ease;
    camera.position.set(target.x+Math.sin(theta)*Math.cos(phi)*radius,target.y+Math.sin(phi)*radius,target.z+Math.cos(theta)*Math.cos(phi)*radius);
    camera.lookAt(target);camera.updateMatrixWorld();
    const districtChanged=districts.update(target.x,target.z),lightX=Math.round(target.x/12)*12,lightZ=Math.round(target.z/12)*12;
    if(districtChanged||lightX!==shadowX||lightZ!==shadowZ){
      shadowX=lightX;shadowZ=lightZ;sun.position.set(lightX-35,55,lightZ+30);sun.target.position.set(lightX,0,lightZ);renderer.shadowMap.needsUpdate=true;
    }
    if(!paused&&visible&&!document.hidden){
      partyTime+=dt;
      if(partyTime-lastActivity>=1/24){
        if(Math.hypot(target.x,target.z)<110)village.animateCrowd(partyTime);
        districts.animate(partyTime,target.x,target.z);lastActivity=partyTime;
      }
    }
    renderer.render(scene,camera);lastRender=now;
    viewDirty=false;
    const settling=target.distanceTo(wantedTarget)>.01||Math.abs(radius-wantedRadius)>.01||Math.abs(theta-wantedTheta)>.001||Math.abs(phi-wantedPhi)>.001;
    if(visible&&!document.hidden&&(!paused||settling))wake();
  }
  wantedRadius=radius=overviewRadius();resize();resetView();
  const initial=new URLSearchParams(location.hash.slice(1)).get('chapter');choose(village.anchors.some(a=>a.id===initial)?initial:selected,false);
  loading.hidden=true;shell.classList.add('village-ready');wake();
}
