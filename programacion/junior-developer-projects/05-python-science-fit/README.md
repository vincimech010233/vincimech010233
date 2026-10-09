# Scientific Data Fit (Python)

A dependency-free least-squares linear fit for small CSV datasets. It reports slope, intercept, RMSE and R², and writes predicted values to CSV. The included dataset is synthetic.

```bash
python3 fit.py data/measurements.csv --x time_s --y displacement_m --output results.csv
python3 -m unittest discover -s tests -v
```

The model is `y = slope*x + intercept`. R² is undefined for constant y and is printed as `n/a`. This is a learning tool; inspect residuals and assumptions before interpreting a fit.

## Portfolio note

This repository is an independent portfolio project created to demonstrate implementation and documentation skills. Example data is synthetic. Adapt the project, explain your choices, and only claim work you can personally explain in an interview.

## License
MIT. See `LICENSE`.
