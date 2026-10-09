import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../server.js';

test('creates, lists, updates and deletes an item', async (t) => {
  const server = createServer(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => server.close()); const base = `http://127.0.0.1:${server.address().port}`;
  let res = await fetch(`${base}/api/items`, { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({name:'Notebook',quantity:2}) });
  assert.equal(res.status,201); const item=await res.json(); assert.equal(item.name,'Notebook');
  res=await fetch(`${base}/api/items`); assert.equal((await res.json()).length,1);
  res=await fetch(`${base}/api/items/${item.id}`,{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({quantity:4})}); assert.equal((await res.json()).quantity,4);
  res=await fetch(`${base}/api/items/${item.id}`,{method:'DELETE'}); assert.equal(res.status,204);
});
test('rejects invalid item data', async (t) => {
  const server=createServer(); await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve)); t.after(()=>server.close());
  const res=await fetch(`http://127.0.0.1:${server.address().port}/api/items`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:'',quantity:-1})}); assert.equal(res.status,400);
});
