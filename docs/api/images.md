# Images API

Base URL: `http://localhost:8000/api/v1/images`

---

## Upload Image

```http
POST /upload
Content-Type: multipart/form-data
```

Upload an image file. The image is converted to grayscale internally and stored in the in-memory registry.

**Request:**

| Field | Type | Description |
|---|---|---|
| `file` | File | Image file (PNG, JPEG, BMP, TIFF, WEBP) |

**Response `200`:**

```json
{
  "image_id": "3f4a1b2c-...",
  "width": 512,
  "height": 384,
  "spatial_b64": "<base64 PNG string>"
}
```

**Errors:** `413` file too large · `415` unsupported format · `422` corrupt image

---

## Get FT Component

```http
POST /ft-component
Content-Type: application/json
```

Returns a specific FT component as a base64 PNG with optional display adjustments.

**Request body:**

```json
{
  "image_id":   "3f4a1b2c-...",
  "component":  "magnitude",
  "brightness": 1.0,
  "contrast":   1.0
}
```

| Field | Values | Default |
|---|---|---|
| `component` | `magnitude` · `phase` · `real` · `imaginary` | — |
| `brightness` | `0.1` – `5.0` | `1.0` |
| `contrast` | `0.1` – `5.0` | `1.0` |

!!! note
    Magnitude is returned in log-scale (`log1p(|F|)`) for perceptual clarity.

**Response `200`:**

```json
{
  "image_id":  "3f4a1b2c-...",
  "component": "magnitude",
  "data_b64":  "<base64 PNG string>"
}
```

---

## Get Spatial Adjusted

```http
POST /spatial-adjusted?image_id=<id>&brightness=1.0&contrast=1.0
```

Returns the spatial image with brightness/contrast applied.

**Response `200`:**

```json
{
  "image_id": "3f4a1b2c-...",
  "data_b64": "<base64 PNG string>"
}
```

---

## Resize Images

```http
POST /resize
Content-Type: application/json
```

Resize a set of images to a unified size per policy. Used to align input images before mixing and to update viewport previews.

**Request body:**

```json
{
  "image_ids":    ["id1", "id2", "id3"],
  "policy":       "smallest",
  "fixed_height": 512,
  "fixed_width":  512,
  "keep_aspect":  false
}
```

| `policy` | Behaviour |
|---|---|
| `smallest` | Resizes all to the smallest dimensions among loaded images |
| `largest` | Resizes all to the largest dimensions |
| `fixed` | Resizes all to `fixed_height × fixed_width` |

**Response `200`:**

```json
{
  "results": {
    "id1": "<base64 PNG>",
    "id2": "<base64 PNG>"
  },
  "unified_shape": [384, 512]
}
```

---

## Delete Image

```http
DELETE /{image_id}
```

Removes the image from the in-memory registry.

**Response `200`:**

```json
{ "deleted": "3f4a1b2c-..." }
```
