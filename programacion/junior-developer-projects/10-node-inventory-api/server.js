import http from 'node:http';
import { randomUUID } from 'node:crypto';

const MAX_BODY = 16 * 1024;
function send(res, status, data) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}
async function readJson(req) {
  let raw = '';
  for await (const chunk of req) { raw += chunk; if (raw.length > MAX_BODY) throw Object.assign(new Error('Body too large'), { status: 413 }); }
  try { return JSON.parse(raw || '{}'); } catch { throw Object.assign(new Error('Invalid JSON'), { status: 400 }); }
}
export function createServer() {
  const items = new Map();
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/health' && req.method === 'GET') return send(res, 200, { status: 'ok' });
    if (url.pathname === '/api/items' && req.method === 'GET') return send(res, 200, [...items.values()]);
    if (url.pathname === '/api/items' && req.method === 'POST') {
      try { const body = await readJson(req);
        if (typeof body.name !== 'string' || !body.name.trim() || !Number.isInteger(body.quantity) || body.quantity < 0) return send(res, 400, { error: 'name and non-negative integer quantity are required' });
        const item = { id: randomUUID(), name: body.name.trim(), quantity: body.quantity }; items.set(item.id, item); return send(res, 201, item);
      } catch (e) { return send(res, e.status || 400, { error: e.message }); }
    }
    const match = url.pathname.match(/^\/api\/items\/([a-f0-9-]+)$/i);
    if (match && req.method === 'PATCH') {
      if (!items.has(match[1])) return send(res, 404, { error: 'item not found' });
      try { const body = await readJson(req); const old = items.get(match[1]);
        const name = body.name === undefined ? old.name : body.name; const quantity = body.quantity === undefined ? old.quantity : body.quantity;
        if (typeof name !== 'string' || !name.trim() || !Number.isInteger(quantity) || quantity < 0) return send(res, 400, { error: 'name must be non-empty and quantity a non-negative integer' });
        const item = { ...old, name: name.trim(), quantity }; items.set(item.id, item); return send(res, 200, item);
      } catch (e) { return send(res, e.status || 400, { error: e.message }); }
    }
    if (match && req.method === 'DELETE') { if (!items.delete(match[1])) return send(res, 404, { error: 'item not found' }); res.writeHead(204); return res.end(); }
    return send(res, 404, { error: 'route not found' });
  });
}
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const port = Number(process.env.PORT || 3000);
  createServer().listen(port, '127.0.0.1', () => console.log(`Inventory API: http://127.0.0.1:${port}`));
}
