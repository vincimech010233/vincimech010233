import sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from triage import normalize
class TestNormalize(unittest.TestCase):
 def test_domain_case_and_trailing_dot(self): self.assertEqual(normalize({'type':'domain','value':'EXAMPLE.COM.','confidence':.5})['value'],'example.com')
 def test_invalid_hash_rejected(self):
  with self.assertRaises(ValueError): normalize({'type':'sha256','value':'xyz','confidence':1})
 def test_confidence_bounds(self):
  with self.assertRaises(ValueError): normalize({'type':'ipv4','value':'192.0.2.1','confidence':2})
 def test_ipv6_is_not_accepted_as_ipv4(self):
  with self.assertRaises(ValueError): normalize({'type':'ipv4','value':'2001:db8::1','confidence':.5})
if __name__=='__main__': unittest.main()
