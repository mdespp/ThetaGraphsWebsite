export function parseThetaInput(inputStr) {
  const terms = inputStr
    .split(",")
    .map((x) => x.trim())
    .filter((x) => x.length > 0);
  const expanded = [];

  for (let term of terms) {
    const match = term.match(/^(\d+)\^(\d+)$/);
    if (match) {
      const base = parseInt(match[1]);
      const count = parseInt(match[2]);
      for (let i = 0; i < count; i++) expanded.push(base);
    } else {
      const num = parseInt(term);
      if (!isNaN(num)) expanded.push(num);
    }
  }

  return expanded;
}

export function formatLatexInput(inputStr) {
  return inputStr
    .split(",")
    .map((x) => x.trim())
    .filter((x) => x.length > 0)
    .map((x) => {
      const match = x.match(/^(\d+)\^(\d+)$/);
      return match ? `${match[1]}^{${match[2]}}` : x;
    })
    .join(", ");
}

export function bfs(graph, src) {
  const dist = {};
  const visited = new Set();
  const queue = [[src, 0]];
  while (queue.length) {
    const [node, d] = queue.shift();
    if (!visited.has(node)) {
      visited.add(node);
      dist[node] = d;
      (graph[node] || []).forEach((n) => queue.push([n, d + 1]));
    }
  }
  return dist;
}

export function combinations(arr, k) {
  const res = [];
  const helper = (start, combo) => {
    if (combo.length === k) {
      res.push(combo);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      helper(i + 1, combo.concat(arr[i]));
    }
  };
  helper(0, []);
  return res;
}
function* generateCombinations(arr, k, start = 0, path = []) {
  if (path.length === k) {
    yield path;
    return;
  }
  for (let i = start; i < arr.length; i++) {
    yield* generateCombinations(arr, k, i + 1, path.concat(arr[i]));
  }
}

export function existsResolvingSet(inputStr, m) {
  const paths = parseThetaInput(inputStr);
  const graph = {};
  graph["c1"] = [];
  graph["c2"] = [];
  const vertices = ["c1", "c2"];
  paths.forEach((length, i) => {
    for (let j = 1; j <= length; j++) {
      const v = `v_{${i + 1},${j}}`;
      vertices.push(v);
      if (j === 1) {
        graph["c1"].push(v);
        graph[v] = (graph[v] || []).concat("c1"); // Add v_{i,1} → c1
      }
      if (j === length) {
        graph["c2"].push(v);
        graph[v] = (graph[v] || []).concat("c2"); // Add v_{i,length} → c2
      }
      if (j > 1) {
        const prev = `v_{${i + 1},${j - 1}}`;
        graph[prev] = (graph[prev] || []).concat(v); // prev → v
        graph[v] = (graph[v] || []).concat(prev); // v → prev (new!)
      }
    }
  });
  const distances = {};
  for (const v of vertices) {
    distances[v] = bfs(graph, v);
  }
  for (const combo of generateCombinations(vertices, m)) {
    const labels = new Set();
    let isUnique = true;
    for (const v of vertices) {
      const label = combo.map((u) => distances[v][u] ?? Infinity).join(",");
      //console.log(label, combo)
      if (labels.has(label)) {
        isUnique = false;
        break;
      }
      labels.add(label);
    }
    if (isUnique) return combo;
  }

  return null;
}
