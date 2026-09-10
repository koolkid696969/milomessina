import {hash,appearance,roundedLoop} from './village-district-layout.js?v=22';
import {gaitPhase,speechGesture,smooth} from './village-human-motion.js?v=48';
import {constructionAssignment,constructionActivity} from './village-construction-layout.js?v=51';
const lawnRoute=roundedLoop(-7.9,7,7.9,14.4,1.15);
// Ease over the low lawn/path edges; the walking loop clears the porch steps.
export function lawnGround(x,z){const edge=smooth((12-z)/.25);return .045+.085*smooth((7.5-Math.abs(x))/.25)*edge+.07*smooth((.825-Math.abs(x))/.2)*edge;}
export const LOTS = [
  {x:-20,z:-19,rotation:Math.PI/2,style:0},
  {x:20,z:-19,rotation:-Math.PI/2,style:1},
  {x:-20,z:0,rotation:Math.PI/2,style:2},
  {x:20,z:0,rotation:-Math.PI/2,style:3},
  {x:-20,z:19,rotation:Math.PI/2,style:4},
  {x:20,z:19,rotation:-Math.PI/2,style:5}
];
export function createLots(chapterCount) {
  if (!Number.isSafeInteger(chapterCount) || chapterCount < 0) throw new RangeError('Invalid chapter count');
  return Array.from({length:chapterCount+1},(_,i)=>({x:i%2?20:-20,z:-19+Math.floor(i/2)*19,rotation:i%2?-Math.PI/2:Math.PI/2,style:i%5}));
}
export function rowExtension(chapterCount) {return Math.max(0,Math.ceil((chapterCount+1)/2)-3)*19;}
export function toWorld(lot,x,z){return {x:lot.x+x*Math.cos(lot.rotation)+z*Math.sin(lot.rotation),z:lot.z-x*Math.sin(lot.rotation)+z*Math.cos(lot.rotation)};}
export const PONG_TABLE={x:3.8,z:9.8,width:1.25,length:2.6,height:.86,playerDistance:2.05};
export function motionProfile(chapter,member){
  const value=(key,min,range)=>min+hash(chapter,member,key)*range;
  return {breathRate:value('breath-rate',1.05,1.05),breathAmount:value('breath-range',.002,.005),shiftRate:value('shift-rate',.21,.37),shiftAmount:value('shift-range',.014,.03),twistRate:value('twist-rate',.31,.51),twistAmount:value('twist-range',.012,.023),nodRate:value('nod-rate',.5,.8),nodAmount:value('nod-range',.002,.005),lookRate:value('look-rate',.27,.53),lookAmount:value('look-range',.025,.065),idlePeriod:value('idle-period',7,12),idleOffset:value('idle-offset',0,30),idleAmount:value('idle-range',.035,.085),gestureRate:value('gesture-rate',.65,.8),gestureAmount:value('gesture-range',.55,.6),walkSpeed:value('walk-speed',.59,.28)};
}
export function pongTurn(chapter,time){
  const period=3.8+hash(chapter,'pong-period')*2.1,clock=time+hash(chapter,'pong-offset')*19,turn=Math.floor(clock/period);
  return {seat:((turn%2)+2)%2,elapsed:clock-turn*period,release:1.15,flight:.85,turn};
}
export function crowdMembers(chapters,lots=createLots(chapters.length)){
  return chapters.flatMap((chapter,index)=>{
    if(!Number.isSafeInteger(chapter.joined)||chapter.joined<0)throw new RangeError('Invalid member count');
    if(chapter.joined<15)return Array.from({length:chapter.joined},(_,workerIndex)=>{
      const construction=constructionAssignment(chapter,workerIndex),member=workerIndex+1,lot=lots[index];
      const person={...appearance(chapter.id,member),chapter:chapter.id,member,lot,construction,
        action:'build',walking:false,phase:hash(chapter.id,member,'phase')*20,ground:.13,
        backpack:false,jacket:false,shorts:false,motionProfile:motionProfile(chapter.id,member)};
      const pose=constructionActivity(person,0);return {...person,x:pose.x,z:pose.z,rotation:pose.rotation};
    });
    const lot=lots[index],walkers=Math.floor(chapter.joined/20),standing=chapter.joined-walkers,pong=chapter.joined>=15,porch=chapter.joined>=15&&standing>=9,sizes=[];
    let remaining=standing-(porch?2:0)-(pong?2:0);
    while(remaining>0){let size=sizes.length===0&&remaining>=12?7:2+Math.floor(hash(chapter.id,sizes.length,'group-size')*4);size=Math.min(size,remaining);if(remaining-size===1)size++;sizes.push(size);remaining-=size;}
    if(porch)sizes.push(2);
    const groups=[],occupied=[];let member=0;
    if(pong){
      // Reserve the table and both players before placing conversation groups.
      for(let x=-.8;x<=.81;x+=.4)for(let z=-1.5;z<=1.51;z+=.3)occupied.push({x:PONG_TABLE.x+x,z:PONG_TABLE.z+z});
      for(const side of [-1,1])occupied.push({x:PONG_TABLE.x,z:PONG_TABLE.z+side*PONG_TABLE.playerDistance});
    }
    sizes.forEach((size,g)=>{
      const isPorch=porch&&g===sizes.length-1,radius=isPorch?.57:.62+size*.105,phase=hash(chapter.id,g,'angle')*Math.PI*2;
      let best=null,bestScore=-Infinity;
      for(let attempt=0;attempt<(isPorch?1:250);attempt++){
        const gx=isPorch?2.05:(hash(chapter.id,g,attempt,'x')-.5)*(14.4-2*radius),gz=isPorch?5.05:7.7+radius+hash(chapter.id,g,attempt,'z')*(5.6-2*radius);
        const seats=Array.from({length:size},(_,seat)=>{const a=phase+seat*Math.PI*2/size,r=radius*(.92+hash(chapter.id,g,seat,'radius')*.16);return {x:gx+Math.sin(a)*r,z:gz+Math.cos(a)*r,a};});
        let clearance=3;for(const seat of seats)for(const other of occupied)clearance=Math.min(clearance,Math.hypot(seat.x-other.x,seat.z-other.z));
        const centerGap=groups.length?Math.min(...groups.map(other=>Math.hypot(other.x-gx,other.z-gz)-other.radius-radius)):2;
        const score=clearance*4+Math.max(-1,Math.min(.5,centerGap))*.3-(Math.abs(gx)<.7?.15:0);
        if(score>bestScore){bestScore=score;best={x:gx,z:gz,radius,seats};}
      }
      groups.push(best);occupied.push(...best.seats);
      for(let seat=0;seat<size;seat++){
        const pos=best.seats[seat],look=appearance(chapter.id,member),roofline=5.6+10*(1-Math.exp(-chapter.joined/50));
        best.seats[seat]={chapter:chapter.id,member:++member,...toWorld(lot,pos.x,pos.z),lot,rotation:lot.rotation+pos.a+Math.PI,phase:hash(chapter.id,member,'phase')*20,groupPhase:hash(chapter.id,g,'turn')*50,turnDuration:4.2+hash(chapter.id,g,'turn-duration')*4.2,groupSize:size,seat,walking:false,ground:isPorch?.73*(roofline/10.22):lawnGround(pos.x,pos.z),...look};
      }
    });
    const people=groups.flatMap(group=>group.seats);
    for(let i=0;i<walkers;i++)people.push({chapter:chapter.id,member:++member,...toWorld(lot,0,9),lot,rotation:lot.rotation,phase:hash(chapter.id,member,'phase')*20,groupPhase:0,groupSize:1,seat:0,walking:true,walkPhase:i/walkers*Math.PI*2,ground:0,...appearance(chapter.id,member)});
    if(pong)for(let seat=0;seat<2;seat++){
      const z=PONG_TABLE.z+(seat?1:-1)*PONG_TABLE.playerDistance;
      people.push({chapter:chapter.id,member:++member,...toWorld(lot,PONG_TABLE.x,z),lot,rotation:lot.rotation+(seat?Math.PI:0),phase:hash(chapter.id,member,'phase')*20,groupPhase:-1,groupSize:2,seat,walking:false,action:'pong',ground:lawnGround(PONG_TABLE.x,z),...appearance(chapter.id,member)});
    }
    for(const person of people)person.motionProfile=motionProfile(person.chapter,person.member);
    return people;
  });
}
export function activityPose(member,time){
  if(member.action==='build')return constructionActivity(member,time);
  if(member.walking){
    const distance=time*(member.motionProfile?.walkSpeed??.76)+member.walkPhase/(Math.PI*2)*lawnRoute.length,s=lawnRoute.sample(distance),ahead=lawnRoute.sample(distance+.24);
    const look=Math.atan2(Math.sin(ahead.angle-s.angle),Math.cos(ahead.angle-s.angle))*.45;
    return {...toWorld(member.lot,s.x,s.z),rotation:member.lot.rotation+s.angle,walking:true,ground:lawnGround(s.x,s.z),gait:gaitPhase(distance,member),look,speaking:false,gesture:0,breath:Math.sin(time*2+member.phase)*.007};
  }
  if(member.action==='pong'){
    const shot=pongTurn(member.chapter,time),active=shot.seat===member.seat,t=shot.elapsed;
    return {x:member.x,z:member.z,rotation:member.rotation,walking:false,gait:0,speaking:false,gesture:0,breath:0,pong:{lift:active?smooth(t/.65)*(1-smooth((t-1.5)/.8)):.18*smooth((t-1.8)/.3)*(1-smooth((t-2.3)/.5)),extension:smooth((t-.72)/.43)}};
  }
  const profile=member.motionProfile,turn=(time+member.groupPhase)/(member.turnDuration??6),speaking=Math.floor(turn)%member.groupSize===member.seat;
  // The speaking hand rises only to chest level; listeners keep their arms down.
  return {x:member.x,z:member.z,rotation:member.rotation+Math.sin(time*(profile?.lookRate??.47)+member.phase)*(profile?.lookAmount??.055),walking:false,gait:0,speaking,gesture:speaking?speechGesture(turn,time*(profile?.gestureRate??1),member.phase)*(profile?.gestureAmount??1):0,breath:Math.sin(time*(profile?.breathRate??1.7)+member.phase)*(profile?.breathAmount??.008)};
}
