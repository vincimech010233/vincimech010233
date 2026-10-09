#!/usr/bin/env python3
"""Summarize interval energy readings from a CSV file."""
import argparse, csv, math, sys
from pathlib import Path

def load_readings(path):
    readings=[]
    with Path(path).open(newline='', encoding='utf-8') as f:
        reader=csv.DictReader(f)
        if not {'timestamp','kwh'} <= set(reader.fieldnames or []):
            raise ValueError("CSV must contain timestamp and kwh columns")
        for n,row in enumerate(reader, start=2):
            try: value=float(row['kwh'])
            except (TypeError, ValueError): raise ValueError(f"Invalid kwh on row {n}")
            if not math.isfinite(value) or value < 0: raise ValueError(f"kwh must be finite and >= 0 on row {n}")
            readings.append((row['timestamp'],value))
    if not readings: raise ValueError('CSV contains no readings')
    return readings

def summarize(readings, rate):
    values=[v for _,v in readings]; mean=sum(values)/len(values)
    variance=sum((x-mean)**2 for x in values)/len(values); sd=math.sqrt(variance)
    return {'count':len(values),'total_kwh':sum(values),'mean_kwh':mean,'estimated_cost':sum(values)*rate,
            'peak':max(readings,key=lambda x:x[1]),'flags':[t for t,v in readings if sd and v>mean+2*sd]}

def main():
    p=argparse.ArgumentParser(description=__doc__); p.add_argument('csv'); p.add_argument('--rate',type=float,default=.18,help='currency units per kWh (default: 0.18)'); a=p.parse_args()
    if not math.isfinite(a.rate) or a.rate < 0: p.error('--rate must be finite and >= 0')
    try: r=summarize(load_readings(a.csv),a.rate)
    except (OSError,ValueError) as e: print(f'error: {e}',file=sys.stderr); return 2
    print(f"Readings: {r['count']} | Total: {r['total_kwh']:.2f} kWh | Mean: {r['mean_kwh']:.2f} kWh")
    print(f"Estimated cost: {r['estimated_cost']:.2f} | Peak: {r['peak'][0]} ({r['peak'][1]:.2f} kWh)")
    print('Heuristic high-use timestamps: '+(', '.join(r['flags']) if r['flags'] else 'none'))
    return 0
if __name__=='__main__': raise SystemExit(main())
