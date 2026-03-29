# Architecture

## System Overview

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
│          │                                                         │
│          └──► ImageRegistry (in-memory, UUID-keyed)               │
└────────────────────────────────────────────────────────────────────┘
```

## Backend Class Hierarchy

```
ImageProcessor
│   from_bytes()          — factory from uploaded bytes
│   resize_to()           — returns new resized processor
│   _compute_ft()         — lazy FFT2 + fftshift (cached)
│   get_ft_raw_component()     — raw array for math
│   get_ft_component_for_display() — log-scaled for visual
│   array_to_b64_png()    — normalize + encode
│   spatial_to_b64()
│   ft_component_to_b64()
│
└── EmphasizerProcessor
        apply_shift()
        apply_multiply_complex_exp()
        apply_stretch()
        apply_mirror()
        make_even() / make_odd()
        apply_rotation()
        differentiate() / integrate()
        apply_window()
        apply_fourier_repeat()
```

## Data Flow — Mix Operation

```
1. upload   POST /images/upload
            → Pillow decode → grayscale → ImageProcessor
            → ImageRegistry.add(processor)
            ← { image_id, spatial_b64, width, height }

2. display  POST /images/ft-component
            → registry.get(id)._compute_ft()
            → log1p(|F|) or angle(F) etc
            ← { data_b64 }

3. mix      POST /mixer/mix
            → cancel previous (AbortController + threading.Event)
            → get_unified_size() → resize each image
            → fft2() per image
            → weighted sum of roles (no normalisation)
            → ifft2() → |result|
            ← { result_b64, output_shape }
```

## Thread Safety

The mixer runs in a `ThreadPoolExecutor`. Each new mix request:

1. Calls `cancel_event.set()` on all previous active jobs
2. Creates a new `threading.Event` for itself
3. Checks `cancel_event.is_set()` before and after the heavy FFT work
4. The frontend simultaneously sends an `AbortController.signal` to cancel the HTTP request if it completes after a newer one has started

## Frontend State Architecture

```
useStore (Zustand)
├── mode          'mixer' | 'emphasizer'
├── theme         'dark' | 'light'
│
├── MIXER
│   ├── viewports[]        { imageId, spatialB64, width, height, filename }
│   ├── ftDisplayComponents[]   per-viewport display selection
│   ├── ftMixRoles[]            per-image mix contribution role
│   ├── mixWeights[]            0.0 – 1.0+
│   ├── mixMode                 'magnitude_phase' | 'real_imaginary'
│   ├── resizePolicy            'smallest' | 'largest' | 'fixed'
│   ├── regionEnabled / regionFraction / regionType
│   ├── outputImages[]          base64 results
│   └── isMixing / mixProgress
│
└── EMPHASIZER
    ├── emphImageId / emphSpatialB64
    ├── emphAction              one of 9 action keys
    ├── emphDomain              'spatial' | 'frequency'
    ├── emphParams              all action parameters + fourier_times + display
    └── emphResult              { panel_tl_b64, panel_tr_b64, panel_bl_b64, panel_br_b64 }
```

## Key Design Decisions

| Decision | Rationale |
|---|---|
| All image math in service classes | Zero NumPy in API handlers — testable, no coupling |
| Lazy FFT caching per `ImageProcessor` | Each image's FFT is computed once and reused across component requests |
| Raw weighted sum (no normalisation) | Normalising cancels the weight effect; raw sum lets the user actually hear the difference |
| `latestRef` pattern in `MixerControls` | Fixes stale closure in debounced `useEffect` — timeout always reads current state |
| `displayResult` local state | Panels never flash blank mid-update — only swap when full response arrives |
| Vite proxy for `/api` and `/health` | No CORS configuration in development |
| `EmphasizerProcessor` extends `ImageProcessor` | OOP; no duplicated image math |
