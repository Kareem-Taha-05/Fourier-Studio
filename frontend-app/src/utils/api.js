import axios from 'axios';

/**
 * Axios instance — uses Vite dev proxy (/api → http://localhost:8000)
 * so no CORS issues in development.
 */
const api = axios.create({
  baseURL: '/api/v1',
  timeout: 60000,
});

// ── Image endpoints ───────────────────────────────────────────────────────────

/** Upload an image file; returns { image_id, width, height, spatial_b64 } */
export const uploadImage = (file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/images/upload', form);
};

/** Get a specific FT component as base64 PNG */
export const getFTComponent = (imageId, component, brightness = 1.0, contrast = 1.0) =>
  api.post('/images/ft-component', {
    image_id: imageId,
    component,
    brightness,
    contrast,
  });

/** Get spatial image with brightness/contrast applied */
export const getSpatialAdjusted = (imageId, brightness = 1.0, contrast = 1.0) =>
  api.post('/images/spatial-adjusted', null, {
    params: { image_id: imageId, brightness, contrast },
  });

/** Unify sizes of multiple images */
export const resizeImages = (imageIds, policy, fixedH, fixedW, keepAspect) =>
  api.post('/images/resize', {
    image_ids: imageIds,
    policy,
    fixed_height: fixedH,
    fixed_width: fixedW,
    keep_aspect: keepAspect,
  });

/** Delete an uploaded image from the server registry */
export const deleteImage = (imageId) => api.delete(`/images/${imageId}`);

// ── Mixer endpoint ────────────────────────────────────────────────────────────

/**
 * Mix FT components of multiple images.
 * Pass an AbortController.signal to support cancellation.
 */
export const mixImages = (payload, signal) =>
  api.post('/mixer/mix', payload, { signal });

// ── Emphasizer endpoint ───────────────────────────────────────────────────────

/** Apply an FT property transform; returns 4 base64 images (before/after × spatial/frequency) */
export const applyEmphasizer = (payload) =>
  api.post('/emphasizer/apply', payload);

export default api;
