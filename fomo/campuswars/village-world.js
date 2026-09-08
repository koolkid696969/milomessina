import {LOTS,toWorld,crowdMembers,activityPose} from './village-layout.js';
import {createStreetNetwork} from './village-streets.js';

export function createVillage(THREE,chapters){
  const world=new THREE.Group(),pickables=[],anchors=[],flags=[];
  const materials=new Map();
  function mat(color,emissive=0){const key=color+':'+emissive;if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.84,emissive,emissiveIntensity:emissive?1.4:0}));return materials.get(key);}
  const boxGeometry=new THREE.BoxGeometry(1,1,1),sphereGeometry=new THREE.SphereGeometry(1,10,7),cylinderGeometry=new THREE.CylinderGeometry(1,1,1,10);
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
  if(brick){brick.width=256;brick.height=256;const c=brick.getContext('2d');c.fillStyle='#89786e';c.fillRect(0,0,256,256);for(let y=0;y<16;y++)for(let x=-1;x<5;x++){const value=175+((x*19+y*7)%30);c.fillStyle=`rgb(${value},${value-15},${value-22})`;c.fillRect(x*64+(y%2)*32+1,y*16+1,62,14);}brickMap=new THREE.CanvasTexture(brick);brickMap.wrapS=brickMap.wrapT=THREE.RepeatWrapping;brickMap.repeat.set(2,1.5);brickMap.colorSpace=THREE.SRGBColorSpace;}
  function facade(color){return new THREE.MeshStandardMaterial({color,...(brickMap?{map:brickMap}:{}),roughness:.95});}
  function roof(parent,x,y,z,w,d,height,color,hip=true){
    let positions,indices;
    if(hip){positions=[-w/2,0,-d/2,w/2,0,-d/2,w/2,0,d/2,-w/2,0,d/2,-w*.26,height,0,w*.26,height,0];indices=[0,1,5,0,5,4,1,2,5,2,3,4,2,4,5,3,0,4];}
    else{positions=[-w/2,0,-d/2,w/2,0,-d/2,0,height,-d/2,-w/2,0,d/2,w/2,0,d/2,0,height,d/2];indices=[0,2,1,3,4,5,0,3,5,0,5,2,1,2,5,1,5,4];}
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();const material=mat(color).clone();material.side=THREE.DoubleSide;const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.castShadow=true;parent.add(mesh);
  }
  // A continuous campus block, with wide sidewalks and a walkable boulevard.
  const terrain=new THREE.Mesh(new THREE.PlaneGeometry(20000,20000),mat(0x626c62));terrain.rotation.x=-Math.PI/2;terrain.position.y=-.08;terrain.receiveShadow=true;world.add(terrain);


  const streets=createStreetNetwork(THREE);world.add(streets);

  const streetSign=sign(world,'FOMO  /  GREEK VILLAGE',0,.14,34,10,2,'#303442','#adb5cb');
  if(streetSign)streetSign.rotation.x=-Math.PI/2;
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(20000,20000),new THREE.MeshBasicMaterial({visible:false}));ground.rotation.x=-Math.PI/2;ground.position.y=.18;world.add(ground);
  // Street lamps, paths, trees and furniture give the village a lived-in scale.
  function tree(x,z,size=1){const group=new THREE.Group();group.position.set(x,0,z);world.add(group);cylinder(group,0,1.1,0,.14,2.2,0x655143);for(let k=0;k<4;k++){const leaf=ball(group,Math.sin(k*2)*.6,2.4+k*.3,Math.cos(k*2)*.5,1.15,0x475862);leaf.scale.y*=1.1;}group.scale.setScalar(size);}
  [-1,1].forEach(side=>{
    [-31,-10,10,31].forEach(z=>{const x=side*7.6;cylinder(world,x,2,z,.07,4,0x3b3a46);box(world,x,4.1,z,.55,.12,.55,0x353444);const glow=box(world,x,3.82,z,.34,.45,.34,mat(0xffdea0,0xffbb55));glow.castShadow=false;const pool=new THREE.Mesh(new THREE.CircleGeometry(1.3,20),new THREE.MeshBasicMaterial({color:0xffd196,transparent:true,opacity:.07,depthWrite:false}));pool.rotation.x=-Math.PI/2;pool.position.set(x,.19,z);world.add(pool);});
    [-33,-9,10,33].forEach(z=>tree(side*29,z,.85+Math.abs(z)%3*.1));
    [-9,10].forEach(z=>{box(world,side*9,.6,z,1,.2,2.3,0x85694f);box(world,side*9.4,1,z,.13,.65,2.3,0x85694f);[-.8,.8].forEach(d=>box(world,side*9,.3,z+d,.8,.6,.12,0x333747));});
  });
  function windowUnit(parent,x,y,z,lit=true){
    box(parent,x,y,z,1.05,1.65,.13,0xe7dfcb);box(parent,x,y,z+.08,.8,1.38,.07,lit?mat(0xffdca1,0xa36527):mat(0x34414f));
    box(parent,x,y,z+.14,.065,1.45,.055,0xe8ddc8);box(parent,x,y,z+.14,.9,.065,.055,0xe8ddc8);
    [-.68,.68].forEach(dx=>box(parent,x+dx,y,z,.23,1.65,.15,0x283940));
  }
  LOTS.forEach((lot,index)=>{
    const group=new THREE.Group();group.position.set(lot.x,0,lot.z);group.rotation.y=lot.rotation;world.add(group);
    const chapter=chapters[index],id=chapter?.id||'empty';
    box(group,0,.02,3,15,.22,18,0x515b58);
    box(group,0,.15,7.7,1.65,.1,8.6,0xb3b0a4);
    [-6.8,6.8].forEach(x=>{box(group,x,.12,3,.12,.16,17,0x8b9096);});
    if(!chapter){
      const outline=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-5.5,.2,-3),new THREE.Vector3(5.5,.2,-3),new THREE.Vector3(5.5,.2,6),new THREE.Vector3(-5.5,.2,6)]),new THREE.LineBasicMaterial({color:0xa6afff}));group.add(outline);
      [-5.5,5.5].forEach(x=>[-3,6].forEach(z=>cylinder(group,x,.55,z,.08,1.1,0xc6b69a)));
      box(group,0,1.5,7.6,.13,2.5,.13,0xc6b69a);box(group,0,2,7.65,3.6,1.5,.16,0x646eff);sign(group,'YOUR HOUSE',0,2.1,7.75,3.2,.55,'#646eff','#ffffff');sign(group,'START HERE',0,1.65,7.75,2.8,.35,'#646eff','#ffffff');
      const hit=box(group,0,1,1,12,2,13,new THREE.MeshBasicMaterial({visible:false}));hit.userData.chapter=id;pickables.push(hit);anchors.push({id,point:new THREE.Vector3(lot.x,4,lot.z),lot});return;
    }
    const colors=[0xb77458,0xad6952,0xa3604c,0xd5cfbb,0x855d54];const wall=index===3?mat(colors[index]):facade(colors[index]);const width=[11,12.2,10.5,12.2,10.5][index],height=index===4?9.1:7.4,depth=7.5;
    box(group,0,.38,0,width+1,.6,depth+1,0xc1b5a0);box(group,0,height/2+.6,0,width,height,depth,wall);
    box(group,0,height+.65,0,width+.5,.3,depth+.5,0xe4ddca);box(group,0,4.1,3.85,width+.25,.18,.22,0xcbbb9f);
    roof(group,0,height+.82,0,width+.8,depth+1.1,2.0,0x343846,index!==4);
    box(group,-width*.3,height+1.4,-1.8,.85,2,.9,wall);box(group,-width*.3,height+2.45,-1.8,1,.16,1.05,0x76665e);
    for(let floor=0;floor<(index===4?3:2);floor++)for(let col=0;col<5;col++){
      const x=(col-2)*(width/5.8);if(floor===0&&col===2)continue;
      windowUnit(group,x,1.95+floor*2.75,depth/2+.06,(floor*5+col+index)%4!==0);
    }
    // Side windows are modeled too, so every angle holds up during a walk.
    [-1,1].forEach(side=>{const wing=new THREE.Group();wing.position.set(side*(width/2+.02),0,0);wing.rotation.y=side*Math.PI/2;group.add(wing);for(let floor=0;floor<2;floor++)[-2.2,0,2.2].forEach((x,j)=>windowUnit(wing,x,1.95+floor*2.75,0,(j+floor+index)%3!==0));});
    const porchWidth=index===1?10.8:index===3?8:6.8;
    box(group,0,.48,4.7,porchWidth+1,.5,2.6,0xbab6ac);
    for(let step=0;step<3;step++)box(group,0,.13+step*.12,6.2-step*.38,3.3,.25,1.1,0xb9b5ac);
    box(group,0,1.65,3.87,1.25,2.2,.13,[0x693b3e,0x313d60,0x3d3a37,0x343b58,0x6b3340][index]);box(group,.4,1.65,3.99,.07,.07,.05,0xebc36d);
    const columnCount=index===1?6:4,colHeight=index===4?3.7:6.9;
    for(let col=0;col<columnCount;col++){const x=(col/(columnCount-1)-.5)*(porchWidth-.4);cylinder(group,x,colHeight/2+.75,5.35,.2,colHeight,0xece4cf);box(group,x,.65,5.35,.66,.22,.66,0xece4cf);box(group,x,colHeight+.76,5.35,.63,.23,.63,0xece4cf);}
    box(group,0,colHeight+.98,4.7,porchWidth+.8,.55,2.5,0xe5ddc7);
    if(index!==1)roof(group,0,colHeight+1.25,4.7,porchWidth+1,2.65,1.3,0xe8dfc9,false);
    sign(group,chapter.letters,0,colHeight+.98,6.02,porchWidth*.65,.46);
    if(index===0||index===3){box(group,0,3.98,4.7,5.8,.15,1.8,0xded7c7);box(group,0,4.8,5.54,5.8,.09,.09,0x3a3a42);for(let x=-2.8;x<=2.8;x+=.35)box(group,x,4.4,5.54,.04,.8,.04,0x3a3a42);}
    [-4.8,4.8].forEach(x=>{ball(group,x,.6,5.8,.65,0x4a5757);box(group,x,.27,5.8,1.3,.25,1.3,0x918a7d);});
    // Chapter pennant, porch chairs, a table and speakers.
    cylinder(group,-6.1,2.4,6.1,.045,4.8,0xc3b997);const flag=box(group,-5.52,4.3,6.1,1.15,.65,.045,[0x6976d2,0x873f3e,0x5f7792,0xbc9959,0x934843][index]);flags.push(flag);
    if(chapter.joined){[-3.8,3.8].forEach(x=>{box(group,x,.6,6.7,.55,1.1,.5,0x232936);[.38,.78].forEach(y=>{const speaker=cylinder(group,x,y,6.98,.17,.025,0x596475);speaker.rotation.x=Math.PI/2;});});box(group,3.8,.72,8.5,1.9,.12,.85,0xa6906d);[-.65,.65].forEach(x=>box(group,3.8+x,.36,8.5,.1,.7,.5,0x4e4a48));for(let cup=0;cup<3;cup++)cylinder(group,3.35+cup*.35,.89,8.5,.07,.2,0xce5757);}
    const hit=box(group,0,height/2,0,width+1,height+3,depth+5,new THREE.MeshBasicMaterial({visible:false}));hit.userData.chapter=id;pickables.push(hit);
    anchors.push({id,point:new THREE.Vector3(lot.x,height+3.8,lot.z),lot});
  });
  const members=crowdMembers(chapters),parts={};const shirtColors=[0xd8dce8,0x626fd6,0xb74f52,0xe3c59a,0x314e72,0xb38799,0x798c9d,0xebe4d0],skinColors=[0xe2b191,0xb17c5a,0x85573c,0xd6a075,0x674638];
  ['torso','head','hair','armL','armR','foreL','foreR','legL','legR','cup'].forEach(name=>{
    const mesh=new THREE.InstancedMesh(name==='head'?sphereGeometry:boxGeometry,mat(0xffffff),members.length);mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.frustumCulled=true;mesh.boundingSphere=new THREE.Sphere(new THREE.Vector3(0,1,0),36);mesh.castShadow=false;world.add(mesh);parts[name]=mesh;
    members.forEach((m,i)=>mesh.setColorAt(i,new THREE.Color(name==='torso'?shirtColors[m.shirt]:name==='head'||name.startsWith('arm')||name.startsWith('fore')?skinColors[m.skin]:name==='hair'?0x342b29:name==='cup'?0xd54f56:0x374153)));
  });
  const dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0),a=new THREE.Vector3(),b=new THREE.Vector3(),direction=new THREE.Vector3();
  function posePart(name,i,x,y,z,sx,sy,sz,rotation=0){dummy.position.set(x,y,z);dummy.rotation.set(0,rotation,0);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();parts[name].setMatrixAt(i,dummy.matrix);}
  function limb(name,i,from,to,r){a.set(...from);b.set(...to);direction.subVectors(b,a);dummy.position.copy(a).add(b).multiplyScalar(.5);const length=direction.length();dummy.quaternion.setFromUnitVectors(up,direction.normalize());dummy.scale.set(r,length,r);dummy.updateMatrix();parts[name].setMatrixAt(i,dummy.matrix);}
  function animateCrowd(time){
    members.forEach((m,i)=>{
      const pose=activityPose(m,time),y=.68+pose.breath,angle=pose.rotation;
      const transform=(x,yy,z=0)=>[pose.x+x*Math.cos(angle)+z*Math.sin(angle),yy,pose.z-x*Math.sin(angle)+z*Math.cos(angle)];
      posePart('torso',i,...transform(0,y),.36,.48,.24,angle);
      const nod=Math.sin(time*(pose.speaking?1.6:.8)+m.phase)*.009;
      posePart('head',i,...transform(0,y+.39+nod),.155,.18,.155,angle);posePart('hair',i,...transform(0,y+.51+nod,-.02),.27,.11,.25,angle);
      [-1,1].forEach((side,k)=>{
        const gait=pose.walking?Math.sin(pose.gait+(k?Math.PI:0)):0,gesture=k?pose.gesture:pose.gesture*.22;
        const shoulder=transform(side*.22,y+.14),elbow=transform(side*(.24+gesture*.11),y-.1+gesture*.18,-gait*.08),hand=transform(side*(.25+gesture*.16),y-.31+gesture*.42,.035+gesture*.2-gait*.13);
        limb(k?'armR':'armL',i,shoulder,elbow,.095);limb(k?'foreR':'foreL',i,elbow,hand,.08);
        const hip=transform(side*.1,y-.22),foot=transform(side*.12,.14+(pose.walking?Math.max(0,gait)*.045:0),gait*.2);limb(k?'legR':'legL',i,hip,foot,.13);
        if(k)posePart('cup',i,...hand,.095,!pose.walking&&i%7===0?.13:0,.095,angle);
      });
    });
    Object.values(parts).forEach(mesh=>mesh.instanceMatrix.needsUpdate=true);
    flags.forEach((flag,i)=>{flag.rotation.y=Math.sin(time*2+i)*.15;flag.rotation.z=Math.sin(time*3+i)*.035;});
  }
  animateCrowd(0);
  const selection=new THREE.Mesh(new THREE.RingGeometry(6.8,7.0,64),new THREE.MeshBasicMaterial({color:0xa2aeff,transparent:true,opacity:.75,side:THREE.DoubleSide,depthWrite:false}));selection.rotation.x=-Math.PI/2;selection.position.y=.21;world.add(selection);
  // Batch repeated architectural parts so phones draw whole sets at once.
  world.updateMatrixWorld(true);
  const batches=new Map(),dynamic=new Set([ground,selection,...pickables,...flags,...Object.values(parts)]);
  world.traverse(object=>{
    if(!object.isMesh||dynamic.has(object)||object.isInstancedMesh)return;
    const key=object.geometry.uuid+object.material.uuid+object.castShadow+object.receiveShadow;
    if(!batches.has(key))batches.set(key,[]);
    batches.get(key).push(object);
  });
  batches.forEach(objects=>{
    if(objects.length<2)return;
    const first=objects[0],batch=new THREE.InstancedMesh(first.geometry,first.material,objects.length);
    batch.castShadow=first.castShadow;batch.receiveShadow=first.receiveShadow;
    objects.forEach((object,index)=>{batch.setMatrixAt(index,object.matrixWorld);object.removeFromParent();});
    batch.instanceMatrix.needsUpdate=true;batch.computeBoundingSphere();world.add(batch);
  });
  world.updateMatrixWorld(true);
  world.traverse(object=>{if(!dynamic.has(object)){object.matrixAutoUpdate=false;}});
  flags.forEach(flag=>flag.castShadow=false);
  return {world,ground,streets,pickables,anchors,members,parts,selection,animateCrowd};
}
