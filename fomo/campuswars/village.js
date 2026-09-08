import * as THREE from './vendor/three.module.min.js';
import {createVillage} from './village-world.js';
import {movePlayer} from './village-layout.js';

const shell=document.getElementById('village');
const viewport=document.getElementById('village-viewport');
const status=document.getElementById('village-status');
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
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  viewport.prepend(renderer.domElement);const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label','3D Greek village. Drag to orbit, select a house, or use Walk mode and W A S D to explore.');
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x101724);scene.fog=new THREE.Fog(0x101724,110,230);
  const camera=new THREE.PerspectiveCamera(43,1,.1,280);
  scene.add(new THREE.HemisphereLight(0xc2d5ff,0x74675b,2.1));
  const sun=new THREE.DirectionalLight(0xffdcb6,3.0);sun.position.set(-35,55,30);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-48,right:48,top:48,bottom:-48,near:1,far:150});sun.shadow.normalBias=.05;sun.shadow.bias=-.00015;scene.add(sun);
  const fill=new THREE.DirectionalLight(0x788eff,.8);fill.position.set(30,15,-25);scene.add(fill);
  const village=createVillage(THREE,chapters);scene.add(village.world);
  // The visitor is separate from chapter members and never counts toward a house.
  const player=new THREE.Group();player.position.set(0,.2,26);scene.add(player);
  const playerMaterial=new THREE.MeshStandardMaterial({color:0x8c9aff,roughness:.7});
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.23,.48,4,8),playerMaterial);torso.position.y=.86;torso.castShadow=true;player.add(torso);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.18,12,8),new THREE.MeshStandardMaterial({color:0xe9bd98}));head.position.y=1.45;player.add(head);
  const playerLimbs=[];[-1,1].forEach(side=>{const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.09,.35,3,6),new THREE.MeshStandardMaterial({color:0x333c56}));leg.position.set(side*.13,.35,0);player.add(leg);playerLimbs.push(leg);const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.075,.34,3,6),playerMaterial);arm.position.set(side*.33,.87,0);player.add(arm);playerLimbs.push(arm);});
  const ring=new THREE.Mesh(new THREE.RingGeometry(.5,.6,32),new THREE.MeshBasicMaterial({color:0xb5c0ff,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.04;player.add(ring);player.visible=false;
  const destinationMarker=new THREE.Mesh(new THREE.RingGeometry(.3,.38,24),new THREE.MeshBasicMaterial({color:0xc5cbff,side:THREE.DoubleSide}));destinationMarker.rotation.x=-Math.PI/2;destinationMarker.position.y=.21;destinationMarker.visible=false;scene.add(destinationMarker);
  const labelLayer=document.getElementById('village-labels');
  const labels=village.anchors.map(anchor=>{
    const chapter=chapters.find(c=>c.id===anchor.id),button=document.createElement('button');button.type='button';button.className='village-pin';button.dataset.id=anchor.id;
    if(chapter){button.innerHTML=`<span class="pin-letters">${chapter.letters}<small>${chapter.shortSchool}</small></span><span class="pin-count">${chapter.joined}<small> / ${chapter.active} in</small></span><span class="pin-progress"><i style="width:${Math.min(100,chapter.joined/chapter.active*100)}%"></i><b></b></span>`;button.setAttribute('aria-label',`${chapter.name}: ${chapter.joined} of ${chapter.active} onboarded. Explore this house.`);}
    else{button.classList.add('pin-empty');button.innerHTML='<span class="pin-letters">Your house?<small>Claim this lot ↗</small></span>';button.setAttribute('aria-label','Explore the empty lot and claim your chapter');}
    button.addEventListener('click',()=>choose(anchor.id,true));labelLayer.append(button);return {anchor,button};
  });
  let mode='overview',selected='sigma-chi-sdsu',paused=reduced||document.getElementById('party-toggle').getAttribute('aria-pressed')==='true',visible=false,drag=null,dragDistance=0,destination=null,raf=0,lastTime=0,partyTime=0,walkTime=0;
  const held=new Set(),target=new THREE.Vector3(0,0,0),wantedTarget=new THREE.Vector3(0,0,0),raycaster=new THREE.Raycaster(),cameraRay=new THREE.Raycaster(),cameraDirection=new THREE.Vector3(),pointer=new THREE.Vector2(),projected=new THREE.Vector3();
  let theta=.68,phi=.79,radius=95,wantedTheta=theta,wantedPhi=phi,wantedRadius=radius;
  const walkButton=document.getElementById('village-walk'),overviewButton=document.getElementById('village-overview'),help=document.getElementById('village-help');
  function overviewRadius(){return viewport.clientWidth<650?145:viewport.clientWidth<1000?112:95;}
  function setMode(next){
    mode=next;held.clear();destination=null;destinationMarker.visible=false;player.visible=next==='walk';shell.classList.toggle('walking',next==='walk');
    walkButton.setAttribute('aria-pressed',String(next==='walk'));overviewButton.setAttribute('aria-pressed',String(next==='overview'));
    if(next==='walk'){wantedRadius=13;wantedPhi=.43;wantedTheta=.3;wantedTarget.copy(player.position).add(new THREE.Vector3(0,1,0));status.textContent='YOU’RE ON THE ROW';help.textContent='WASD or arrows to walk · drag to look · tap a house';}
    else{wantedTarget.set(0,0,0);wantedRadius=overviewRadius();wantedPhi=.79;wantedTheta=.68;status.textContent='THE WHOLE VILLAGE';help.textContent='Drag to look around · tap a house · scroll to zoom';}
    wake();
  }
  function choose(id,focus=false){
    const anchor=village.anchors.find(a=>a.id===id);if(!anchor)return;selected=id;
    village.selection.position.set(anchor.lot.x,.22,anchor.lot.z);labels.forEach(l=>{l.button.classList.toggle('active',l.anchor.id===id);l.button.setAttribute('aria-pressed',String(l.anchor.id===id));});
    document.querySelectorAll('[data-map-house]').forEach(button=>button.classList.toggle('active',button.dataset.mapHouse===id));
    const chapter=chapters.find(c=>c.id===id);status.textContent=chapter?`${chapter.letters} · ${chapter.joined} / ${chapter.active} IN · ${Math.max(0,Math.ceil(chapter.active*.8)-chapter.joined)} TO QUALIFY`:'YOUR CHAPTER STARTS HERE';
    document.getElementById('village-claim').hidden=Boolean(chapter);
    if(focus){
      if(mode==='walk'){destination={x:Math.sign(anchor.lot.x)*11,z:anchor.lot.z};destinationMarker.position.set(destination.x,.21,destination.z);destinationMarker.visible=true;}
      else{wantedTarget.set(anchor.lot.x*.69,2,anchor.lot.z);wantedRadius=viewport.clientWidth<650?38:30;wantedPhi=.67;wantedTheta=anchor.lot.x<0?1.08:-1.08;}
    }
    document.dispatchEvent(new CustomEvent('village:select',{detail:{id}}));wake();
  }
  document.querySelectorAll('[data-map-house]').forEach(button=>button.addEventListener('click',()=>choose(button.dataset.mapHouse,true)));
  document.addEventListener('chapter:select',e=>choose(e.detail.id,Boolean(e.detail.focus)));
  document.addEventListener('party:pause',e=>{paused=e.detail.paused;wake();});
  walkButton.addEventListener('click',()=>{setMode('walk');canvas.focus({preventScroll:true});});
  document.getElementById('hero-explore').addEventListener('click',()=>setMode('walk'));
  overviewButton.addEventListener('click',()=>setMode('overview'));
  document.getElementById('village-zoom-in').addEventListener('click',()=>{wantedRadius=Math.max(mode==='walk'?7:20,wantedRadius*.8);wake();});
  document.getElementById('village-zoom-out').addEventListener('click',()=>{wantedRadius=Math.min(160,wantedRadius*1.25);wake();});
  const expand=document.getElementById('village-expand');expand.hidden=!shell.requestFullscreen;
  expand.addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await shell.requestFullscreen();}catch{status.textContent='Explore the village here on the page.';}});
  document.addEventListener('fullscreenchange',()=>{expand.textContent=document.fullscreenElement?'Exit full screen ↙':'Full screen ↗';resize();});
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;canvas.focus({preventScroll:true});drag={id:e.pointerId,x:e.clientX,y:e.clientY};dragDistance=0;canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;dragDistance+=Math.abs(dx)+Math.abs(dy);wantedTheta-=dx*.006;wantedPhi=Math.max(.22,Math.min(1.3,wantedPhi+dy*.004));drag.x=e.clientX;drag.y=e.clientY;wake();});
  function rayAt(e){const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-((e.clientY-rect.top)/rect.height)*2+1);raycaster.setFromCamera(pointer,camera);}
  canvas.addEventListener('pointerup',e=>{
    if(!drag||drag.id!==e.pointerId)return;drag=null;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
    if(dragDistance>8)return;rayAt(e);const hit=raycaster.intersectObjects(village.pickables,false)[0];
    if(hit){choose(hit.object.userData.chapter,true);return;}
    if(mode==='walk'){const ground=raycaster.intersectObject(village.ground)[0];if(ground){destination=movePlayer({x:0,z:0},ground.point.x,ground.point.z);destinationMarker.position.set(destination.x,.21,destination.z);destinationMarker.visible=true;wake();}}
  });
  canvas.addEventListener('pointercancel',()=>{drag=null;});canvas.addEventListener('lostpointercapture',()=>{drag=null;});
  canvas.addEventListener('wheel',e=>{if(document.activeElement!==canvas&&!document.fullscreenElement)return;e.preventDefault();wantedRadius=Math.max(mode==='walk'?7:20,Math.min(160,wantedRadius*Math.exp(e.deltaY*.001)));wake();},{passive:false});
  const keys={KeyW:'up',ArrowUp:'up',KeyS:'down',ArrowDown:'down',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right'};
  canvas.addEventListener('keydown',e=>{if(e.code==='Escape'){setMode('overview');return;}if(mode!=='walk'||!keys[e.code])return;e.preventDefault();held.add(keys[e.code]);destination=null;destinationMarker.visible=false;wake();});
  addEventListener('keyup',e=>{if(keys[e.code])held.delete(keys[e.code]);});
  function releaseMovement(){held.clear();drag=null;}
  canvas.addEventListener('blur',releaseMovement);addEventListener('blur',releaseMovement);
  document.querySelectorAll('[data-walk]').forEach(button=>{
    button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);held.add(button.dataset.walk);destination=null;destinationMarker.visible=false;wake();});
    ['pointerup','pointercancel','lostpointercapture'].forEach(event=>button.addEventListener(event,()=>held.delete(button.dataset.walk)));
  });
  function resize(){const w=viewport.clientWidth,h=viewport.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();wake();}
  new ResizeObserver(resize).observe(viewport);
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(!visible)releaseMovement();wake();},{rootMargin:'80px'}).observe(shell);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseMovement();lastTime=0;wake();});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();visible=false;held.clear();cancelAnimationFrame(raf);raf=0;loading.hidden=false;loading.textContent='The village paused. Reload to return, or browse chapter standings below.';shell.classList.add('village-unavailable');});
  function wake(){if(!raf&&!document.hidden)raf=requestAnimationFrame(frame);}
  function frame(now){
    raf=0;const dt=lastTime?Math.min((now-lastTime)/1000,.05):0;lastTime=now;
    let moving=false;
    if(mode==='walk'){
      let dx=(held.has('right')?1:0)-(held.has('left')?1:0),dz=(held.has('down')?1:0)-(held.has('up')?1:0);
      if(dx||dz){const length=Math.hypot(dx,dz),x=dx/length,z=dz/length;dx=x*Math.cos(theta)+z*Math.sin(theta);dz=-x*Math.sin(theta)+z*Math.cos(theta);moving=true;}
      else if(destination){dx=destination.x-player.position.x;dz=destination.z-player.position.z;const d=Math.hypot(dx,dz);if(d<.22){destination=null;destinationMarker.visible=false;}else{dx/=d;dz/=d;moving=true;}}
      if(moving){const next=movePlayer(player.position,dx*dt*5.4,dz*dt*5.4);player.position.x=next.x;player.position.z=next.z;player.rotation.y=Math.atan2(dx,dz);walkTime+=dt*10;}
      playerLimbs.forEach((limb,i)=>limb.rotation.x=moving&&!reduced?Math.sin(walkTime+(i<2?0:Math.PI))*.5:0);
      wantedTarget.copy(player.position).add(new THREE.Vector3(0,1.1,0));
      const dot=document.getElementById('village-map-player');dot.style.left=`${47+player.position.x*1.15}%`;dot.style.top=`${47+player.position.z*1.26}%`;
    }
    const ease=reduced?1:1-Math.exp(-dt*7);target.lerp(wantedTarget,ease);theta+=(wantedTheta-theta)*ease;phi+=(wantedPhi-phi)*ease;radius+=(wantedRadius-radius)*ease;
    camera.position.set(target.x+Math.sin(theta)*Math.cos(phi)*radius,target.y+Math.sin(phi)*radius,target.z+Math.cos(theta)*Math.cos(phi)*radius);if(mode==='walk'){
      cameraDirection.subVectors(camera.position,target).normalize();cameraRay.set(target,cameraDirection);cameraRay.far=radius;
      const obstruction=cameraRay.intersectObjects(village.pickables,false)[0];
      if(obstruction)camera.position.copy(target).addScaledVector(cameraDirection,Math.max(.65,obstruction.distance-.4));
    }
    camera.lookAt(target);camera.updateMatrixWorld();
    if(!paused&&visible&&!document.hidden){partyTime+=dt;village.animateCrowd(partyTime);}
    renderer.render(scene,camera);
    const occupied=[];const rect=viewport.getBoundingClientRect();
    [...labels].sort((a,b)=>(b.anchor.id===selected?1:0)-(a.anchor.id===selected?1:0)||camera.position.distanceTo(a.anchor.point)-camera.position.distanceTo(b.anchor.point)).forEach(({anchor,button})=>{
      projected.copy(anchor.point).project(camera);const x=(projected.x*.5+.5)*rect.width,y=(-projected.y*.5+.5)*rect.height,w=rect.width<650?104:126;
      let show=projected.z<1&&projected.z>-1&&x>w/2+6&&x<rect.width-w/2-6&&y>104&&y<rect.height-112;
      if(show&&occupied.some(r=>Math.abs(r.x-x)<w+8&&Math.abs(r.y-y)<86))show=false;
      button.hidden=!show;if(show){button.style.transform=`translate(${x}px,${y}px) translate(-50%,-100%)`;occupied.push({x,y});}
    });
    const settling=target.distanceTo(wantedTarget)>.01||Math.abs(radius-wantedRadius)>.01||Math.abs(theta-wantedTheta)>.001||Math.abs(phi-wantedPhi)>.001;
    if(visible&&!document.hidden&&(!paused||moving||settling))wake();
  }
  wantedRadius=radius=overviewRadius();resize();setMode('overview');
  const initial=new URLSearchParams(location.hash.slice(1)).get('chapter');choose(village.anchors.some(a=>a.id===initial)?initial:selected,false);
  loading.hidden=true;shell.classList.add('village-ready');wake();
}
