"""
Image and Fourier Transform processing service.
All mathematical operations are encapsulated here — no math in API layer.
"""
import base64
import io
import logging
import uuid
from typing import Literal

import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)

FTComponent = Literal["magnitude", "phase", "real", "imaginary"]
ResizePolicy = Literal["smallest", "largest", "fixed"]


class ImageProcessor:
    def __init__(self, image_id: str, image: np.ndarray):
        self.image_id = image_id
        self._spatial = image.astype(np.float64)
        self._ft: np.ndarray | None = None
        self._ft_shifted: np.ndarray | None = None

    @classmethod
    def from_bytes(cls, data: bytes) -> "ImageProcessor":
        image_id = str(uuid.uuid4())
        pil_img = Image.open(io.BytesIO(data)).convert("L")
        arr = np.array(pil_img, dtype=np.float64)
        return cls(image_id, arr)

    @property
    def shape(self) -> tuple[int, int]:
        return self._spatial.shape

    def resize_to(self, height: int, width: int, keep_aspect: bool = False) -> "ImageProcessor":
        pil_img = Image.fromarray(np.clip(self._spatial, 0, 255).astype(np.uint8))
        if keep_aspect:
            pil_img.thumbnail((width, height), Image.LANCZOS)
            new_img = Image.new("L", (width, height), 0)
            offset = ((width - pil_img.width) // 2, (height - pil_img.height) // 2)
            new_img.paste(pil_img, offset)
            pil_img = new_img
        else:
            pil_img = pil_img.resize((width, height), Image.LANCZOS)
        return ImageProcessor(self.image_id, np.array(pil_img, dtype=np.float64))

    def _compute_ft(self) -> None:
        if self._ft is None:
            self._ft = np.fft.fft2(self._spatial)
            self._ft_shifted = np.fft.fftshift(self._ft)

    def get_ft_raw_component(self, component: FTComponent) -> np.ndarray:
        self._compute_ft()
        ft = self._ft_shifted
        if component == "magnitude":
            return np.abs(ft)
        elif component == "phase":
            return np.angle(ft)
        elif component == "real":
            return ft.real
        elif component == "imaginary":
            return ft.imag
        raise ValueError(f"Unknown component: {component}")

    def get_ft_component_for_display(self, component: FTComponent) -> np.ndarray:
        self._compute_ft()
        ft = self._ft_shifted
        if component == "magnitude":
            return np.log1p(np.abs(ft))
        elif component == "phase":
            return np.angle(ft)
        elif component == "real":
            return ft.real
        elif component == "imaginary":
            return ft.imag
        raise ValueError(f"Unknown component: {component}")

    def get_spatial_image(self) -> np.ndarray:
        return self._spatial.copy()

    def array_to_b64_png(self, arr: np.ndarray, brightness: float = 1.0, contrast: float = 1.0) -> str:
        a_min, a_max = arr.min(), arr.max()
        if a_max - a_min < 1e-10:
            normalized = np.zeros_like(arr, dtype=np.uint8)
        else:
            normalized = (arr - a_min) / (a_max - a_min)
            normalized = np.clip((normalized - 0.5) * contrast + 0.5, 0, 1)
            normalized = np.clip(normalized * brightness, 0, 1)
            normalized = (normalized * 255).astype(np.uint8)
        pil_img = Image.fromarray(normalized, mode="L")
        buf = io.BytesIO()
        pil_img.save(buf, format="PNG")
        return base64.b64encode(buf.getvalue()).decode("utf-8")

    def spatial_to_b64(self, brightness: float = 1.0, contrast: float = 1.0) -> str:
        return self.array_to_b64_png(self._spatial, brightness, contrast)

    def ft_component_to_b64(self, component: FTComponent, brightness: float = 1.0, contrast: float = 1.0) -> str:
        return self.array_to_b64_png(self.get_ft_component_for_display(component), brightness, contrast)


class ImageRegistry:
    def __init__(self) -> None:
        self._images: dict[str, ImageProcessor] = {}

    def add(self, processor: ImageProcessor) -> str:
        self._images[processor.image_id] = processor
        return processor.image_id

    def get(self, image_id: str) -> ImageProcessor | None:
        return self._images.get(image_id)

    def remove(self, image_id: str) -> None:
        self._images.pop(image_id, None)

    def get_unified_size(
        self,
        image_ids: list[str],
        policy: ResizePolicy,
        fixed_h: int = 512,
        fixed_w: int = 512,
    ) -> tuple[int, int]:
        processors = [self._images[iid] for iid in image_ids if iid in self._images]
        if not processors:
            return (512, 512)
        shapes = [p.shape for p in processors]
        if policy == "smallest":
            h = min(s[0] for s in shapes)
            w = min(s[1] for s in shapes)
        elif policy == "largest":
            h = max(s[0] for s in shapes)
            w = max(s[1] for s in shapes)
        else:
            h, w = fixed_h, fixed_w
        return (h, w)


class MixerService:
    """
    Weighted FT component mixing.
    Weights are kept raw (not normalised) so the user sees the effect of changing them.
    """

    def __init__(self, registry: ImageRegistry) -> None:
        self._registry = registry

    def mix(
        self,
        image_ids: list[str],
        weights: list[float],
        image_roles: list[FTComponent],
        mix_mode: Literal["magnitude_phase", "real_imaginary"],
        region_mask: np.ndarray | None = None,
        unified_size: tuple[int, int] = (512, 512),
        keep_aspect: bool = False,
        simulate_delay: bool = False,
    ) -> str:
        if simulate_delay:
            import time
            time.sleep(3)

        h, w = unified_size
        entries = []
        for iid, weight, role in zip(image_ids, weights, image_roles):
            p = self._registry.get(iid)
            if p is not None:
                p = p.resize_to(h, w, keep_aspect)
                entries.append((p, weight, role))

        if not entries:
            raise ValueError("No valid images provided for mixing")

        if mix_mode == "magnitude_phase":
            mixed_ft = self._mix_magnitude_phase(entries, (h, w), region_mask)
        else:
            mixed_ft = self._mix_real_imaginary(entries, (h, w), region_mask)

        result_spatial = np.abs(np.fft.ifft2(np.fft.ifftshift(mixed_ft)))
        dummy = ImageProcessor("result", result_spatial)
        return dummy.spatial_to_b64()

    def _mix_magnitude_phase(
        self,
        entries: list,
        shape: tuple[int, int],
        mask: np.ndarray | None,
    ) -> np.ndarray:
        h, w = shape
        mixed_mag = np.zeros((h, w), dtype=float)
        mixed_phase = np.zeros((h, w), dtype=float)
        has_mag = False
        has_phase = False

        for p, weight, role in entries:
            p._compute_ft()
            ft = p._ft_shifted
            if role == "magnitude":
                component = np.abs(ft)
                if mask is not None:
                    component = component * mask
                mixed_mag += weight * component
                has_mag = True
            elif role == "phase":
                component = np.angle(ft)
                if mask is not None:
                    component = component * mask
                mixed_phase += weight * component
                has_phase = True

        if not has_mag and entries:
            p, _, _ = entries[0]
            p._compute_ft()
            mixed_mag = np.abs(p._ft_shifted)
        if not has_phase and entries:
            p, _, _ = entries[0]
            p._compute_ft()
            mixed_phase = np.angle(p._ft_shifted)

        return mixed_mag * np.exp(1j * mixed_phase)

    def _mix_real_imaginary(
        self,
        entries: list,
        shape: tuple[int, int],
        mask: np.ndarray | None,
    ) -> np.ndarray:
        h, w = shape
        mixed_real = np.zeros((h, w), dtype=float)
        mixed_imag = np.zeros((h, w), dtype=float)
        has_real = False
        has_imag = False

        for p, weight, role in entries:
            p._compute_ft()
            ft = p._ft_shifted
            if role == "real":
                component = ft.real if mask is None else ft.real * mask
                mixed_real += weight * component
                has_real = True
            elif role == "imaginary":
                component = ft.imag if mask is None else ft.imag * mask
                mixed_imag += weight * component
                has_imag = True

        if not has_real and entries:
            p, _, _ = entries[0]
            p._compute_ft()
            mixed_real = p._ft_shifted.real
        if not has_imag and entries:
            p, _, _ = entries[0]
            p._compute_ft()
            mixed_imag = p._ft_shifted.imag

        return mixed_real + 1j * mixed_imag


# Module-level singletons
image_registry = ImageRegistry()
mixer_service = MixerService(image_registry)
