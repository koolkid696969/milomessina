import {hash} from './village-district-layout.js?v=22';
// A single opaque floor carries all roads, grass, paths and paint. Its larger
// campus pattern includes pedestrian districts instead of one road per block.
export function createStreetNetwork(T){
  let map;
  if(typeof document!=='undefined'){
    const canvas=document.createElement('canvas');canvas.width=canvas.height=4096;
    const ctx=canvas.getContext('2d'),unit=canvas.width/300;ctx.scale(unit,unit);
    const rect=(color,x,z,w,d)=>{ctx.fillStyle=color;ctx.fillRect(x+150,150-z-d,w,d);};
    const circle=(color,x,z,r)=>{ctx.fillStyle=color;ctx.beginPath();ctx.arc(x+150,150-z,r,0,Math.PI*2);ctx.fill();};
    const line=(color,points,width)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();points.forEach(([x,z],i)=>i?ctx.lineTo(x+150,150-z):ctx.moveTo(x+150,150-z));ctx.stroke();};
    rect('#728068',-150,-150,300,300);
    // Muted, irregular lawn grain gives the ground scale without extra geometry.
    for(let i=0;i<16000;i++)rect(i%2?'#77846c':'#6d7b65',hash(i,'grass-x')*300-150,hash(i,'grass-z')*300-150,.14+hash(i,'blade-w')*.4,.12+hash(i,'blade-d')*.3);
    // Desire paths, damp patches and leaves are paint on the same opaque floor.
    for(const ox of [-100,0,100])for(const oz of [-100,0,100])for(const side of [-1,1]){
      line('#948e75',[[ox+side*10,oz+38],[ox+side*17,oz+32],[ox+side*24,oz+30]],.8);
      for(let i=0;i<45;i++){const a=hash(ox,oz,side,i)*Math.PI*2,r=hash(i,oz,'leaf')*3.8;circle(i%2?'#a79563':'#8e8056',ox+side*41+Math.cos(a)*r,oz+5+Math.sin(a)*r,.06+hash(i,ox)*.07);}
    }
    // North/south pedestrian campuses connect to a road around Greek Row.
    for(const z of [-100,100]){
      line('#c4c2b3',[[0,z+(z>0?-39:-7)],[0,z+40]],7.8);
      line('#c4c2b3',[[-40,z+34],[40,z+34]],3);
      if(z<0)line('#c4c2b3',[[-19,z],[19,z+27]],2.5);else line('#c4c2b3',[[-35,z-8],[35,z-8]],2.5);
    }
    // Paint all curbs first, then continuous asphalt so junction rings never
    // overwrite a through lane with a strip of sidewalk.
    for(const x of [-100,100])rect('#bfc0b5',x-9,-150,18,300);
    rect('#bfc0b5',-8.1,-50,16.2,100);
    for(const z of [-150,-50,50,150]){
      rect('#bfc0b5',-150,z-8.3,300,16.6);
      for(const x of [-100,100,...(Math.abs(z)===50?[0]:[])])circle('#bfc0b5',x,z,13);
    }
    for(const x of [-100,100])rect('#505a60',x-6,-150,12,300);
    rect('#505a60',-5.5,-50,11,100);
    for(const z of [-150,-50,50,150]){
      rect('#505a60',-150,z-5.5,300,11);
      for(const x of [-100,100,...(Math.abs(z)===50?[0]:[])])circle('#505a60',x,z,11.5);
    }
    // Worn wheel tracks and repaired asphalt stay clear of curb and bike paint.
    for(const ox of [-100,0,100])for(const side of [-1,1]){
      const end=ox===0?34:139;
      for(const track of [-.5,.5])line('#4b555b',[[ox+side*2.4+track,-end],[ox+side*2.4+track,end]],.22);
      for(let i=0;i<8;i++){const z=-end+hash(ox,side,i,'patch')*end*2;rect('#566066',ox+side*2.4-.45,z,.9,1.2+hash(i)*1.8);}
    }
    for(const ox of [-100,100])for(const oz of [-100,0,100])for(const side of [-1,1]){
      // Parallel parking bays outside the through lanes; matching the static cars.
      rect('#626a6c',ox+(side>0?15.5:-44.5),oz-41.4,29,3);
      for(let i=0;i<7;i++)rect('#9fa79e',ox+side*(15.5+i*4.8),oz-41.2,.08,2.6);
      for(let i=0;i<4;i++)rect('#485259',ox+side*5.7-.3,oz-29+i*18,.45,.7);
    }
    for(const side of [-1,1])rect('#626a6c',side*45-4.5,-40.5,9,7);
    for(const x of [-100,100]){
      for(let z=-144;z<146;z+=8){if(Math.abs(Math.abs(z)-50)<13||Math.abs(z)>139)continue;rect('#c5bea5',x-.09,z,.18,2.6);}
      for(const side of [-1,1])line('#a5b4a4',[[x+side*4.65,-137],[x+side*4.65,-63]],.09);
    }
    for(let z=-32;z<=32;z+=8)rect('#c5bea5',-.09,z,.18,2.6);
    for(const z of [-150,-50,50,150])for(let x=-140;x<145;x+=8){if(Math.abs(Math.abs(x)-100)<14||Math.abs(x)<14)continue;rect('#c5bea5',x,z-.09,2.6,.18);}
    // Crosswalks, bike lanes and small curb pullouts are part of the same paint.
    for(const x of [-100,0,100])for(const z of [-50,50]){
      for(let i=-4;i<=4;i+=1.5){rect('#d9d6c7',x+i,z+(z<0?13:-16),.7,3);}
      if(x!==0){rect('#505a60',x+6,z+18,2.5,12);rect('#c7c3b2',x+6,z+18,.1,12);}
    }
    for(const side of [-1,1])line('#a5b4a4',[[side*4.55,-34],[side*4.55,34]],.08);
    // Parking courts occur only behind academic blocks, not every house.
    for(const [x,z] of [[125,-8],[-125,8],[123,108],[-128,-109]]){
      rect('#626a6c',x-7,z-9,14,18);for(let row=0;row<5;row++)rect('#a5aaa3',x-6,z-8+row*3.7,4,.1);
    }
    // Small cracks, manholes, chalk and damp spots provide scale at street level.
    for(const ox of [-100,0,100])for(const z of [-27,25]){
      circle('#485259',ox+.6,z,.37);circle('#788083',ox+.6,z,.27);
      for(let i=0;i<3;i++)line('#485259',[[ox+.39,z-.15+i*.14],[ox+.8,z-.15+i*.14]],.025);
      line('#414c53',[[ox-.1,z-4],[ox+.14,z-3.7],[ox-.06,z-3.4]],.035);
      circle('#586567',ox+3.2,z+5,.4);
      for(let i=0;i<4;i++)rect('#e3d1ad',ox+6.6,z+i*.4,.5,.07);
    }
    map=new T.CanvasTexture(canvas);map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(200/3,200/3);map.offset.set(.5,.5);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;map.minFilter=T.LinearMipmapLinearFilter;map.magFilter=T.LinearFilter;
  }
  const material=new T.MeshLambertMaterial({color:map?0xffffff:0x728068,...(map?{map}:{}),transparent:false,alphaTest:0,depthWrite:true});
  const streets=new T.Mesh(new T.PlaneGeometry(20000,20000),material);streets.name='continuous-village-floor';streets.rotation.x=-Math.PI/2;streets.position.y=.045;streets.receiveShadow=true;return streets;
}
