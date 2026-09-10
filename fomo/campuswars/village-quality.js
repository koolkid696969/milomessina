// Keep the full village within phone graphics and canvas memory budgets.
export function villageQuality(mobile=typeof matchMedia==='function'&&(matchMedia('(pointer: coarse)').matches||matchMedia('(max-width: 700px)').matches)){
  return mobile?{mobile:true,pixelRatio:2,minPixelRatio:1.5,antialias:true,shadowSize:1024,bannerResolution:1024,terrainResolution:2048}:{mobile:false,pixelRatio:2,minPixelRatio:1.25,antialias:true,shadowSize:2048,bannerResolution:2048,terrainResolution:4096};
}
