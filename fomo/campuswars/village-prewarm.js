import {MONEY_START} from './village-money-rain.js?v=62';

// Prepare both light-count variants and upload effect geometry/textures while
// the loading cover is still up. Use the real canvas so output/tone-mapping
// shader variants match playback; a one-pixel scissor limits fragment work.
export async function prewarmVillage(T,renderer,scene,camera,applyLighting,moneyRain,{mobile=false}={}){
  // Upload only the visible daytime scene on phones. Warming every offscreen
  // banner and both lighting variants together can exhaust Safari's GPU memory.
  if(mobile){
    applyLighting(0);moneyRain.clear();
    renderer.render(scene,camera);
    return;
  }
  const scissor=renderer.getScissor(new T.Vector4()),scissorTest=renderer.getScissorTest();
  const culled=new Map();
  scene.traverse(object=>{
    if(object.isMesh||object.isSprite||object.isPoints){culled.set(object,object.frustumCulled);object.frustumCulled=false;}
  });
  renderer.setScissor(0,0,1,1);renderer.setScissorTest(true);
  try{
    for(const night of [1,0]){
      applyLighting(night);moneyRain.update(MONEY_START+1,night);
      await renderer.compileAsync(scene,camera);
      // Compilation alone does not upload textures, instance buffers, or
      // prepare shadow and double-sided transparent draw variants.
      renderer.render(scene,camera);
    }
  }finally{
    applyLighting(0);moneyRain.clear();
    for(const [object,frustumCulled] of culled)object.frustumCulled=frustumCulled;
    renderer.setScissor(scissor);renderer.setScissorTest(scissorTest);
    renderer.shadowMap.needsUpdate=true;
  }
}
