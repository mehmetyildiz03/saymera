import assert from 'node:assert/strict';
import {createConceptInstance,generateLearningQuestion} from '../engine.mjs';

function seeded(seed){ let s=seed>>>0; return ()=>((s=(s*1664525+1013904223)>>>0)/2**32); }
const rng=seeded(1729);
const concept=createConceptInstance('number1000',2,rng);

const model=generateLearningQuestion('number1000','model','build',2,rng,concept);
assert.equal(model.response.kind,'manipulative');
assert.equal(model.taskKind,'manipulative-build');

const modelToNumber=generateLearningQuestion('number1000','representation','see',2,rng,concept);
assert.equal(modelToNumber.response.kind,'number-input');
assert.equal(modelToNumber.taskKind,'model-to-number-production');

const words=generateLearningQuestion('number1000','symbol','symbol',2,rng,concept);
assert.equal(words.response.kind,'number-input');
assert.equal(words.taskKind,'word-to-numeral-production');

const place=generateLearningQuestion('number1000','reasoning','explain',2,rng,concept);
assert.equal(place.response.kind,'number-input');
assert.equal(place.taskKind,'place-value-production');

const context=generateLearningQuestion('number1000','context','transfer',2,rng,concept);
assert.equal(context.response.kind,'number-input');
assert.equal(context.taskKind,'context-number-production');

for(let i=0;i<40;i++){
  const r=seeded(9000+i);
  const c=createConceptInstance('number1000',2,seeded(1000+i));
  const q=generateLearningQuestion('number1000','practice','symbol',2,r,c,{practiceIndex:0});
  assert.equal(q.taskKind,'zero-place-production');
  assert.equal(q.visual?.type,'base1000');
  assert.ok(q.visual.tens===0||q.visual.ones===0,'zero-place practice must actually contain a zero place');
}

const independent=generateLearningQuestion('number1000','practice','transfer',2,rng,createConceptInstance('number1000',2,rng),{practiceIndex:1});
assert.equal(independent.response.kind,'number-input');
assert.equal(independent.taskKind,'independent-context-production');

const seven=[model,modelToNumber,words,place,context,generateLearningQuestion('number1000','practice','symbol',2,rng,createConceptInstance('number1000',2,rng),{practiceIndex:0}),independent];
assert.equal(new Set(seven.map(q=>q.taskKind)).size,7,'first-cycle application must contain seven genuinely different production intents');
console.log('number1000 student-practice tests: PASS (7 distinct student-production intents)');
