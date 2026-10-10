# AgriScan AI — Live Crop Disease Prediction & Foliar Diagnostic System

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://html.spec.whatwg.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)
[![FontAwesome](https://img.shields.io/badge/FontAwesome-528DD7?style=for-the-badge&logo=font-awesome&logoColor=white)](https://fontawesome.com/)

A modern, highly interactive, and beautifully animated web application for real-time crop disease prediction, computer-vision scanning, and agronomic treatment synthesis. Built with a cyberpunk/modern emerald dark agricultural aesthetic using glassmorphism cards, glowing accent borders, reticle target overlays, and sweeping laser scanner animations.

---

## 🌟 Key Features

### 1. Visual Theme & Styling
- **Modern Dark / Emerald Aesthetic:** Custom mesh gradients, deep obsidian/forest backgrounds (`#060d09`), and neon emerald (`#10b981`), lime (`#84cc16`), warning amber (`#f59e0b`), and critical crimson (`#f43f5e`) accents.
- **Glassmorphism Panels:** Frosted glass cards with backdrop blur, fine hairline borders, and glowing hover states.
- **Micro-Interactions & Counters:** Animated stat number counting with cubic ease-out, tactile audio clicks via Web Audio API, and pulsing live status badges (`● WEBCAM LIVE`, `NEURAL CORE READY`).

### 2. Live Camera Scanner Module
- **HTML5 Webcam Integration (`getUserMedia`):** Stream live feed with automatic rear-camera selection (`facingMode: environment`) and resolution optimization.
- **Cyber-Agronomy HUD Overlay:**
  - 4 animated corner targeting brackets (`.hud-corner`)
  - Center circular reticle crosshair with targeting dot
  - Matrix scanning grid lines
  - Real-time simulated camera metadata overlay (FPS counter, ISO auto)
- **Sweeping Laser Scanner:** Dual-pass animated laser line (`#10b981` / `#34d399`) with vertical gradient light falloff and glow.
- **Camera Controls:**
  - **Flip / Switch Camera:** Seamlessly toggles between front (selfie) and rear (macro/environment) sensors.
  - **Flash / Torch Simulation:** Hardware flashlight toggle where supported with simulated shutter flash.
  - **Webcam Pause / Resume.**
- **Drag-and-Drop File Fallback:** Drop zone for image files (JPEG, PNG, WebP) with size validation and preview rendering.
- **Quick Test Presets (1-Click Testing):** Built-in procedural leaf vector generators for instant offline testing without needing camera permissions or live plants:
  - 🍅 **Tomato:** Late Blight (*Phytophthora infestans*) — Critical
  - 🌽 **Corn (Maize):** Common Rust (*Puccinia sorghi*) — Mild
  - 🍎 **Apple:** Apple Scab (*Venturia inaequalis*) — Critical
  - 🌾 **Rice (Paddy):** Rice Leaf Blast (*Magnaporthe oryzae*) — Critical
  - 🌿 **Healthy Crop Foliage:** Optimal Plant Health (0% lesions)

### 3. Diagnostic Output Panel
- **Animated SVG Circular Progress Gauge:** Smooth `stroke-dashoffset` animation displaying model confidence (e.g., `96.8%`) with dynamic color progression (Emerald → Amber → Crimson).
- **Dynamic Disease Severity Badge:**
  - `Healthy` — Glowing emerald badge with checkmark
  - `Mild` — Amber warning pill with caution icon
  - `Critical` — Crimson badge with pulsing heartbeat glow animation
- **Pathology & Foliar Biomarkers:**
  - Lesion coverage percentage
  - Chlorosis index
  - Tissue viability percentage
  - Differential diagnosis probability ranking (Top 3 candidate diseases with animated progress bars)
- **Agronomic Remediation & Action Plan:** Tabbed, step-by-step guidance:
  - 🛑 **Immediate Triage:** Leaf pruning, crop isolation, irrigation hygiene.
  - 🌿 **Organic & Bio Remedies:** Copper soap, Bordeaux mixture, *Bacillus subtilis*, cold-pressed neem oil.
  - 🧪 **Chemical Management:** Curative and protectant fungicides (Mancozeb, Dimethomorph, Chlorothalonil) with dosage and pre-harvest interval (PHI) guidance.
  - 🛡️ **Long-Term Prevention:** Row spacing, drip irrigation, resistant cultivars.
- **Export & Share:** Export complete diagnostic report to PDF / Print layout, and copy diagnosis to clipboard.

### 4. Analytics & Data Persistence
- **Chart.js Visualizations (Auto-updating):**
  - **Disease Distribution:** Interactive Doughnut chart showing condition proportions.
  - **Scan Trends:** Smooth line chart showing daily scan volume and infection counts over time.
  - **Crop Severity Breakdown:** Stacked bar chart showing health distribution per crop.
- **Historical Scan Log Repository (LocalStorage):**
  - Client-side persistence with preloaded initial history.
  - Instant live search by crop name, disease, pathogen, or scan ID.
  - Filter by severity (`All`, `Healthy`, `Mild`, `Critical`) and crop type.
  - Full report modal inspection.
  - Delete individual scan or clear history.
  - One-click export to **CSV** and **JSON**.
- **Real-time Stat Counters:** Total Scans, Healthy Crop Rate %, Infections Found, and Critical Action Alerts dynamically recalculated on every scan.

### 5. Modular Plug-and-Play AI Architecture
The prediction layer (`js/model-service.js`) is completely decoupled:
- **`SIMULATED` (Default):** In-browser visual feature extractor and 38-class agronomic rule engine.
- **`TFJS` Hook:** Ready for loading client-side TensorFlow.js models (`tf.loadLayersModel`).
- **`API` Mode:** Connects to any Python REST server (FastAPI / Flask) running PyTorch CNNs, ResNet50, or MobileNet.

---

## 📁 Project Structure

```
c:/Users/User/Desktop/NNDL/
├── index.html               # Main semantic HTML5 application layout
├── server.py                # Zero-dependency Python web & REST API server
├── README.md                # Documentation & quick start guide
├── css/
│   └── styles.css           # Custom glassmorphic styling, animations, HUD & SVG gauge
└── js/
    ├── app.js               # Application coordinator, audio synthesizer, event wiring
    ├── camera.js            # getUserMedia webcam manager, flip camera, file ingestion
    ├── disease-database.js  # Agronomic pathology database & procedural leaf SVG generator
    ├── model-service.js     # Modular inference service (Simulated / TF.js / Python API)
    ├── storage.js           # LocalStorage persistence, summary metrics, CSV/JSON export
    └── analytics.js         # Chart.js visualization engine & reactive updates
```

---

## 🚀 How to Run Locally

### Option 1: Direct in Browser
Double-click `index.html` or open it in any modern browser (Chrome, Edge, Firefox, Brave, Safari). All features, camera, presets, charts, and LocalStorage work out of the box!

### Option 2: Run with Python Server (Recommended)
Open a terminal in the project directory and run:
```bash
python server.py
```
Then visit:
- **Web App:** [http://localhost:8000](http://localhost:8000)
- **API Health Check:** [http://localhost:8000/api/health](http://localhost:8000/api/health)
- **Prediction Endpoint:** `POST http://localhost:8000/api/predict`
