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
    const lot=LOTS[index];
    return Array.from({length:chapter.joined},(_,i)=>{
      const columns=Math.min(10,Math.ceil(Math.sqrt(chapter.joined*1.8)));
      const rows=Math.ceil(chapter.joined/columns),row=Math.floor(i/columns),col=i%columns;
      const rowSize=Math.min(columns,chapter.joined-row*columns);
      const x=(col-(rowSize-1)/2)*1.03+Math.sin(i*13+index)*.17;
      const z=7+(rows===1?2:row/(rows-1)*4.6)+Math.cos(i*7)*.16;
      return {chapter:chapter.id,member:i+1,...toWorld(lot,x,z),rotation:lot.rotation+Math.sin(i*5)*.8,phase:i*2.399+index,speed:1.8+(i%5)*.17,pose:i%4,shirt:i%8,skin:i%5};
    });
  });
}
export function movePlayer(position,dx,dz){return {x:Math.max(-12,Math.min(12,position.x+dx)),z:Math.max(-31,Math.min(31,position.z+dz))};}
