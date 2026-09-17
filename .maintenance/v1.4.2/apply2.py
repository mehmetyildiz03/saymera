from pathlib import Path

path=Path('.maintenance/v1.4.2/apply.py')
src=path.read_text(encoding='utf-8')
old=".sg-three-token,.sg-base1000-hundred,.sg-base1000-ten,.sg-base1000-one').forEach"
new=".sg-three-token,.sg-base1000-hundred,.sg-base1000-ten,.sg-base1000-one,.sg-pair-action,.sg-plan-op').forEach"
old2=".sg-three-token,.sg-base1000-hundred,.sg-base1000-ten,.sg-base1000-one,.sg-fraction-cell').forEach"
new2=".sg-three-token,.sg-base1000-hundred,.sg-base1000-ten,.sg-base1000-one,.sg-pair-action,.sg-plan-op,.sg-fraction-cell').forEach"
if old not in src or old2 not in src:
    raise SystemExit('fraction selector repair anchors missing')
src=src.replace(old,new,1).replace(old2,new2,1)
exec(compile(src,str(path),'exec'),{'__name__':'__main__','__file__':str(path)})
