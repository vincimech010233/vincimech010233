"""Synthetic offline audit regressions. Expected results independent of classify."""
import contextlib, io, json, pathlib, random, resource, sys, tempfile, time, unittest
from unittest.mock import patch
import urlpolicy_lab as m

class IndependentTests(unittest.TestCase):
    def test_01_malformed_bracket_authority(self):
        for suffix in ('evil', '.example.test', ':', ':443evil'):
            with self.subTest(suffix=suffix):
                self.assertEqual(m.classify('https://[2001:4860::8888]'+suffix+'/')[0], 'BLOCK')

    def test_02_empty_fragment(self):
        self.assertEqual(m.classify('https://8.8.8.8/#')[0], 'BLOCK')

    def test_03_empty_port(self):
        for s in ('https://8.8.8.8:/','https://example.test:/'):
            with self.subTest(url=s): self.assertEqual(m.classify(s)[0],'BLOCK')

    def test_04_multiple_terminal_dots(self):
        for s in ('https://8.8.8.8../','https://example.test../','https://8.8.8.8.../'):
            with self.subTest(url=s): self.assertEqual(m.classify(s)[0],'BLOCK')

    def test_05_multicast_not_public_unicast(self):
        for s in ('https://224.0.0.1/','https://239.255.255.255/','https://[ff02::1]/','https://[ff0e::1]/'):
            with self.subTest(url=s): self.assertEqual(m.classify(s)[0],'BLOCK')

    def test_06_invalid_observation_types_cli(self):
        with tempfile.TemporaryDirectory() as d:
            b=pathlib.Path(d);p=b/'cases.json';q=b/'observed.json'
            p.write_text(json.dumps({'cases':[{'id':'a','url':'https://127.0.0.1/'}]}))
            for value in ([],{},['BLOCK'],1,None,True):
                with self.subTest(value=value):
                    q.write_text(json.dumps({'observed':[{'id':'a','decision':value}]}))
                    with contextlib.redirect_stderr(io.StringIO()):
                        self.assertEqual(m.main([str(p),'--observed',str(q),'--output',str(b/'o.json')]),2)

    def test_07_nested_json_cli(self):
        with tempfile.TemporaryDirectory() as d:
            b=pathlib.Path(d);p=b/'cases.json';p.write_text('['*2000+'0'+']'*2000)
            with contextlib.redirect_stderr(io.StringIO()):
                self.assertEqual(m.main([str(p),'--output',str(b/'o.json')]),2)

    def test_08_byte_limit_despite_stale_stat(self):
        with tempfile.TemporaryDirectory() as d:
            p=pathlib.Path(d)/'large.json';p.write_text('{}');before=p.stat()
            p.write_text('{"padding":"'+'x'*m.MAX_BYTES+'"}')
            with patch.object(pathlib.Path,'stat',return_value=before):
                with self.assertRaises(m.InputError): m.load_json(p)

    def test_09_duplicate_json_keys(self):
        with tempfile.TemporaryDirectory() as d:
            p=pathlib.Path(d)/'cases.json'
            p.write_text('{"cases":[{"id":"a","url":"https://127.0.0.1/","url":"https://8.8.8.8/"}]}')
            with self.assertRaises(m.InputError):m.load_cases(p)

    def test_10_manual_ipv4_range_oracle(self):
        # Integer masks are an independent oracle for these explicit local ranges.
        ranges=[(0,8),(0x0a000000,8),(0x7f000000,8),(0xa9fe0000,16),(0xac100000,12),(0xc0a80000,16)]
        rng=random.Random(20261011)
        for base,bits in ranges:
            for _ in range(100):
                n=base|rng.getrandbits(32-bits)
                host='.'.join(str((n>>shift)&255) for shift in (24,16,8,0))
                self.assertEqual(m.classify('https://'+host+'/')[0],'BLOCK',host)

    def test_11_input_limits(self):
        with tempfile.TemporaryDirectory() as d:
            p=pathlib.Path(d)/'cases.json'
            for count in (0,513):
                p.write_text(json.dumps({'cases':[{'id':str(i),'url':'https://example.test/'} for i in range(count)]}))
                with self.assertRaises(m.InputError):m.load_cases(p)
            p.write_text(json.dumps({'cases':[{'id':str(i),'url':'https://example.test/'} for i in range(512)]}))
            self.assertEqual(len(m.load_cases(p)),512)
        self.assertEqual(m.classify('https://8.8.8.8/'+'x'*4096)[0],'BLOCK')
        self.assertEqual(m.classify('https://example.test:65535/')[0],'REVIEW_DNS')
        for port in (0,65536,-1):self.assertEqual(m.classify('https://example.test:'+str(port)+'/')[0],'BLOCK')

    def test_12_full_verdict_matrix(self):
        # Actual BLOCK is acceptable for public literals under documented permissive semantics.
        expected={'https://127.0.0.1/':['PASS','FAIL','UNTESTED','WARN'],
                  'https://example.test/':['WARN','WARN','UNTESTED','WARN'],
                  'https://8.8.8.8/':['PASS','PASS','UNTESTED','WARN']}
        for url,verdicts in expected.items():
            for decision,verdict in zip(('BLOCK','ALLOW','SKIPPED','REVIEW'),verdicts):
                self.assertEqual(m.audit([{'id':'a','url':url}],{'a':decision})['cases'][0]['verdict'],verdict)

    def test_13_bundled_report_reproduction(self):
        root=pathlib.Path(m.__file__).parent
        self.assertEqual(m.audit(m.load_cases(root/'examples/cases.json'),m.load_observed(root/'examples/observed_demo.json')),
                         json.loads((root/'examples/demo_report.json').read_text()))

    def test_14_atomic_failure_cleanup(self):
        with tempfile.TemporaryDirectory() as d:
            p=pathlib.Path(d)/'o.json';p.write_text('synthetic original')
            with patch.object(m.os,'replace',side_effect=OSError('synthetic failure')):
                with self.assertRaises(OSError):m.atomic_json(p,{'a':1})
            self.assertEqual(p.read_text(),'synthetic original')
            self.assertEqual([x.name for x in p.parent.iterdir()],['o.json'])

    def test_15_bounded_string_fuzz(self):
        rng=random.Random(20261011)
        alphabet='abcXYZ01279.:/@#%[]\\\t\n -_é\x00'
        for _ in range(10000):
            s=rng.choice(('', 'https://','http://'))+''.join(rng.choice(alphabet) for _ in range(rng.randrange(160)))
            a=m.classify(s);self.assertIn(a[0],m.STATUS);self.assertEqual(a,m.classify(s));self.assertIsInstance(a[1],str)
        for s in (None,1,True,[],{},b'https://example.test/'):
            self.assertEqual(m.classify(s)[0],'BLOCK')

if __name__=='__main__':
    start=time.monotonic()
    result=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(IndependentTests))
    print(json.dumps({'tests':result.testsRun,'failures':len(result.failures),'errors':len(result.errors),
        'elapsed_seconds':time.monotonic()-start,'maxrss_kib':resource.getrusage(resource.RUSAGE_SELF).ru_maxrss,
        'fuzz_strings':10000,'oracle_ipv4_cases':600,'seed':20261011,'version':m.VERSION}))
    sys.exit(not result.wasSuccessful())
