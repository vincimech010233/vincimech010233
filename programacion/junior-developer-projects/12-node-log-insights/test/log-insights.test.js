import test from 'node:test';
import assert from 'node:assert/strict';
import { summarize } from '../log-insights.js';
test('counts levels and groups frequent errors',()=>{const r=summarize('{"level":"ERROR","message":"timeout"}\n{"level":"ERROR","message":"timeout"}\n{"level":"INFO","message":"start"}\ninvalid');assert.deepEqual(r.counts,{INFO:1,WARN:0,ERROR:2,OTHER:0});assert.equal(r.malformed,1);assert.deepEqual(r.topErrors,[['timeout',2]]);});
test('unknown levels count as OTHER',()=>{assert.equal(summarize('{"level":"TRACE"}').counts.OTHER,1);});
