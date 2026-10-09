import sys, unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from energy_audit import summarize
class TestSummary(unittest.TestCase):
 def test_total_cost_and_peak(self):
  r=summarize([('a',1),('b',3)],.5); self.assertEqual(r['total_kwh'],4); self.assertEqual(r['estimated_cost'],2); self.assertEqual(r['peak'],('b',3))
 def test_no_false_flag_for_constant_data(self):
  self.assertEqual(summarize([('a',2),('b',2)],1)['flags'],[])
if __name__=='__main__': unittest.main()
