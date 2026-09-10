import test from 'node:test';
import assert from 'node:assert/strict';
import {discoverSchoolArtwork,logoCandidates} from '../school-artwork.js';
const page={title:'University of South Florida',extract:'The University of South Florida is a public research university.',images:[{title:'File:University of South Florida logo.svg'},{title:'File:University of South Florida seal.svg'},{title:'File:University of South Florida campus.jpg'},{title:'File:University of Michigan logo.svg'}]};
test('automatic artwork chooses a matching logo over seals, buildings and other schools',async()=>{
  assert.equal(logoCandidates(page.images,page.title)[0].title,page.images[0].title);
  const calls=[];const fetchImpl=async url=>{calls.push(new URL(url));return {ok:true,json:async()=>calls.length===1?{query:{pages:[page]}}:{query:{pages:[{title:page.images[0].title,imageinfo:[{thumburl:'https://thumb.wikimedia.org/wikipedia/en/thumb/a/ab/USF_logo.svg/800px-USF_logo.svg.png',descriptionurl:'https://en.wikipedia.org/wiki/File:USF_logo.svg'}]}]}}};};
  const art=await discoverSchoolArtwork(page.title,{fetchImpl});assert(art.logo.endsWith('.png'));assert.equal(art.title,page.title);
  assert.equal(calls.length,2);assert.equal(calls[0].searchParams.get('origin'),'*');
  assert(!calls[1].searchParams.get('titles').includes('Michigan'));assert(!calls[1].searchParams.get('titles').includes('campus'));
});
test('missing, ambiguous and non-school pages retain text artwork; external image hosts are rejected',async()=>{
  for(const candidate of [{missing:true},{...page,pageprops:{disambiguation:''}},{...page,title:'Florida',extract:'Florida is a state.'}]){
    let calls=0;assert.equal(await discoverSchoolArtwork('Florida',{fetchImpl:async()=>{calls++;return {ok:true,json:async()=>({query:{pages:[candidate]}})};}}),null);assert.equal(calls,1);
  }
  let calls=0;assert.equal(await discoverSchoolArtwork(page.title,{fetchImpl:async()=>({ok:true,json:async()=>++calls===1?{query:{pages:[page]}}:{query:{pages:[{title:page.images[0].title,imageinfo:[{url:'https://unrelated.example/logo.png'}]}]}}})}),null);
});
