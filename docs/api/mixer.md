# Mixer API

Base URL: `http://localhost:8000/api/v1/mixer`

---

## Mix Images

```http
POST /mix
Content-Type: application/json
```

Performs a weighted FT component mix across up to 4 images and returns the IFFT result as a base64 PNG.

**Cancellation:** if a previous mix is still running when this request arrives, it is cancelled automatically before the new one starts.

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

| Field | Type | Description |
|---|---|---|
| `image_ids` | string[] | UUIDs of uploaded images (1–4) |
| `weights` | float[] | Per-image contribution weight (0.0 – any positive value) |
| `image_roles` | string[] | `magnitude` · `phase` · `real` · `imaginary` |
| `mix_mode` | string | `magnitude_phase` or `real_imaginary` |
| `resize_policy` | string | `smallest` · `largest` · `fixed` |
| `region_fraction` | float\|null | Rectangle size as fraction 0–1; `null` = full spectrum |
| `region_type` | string | `inner` (low-freq) or `outer` (high-freq) |
| `simulate_delay` | bool | Add 3-second delay for testing cancellation |

!!! warning
    `image_ids`, `weights`, and `image_roles` must all be the same length.

**Response `200`:**

```json
{
  "result_b64":   "<base64 PNG>",
  "output_shape": [384, 512]
}
```

**Errors:** `404` image not found · `409` cancelled by newer request · `422` validation error · `500` FFT failed
