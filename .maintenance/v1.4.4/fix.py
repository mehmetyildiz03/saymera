from pathlib import Path
p=Path('.maintenance/v1.4.4/apply.py')
s=p.read_text(encoding='utf-8')
s=s.replace(".sg-plan-op').forEach(b=>b.disabled=true);", ".sg-plan-op,.sg-fraction-cell').forEach(b=>b.disabled=true);")
s=s.replace(".sg-plan-op,.sg-measure-token,.sg-duration-token,.sg-minute-adjust').forEach(b=>b.disabled=true);", ".sg-plan-op,.sg-fraction-cell,.sg-measure-token,.sg-duration-token,.sg-minute-adjust').forEach(b=>b.disabled=true);")
s=s.replace("const y=c.transfer, other=Math.max(1,y.litres-1), answer=`${y.litres} L`;", "const y=c.transfer, other=Math.max(0,y.litres-1), answer=`${y.litres} L`;")
p.write_text(s,encoding='utf-8')
print('v1.4.4 migration repairs applied')
