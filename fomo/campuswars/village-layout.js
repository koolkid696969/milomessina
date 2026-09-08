import {hash,appearance} from './village-district-layout.js?v=22';
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
    const lot=LOTS[index],walkers=Math.floor(chapter.joined/20),standing=chapter.joined-walkers,porch=chapter.joined>=15&&standing>=9,sizes=[];
    let remaining=standing-(porch?2:0);
    while(remaining>0){let size=sizes.length===0&&remaining>=12?7:2+Math.floor(hash(chapter.id,sizes.length,'group-size')*4);size=Math.min(size,remaining);if(remaining-size===1)size++;sizes.push(size);remaining-=size;}
    if(porch)sizes.push(2);
    const groups=[],occupied=[];let member=0;
    sizes.forEach((size,g)=>{
      const isPorch=porch&&g===sizes.length-1,radius=isPorch?.57:.62+size*.105,phase=hash(chapter.id,g,'angle')*Math.PI*2;
      let best=null,bestScore=-Infinity;
      for(let attempt=0;attempt<(isPorch?1:250);attempt++){
        const gx=isPorch?2.05:(hash(chapter.id,g,attempt,'x')-.5)*(14.8-2*radius),gz=isPorch?5.05:6.5+radius+hash(chapter.id,g,attempt,'z')*(6.8-2*radius);
        const seats=Array.from({length:size},(_,seat)=>{const a=phase+seat*Math.PI*2/size,r=radius*(.92+hash(chapter.id,g,seat,'radius')*.16);return {x:gx+Math.sin(a)*r,z:gz+Math.cos(a)*r,a};});
        let clearance=3;for(const seat of seats)for(const other of occupied)clearance=Math.min(clearance,Math.hypot(seat.x-other.x,seat.z-other.z));
        const centerGap=groups.length?Math.min(...groups.map(other=>Math.hypot(other.x-gx,other.z-gz)-other.radius-radius)):2;
        const score=clearance*4+Math.max(-1,Math.min(.5,centerGap))*.3-(Math.abs(gx)<.7?.15:0);
        if(score>bestScore){bestScore=score;best={x:gx,z:gz,radius,seats};}
      }
      groups.push(best);occupied.push(...best.seats);
      for(let seat=0;seat<size;seat++){
        const pos=best.seats[seat],look=appearance(chapter.id,member),roofline=5.6+10*(1-Math.exp(-chapter.joined/50));
        best.seats[seat]={chapter:chapter.id,member:++member,...toWorld(lot,pos.x,pos.z),lot,rotation:lot.rotation+pos.a+Math.PI,phase:hash(chapter.id,member,'phase')*20,groupPhase:hash(chapter.id,g,'turn')*50,groupSize:size,seat,walking:false,ground:isPorch?.73*(roofline/10.22):0,...look};
      }
    });
    const people=groups.flatMap(group=>group.seats);
    for(let i=0;i<walkers;i++)people.push({chapter:chapter.id,member:++member,...toWorld(lot,0,9),lot,rotation:lot.rotation,phase:hash(chapter.id,member,'phase')*20,groupPhase:0,groupSize:1,seat:0,walking:true,walkPhase:i/walkers*Math.PI*2,ground:0,...appearance(chapter.id,member)});
    return people;
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
