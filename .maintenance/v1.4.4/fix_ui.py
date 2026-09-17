from pathlib import Path
p=Path('styles.css')
s=p.read_text(encoding='utf-8')
block='''

/* SAYMERA v1.4.4 · Singapore P2 measurement/time/money controls */
.sg-measure-builder,.sg-duration-builder{width:100%;min-width:0}
.sg-measure-builder .sg-money-bank,.sg-duration-builder .sg-money-bank{display:flex;flex-wrap:wrap;justify-content:center;gap:10px}
.sg-measure-builder .sg-measure-token,.sg-duration-builder .sg-duration-token{min-width:64px}
.sg-measure-builder .sg-measure-token small{display:block;margin-top:3px;font-size:.72em}
.sg-clock-minute-set{width:100%}
.sg-clock-minute-set .sg-clock-minute-preview{display:grid;place-items:center;margin:0 auto 14px;max-width:280px}
.sg-clock-minute-set .sg-minute-live{display:inline-grid;place-items:center;min-width:58px;padding:10px 12px;border-radius:14px;background:var(--surface);border:1px solid var(--line);font-variant-numeric:tabular-nums}
.sg-clock-minute-set .sg-minute-adjust{min-width:52px}
@media (max-width:560px){.sg-clock-minute-set .sg-minute-adjust{min-width:46px;padding-inline:8px}.sg-measure-builder .sg-measure-token,.sg-duration-builder .sg-duration-token{min-width:56px}}
'''
if '.sg-measure-builder' not in s: s += block
p.write_text(s,encoding='utf-8')
print('v1.4.4 P2-C UI styles added')
