---
hide:
  - navigation
---

<div class="hero" markdown>

# FREQWAVE

**Interactive 2D Fourier Transform Studio**

FREQWAVE makes the Fourier Transform tangible. Load images, mix their frequency components, and watch spatial and frequency domains respond to each other in real time.

[Get Started](installation.md){ .md-button .md-button--primary }
[View on GitHub](https://github.com/YOUR_USERNAME/freqwave){ .md-button }

</div>

---

## What is FREQWAVE?

FREQWAVE is a full-stack interactive platform for exploring the **2D Discrete Fourier Transform (DFT)** on images. It bridges the gap between abstract signal processing theory and visual intuition — every operation updates in real time so you can immediately see both the spatial and frequency-domain consequences of your choices.

## Two Modes

=== "FT Mixer"

    Load up to **4 images** simultaneously. Assign each image a role — contribute its **magnitude**, **phase**, **real part**, or **imaginary part** — weight each contribution, and reconstruct a brand new image via Inverse FFT.

    This is the classic FT experiment: *swap the phase of one image with the magnitude of another and see what emerges.*

=== "FT Emphasizer"

    Apply **9 classical FT properties** to a single image and observe the duality in real time on 4 oscilloscope-style screens:

    - **Shift** — see phase rotate in the FT while magnitude stays constant
    - **Stretch** — watch the FT compress as you expand the image
    - **Differentiate** — edges appear spatially; high frequencies bloom in the FT
    - **Window** — apply Gaussian/Hamming/Hanning and watch spectral leakage disappear
    - ...and 5 more

## Key Features

| Feature | Description |
|---|---|
| **Real-time updates** | Every slider, toggle, or setting change triggers instant recomputation |
| **Cancellation** | Starting a new operation cancels any in-flight computation |
| **FT Duality** | Apply any transform in spatial *or* frequency domain — observe both consequences simultaneously |
| **Educational cards** | Every action includes a plain-English explanation of spatial effect, frequency effect, and the underlying theorem |
| **Dark / Light mode** | Vaporwave dark (deep void purple) or Neon Bloom light (warm ivory + candy accents) |
| **Download** | Export mix results as PNG |

## Quick Install

```bash
git clone https://github.com/YOUR_USERNAME/freqwave.git
cd freqwave

# Backend
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend-app && npm install && npm run dev
```

Then open **http://localhost:5173** ✓
