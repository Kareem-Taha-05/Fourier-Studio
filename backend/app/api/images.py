"""
Images API router.
Handles upload, FT component retrieval, and unified resize.
"""
import numpy as np
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.models.schemas import (
    ImageUploadResponse,
    FTComponentRequest,
    FTComponentResponse,
    MixRequest,
    MixResponse,
    ResizeRequest,
    ResizeResponse,
)
from app.services.image_service import image_registry, mixer_service, ImageProcessor

router = APIRouter(prefix="/images", tags=["images"])

MAX_BYTES = settings.MAX_IMAGE_SIZE_MB * 1024 * 1024


@router.post("/upload", response_model=ImageUploadResponse)
async def upload_image(file: UploadFile = File(...)):
    """
    Upload an image file. Returns image_id and initial spatial view (grayscale, base64).
    Supported formats: PNG, JPEG, BMP, TIFF, WEBP.
    """
    if file.content_type not in {
        "image/png", "image/jpeg", "image/bmp",
        "image/tiff", "image/webp", "image/gif",
    }:
        raise HTTPException(status_code=415, detail=f"Unsupported image type: {file.content_type}")

    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Image exceeds maximum size of {settings.MAX_IMAGE_SIZE_MB}MB",
        )

    try:
        processor = ImageProcessor.from_bytes(data)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to process image: {str(e)}")

    image_registry.add(processor)
    h, w = processor.shape

    return ImageUploadResponse(
        image_id=processor.image_id,
        width=w,
        height=h,
        spatial_b64=processor.spatial_to_b64(),
    )


@router.post("/ft-component", response_model=FTComponentResponse)
async def get_ft_component(req: FTComponentRequest):
    """
    Get a specific FT component (magnitude/phase/real/imaginary) of an uploaded image.
    Supports brightness/contrast adjustment for display.
    """
    processor = image_registry.get(req.image_id)
    if processor is None:
        raise HTTPException(status_code=404, detail=f"Image {req.image_id} not found")

    try:
        b64 = processor.ft_component_to_b64(
            req.component,
            brightness=req.brightness,
            contrast=req.contrast,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"FT computation failed: {str(e)}")

    return FTComponentResponse(
        image_id=req.image_id,
        component=req.component,
        data_b64=b64,
    )


@router.post("/spatial-adjusted")
async def get_spatial_adjusted(image_id: str, brightness: float = 1.0, contrast: float = 1.0):
    """Get spatial image with brightness/contrast adjustments."""
    processor = image_registry.get(image_id)
    if processor is None:
        raise HTTPException(status_code=404, detail="Image not found")

    b64 = processor.spatial_to_b64(brightness=brightness, contrast=contrast)
    return {"image_id": image_id, "data_b64": b64}


@router.post("/resize", response_model=ResizeResponse)
async def resize_images(req: ResizeRequest):
    """
    Resize all specified images to a unified size per policy.
    Returns resized spatial views for all images.
    """
    unified_h, unified_w = image_registry.get_unified_size(
        req.image_ids,
        policy=req.policy,
        fixed_h=req.fixed_height,
        fixed_w=req.fixed_width,
    )

    results = {}
    for iid in req.image_ids:
        p = image_registry.get(iid)
        if p is None:
            continue
        resized = p.resize_to(unified_h, unified_w, req.keep_aspect)
        results[iid] = resized.spatial_to_b64()

    return ResizeResponse(
        results=results,
        unified_shape=(unified_h, unified_w),
    )


@router.delete("/{image_id}")
async def delete_image(image_id: str):
    """Remove an uploaded image from the registry."""
    if image_registry.get(image_id) is None:
        raise HTTPException(status_code=404, detail="Image not found")
    image_registry.remove(image_id)
    return {"deleted": image_id}
