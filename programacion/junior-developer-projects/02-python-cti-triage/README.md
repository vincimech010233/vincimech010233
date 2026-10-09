# Local CTI Indicator Triage

A dependency-free, offline CLI that normalizes and scores indicators from a local JSON file. It demonstrates careful parsing, deterministic scoring and explicit provenance. The included indicators and source labels are fictional. It does not contact targets or external services.

```bash
python3 triage.py data/indicators.json --json
python3 -m unittest discover -s tests -v
```

Risk score is a transparent demonstration heuristic based on indicator type and source confidence. It is not threat attribution or an automated verdict. Review the input and evidence before acting.

## Portfolio note

This repository is an independent portfolio project created to demonstrate implementation and documentation skills. Example data is synthetic. Adapt the project, explain your choices, and only claim work you can personally explain in an interview.

## License
MIT. See `LICENSE`.
