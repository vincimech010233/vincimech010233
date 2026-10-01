import { ExpressionError, parseExpression } from "./expression.mjs";
import { createHistogram, runSimulation, validateRows } from "./simulation.mjs";
import { renderHistogram, formatNumber } from "./histogram.mjs?v=responsive-layout";

const DEFAULT_EXPRESSION = "length * width * thickness * density";
const BUILT_IN_UNITS = new Map([
  ["length", "cm"],
  ["width", "cm"],
  ["thickness", "cm"],
  ["density", "g/cm³"],
]);
const RESERVED_FUNCTIONS = new Set(["abs", "sqrt", "exp", "log", "sin", "cos"]);

const variableRows = document.querySelector("#variable-rows");
const variableCount = document.querySelector("#variable-count");
const modelBadge = document.querySelector("#model-badge");
const addVariableButton = document.querySelector("#add-variable-button");
const expressionInput = document.querySelector("#expression");
const runButton = document.querySelector("#run-button");
const runStatus = document.querySelector("#run-status");
const runError = document.querySelector("#run-error");
const emptyState = document.querySelector("#empty-state");
const resultLayout = document.querySelector("#result-layout");
const outputHeading = document.querySelector("#results-heading");
const sampleMeta = document.querySelector("#sample-meta");
const histogramContainer = document.querySelector("#histogram");
let nextRowId = variableRows.querySelectorAll(".variable-row").length + 1;

function readRows() {
  return [...variableRows.querySelectorAll(".variable-row")].map((row) => ({
    name: row.querySelector(".variable-name-input").value,
    nominal: row.querySelector(".nominal-input").valueAsNumber,
    sigma: row.querySelector(".sigma-input").valueAsNumber,
    unit: row.querySelector(".unit-input").value,
  }));
}

function isBuiltInMass(rows, expression) {
  if (expression.trim() !== DEFAULT_EXPRESSION) return false;
  const units = new Map(rows.map(({ name, unit }) => [name, unit.trim()]));
  for (const [name, unit] of BUILT_IN_UNITS) {
    if (units.get(name) !== unit) return false;
  }
  return true;
}

function updateOutputHeading() {
  outputHeading.textContent = isBuiltInMass(readRows(), expressionInput.value)
    ? "Mass (g)"
    : "Result (unit not inferred)";
}

function resetSummary() {
  for (const id of ["mean-value", "sd-value", "interval-value", "count-value", "seed-value"]) {
    document.querySelector(`#${id}`).textContent = "—";
  }
}

function clearResults(statusText = "Inputs changed. Run simulation to update results.") {
  resultLayout.hidden = true;
  emptyState.hidden = false;
  runError.hidden = true;
  runError.textContent = "";
  sampleMeta.hidden = true;
  histogramContainer.replaceChildren();
  resetSummary();
  updateOutputHeading();
  runStatus.textContent = statusText;
}

function updateRowAccessibility() {
  for (const row of variableRows.querySelectorAll(".variable-row")) {
    const name = row.querySelector(".variable-name-input").value.trim() || "variable";
    row.querySelector(".variable-name-input").setAttribute("aria-label", `${name} variable name`);
    row.querySelector(".nominal-input").setAttribute("aria-label", `${name} nominal value`);
    row.querySelector(".sigma-input").setAttribute("aria-label", `${name} uncertainty, one standard deviation`);
    row.querySelector(".unit-input").setAttribute("aria-label", `${name} unit`);
    row.querySelector(".remove-row-button").setAttribute("aria-label", `Remove ${name}`);
  }
}

function updateRowControls() {
  const rows = [...variableRows.querySelectorAll(".variable-row")];
  variableCount.textContent = `${rows.length} of 16 variables`;
  addVariableButton.disabled = rows.length >= 16;
  for (const row of rows) {
    row.querySelector(".remove-row-button").disabled = rows.length <= 1;
  }
  updateRowAccessibility();
}

function markModelEdited() {
  modelBadge.textContent = "EDITED MODEL";
  updateRowControls();
  clearResults();
}

function createVariableRow() {
  const row = document.createElement("tr");
  row.className = "variable-row";
  row.dataset.rowId = `row-${nextRowId}`;
  nextRowId += 1;

  const nameCell = document.createElement("th");
  nameCell.scope = "row";
  const nameInput = document.createElement("input");
  nameInput.className = "variable-name-input";
  nameInput.type = "text";
  nameInput.autocomplete = "off";
  nameInput.spellcheck = false;
  nameInput.setAttribute("aria-label", "variable name");
  nameCell.append(nameInput);

  const nominalCell = document.createElement("td");
  const nominalInput = document.createElement("input");
  nominalInput.className = "numeric-input nominal-input";
  nominalInput.type = "number";
  nominalInput.step = "any";
  nominalInput.setAttribute("aria-label", "variable nominal value");
  nominalCell.append(nominalInput);

  const sigmaCell = document.createElement("td");
  const sigmaInput = document.createElement("input");
  sigmaInput.className = "numeric-input sigma-input";
  sigmaInput.type = "number";
  sigmaInput.step = "any";
  sigmaInput.min = "0";
  sigmaInput.setAttribute("aria-label", "variable uncertainty, one standard deviation");
  sigmaCell.append(sigmaInput);

  const unitCell = document.createElement("td");
  const unitInput = document.createElement("input");
  unitInput.className = "unit-input";
  unitInput.type = "text";
  unitInput.setAttribute("aria-label", "variable unit");
  unitCell.append(unitInput);

  const actionCell = document.createElement("td");
  actionCell.className = "row-action-cell";
  const removeButton = document.createElement("button");
  removeButton.className = "remove-row-button";
  removeButton.type = "button";
  removeButton.textContent = "Remove";
  removeButton.setAttribute("aria-label", "Remove variable");
  actionCell.append(removeButton);

  row.append(nameCell, nominalCell, sigmaCell, unitCell, actionCell);
  return row;
}

function focusErrorField(error, rows) {
  if (Number.isInteger(error?.rowIndex) && rows[error.rowIndex]) {
    const fieldClass = {
      name: ".variable-name-input",
      nominal: ".nominal-input",
      sigma: ".sigma-input",
    }[error.field];
    if (fieldClass) {
      variableRows.querySelectorAll(".variable-row")[error.rowIndex]?.querySelector(fieldClass)?.focus();
      return;
    }
  }

  const reservedName = /^'([^']+)' is reserved/.exec(error?.message ?? "")?.[1];
  if (reservedName) {
    const matchingInput = [...variableRows.querySelectorAll(".variable-name-input")]
      .find((input) => input.value === reservedName);
    matchingInput?.focus();
    return;
  }

  if (error instanceof ExpressionError) expressionInput.focus();
  else if (/between 1 and 16/.test(error?.message ?? "")) addVariableButton.focus();
}

function writeSummary(result, outputLabel) {
  const unitSuffix = outputLabel === "Mass (g)" ? " g" : "";
  document.querySelector("#mean-value").textContent = `${formatNumber(result.mean)}${unitSuffix}`;
  document.querySelector("#sd-value").textContent = `${formatNumber(result.standardDeviation)}${unitSuffix}`;
  document.querySelector("#interval-value").textContent = `${formatNumber(result.p025)} – ${formatNumber(result.p975)}${unitSuffix}`;
  document.querySelector("#count-value").textContent = result.sampleCount.toLocaleString("en");
  document.querySelector("#seed-value").textContent = String(result.seed);
}

async function handleRun() {
  runButton.disabled = true;
  clearResults("Running simulation…");
  await new Promise((resolve) => window.requestAnimationFrame(resolve));

  const rows = readRows();
  const expression = expressionInput.value;
  try {
    validateRows(rows);
    parseExpression(expression, rows.map(({ name }) => name));
    const result = runSimulation(rows, expression);
    const histogram = createHistogram(result.samples, result.nominalOutput, result.mean);
    const outputLabel = isBuiltInMass(rows, expression) ? "Mass (g)" : "Result (unit not inferred)";

    outputHeading.textContent = outputLabel;
    writeSummary(result, outputLabel);
    resultLayout.hidden = false;
    renderHistogram(histogramContainer, histogram, outputLabel, result.sampleCount);
    sampleMeta.textContent = `${result.sampleCount.toLocaleString("en")} samples · Seed ${result.seed}`;
    sampleMeta.hidden = false;
    runError.hidden = true;
    emptyState.hidden = true;
    runStatus.textContent = "Completed locally.";
  } catch (error) {
    histogramContainer.replaceChildren();
    resultLayout.hidden = true;
    emptyState.hidden = true;
    sampleMeta.hidden = true;
    resetSummary();
    runError.textContent = error instanceof Error ? error.message : "The simulation could not be completed.";
    runError.hidden = false;
    runStatus.textContent = "Simulation could not complete.";
    focusErrorField(error, rows);
  } finally {
    runButton.disabled = false;
  }
}

function handleModelEdit() {
  markModelEdited();
}

variableRows.addEventListener("input", handleModelEdit);
variableRows.addEventListener("click", (event) => {
  const removeButton = event.target.closest(".remove-row-button");
  if (!removeButton) return;

  const rows = [...variableRows.querySelectorAll(".variable-row")];
  if (rows.length <= 1) return;
  const row = removeButton.closest(".variable-row");
  const nextFocusRow = row.nextElementSibling ?? row.previousElementSibling;
  row.remove();
  markModelEdited();
  nextFocusRow?.querySelector(".variable-name-input")?.focus();
});

addVariableButton.addEventListener("click", () => {
  if (variableRows.querySelectorAll(".variable-row").length >= 16) return;
  const row = createVariableRow();
  variableRows.append(row);
  markModelEdited();
  row.querySelector(".variable-name-input").focus();
});

expressionInput.addEventListener("input", handleModelEdit);
runButton.addEventListener("click", handleRun);
updateRowControls();
