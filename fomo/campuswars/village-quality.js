// Keep the full village within phone graphics and canvas memory budgets.
export function villageQuality(mobile=typeof matchMedia==='function'&&(matchMedia('(pointer: coarse)').matches||matchMedia('(max-width: 700px)').matches)){
  return mobile?{mobile:true,pixelRatio:1,antialias:false,shadowSize:512,bannerResolution:512,terrainResolution:2048}:{mobile:false,pixelRatio:2,antialias:true,shadowSize:2048,bannerResolution:2048,terrainResolution:4096};
}
