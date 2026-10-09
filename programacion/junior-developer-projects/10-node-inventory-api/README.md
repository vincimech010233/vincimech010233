# Inventory API (Node.js)

A small JSON API built with Node's built-in HTTP module. Supports listing, creating, updating, and deleting inventory items. Data lives in memory and resets when the process stops.

```bash
node server.js
curl http://127.0.0.1:3000/api/items
node --test
```

Create an item with `curl -X POST http://127.0.0.1:3000/api/items -H 'content-type: application/json' -d '{"name":"Notebook","quantity":3}'`. The service binds to localhost.

Skills: JavaScript, Node.js, HTTP, JSON validation, status codes, integration tests.
