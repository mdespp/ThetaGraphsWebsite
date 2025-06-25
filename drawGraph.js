import { parseThetaInput, bfs } from "./functions.js";

export function drawGraphFromInput() {
  const inputRaw = document.getElementById("thetaInput").value;
  const resolvingRaw = document.getElementById("testSetInput").value;

  const resolvingRawNormalized = resolvingRaw.replace(/c_(\d+)/g, "c$1").replace(/\s+/g, "");
  const resolvingSet = Array.from(resolvingRawNormalized.matchAll(/c\d+|v_\{\d+,\d+\}/g)).map(m => m[0]);

  const container = document.getElementById("testOutput");
  container.innerHTML = "";

  const paths = parseThetaInput(inputRaw);

  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 700;
  container.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "16px Arial";

  const cx = 100, cy = canvas.height / 2;
  const dx = canvas.width - 100, dy = canvas.height / 2;
  const verticalSpacing = 90;
  const pathStartX = cx + 60;
  const pathEndX = dx - 60;
  const vertexRadius = 14;

  const vertices = ["c1", "c2"];
  const graph = { c1: [], c2: [] };
  const positions = { c1: { x: cx, y: cy }, c2: { x: dx, y: dy } };

  paths.forEach((len, i) => {
    const y = cy + (i - (paths.length - 1) / 2) * verticalSpacing;
    const stepX = (pathEndX - pathStartX) / (len + 1);
    let prev = "c1";

    for (let j = 1; j <= len; j++) {
      const v = `v_{${i + 1},${j}}`;
      vertices.push(v);
      positions[v] = { x: pathStartX + j * stepX, y };

      graph[prev] = (graph[prev] || []).concat(v);
      graph[v] = (graph[v] || []).concat(prev);

      prev = v;
    }

    graph[prev] = (graph[prev] || []).concat("c2");
    graph["c2"].push(prev);
  });

  const bfsMap = {};
  for (const v of vertices) bfsMap[v] = bfs(graph, v);

  const labelGroups = new Map();
  const vertexLabels = {};
  for (const v of vertices) {
    const vector = resolvingSet.map(r => bfsMap[v][r] ?? "∞").join(",");
    vertexLabels[v] = vector;
    if (!labelGroups.has(vector)) labelGroups.set(vector, []);
    labelGroups.get(vector).push(v);
  }

  const groupColors = ["#e6194B", "#3cb44b", "#4363d8", "#d66618", "#292557", "#831785", "#038a10", "#2f7504", "#f0167f"];
  const colorMap = {};
  let colorIndex = 0;
  for (const [_, group] of labelGroups) {
    const color = groupColors[colorIndex++ % groupColors.length];
    for (const v of group) {
      colorMap[v] = color;
    }
  }

  for (const v of vertices) {
    for (const u of graph[v]) {
      const { x: x1, y: y1 } = positions[v];
      const { x: x2, y: y2 } = positions[u];
      if (vertices.indexOf(u) < vertices.indexOf(v)) continue;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  const sub = n => String(n).replace(/\d/g, d => "₀₁₂₃₄₅₆₇₈₉"[+d]);

  for (const v of vertices) {
    const { x, y } = positions[v];
    const isRes = resolvingSet.includes(v);
    const vector = vertexLabels[v];

    ctx.beginPath();
    ctx.arc(x, y, vertexRadius, 0, 2 * Math.PI);
    ctx.fillStyle = isRes ? "#a6d5fa" : "white";
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "black";
    let label;
    if (v === "c1") label = "c₁";
    else if (v === "c2") label = "c₂";
    else {
      const match = v.match(/\{(\d+),(\d+)\}/);
      label = `v${sub(match[1])}${sub(match[2])}`;
    }
    ctx.fillText(label, x - 12, y + 5);

    ctx.fillStyle = "#444";
    ctx.font = "14px Arial";
    ctx.fillText(`(${vector})`, x - 22, y + 26);
    ctx.font = "16px Arial";

    // Draw color-coded X
    if (labelGroups.get(vector).length > 1) {
      ctx.strokeStyle = colorMap[v];
      ctx.lineWidth = 3; 
      ctx.beginPath();
      ctx.moveTo(x - 10, y - 10);
      ctx.lineTo(x + 10, y + 10);
      ctx.moveTo(x + 10, y - 10);
      ctx.lineTo(x - 10, y + 10);
      ctx.stroke();
      ctx.lineWidth = 1; 
      ctx.strokeStyle = "black";
    }
  }
}

window.drawGraphFromInput = drawGraphFromInput;
