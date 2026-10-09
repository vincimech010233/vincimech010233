#!/usr/bin/env python3
"""Fit a straight line to CSV columns using ordinary least squares."""
import argparse,csv,math,sys
from pathlib import Path
def fit(xs,ys):
 if len(xs)!=len(ys) or len(xs)<2: raise ValueError('need at least two paired data points')
 if not all(math.isfinite(v) for v in xs+ys): raise ValueError('values must be finite')
 xm=sum(xs)/len(xs); ym=sum(ys)/len(ys); sxx=sum((x-xm)**2 for x in xs)
 if sxx==0: raise ValueError('x values must not all be equal')
 slope=sum((x-xm)*(y-ym) for x,y in zip(xs,ys))/sxx; intercept=ym-slope*xm
 pred=[slope*x+intercept for x in xs]; rmse=math.sqrt(sum((y-p)**2 for y,p in zip(ys,pred))/len(ys)); sst=sum((y-ym)**2 for y in ys)
 r2=1-sum((y-p)**2 for y,p in zip(ys,pred))/sst if sst else None
 return {'slope':slope,'intercept':intercept,'rmse':rmse,'r2':r2,'predicted':pred}
def main():
 p=argparse.ArgumentParser(description=__doc__); p.add_argument('csv'); p.add_argument('--x',default='x'); p.add_argument('--y',default='y'); p.add_argument('--output',default='predictions.csv'); a=p.parse_args()
 try:
  with open(a.csv,newline='',encoding='utf-8') as f:
   reader=csv.DictReader(f)
   if not {a.x,a.y}<=set(reader.fieldnames or []): raise ValueError(f'CSV must contain {a.x} and {a.y}')
   rows=list(reader); xs=[float(r[a.x]) for r in rows]; ys=[float(r[a.y]) for r in rows]
  result=fit(xs,ys)
  with open(a.output,'w',newline='',encoding='utf-8') as f:
   w=csv.writer(f); w.writerow([a.x,a.y,'predicted','residual']); w.writerows((x,y,p,y-p) for x,y,p in zip(xs,ys,result['predicted']))
 except (OSError,ValueError,KeyError) as e: print(f'error: {e}',file=sys.stderr); return 2
 print(f"slope={result['slope']:.6g} intercept={result['intercept']:.6g} RMSE={result['rmse']:.6g} R2={result['r2'] if result['r2'] is not None else 'n/a'}")
 print(f'Wrote predictions to {a.output}'); return 0
if __name__=='__main__': raise SystemExit(main())
