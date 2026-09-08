export const BLOCK=100;
export const mod=(n,d)=>((n%d)+d)%d;
export function districtAt(x,z){return {x:Math.floor((x+50)/BLOCK),z:Math.floor((z+50)/BLOCK)};}
export function districtKind(cx,cz){
  if(cx===0&&cz===0)return 'greek';
  const x=mod(cx+1,3)-1,z=mod(cz+1,3)-1;
  if(x===0)return z<0?'library':z>0?'athletics':'commons';
  if(z===0)return x<0?'arts':'science';
  return x===z?'residential':'town';
}
export function districtSpecs(cx,cz){
  const kind=districtKind(cx,cz),seed=mod(cx*73+cz*137,29),ox=cx*BLOCK,oz=cz*BLOCK;
  const specs=[];
  const add=(type,x,z,width,depth,height,rotation=0,label='')=>specs.push({type,x:ox+x,z:oz+z,width,depth,height,rotation,label,seed});
  if(kind==='greek')return specs;
  if(kind==='library'||kind==='commons'){
    add('library',0,-20,36,19,12,0,'UNIVERSITY LIBRARY');
    add('hall',-31,5,17,29,8,Math.PI/2,'HUMANITIES');
    add('hall',32,-7,18,25,9,-Math.PI/2,'');
  }else if(kind==='athletics'){
    add('gym',-23,18,34,26,10,Math.PI,'RECREATION CENTER');
    add('residence',26,20,29,22,15,Math.PI,'STUDENT RESIDENCES');
  }else if(kind==='science'){
    add('science',-27,-9,31,24,13,Math.PI/2,'SCIENCE & ENGINEERING');
    add('union',28,17,28,25,8,-Math.PI/2,'STUDENT UNION');
    add('hall',29,-27,23,15,7,0,'');
  }else if(kind==='arts'){
    add('arts',27,-12,30,24,10,-Math.PI/2,'SCHOOL OF THE ARTS');
    add('hall',-28,17,27,22,10,Math.PI/2,'LECTURE HALL');
    add('shops',-28,-28,25,12,5,0,'BOOKS / RECORDS');
  }else if(kind==='residential'){
    add('residence',-27,-14,27,34,12+seed%3,Math.PI/2,'RESIDENCE HALL');
    add('hall',27,19,23,23,8,-Math.PI/2,'');
    add('townhouse',28,-24,22,13,7+seed%2,0,'');
  }else{
    add('shops',-27,-24,28,14,5+seed%3,Math.PI/2,'CAMPUS MARKET');
    add('townhouse',27,-18,27,19,8,-Math.PI/2,'');
    add('union',-27,22,29,20,7,Math.PI/2,'STUDENT SERVICES');
    add('hall',29,24,21,17,9,-Math.PI/2,'');
  }
  return specs;
}
// Positive-length rounded loops are shared by the road paint and traffic.
export function roundedLoop(x0,z0,x1,z1,r=7){
  const w=x1-x0,d=z1-z0,straightX=w-2*r,straightZ=d-2*r,arc=Math.PI*r/2;
  const lengths=[straightX,arc,straightZ,arc,straightX,arc,straightZ,arc],length=lengths.reduce((a,b)=>a+b,0);
  return {length,sample(distance){
    let u=mod(distance,length),segment=0;
    while(u>lengths[segment]&&segment<7)u-=lengths[segment++];
    if(segment===0)return {x:x0+r+u,z:z0,angle:Math.PI/2};
    if(segment===2)return {x:x1,z:z0+r+u,angle:0};
    if(segment===4)return {x:x1-r-u,z:z1,angle:-Math.PI/2};
    if(segment===6)return {x:x0,z:z1-r-u,angle:Math.PI};
    const corners={1:[x1-r,z0+r,-Math.PI/2],3:[x1-r,z1-r,0],5:[x0+r,z1-r,Math.PI/2],7:[x0+r,z0+r,Math.PI]};
    const [cx,cz,start]=corners[segment],a=start+u/r;
    return {x:cx+Math.cos(a)*r,z:cz+Math.sin(a)*r,angle:-a};
  }};
}
