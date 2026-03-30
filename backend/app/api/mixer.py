"""
Mixer API router.
Handles FT mixing with threading support for cancellable long operations.
"""
import asyncio
import threading
import uuid
from concurrent.futures import ThreadPoolExecutor

import numpy as np
from fastapi import APIRouter, HTTPException

from app.models.schemas import MixRequest, MixResponse
from app.services.image_service import image_registry, mixer_service

router = APIRouter(prefix="/mixer", tags=["mixer"])

_executor = ThreadPoolExecutor(max_workers=4)
_active_jobs: dict[str, threading.Event] = {}
_jobs_lock = threading.Lock()


def _build_region_mask(shape: tuple[int, int], fraction: float, region_type: str) -> np.ndarray:
    h, w = shape
    rh = int(h * fraction / 2)
    rw = int(w * fraction / 2)
    cy, cx = h // 2, w // 2
    inner_mask = np.zeros((h, w), dtype=float)
    inner_mask[cy - rh: cy + rh, cx - rw: cx + rw] = 1.0
    return inner_mask if region_type == "inner" else 1.0 - inner_mask


def _run_mix(req: MixRequest, cancel_event: threading.Event):
    if cancel_event.is_set():
        raise asyncio.CancelledError("Job cancelled")

    unified_size = image_registry.get_unified_size(
        req.image_ids,
        policy=req.resize_policy,
        fixed_h=req.fixed_height,
        fixed_w=req.fixed_width,
    )

    mask = None
    if req.region_fraction is not None and req.region_fraction > 0:
        mask = _build_region_mask(unified_size, req.region_fraction, req.region_type)

    if cancel_event.is_set():
        raise asyncio.CancelledError("Job cancelled")

    result_b64 = mixer_service.mix(
        image_ids=req.image_ids,
        weights=req.weights,
        image_roles=req.image_roles,
        mix_mode=req.mix_mode,
        region_mask=mask,
        unified_size=unified_size,
        keep_aspect=req.keep_aspect,
        simulate_delay=req.simulate_delay,
    )
    return result_b64, unified_size


@router.post("/mix", response_model=MixResponse)
async def mix_images(req: MixRequest):
    if len(req.image_ids) != len(req.weights) or len(req.image_ids) != len(req.image_roles):
        raise HTTPException(
            status_code=422,
            detail="image_ids, weights, and image_roles must all have the same length",
        )

    for iid in req.image_ids:
        if image_registry.get(iid) is None:
            raise HTTPException(status_code=404, detail=f"Image {iid} not found")

    cancel_event = threading.Event()
    job_id = str(uuid.uuid4())

    with _jobs_lock:
        for ev in _active_jobs.values():
            ev.set()
        _active_jobs.clear()
        _active_jobs[job_id] = cancel_event

    loop = asyncio.get_event_loop()
    try:
        result_b64, unified_size = await loop.run_in_executor(
            _executor, lambda: _run_mix(req, cancel_event)
        )
    except asyncio.CancelledError:
        raise HTTPException(status_code=409, detail="Operation cancelled by newer request")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mixing failed: {str(e)}")
    finally:
        with _jobs_lock:
            _active_jobs.pop(job_id, None)

    return MixResponse(result_b64=result_b64, output_shape=unified_size)
