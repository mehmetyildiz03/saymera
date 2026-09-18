from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]

def replace_once(path,old,new):
    p=ROOT/path
    text=p.read_text(encoding="utf-8")
    if old not in text:
        raise SystemExit(f"pattern not found: {old}")
    p.write_text(text.replace(old,new,1),encoding="utf-8")

replace_once(
    "app.js",
    "$('.lesson-place-card').forEach(btn=>btn.addEventListener('click',()=>{",
    "$$('.lesson-place-card').forEach(btn=>btn.addEventListener('click',()=>{"
)

replace_once(
    "app.js",
    "SINGAPUR P2 · '+esc(step.moe)",
    "KONU ANLATIMI · '+(at+1)+'/'+NUMBER1000_LESSON_STEPS.length"
)

p=ROOT/"tests/moe-p2-number1000-teaching.test.mjs"
text=p.read_text(encoding="utf-8")
needle="assert.ok(app.includes('lessonTaughtAt'));"
addition=needle+"\nassert.ok(app.includes(\"$$('.lesson-place-card').forEach\"),'place-value teaching must bind all three cards');\nassert.ok(!app.includes('SINGAPUR P2 ·'),'child UI must not expose curriculum-engine jargon');"
if "$$('.lesson-place-card').forEach" not in text:
    if needle not in text:
        raise SystemExit("test insertion point not found")
    text=text.replace(needle,addition,1)
p.write_text(text,encoding="utf-8")

for p in [ROOT/".github/workflows/apply-v1-6-1-hotfix.yml",ROOT/".maintenance/v1.6.1-hotfix/apply.py"]:
    if p.exists(): p.unlink()
