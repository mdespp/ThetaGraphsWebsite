import { parseThetaInput, formatLatexInput, existsResolvingSet } from './functions.js';

window.updateLatexPreview = function updateLatexPreview() {
  const input = document.getElementById("thetaInput").value;
  const formatted = formatLatexInput(input);
  const preview = document.getElementById("latexPreview");
  preview.innerHTML = `\\( G = \\Theta(${formatted}) \\)`;
  if (window.MathJax) MathJax.typesetPromise();
};

window.checkMetric = function checkMetric() {
  const inputRaw = document.getElementById("thetaInput").value;
  const guess = document.getElementById("guessInput").value;
  const output = document.getElementById("output");

  const guessNumber = parseInt(guess.trim());
  const expandedParts = parseThetaInput(inputRaw);
  if (expandedParts.length < 2) {
    output.innerHTML = "❌ Please enter at least two valid path lengths.";
    return;
  }

  if (isNaN(guessNumber)) {
    output.innerHTML = "❌ Please enter a valid number for the metric dimension guess.";
    return;
  }
  const latexInput = formatLatexInput(inputRaw);
  const resolvingSet = existsResolvingSet(inputRaw, guessNumber);

  if (resolvingSet) {
    output.style.color = "green";
    output.innerHTML = `There exists a resolving set for \\( \\Theta(${latexInput}) \\) of size ${guessNumber}: \\( \\{ ${resolvingSet.join(", ").replace("c1", "c_1").replace("c2", "c_2")} \\} \\)`;
  } else {
    output.style.color = "red";
    output.innerHTML = `No resolving set of size ${guessNumber} exists for \\( \\Theta(${latexInput}) \\).`;
  }

  if (window.MathJax) MathJax.typesetPromise();
};
