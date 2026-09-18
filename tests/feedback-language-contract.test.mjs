import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');

const forbidden=[
  'Bağlantıyı kurdun.',
  'Birlikte düzeltelim.',
  'Harika, doğru cevabı buldun.',
  'Bu kez olmadı; ipucuyla devam edelim.',
  'Doğru yere yerleştirdin.',
  'keşfettin ✓',
  'Güzel bir çalışma yaptın.'
];
for(const copy of forbidden) assert.ok(!app.includes(copy),'evaluative/generic feedback returned: '+copy);

assert.ok(app.includes("function feedbackMathStatement(q)"),'feedback must have a semantic math-statement owner');
assert.ok(app.includes('<span class="section-kicker">SONUÇ</span>'),'correct feedback must frame the mathematical result, not praise');
assert.ok(app.includes('<span class="section-kicker">BURAYA BAK</span>'),'corrective feedback must direct attention without judging the child');
assert.ok(app.includes("const detail=correct?feedbackMathStatement(q):String(q.hint||'').trim();"),'lesson-flow feedback must use explanation/hint content');
assert.ok(app.includes("526 = beş yüz yirmi altı."),'word-build completion must state the mathematical/language result');
assert.ok(app.includes("Bu yuva '+roles[Number(slot.dataset.slotIndex)]+' kısmı."),'misplaced word feedback must identify the mathematical language role');

console.log('feedback-language contract: PASS (semantic, non-evaluative child feedback)');
