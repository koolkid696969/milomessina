import {INTRO_PACE} from './village-intro.js?v=42';
import {createCloudTexture,createBanknoteTexture} from './village-money-art.js?v=42';
import {houseStandings} from './village-competition.js?v=54';

export const MONEY_START=7.3*INTRO_PACE;
export const MONEY_END=12*INTRO_PACE;
const smooth=value=>{const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t);};
const seed=(index,salt)=>{const value=Math.sin(index*127.1+salt*311.7)*43758.5453;return value-Math.floor(value);};

// Use the same onboarding ranks as the roof badges. Ties receive equal rain.
export function moneyRecipients(chapters,anchors){
  const byId=new Map(anchors.map(anchor=>[anchor.id,anchor]));
  return houseStandings(chapters).filter(row=>row.joined>=15&&byId.has(row.id)).map(row=>{
    const anchor=byId.get(row.id);
    return {id:row.id,rank:row.rank,count:Math.max(8,Math.round(112/Math.pow(row.rank,.8))),x:anchor.lot.x,z:anchor.lot.z,roof:anchor.point.y-1};
  });
}

export function createMoneyRain(T,chapters,anchors){
  const root=new T.Group();root.name='intro-money-rain';root.visible=false;
  const cloudGeometry=new T.PlaneGeometry(1,1),billGeometry=new T.PlaneGeometry(1.4,.61,12,4);
  const vertices=billGeometry.attributes.position;
  for(let i=0;i<vertices.count;i++){const x=vertices.getX(i),y=vertices.getY(i);vertices.setZ(i,.08*Math.sin(x*3.8)+.045*Math.cos(y*7+x*2));}
  billGeometry.computeVertexNormals();
  const cloudTexture=createCloudTexture(T),texture=createBanknoteTexture(T),flutter={value:0};
  const cloudMaterial=new T.MeshBasicMaterial({map:cloudTexture,color:0xe4e9ef,transparent:true,opacity:0,depthWrite:false,alphaTest:.015});
  // Each soft puff faces the lens while its center remains anchored in the 3D cloud bank.
  cloudMaterial.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`
    vec4 cloudCenter = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    vec2 cloudScale = vec2(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz));
    vec4 mvPosition = cloudCenter + vec4(position.xy * cloudScale, 0.0, 0.0);
    gl_Position = projectionMatrix * mvPosition;
  `);};
  const billMaterial=new T.MeshStandardMaterial({map:texture,color:texture?0xffffff:0xc5c8a6,roughness:.96,metalness:0,emissive:0xffffff,emissiveMap:texture,emissiveIntensity:.24,side:T.DoubleSide,transparent:true,opacity:0,depthWrite:false});
  billMaterial.onBeforeCompile=shader=>{
    shader.uniforms.uFlutter=flutter;
    shader.vertexShader='uniform float uFlutter;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      float phase = instanceMatrix[3].x * 1.7 + instanceMatrix[3].z * 2.3;
      transformed.z += .045 * sin(position.x * 5.0 + uFlutter * 3.8 + phase) * abs(position.x);
    `);
  };
  const dummy=new T.Object3D();
  let recipients=[],clouds=null,bills=null,lastTime=null;
  function releaseInstances(){for(const mesh of [clouds,bills])if(mesh){root.remove(mesh);mesh.dispose();}clouds=bills=null;}
  function setChapters(nextChapters,nextAnchors){
    releaseInstances();recipients=moneyRecipients(nextChapters,nextAnchors);lastTime=null;
    if(!recipients.length){root.visible=false;return;}
    clouds=new T.InstancedMesh(cloudGeometry,cloudMaterial,recipients.length*16);clouds.name='rising-money-clouds';
    bills=new T.InstancedMesh(billGeometry,billMaterial,recipients.reduce((sum,row)=>sum+row.count,0));bills.name='rank-weighted-money';
    for(const mesh of [clouds,bills]){mesh.frustumCulled=false;mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);root.add(mesh);}
    root.visible=false;
  }
  function update(seconds,night=0){
    if(seconds===lastTime)return;lastTime=seconds;
    root.visible=recipients.length>0&&seconds>MONEY_START&&seconds<MONEY_END;
    if(!root.visible)return;
    const time=seconds-MONEY_START,rise=smooth(time/.65),fade=1-smooth((seconds-(MONEY_END-.7))/.7);
    cloudMaterial.opacity=rise*fade*.88;cloudMaterial.color.setRGB(1-night*.3,1-night*.27,1-night*.22);billMaterial.opacity=fade;flutter.value=time;
    let cloudIndex=0,billIndex=0;
    for(const row of recipients){
      for(let i=0;i<16;i++){
        const x=(seed(i,21)-.5)*7,z=(seed(i,22)-.5)*6,y=seed(i,23)*2.6;
        dummy.position.set(row.x+x+Math.sin(time*.4+i)*.15,row.roof+5+rise*9+y,row.z+z);
        dummy.rotation.set(0,0,0);dummy.scale.set((5+seed(i,24)*4)*rise,(3.5+seed(i,25)*3)*rise,1);dummy.updateMatrix();clouds.setMatrixAt(cloudIndex++,dummy.matrix);
      }
      for(let i=0;i<row.count;i++){
        const delay=i/row.count*1.5,clock=time-.45-delay,fall=2.7+seed(i,5)*.7;
        const age=Math.max(0,clock)%fall,progress=age/fall;
        const x=(seed(i,6)-.5)*7.6,z=(seed(i,7)-.5)*7.6;
        dummy.position.set(row.x+x+Math.sin(age*2.3+seed(i,8)*6)*1.1,row.roof+12.5-Math.pow(progress,1.13)*11.5,row.z+z+Math.cos(age*1.7+seed(i,9)*6)*.8);
        dummy.rotation.set(-Math.PI/2+Math.sin(age*3.5+i)*.5,age*.55+seed(i,11)*6,Math.sin(age*2.6+i)*.3);
        const size=clock<0?0:(.85+seed(i,12)*.3)*smooth(progress/.08)*(1-smooth((progress-.86)/.14));
        dummy.scale.setScalar(size);dummy.updateMatrix();bills.setMatrixAt(billIndex++,dummy.matrix);
      }
    }
    clouds.instanceMatrix.needsUpdate=true;bills.instanceMatrix.needsUpdate=true;
  }
  function clear(){root.visible=false;lastTime=null;}
  function dispose(){releaseInstances();cloudGeometry.dispose();billGeometry.dispose();cloudMaterial.dispose();billMaterial.dispose();texture?.dispose();cloudTexture?.dispose();root.visible=false;}
  setChapters(chapters,anchors);
  return {root,setChapters,update,clear,dispose,get recipients(){return recipients;}};
}
