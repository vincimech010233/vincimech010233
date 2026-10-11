"""Critical reviewer: synthetic, offline regression tests, guarded runner only."""
import contextlib, io, json, pathlib, random, sys, tempfile, unittest
import urlpolicy_lab as m

class CriticTests(unittest.TestCase):
    def test_corrected_identity(self):
        self.assertEqual(m.VERSION, '1.0.1')
    def test_exact_byte_budget_and_utf8(self):
        with tempfile.TemporaryDirectory() as d:
            p=pathlib.Path(d)/'cases.json'
            raw=json.dumps({'cases':[{'id':'a','url':'https://example.test/'}]}).encode()
            p.write_bytes(raw+b' '*(m.MAX_BYTES-len(raw)))
            self.assertEqual(len(m.load_cases(p)),1)
            p.write_bytes(p.read_bytes()+b' ')
            with self.assertRaises(m.InputError):m.load_cases(p)
            p.write_bytes(b'{"cases":[]}\xff')
            with self.assertRaises(m.InputError):m.load_cases(p)
    def test_ids_and_url_lengths(self):
        with tempfile.TemporaryDirectory() as d:
            p=pathlib.Path(d)/'cases.json'
            for ident in ('x'*81, 'a b', '\u00e9', ''):
                p.write_text(json.dumps({'cases':[{'id':ident,'url':'https://example.test/'}]}))
                with self.subTest(ident=ident),self.assertRaises(m.InputError):m.load_cases(p)
            p.write_text(json.dumps({'cases':[{'id':'x'*80,'url':'https://example.test/'}]}))
            self.assertEqual(m.load_cases(p)[0]['id'],'x'*80)
        prefix='https://8.8.8.8/'
        self.assertEqual(m.classify(prefix+'x'*(4096-len(prefix)))[0],'ALLOW_LITERAL')
        self.assertEqual(m.classify(prefix+'x'*(4097-len(prefix)))[0],'BLOCK')
    def test_additional_ipv6_fixed_oracle(self):
        for ip in ('::','::1','fc00::1234','fdab::abcd','fe80::1234','ff01::1','ff05::1','ff0f::ffff','::ffff:8.8.8.8'):
            with self.subTest(ip=ip):self.assertEqual(m.classify('https://['+ip+']/')[0],'BLOCK')
        for ip in ('2001:4860::8888','2606:4700:4700::1111'):
            with self.subTest(ip=ip):self.assertEqual(m.classify('https://['+ip+']:443/path?q=synthetic')[0],'ALLOW_LITERAL')
    def test_metomorphic_dns_authority(self):
        rng=random.Random(42)
        for _ in range(1000):
            label='a'+''.join(rng.choice('abc012') for _ in range(rng.randrange(1,60)))
            lower='https://'+label+'.example.test/'
            upper='HTTPS://'+label.upper()+'.EXAMPLE.TEST.:443/path?q=synthetic'
            self.assertEqual(m.classify(lower)[0],'REVIEW_DNS')
            self.assertEqual(m.classify(upper)[0],'REVIEW_DNS')
    def test_permissive_exit_is_documented(self):
        with tempfile.TemporaryDirectory() as d:
            b=pathlib.Path(d);p=b/'cases.json';o=b/'out.json'
            p.write_text(json.dumps({'cases':[{'id':'public','url':'https://8.8.8.8/'}]}))
            with contextlib.redirect_stdout(io.StringIO()):
                self.assertEqual(m.main([str(p),'--output',str(o)]),0)
            self.assertEqual(json.loads(o.read_text())['summary']['UNTESTED'],1)
            result=m.audit([{'id':'public','url':'https://8.8.8.8/'}],{'public':'BLOCK'})
            self.assertEqual(result['summary']['PASS'],1)
    def test_output_and_invalid_json_cli(self):
        with tempfile.TemporaryDirectory() as d:
            b=pathlib.Path(d);p=b/'cases.json';o=b/'out.json'
            for raw in (b'[]',b'null',b'{',b'\xff',b'['*10000+b'0'+b']'*10000):
                with self.subTest(raw_length=len(raw)):
                    p.write_bytes(raw)
                    with contextlib.redirect_stderr(io.StringIO()):
                        self.assertEqual(m.main([str(p),'--output',str(o)]),2)
                    self.assertFalse(o.exists())
            p.write_text(json.dumps({'cases':[{'id':'x','url':'https://example.test/'}]}))
            with contextlib.redirect_stderr(io.StringIO()):
                self.assertEqual(m.main([str(p),'--output',str(b/'missing'/'out.json')]),2)
    def test_encoded_fragment_is_not_fragment(self):
        self.assertEqual(m.classify('https://8.8.8.8/path%23synthetic?q=%23')[0],'ALLOW_LITERAL')
        self.assertEqual(m.classify('https://example.test./')[0],'REVIEW_DNS')
        for url in ('https://[v1.a]/','https://[2001:4860::8888]./','https://8.8.8.8:00000/','https://8.8.8.8:65536/'):
            with self.subTest(url=url):self.assertEqual(m.classify(url)[0],'BLOCK')

if __name__=='__main__':
    unittest.main(verbosity=2)
