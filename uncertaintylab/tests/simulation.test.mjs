import test from "node:test";
import assert from "node:assert/strict";
import { createHistogram, HISTOGRAM_BINS, RANDOM_SEED, runSimulation, SAMPLE_COUNT, validateRows } from "../public/simulation.mjs";

const massRows = [
  { name: "length", nominal: 10, sigma: 0.2, unit: "cm" },
  { name: "width", nominal: 5, sigma: 0.1, unit: "cm" },
  { name: "thickness", nominal: 1, sigma: 0.05, unit: "cm" },
  { name: "density", nominal: 7.8, sigma: 0.1, unit: "g/cm³" },
];
const massExpression = "length * width * thickness * density";

test("runs 50,000 finite independent-normal samples and reports the nominal mass", () => {
  const result = runSimulation(massRows, massExpression);
  assert.equal(result.sampleCount, SAMPLE_COUNT);
  assert.equal(result.samples.length, SAMPLE_COUNT);
  assert.equal(result.nominalOutput, 390);
  assert.ok(Number.isFinite(result.mean));
  assert.ok(Number.isFinite(result.standardDeviation) && result.standardDeviation > 0);
  assert.ok(Number.isFinite(result.p025) && Number.isFinite(result.p975));
  assert.ok(result.p025 < result.mean && result.mean < result.p975);
  assert.equal(result.seed, RANDOM_SEED);
});

test("repeats the same seeded run exactly", () => {
  const first = runSimulation(massRows, massExpression);
  const second = runSimulation(massRows, massExpression);
  assert.deepEqual(second.samples, first.samples);
  assert.equal(second.mean, first.mean);
  assert.equal(second.standardDeviation, first.standardDeviation);
  assert.equal(second.p025, first.p025);
  assert.equal(second.p975, first.p975);
});

test("zero uncertainty produces a constant distribution with zero sample deviation", () => {
  const exactRows = massRows.map((row) => ({ ...row, sigma: 0 }));
  const result = runSimulation(exactRows, massExpression);
  assert.equal(result.mean, 390);
  assert.equal(result.standardDeviation, 0);
  assert.equal(result.p025, 390);
  assert.equal(result.p975, 390);
  const histogram = createHistogram(result.samples, result.nominalOutput, result.mean);
  assert.equal(histogram.constantOutput, true);
  assert.equal(histogram.counts.reduce((sum, count) => sum + count, 0), SAMPLE_COUNT);
});

test("validates rows, expression names, and finite sampled outputs", () => {
  assert.throws(() => runSimulation([], massExpression), /between 1 and 16/);
  assert.throws(() => runSimulation([{ ...massRows[0], sigma: -1 }], "length"), /nonnegative/);
  assert.throws(() => runSimulation([{ ...massRows[0], name: "x.y" }], "length"), /valid variable name/);
  assert.throws(() => runSimulation([massRows[0], massRows[0]], "length"), /unique/);
  assert.throws(() => runSimulation([{ ...massRows[0], nominal: 1e308, sigma: 1e308 }], "length"), /not finite/);
});

test("row validation identifies the first invalid field and enforces the 16-row cap", () => {
  assert.throws(() => validateRows([{ ...massRows[0], name: "" }]), (error) => {
    assert.equal(error.field, "name");
    assert.equal(error.rowIndex, 0);
    return true;
  });
  assert.throws(() => validateRows([{ ...massRows[0], nominal: Number.NaN }]), (error) => {
    assert.equal(error.field, "nominal");
    assert.equal(error.rowIndex, 0);
    return true;
  });
  assert.throws(() => validateRows([{ ...massRows[0], sigma: -0.1 }]), (error) => {
    assert.equal(error.field, "sigma");
    assert.equal(error.rowIndex, 0);
    return true;
  });
  const tooManyRows = Array.from({ length: 17 }, (_, index) => ({ name: `x${index}`, nominal: 1, sigma: 0 }));
  assert.throws(() => validateRows(tooManyRows), /between 1 and 16/);
});

test("bins the maximum in the final bin and includes out-of-range markers in the chart view", () => {
  const histogram = createHistogram([0, 1, 2, 3], 8, -2, 3);
  assert.deepEqual(histogram.counts, [1, 1, 2]);
  assert.equal(histogram.plotMin, -2);
  assert.equal(histogram.plotMax, 8);
});

test("uses one middle bin for a constant histogram and rejects unrepresentable ranges", () => {
  const histogram = createHistogram([4, 4, 4, 4], 4, 4, HISTOGRAM_BINS);
  assert.equal(histogram.counts[Math.floor(HISTOGRAM_BINS / 2)], 4);
  assert.equal(histogram.counts.filter((count) => count > 0).length, 1);
  assert.throws(() => createHistogram([-Number.MAX_VALUE, Number.MAX_VALUE], 0, 0), /range could not be represented/);
  assert.throws(() => createHistogram([Number.NaN], 0, 0), /must be finite/);
});
