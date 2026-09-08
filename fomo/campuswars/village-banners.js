// Membership is printed on cloth fixed to each porch, in the house's local space.
export function createChapterBanner(THREE,chapter,width){
  const height=2.55;
  let map;
  if(typeof document!=='undefined'){
    const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=640;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='#25284f';ctx.fillRect(0,0,1536,640);
    ctx.strokeStyle='#9ba5ff';ctx.lineWidth=5;ctx.strokeRect(26,26,1484,588);
    ctx.fillStyle='#f5f3ff';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.font='bold 94px Arial, sans-serif';ctx.fillText(chapter.name.toUpperCase(),768,146,1390);
    ctx.fillStyle='#c4caff';ctx.font='bold 210px Arial, sans-serif';ctx.fillText(`${chapter.joined} / ${chapter.active}`,768,356,1370);
    ctx.fillStyle='#f5f3ff';ctx.font='bold 54px Arial, sans-serif';ctx.fillText('MEMBERS IN',768,522);
    map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=8;
  }
  const geometry=new THREE.PlaneGeometry(width,height,32,12);
  const positions=geometry.attributes.position;
  for(let i=0;i<positions.count;i++){
    const x=positions.getX(i),y=positions.getY(i),drop=(height/2-y)/height;
    // Taut top hem, a little weight in the middle, and shallow cloth folds.
    positions.setY(i,y-.08*Math.cos(x/width*Math.PI)*drop);
    positions.setZ(i,.04*Math.sin(x/width*Math.PI*8)*drop+.07*Math.sin(drop*Math.PI));
  }
  geometry.computeVertexNormals();
  const banner=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:map?0xffffff:0x25284f,...(map?{map}:{}),roughness:1,side:THREE.DoubleSide}));
  banner.name=`chapter-banner-${chapter.id}`;banner.userData={chapter:chapter.id,name:chapter.name,joined:chapter.joined,active:chapter.active};
  return banner;
}
