# Usage Guide

## Interface Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  📡  FREQWAVE     [ Mixer ]  [ Emphasizer ]   [◐ DARK]  ● SYS ONLINE │
├──────────────────────────────────────────────────────────────────────┤
│                   Main content area                                   │
└──────────────────────────────────────────────────────────────────────┘
```

| Element | Function |
|---|---|
| **[ Mixer ] / [ Emphasizer ]** | Tab switcher — state in each tab is preserved when switching |
| **[◐ DARK / LIGHT]** | Flip-switch theme toggle |
| **● SYS ONLINE** | Backend health indicator — polls every 15 seconds |

---

## Part A — FT Mixer

### Layout

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

### Loading Images

- **Double-click** any input slot to open the file browser
- **Drag and drop** an image file directly onto any slot
- Supported formats: PNG, JPEG, BMP, TIFF, WEBP
- Images are automatically converted to grayscale

### Display vs Mix Role

Each viewport has **two independent controls**:

| Control | Location | Effect |
|---|---|---|
| Display dropdown (bottom of slot) | Viewport footer | What you *see* in the FT panel. Has no effect on the mix output. |
| Role buttons (MAG / PHS or RE / IM) | Controls sidebar | What this image *contributes* to the IFFT reconstruction. |

### Brightness and Contrast

Drag on the **spatial panel** (left half of any slot):

- **Left / Right** — adjust contrast
- **Up / Down** — adjust brightness

### Mix Modes

=== "Magnitude / Phase"

    - Some images contribute their **magnitude** |F(u,v)|
    - Other images contribute their **phase** ∠F(u,v)
    - Reconstruction: `mixed_magnitude × exp(j × mixed_phase)` → IFFT

=== "Real / Imaginary"

    - Some images contribute their **real part** Re{F(u,v)}
    - Other images contribute their **imaginary part** Im{F(u,v)}
    - Reconstruction: `mixed_real + j × mixed_imag` → IFFT

### Frequency Region

Enable **Region Selection** to restrict which frequencies participate in the mix:

| Setting | Captures | Effect |
|---|---|---|
| **Inner (Low)** | Centred rectangle | Broad shapes, colour, overall brightness |
| **Outer (High)** | Everything outside rect | Fine detail, edges, texture |

The region rectangle appears as a coloured overlay on **all 4 FT panels simultaneously** — it is always unified across images.

!!! tip "Classic experiment"
    Load a face image into IMG 01 (role: **MAG**) and a different face into IMG 02 (role: **PHS**). Set both weights to 1.0. The output will structurally resemble IMG 02 (phase carries layout) with IMG 01's frequency energy (magnitude carries intensity pattern).

### Output Ports

- Click an output monitor to make it the **active target** (cyan glow = active)
- All mix results go to whichever output is currently selected
- Click the **download icon** in the output header to save as PNG

---

## Part B — FT Emphasizer

### Layout

```
┌─────────────┐  ┌───────────────┬───────────────┐
│  Controls   │  │  Original     │  Original     │
│  (sidebar)  │  │  Spatial      │  FT           │
│             │  ├───────────────┼───────────────┤
│             │  │  Transformed  │  FT of        │
│             │  │  Spatial      │  Transformed  │
└─────────────┘  └───────────────┴───────────────┘
```

### Domain Toggle

The **Apply Action On** control is the centrepiece:

=== "Spatial Domain"
    - Your action modifies **the image** f(x,y)
    - Top row shows the original image and its FT
    - Bottom row shows the transformed image and its FT
    - *Watch the FT react to your spatial operation*

=== "Frequency Domain"
    - Your action modifies **the FT directly** F(u,v)
    - Top row shows the original FT and its IFFT (the image)
    - Bottom row shows the transformed FT and its reconstruction
    - *Watch the image change as you manipulate the spectrum*

### Actions

| Action | What it does | Key FT insight |
|---|---|---|
| **Shift** | Slides the image | Magnitude unchanged; only phase rotates |
| **Complex Exp. Multiply** | Imposes a wave on the image | Shifts the entire FT to a new frequency location |
| **Stretch** | Scales image axes | FT compresses inversely (scaling theorem) |
| **Mirror** | Flips the image | FT flips correspondingly |
| **Make Even** | (image + mirror) / 2 | FT becomes purely real |
| **Make Odd** | (image − mirror) / 2 | FT becomes purely imaginary |
| **Rotate** | Rotates N degrees | FT rotates by the same angle |
| **Differentiate** | Detects edges | FT boosted at high frequencies |
| **Integrate** | Running sum | FT suppressed at high frequencies (blurring) |
| **Window Function** | Smooth fade to zero at edges | Reduces spectral leakage via convolution theorem |

### Repeated Fourier

The **FT times** slider applies N additional FFTs *after* your chosen action:

- `0` — no extra Fourier (action only)
- `1` — one extra FFT applied to the result
- `4` — many images converge to a rotated/scaled version of themselves

### Educational InfoCards

Every action includes a collapsible card:

```
▼  What does this do?
────────────────────────────────────────────
 f(x,y) Spatial    ↔    F(u,v) Frequency
 Plain English          Plain English
 explanation            explanation
────────────────────────────────────────────
 ⚡ FT Duality
 The deeper mathematical relationship
 between the two domains
```

Click **"What does this do?"** to expand/collapse.
