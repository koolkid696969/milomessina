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
test('paid submissions accept TikTok post and share links and require creator approval',()=>{
  for(const url of ['https://www.tiktok.com/@creator/video/123','https://vm.tiktok.com/ZM123abc/','https://vt.tiktok.com/ZS123abc/','https://www.tiktok.com/t/ZT123abc/']){
    assert.equal(validateCreatorLink('paid_video',url),'');
    assert.ok(platformForLink(url));
  }
  assert.ok(validateCreatorLink('paid_video','https://drive.google.com/file/d/concept/view'));
  assert.ok(validateCreatorLink('paid_video','https://example.com/?post=tiktok.com'));
  assert.match(creatorRoutes.paid_video.confirmation,/approved fomo creator/);
  assert.match(creatorRoutes.paid_video.confirmation,/not cross-posted or previously submitted/);
  assert.doesNotMatch(creatorRoutes.paid_video.confirmation,/tags @fomo/);
});
test('paid submissions reject other platforms, homepages, profiles and a conflicting platform',()=>{
  for(const url of ['https://instagram.com/reel/123','https://youtube.com/shorts/123','https://youtu.be/123','https://tiktok.com','https://tiktok.com/@creator','https://tiktok.com.example.org/@creator/video/123']) assert.ok(validateCreatorLink('paid_video',url));
  assert.ok(validateCreatorLink('paid_video','https://tiktok.com/@creator/video/123','Instagram Reels'));
  assert.ok(validateCreatorLink('ugc_application','https://tiktok.com/@creator/video/123'));
  assert.ok(validateCreatorLink('ugc_application','https://tiktok.com'));
});
test('missing routes and invalid links are rejected',()=>{
  assert.ok(validateCreatorLink('','https://tiktok.com/@creator'));
  assert.ok(validateCreatorLink('ugc_application','not a url'));
});
