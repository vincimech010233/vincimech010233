#!/usr/bin/env python3
"""Offline triage of fictional CTI indicators."""
import argparse,json,ipaddress,sys
from pathlib import Path
WEIGHTS={'domain':20,'ipv4':15,'url':25,'sha256':10}
def normalize(item):
 kind=item.get('type','').lower(); value=item.get('value','').strip()
 if not value: raise ValueError('indicator value is empty')
 if kind=='ipv4':
  address=ipaddress.ip_address(value)
  if address.version!=4: raise ValueError('ipv4 indicator must be an IPv4 address')
  value=str(address)
 elif kind=='domain': value=value.rstrip('.').lower()
 elif kind=='url': value=value.lower()
 elif kind=='sha256':
  value=value.lower()
  if len(value)!=64 or any(c not in '0123456789abcdef' for c in value): raise ValueError('sha256 must contain 64 hex characters')
 else: raise ValueError(f'unsupported indicator type: {kind}')
 confidence=item.get('confidence',0)
 if not isinstance(confidence,(int,float)) or not 0<=confidence<=1: raise ValueError('confidence must be between 0 and 1')
 return {'type':kind,'value':value,'source':str(item.get('source','unspecified')),'confidence':confidence,'score':round(WEIGHTS[kind]*confidence,1)}
def main():
 p=argparse.ArgumentParser(description=__doc__); p.add_argument('file'); p.add_argument('--json',action='store_true'); a=p.parse_args()
 try:
  raw=json.loads(Path(a.file).read_text(encoding='utf-8')); items=[normalize(x) for x in raw]
 except (OSError,json.JSONDecodeError,TypeError,ValueError) as e: print(f'error: {e}',file=sys.stderr); return 2
 if a.json: print(json.dumps(items,indent=2))
 else:
  for i in items: print(f"{i['score']:>4.1f}  {i['type']:<6} {i['value']}  confidence={i['confidence']:.2f} source={i['source']}")
 return 0
if __name__=='__main__': raise SystemExit(main())
