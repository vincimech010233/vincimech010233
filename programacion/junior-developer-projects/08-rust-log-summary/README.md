# Log Summary (Rust)

A small log-file summarizer that counts severity labels (`INFO`, `WARN`, `ERROR`) and prints the most frequent error messages. It processes a local text file and uses no dependencies.

```bash
cargo run -- data/sample.log
cargo test
```
Each line is expected to contain a severity token. Lines without a known token are counted as `OTHER`. This is a learning utility, not a full log parser.

Skills: Rust, iterators, enums, HashMap, CLI input, tests.
