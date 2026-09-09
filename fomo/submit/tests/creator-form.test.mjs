import test from 'node:test';
import assert from 'node:assert/strict';
import {creatorRoutes,platformForLink,validateCreatorLink} from '../creator-form.js';

test('UGC applications accept TikTok profiles and reject unrelated hosts',()=>{
  assert.equal(validateCreatorLink('ugc_application','https://www.tiktok.com/@creator'),'');
  assert.ok(validateCreatorLink('ugc_application','https://instagram.com/creator'));
  assert.ok(validateCreatorLink('ugc_application','https://tiktok.com.example.com/@creator'));
  assert.match(creatorRoutes.ugc_application.confirmation,/have made UGC ads before/);
});
test('concept applications accept accessible video hosting links without paid-post rules',()=>{
  for(const url of ['https://drive.google.com/file/d/concept/view','https://youtu.be/concept','https://vimeo.com/12345']){
    assert.equal(validateCreatorLink('concept_application',url),'');
  }
  assert.ok(validateCreatorLink('concept_application','javascript:alert(1)'));
  assert.doesNotMatch(creatorRoutes.concept_application.confirmation,/tags @fomo|bought views/);
});
test('view-based submissions require a supported post platform and creator approval confirmation',()=>{
  for(const url of ['https://www.tiktok.com/@creator/video/123','https://instagram.com/reel/123','https://youtube.com/shorts/123']){
    assert.equal(validateCreatorLink('paid_video',url),'');
    assert.ok(platformForLink(url));
  }
  assert.ok(validateCreatorLink('paid_video','https://drive.google.com/file/d/concept/view'));
  assert.ok(validateCreatorLink('paid_video','https://example.com/?post=tiktok.com'));
  assert.match(creatorRoutes.paid_video.confirmation,/already approved/);
});
test('missing routes and invalid links are rejected',()=>{
  assert.ok(validateCreatorLink('','https://tiktok.com/@creator'));
  assert.ok(validateCreatorLink('ugc_application','not a url'));
});
