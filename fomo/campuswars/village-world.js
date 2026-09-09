import {createLotBeacon,createNightLife} from './village-atmosphere.js?v=30';
import {createCompetition} from './village-competition.js?v=29';
import {createGrassMaterial,createLawnBlades} from './village-grass.js?v=28';
import {humanPose} from './village-human-motion.js?v=25';
import {batchCampusGeometry,createCampusKit} from './village-campus-kit.js?v=24';
import {palettes,hash} from './village-district-layout.js?v=22';
import {LOTS,toWorld,crowdMembers,activityPose} from './village-layout.js?v=25';
import {createStreetNetwork} from './village-streets.js?v=28';
import {createChapterBanner,bannerIdentity} from './village-banners.js?v=27';

export function createVillage(THREE,chapters){
  const world=new THREE.Group(),pickables=[],anchors=[],flags=[];
  const materials=new Map(),landscapeKit=createCampusKit(THREE),grassMaterial=createGrassMaterial(THREE),lawns=[];
  function mat(color,emissive=0){const key=color+':'+emissive;if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.84,emissive,emissiveIntensity:emissive?.45:0}));return materials.get(key);}
  const boxGeometry=new THREE.BoxGeometry(1,1,1),sphereGeometry=new THREE.SphereGeometry(1,14,10),cylinderGeometry=new THREE.CylinderGeometry(1,1,1,20);
  function box(parent,x,y,z,w,h,d,color){const mesh=new THREE.Mesh(boxGeometry,typeof color==='object'?color:mat(color));mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
  function cylinder(parent,x,y,z,r,h,color){const m=new THREE.Mesh(cylinderGeometry,mat(color));m.position.set(x,y,z);m.scale.set(r,h,r);m.castShadow=true;parent.add(m);return m;}
  function ball(parent,x,y,z,r,color){const m=new THREE.Mesh(sphereGeometry,mat(color));m.position.set(x,y,z);m.scale.setScalar(r);m.castShadow=true;parent.add(m);return m;}
  function sign(parent,text,x,y,z,w,h,background='#e6ddc8',ink='#25243a'){
    if(typeof document==='undefined')return;
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const ctx=canvas.getContext('2d');
    ctx.fillStyle=background;ctx.fillRect(0,0,1024,256);ctx.fillStyle=ink;ctx.font='bold 124px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,133,930);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:texture,roughness:.8}));mesh.position.set(x,y,z);parent.add(mesh);return mesh;
  }
  const brick=typeof document!=='undefined'?document.createElement('canvas'):null;
  let brickMap;
  if(brick){brick.width=256;brick.height=256;const c=brick.getContext('2d');c.fillStyle='#89786e';c.fillRect(0,0,256,256);for(let y=0;y<16;y++)for(let x=-1;x<5;x++){const value=175+((x*19+y*7)%30);c.fillStyle=`rgb(${value},${value-15},${value-22})`;c.fillRect(x*64+(y%2)*32+1,y*16+1,62,14);}brickMap=new THREE.CanvasTexture(brick);brickMap.wrapS=brickMap.wrapT=THREE.RepeatWrapping;brickMap.repeat.set(8,4);brickMap.anisotropy=16;brickMap.colorSpace=THREE.SRGBColorSpace;}
  function facade(color){return new THREE.MeshStandardMaterial({color,...(brickMap?{map:brickMap,bumpMap:brickMap,bumpScale:.022}:{}),roughness:.92});}
  function roof(parent,x,y,z,w,d,height,color,hip=true){
    let positions,indices;
    if(hip){positions=[-w/2,0,-d/2,w/2,0,-d/2,w/2,0,d/2,-w/2,0,d/2,-w*.26,height,0,w*.26,height,0];indices=[0,1,5,0,5,4,1,2,5,2,3,4,2,4,5,3,0,4];}
    else{positions=[-w/2,0,-d/2,w/2,0,-d/2,0,height,-d/2,-w/2,0,d/2,w/2,0,d/2,0,height,d/2];indices=[0,2,1,3,4,5,0,3,5,0,5,2,1,2,5,1,5,4];}
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();const material=mat(color).clone();material.side=THREE.DoubleSide;const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.castShadow=true;parent.add(mesh);
  }
  // A continuous campus block, with wide sidewalks and a walkable boulevard.



  const streets=createStreetNetwork(THREE);world.add(streets);


  // Street lamps, paths, trees and furniture give the village a lived-in scale.
  function tree(x,z,size=1){landscapeKit.tree(world,x,z,Math.floor(hash(x,z,'tree')*10000),size);}

  [-1,1].forEach(side=>{
    [-31,-10,10,31].forEach(z=>{const x=side*7.6;cylinder(world,x,2,z,.07,4,0x3b3a46);box(world,x,4.1,z,.55,.12,.55,0x353444);const glow=box(world,x,3.82,z,.34,.45,.34,mat(0xffdea0,0xffbb55));glow.castShadow=false;const pool=new THREE.Mesh(new THREE.CircleGeometry(1.3,20),new THREE.MeshBasicMaterial({color:0xffd196,transparent:true,opacity:.07,depthWrite:false}));pool.rotation.x=-Math.PI/2;pool.position.set(x,.19,z);world.add(pool);});
    [-33,-9,10,33].forEach(z=>tree(side*29,z,.85+Math.abs(z)%3*.1));
    [-9,10].forEach(z=>{box(world,side*9,.6,z,1,.2,2.3,0x85694f);box(world,side*9.4,1,z,.13,.65,2.3,0x85694f);[-.8,.8].forEach(d=>box(world,side*9,.3,z+d,.8,.6,.12,0x333747));});
  });
  const windowMaterials=[false,true].map(lit=>{const m=new THREE.MeshStandardMaterial({color:lit?0xffdca1:0x34414f,roughness:.5,emissive:0xa36527,emissiveIntensity:lit?.45:.01});m.userData.nightWindow=true;return m;});
  function windowUnit(parent,x,y,z,lit=true){
    box(parent,x,y,z,1.05,1.65,.13,0xe7dfcb);box(parent,x,y,z+.08,.8,1.38,.07,windowMaterials[Number(lit)]);
    box(parent,x,y,z+.14,.065,1.45,.055,0xe8ddc8);box(parent,x,y,z+.14,.9,.065,.055,0xe8ddc8);
    [-.68,.68].forEach(dx=>box(parent,x+dx,y,z,.23,1.65,.15,0x283940));
  }
  function constructionSite(parent,chapter){
    const site=new THREE.Group();site.name=`chapter-construction-${chapter.id}`;site.userData={chapter:chapter.id,joined:chapter.joined,state:'construction'};parent.add(site);
    const timber=0xc49a63,concrete=0xb3b1a5,steel=0x7e9295,orange=0xd48b46;
    function beam(a,b,width=.14,color=timber){
      const direction=new THREE.Vector3().subVectors(new THREE.Vector3(...b),new THREE.Vector3(...a));
      const m=box(site,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,width,direction.length(),width,color);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());return m;
    }
    box(site,0,.15,0,11,.16,8.5,0x968771);
    box(site,0,.34,0,9.4,.32,7,concrete);
    // Exposed foundation and joists; no finished walls, windows or roof below 15.
    for(const z of [-3.3,3.3])box(site,0,.59,z,9.2,.18,.16,timber);
    for(const x of [-4.5,4.5])box(site,x,.59,0,.16,.18,6.6,timber);
    for(let x=-4;x<=4;x+=1)box(site,x,.53,0,.12,.12,6.5,timber);
    const frameHeight=chapter.joined===0?1.7:3.2;
    for(const x of [-4.5,4.5])for(const z of [-3.3,3.3])beam([x,.65,z],[x,frameHeight,z],.19);
    // The rear wall begins to take shape as members arrive.
    if(chapter.joined>0){
      for(let x=-3.6;x<=3.7;x+=.9)beam([x,.65,-3.3],[x,frameHeight,-3.3],.12);
      box(site,0,frameHeight,-3.3,9.3,.18,.2,timber);
      for(const x of [-4.5,4.5]){box(site,x,frameHeight,0,.18,.18,6.6,timber);beam([x,.7,-3.2],[x,frameHeight,0],.11);}
      for(let i=0;i<Math.min(3,Math.floor(chapter.joined/3));i++)box(site,-3.6+i*1.8,1.75,-3.4,1.7,2.2,.07,0xb39468);
    }
    if(chapter.joined>=8){
      for(let x=-4.2;x<=4.3;x+=1.4)box(site,x,3.3,0,.14,.2,6.6,timber);
      for(const x of [-4.5,4.5])for(const z of [-3.3,3.3])beam([x,3.3,z],[x,5.5,z],.16);
      box(site,0,5.5,-3.3,9.2,.16,.16,timber);
    }
    // Scaffold platform, cross bracing and a leaning access ladder.
    for(const x of [-5.3,-6.1])for(const z of [-2.8,1.8])beam([x,.2,z],[x,3.8,z],.065,steel);
    box(site,-5.7,2.35,-.5,1.05,.12,5.2,0xa39377);
    for(const x of [-5.3,-6.1]){beam([x,.4,-2.8],[x,3.7,1.8],.045,steel);beam([x,3.7,-2.8],[x,.4,1.8],.045,steel);}
    for(const x of [-5.9,-5.45])beam([x,.2,3.2],[x,2.5,1.5],.05,steel);
    for(let i=0;i<7;i++)beam([-5.9,.3+i*.32,3.13-i*.24],[-5.45,.3+i*.32,3.13-i*.24],.045,steel);
    // Staged lumber, masonry pallets and safety barriers make the lot read as active construction.
    for(let layer=0;layer<4;layer++)for(let row=0;row<3;row++)box(site,3.4+row*.28,.26+layer*.13,4.45,.22,.11,2.4,timber);
    box(site,-3.2,.23,4.5,1.9,.16,1.3,0x8d775b);
    for(let layer=0;layer<3;layer++)for(let col=0;col<4;col++)box(site,-3.86+col*.44,.43+layer*.23,4.5,.4,.2,1.05,0xa8755d);
    for(const x of [-5.8,5.8]){
      box(site,x,.24,6.1,.5,.12,.5,0x4e4e47);
      const cone=new THREE.Mesh(new THREE.ConeGeometry(.23,.65,10),mat(orange));cone.position.set(x,.62,6.1);site.add(cone);
      cylinder(site,x,.61,6.1,.14,.1,0xeee5ce);
    }
    for(const x of [-2.4,2.4])box(site,x,1.6,6.1,.1,3,.1,steel);
    const banner=createChapterBanner(THREE,chapter,4.8);banner.position.set(0,1.66,6.2);site.add(banner);pickables.push(banner);
    box(site,0,2.8,6.1,5.1,.1,.12,steel);
    sign(site,'UNDER CONSTRUCTION',0,3.12,6.2,4.8,.42,'#d6b26d','#2c3038');
    const hit=box(site,0,2.8,0,12.5,6,12,new THREE.MeshBasicMaterial({visible:false}));hit.userData.chapter=chapter.id;pickables.push(hit);
    return site;
  }
  LOTS.forEach((lot,index)=>{
    const group=new THREE.Group();group.position.set(lot.x,0,lot.z);group.rotation.y=lot.rotation;world.add(group);
    const chapter=chapters[index],id=chapter?.id||'empty';
    if(!chapter){
      const floor=landscapeKit.claimFloor(group);pickables.push(floor);
      anchors.push({id,point:new THREE.Vector3(lot.x,4,lot.z),lot});return;
    }
    const lawn=box(group,0,.02,3,15,.22,18,grassMaterial);lawn.name=`chapter-lawn-${id}`;lawns.push(lawn);
    box(group,0,.15,7.7,1.65,.1,8.6,0xb3b0a4);
    [-6.8,6.8].forEach(x=>{box(group,x,.12,3,.12,.16,17,0x8b9096);});
    if(chapter.joined<15){
      constructionSite(group,chapter);
      anchors.push({id,point:new THREE.Vector3(lot.x,6,lot.z),lot});return;
    }
    const house=new THREE.Group();house.name=`chapter-house-${id}`;group.add(house);
    const colors=[0xb77458,0xad6952,0xa3604c,0xd5cfbb,0x855d54];const wall=index===3?mat(colors[index]):facade(colors[index]);const width=[11,12.2,10.5,12.2,10.5][index],height=index===4?9.1:7.4,depth=7.5;
    box(house,0,.38,0,width+1,.6,depth+1,0xc1b5a0);box(house,0,height/2+.6,0,width,height,depth,wall);
    box(house,0,height+.65,0,width+.5,.3,depth+.5,0xe4ddca);box(house,0,4.1,3.85,width+.25,.18,.22,0xcbbb9f);
    roof(house,0,height+.82,0,width+.8,depth+1.1,2.0,0x343846,index!==4);
    box(house,-width*.3,height+1.4,-1.8,.85,2,.9,wall);box(house,-width*.3,height+2.45,-1.8,1,.16,1.05,0x76665e);
    for(let floor=0;floor<(index===4?3:2);floor++)for(let col=0;col<5;col++){
      const x=(col-2)*(width/5.8);if(floor===0&&col===2)continue;
      windowUnit(house,x,1.95+floor*2.75,depth/2+.06,(floor*5+col+index)%4!==0);
    }
    // Side windows are modeled too, so every angle holds up during a walk.
    [-1,1].forEach(side=>{const wing=new THREE.Group();wing.position.set(side*(width/2+.02),0,0);wing.rotation.y=side*Math.PI/2;house.add(wing);for(let floor=0;floor<2;floor++)[-2.2,0,2.2].forEach((x,j)=>windowUnit(wing,x,1.95+floor*2.75,0,(j+floor+index)%3!==0));});
    const porchWidth=index===1?10.8:index===3?8:6.8;
    box(house,0,.48,4.7,porchWidth+1,.5,2.6,0xbab6ac);
    for(let step=0;step<3;step++)box(house,0,.13+step*.12,6.2-step*.38,3.3,.25,1.1,0xb9b5ac);
    box(house,0,1.65,3.87,1.25,2.2,.13,[0x693b3e,0x313d60,0x3d3a37,0x343b58,0x6b3340][index]);box(house,.4,1.65,3.99,.07,.07,.05,0xebc36d);
    const columnCount=index===1?6:4,colHeight=index===4?3.7:6.9;
    for(let col=0;col<columnCount;col++){const x=(col/(columnCount-1)-.5)*(porchWidth-.4);cylinder(house,x,colHeight/2+.75,5.35,.2,colHeight,0xece4cf);box(house,x,.65,5.35,.66,.22,.66,0xece4cf);box(house,x,colHeight+.76,5.35,.63,.23,.63,0xece4cf);}
    box(house,0,colHeight+.98,4.7,porchWidth+.8,.55,2.5,0xe5ddc7);
    if(index!==1)roof(house,0,colHeight+1.25,4.7,porchWidth+1,2.65,1.3,0xe8dfc9,false);
    sign(house,chapter.letters,0,colHeight+.98,6.02,porchWidth*.65,.46);
    if(index===0||index===3){box(house,0,3.98,4.7,5.8,.15,1.8,0xded7c7);box(house,0,4.8,5.54,5.8,.09,.09,0x3a3a42);for(let x=-2.8;x<=2.8;x+=.35)box(house,x,4.4,5.54,.04,.8,.04,0x3a3a42);}
    const bannerWidth=Math.min(8,porchWidth-.65)*.85,bannerTop=colHeight+.65;
    const banner=createChapterBanner(THREE,chapter,bannerWidth);
    banner.position.set(0,bannerTop-banner.geometry.parameters.height/2,6.18);house.add(banner);pickables.push(banner);
    // A rail and two short straps attach the banner to the porch beam.
    box(house,0,bannerTop+.04,6.18,bannerWidth+.3,.07,.07,0xc3b997);
    [-1,1].forEach(side=>box(house,side*(bannerWidth/2-.12),bannerTop+.17,6.18,.045,.32,.045,0xc3b997));
    [-4.8,4.8].forEach(x=>{ball(group,x,.6,5.8,.65,0x4a5757);box(group,x,.27,5.8,1.3,.25,1.3,0x918a7d);});
    // Chapter pennant, porch chairs, a table and speakers.
    cylinder(group,-6.1,2.4,6.1,.045,4.8,0xc3b997);const flag=box(group,-5.52,4.3,6.1,1.15,.65,.045,bannerIdentity(chapter).primary);flags.push(flag);
    if(chapter.joined){[-3.8,3.8].forEach(x=>{box(group,x,.6,6.7,.55,1.1,.5,0x232936);[.38,.78].forEach(y=>{const speaker=cylinder(group,x,y,6.98,.17,.025,0x596475);speaker.rotation.x=Math.PI/2;});});box(group,3.8,.72,8.5,1.9,.12,.85,0xa6906d);[-.65,.65].forEach(x=>box(group,3.8+x,.36,8.5,.1,.7,.5,0x4e4a48));for(let cup=0;cup<3;cup++)cylinder(group,3.35+cup*.35,.89,8.5,.07,.2,0xce5757);}
    const hit=box(house,0,height/2,0,width+1,height+3,depth+5,new THREE.MeshBasicMaterial({visible:false}));hit.userData.chapter=id;pickables.push(hit);
    // Absolute onboarded counts grow the building, while the lawn and people retain their scale.
    // Smooth saturation keeps future growth inside the plot without a hard size cutoff.
    const footprint=7.2+6.8*(1-Math.exp(-chapter.joined/40));
    const roofline=5.6+10*(1-Math.exp(-chapter.joined/50));
    const depthScale=.78+.22*(1-Math.exp(-chapter.joined/40));
    house.scale.set(footprint/(width+1),roofline/(height+2.82),depthScale);
    // Preserve the banner's proportions when the house grows taller.
    banner.scale.y=house.scale.x/house.scale.y;
    banner.position.y=bannerTop-banner.geometry.parameters.height*banner.scale.y/2;
    house.position.z=6.2*(1-depthScale); // Keep the porch steps at the same lawn entrance.
    house.userData={chapter:id,joined:chapter.joined,footprint,roofline};
    anchors.push({id,point:new THREE.Vector3(lot.x,roofline+1,lot.z),lot});
  });
  world.add(createLawnBlades(THREE,LOTS.slice(0,chapters.length)));
  const members=crowdMembers(chapters),parts={};
  const bodyGeometry=new THREE.CapsuleGeometry(.5,1,3,8);bodyGeometry.scale(1,.5,1);
  const roundParts=new Set(['head','hair','handL','handR','nose']);
  const names=['torso','pelvis','neck','head','hair','nose','armL','armR','foreL','foreR','handL','handR','legL','legR','shinL','shinR','shoeL','shoeR','cup','backpack'];
  for(const name of names){
    const geometry=roundParts.has(name)?landscapeKit.geometries.sphere:name.startsWith('shoe')?landscapeKit.geometries.shoe:name==='cup'?cylinderGeometry:name==='backpack'?landscapeKit.geometries.box:bodyGeometry;
    const mesh=landscapeKit.instances(world,geometry,members.length,39);mesh.material=mat(0xffffff);mesh.castShadow=false;parts[name]=mesh;
    members.forEach((m,i)=>{
      const shirt=name==='torso'||name.startsWith('arm')||(m.jacket&&name.startsWith('fore'));
      const skin=['head','neck','nose'].includes(name)||name.startsWith('hand')||name.startsWith('fore')||(m.shorts&&name.startsWith('shin'));
      const color=shirt?palettes.shirts[m.shirt]:skin?palettes.skin[m.skin]:name==='hair'?palettes.hair[m.hair]:name==='cup'?0xd54f56:name.startsWith('shoe')?0xe1ded4:palettes.pants[m.pants];
      mesh.setColorAt(i,new THREE.Color(color));
    });
  }
  const dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0),a=new THREE.Vector3(),b=new THREE.Vector3(),direction=new THREE.Vector3();
  function posePart(name,i,x,y,z,sx,sy,sz,rotation=0,pitch=0){dummy.position.set(x,y,z);dummy.rotation.set(pitch,rotation,0,'YXZ');dummy.scale.set(sx,sy,sz);dummy.updateMatrix();parts[name].setMatrixAt(i,dummy.matrix);}
  function limb(name,i,from,to,r){a.set(...from);b.set(...to);direction.subVectors(b,a);dummy.position.copy(a).add(b).multiplyScalar(.5);const length=direction.length();dummy.quaternion.setFromUnitVectors(up,direction.normalize());dummy.scale.set(r,length+.025,r);dummy.updateMatrix();parts[name].setMatrixAt(i,dummy.matrix);}
  function animateCrowd(time){
    members.forEach((m,i)=>{
      const state=activityPose(m,time),rig=humanPose(m,state,time),angle=state.rotation,h=m.height;
      const transform=([x,y,z])=>[state.x+(x*Math.cos(angle)+z*Math.sin(angle))*h,y*h+(state.ground??m.ground??0),state.z+(-x*Math.sin(angle)+z*Math.cos(angle))*h];
      const part=(name,point,x,y,z,yaw=0,pitch=0)=>posePart(name,i,...transform(point),x*h,y*h,z*h,angle+yaw,pitch);
      part('torso',rig.chest,.40,.52,.25,rig.twist,rig.lean);
      part('pelvis',rig.hip,.29,.20,.23,-rig.twist*.5);
      part('neck',[rig.head[0],rig.head[1]-.19,rig.head[2]],.12,.15,.12);
      part('head',rig.head,.126,.17,.136,rig.headYaw);
      const hairOffset=-.025;
      part('hair',[rig.head[0]+Math.sin(rig.headYaw)*hairOffset,rig.head[1]+.075,rig.head[2]+Math.cos(rig.headYaw)*hairOffset],.132,.105+m.hairLength*.04,.14,rig.headYaw);
      part('nose',[rig.head[0]+Math.sin(rig.headYaw)*.132,rig.head[1]-.01,rig.head[2]+Math.cos(rig.headYaw)*.132],.026,.036,.036,rig.headYaw);
      part('backpack',[rig.chest[0],rig.chest[1]-.025,rig.chest[2]-.19],m.backpack?.28:0,.34,.15,rig.twist);
      for(let j=0;j<2;j++){
        const side=j?'R':'L',arm=rig.arms[j],leg=rig.legs[j];
        limb('arm'+side,i,transform(arm.shoulder),transform(arm.elbow),.115*h);
        limb('fore'+side,i,transform(arm.elbow),transform(arm.hand),.083*h);
        part('hand'+side,arm.hand,.047,.067,.043);
        limb('leg'+side,i,transform(leg.hip),transform(leg.knee),.155*h);
        limb('shin'+side,i,transform(leg.knee),transform(leg.ankle),.11*h);
        part('shoe'+side,[leg.ankle[0],leg.ankle[1]-.055+Math.abs(Math.sin(leg.pitch))*.145,leg.ankle[2]+.045],.15,.13,.29,0,leg.pitch);
        if(j)part('cup',[arm.hand[0],arm.hand[1]+.04,arm.hand[2]+.025],.065,!state.walking&&hash(m.chapter,m.member,'cup')>.86?.13:0,.065);
      }
    });
    Object.values(parts).forEach(mesh=>mesh.instanceMatrix.needsUpdate=true);
    flags.forEach((flag,i)=>{flag.rotation.y=Math.sin(time*2+i)*.15;flag.rotation.z=Math.sin(time*3+i)*.035;});
  }
  animateCrowd(0);
  const competition=createCompetition(THREE,chapters,anchors);world.add(competition.root);
  const selection=new THREE.Mesh(new THREE.RingGeometry(6.8,7.0,64),new THREE.MeshBasicMaterial({color:0xa2aeff,transparent:true,opacity:.75,side:THREE.DoubleSide,depthWrite:false}));selection.rotation.x=-Math.PI/2;selection.position.y=.21;world.add(selection);
  // Batch repeated architectural parts so phones draw whole sets at once.
  world.updateMatrixWorld(true);
  const dynamic=new Set([selection,...pickables,...flags,...Object.values(parts)]);
  batchCampusGeometry(THREE,world,[...dynamic,...lawns]);
  world.updateMatrixWorld(true);
  world.traverse(object=>{if(!dynamic.has(object)){object.matrixAutoUpdate=false;}});
  flags.forEach(flag=>flag.castShadow=false);
  const emptyAnchor=anchors.find(a=>a.id==='empty');
  const beacon=emptyAnchor?createLotBeacon(THREE,emptyAnchor.lot):null;
  if(beacon){world.add(beacon.root);pickables.push(beacon.board);}
  const nightLife=createNightLife(THREE,world,anchors,chapters);world.add(nightLife.root);
  function animateEffects(time){beacon?.animate(time);if(nightLife.root.visible)nightLife.animate(time);}
  return {world,streets,pickables,anchors,members,parts,selection,animateCrowd,competition,beacon,nightLife,animateEffects};
}
