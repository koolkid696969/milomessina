import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function harness({reduced = false, hash = ''} = {}) {
  const nodes = new Map(), events = new Map(), timers = new Map(), sent = [];
  let timerId = 0;
  function node(id) {
    if (!nodes.has(id)) nodes.set(id, {
      hidden: true, inert: false, offsetHeight: 800, style: {},
      classList: {add(){}, remove(){}},
      addEventListener(type, fn) { events.set(`${id}:${type}`, fn); },
      setAttribute(key, value) { this[key] = value; },
      removeAttribute(key) { delete this[key]; },
      focus() { this.focused = true; },
      scrollIntoView() { this.scrolled = true; },
      contentWindow: {postMessage(value) { sent.push(value); }}
    });
    return nodes.get(id);
  }
  const media = {matches: reduced, addEventListener(type, fn) { events.set(`media:${type}`, fn); }};
  const win = {scrollY: 800, scrollTo(){}, addEventListener(type, fn) { events.set(`window:${type}`, fn); }};
  vm.runInNewContext(fs.readFileSync(new URL('../main.js', import.meta.url), 'utf8'), {
    document: {body: node('body'), getElementById: node, querySelector: node, hidden: false,
      addEventListener(type, fn) { events.set(`document:${type}`, fn); }},
    window: win, location: {origin:'https://milomessina.com', hash}, matchMedia: () => media,
    setTimeout(fn, delay) { timers.set(++timerId, {fn, delay}); return timerId; },
    clearTimeout(id) { timers.delete(id); }, requestAnimationFrame: () => 1, cancelAnimationFrame(){}
  });
  return {node, sent, timers,
    fire: (name, event = {}) => events.get(name)(event),
    message(type, extra = {}) { events.get('window:message')({origin:'https://milomessina.com', source:node('intro-frame').contentWindow, data:{type}, ...extra}); }
  };
}

test('the real intro finishes into the programs and unloads the renderer', () => {
  const h = harness();
  assert.equal(h.node('intro-frame').src, '/landingpage/intro.html');
  assert.equal(h.node('page').inert, true);
  h.message('campus:intro-start');
  assert.equal(h.node('pause-intro').hidden, false);
  h.message('campus:intro-end');
  assert.equal(h.node('intro-frame').src, undefined);
  assert.equal(h.node('page').inert, false);
  assert.equal(h.node('programs').focused, true);
  assert.equal(h.node('page').scrolled, true);
});
test('reduced motion and deep links never load the intro', () => {
  for (const options of [{reduced:true}, {hash:'#creators'}]) {
    const h = harness(options);
    assert.equal(h.node('intro-frame').src, undefined);
    assert.equal(h.node('page').inert, false);
  }
});
test('pause and resume control the shared scene and update accessible state', () => {
  const h = harness(); h.message('campus:intro-start');
  h.fire('pause-intro:click');
  assert.equal(h.node('pause-intro')['aria-pressed'], 'true');
  assert.equal(h.node('pause-intro').textContent, 'Resume intro');
  h.fire('pause-intro:click');
  assert.equal(h.node('pause-intro')['aria-pressed'], 'false');
  assert.equal(h.sent.length, 2);
});
test('skip, Escape, load failure and loading timeout all release the content', () => {
  for (const action of [h=>h.fire('skip-intro:click'), h=>h.fire('document:keydown',{key:'Escape'}), h=>h.message('campus:intro-error'), h=>[...h.timers.values()].find(t=>t.delay===30000).fn()]) {
    const h = harness(); action(h);
    assert.equal(h.node('page').inert, false);
    assert.equal(h.node('intro-frame').src, undefined);
  }
});
test('unrelated messages cannot end playback; replay creates a fresh scene', () => {
  const h = harness();
  h.message('campus:intro-end',{origin:'https://unrelated.example'});
  h.message('campus:intro-end',{source:{}});
  assert.equal(h.node('page').inert, true);
  h.fire('skip-intro:click'); h.fire('replay-intro:click');
  assert.equal(h.node('intro-frame').src, '/landingpage/intro.html');
  assert.equal(h.node('opening').inert, false);
  assert.equal(h.node('page').inert, true);
});
