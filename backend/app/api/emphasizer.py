"""
Emphasizer API router (Part B).
Supports spatial-domain and frequency-domain action application (duality).
Fourier repeat is applied as a post-processing step on top of any action.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Literal, Optional
import numpy as np

from app.services.emphasizer_service import EmphasizerProcessor
from app.services.image_service import ImageProcessor, image_registry

router = APIRouter(prefix="/emphasizer", tags=["emphasizer"])


class EmphasizeRequest(BaseModel):
    image_id: str
    action: Literal[
        "shift", "multiply_complex_exp", "stretch", "mirror",
        "make_even", "make_odd", "rotate", "differentiate",
        "integrate", "window"
    ]
    # Domain: apply action on spatial image or on its FT
    domain: Literal["spatial", "frequency"] = "spatial"

    # Action parameters
    shift_dy: int = 0
    shift_dx: int = 0
    u0: float = 0.1
    v0: float = 0.1
    stretch_sy: float = 1.5
    stretch_sx: float = 1.5
    mirror_axis: Literal["horizontal", "vertical", "both"] = "horizontal"
    rotation_degrees: float = 45.0
    diff_axis: Literal["x", "y"] = "x"
    integ_axis: Literal["x", "y"] = "x"
    window_type: Literal["rectangular", "gaussian", "hamming", "hanning"] = "gaussian"
    window_sigma: float = Field(default=0.3, ge=0.01, le=1.0)
    window_alpha: float = Field(default=0.54, ge=0.0, le=1.0)

    # Post-processing: apply FFT N additional times after the action (0 = no extra FT)
    fourier_times: int = Field(default=0, ge=0, le=8)

    # Display options
    ft_component: Literal["magnitude", "phase", "real", "imaginary"] = "magnitude"
    brightness: float = Field(default=1.0, ge=0.1, le=5.0)
    contrast: float = Field(default=1.0, ge=0.1, le=5.0)


class EmphasizeResponse(BaseModel):
    # Top-left, top-right, bottom-left, bottom-right panels
    # When domain=spatial:   top = original spatial/FT,  bottom = transformed spatial/FT
    # When domain=frequency: top = original FT/spatial,  bottom = transformed FT/spatial
    panel_tl_b64: str   # top-left
    panel_tr_b64: str   # top-right
    panel_bl_b64: str   # bottom-left
    panel_br_b64: str   # bottom-right
    panel_tl_label: str
    panel_tr_label: str
    panel_bl_label: str
    panel_br_label: str
    domain: str
    action: str


@router.post("/apply", response_model=EmphasizeResponse)
async def apply_emphasizer(req: EmphasizeRequest):
    base_proc = image_registry.get(req.image_id)
    if base_proc is None:
        raise HTTPException(status_code=404, detail="Image not found")

    orig = EmphasizerProcessor(base_proc.image_id, base_proc.get_spatial_image())

    try:
        if req.domain == "spatial":
            response = _apply_spatial_domain(orig, req)
        else:
            response = _apply_frequency_domain(orig, req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transform failed: {str(e)}")

    return response


def _apply_fourier_repeat(proc: EmphasizerProcessor, times: int) -> EmphasizerProcessor:
    """Apply FFT `times` additional times on top of existing spatial data."""
    if times == 0:
        return proc
    return proc.apply_fourier_repeat(times)


def _apply_action(proc: EmphasizerProcessor, req: EmphasizeRequest) -> EmphasizerProcessor:
    """Dispatch spatial-domain action."""
    if req.action == "shift":
        return proc.apply_shift(req.shift_dy, req.shift_dx)
    elif req.action == "multiply_complex_exp":
        return proc.apply_multiply_complex_exp(req.u0, req.v0)
    elif req.action == "stretch":
        return proc.apply_stretch(req.stretch_sy, req.stretch_sx)
    elif req.action == "mirror":
        return proc.apply_mirror(req.mirror_axis)
    elif req.action == "make_even":
        return proc.make_even()
    elif req.action == "make_odd":
        return proc.make_odd()
    elif req.action == "rotate":
        return proc.apply_rotation(req.rotation_degrees)
    elif req.action == "differentiate":
        return proc.differentiate(req.diff_axis)
    elif req.action == "integrate":
        return proc.integrate(req.integ_axis)
    elif req.action == "window":
        return proc.apply_window(req.window_type, req.window_sigma, req.window_alpha)
    else:
        raise ValueError(f"Unknown action: {req.action}")


def _apply_spatial_domain(orig: EmphasizerProcessor, req: EmphasizeRequest) -> EmphasizeResponse:
    """
    Apply action in spatial domain.
    Layout:
      TL = original spatial image
      TR = FT of original
      BL = transformed spatial (after action + optional repeated FT)
      BR = FT of transformed
    """
    transformed = _apply_action(orig, req)
    # Apply repeated Fourier on top if requested
    transformed = _apply_fourier_repeat(transformed, req.fourier_times)

    b, c = req.brightness, req.contrast
    ft = req.ft_component

    return EmphasizeResponse(
        panel_tl_b64=orig.spatial_to_b64(b, c),
        panel_tr_b64=orig.ft_component_to_b64(ft, b, c),
        panel_bl_b64=transformed.spatial_to_b64(b, c),
        panel_br_b64=transformed.ft_component_to_b64(ft, b, c),
        panel_tl_label="Original — Spatial",
        panel_tr_label=f"Original — FT {ft}",
        panel_bl_label=f"Transformed — {req.action}" + (f" + FT×{req.fourier_times}" if req.fourier_times > 0 else ""),
        panel_br_label=f"FT of Transformed — {ft}",
        domain="spatial",
        action=req.action,
    )


def _apply_frequency_domain(orig: EmphasizerProcessor, req: EmphasizeRequest) -> EmphasizeResponse:
    """
    Apply action in frequency domain (duality mode).
    We operate on the FT of the image, apply the action there,
    then IFFT back to get the resulting spatial image.
    Layout:
      TL = FT of original (this is the "input" being modified)
      TR = original spatial image
      BL = FT after action (transformed frequency domain)
      BR = IFFT of transformed FT (resulting spatial)
    """
    b, c = req.brightness, req.contrast
    ft_comp = req.ft_component

    # Build an EmphasizerProcessor whose _spatial IS the FT magnitude/component
    # We work on the magnitude of the FT as the "spatial" input
    orig._compute_ft()
    ft_data = orig._ft_shifted  # complex

    # Convert the FT to a real-valued image for spatial-domain operations
    # We use the magnitude (log-scaled for visual use but raw for processing)
    ft_as_spatial = np.abs(ft_data)  # raw magnitude

    ft_proc = EmphasizerProcessor(orig.image_id + "_ft_domain", ft_as_spatial)
    transformed_ft_proc = _apply_action(ft_proc, req)
    transformed_ft_proc = _apply_fourier_repeat(transformed_ft_proc, req.fourier_times)

    # The "result spatial" is the IFFT of the transformed FT magnitude
    # We reconstruct a complex FT using transformed magnitude + original phase
    orig_phase = np.angle(ft_data)
    transformed_mag = transformed_ft_proc.get_spatial_image()

    # Resize phase to match if rotation expanded canvas
    if transformed_mag.shape != orig_phase.shape:
        from PIL import Image as PILImage
        pil = PILImage.fromarray(orig_phase.astype(np.float32))
        # just take original size — use original phase unmodified
        transformed_mag_resized = np.zeros_like(orig_phase)
        h = min(transformed_mag.shape[0], orig_phase.shape[0])
        w = min(transformed_mag.shape[1], orig_phase.shape[1])
        transformed_mag_resized[:h, :w] = transformed_mag[:h, :w]
        transformed_mag = transformed_mag_resized

    reconstructed_ft = transformed_mag * np.exp(1j * orig_phase)
    result_spatial = np.abs(np.fft.ifft2(np.fft.ifftshift(reconstructed_ft)))
    result_proc = EmphasizerProcessor(orig.image_id + "_ft_result", result_spatial)

    return EmphasizeResponse(
        panel_tl_b64=orig.ft_component_to_b64(ft_comp, b, c),
        panel_tr_b64=orig.spatial_to_b64(b, c),
        panel_bl_b64=transformed_ft_proc.ft_component_to_b64(ft_comp, b, c),
        panel_br_b64=result_proc.spatial_to_b64(b, c),
        panel_tl_label=f"Original FT — {ft_comp}",
        panel_tr_label="Original — Spatial",
        panel_bl_label=f"Transformed FT — {req.action}" + (f" + FT×{req.fourier_times}" if req.fourier_times > 0 else ""),
        panel_br_label="Result Spatial (IFFT)",
        domain="frequency",
        action=req.action,
    )
