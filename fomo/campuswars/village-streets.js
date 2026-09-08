// Terrain, streets and paint share one opaque permanent floor. No alpha-cutout
// layer or second terrain plane can compete as the camera angle changes.
export function createStreetNetwork(THREE){
  let map;
  if(typeof document!=='undefined'){
    const canvas=document.createElement('canvas');canvas.width=canvas.height=2048;
    const ctx=canvas.getContext('2d'),unit=canvas.width/100;
    ctx.scale(unit,unit);
    const rect=(color,x,z,w,d)=>{ctx.fillStyle=color;ctx.fillRect(x,z,w,d);};
    // Opaque terrain avoids alpha-test/mipmap popping at oblique view angles.
    rect('#626c62',0,0,100,100);
    rect('#afb2ac',41.95,0,16.1,100);
    rect('#afb2ac',0,0,100,8.05);rect('#afb2ac',0,91.95,100,8.05);
    rect('#d1d0c3',44.3,0,.2,100);rect('#d1d0c3',55.5,0,.2,100);
    rect('#424954',44.5,0,11,100);
    rect('#424954',0,0,100,5.5);rect('#424954',0,94.5,100,5.5);
    // All markings are pixels in this same surface, rather than stacked meshes.
    for(let z=15;z<87;z+=9)rect('#cac1a8',49.91,z,.18,2.2);
    for(let x=10;x<94;x+=9){if(x>39&&x<60)continue;rect('#cac1a8',x,0,2.2,.12);rect('#cac1a8',x,99.88,2.2,.12);}
    for(let x=45.5;x<55;x+=1.5){rect('#d8d8ca',x,8.8,.7,2.5);rect('#d8d8ca',x,88.7,.7,2.5);}
    map=new THREE.CanvasTexture(canvas);map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(200,200);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=8;map.minFilter=THREE.LinearMipmapLinearFilter;map.magFilter=THREE.LinearFilter;
  }
  const material=new THREE.MeshLambertMaterial({color:map?0xffffff:0x626c62,...(map?{map}:{}),transparent:false,alphaTest:0,depthWrite:true});
  const streets=new THREE.Mesh(new THREE.PlaneGeometry(20000,20000),material);
  streets.name='continuous-village-floor';streets.rotation.x=-Math.PI/2;streets.position.y=.045;streets.receiveShadow=true;
  // UV 0.5 aligns the vertical road to world x=0, and cross streets to z=±50.
  if(map)map.offset.set(.5,.5);
  return streets;
}
