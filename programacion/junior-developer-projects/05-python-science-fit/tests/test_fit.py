import sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from fit import fit
class TestFit(unittest.TestCase):
 def test_exact_line(self):
  r=fit([0,1,2],[1,3,5]); self.assertAlmostEqual(r['slope'],2); self.assertAlmostEqual(r['intercept'],1); self.assertAlmostEqual(r['r2'],1)
 def test_constant_x_rejected(self):
  with self.assertRaises(ValueError): fit([1,1],[2,3])
if __name__=='__main__': unittest.main()
