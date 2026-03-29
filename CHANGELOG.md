# Changelog

All notable changes to FREQWAVE are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2025-01-01

### Added

#### Part A — FT Mixer
- 4-slot input viewport system with dual spatial/FT display per slot
- Per-image FT component role assignment (MAG/PHS or RE/IM)
- Per-image weight sliders with real-time IFFT output
- Magnitude/Phase and Real/Imaginary mix modes
- Frequency region selection with visual rectangle overlay on FT panels
- Resize policy (Smallest / Largest / Fixed 512×512) applied to both inputs and output
- 2 output monitor ports with active-target selection
- Real-time thread cancellation via `AbortController` + `threading.Event`
- Brightness/Contrast adjustment via mouse drag on any spatial panel
- Simulate Bottleneck developer mode (3-second artificial delay)
- Download output as PNG

#### Part B — FT Emphasizer
- 9 spatial/frequency transforms: Shift, Complex Exponential Multiply, Stretch,
  Mirror, Make Even, Make Odd, Rotate, Differentiate, Integrate, Window Function
- Domain toggle: apply transform to spatial image or directly to FT (duality mode)
- Repeated Fourier post-processing (0–8× FFT applications)
- Window functions: Rectangular, Gaussian (adjustable σ), Hamming, Hanning
- Live 4-panel oscilloscope display (original/transformed × spatial/frequency)
- 150ms debounced auto-update — no manual Apply button needed
- Collapsible educational InfoCards for every action

#### UI / UX
- Vaporwave / Synthwave design: Orbitron + VT323 + Share Tech Mono
- Dark mode (deep void purple) and Light mode (Neon Bloom warm ivory)
- Hardware flip-switch theme toggle in navbar
- CRT scanline overlays, perspective grid background, VHS colour fringe
- Backend health indicator with live LCD-style readout
- Educational InfoCards with FT duality explanations for all transforms
  and mixer concepts
- Fully responsive to window resizing

#### Backend
- FastAPI REST API with auto-generated Swagger/ReDoc documentation
- `ImageProcessor` base class with lazy FFT caching
- `EmphasizerProcessor` extending `ImageProcessor` (OOP inheritance)
- `ImageRegistry` in-memory repository keyed by UUID
- `MixerService` with weighted raw FT mixing (no normalisation)
- Thread pool executor for non-blocking IFFT operations
- Pydantic v2 request/response validation
- CORS middleware configured for Vite dev proxy

---

## [Unreleased]

### Planned
- Session isolation for multi-user deployments
- Disk-backed image persistence
- WebSocket progress streaming for long IFFT operations
- Colour image support (per-channel FT)
- Export FT component images directly
- Preset library of interesting mix configurations
