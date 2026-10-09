# Energy Audit CLI

A small Python command-line tool that summarizes hourly electricity use, estimates cost and flags unusual readings. Built with the standard library; sample data is synthetic.

## Run

```bash
python3 energy_audit.py data/sample.csv --rate 0.18
```

Input CSV columns: `timestamp,kwh`. Output includes total use, estimated cost, hourly mean and the highest-use hour. A simple threshold flags readings above mean + 2 population standard deviations; this is an educational heuristic, not an anomaly-detection claim.

## Verify

```bash
python3 -m unittest discover -s tests -v
```

## Skills shown
Python, CSV parsing, input validation, CLI design, tests, reproducible sample data.

## Portfolio note

This repository is an independent portfolio project created to demonstrate implementation and documentation skills. Example data is synthetic. Adapt the project, explain your choices, and only claim work you can personally explain in an interview.

## License
MIT. See `LICENSE`.
