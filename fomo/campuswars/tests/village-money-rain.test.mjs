import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.min.js';
import {moneyRecipients,createMoneyRain,MONEY_START,MONEY_END} from '../village-money-rain.js';
const chapters=[{id:'first',joined:60,active:100},{id:'second',joined:34,active:69},{id:'third',joined:21,active:50},{id:'construction',joined:14,active:30},{id:'empty',joined:0,active:60}];
const anchors=chapters.map((c,i)=>({id:c.id,lot:{x:i%2?20:-20,z:Math.floor(i/2)*19-19},point:new T.Vector3(0,14,0)}));
const matrix=new T.Matrix4(),position=new T.Vector3(),scale=new T.Vector3(),rotation=new T.Quaternion();
test('rain follows actual onboarding ranks, excludes construction below its goal, and treats ties equally',()=>{
  const rows=moneyRecipients(chapters,anchors);
  assert.deepEqual(rows.map(row=>row.id),['first','second','third']);
  assert(rows[0].count>rows[1].count&&rows[1].count>rows[2].count);
  const tied=moneyRecipients([{...chapters[0],joined:50},{...chapters[1],joined:25,active:50}],anchors);
  assert.equal(tied[0].rank,tied[1].rank);assert.equal(tied[0].count,tied[1].count);
});
test('clouds and bills exist only during the reward beat, stay over eligible houses, and freeze with time',()=>{
  const rain=createMoneyRain(T,chapters,anchors);
  rain.update(MONEY_START);assert.equal(rain.root.visible,false);
  rain.update(9.5);assert.equal(rain.root.visible,true);assert.equal(rain.root.children.length,2);
  const bills=rain.root.getObjectByName('rank-weighted-money');let index=0;
  for(const row of rain.recipients)for(let i=0;i<row.count;i++){
    bills.getMatrixAt(index++,matrix);matrix.decompose(position,rotation,scale);
    assert(Math.abs(position.x-row.x)<5.3);assert(Math.abs(position.z-row.z)<5.3);
    assert(position.y>row.roof);assert(position.y<=row.roof+12.5);
  }
  const frozen=Array.from(bills.instanceMatrix.array);rain.update(9.5);assert.deepEqual(Array.from(bills.instanceMatrix.array),frozen);
  rain.update(9.6);assert.notDeepEqual(Array.from(bills.instanceMatrix.array),frozen);
  rain.update(MONEY_END);assert.equal(rain.root.visible,false);
  rain.update(9.5);rain.clear();assert.equal(rain.root.visible,false);
  rain.update(9.5);assert.equal(rain.root.visible,true);rain.dispose();
});
test('live registration changes rebuild eligible rain and release replaced instance buffers',()=>{
  const rain=createMoneyRain(T,chapters,anchors);let disposed=0;
  rain.root.children.forEach(mesh=>mesh.addEventListener('dispose',()=>disposed++));
  const updated=chapters.map(c=>c.id==='construction'?{...c,joined:15,active:30}:c.id==='first'?{...c,joined:14}:c);
  rain.setChapters(updated,anchors);assert.equal(disposed,2);
  assert(!rain.recipients.some(row=>row.id==='first'));assert(rain.recipients.some(row=>row.id==='construction'));
  rain.update(9);assert.equal(rain.root.visible,true);
  rain.setChapters([],[]);rain.update(9);assert.equal(rain.root.visible,false);assert.equal(rain.root.children.length,0);rain.dispose();
});


test('goal houses celebrate for 20 seconds while other houses stay dry; unchanged feeds do not replay',()=>{
  const goalChapters=chapters.map(c=>c.id==='first'?{...c,joined:80}:c);
  const rain=createMoneyRain(T,goalChapters,anchors);
  rain.updateRewards(12);assert(rain.root.visible);
  const bills=rain.root.getObjectByName('rank-weighted-money');let index=0;
  for(const row of rain.recipients)for(let i=0;i<row.count;i++){
    bills.getMatrixAt(index++,matrix);matrix.decompose(position,rotation,scale);
    if(!row.goalReached)assert.equal(scale.x,0);
  }
  rain.setChapters(goalChapters,anchors);rain.updateRewards(8);assert.equal(rain.root.visible,false);
  rain.updateRewards(1);assert.equal(rain.root.visible,false);
  const reached=goalChapters.map(c=>c.id==='construction'?{...c,joined:24}:c);
  rain.setChapters(reached,anchors);rain.updateRewards(1);assert(rain.root.visible);
  rain.dispose();
});
test('a small chapter can celebrate its 80% goal while its house is under construction',()=>{
  const rain=createMoneyRain(T,[{...chapters[3],joined:8,active:10}],anchors);
  rain.updateRewards(1);assert(rain.root.visible);assert.equal(rain.recipients[0].id,'construction');rain.dispose();
});
