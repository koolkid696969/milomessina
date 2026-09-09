// The tour and captions share visible elapsed time, even on slower devices.
export const INTRO_DURATION = 5;
export const openingView = {target:[1.808,2,-8.101],theta:2.956047,phi:.224457,radius:46.627674};
export const introStages = [
  {start:0,end:1.5,label:'01 / THE COMPETITION',title:'Greek Wars.',description:'Your chapter’s trading competition on fomo.'},
  {start:1.5,end:3.2,label:'02 / BUILD YOUR HOUSE',title:'Bring your people.',description:'15 members build a house. 80% onboard to qualify.'},
  {start:3.2,end:5,label:'03 / MAKE YOUR MOVE',title:'$500,000 committed.',description:'Rally your chapter. Compete for rewards.'}
];
const stops = [
  {time:0,target:[0,3,4],theta:2.65,phi:.76,radius:112},
  {time:1.5,target:[5,3,0],theta:2.8,phi:.55,radius:78},
  {time:3.2,target:[0,3,-8],theta:2.9,phi:.36,radius:58},
  {time:5,...openingView}
];
export function introViewAt(seconds) {
  const time=Math.max(0,Math.min(INTRO_DURATION,seconds));
  const index=stops.findIndex((stop,i)=>i<stops.length-1&&time<=stops[i+1].time);
  const a=stops[index],b=stops[index+1],t=(time-a.time)/(b.time-a.time),ease=t*t*(3-2*t);
  const mix=(x,y)=>x+(y-x)*ease;
  return {target:a.target.map((v,i)=>mix(v,b.target[i])),theta:mix(a.theta,b.theta),phi:mix(a.phi,b.phi),radius:mix(a.radius,b.radius)};
}
export function introCaptionAt(seconds) {
  const index=seconds<1.5?0:seconds<3.2?1:2;
  const stage=introStages[index];
  return {index,...stage,opacity:Math.min(1,Math.max(0,(INTRO_DURATION-seconds)/.35)),progress:introStages.map(s=>Math.max(0,Math.min(1,(seconds-s.start)/(s.end-s.start))))};
}
