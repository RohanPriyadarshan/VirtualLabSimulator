from flask import Flask, request, jsonify
from flask_cors import CORS
import math

app = Flask(__name__)
CORS(app)

@app.route("/run_experiment", methods=["POST"])
def run_experiment():
  data = request.get_json()
  experiment = data.get("experiment")

  if experiment == "acid_base":
    return run_acid_base(data)
  elif experiment == "dilution":
    return run_dilution(data)
  elif experiment == "gas_law":
    return run_gas_law(data)
  else:
    return jsonify({"error": "Unknown experiment"}), 400

def run_acid_base(data):
  acid = data.get("acid")
  base = data.get("base")
  acidM = float(data.get("acidM"))
  acidV = float(data.get("acidV"))
  baseM = float(data.get("baseM"))
  baseV = float(data.get("baseV"))

  # moles = M * V(L)
  moles_acid = acidM * (acidV / 1000.0)
  moles_base = baseM * (baseV / 1000.0)

  total_volume_L = (acidV + baseV) / 1000.0

  if moles_acid > moles_base:
    excess = moles_acid - moles_base
    H_conc = excess / total_volume_L
    pH = -math.log10(H_conc)
    result = "Acidic solution (acid in excess)."
  elif moles_base > moles_acid:
    excess = moles_base - moles_acid
    OH_conc = excess / total_volume_L
    pOH = -math.log10(OH_conc)
    pH = 14 - pOH
    result = "Basic solution (base in excess)."
  else:
    pH = 7.0
    result = "Neutral solution (perfectly neutralized)."

  return jsonify({
    "experiment": "acid_base",
    "acid": acid,
    "base": base,
    "pH": pH,
    "result": result
  })

def run_dilution(data):
  solute = data.get("solute", "Solution")
  c1 = float(data.get("c1"))
  v1 = float(data.get("v1"))
  v2 = float(data.get("v2"))

  # C1 V1 = C2 V2  ->  C2 = (C1 * V1) / V2
  c2 = (c1 * v1) / v2

  # how "concentrated" visually (for tube fill)
  fill_percent = max(10.0, min(100.0, (c2 / c1) * 100.0)) if c1 > 0 else 10.0

  return jsonify({
    "experiment": "dilution",
    "solute": solute,
    "c1": c1,
    "v1": v1,
    "v2": v2,
    "c2": c2,
    "fill_percent": fill_percent
  })

def run_gas_law(data):
  P = float(data.get("P"))   # atm
  n = float(data.get("n"))   # mol
  T = float(data.get("T"))   # K
  R = 0.0821                 # L·atm / (mol·K)

  V = (n * R * T) / P        # ideal gas law

  # scale factor for balloon size
  scale = V / 10.0           # arbitrary scaling
  return jsonify({
    "experiment": "gas_law",
    "P": P,
    "n": n,
    "T": T,
    "V": V,
    "scale": scale
  })

if __name__ == "__main__":
  app.run(debug=True)
