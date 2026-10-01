const SVG_NS = "http://www.w3.org/2000/svg";
const VIEW_WIDTH = 760;
const VIEW_HEIGHT = 390;
const WIDE_MARGIN = { top: 34, right: 26, bottom: 78, left: 76 };
const NARROW_MARGIN = { top: 32, right: 16, bottom: 132, left: 48 };

export function formatNumber(value) {
  return new Intl.NumberFormat("en", { maximumSignificantDigits: 5 }).format(value);
}

function svgNode(name, attributes = {}, text = null) {
  const element = document.createElementNS(SVG_NS, name);
  for (const [attribute, value] of Object.entries(attributes)) {
    element.setAttribute(attribute, String(value));
  }
  if (text !== null) element.textContent = text;
  return element;
}

function addText(svg, text, x, y, className, anchor = "middle") {
  svg.append(svgNode("text", { x, y, class: className, "text-anchor": anchor }, text));
}

export function renderHistogram(container, histogram, outputLabel, sampleCount) {
  const viewWidth = Math.max(240, Math.min(VIEW_WIDTH, container.clientWidth || VIEW_WIDTH));
  const narrow = viewWidth < 520;
  const viewHeight = narrow ? 360 : VIEW_HEIGHT;
  const margin = narrow ? NARROW_MARGIN : WIDE_MARGIN;
  const svg = svgNode("svg", {
    viewBox: `0 0 ${viewWidth} ${viewHeight}`,
    role: "img",
    "aria-labelledby": "distribution-title distribution-description",
    focusable: "false",
  });
  const title = outputLabel === "Mass (g)" ? "Mass output distribution" : "Output distribution";
  svg.append(svgNode("title", { id: "distribution-title" }, title));
  svg.append(svgNode(
    "desc",
    { id: "distribution-description" },
    `${sampleCount.toLocaleString("en")} Monte Carlo samples. The histogram includes markers for the nominal output ${formatNumber(histogram.nominalOutput)} and sample mean ${formatNumber(histogram.sampleMean)}.`,
  ));

  const plotLeft = margin.left;
  const plotTop = margin.top;
  const plotWidth = viewWidth - margin.left - margin.right;
  const plotHeight = viewHeight - margin.top - margin.bottom;
  const plotBottom = plotTop + plotHeight;
  const maximumCount = Math.max(...histogram.counts, 1);
  const xFor = (value) => {
    if (histogram.plotMax === histogram.plotMin) return plotLeft + plotWidth / 2;
    return plotLeft + ((value - histogram.plotMin) / (histogram.plotMax - histogram.plotMin)) * plotWidth;
  };

  for (const fraction of [0, 0.5, 1]) {
    const y = plotBottom - fraction * plotHeight;
    svg.append(svgNode("line", { x1: plotLeft, y1: y, x2: plotLeft + plotWidth, y2: y, class: "chart-grid" }));
    addText(svg, formatNumber(Math.round(maximumCount * fraction)), plotLeft - 12, y + 4, "chart-tick", "end");
  }

  svg.append(svgNode("line", { x1: plotLeft, y1: plotTop, x2: plotLeft, y2: plotBottom, class: "chart-axis" }));
  svg.append(svgNode("line", { x1: plotLeft, y1: plotBottom, x2: plotLeft + plotWidth, y2: plotBottom, class: "chart-axis" }));

  const sampleRange = histogram.sampleMax - histogram.sampleMin;
  const baseBarGap = 1;
  histogram.counts.forEach((count, index) => {
    if (count === 0) return;
    const x1 = histogram.constantOutput
      ? xFor(histogram.sampleMin) - 4
      : xFor(histogram.sampleMin + (sampleRange * index) / histogram.binCount);
    const x2 = histogram.constantOutput
      ? x1 + 8
      : xFor(histogram.sampleMin + (sampleRange * (index + 1)) / histogram.binCount);
    const width = Math.max(1, x2 - x1 - baseBarGap);
    const height = (count / maximumCount) * plotHeight;
    svg.append(svgNode("rect", {
      x: x1,
      y: plotBottom - height,
      width,
      height,
      rx: 2,
      class: "histogram-bar",
    }));
  });

  const markers = [
    { label: `Nominal ${formatNumber(histogram.nominalOutput)}`, value: histogram.nominalOutput, className: "nominal-marker" },
    { label: `Mean ${formatNumber(histogram.sampleMean)}`, value: histogram.sampleMean, className: "mean-marker" },
  ];
  for (const marker of markers) {
    const x = xFor(marker.value);
    svg.append(svgNode("line", { x1: x, y1: plotTop, x2: x, y2: plotBottom, class: `chart-marker ${marker.className}` }));
  }

  const tickPositions = histogram.plotMin === histogram.plotMax
    ? [{ value: histogram.plotMin, x: plotLeft + plotWidth / 2 }]
    : [
      { value: histogram.plotMin, x: plotLeft },
      { value: histogram.plotMin + (histogram.plotMax - histogram.plotMin) / 2, x: plotLeft + plotWidth / 2 },
      { value: histogram.plotMax, x: plotLeft + plotWidth },
    ];
  for (const tick of tickPositions) {
    svg.append(svgNode("line", { x1: tick.x, y1: plotBottom, x2: tick.x, y2: plotBottom + 5, class: "chart-axis" }));
    addText(svg, formatNumber(tick.value), tick.x, plotBottom + 23, "chart-tick");
  }

  svg.append(svgNode("text", {
    x: 19,
    y: plotTop + plotHeight / 2,
    class: "chart-axis-label",
    "text-anchor": "middle",
    transform: `rotate(-90 19 ${plotTop + plotHeight / 2})`,
  }, "Sample count"));
  const unitSuffix = outputLabel === "Mass (g)" ? " (g)" : "";
  addText(svg, `Output${unitSuffix}`, plotLeft + plotWidth / 2, narrow ? plotBottom + 54 : viewHeight - 38, "chart-axis-label");

  const legendY = viewHeight - 11;
  const legendItems = narrow
    ? [
      { x: plotLeft + 2, y: viewHeight - 48, label: markers[0].label, className: markers[0].className },
      { x: plotLeft + 2, y: viewHeight - 22, label: markers[1].label, className: markers[1].className },
    ]
    : [
      { x: plotLeft + 20, y: legendY, label: markers[0].label, className: markers[0].className },
      { x: plotLeft + viewWidth / 2 + 10, y: legendY, label: markers[1].label, className: markers[1].className },
    ];
  for (const item of legendItems) {
    svg.append(svgNode("line", {
      x1: item.x,
      y1: item.y - 4,
      x2: item.x + 26,
      y2: item.y - 4,
      class: `chart-marker ${item.className}`,
    }));
    addText(svg, item.label, item.x + 34, item.y, "chart-legend", "start");
  }

  container.replaceChildren(svg);
}
