import {roundedLoop,mod,hash,appearance,palettes,districtSpecs} from './village-district-layout.js?v=22';

// Physical routes keep activity on sidewalks, lawns and bike lanes.
export function campusPeople(kind,cx,cz){
  const core=kind==='greek',seed=hash(cx,cz,'people')*53,people=[];
  const add=(action,x,z,angle=0,extra={})=>people.push({action,x,z,angle,phase:hash(cx,cz,people.length,'phase')*40,...appearance(`${cx},${cz}`,people.length),...extra});
  const spine=kind==='library'||kind==='athletics'||kind==='commons';
  for(let i=0;i<(core?30:spine?24:10);i++){
    const side=i%2?1:-1;
    add(hash(cx,cz,i,'jog')>.9?'jog':'walk',side*(core?(i%4<2?7.15:30.8):spine?3.4:7.25),0,0,{offset:hash(cx,cz,i,'route')*140,speed:.85+hash(cx,cz,i,'speed')*.3,routeStart:spine?1:-39});
  }
  if(core){
    for(const [x,z] of [[37,-11],[43,-11],[46,-11]])for(const side of [-1,1])add('study',x+side*1.05,z,side<0?Math.PI/2:-Math.PI/2);
    for(const [x,z] of [[36,12],[48,12]])for(const offset of [-.4,.45])add('sit',x, z+offset,x<42?Math.PI/2:-Math.PI/2);
    for(let i=0;i<8;i++)add('queue',39+i*.6,-15.6,Math.PI);
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
  // Destination clusters carry the population; side streets stay quiet.
  const gatherings=core?[[-26,-33],[24,-33],[36,26],[-35,28]]:spine?[[-9,34],[8,28],[18,38]]:[[18,36]];
  for(const [gx,gz] of gatherings){const size=4+Math.floor(hash(cx,cz,gx,gz)*4);for(let seat=0;seat<size;seat++){const a=seat*Math.PI*2/size,r=1+hash(gx,gz,seat)*.35;add('talk',gx+Math.sin(a)*r,gz+Math.cos(a)*r,a+Math.PI,{seat,groupSize:size});}}
  for(const spec of districtSpecs(cx,cz)){
    const a=spec.rotation,d=spec.depth/2+.36,x=spec.x-cx*100+Math.sin(a)*d,z=spec.z-cz*100+Math.cos(a)*d;
    for(let i=0;i<2;i++)add('doorway',x,z,a,{offset:hash(cx,cz,spec.seed,i)*24,speed:.65});
  }
  if(core){
    add('dogwalk',30.8,0,0,{offset:43,speed:.8,routeStart:-32});
    add('skate',-7.15,0,0,{offset:14,speed:1.7,routeStart:-37});
    add('skate',7.15,0,0,{offset:81,speed:1.6,routeStart:-37});
    add('groundskeeper',-48,-29,Math.PI/2);
    add('frisbee',-48,-19,Math.PI/2,{seat:0});add('frisbee',-38,-19,-Math.PI/2,{seat:1});
  }
  return people;
}
export function campusPose(person,time){
  let {x,z,angle}=person;let gait=0;
  if(['walk','jog','dogwalk','skate'].includes(person.action)){
    // Closed sidewalk circuit with rounded ends; walkers never reverse in place.
    const side=Math.sign(x),outer=Math.abs(x)+1.3;
    const route=roundedLoop(side>0?x:x-1.3,person.routeStart,side>0?outer:x,39,.55);
    const s=route.sample(person.offset+time*person.speed);x=s.x;z=s.z;angle=s.angle;gait=time*(person.action==='jog'?7:4.3)+person.phase;
  }else if(person.action==='basketball'){
    x+=Math.sin(time*.38+person.phase)*1.8;z+=Math.sin(time*.26+person.phase)*2;angle=Math.atan2(-x-42,10-z);gait=time*4.2;
  }
  let hidden=false;
  if(person.action==='doorway'){
    const cycle=mod(time+person.offset,24),distance=cycle<8?5*(1-cycle/8):cycle<16?0:5*(cycle-16)/8;
    x+=Math.sin(angle)*distance;z+=Math.cos(angle)*distance;
    hidden=cycle>=8&&cycle<16;if(cycle<8)angle+=Math.PI;gait=time*3.8+person.phase;
  }else if(person.action==='groundskeeper'){x+=Math.sin(time*.13)*3;angle=Math.cos(time*.13)>0?Math.PI/2:-Math.PI/2;gait=time*3;}
  return {x,z,angle,gait,hidden};
}

export function createCampusPeople(T,kit,kind,cx,cz){
  const root=new T.Group(),people=campusPeople(kind,cx,cz),n=people.length;
  const capsule=new T.CapsuleGeometry(.5,1,2,6);capsule.scale(1,.5,1);
  const sphere=new T.SphereGeometry(1,7,5),cube=kit.geometries.box;
  const instances=(geometry,count)=>kit.instances(root,geometry,count);
  const core=kind==='greek',body=instances(capsule,n*9+(core?7:0)),heads=instances(sphere,n*3),hair=instances(sphere,n),gear=instances(cube,n*2+(core?3:0)),shoes=instances(kit.geometries.shoe,n*2),balls=instances(sphere,core?2:0);
  const {shirts,skin:skins,pants}=palettes;
  const color=new T.Color();
  people.forEach((p,i)=>{
    const skin=skins[p.skin];
    for(let part=0;part<9;part++)body.setColorAt(i*9+part,color.set(part===0||(p.jacket&&part<5)?shirts[p.shirt]:part<5||(p.shorts&&(part===6||part===8))?skin:pants[p.pants]));
    for(let j=0;j<3;j++)heads.setColorAt(i*3+j,color.set(skin));
    hair.setColorAt(i,color.set(palettes.hair[p.hair]));
    gear.setColorAt(i*2,color.set([0x586574,0x9c7856,0x705658][Math.floor(hash(cx,cz,i)*3)]));gear.setColorAt(i*2+1,color.set(0xe0d9c8));
    for(let j=0;j<2;j++)shoes.setColorAt(i*2+j,color.set(i%3?0xe4e1d7:0x32393c));
  });
  if(core){balls.setColorAt(0,color.set(0xbb713e));balls.setColorAt(1,color.set(0xd7a765));for(let i=0;i<7;i++)body.setColorAt(n*9+i,color.set(i===6?0x4a5453:0xa17c52));for(let i=0;i<3;i++)gear.setColorAt(n*2+i,color.set(i===2?0x312b25:0x94704d));}
  const dummy=new T.Object3D(),a=new T.Vector3(),b=new T.Vector3(),direction=new T.Vector3(),up=new T.Vector3(0,1,0);
  function pose(mesh,i,x,y,z,sx,sy,sz,angle=0,lean=0){dummy.position.set(x,y,z);dummy.rotation.set(lean,angle,0);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);}
  function limb(mesh,i,from,to,r){a.set(...from);b.set(...to);direction.subVectors(b,a);dummy.position.copy(a).add(b).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(up,direction.clone().normalize());dummy.scale.set(r,direction.length()+.025,r);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);}
  function animate(time){
    people.forEach((p,i)=>{
      const s=campusPose(p,time),seated=['sit','study','lawn'].includes(p.action),onLawn=p.action==='lawn',moving=['walk','jog','basketball','doorway','dogwalk','skate','groundskeeper'].includes(p.action);
      const breath=Math.sin(time*1.5+p.phase)*.008,hip=onLawn?.24:seated?.65:.88+breath,chest=hip+.34,head=hip+.73;
      const ground=p.action==='basketball'?.33:p.action==='skate'?.14:p.action==='doorway'?.27:0;
      const local=(x,y,z=0)=>[s.x+x*Math.cos(s.angle)+z*Math.sin(s.angle),y*p.height+ground+(s.hidden?-20:0),s.z-x*Math.sin(s.angle)+z*Math.cos(s.angle)];
      pose(body,i*9,...local(0,chest),.37,.52*p.height,.25,s.angle,seated?.1:0);
      const nod=Math.sin(time*.8+p.phase)*.018;
      pose(heads,i*3,...local(0,head+nod,.015),.135,.18,.145,s.angle);
      pose(hair,i,...local(0,head+.10+nod,-.015),.14,.085+p.hairLength*.10,.15,s.angle);
      for(const side of [-1,1]){
        const j=side===-1?0:1,swing=p.action==='skate'?(j===0?.14:Math.min(.15,Math.sin(s.gait)*.4)):moving?Math.sin(s.gait+j*Math.PI)*.25:0;
        const speaking=p.action==='talk'&&Math.floor(time/5+p.phase)%(p.groupSize||3)===p.seat;
        const gesture=speaking?(Math.sin(time*2+p.phase)+1)*.11:p.action==='frisbee'?(Math.sin(time*.8+p.phase)+1)*.13:p.action==='groundskeeper'?.3:0;
        const shoulder=local(side*.22,chest+.13),elbow=local(side*.24,chest-.14,seated?.28:-swing*.45+gesture),hand=local(side*(.22+gesture),seated?hip+.24:chest-.36+gesture,seated?.48:-swing+gesture*1.5);
        limb(body,i*9+1+j*2,shoulder,elbow,.095);limb(body,i*9+2+j*2,elbow,hand,.075);pose(heads,i*3+1+j,...hand,.055,.08,.045,s.angle);
        const knee=local(side*.11,seated?hip-.02:.49,seated?.4:swing*.4),foot=local(side*.12,onLawn?.12:.13+Math.max(0,swing)*.22,seated?.5:swing);
        limb(body,i*9+5+j*2,local(side*.12,hip),knee,.145);limb(body,i*9+6+j*2,knee,foot,.105);pose(shoes,i*2+j,foot[0],foot[1]-.05,foot[2],.13,.10,.24,s.angle);
      }
      const backpack=p.backpack;
      pose(gear,i*2,...local(0,chest,-.19),backpack?.29:0,.36,.16,s.angle);
      const book=p.action==='study'||p.action==='lawn';
      if(p.action==='skate')pose(gear,i*2+1,...local(0,-.04,0),.27,.07,.78,s.angle);else if(p.action==='groundskeeper')pose(gear,i*2+1,...local(0,.22,.75),.65,.35,.8,s.angle);else pose(gear,i*2+1,...local(0,hip+.19,.49),book?.34:0,.035,.26,s.angle);
    });
    if(balls.count){const p=campusPose(people.find(p=>p.action==='basketball'),time);pose(balls,0,p.x+.42,.55+Math.abs(Math.sin(time*3.3))*1.05,p.z+.35,.19,.19,.19);}
    if(core){
      // The dog and its leash share the existing body/accessory instance buffers.
      const dog=campusPose(people.find(p=>p.action==='dogwalk'),time),a=dog.angle,local=(x,y,z)=>[dog.x+x*Math.cos(a)+z*Math.sin(a),y,dog.z-x*Math.sin(a)+z*Math.cos(a)];
      pose(body,n*9,...local(.85,.43,.5),.32,.35,.63,a);
      for(let j=0;j<4;j++){const x=.85+(j%2?-.12:.12),z=.5+(j<2?-.22:.22),swing=Math.sin(time*5+j*Math.PI/2)*.1;limb(body,n*9+1+j,local(x,.39,z),local(x,.08,z+swing),.08);}
      limb(body,n*9+5,local(.85,.5,.2),local(.85,.7,-.05),.07);
      limb(body,n*9+6,local(.22,.87,0),local(.85,.55,.8),.014);
      pose(gear,n*2,...local(.85,.57,.87),.25,.25,.3,a);pose(gear,n*2+1,...local(.73,.58,.81),.07,.27,.15,a);pose(gear,n*2+2,...local(.85,.56,1.04),.13,.1,.1,a);
      const flight=(Math.sin(time*.8)+1)/2;pose(balls,1,-48+flight*10,1.2+Math.sin(flight*Math.PI)*1.1,-19,.19,.035,.19);
    }
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
