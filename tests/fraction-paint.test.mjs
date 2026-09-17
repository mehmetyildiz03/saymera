import assert from 'node:assert/strict';
import {classifyFractionPaint,generateQuestion} from '../engine.mjs';

const twoOfFour=classifyFractionPaint([9,7,1.2,0]);
assert.deepEqual(twoOfFour.selected,[0,1]);
assert.equal(twoOfFour.count,2,'two clearly shaded cells should count as 2 even when not fully filled');

const accidentalCrossing=classifyFractionPaint([8,6.5,2.2,0]);
assert.equal(accidentalCrossing.count,2,'a small boundary-crossing mark should not create a third painted part');

const threeIntentional=classifyFractionPaint([8,7,6,0]);
assert.equal(threeIntentional.count,3,'three materially shaded cells must remain three; classifier must not force the requested numerator');

const tooLittle=classifyFractionPaint([1.4,1.1,0,0]);
assert.equal(tooLittle.count,0,'tiny marks should not be mistaken for intentional shading');

const unevenButIntentional=classifyFractionPaint([12,3.2,0,0]);
assert.equal(unevenButIntentional.count,2,'a partially shaded second part still counts when the intent is clear');

let foundMultiPart=false;
for(let i=0;i<250;i++){
  let n=(i%97)+1;
  const rng=()=>{ n=(n*48271)%2147483647; return n/2147483647; };
  const q=generateQuestion('fractionNotation2','build',2,rng);
  assert.equal(q.response?.interaction,'fraction-shade');
  assert.equal(q.visual?.type,'fraction-shade-builder');
  assert.equal(Number(q.response?.expectedValue),Number(q.visual?.target));
  if(Number(q.visual?.target)>1) foundMultiPart=true;
}
assert.ok(foundMultiPart,'fractionNotation2 build must include multi-part shading, not only unit fractions');

const app=await import('node:fs').then(fs=>fs.readFileSync(new URL('../app.js',import.meta.url),'utf8'));
assert.match(app,/bindFractionPaint\(/);
assert.match(app,/sg-fraction-ink-dot/);
assert.match(app,/classifyFractionPaint/);
assert.match(app,/Parmağınla veya kalemle/);

console.log('fraction-paint tests: PASS (dominant-region intent + multi-part fraction builder)');
