import {createClothBanner} from './village-banners.js?v=47';

// Official logo files and palette provenance: school-banner-references.md.
const identities=[
  {key:'sdsu',aliases:['san diego state university','san diego state','sdsu'],primary:'#D41736',secondary:'#000000',lines:['SAN DIEGO','STATE UNIVERSITY'],logo:'sdsu.png',design:'split'},
  {key:'coastal',aliases:['coastal carolina university','coastal carolina','ccu'],primary:'#006F71',secondary:'#A27752',lines:['COASTAL CAROLINA','UNIVERSITY'],logo:'coastal.png',design:'border'},
  {key:'tampa',aliases:['university of tampa','the university of tampa','tampa','utampa'],primary:'#C8102E',secondary:'#000000',lines:['UNIVERSITY','OF TAMPA'],logo:'tampa.svg',design:'stripe'},
  {key:'vt',aliases:['virginia tech','virginia polytechnic institute and state university','vt'],primary:'#861F41',secondary:'#E87722',lines:['VIRGINIA','TECH'],logo:'vt.svg',design:'split'},
  {key:'fiu',aliases:['florida international university','florida international','fiu'],primary:'#081E3F',secondary:'#D1A644',lines:['FLORIDA INTERNATIONAL','UNIVERSITY'],logo:'fiu.svg',design:'border'}
];
const normalize=value=>String(value||'').trim().toLowerCase().replace(/\s+/g,' ');
export function schoolIdentity(chapter){
  const names=[normalize(chapter.school),normalize(chapter.shortSchool)];
  return identities.find(school=>school.aliases.some(alias=>names.includes(alias)))||{key:'unknown',primary:'#303849',secondary:'#C6BD9F',lines:[chapter.school||chapter.shortSchool||'UNIVERSITY'],logo:null,design:'border'};
}
const logos=new Map();
export function loadSchoolLogo(identity){
  if(!identity.logo||typeof Image==='undefined')return Promise.resolve(null);
  if(!logos.has(identity.logo))logos.set(identity.logo,new Promise(resolve=>{
    const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>resolve(null);
    image.src=new URL(`./assets/schools/${identity.logo}`,import.meta.url).href;
  }));
  return logos.get(identity.logo);
}
export function paintSchoolBanner(ctx,chapter,w,h,logo=null){
  const school=schoolIdentity(chapter);
  ctx.save();ctx.clearRect(0,0,w,h);
  const rect=(x,y,sw,sh,color)=>{ctx.fillStyle=color;ctx.fillRect(x*w,y*h,sw*w,sh*h);};
  rect(0,0,1,1,school.primary);
  if(school.design==='split'){rect(0,.70,1,.30,school.secondary);rect(0,.685,1,.015,'#FFFFFF');}
  else if(school.design==='stripe'){rect(0,0,.10,1,school.secondary);rect(.90,0,.10,1,school.secondary);rect(.13,.73,.74,.015,'#FFFFFF');}
  else{ctx.strokeStyle=school.secondary;ctx.lineWidth=w*.025;ctx.strokeRect(w*.06,h*.045,w*.88,h*.91);rect(.20,.72,.60,.013,school.secondary);}
  if(logo){
    // Keep the downloaded mark intact, including its aspect ratio and colors.
    const scale=Math.min(w*.76/logo.width,h*.31/logo.height),lw=logo.width*scale,lh=logo.height*scale;
    ctx.drawImage(logo,(w-lw)/2,h*.36-lh/2,lw,lh);
  }
  const text=(value,y,size)=>{
    let px=size*w;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#FFFFFF';ctx.font=`700 ${px}px Aeonik, Arial, sans-serif`;
    while(ctx.measureText(value).width>w*.80&&px>12){px--;ctx.font=`700 ${px}px Aeonik, Arial, sans-serif`;}
    ctx.fillText(value,w/2,h*y);
  };
  // Text remains useful if a logo is unavailable; never invent a university mark.
  if(!logo)text(chapter.shortSchool||chapter.school||'UNIVERSITY',.36,.12);
  school.lines.forEach((line,i)=>text(line.toUpperCase(),.80+i*.065,school.lines.length>1?.089:.075));
  for(let y=0;y<h;y+=5){ctx.fillStyle='#FFFFFF08';ctx.fillRect(0,y,w,1);}
  ctx.strokeStyle='#FFFFFF65';ctx.lineWidth=1.5;ctx.setLineDash([6,5]);ctx.strokeRect(w*.025,h*.018,w*.95,h*.964);ctx.setLineDash([]);
  ctx.restore();
}
const rails=new WeakMap();
export function createSchoolBanner(T,chapter){
  const identity=schoolIdentity(chapter);let logo=null;
  const ready=loadSchoolLogo(identity).then(image=>{logo=image;});
  const banner=createClothBanner(T,{width:3.2,height:4.2,resolution:1024,primary:identity.primary,ready,paint:(ctx,w,h)=>paintSchoolBanner(ctx,chapter,w,h,logo)});
  banner.name=`school-banner-${chapter.id}`;
  banner.userData={chapter:chapter.id,school:chapter.school,identity:identity.key};
  if(!rails.has(T)){const geometry=new T.BoxGeometry(3.45,.08,.10);geometry.userData.sharedResource=true;rails.set(T,geometry);}
  const rail=new T.Mesh(rails.get(T),new T.MeshStandardMaterial({color:0xb4ab91,metalness:.65,roughness:.35}));
  rail.position.set(0,2.17,-.025);banner.add(rail);
  return banner;
}
