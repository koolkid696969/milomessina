export const BLOCK=100;
export function districtSpecs(cx,cz){
  if(cx===0&&cz===0)return [];
  const result=[];
  for(const side of [-1,1])for(let row=-1;row<=1;row++){
    // Every fourth block has a shared quad instead of two extra houses.
    if(row===0&&((cx+cz)%4===0))continue;
    const seed=Math.abs(cx*71+cz*37+side*11+row*17);
    result.push({x:cx*BLOCK+side*23,z:cz*BLOCK+row*29,rotation:-side*Math.PI/2,width:10+seed%4,depth:7+seed%3,height:6.4+seed%4,variant:seed%5});
  }
  return result;
}
export function districtAt(x,z){return {x:Math.floor((x+50)/BLOCK),z:Math.floor((z+50)/BLOCK)};}
