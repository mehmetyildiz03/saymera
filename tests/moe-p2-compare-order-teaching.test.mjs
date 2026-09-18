import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createConceptInstance,generateLearningQuestion} from '../engine.mjs';

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const engine=fs.readFileSync(new URL('../engine.mjs',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../styles.css',import.meta.url),'utf8');

assert.ok(app.includes("const LESSON_FIRST_SKILLS=new Set(['number1000','compareOrder1000'])"),'compare/order must teach before checking');
assert.ok(app.includes('const COMPARE_ORDER_LESSON_VERSION=1'),'compare/order lesson must be versioned');
assert.ok(app.includes("if(skill.id==='compareOrder1000'){ renderCompareOrderLessonStep(skill); return; }"),'compare/order must use dedicated lesson renderer');
for(const id of ['compare-hundreds','compare-tens','compare-ones','compare-equal','comparison-symbols','symbol-bridge','order-three']) assert.ok(app.includes("id:'"+id+"'"),'missing compare lesson step '+id);
assert.ok(app.indexOf("id:'compare-equal'") < app.indexOf("id:'comparison-symbols'"),'verbal comparison must precede symbol teaching');
assert.ok(app.includes("const COMPARE_ORDER_SECTIONS=['KARŞILAŞTIR','SEMBOL','SIRALA']"),'compare sections missing');
assert.ok(app.includes("['number1000','compareOrder1000'].includes(q.skillId)"),'compare feedback must stay in task context');
assert.ok(!app.includes('Y ·'),'abbreviated place-value labels must not return');
assert.ok(app.includes('<small>Yüzlük</small>')&&app.includes('<small>Onluk</small>')&&app.includes('<small>Birlik</small>'),'full place-value labels required');
assert.ok(!engine.includes("['=', '+']"),'addition must not be a comparison distractor');
assert.ok(engine.includes("const opts=shuffled(['<','>','='].map"),'symbol options must be comparison relations only');
assert.ok(engine.includes("`${x.a}, ${x.b}'ye göre nasıldır?`"),'visual comparison must reinforce verbal relation');
assert.match(css,/\.compare-place-table/); assert.match(css,/\.compare-symbol-cards/); assert.match(css,/\.compare-order-chip/);
assert.match(css,/\.lesson-unit-hundred\{[\s\S]*background-size:10% 100%,100% 10%/,'lesson hundred must render 10x10 cells');
assert.match(css,/\.lesson-unit-ten\{[\s\S]*background-size:100% 10%/,'lesson ten must render 10 cells');

const rng=(()=>{let s=991;return()=>((s=(s*1664525+1013904223)>>>0)/2**32)})();
const c=createConceptInstance('compareOrder1000',2,rng);
const see=generateLearningQuestion('compareOrder1000','representation','see',2,rng,c);
assert.ok(['daha küçüktür','daha büyüktür','aynıdır'].includes(see.answer),'representation answer must be verbal');
const symbol=generateLearningQuestion('compareOrder1000','symbol','symbol',2,rng,c);
assert.deepEqual(new Set(symbol.response.options.map(x=>x.value)),new Set(['<','>','=']),'symbol options must be exactly < > =');
console.log('MOE P2 compare/order teaching: PASS (language -> symbols -> ordering)');
