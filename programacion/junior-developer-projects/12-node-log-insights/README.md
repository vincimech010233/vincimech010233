# Log Insights CLI (Node.js)

A dependency-free Node.js tool that reads a local newline-delimited JSON log file and summarizes severity counts and frequent messages. It handles malformed lines without stopping the whole report.

```bash
node log-insights.js data/sample.jsonl
node --test
```

Each record may have `level` and `message` fields. The example log is synthetic. This tool reads only the file path supplied; it does not access a network.

Skills: Node.js, async file I/O, JSON parsing, aggregation, CLI errors, tests.
