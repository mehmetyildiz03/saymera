import assert from 'node:assert/strict';
import fs from 'node:fs';

const css=fs.readFileSync(new URL('../styles.css',import.meta.url),'utf8');
const marker='/* v1.7.2 — PHONE ONLY. Tablet/desktop layout is intentionally untouched. */';
const i=css.indexOf(marker);
assert.ok(i>=0,'phone-only responsive patch missing');
const patch=css.slice(i+marker.length).trim();
assert.ok(patch.startsWith('@media (max-width:699px){'),'new responsive patch must be phone-only');
assert.ok(!patch.includes('@media (min-width:700px)'),'v1.7.2 must not add tablet rules');
for(const selector of ['.visual-choice-grid','.visual-answer','.answers-grid','.answer-button','.number-response','.lesson-place-columns','.lesson-word-slots']) assert.ok(patch.includes(selector),'phone patch missing '+selector);
assert.ok(patch.includes('grid-template-columns:1fr!important'),'phone answer choices must collapse safely');
assert.ok(patch.includes('overflow-x:hidden'),'phone viewport must not horizontally overflow');
console.log('mobile responsive contract: PASS (v1.7.2 patch applies only below 700px)');
