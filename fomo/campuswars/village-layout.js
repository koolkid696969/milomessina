import {isWalkable} from './village-district-layout.js';
export const LOTS = [
  {x:-20,z:-19,rotation:Math.PI/2,style:0},
  {x:20,z:-19,rotation:-Math.PI/2,style:1},
  {x:-20,z:0,rotation:Math.PI/2,style:2},
  {x:20,z:0,rotation:-Math.PI/2,style:3},
  {x:-20,z:19,rotation:Math.PI/2,style:4},
  {x:20,z:19,rotation:-Math.PI/2,style:5}
];
export function toWorld(lot,x,z){return {x:lot.x+x*Math.cos(lot.rotation)+z*Math.sin(lot.rotation),z:lot.z-x*Math.sin(lot.rotation)+z*Math.cos(lot.rotation)};}
export function crowdMembers(chapters){
  return chapters.flatMap((chapter,index)=>{
    if(!Number.isSafeInteger(chapter.joined)||chapter.joined<0)throw new RangeError('Invalid member count');
    const lot=LOTS[index],walkers=Math.floor(chapter.joined/20),standing=chapter.joined-walkers,groups=Math.ceil(standing/4),columns=Math.min(5,Math.ceil(Math.sqrt(groups*1.5))),rows=Math.ceil(groups/columns);
    const sizes=Array.from({length:groups},(_,g)=>Math.floor(standing/groups)+(g<standing%groups?1:0));
    const starts=sizes.map((_,g)=>sizes.slice(0,g).reduce((a,b)=>a+b,0));
    return Array.from({length:chapter.joined},(_,i)=>{
      const walking=i>=standing,group=walking?0:starts.findIndex((start,g)=>i<start+sizes[g]),seat=walking?0:i-starts[group],size=sizes[group]||1,angle=seat/Math.max(1,size)*Math.PI*2+group*.71;
      const gx=((group%columns)-(columns-1)/2)*2.4+Math.sin(group*3)*.12,gz=7.4+(rows===1?1.5:Math.floor(group/columns)/(rows-1)*3.4);
      const localX=gx+Math.sin(angle)*.66,localZ=gz+Math.cos(angle)*.66;
      return {chapter:chapter.id,member:i+1,...toWorld(lot,localX,localZ),lot,rotation:lot.rotation+angle+Math.PI,phase:i*2.399+index,groupPhase:group*1.7,groupSize:size,seat,walking,walkPhase:walkers?(i-standing)/walkers*Math.PI*2:0,shirt:i%8,skin:i%5};
    });
  });
}
export function activityPose(member,time){
  if(member.walking){
    const a=time*.12+member.walkPhase,localX=Math.sin(a)*6.3,localZ=9.3+Math.cos(a)*3.5;
    return {...toWorld(member.lot,localX,localZ),rotation:member.lot.rotation+Math.atan2(Math.cos(a)*6.3,-Math.sin(a)*3.5),walking:true,gait:time*4+member.phase,speaking:false,gesture:0,breath:Math.sin(time*2+member.phase)*.007};
  }
  const turn=(time+member.groupPhase)/6,speaking=Math.floor(turn)%member.groupSize===member.seat;
  // The speaking hand rises only to chest level; listeners keep their arms down.
  return {x:member.x,z:member.z,rotation:member.rotation+Math.sin(time*.47+member.phase)*.055,walking:false,gait:0,speaking,gesture:speaking?Math.sin((turn%1)*Math.PI)*(.5+.2*Math.sin(time*2.1+member.phase)):0,breath:Math.sin(time*1.7+member.phase)*.008};
}
export function movePlayer(position,dx,dz){
  let x=position.x,z=position.z;const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.45));
  for(let i=0;i<steps;i++){if(isWalkable(x+dx/steps,z))x+=dx/steps;if(isWalkable(x,z+dz/steps))z+=dz/steps;}
  return {x,z};
}
// Local grid routing lets a tap take the visitor around buildings, not into walls.
export function walkRoute(start,end){
  const grid=2.5,key=(x,z)=>`${x},${z}`,sx=Math.round(start.x/grid),sz=Math.round(start.z/grid),ex=Math.round(end.x/grid),ez=Math.round(end.z/grid);
  if(!isWalkable(end.x,end.z)||Math.hypot(end.x-start.x,end.z-start.z)>300)return [];
  const open=[{x:sx,z:sz,g:0,f:0}],best=new Map([[key(sx,sz),0]]),parent=new Map();let found;
  for(let iteration=0;open.length&&iteration<16000;iteration++){
    let at=0;for(let i=1;i<open.length;i++)if(open[i].f<open[at].f)at=i;
    const node=open.splice(at,1)[0],id=key(node.x,node.z);if(node.g!==best.get(id))continue;
    if(node.x===ex&&node.z===ez){found=id;break;}
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const x=node.x+dx,z=node.z+dz,g=node.g+1,next=key(x,z);
      if(!isWalkable(x*grid,z*grid)||!isWalkable((node.x+x)*grid/2,(node.z+z)*grid/2)||g>=(best.get(next)??Infinity))continue;
      best.set(next,g);parent.set(next,id);open.push({x,z,g,f:g+Math.abs(x-ex)+Math.abs(z-ez)});
    }
  }
  if(!found)return [];
  const path=[end];let current=found;
  while(parent.has(current)){const [x,z]=current.split(',').map(Number);path.push({x:x*grid,z:z*grid});current=parent.get(current);}
  return path.reverse();
}
