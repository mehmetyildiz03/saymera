from pathlib import Path
import runpy

p=Path('.maintenance/v1.4.1/apply.py')
s=p.read_text(encoding='utf-8')
old="""app=rep(app,
".sg-base1000-hundred,.sg-base1000-ten,.sg-base1000-one').forEach",
".sg-base1000-hundred,.sg-base1000-ten,.sg-base1000-one,.sg-pair-action,.sg-plan-op').forEach",'disable A2 controls')"""
new="""app=rep(app,
".sg-base1000-hundred,.sg-base1000-ten,.sg-base1000-one').forEach(b=>b.disabled=true);",
".sg-base1000-hundred,.sg-base1000-ten,.sg-base1000-one,.sg-pair-action,.sg-plan-op').forEach(b=>b.disabled=true);",'disable A2 controls')"""
if old not in s:
    raise SystemExit('apply2 source patch anchor missing')
s=s.replace(old,new,1)
tmp=Path('/tmp/saymera-v1-4-1-fixed.py')
tmp.write_text(s,encoding='utf-8')
runpy.run_path(str(tmp),run_name='__main__')
