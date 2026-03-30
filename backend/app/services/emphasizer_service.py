"""
FT Properties Emphasizer service (Part B).
All spatial/frequency domain transformations are encapsulated here.
"""
from typing import Literal

import numpy as np
from PIL import Image

from app.services.image_service import ImageProcessor

WindowType = Literal["rectangular", "gaussian", "hamming", "hanning"]


class EmphasizerProcessor(ImageProcessor):
    """Extends ImageProcessor with all FT property transformation methods."""

    def apply_shift(self, dy: int, dx: int) -> "EmphasizerProcessor":
        shifted = np.roll(np.roll(self._spatial, dy, axis=0), dx, axis=1)
        return EmphasizerProcessor(self.image_id + "_shifted", shifted)

    def apply_multiply_complex_exp(self, u0: float, v0: float) -> "EmphasizerProcessor":
        h, w = self._spatial.shape
        y = np.arange(h).reshape(-1, 1) / h
        x = np.arange(w).reshape(1, -1) / w
        modulation = np.exp(2j * np.pi * (u0 * x + v0 * y))
        result = self._spatial * modulation.real
        return EmphasizerProcessor(self.image_id + "_modulated", result)

    def apply_stretch(self, sy: float, sx: float) -> "EmphasizerProcessor":
        h, w = self._spatial.shape
        new_h = max(1, int(h * sy))
        new_w = max(1, int(w * sx))
        pil = Image.fromarray(self._spatial.astype(np.uint8))
        stretched = pil.resize((new_w, new_h), Image.LANCZOS)
        result = np.zeros((h, w), dtype=np.float64)
        arr = np.array(stretched, dtype=np.float64)
        copy_h = min(h, new_h)
        copy_w = min(w, new_w)
        result[:copy_h, :copy_w] = arr[:copy_h, :copy_w]
        return EmphasizerProcessor(self.image_id + "_stretched", result)

    def apply_mirror(self, axis: Literal["horizontal", "vertical", "both"]) -> "EmphasizerProcessor":
        if axis == "horizontal":
            result = np.fliplr(self._spatial)
        elif axis == "vertical":
            result = np.flipud(self._spatial)
        else:
            result = np.flip(self._spatial)
        return EmphasizerProcessor(self.image_id + "_mirrored", result)

    def make_even(self) -> "EmphasizerProcessor":
        flipped = np.flip(self._spatial)
        result = (self._spatial + flipped) / 2
        return EmphasizerProcessor(self.image_id + "_even", result)

    def make_odd(self) -> "EmphasizerProcessor":
        flipped = np.flip(self._spatial)
        result = (self._spatial - flipped) / 2
        return EmphasizerProcessor(self.image_id + "_odd", result)

    def apply_rotation(self, degrees: float) -> "EmphasizerProcessor":
        pil = Image.fromarray(self._spatial.astype(np.uint8))
        rotated = pil.rotate(-degrees, expand=True, fillcolor=0)
        return EmphasizerProcessor(self.image_id + "_rotated", np.array(rotated, dtype=np.float64))

    def differentiate(self, axis: Literal["x", "y"] = "x") -> "EmphasizerProcessor":
        if axis == "x":
            result = np.diff(self._spatial, axis=1, prepend=self._spatial[:, :1])
        else:
            result = np.diff(self._spatial, axis=0, prepend=self._spatial[:1, :])
        return EmphasizerProcessor(self.image_id + "_diff", result)

    def integrate(self, axis: Literal["x", "y"] = "x") -> "EmphasizerProcessor":
        if axis == "x":
            result = np.cumsum(self._spatial, axis=1)
        else:
            result = np.cumsum(self._spatial, axis=0)
        return EmphasizerProcessor(self.image_id + "_integ", result)

    def apply_window(
        self,
        window_type: WindowType,
        sigma: float = 0.3,
        alpha: float = 0.54,
    ) -> "EmphasizerProcessor":
        h, w = self._spatial.shape
        win_1d_y = self._make_1d_window(h, window_type, sigma, alpha)
        win_1d_x = self._make_1d_window(w, window_type, sigma, alpha)
        window_2d = np.outer(win_1d_y, win_1d_x)
        result = self._spatial * window_2d
        return EmphasizerProcessor(self.image_id + "_windowed", result)

    @staticmethod
    def _make_1d_window(n: int, wtype: WindowType, sigma: float, alpha: float) -> np.ndarray:
        if wtype == "rectangular":
            return np.ones(n)
        elif wtype == "gaussian":
            x = np.linspace(-0.5, 0.5, n)
            return np.exp(-0.5 * (x / sigma) ** 2)
        elif wtype == "hamming":
            return np.hamming(n)
        elif wtype == "hanning":
            return np.hanning(n)
        return np.ones(n)

    def apply_fourier_repeat(self, times: int) -> "EmphasizerProcessor":
        """Apply FFT times times with log-magnitude normalisation between steps."""
        if times == 0:
            return EmphasizerProcessor(self.image_id + "_ft0", self._spatial.copy())

        result = self._spatial.astype(np.float64)
        for _ in range(times):
            ft = np.fft.fftshift(np.fft.fft2(result))
            log_mag = np.log1p(np.abs(ft))
            lo, hi = log_mag.min(), log_mag.max()
            if hi - lo > 1e-10:
                result = (log_mag - lo) / (hi - lo) * 255.0
            else:
                result = np.zeros_like(log_mag)

        return EmphasizerProcessor(self.image_id + f"_ft{times}", result)

    def get_ft_complex_array(self) -> np.ndarray:
        self._compute_ft()
        return self._ft_shifted.copy()
