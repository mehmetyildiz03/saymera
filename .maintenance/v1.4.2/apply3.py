from pathlib import Path

path=Path('.maintenance/v1.4.2/apply.py')
src=path.read_text(encoding='utf-8')
old=".sg-three-token,.sg-base1000-hundred,.sg-base1000-ten,.sg-base1000-one').forEach"
new=".sg-three-token,.sg-base1000-hundred,.sg-base1000-ten,.sg-base1000-one,.sg-pair-action,.sg-plan-op').forEach"
old2=".sg-three-token,.sg-base1000-hundred,.sg-base1000-ten,.sg-base1000-one,.sg-fraction-cell').forEach"
new2=".sg-three-token,.sg-base1000-hundred,.sg-base1000-ten,.sg-base1000-one,.sg-pair-action,.sg-plan-op,.sg-fraction-cell').forEach"
for a,b in [(old,new),(old2,new2)]:
    if a not in src: raise SystemExit('fraction selector repair anchor missing')
    src=src.replace(a,b,1)
brace="explain:`Doğru model ${x.denom} eş parçaya ayrılmış ve yalnız bir parçası boyalı.`});\n  if(rep==='symbol')"
brace_fixed="explain:`Doğru model ${x.denom} eş parçaya ayrılmış ve yalnız bir parçası boyalı.`});\n  }\n  if(rep==='symbol')"
if brace not in src: raise SystemExit('fraction meaning block repair anchor missing')
src=src.replace(brace,brace_fixed,1)
exec(compile(src,str(path),'exec'),{'__name__':'__main__','__file__':str(path)})
