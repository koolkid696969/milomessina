import {roundedLoop,mod} from './village-district-layout.js?v=17';

// Physical routes keep activity on sidewalks, lawns and bike lanes.
export function campusPeople(kind,cx,cz){
  const core=kind==='greek',seed=mod(cx*37+cz*19,53),people=[];
  const add=(action,x,z,angle=0,extra={})=>people.push({action,x,z,angle,phase:people.length*2.399+seed,look:(people.length+seed)%9,...extra});
  const spine=kind==='library'||kind==='athletics'||kind==='commons';
  for(let i=0;i<(core?26:18);i++){
    const side=i%2?1:-1;
    add(i%9===0?'jog':'walk',side*(core?(i%4<2?7.15:30.8):spine?3.4:7.25),0,0,{offset:i*5.93+seed,speed:i%9===0?2.0:.85+i%5*.075,routeStart:spine?1:-39});
  }
  if(core){
    for(const [x,z] of [[37,-11],[43,-11],[46,-11]])for(const side of [-1,1])add('study',x+side*1.05,z,side<0?Math.PI/2:-Math.PI/2);
    for(const [x,z] of [[36,12],[48,12]])for(const offset of [-.4,.45])add('sit',x, z+offset,x<42?Math.PI/2:-Math.PI/2);
    for(let i=0;i<4;i++)add('queue',39+i*.6,-15.6,Math.PI);
    for(const [gx,gz] of [[35,-5],[44,24],[-33,-11],[-31,28]])for(let seat=0;seat<3;seat++){const a=seat*Math.PI*2/3;add('talk',gx+Math.sin(a)*.8,gz+Math.cos(a)*.8,a+Math.PI,{seat});}
    for(let i=0;i<4;i++)add('basketball',-42+(i%2?3:-3),6+Math.floor(i/2)*7,0,{seat:i});
    for(let i=0;i<3;i++)add('lawn',-37+i*1.7,-24,.4);
  }else if(spine){
    for(const [gx,gz] of (kind==='athletics'?[[13,-4],[25,-11],[-20,-5]]:[[-13,27],[13,30],[-21,34]]))for(let seat=0;seat<3;seat++){const a=seat*Math.PI*2/3;add('talk',gx+Math.sin(a)*.85,gz+Math.cos(a)*.85,a+Math.PI,{seat});}
    for(let i=0;i<6;i++)add('lawn',(kind==='athletics'?13:-20)+i*2.1,(kind==='athletics'?-21:15)+(i%2)*2,.8);
    for(const side of [-1,1])for(let i=0;i<2;i++)add('study',side*12+i*.7,36,Math.PI);
  }else{
    for(const side of [-1,1])for(let seat=0;seat<3;seat++){const a=seat*Math.PI*2/3;add('talk',side*18+Math.sin(a)*.85,38+Math.cos(a)*.85,a+Math.PI,{seat});}
    for(const side of [-1,1])for(const dx of [-.4,.4])add('study',side*29+dx,38,Math.PI);
  }
  return people;
}
export function campusPose(person,time){
  let {x,z,angle}=person;let gait=0;
  if(person.action==='walk'||person.action==='jog'){
    // Closed sidewalk circuit with rounded ends; walkers never reverse in place.
    const side=Math.sign(x),outer=Math.abs(x)+1.3;
    const route=roundedLoop(side>0?x:x-1.3,person.routeStart,side>0?outer:x,39,.55);
    const s=route.sample(person.offset+time*person.speed);x=s.x;z=s.z;angle=s.angle;gait=time*(person.action==='jog'?7:4.3)+person.phase;
  }else if(person.action==='basketball'){
    x+=Math.sin(time*.38+person.phase)*1.8;z+=Math.sin(time*.26+person.phase)*2;angle=Math.atan2(-x-42,10-z);gait=time*4.2;
  }
  return {x,z,angle,gait};
}

export function createCampusPeople(T,kit,kind,cx,cz){
  const root=new T.Group(),people=campusPeople(kind,cx,cz),n=people.length;
  const capsule=new T.CapsuleGeometry(.5,1,2,6);capsule.scale(1,.5,1);
  const sphere=new T.SphereGeometry(1,8,6),cube=kit.geometries.box;
  function instances(geometry,count){const m=new T.InstancedMesh(geometry,kit.material(0xffffff),count);m.instanceMatrix.setUsage(T.DynamicDrawUsage);m.boundingSphere=new T.Sphere(new T.Vector3(0,2,0),66);root.add(m);return m;}
  const body=instances(capsule,n*9),heads=instances(sphere,n*3),hair=instances(sphere,n),gear=instances(cube,n*2),shoes=instances(capsule,n*2),balls=instances(sphere,kind==='greek'?1:0);
  const shirts=[0xe5d7ba,0x617cad,0x974d46,0x435655,0xc49b65,0xa7b3b4,0x504c71,0xd8dce1,0x7b8064],skins=[0xe5b28a,0xba8662,0x835c43,0xd7a074,0x684a38],pants=[0x314357,0x63686b,0xab9576,0x393c49];
  const color=new T.Color();
  people.forEach((p,i)=>{
    const skin=skins[(i+cx*cx+cz*cz)%skins.length];
    for(let part=0;part<9;part++)body.setColorAt(i*9+part,color.set(part===0?shirts[p.look]:part<5?skin:pants[i%4]));
    for(let j=0;j<3;j++)heads.setColorAt(i*3+j,color.set(skin));
    hair.setColorAt(i,color.set([0x352a23,0x735036,0xc4a779,0x211f20][i%4]));
    gear.setColorAt(i*2,color.set([0x586574,0x9c7856,0x705658][i%3]));gear.setColorAt(i*2+1,color.set(0xe0d9c8));
    for(let j=0;j<2;j++)shoes.setColorAt(i*2+j,color.set(i%3?0xe4e1d7:0x32393c));
  });
  if(balls.count)balls.setColorAt(0,color.set(0xbb713e));
  const dummy=new T.Object3D(),a=new T.Vector3(),b=new T.Vector3(),direction=new T.Vector3(),up=new T.Vector3(0,1,0);
  function pose(mesh,i,x,y,z,sx,sy,sz,angle=0,lean=0){dummy.position.set(x,y,z);dummy.rotation.set(lean,angle,0);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);}
  function limb(mesh,i,from,to,r){a.set(...from);b.set(...to);direction.subVectors(b,a);dummy.position.copy(a).add(b).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(up,direction.clone().normalize());dummy.scale.set(r,direction.length()+.025,r);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);}
  function animate(time){
    people.forEach((p,i)=>{
      const s=campusPose(p,time),seated=['sit','study','lawn'].includes(p.action),onLawn=p.action==='lawn',moving=['walk','jog','basketball'].includes(p.action);
      const breath=Math.sin(time*1.5+p.phase)*.008,hip=onLawn?.24:seated?.65:.88+breath,chest=hip+.34,head=hip+.73;
      const ground=p.action==='basketball'?.33:0;
      const local=(x,y,z=0)=>[s.x+x*Math.cos(s.angle)+z*Math.sin(s.angle),y+ground,s.z-x*Math.sin(s.angle)+z*Math.cos(s.angle)];
      pose(body,i*9,...local(0,chest),.37,.52,.25,s.angle,seated?.1:0);
      const nod=Math.sin(time*.8+p.phase)*.018;
      pose(heads,i*3,...local(0,head+nod,.015),.135,.18,.145,s.angle);
      pose(hair,i,...local(0,head+.10+nod,-.015),.14,.115,.15,s.angle);
      for(const side of [-1,1]){
        const j=side===-1?0:1,swing=moving?Math.sin(s.gait+j*Math.PI)*.25:0;
        const speaking=p.action==='talk'&&Math.floor(time/5+p.phase)%3===p.seat;
        const gesture=speaking?(Math.sin(time*2+p.phase)+1)*.11:0;
        const shoulder=local(side*.22,chest+.13),elbow=local(side*.24,chest-.14,seated?.28:-swing*.45+gesture),hand=local(side*(.22+gesture),seated?hip+.24:chest-.36+gesture,seated?.48:-swing+gesture*1.5);
        limb(body,i*9+1+j*2,shoulder,elbow,.095);limb(body,i*9+2+j*2,elbow,hand,.075);pose(heads,i*3+1+j,...hand,.055,.08,.045,s.angle);
        const knee=local(side*.11,seated?hip-.02:.49,seated?.4:swing*.4),foot=local(side*.12,onLawn?.12:.13+Math.max(0,swing)*.22,seated?.5:swing);
        limb(body,i*9+5+j*2,local(side*.12,hip),knee,.145);limb(body,i*9+6+j*2,knee,foot,.105);pose(shoes,i*2+j,foot[0],foot[1]-.05,foot[2],.13,.10,.24,s.angle);
      }
      const backpack=moving&&i%3!==0;
      pose(gear,i*2,...local(0,chest,-.19),backpack?.29:0,.36,.16,s.angle);
      const book=p.action==='study'||p.action==='lawn';
      pose(gear,i*2+1,...local(0,hip+.19,.49),book?.34:0,.035,.26,s.angle);
    });
    if(balls.count){const p=campusPose(people.find(p=>p.action==='basketball'),time);pose(balls,0,p.x+.42,.55+Math.abs(Math.sin(time*3.3))*1.05,p.z+.35,.19,.19,.19);}
    for(const m of [body,heads,hair,gear,shoes,balls])m.instanceMatrix.needsUpdate=true;
  }
  animate(0);return {root,people,animate,dispose(){capsule.dispose();sphere.dispose();}};
}

export function createCampusTraffic(T,kit){
  const root=new T.Group(),dummy=new T.Object3D(),color=new T.Color();
  // Two one-way circuits have separate lane centers and rounded junction turns.
  const loops=[roundedLoop(2.4,-47.6,97.6,47.6,7.8),roundedLoop(-97.6,-47.6,-2.4,47.6,7.8)];
  const cars=Array.from({length:8},(_,i)=>({loop:i%2,offset:22+i*83,speed:4.4,shuttle:i===3,color:[0xf1e9d6,0x66829e,0xa75a49,0xd6dbd8,0x48585e,0xbaa283,0x8c959e,0x555766][i]}));
  const cyclists=Array.from({length:12},(_,i)=>({loop:i%2,offset:i*57+19,speed:2.65,phase:i*2.1}));
  const bikeLoops=[roundedLoop(4.7,-45.3,95.3,45.3,8),roundedLoop(-95.3,-45.3,-4.7,45.3,8)];
  const rounded=new T.CapsuleGeometry(.5,1,3,10);rounded.scale(1,.5,1);
  const outline=new T.Shape(),r=.11;
  outline.moveTo(-.5+r,-.5);outline.lineTo(.5-r,-.5);outline.quadraticCurveTo(.5,-.5,.5,-.5+r);outline.lineTo(.5,.5-r);outline.quadraticCurveTo(.5,.5,.5-r,.5);outline.lineTo(-.5+r,.5);outline.quadraticCurveTo(-.5,.5,-.5,.5-r);outline.lineTo(-.5,-.5+r);outline.quadraticCurveTo(-.5,-.5,-.5+r,-.5);
  const carBody=new T.ExtrudeGeometry(outline,{depth:.84,bevelEnabled:true,bevelThickness:.08,bevelSize:.04,bevelSegments:2,curveSegments:3});carBody.rotateX(-Math.PI/2);carBody.center();
  const tire=new T.CylinderGeometry(.32,.32,.19,14);tire.rotateZ(Math.PI/2);
  function instances(geo,n){const m=new T.InstancedMesh(geo,kit.material(0xffffff),n);m.instanceMatrix.setUsage(T.DynamicDrawUsage);m.boundingSphere=new T.Sphere(new T.Vector3(0,2,0),145);root.add(m);return m;}
  const chassis=instances(carBody,cars.length*2),glass=instances(kit.geometries.box,cars.length),wheels=instances(tire,cars.length*4),lights=instances(kit.geometries.box,cars.length*4),bikeWheels=instances(kit.geometries.wheel,cyclists.length*2),bikeTubes=instances(kit.geometries.cylinder,cyclists.length*13),riders=instances(rounded,cyclists.length*9),heads=instances(kit.geometries.sphere,cyclists.length*2);
  cars.forEach((c,i)=>{for(let j=0;j<2;j++)chassis.setColorAt(i*2+j,color.set(c.color));glass.setColorAt(i,color.set(0x3c535e));for(let j=0;j<4;j++){wheels.setColorAt(i*4+j,color.set(0x293137));lights.setColorAt(i*4+j,color.set(j<2?0xffebbc:0xc15644));}});
  cyclists.forEach((c,i)=>{for(let j=0;j<2;j++){bikeWheels.setColorAt(i*2+j,color.set(0x303d42));heads.setColorAt(i*2+j,color.set(j?0xe0d9c7:0xc69b7a));}for(let j=0;j<13;j++)bikeTubes.setColorAt(i*13+j,color.set(j<6?0x6b8491:0x899593));for(let j=0;j<9;j++){riders.setColorAt(i*9+j,color.set(j===0?[0xb99269,0x576e99,0x994f47][i%3]:j<5?0xc69b7a:0x43505b));}});
  const a=new T.Vector3(),b=new T.Vector3(),up=new T.Vector3(0,1,0);
  function pose(mesh,i,x,y,z,sx,sy,sz,angle=0){dummy.position.set(x,y,z);dummy.rotation.set(0,angle,0);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);}
  function tube(mesh,i,from,to,r){a.set(...from);b.set(...to);const dir=b.clone().sub(a);dummy.position.copy(a).add(b).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(up,dir.clone().normalize());dummy.scale.set(r,dir.length(),r);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);}
  function animate(t,focusX=0,focusZ=0){
    // Translate the circuits to the nearest 300-unit campus; no traffic crosses lawns.
    const ox=Math.round(focusX/300)*300,oz=Math.round(focusZ/300)*300;root.position.set(ox,0,oz);root.updateMatrix();root.updateMatrixWorld(true);
    cars.forEach((c,i)=>{
      const s=loops[c.loop].sample(c.offset+t*c.speed),local=(x,y,z)=>[s.x+x*Math.cos(s.angle)+z*Math.sin(s.angle),y,s.z-x*Math.sin(s.angle)+z*Math.cos(s.angle)];
      const length=c.shuttle?6.5:3.9;
      pose(chassis,i*2,...local(0,.68,0),1.65,.7,length,s.angle);pose(chassis,i*2+1,...local(0,c.shuttle?1.63:1.1,-.16),1.48,c.shuttle?1.4:.75,c.shuttle?5.4:2.1,s.angle);
      pose(glass,i,...local(0,c.shuttle?1.78:1.3,.05),1.5,c.shuttle?.66:.4,c.shuttle?4.9:1.75,s.angle);
      for(let j=0;j<4;j++){const side=j%2?1:-1,front=j<2?1:-1;pose(wheels,i*4+j,...local(side*.79,.4,front*length*.31),1,1,1,s.angle);pose(lights,i*4+j,...local(side*.53,.75,front*(length*.49)),.32,.16,.06,s.angle);}
    });
    cyclists.forEach((c,i)=>{
      const s=bikeLoops[c.loop].sample(c.offset+t*c.speed),local=(x,y,z)=>[s.x+x*Math.cos(s.angle)+z*Math.sin(s.angle),y,s.z-x*Math.sin(s.angle)+z*Math.cos(s.angle)];
      for(let j=0;j<2;j++)pose(bikeWheels,i*2+j,...local(0,.4,j?.65:-.65),1,1,1,s.angle+Math.PI/2);
      const rear=local(0,.4,-.65),front=local(0,.4,.65),crank=local(0,.45,-.03),seat=local(0,1.04,-.25),bar=local(0,1.04,.46);
      [[rear,crank],[rear,seat],[seat,crank],[seat,bar],[bar,crank],[bar,front],[bar,local(0,1.19,.42)],[local(-.23,1.19,.42),local(.23,1.19,.42)],[local(-.12,1.06,-.25),local(.12,1.06,-.25)]].forEach(([a,b],j)=>tube(bikeTubes,i*13+j,a,b,.032));
      for(let wheel=0;wheel<2;wheel++)for(let spoke=0;spoke<2;spoke++){
        const a=t*c.speed/.34+spoke*Math.PI/2,dy=Math.cos(a)*.31,dz=Math.sin(a)*.31,z=wheel?.65:-.65;
        tube(bikeTubes,i*13+9+wheel*2+spoke,local(0,.4+dy,z+dz),local(0,.4-dy,z-dz),.009);
      }
      const pelvis=local(0,1.12,-.2),shoulder=local(0,1.46,.08),head=local(0,1.75,.19);
      tube(riders,i*9,pelvis,shoulder,.35);pose(heads,i*2,...head,.14,.17,.15,s.angle);pose(heads,i*2+1,...local(0,1.87,.19),.16,.08,.17,s.angle);
      for(let j=0;j<2;j++){const side=j?1:-1,pedal=t*5+c.phase+j*Math.PI;
        const elbow=local(side*.23,1.25,.29),hand=local(side*.23,1.19,.42),knee=local(side*.15,.86,.18+Math.sin(pedal)*.12),foot=local(side*.15,.47+Math.cos(pedal)*.19,Math.sin(pedal)*.19);
        tube(riders,i*9+1+j*2,local(side*.2,1.44,.08),elbow,.095);tube(riders,i*9+2+j*2,elbow,hand,.075);
        tube(riders,i*9+5+j*2,local(side*.12,1.1,-.2),knee,.135);tube(riders,i*9+6+j*2,knee,foot,.1);
      }
    });
    for(const m of [chassis,glass,wheels,lights,bikeWheels,bikeTubes,riders,heads])m.instanceMatrix.needsUpdate=true;
  }
  animate(0);return {root,animate,cars,cyclists,loops};
}
