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
    for(let i=0;i<16000;i++)rect(i%2?'#77846c':'#6d7b65',((i*73.139)%300)-150,((i*151.721)%300)-150,.14+(i%4)*.11,.12+(i%3)*.12);
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
    map=new T.CanvasTexture(canvas);map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(200/3,200/3);map.offset.set(.5,.5);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;map.minFilter=T.LinearMipmapLinearFilter;map.magFilter=T.LinearFilter;
  }
  const material=new T.MeshLambertMaterial({color:map?0xffffff:0x728068,...(map?{map}:{}),transparent:false,alphaTest:0,depthWrite:true});
  const streets=new T.Mesh(new T.PlaneGeometry(20000,20000),material);streets.name='continuous-village-floor';streets.rotation.x=-Math.PI/2;streets.position.y=.045;streets.receiveShadow=true;return streets;
}
