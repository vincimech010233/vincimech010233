# Local Health Check API (Go)

A tiny HTTP service with `/health` and `/ready` endpoints and request logging. Uses only the Go standard library. It binds to `127.0.0.1` by default. The current example does not implement graceful shutdown.

```bash
go run .
curl http://127.0.0.1:8080/health
````
Run tests with `go test ./...`. Set `PORT` to choose a port. Intended as a local learning project, not a production readiness probe.

Skills: Go, HTTP handlers, JSON, graceful shutdown, tests.
