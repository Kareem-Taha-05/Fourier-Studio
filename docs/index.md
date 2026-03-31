---
hide:
  - navigation
---

<div class="hero" markdown>

# Fourier Studio

**A real-time 2D Fourier Transform workbench**

Load images. Mix frequency components. Watch both domains update instantly.

[Get Started](installation.md){ .md-button .md-button--primary }
[View on GitHub](https://github.com/Kareem-Taha-05/Fourier-Studio){ .md-button }

</div>

---

## What is Fourier Studio?

Fourier Studio is a full-stack signal processing workbench that makes the 2D Discrete Fourier Transform interactive. Every operation — mixing frequency components, applying transforms, adjusting weights — updates in real time across synchronized spatial and frequency domain views.

It is built for engineers and researchers who want to build real intuition for how images behave in the frequency domain, not just read about it.

---

## Two tools in one

### FT Mixer

Load up to four images. Assign each one a role — contribute its magnitude, phase, real part, or imaginary part — set individual weights, and reconstruct a new image via Inverse FFT. Every change re-runs the computation automatically. The previous result is cancelled the moment you start adjusting.

This makes it straightforward to explore questions like: *what happens if you take the magnitude of one image and the phase of another?* The answer appears in under 200ms.

### FT Emphasizer

Apply nine classical signal processing transforms to an image and observe the spatial ↔ frequency duality on four synchronized screens. Or flip the direction — apply the transform directly to the Fourier spectrum and watch the image reconstruct itself.

Every transform includes an in-app explanation covering what happens in the spatial domain, what happens in the frequency domain, and the mathematical duality connecting them.

---

## Quick install

```bash
git clone https://github.com/Kareem-Taha-05/Fourier-Studio.git
cd Fourier-Studio

# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend-app && npm install && npm run dev
```

Open **http://localhost:5173**

---

## Capabilities at a glance

| Capability | Detail |
|---|---|
| Real-time computation | Sub-200ms update on every input change |
| Thread cancellation | In-flight IFFT is cancelled when new parameters arrive |
| FT domain switching | Apply any transform in spatial or frequency domain |
| Frequency region masking | Restrict mixing to low-frequency or high-frequency bands |
| 9 transforms | Shift, stretch, rotate, differentiate, integrate, window, mirror, make even/odd |
| 4 FT components | Magnitude (log-scaled), phase, real, imaginary |
| Inline documentation | Plain-English explanation for every transform and mixer concept |
| Dark and light modes | Switchable without reload |
| REST API | Clean endpoints with auto-generated Swagger docs at `/docs` |

---

## Built with

FastAPI · NumPy · Pillow · React 19 · Vite 8 · Zustand · Pydantic v2

---

[Installation →](installation.md)
