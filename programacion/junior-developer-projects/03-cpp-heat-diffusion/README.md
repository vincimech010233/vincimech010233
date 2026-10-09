# 1D Heat Diffusion Simulator (C++)

A compact explicit finite-difference simulation of heat diffusion along a bar. It writes a CSV temperature profile at selected steps. This numerical demo uses fixed boundary temperatures; it is not an engineering design tool.

## Build and run

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build
./build/heat_sim 101 500 0.4 output.csv
```
Arguments are grid points, time steps, and dimensionless stability factor `r = alpha*dt/dx^2` (must be in (0, 0.5]). The initial bar is 20°C, with ends fixed at 100°C and 0°C.

```bash
ctest --test-dir build --output-on-failure
```

## Portfolio note

This repository is an independent portfolio project created to demonstrate implementation and documentation skills. Example data is synthetic. Adapt the project, explain your choices, and only claim work you can personally explain in an interview.

## License
MIT. See `LICENSE`.
