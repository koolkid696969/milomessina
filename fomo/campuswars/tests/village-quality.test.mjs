import test from 'node:test';
import assert from 'node:assert/strict';
import {villageQuality} from '../village-quality.js';
test('phones use a quarter of terrain pixels and a sixteenth of banner pixels without antialiasing',()=>{
 const phone=villageQuality(true),desktop=villageQuality(false);
 assert.equal(phone.terrainResolution**2/desktop.terrainResolution**2,.25);
 assert.equal(phone.bannerResolution**2/desktop.bannerResolution**2,1/16);
 assert.equal(phone.antialias,false);assert.equal(phone.pixelRatio,1);
});
