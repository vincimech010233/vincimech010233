import { evaluateExpression, parseExpression } from "./expression.mjs";

export const SAMPLE_COUNT = 50_000;
export const RANDOM_SEED = 42;
export const HISTOGRAM_BINS = 30;
const UINT32_RANGE = 2 ** 32;

export function createMulberry32(seed = RANDOM_SEED) {
  let state = seed >>> 0;
  return function nextUniform() {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    const word = (value ^ (value >>> 14)) >>> 0;
    return (word + 1) / (UINT32_RANGE + 1);
  };
}

function createNormalSampler(nextUniform) {
  let cachedNormal = null;
  return function nextNormal() {
    if (cachedNormal !== null) {
      const value = cachedNormal;
      cachedNormal = null;
      return value;
    }

    const u1 = nextUniform();
    const u2 = nextUniform();
    const radius = Math.sqrt(-2 * Math.log(u1));
    const angle = 2 * Math.PI * u2;
    const z0 = radius * Math.cos(angle);
    cachedNormal = radius * Math.sin(angle);
    return z0;
  };
}

export function validateRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > 16) {
    throw new Error("Use between 1 and 16 input variables");
  }
  const names = new Set();
  for (const [index, row] of rows.entries()) {
    if (!row || typeof row.name !== "string" || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(row.name)) {
      const error = new Error("Each input needs a valid variable name");
      error.field = "name";
      error.rowIndex = index;
      throw error;
    }
    if (names.has(row.name)) {
      const error = new Error(`Variable names must be unique: '${row.name}'`);
      error.field = "name";
      error.rowIndex = index;
      throw error;
    }
    names.add(row.name);
    if (!Number.isFinite(row.nominal)) {
      const error = new Error(`Nominal value for '${row.name}' must be finite`);
      error.field = "nominal";
      error.rowIndex = index;
      throw error;
    }
    if (!Number.isFinite(row.sigma) || row.sigma < 0) {
      const error = new Error(`Uncertainty (1σ) for '${row.name}' must be finite and nonnegative`);
      error.field = "sigma";
      error.rowIndex = index;
      throw error;
    }
  }
}

function percentile(sorted, probability) {
  const position = (sorted.length - 1) * probability;
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.ceil(position);
  const fraction = position - lowerIndex;
  return sorted[lowerIndex] + (sorted[upperIndex] - sorted[lowerIndex]) * fraction;
}

export function runSimulation(rows, expression) {
  validateRows(rows);
  const variableNames = rows.map((row) => row.name);
  const ast = parseExpression(expression, variableNames);
  const nominalValues = rows.map((row) => row.nominal);
  const nominalOutput = evaluateExpression(ast, nominalValues);

  const nextNormal = createNormalSampler(createMulberry32(RANDOM_SEED));
  const inputValues = new Float64Array(rows.length);
  const samples = new Float64Array(SAMPLE_COUNT);
  let mean = 0;
  let sumSquaredDifferences = 0;

  for (let sampleIndex = 0; sampleIndex < SAMPLE_COUNT; sampleIndex += 1) {
    for (let variableIndex = 0; variableIndex < rows.length; variableIndex += 1) {
      const row = rows[variableIndex];
      const standardNormal = nextNormal();
      inputValues[variableIndex] = row.nominal + row.sigma * standardNormal;
      if (!Number.isFinite(inputValues[variableIndex])) {
        throw new Error(`A sampled value for '${row.name}' was not finite`);
      }
    }

    const value = evaluateExpression(ast, inputValues);
    if (!Number.isFinite(value)) {
      throw new Error("A simulated result was not finite");
    }
    samples[sampleIndex] = value;

    const delta = value - mean;
    mean += delta / (sampleIndex + 1);
    const deltaAfterUpdate = value - mean;
    sumSquaredDifferences += delta * deltaAfterUpdate;
    if (!Number.isFinite(mean) || !Number.isFinite(sumSquaredDifferences)) {
      throw new Error("The simulation statistics were not finite");
    }
  }

  const standardDeviation = Math.sqrt(sumSquaredDifferences / (SAMPLE_COUNT - 1));
  if (!Number.isFinite(standardDeviation)) {
    throw new Error("The simulation standard deviation was not finite");
  }

  const sorted = samples.slice().sort();
  const p025 = percentile(sorted, 0.025);
  const p975 = percentile(sorted, 0.975);
  if (!Number.isFinite(p025) || !Number.isFinite(p975)) {
    throw new Error("The simulation percentile interval was not finite");
  }

  return {
    samples,
    nominalOutput,
    mean,
    standardDeviation,
    p025,
    p975,
    sampleCount: SAMPLE_COUNT,
    seed: RANDOM_SEED,
  };
}

export function createHistogram(samples, nominalOutput, sampleMean, binCount = HISTOGRAM_BINS) {
  if (!samples || samples.length === 0 || !Number.isInteger(binCount) || binCount < 1) {
    throw new Error("Histogram needs sample values and a positive number of bins");
  }
  if (!Number.isFinite(nominalOutput) || !Number.isFinite(sampleMean)) {
    throw new Error("Histogram markers must be finite");
  }

  let sampleMin = Infinity;
  let sampleMax = -Infinity;
  for (const value of samples) {
    if (!Number.isFinite(value)) throw new Error("Histogram samples must be finite");
    if (value < sampleMin) sampleMin = value;
    if (value > sampleMax) sampleMax = value;
  }

  const counts = new Array(binCount).fill(0);
  if (sampleMin === sampleMax) {
    counts[Math.floor(binCount / 2)] = samples.length;
  } else {
    const sampleRange = sampleMax - sampleMin;
    if (!Number.isFinite(sampleRange) || sampleRange <= 0) {
      throw new Error("The histogram range could not be represented");
    }
    for (const value of samples) {
      const rawIndex = Math.floor(((value - sampleMin) / sampleRange) * binCount);
      const index = Math.min(binCount - 1, Math.max(0, rawIndex));
      counts[index] += 1;
    }
  }

  const plotMin = Math.min(sampleMin, nominalOutput, sampleMean);
  const plotMax = Math.max(sampleMax, nominalOutput, sampleMean);
  if (!Number.isFinite(plotMax - plotMin)) {
    throw new Error("The chart range could not be represented");
  }
  return {
    counts,
    binCount,
    sampleMin,
    sampleMax,
    plotMin,
    plotMax,
    nominalOutput,
    sampleMean,
    constantOutput: sampleMin === sampleMax,
  };
}
