# Emphasizer API

Base URL: `http://localhost:8000/api/v1/emphasizer`

---

## Apply Transform

```http
POST /apply
Content-Type: application/json
```

Applies an FT property transform to an uploaded image and returns four base64 panels representing the before/after views in both spatial and frequency domains.

**Request body:**

```json
{
  "image_id":          "uuid",
  "action":            "shift",
  "domain":            "spatial",
  "shift_dy":          50,
  "shift_dx":          50,
  "u0":                0.1,
  "v0":                0.1,
  "stretch_sy":        1.5,
  "stretch_sx":        1.5,
  "mirror_axis":       "horizontal",
  "rotation_degrees":  45.0,
  "diff_axis":         "x",
  "integ_axis":        "x",
  "window_type":       "gaussian",
  "window_sigma":      0.3,
  "window_alpha":      0.54,
  "fourier_times":     0,
  "ft_component":      "magnitude",
  "brightness":        1.0,
  "contrast":          1.0
}
```

| Field | Values | Description |
|---|---|---|
| `action` | `shift` · `multiply_complex_exp` · `stretch` · `mirror` · `make_even` · `make_odd` · `rotate` · `differentiate` · `integrate` · `window` | Transform to apply |
| `domain` | `spatial` · `frequency` | Apply action to image or to its FT |
| `fourier_times` | `0` – `8` | Extra FFT passes applied after the action |
| `ft_component` | `magnitude` · `phase` · `real` · `imaginary` | Component shown in frequency panels |

**Response `200` — spatial domain:**

```json
{
  "panel_tl_b64":  "<original spatial>",
  "panel_tr_b64":  "<original FT>",
  "panel_bl_b64":  "<transformed spatial>",
  "panel_br_b64":  "<FT of transformed>",
  "panel_tl_label": "Original — Spatial",
  "panel_tr_label": "Original — FT magnitude",
  "panel_bl_label": "Transformed — shift",
  "panel_br_label": "FT of Transformed — magnitude",
  "domain": "spatial",
  "action": "shift"
}
```

**Response `200` — frequency domain:**

The panel layout swaps: top-left becomes the original FT, top-right becomes the original spatial reconstruction, etc.

**Errors:** `404` image not found · `500` transform failed
