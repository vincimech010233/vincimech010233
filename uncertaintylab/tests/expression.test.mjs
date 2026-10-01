import test from "node:test";
import assert from "node:assert/strict";
import { evaluateExpression, parseExpression } from "../public/expression.mjs";

const names = ["length", "width", "thickness", "density"];

function calculate(source, values = [10, 5, 1, 7.8], variableNames = names) {
  return evaluateExpression(parseExpression(source, variableNames), values);
}

test("evaluates the built-in mass expression to the nominal 390 g", () => {
  assert.equal(calculate("length * width * thickness * density"), 390);
});

test("supports arithmetic precedence, right-associative powers, unary signs, and allowlisted functions", () => {
  assert.equal(calculate("length + width * thickness"), 15);
  assert.equal(calculate("(length + width) * thickness"), 15);
  assert.equal(calculate("-length ** thickness"), -10);
  assert.equal(calculate("length ** width ** thickness"), 100_000);
  assert.equal(calculate("sqrt(width * width) + abs(-thickness)"), 6);
});

test("rejects numeric literals, unknown names, arbitrary code, attributes, and unlisted functions", () => {
  for (const expression of [
    "length * 2",
    "missing + length",
    "globalThis.process",
    "length.constructor",
    "Math.abs(length)",
    "eval(length)",
    "pow(length, width)",
    "length ** ** width",
  ]) {
    assert.throws(() => parseExpression(expression, names), { name: "ExpressionError" }, expression);
  }
});

test("rejects malformed and over-limit expressions and invalid variable declarations", () => {
  assert.throws(() => parseExpression("", names), /Expected a declared variable/);
  assert.throws(() => parseExpression("length +", names), /Expected a declared variable/);
  assert.throws(() => parseExpression("length".repeat(86), names), /512 characters/);
  assert.throws(() => parseExpression("length", []), /at least one input/);
  assert.throws(() => parseExpression("length", [...names, "abs"]), /reserved/);
  assert.throws(() => parseExpression("length", ["length", "length"]), /unique/);
  assert.throws(() => parseExpression("length", Array.from({ length: 17 }, (_, i) => `x${i}`)), /16 input/);
});

test("rejects division by zero and any non-finite intermediate or function result", () => {
  assert.throws(() => calculate("length / (width - width)"), /Division by zero/);
  assert.throws(() => calculate("sqrt(-length)"), /non-finite/);
  assert.throws(() => calculate("exp(density * density * density * density * density)"), /non-finite/);
});
