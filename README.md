<div align="center">

<!-- REPLACE: 400×120px logo, transparent background, SVG or PNG preferred -->
![FREQWAVE Logo](docs/assets/logo-placeholder.png)

# FREQWAVE — Fourier Transform Studio

**An interactive, real-time 2D Fourier Transform learning and experimentation platform**

[![Python](https://img.shields.io/badge/Python-3.12-blue?style=flat-square&logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![NumPy](https://img.shields.io/badge/NumPy-1.26-013243?style=flat-square&logo=numpy)](https://numpy.org)
[![License](https://img.shields.io/badge/License-MIT-purple?style=flat-square)](LICENSE)

---

<!-- REPLACE: YouTube embed thumbnail or MP4 preview (16:9, 1–3 min screen recording) -->
[![Demo Video](docs/assets/video-thumbnail-placeholder.png)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)

*▶ Click to watch the full demo*

</div>

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Screenshots](#screenshots)
4. [Architecture](#architecture)
5. [Tech Stack](#tech-stack)
6. [Prerequisites](#prerequisites)
7. [Installation & Setup](#installation--setup)
8. [Running the Project](#running-the-project)
9. [Using the Application](#using-the-application)
   - [Part A — FT Mixer](#part-a--ft-mixer)
   - [Part B — FT Emphasizer](#part-b--ft-emphasizer)
10. [API Reference](#api-reference)
11. [Project Structure](#project-structure)
12. [Design System](#design-system)
13. [Known Limitations](#known-limitations)
14. [Contributing](#contributing)
15. [License](#license)

---

## Overview

**FREQWAVE** is a full-stack interactive educational platform for exploring and understanding the **2D Discrete Fourier Transform (DFT)** on images. It bridges the gap between abstract signal processing theory and visual intuition — every operation updates in real time so you can immediately see both the spatial and frequency-domain consequences of your choices.

The application has two independent modes:

| Mode | Purpose |
|---|---|
| **Mixer** | Load up to 4 images, assign FT components (magnitude/phase or real/imaginary) to each, weight them, and reconstruct a new image via IFFT |
| **Emphasizer** | Apply 9 classical FT properties to an image and observe the spatial ↔ frequency duality in real time |

Whether you are a student learning DSP for the first time or an engineer who wants to build intuition fast, FREQWAVE makes the Fourier Transform tangible.

---

## Features

### Part A — FT Mixer

- **4-slot input panel** — load images by double-clicking or drag-and-drop into any slot
- **Dual display per slot** — each viewport shows the spatial image alongside a live FT component panel
- **FT component selector** — independently choose what each slot *displays* (Magnitude / Phase / Real / Imaginary) vs what it *contributes* to the mix
- **Per-image role assignment** — assign each image a role: `MAG`, `PHS`, `RE`, or `IM` depending on the active mix mode
- **Per-image weight sliders** — continuously control the contribution of each image; updates propagate automatically with debouncing
- **Two mix modes** — Magnitude/Phase mixing or Real/Imaginary mixing
- **Frequency region selection** — draw a unified rectangle across all 4 FT panels to restrict mixing to inner (low-frequency) or outer (high-frequency) content
- **Resize policy** — unify image sizes to Smallest / Largest / Fixed 512×512 before mixing, with optional aspect ratio preservation
- **2 output ports** — results render in either output monitor; click to set the active target
- **Real-time cancellation** — changing any setting mid-computation automatically cancels the previous IFFT and starts fresh
- **Simulate bottleneck** — artificially add a 3-second delay to test cancellation behaviour
- **Brightness/Contrast** — drag left/right on any spatial panel to adjust contrast, up/down for brightness

### Part B — FT Emphasizer

- **9 spatial transforms** — Shift, Complex Exponential Multiply, Stretch, Mirror, Make Even, Make Odd, Rotate, Differentiate, Integrate, Window Function
- **Domain switching (Duality)** — toggle between applying the action to the *spatial image* or to the *FT directly*
- **Repeated Fourier** — apply FFT N times (0–8) as post-processing on top of any action
- **Window functions** — Rectangular, Gaussian (adjustable σ), Hamming, Hanning
- **Live preview** — every parameter change triggers automatic re-computation with a 150ms debounce
- **FT display selector** — choose which component (Magnitude/Phase/Real/Imaginary) is shown in the frequency panels
- **In-app educational cards** — collapsible "What does this do?" panel for every action, explaining spatial effect, frequency consequence, and the underlying FT duality theorem

### General

- **Vaporwave / Synthwave UI** — Orbitron + VT323 + Share Tech Mono typography, perspective grid background, CRT scanline overlays, neon glow effects
- **Dark / Light mode** — hardware flip-switch; Dark (deep void purple) or Light (Neon Bloom: warm ivory + candy accents)
- **Backend health indicator** — live LCD-style readout in the navbar; polls every 15 seconds

---

## Screenshots

<!-- REPLACE each placeholder with 1280×800 PNG screenshots from the live app -->

<table>
  <tr>
    <td align="center">
      <img src="docs/assets/screenshot-mixer-dark.png" alt="Mixer Tab — Dark Mode" width="600"/>
      <br/><em>Mixer Tab — Dark Mode</em>
    </td>
    <td align="center">
      <img src="docs/assets/screenshot-mixer-light.png" alt="Mixer Tab — Light Mode" width="600"/>
      <br/><em>Mixer Tab — Light Mode (Neon Bloom)</em>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="docs/assets/screenshot-emphasizer-dark.png" alt="Emphasizer Tab — Dark Mode" width="600"/>
      <br/><em>Emphasizer Tab — Dark Mode</em>
    </td>
    <td align="center">
      <img src="docs/assets/screenshot-infocard.png" alt="Educational InfoCard expanded" width="600"/>
      <br/><em>Educational InfoCard — FT Duality explanation</em>
    </td>
  </tr>
</table>

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         Browser (React 19)                        │
│                                                                    │
│   ┌─────────────┐   ┌──────────────────┐   ┌──────────────────┐  │
│   │  MixerPage  │   │ EmphasizerPage   │   │  NavBar +        │  │
│   │  4 viewports│   │ 4-panel grid     │   │  Theme Toggle    │  │
│   │  2 outputs  │   │ Controls sidebar │   │  Health status   │  │
│   └──────┬──────┘   └────────┬─────────┘   └──────────────────┘  │
│          │                   │                                     │
│          └─────────┬─────────┘                                     │
│                    │  Axios  (Vite proxy → :8000)                  │
└────────────────────┼─────────────────────────────────────────────┘
                     │  HTTP / REST
┌────────────────────┼─────────────────────────────────────────────┐
│                 FastAPI  (:8000)                                    │
│                                                                    │
│   /api/v1/images/*          /api/v1/mixer/mix                     │
│   /api/v1/emphasizer/apply  /health                               │
│                    │                                               │
│          ┌─────────┼──────────┐                                   │
│          ▼         ▼          ▼                                    │
│   ImageProcessor  MixerService  EmphasizerProcessor               │
│   (upload, FT,    (weighted     (9 transforms +                   │
│    resize, b/c)    IFFT mixing)  domain duality)                  │
│                    │                                               │
│          ImageRegistry (in-memory, keyed by UUID)                  │
└────────────────────────────────────────────────────────────────────┘
```

**Data flow for a mix operation:**

1. User loads images → `POST /api/v1/images/upload` → returns `image_id` + base64 PNG
2. User adjusts sliders → frontend debounces 180ms → `POST /api/v1/mixer/mix`
3. Backend resizes images to unified size, computes `fft2` for each, applies weights and region mask, runs `ifft2`, returns base64 PNG
4. Previous in-flight request is cancelled via `AbortController` + `threading.Event`

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Backend framework | FastAPI | 0.111 | REST API, async request handling |
| Math | NumPy | 1.26 | FFT/IFFT, array operations |
| Image I/O | Pillow | 10.3 | Image decoding, resizing, PNG encoding |
| Validation | Pydantic | 2.7 | Request/response schemas |
| Server | Uvicorn | 0.30 | ASGI server with hot reload |
| Frontend | React | 19 | Component-based UI |
| Build tool | Vite | 8 | Dev server, HMR, production bundler |
| State management | Zustand | 5 | Global app state (zero boilerplate) |
| HTTP client | Axios | 1.13 | API calls with abort signal support |
| Fonts | Google Fonts | — | Orbitron · VT323 · Share Tech Mono |
| Icons | Lucide React | 0.383 | UI icon set |

---

## Prerequisites

Make sure the following are installed before you begin:

| Tool | Minimum Version | Check Command |
|---|---|---|
| Python | 3.10+ | `python --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Git | any | `git --version` |

> **Windows users:** All commands work in PowerShell or Git Bash.
> **macOS/Linux users:** Use your standard terminal.

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/freqwave.git
cd freqwave
```

### 2. Backend setup

```bash
cd backend

# Create a virtual environment (strongly recommended)
python -m venv .venv

# Activate it:
# macOS / Linux:
source .venv/bin/activate
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Windows (CMD):
.venv\Scripts\activate.bat

# Install all Python dependencies
pip install -r requirements.txt
```

### 3. Frontend setup

```bash
# From the project root:
cd frontend-app

npm install
```

That is everything — no database, no Docker, no environment variables required for local development.

---

## Running the Project

You need **two terminal windows** running simultaneously.

### Terminal 1 — Backend

```bash
cd backend

# Activate virtual environment first
source .venv/bin/activate      # macOS/Linux
# .venv\Scripts\Activate.ps1  # Windows

uvicorn app.main:app --reload --port 8000
```

Expected output:

```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process using WatchFiles
INFO:     Application startup complete.
```

| URL | Purpose |
|---|---|
| http://localhost:8000/docs | Interactive API docs (Swagger UI) |
| http://localhost:8000/redoc | Alternative API docs (ReDoc) |
| http://localhost:8000/health | Health check endpoint |

### Terminal 2 — Frontend

```bash
cd frontend-app

npm run dev
```

Expected output:

```
  VITE v8.x.x  ready in ~300ms

  ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser.

> The Vite dev server proxies all `/api` and `/health` requests to `http://localhost:8000` — no CORS configuration needed.

### Verify everything is working

The navbar in the top-right should show a green pulsing dot labelled **SYS ONLINE**. If it shows **OFFLINE**, the backend is not running — check Terminal 1 for errors.

---

## Using the Application

### Interface Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│  📡  FREQWAVE     [ Mixer ]  [ Emphasizer ]   [◐ DARK]   ● SYS ONLINE │
│      Fourier Transform Studio                                          │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│                 Main content area (changes per tab)                   │
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘
```

| Element | Function |
|---|---|
| **[ Mixer ] / [ Emphasizer ]** | Tab switcher — work in each tab is preserved when you switch |
| **[◐ DARK / LIGHT]** | Theme toggle — switches instantly between dark and light modes |
| **● SYS ONLINE** | Backend health indicator — polls every 15 seconds |

---

### Part A — FT Mixer

<!-- REPLACE: screenshot-mixer-dark.png -->
![Mixer Tab](docs/assets/screenshot-mixer-dark.png)

The Mixer is laid out like a hardware console:

```
┌──────────┬──────────┬──────────┬──────────┐
│  IMG 01  │  IMG 02  │  IMG 03  │  IMG 04  │  ← Input channels
│ Spatial  │ Spatial  │ Spatial  │ Spatial  │
│ Freq     │ Freq     │ Freq     │ Freq     │
└──────────┴──────────┴──────────┴──────────┘
┌────────────────────────────┐  ┌───────────┐
│   OUTPUT 1  │   OUTPUT 2  │  │ Controls  │
└────────────────────────────┘  └───────────┘
```

#### Quick start

1. **Load images** — double-click any input slot, or drag an image file onto it
2. **Choose a Mix Mode** — `Mag / Phase` or `Real / Imag`
3. **Assign roles** — use `MAG` / `PHS` pill buttons next to each image
4. **Set weights** — sliders range 0 (silent) → 1 (full) → >1 (boosted)
5. **Result appears automatically** in the active output monitor

#### Display vs Mix Role

Each viewport has two independent controls:

| Control | Location | Effect |
|---|---|---|
| **Display dropdown** | Bottom of each slot | Changes what you *see* in the FT panel — does **not** affect the mix |
| **Role buttons** (`MAG`/`PHS`) | Sidebar | Controls what that image *contributes* to the IFFT — directly affects output |

#### Brightness / Contrast

Drag on the **spatial panel** (left half of any slot):
- **Left / Right** → adjust contrast
- **Up / Down** → adjust brightness

#### Frequency Region

Enable **Region Selection** in the sidebar to mask the mix to a frequency band:

| Setting | Captures | Use for |
|---|---|---|
| **Inner (Low)** | Centred rectangle | Broad shapes, colour, overall structure |
| **Outer (High)** | Everything outside rect | Edges, texture, fine detail |

The rectangle appears as a coloured overlay on **all 4 FT panels simultaneously** — it is always unified.

> **Classic experiment:** Load a face image into IMG 01 (role: **MAG**) and a different face into IMG 02 (role: **PHS**). Set both weights to 1.0. The output will look like IMG 02 with IMG 01's frequency energy — this is the famous FT phase/magnitude demonstration.

#### Output ports

- Click an output monitor to make it the **active target** (cyan glow = active)
- Download results as PNG using the download icon in the output header

---

### Part B — FT Emphasizer

<!-- REPLACE: screenshot-emphasizer-dark.png -->
![Emphasizer Tab](docs/assets/screenshot-emphasizer-dark.png)

The Emphasizer layout:

```
┌─────────────┐  ┌───────────────┬───────────────┐
│  Controls   │  │  Original     │  Original     │
│  (sidebar)  │  │  Spatial      │  FT           │
│             │  ├───────────────┼───────────────┤
│             │  │  Transformed  │  FT of        │
│             │  │  Spatial      │  Transformed  │
└─────────────┘  └───────────────┴───────────────┘
```

#### Quick start

1. **Load Image** — click "Load Image" in the sidebar
2. **Choose domain** — `Spatial Domain` or `Frequency Domain`
   - *Spatial*: action modifies the image → watch the FT react
   - *Frequency*: action modifies the FT → watch the reconstructed image change
3. **Choose an action** from the dropdown
4. **Adjust parameters** — output updates within ~150ms of any change
5. **Click "What does this do?"** to read the educational explanation

#### Available actions

| # | Action | Key FT Concept |
|---|---|---|
| 1 | **Spatial Shift** | Shift ↔ phase rotation; magnitude is blind to position |
| 2 | **Complex Exponential Multiply** | Modulation in space = shift in frequency |
| 3 | **Stretch** | Stretch ↔ inverse scale (scaling theorem) |
| 4 | **Mirror / Flip** | Flip in space = flip in frequency |
| 5 | **Make Even** | Even symmetry → purely real FT |
| 6 | **Make Odd** | Odd symmetry → purely imaginary FT |
| 7 | **Rotate** | Rotation is FT-equivariant — spectrum rotates with the image |
| 8 | **Differentiate** | Edge detection → high-frequency boost in FT |
| 9 | **Integrate** | Running sum → low-pass effect in FT |
| 9b | **Window Function** | Windowing ↔ FT convolution (reduces spectral leakage) |

#### Repeated Fourier

Use the **FT times** slider (0–8) to apply FFT N additional times after your chosen action. At N=4, many images converge toward a rotated/scaled version of themselves — a consequence of the DFT's periodicity.

#### Educational InfoCards

Every action has a collapsible card showing:

```
┌─────────────────────────────────────────────────────┐
│ ▼  What does this do?                               │
├──────────────────────┬──────────────────────────────┤
│  f(x,y)  Spatial     │  F(u,v)  Frequency           │
│  What happens to     │  What happens to the         │
│  the image...        │  spectrum...                 │
├──────────────────────┴──────────────────────────────┤
│  ⚡ FT Duality                                       │
│  The deeper relationship between both domains...    │
└─────────────────────────────────────────────────────┘
```

---

## API Reference

Base URL: `http://localhost:8000/api/v1`

All endpoints accept/return JSON. Images are transmitted as base64-encoded PNG strings.

### Images

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/images/upload` | Upload an image. Returns `image_id`, dimensions, base64 spatial preview |
| `POST` | `/images/ft-component` | Get a specific FT component as base64 PNG |
| `POST` | `/images/spatial-adjusted` | Get spatial image with brightness/contrast applied |
| `POST` | `/images/resize` | Resize a set of images to unified size per policy |
| `DELETE` | `/images/{image_id}` | Remove image from server registry |

### Mixer

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/mixer/mix` | Weighted FT mix → IFFT → base64 PNG |

**Request body:**
```json
{
  "image_ids":       ["uuid1", "uuid2"],
  "weights":         [0.8, 0.5],
  "image_roles":     ["magnitude", "phase"],
  "mix_mode":        "magnitude_phase",
  "resize_policy":   "smallest",
  "fixed_height":    512,
  "fixed_width":     512,
  "keep_aspect":     false,
  "region_fraction": 0.4,
  "region_type":     "inner",
  "simulate_delay":  false
}
```

### Emphasizer

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/emphasizer/apply` | Apply transform; returns 4 base64 panels |

**Request body:**
```json
{
  "image_id":       "uuid",
  "action":         "shift",
  "domain":         "spatial",
  "shift_dy":       50,
  "shift_dx":       50,
  "fourier_times":  0,
  "ft_component":   "magnitude",
  "brightness":     1.0,
  "contrast":       1.0
}
```

### Health

| Method | Endpoint | Response |
|---|---|---|
| `GET` | `/health` | `{"status": "ok", "app": "FT Mixer & Emphasizer"}` |

> Visit **http://localhost:8000/docs** for the full interactive Swagger UI.

---

## Project Structure

```
freqwave/
│
├── README.md
├── docs/
│   └── assets/                       # Logo, screenshots, video thumbnail
│
├── backend/
│   ├── requirements.txt
│   └── app/
│       ├── main.py                   # FastAPI app, CORS, router registration
│       ├── core/
│       │   └── config.py             # Pydantic settings
│       ├── models/
│       │   └── schemas.py            # All Pydantic request/response models
│       ├── services/
│       │   ├── image_service.py      # ImageProcessor · ImageRegistry · MixerService
│       │   └── emphasizer_service.py # EmphasizerProcessor (extends ImageProcessor)
│       └── api/
│           ├── images.py             # Upload, FT components, resize, delete
│           ├── mixer.py              # Weighted FT mix with thread cancellation
│           └── emphasizer.py         # 9 transforms + domain duality logic
│
└── frontend-app/
    └── src/
        ├── styles/
        │   └── globals.css           # Design system: CSS variables, dark + light tokens
        ├── utils/
        │   ├── api.js                # Axios client (Vite proxy → no CORS)
        │   └── education.js          # InfoCard content for all actions
        ├── store/
        │   └── useStore.js           # Zustand global state
        ├── components/
        │   ├── common/
        │   │   ├── NavBar.jsx/.css   # Header: branding, tabs, theme toggle, status
        │   │   ├── InfoCard.jsx/.css # Collapsible educational explanation panel
        │   │   └── ErrorBoundary.jsx # React render error fallback
        │   ├── viewer/
        │   │   ├── ImageViewport.jsx/.css  # Dual-panel input slot
        │   │   └── RegionOverlay.jsx       # Frequency region rectangle
        │   └── mixer/
        │       ├── MixerControls.jsx/.css  # Full sidebar controls
        │       └── OutputViewport.jsx/.css # Output monitor
        └── pages/
            ├── MixerPage.jsx/.css     # Tape-deck layout
            └── EmphasizerPage.jsx/.css # Oscilloscope layout
```

### Key architectural decisions

| Decision | Rationale |
|---|---|
| All image math in service classes | Zero NumPy in API handlers — testable, reusable |
| `EmphasizerProcessor` extends `ImageProcessor` | OOP inheritance; no code duplication |
| In-memory `ImageRegistry` singleton | Simple for single-user dev; swap for Redis in production |
| `threading.Event` cancellation | Allows mid-computation abort without killing the worker thread |
| `latestRef` pattern in MixerControls | Fixes stale closure bug in debounced `useEffect` callbacks |
| `displayResult` local state in Emphasizer | Panels never flash blank between requests — no flicker |
| Vite proxy for `/api` and `/health` | No CORS configuration needed in development |

---

## Design System

FREQWAVE uses a custom **Vaporwave / Synthwave** design language.

### Colour palette

| Token | Dark Mode | Light Mode | Usage |
|---|---|---|---|
| `--void` | `#07000F` | `#FFF8F2` | Page background |
| `--surface` | `#140030` | `#FFEDE0` | Panel backgrounds |
| `--pink` | `#FF006E` | `#E8005E` | Primary accent, section headers |
| `--cyan` | `#00F5FF` | `#0099BB` | Active states, output indicators |
| `--violet` | `#BF00FF` | `#8800CC` | Borders, FT domain markers |
| `--text-hi` | `#F5EEFF` | `#1A0030` | Primary readable text |
| `--text-mid` | `#C8A8F0` | `#5500AA` | Secondary text, hints |
| `--text-lo` | `#9060D0` | `#9944CC` | Muted labels |

### Typography

| Font | Role |
|---|---|
| **Orbitron** | Display headings, HUD labels, section titles, tab buttons |
| **VT323** | Data readouts, numeric values, status LCD display |
| **Share Tech Mono** | Body text, hints, filenames, parameter labels |

### Atmosphere

- **Body background** — perspective grid of faint violet lines + radial horizon glow at the bottom
- **Animated scanlines** — rolling CRT-style horizontal bands across the full page
- **VHS colour fringe** — pink top / cyan bottom gradient on all image panels
- **Corner tick marks** — hardware panel registration marks on each input viewport
- **Neon glow shadows** — active borders and buttons emit coloured `box-shadow`

---

## Known Limitations

| Limitation | Notes |
|---|---|
| **In-memory image store** | Images are lost when the backend restarts. Replace `ImageRegistry` with disk storage or Redis for persistence. |
| **Single-user sessions** | All uploaded images share one registry. Multiple browser tabs see each other's images. Session isolation requires user tokens. |
| **Base64 transport** | Images are base64-encoded in single responses. For files >10 MB, chunked streaming would be more efficient. |
| **Phase reconstruction** | In frequency-domain emphasis mode, IFFT reconstruction uses the original image's phase. This is an intentional simplification. |
| **No authentication** | The API has no auth layer. Do not expose port 8000 publicly without a reverse proxy and authentication middleware. |
| **Grayscale only** | All uploaded images are converted to grayscale internally. Colour FT support would require per-channel processing. |

---

## Contributing

Pull requests are welcome. For major changes please open an issue first.

```bash
# Fork the repo, then clone your fork:
git clone https://github.com/YOUR_USERNAME/freqwave.git
cd freqwave

# Create a feature branch
git checkout -b feature/my-improvement

# After making changes, verify nothing is broken:
cd backend && python -c "from app.main import app; print('Backend OK')"
cd ../frontend-app && npm run build && echo "Frontend OK"

# Commit and push
git add .
git commit -m "feat: describe your change"
git push origin feature/my-improvement
```

---

## License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with ♥ using FastAPI, React, and NumPy

*"The Fourier Transform: where every signal reveals its frequency soul."*

</div>
