// Original chapter compositions informed by public fraternity brand references.
// Color provenance and design notes: banner-references.md. These are not official flags.
const identities={
  'sigma-chi-sdsu':{key:'blue-and-gold',primary:'#009DDC',secondary:'#FFD24F',ink:'#10334D',paper:'#FFFFFF'},
  'kappa-sigma-coastal':{key:'star-and-crescent',primary:'#215732',secondary:'#BF0D3E',ink:'#FFFFFF',paper:'#FFFFFF',gold:'#C99700'},
  'phi-delta-theta-tampa':{key:'azure-academic',primary:'#0D1433',secondary:'#619CC7',ink:'#0D1433',paper:'#F8FAFC',silver:'#CBD5E1'},
  'phi-kappa-psi-vt':{key:'cardinal-rose',primary:'#006341',secondary:'#A6192E',ink:'#FFFFFF',paper:'#FFFFFF',gold:'#EAAA00'},
  'tau-kappa-epsilon-tampa':{key:'cherry-varsity',primary:'#AD2624',secondary:'#919194',ink:'#FFFFFF',paper:'#FFFFFF'}
};
const fallback={key:'chapter-classic',primary:'#252A51',secondary:'#C6BD9F',ink:'#FFFFFF',paper:'#FFFFFF'};
export function bannerIdentity(chapter){return identities[chapter.id]||fallback;}

export function paintChapterBanner(ctx,chapter,w,h){
  const b=bannerIdentity(chapter),serif='Georgia, serif',sans='Aeonik, Arial, sans-serif';
  ctx.save();ctx.clearRect(0,0,w,h);ctx.textBaseline='middle';ctx.lineJoin='round';
  const rect=(x,y,width,height,color)=>{ctx.fillStyle=color;ctx.fillRect(x*w,y*h,width*w,height*h);};
  const line=(points,color,width=2)=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x*w,y*h):ctx.moveTo(x*w,y*h));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();};
  const polygon=(points,color)=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x*w,y*h):ctx.moveTo(x*w,y*h));ctx.closePath();ctx.fillStyle=color;ctx.fill();};
  const text=(value,x,y,size,color,maxWidth=.85,font=sans,weight='700',spacing=0)=>{
    ctx.textAlign='center';ctx.letterSpacing=`${spacing}px`;let px=size*h;ctx.font=`${weight} ${px}px ${font}`;
    while(ctx.measureText(value).width>maxWidth*w&&px>12){px-=1;ctx.font=`${weight} ${px}px ${font}`;}
    ctx.fillStyle=color;ctx.fillText(value,x*w,y*h);
  };
  const star=(x,y,r,color)=>{ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,s=(i%2?.42:1)*r*h;const px=x*w+Math.cos(a)*s,py=y*h+Math.sin(a)*s;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();ctx.fillStyle=color;ctx.fill();};
  const count=(x,y,size,color,width=.4)=>text(`${chapter.joined} / ${chapter.active}`,x,y,size,color,width,sans,'700');
  const name=chapter.name.toUpperCase(),school=chapter.shortSchool.toUpperCase();
  rect(0,0,1,1,b.primary);
  switch(b.key){
    case 'blue-and-gold': {
      // The flag's horizontal blue/gold division becomes a collegiate house cloth.
      rect(0,.78,1,.22,b.secondary);
      line([[.025,.06],[.975,.06],[.975,.94],[.025,.94],[.025,.06]],b.secondary,3);
      line([[.43,.2],[.43,.67]],'#FFFFFF80',2);
      for(let i=0;i<7;i++)star(.132+i*.033,.19,.018,b.secondary);
      text(chapter.letters,.23,.47,.49,b.paper,.35,serif);
      text(name,.695,.24,.12,b.ink,.49,serif);
      count(.695,.49,.30,b.paper,.48);
      text('MEMBERS ON FOMO',.695,.68,.058,b.ink,.48,sans,'700',3);
      text(school,.5,.88,.084,b.ink,.86,sans,'700',3);
      break;
    }
    case 'star-and-crescent': {
      // Scarlet diagonal, white piping and a simple celestial emblem on emerald.
      polygon([[0,0],[.50,0],[.33,1],[0,1]],b.secondary);
      polygon([[.50,0],[.512,0],[.342,1],[.33,1]],b.paper);
      ctx.save();ctx.translate(.20*w,.21*h);ctx.rotate(-.35);ctx.beginPath();ctx.arc(0,0,.066*h,0,Math.PI*2);ctx.arc(.032*h,-.018*h,.061*h,0,Math.PI*2,true);ctx.fillStyle=b.gold;ctx.fill('evenodd');ctx.restore();
      star(.235,.18,.042,b.paper);
      text(chapter.letters,.21,.50,.42,b.paper,.32,serif);
      text('KAPPA SIGMA',.71,.20,.105,b.paper,.43,serif);
      line([[.52,.31],[.90,.31]],b.gold,4);
      count(.71,.51,.29,b.paper,.44);
      text('MEMBERS ON FOMO',.71,.73,.055,b.paper,.42,sans,'700',3);
      text(school,.71,.88,.062,b.paper,.44);
      line([[.035,.08],[.035,.92]],b.gold,3);
      break;
    }
    case 'azure-academic': {
      // A light, centered academic standard; six stars echo the heraldic field.
      rect(0,0,1,1,b.paper);rect(0,0,.045,1,b.primary);rect(.955,0,.045,1,b.primary);
      rect(.055,0,.012,1,b.secondary);rect(.933,0,.012,1,b.secondary);
      text(name,.5,.145,.105,b.primary,.82,serif);
      text(chapter.letters,.5,.395,.32,b.primary,.58,serif);
      for(const side of [-1,1])for(let i=0;i<3;i++)star(.5+side*(.30+i*.055),.395,.026,b.secondary);
      line([[.22,.565],[.78,.565]],b.silver,3);
      count(.5,.70,.26,b.primary,.65);
      rect(.067,.86,.866,.14,b.secondary);
      text(`${school}  /  MEMBERS ON FOMO`,.5,.922,.05,b.primary,.80,sans,'700',2);
      break;
    }
    case 'cardinal-rose': {
      // Cardinal wings and a hunter-green center echo the fraternity's flag.
      rect(0,0,.19,1,b.secondary);rect(.81,0,.19,1,b.secondary);
      for(const x of [.19,.81])line([[x,.0],[x,1]],b.gold,4);
      for(const side of [-1,1]){
        const x=side<0?.094:.906,y=.48;
        // Original stitched rose linework, inspired by Phi Psi's Jacqueminot rose.
        ctx.save();ctx.translate(x*w,y*h);ctx.strokeStyle='#FFFFFF80';ctx.lineWidth=3;
        for(let i=0;i<6;i++){ctx.rotate(Math.PI/3);ctx.beginPath();ctx.ellipse(.021*h,0,.055*h,.028*h,0,0,Math.PI*2);ctx.stroke();}
        ctx.beginPath();ctx.arc(0,0,.025*h,0,Math.PI*2);ctx.stroke();ctx.restore();
        line([[x,.57],[x,.79]],'#FFFFFF80',3);line([[x,.71],[x-.025,.65]],'#FFFFFF80',3);line([[x,.75],[x+.025,.68]],'#FFFFFF80',3);
      }
      text(name,.5,.17,.091,b.paper,.55,serif);
      text(chapter.letters,.5,.40,.30,b.paper,.52,serif);
      rect(.30,.585,.40,.205,b.paper);
      count(.5,.69,.21,b.primary,.36);
      text('MEMBERS ON FOMO',.5,.865,.054,b.paper,.53,sans,'700',2);
      text(school,.5,.95,.041,b.paper,.5);
      break;
    }
    case 'cherry-varsity': {
      // An athletic houseplate with oversized block letters and a clipped gray end.
      polygon([[.66,0],[1,0],[1,1],[.52,1]],b.secondary);
      polygon([[.645,0],[.675,0],[.535,1],[.505,1]],b.paper);
      rect(.05,.09,.47,.016,b.paper);rect(.05,.125,.37,.008,'#FFFFFF90');
      text('TAU KAPPA EPSILON',.285,.245,.092,b.paper,.45,sans,'700',1);
      text(chapter.letters,.285,.52,.40,b.paper,.46,sans,'900');
      text(school,.265,.84,.067,b.paper,.39,sans,'700',2);
      count(.795,.42,.29,'#151515',.33);
      text('MEMBERS',.785,.66,.069,'#151515',.32,sans,'900',2);
      text('ON FOMO',.77,.78,.069,'#151515',.32,sans,'900',2);
      rect(.70,.90,.24,.017,b.primary);
      break;
    }
    default:
      text(name,.5,.18,.1,b.paper);text(chapter.letters,.27,.49,.38,b.paper,.36,serif);count(.70,.5,.3,b.paper,.43);text(`${school} / MEMBERS ON FOMO`,.5,.83,.065,b.paper);
  }
  // Fine fibers, recessed hems and edge stitching unify the physical cloth only.
  for(let y=0;y<h;y+=5){ctx.fillStyle=y%10?'#FFFFFF09':'#10182007';ctx.fillRect(0,y,w,1);}
  for(let x=0;x<w;x+=9){ctx.fillStyle='#FFFFFF05';ctx.fillRect(x,0,1,h);}
  ctx.strokeStyle='#FFFFFF65';ctx.lineWidth=2;ctx.setLineDash([7,6]);ctx.strokeRect(17,17,w-34,h-34);ctx.setLineDash([]);
  ctx.strokeStyle='#07101F30';ctx.lineWidth=7;ctx.strokeRect(4,4,w-8,h-8);
  ctx.restore();
}
