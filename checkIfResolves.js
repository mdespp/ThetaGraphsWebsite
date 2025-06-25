import { parseThetaInput, bfs } from "./functions.js";

export function checkIfResolves() {
  const inputRaw = document.getElementById("thetaInput").value;
  const testSetRaw = document.getElementById("testSetInput").value;
  const outputDiv = document.getElementById("testOutput");
  outputDiv.innerHTML = "";

  const paths = parseThetaInput(inputRaw);
  const vertices = ["c1", "c2"];
  const graph = { c1: [], c2: [] };

  paths.forEach((length, i) => {
    for (let j = 1; j <= length; j++) {
      const v = `v_{${i + 1},${j}}`;
      vertices.push(v);
      if (j === 1) {
        graph["c1"].push(v);
        graph[v] = (graph[v] || []).concat("c1");
      }
      if (j === length) {
        graph["c2"].push(v);
        graph[v] = (graph[v] || []).concat("c2");
      }
      if (j > 1) {
        const prev = `v_{${i + 1},${j - 1}}`;
        graph[prev] = (graph[prev] || []).concat(v);
        graph[v] = (graph[v] || []).concat(prev);
      }
    }
  });

  const bfsMap = {};
  for (const v of vertices) {
    bfsMap[v] = bfs(graph, v);
  }

  const testSet = Array.from(testSetRaw.matchAll(/c_\d+|v_\{\s*\d+\s*,\s*\d+\s*\}/g)).map(m =>
    m[0].replace(/^c_(\d+)$/, "c$1").replace(/\s+/g, "")
  );

  const labelSet = new Set();

  for (const from of vertices) {
    const label = testSet.map(to => bfsMap[from][to] ?? Infinity).join(",");
    labelSet.add(label);
  }

  const result = document.createElement("div");
  result.innerHTML = labelSet.size === vertices.length
    ? "✅ The set resolves the graph."
    : "❌ The set does NOT resolve the graph.";
  outputDiv.appendChild(result);
}

window.checkIfResolves = checkIfResolves;

export function showDistanceVectors() {
  const inputRaw = document.getElementById("thetaInput").value;
  const testSetRaw = document.getElementById("testSetInput").value;
  const outputDiv = document.getElementById("testOutput");
  outputDiv.innerHTML = "";

  const paths = parseThetaInput(inputRaw);
  const vertices = ["c1", "c2"];
  const graph = { c1: [], c2: [] };

  paths.forEach((length, i) => {
    for (let j = 1; j <= length; j++) {
      const v = `v_{${i + 1},${j}}`;
      vertices.push(v);
      if (j === 1) {
        graph["c1"].push(v);
        graph[v] = (graph[v] || []).concat("c1");
      }
      if (j === length) {
        graph["c2"].push(v);
        graph[v] = (graph[v] || []).concat("c2");
      }
      if (j > 1) {
        const prev = `v_{${i + 1},${j - 1}}`;
        graph[prev] = (graph[prev] || []).concat(v);
        graph[v] = (graph[v] || []).concat(prev);
      }
    }
  });

  const bfsMap = {};
  for (const v of vertices) {
    bfsMap[v] = bfs(graph, v);
  }

  const testSet = Array.from(testSetRaw.matchAll(/c_\d+|v_\{\s*\d+\s*,\s*\d+\s*\}/g)).map(m =>
    m[0].replace(/^c_(\d+)$/, "c$1").replace(/\s+/g, "")
  );

  const labelMap = new Map();

  for (const from of vertices) {
    const vector = testSet.map(to => bfsMap[from][to] ?? Infinity).join(",");
    if (!labelMap.has(vector)) labelMap.set(vector, []);
    labelMap.get(vector).push(from);
  }

  const scrollBox = document.createElement("div");
  scrollBox.style.maxHeight = "200px";
  scrollBox.style.overflowY = "auto";
  scrollBox.style.padding = "8px";
  scrollBox.style.border = "1px solid #ccc";
  scrollBox.style.borderRadius = "10px";
  scrollBox.style.background = "#fff";

  const sortedEntries = Array.from(labelMap.entries()).sort((a, b) => a[1].length - b[1].length);

  for (const [vector, verts] of sortedEntries) {
    if (verts.length === 1) {
      const para = document.createElement("div");
      para.innerHTML = `\\( r(${verts[0].replace("c1", "c_1").replace("c2", "c_2")} \\,|\\, W) = (${vector}) \\)`;
      scrollBox.appendChild(para);
    } else {
      const group = document.createElement("div");
      group.style.marginBottom = "1em";
      const title = document.createElement("div");
      title.innerHTML = `These ${verts.length} vertices share \\( r(v \\,|\\, W) = (${vector}) \\\)`;
      group.appendChild(title);

      for (const v of verts) {
        const para = document.createElement("div");
        para.innerHTML = `\\( r(${v.replace("c1", "c_1").replace("c2", "c_2")} \\,|\\, W) = (${vector}) \\)`;
        group.appendChild(para);
      }

      scrollBox.appendChild(group);
    }
  }

  outputDiv.appendChild(scrollBox);
  if (window.MathJax) MathJax.typesetPromise([scrollBox]);
}

window.showDistanceVectors = showDistanceVectors;