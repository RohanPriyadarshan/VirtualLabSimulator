const expDescriptionEl = document.getElementById("expDescription");
const experimentSelect = document.getElementById("experiment");
const inputsContainer = document.getElementById("inputsContainer");
const visualArea = document.getElementById("visualArea");
const numericResults = document.getElementById("numericResults");
const errorEl = document.getElementById("error");

// Experiment descriptions and templates
const experimentConfigs = {
  acid_base: {
    title: "Acid–Base Neutralization",
    description:
      "Mix an acid and a base. Use the example values, press Run, and see if it ends up acidic, basic, or neutral.",
    renderInputs: () => {
      inputsContainer.innerHTML = `
        <h2>Inputs</h2>
        <button type="button" onclick="fillDefaults('acid_base')">Use example values</button>

        <label>Acid:</label>
        <select id="acid">
          <option value="HCl">HCl (Hydrochloric Acid)</option>
          <option value="HNO3">HNO₃ (Nitric Acid)</option>
          <option value="H2SO4">H₂SO₄ (Sulfuric Acid)</option>
        </select>

        <label>Acid Concentration (M):</label>
        <input type="number" id="acidM" placeholder="e.g. 0.1" step="0.01">

        <label>Acid Volume (mL):</label>
        <input type="number" id="acidV" placeholder="e.g. 20" step="0.1">

        <label>Base:</label>
        <select id="base">
          <option value="NaOH">NaOH (Sodium Hydroxide)</option>
          <option value="KOH">KOH (Potassium Hydroxide)</option>
          <option value="Ca(OH)2">Ca(OH)₂ (Calcium Hydroxide)</option>
        </select>

        <label>Base Concentration (M):</label>
        <input type="number" id="baseM" placeholder="e.g. 0.1" step="0.01">

        <label>Base Volume (mL):</label>
        <input type="number" id="baseV" placeholder="e.g. 20" step="0.1">

        <button onclick="runExperiment()">Run Neutralization</button>
      `;
    },
  },

  dilution: {
    title: "Solution Dilution",
    description:
      "Make a weaker solution from a strong one. Use the example values and see the final concentration.",
    renderInputs: () => {
      inputsContainer.innerHTML = `
        <h2>Inputs</h2>
        <button type="button" onclick="fillDefaults('dilution')">Use example values</button>

        <label>Solute / Solution Name:</label>
        <input type="text" id="solute" placeholder="e.g. NaCl, KMnO₄">

        <label>Initial Concentration C₁ (M):</label>
        <input type="number" id="c1" placeholder="e.g. 1.0" step="0.01">

        <label>Initial Volume V₁ (mL):</label>
        <input type="number" id="v1" placeholder="e.g. 10" step="0.1">

        <label>Final Volume V₂ (mL):</label>
        <input type="number" id="v2" placeholder="e.g. 100" step="0.1">

        <button onclick="runExperiment()">Calculate Dilution</button>
      `;
    },
  },

  gas_law: {
    title: "Ideal Gas Law (PV = nRT)",
    description:
      "Warm or squeeze a balloon of gas. Use the example values, press Run, and watch the balloon size change.",
    renderInputs: () => {
      inputsContainer.innerHTML = `
        <h2>Inputs</h2>
        <button type="button" onclick="fillDefaults('gas_law')">Use example values</button>

        <label>Pressure P (atm):</label>
        <input type="number" id="P" placeholder="e.g. 1" step="0.1">

        <label>Moles of Gas n (mol):</label>
        <input type="number" id="n" placeholder="e.g. 0.5" step="0.01">

        <label>Temperature T (K):</label>
        <input type="number" id="T" placeholder="e.g. 298" step="1">

        <button onclick="runExperiment()">Compute Volume</button>
      `;
    },
  },
};

// Friendly starter numbers for each experiment
const defaultValues = {
  acid_base: { acid: "HCl", acidM: 0.1, acidV: 20, base: "NaOH", baseM: 0.1, baseV: 20 },
  dilution: { solute: "Salt Water", c1: 1.0, v1: 10, v2: 100 },
  gas_law: { P: 1, n: 0.5, T: 298 },
};

function fillDefaults(id = experimentSelect.value) {
  const defaults = defaultValues[id];
  if (!defaults) return;
  Object.entries(defaults).forEach(([key, val]) => {
    const el = document.getElementById(key);
    if (!el) return;
    el.value = val;
  });
  errorEl.textContent = "Example values filled. Now press Run.";
}

// Initialize UI
function loadExperiment(id) {
  const config = experimentConfigs[id];
  expDescriptionEl.textContent = config.description;
  config.renderInputs();
  visualArea.innerHTML = "";
  numericResults.innerHTML = "<p>We filled in example values for you. Press the blue run button to see what happens.</p>";
  errorEl.textContent = "";
  fillDefaults(id);
}

// Run when dropdown changes
experimentSelect.addEventListener("change", () => {
  loadExperiment(experimentSelect.value);
});

// Called from buttons in each experiment
function runExperiment() {
  const experiment = experimentSelect.value;
  errorEl.textContent = "";

  let payload = { experiment };
  const defaults = defaultValues[experiment] || {};

  try {
    if (experiment === "acid_base") {
      const acid = document.getElementById("acid").value || defaults.acid;
      const acidM = parseFloat(document.getElementById("acidM").value) || defaults.acidM;
      const acidV = parseFloat(document.getElementById("acidV").value) || defaults.acidV;
      const base = document.getElementById("base").value || defaults.base;
      const baseM = parseFloat(document.getElementById("baseM").value) || defaults.baseM;
      const baseV = parseFloat(document.getElementById("baseV").value) || defaults.baseV;

      if (!acidM || !acidV || !baseM || !baseV) throw "Tap 'Use example values' first.";

      payload = { experiment, acid, acidM, acidV, base, baseM, baseV };
    } else if (experiment === "dilution") {
      const solute = document.getElementById("solute").value || defaults.solute || "Solution";
      const c1 = parseFloat(document.getElementById("c1").value) || defaults.c1;
      const v1 = parseFloat(document.getElementById("v1").value) || defaults.v1;
      const v2 = parseFloat(document.getElementById("v2").value) || defaults.v2;
      if (!c1 || !v1 || !v2) throw "Tap 'Use example values' first.";
      payload = { experiment, solute, c1, v1, v2 };
    } else if (experiment === "gas_law") {
      const P = parseFloat(document.getElementById("P").value) || defaults.P;
      const n = parseFloat(document.getElementById("n").value) || defaults.n;
      const T = parseFloat(document.getElementById("T").value) || defaults.T;
      if (!P || !n || !T) throw "Tap 'Use example values' first.";
      payload = { experiment, P, n, T };
    }
  } catch (e) {
    errorEl.textContent = e;
    return;
  }

  fetch("http://127.0.0.1:5000/run_experiment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((res) => res.json())
    .then((data) => {
      renderResults(data);
    })
    .catch(() => {
      errorEl.textContent = "Could not connect to Python server.";
    });
}

// Show results & animations
function renderResults(data) {
  visualArea.innerHTML = "";
  numericResults.innerHTML = "";

  if (data.experiment === "acid_base") {
    const beaker = document.createElement("div");
    beaker.className = "beaker";
    visualArea.appendChild(beaker);

    const pH = data.pH;

    if (pH < 3) beaker.style.background = "#ef4444"; // red
    else if (pH < 7) beaker.style.background = "#f97316"; // orange
    else if (pH === 7) beaker.style.background = "#38bdf8"; // blue
    else if (pH <= 10) beaker.style.background = "#22c55e"; // green
    else beaker.style.background = "#a855f7"; // purple

    beaker.style.boxShadow = "0 0 25px rgba(56,189,248,0.6)";

    numericResults.innerHTML = `
      <p><strong>Final pH:</strong> ${pH.toFixed(2)}</p>
      <p><strong>Result:</strong> ${data.result}</p>
      <p><strong>Acid:</strong> ${data.acid}, <strong>Base:</strong> ${data.base}</p>
    `;
  } else if (data.experiment === "dilution") {
    const tube = document.createElement("div");
    tube.className = "tube";

    const fill = document.createElement("div");
    fill.className = "tube-fill";
    fill.style.height = `${Math.min(100, data.fill_percent)}%`;
    tube.appendChild(fill);

    visualArea.appendChild(tube);

    numericResults.innerHTML = `
      <p><strong>Solute:</strong> ${data.solute}</p>
      <p><strong>C₁:</strong> ${data.c1} M</p>
      <p><strong>V₁:</strong> ${data.v1} mL</p>
      <p><strong>V₂:</strong> ${data.v2} mL</p>
      <p><strong>Final Concentration C₂:</strong> ${data.c2.toFixed(3)} M</p>
    `;
  } else if (data.experiment === "gas_law") {
    const balloon = document.createElement("div");
    balloon.className = "balloon";

    const scale = Math.min(2.5, Math.max(0.4, data.scale)); // clamp size
    balloon.style.transform = `scale(${scale})`;

    visualArea.appendChild(balloon);

    numericResults.innerHTML = `
      <p><strong>Pressure P:</strong> ${data.P} atm</p>
      <p><strong>Moles n:</strong> ${data.n} mol</p>
      <p><strong>Temperature T:</strong> ${data.T} K</p>
      <p><strong>Volume V:</strong> ${data.V.toFixed(2)} L</p>
    `;
  }
}

// Load default experiment on page start
loadExperiment("acid_base");
