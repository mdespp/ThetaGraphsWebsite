import { parseThetaInput, formatLatexInput, bfs } from "./functions.js";

function* generateCombinationsIndices(n, k, start = 0, combo = []) {
  if (combo.length === k) {
    yield combo.slice();
    return;
  }
  for (let i = start; i < n; i++) {
    combo.push(i);
    yield* generateCombinationsIndices(n, k, i + 1, combo);
    combo.pop();
  }
}

function combinationCount(n, k) {
  return math.combinations(n, k);
}

export async function findAllResolvingSets() {
  const inputRaw = document.getElementById("thetaInput").value;
  const k = parseInt(document.getElementById("allSizeInput").value);
  const outputDiv = document.getElementById("allOutput");
  outputDiv.innerHTML = "";

  if (isNaN(k) || k < 1) {
    outputDiv.innerHTML = "❌ Please enter a valid size.";
    return;
  }

  const paths = parseThetaInput(inputRaw);
  const latexInput = formatLatexInput(inputRaw);

  const graph = { c1: [], c2: [] };
  const vertices = ["c1", "c2"];

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

  const indexToName = vertices;
  const n = vertices.length;
  const totalCombos = combinationCount(n, k);

  const bfsMap = {};
  for (const v of vertices) {
    bfsMap[v] = bfs(graph, v);
  }

  const mathIntro = document.createElement("div");
  mathIntro.innerHTML = `\\[ \\text{Searching for resolving sets from}\\ \\Theta(${latexInput}) \\text{ of size}\\ ${k}  \\]`;


  const searchingLine = document.createElement("div");
  searchingLine.id = "searching-line";
  searchingLine.innerHTML = `<em>Searching... Tried 0 of ${totalCombos} combinations. Found 0 valid sets.</em>`;

  const totalLine = document.createElement("div");
  totalLine.innerHTML = `Total combinations: ${totalCombos}<br><br>`;

  const container = document.createElement("div");
  container.style.maxHeight = "200px";
  container.style.overflowY = "auto";

  outputDiv.appendChild(mathIntro);
  outputDiv.appendChild(searchingLine);
  outputDiv.appendChild(totalLine);
  outputDiv.appendChild(container);

  await MathJax.typesetPromise([mathIntro]);
  await new Promise(resolve => setTimeout(resolve));

  const allValidSets = [];
  let count = 0;
  let batchLatex = "";
  let lastUpdateTime = performance.now();

  for (const combo of generateCombinationsIndices(n, k)) {
    count++;
    const labelSet = new Set();

    for (let i = 0; i < n; i++) {
      const from = vertices[i];
      const label = combo.map(j => bfsMap[from][vertices[j]] ?? Infinity).join(",");
      labelSet.add(label);
    }

    if (labelSet.size === n) {
      const realCombo = combo.map(j => indexToName[j]);
      const latex = `W_{${allValidSets.length + 1}} = \\left\\{ ${realCombo.join(", ").replace(/c1/g, "c_1").replace(/c2/g, "c_2")} \\right\\}`;
      allValidSets.push(latex);

      const countNow = allValidSets.length;
      const shouldRender =
        countNow <= 100 ||
        (countNow <= 300 && countNow % 5 === 0) ||
        (countNow <= 500 && countNow % 10 === 0);

      if (shouldRender) {
        batchLatex += `\\( ${latex} \\)<br>`;
      }
    }

    const now = performance.now();
    if (now - lastUpdateTime >= 5000) {
      if (batchLatex.length > 0) {
        const tempWrapper = document.createElement("div");
        tempWrapper.innerHTML = batchLatex;
        container.appendChild(tempWrapper);
        batchLatex = "";

        await MathJax.typesetPromise([tempWrapper]);
      }

      searchingLine.innerHTML = `<em>Searching... Tried ${count} of ${totalCombos} combinations. Found ${allValidSets.length} valid sets.</em>`;
      lastUpdateTime = now;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  if (batchLatex.length > 0) {
    const finalWrapper = document.createElement("div");
    finalWrapper.innerHTML = batchLatex;
    container.appendChild(finalWrapper);
    await MathJax.typesetPromise([finalWrapper]);
  }

  searchingLine.innerHTML = `Found ${allValidSets.length} resolving sets.`;
  await MathJax.typesetPromise([searchingLine]);
}

window.findAllResolvingSets = findAllResolvingSets;