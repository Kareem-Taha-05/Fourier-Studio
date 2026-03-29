"""
Unit tests for ImageProcessor, ImageRegistry, and MixerService.
Tests the math layer directly — no HTTP involved.
"""
import io
import sys
import os

import numpy as np
import pytest
from PIL import Image

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.services.image_service import ImageProcessor, ImageRegistry, MixerService
from app.services.emphasizer_service import EmphasizerProcessor


def make_png(pattern: np.ndarray) -> bytes:
    buf = io.BytesIO()
    Image.fromarray(pattern.astype(np.uint8)).save(buf, format="PNG")
    return buf.getvalue()


@pytest.fixture
def sine_image():
    arr = np.zeros((64, 64), dtype=np.uint8)
    for i in range(64):
        arr[i, :] = int(128 + 100 * np.sin(i / 5.0))
    return ImageProcessor.from_bytes(make_png(arr))


@pytest.fixture
def checkerboard():
    arr = np.zeros((64, 64), dtype=np.uint8)
    arr[::2, ::2] = 255
    arr[1::2, 1::2] = 255
    return ImageProcessor.from_bytes(make_png(arr))


class TestImageProcessor:
    def test_from_bytes_shape(self, sine_image):
        assert sine_image.shape == (64, 64)

    def test_ft_magnitude_is_positive(self, sine_image):
        mag = sine_image.get_ft_raw_component("magnitude")
        assert (mag >= 0).all()

    def test_ft_phase_in_range(self, sine_image):
        phase = sine_image.get_ft_raw_component("phase")
        assert phase.min() >= -np.pi - 1e-6
        assert phase.max() <= np.pi + 1e-6

    def test_ft_is_cached(self, sine_image):
        _ = sine_image.get_ft_raw_component("magnitude")
        ft_ref = sine_image._ft_shifted
        _ = sine_image.get_ft_raw_component("phase")
        assert sine_image._ft_shifted is ft_ref  # same object = cached

    def test_resize_to_exact_shape(self, sine_image):
        resized = sine_image.resize_to(32, 48, keep_aspect=False)
        assert resized.shape == (32, 48)

    def test_b64_output_is_string(self, sine_image):
        b64 = sine_image.spatial_to_b64()
        assert isinstance(b64, str)
        assert len(b64) > 50


class TestMixerService:
    def test_weights_affect_output(self, sine_image, checkerboard):
        reg = ImageRegistry()
        reg.add(sine_image)
        reg.add(checkerboard)
        svc = MixerService(reg)

        r_full_sine = svc.mix(
            [sine_image.image_id, checkerboard.image_id],
            [1.0, 0.0], ["magnitude", "magnitude"],
            "magnitude_phase", unified_size=(64, 64),
        )
        r_full_check = svc.mix(
            [sine_image.image_id, checkerboard.image_id],
            [0.0, 1.0], ["magnitude", "magnitude"],
            "magnitude_phase", unified_size=(64, 64),
        )
        assert r_full_sine != r_full_check

    def test_real_imaginary_mode(self, sine_image, checkerboard):
        reg = ImageRegistry()
        reg.add(sine_image); reg.add(checkerboard)
        svc = MixerService(reg)

        result = svc.mix(
            [sine_image.image_id, checkerboard.image_id],
            [1.0, 1.0], ["real", "imaginary"],
            "real_imaginary", unified_size=(64, 64),
        )
        assert isinstance(result, str) and len(result) > 50


class TestEmphasizerProcessor:
    def test_shift_preserves_shape(self, sine_image):
        emp = EmphasizerProcessor(sine_image.image_id, sine_image.get_spatial_image())
        shifted = emp.apply_shift(10, 10)
        assert shifted.shape == emp.shape

    def test_make_even_is_symmetric(self, sine_image):
        emp = EmphasizerProcessor(sine_image.image_id, sine_image.get_spatial_image())
        even = emp.make_even().get_spatial_image()
        # f_even(x) == f_even(-x): check row symmetry
        np.testing.assert_allclose(even, np.flip(even), atol=1e-8)

    def test_fourier_repeat_all_visible(self, sine_image):
        emp = EmphasizerProcessor(sine_image.image_id, sine_image.get_spatial_image())
        for n in [0, 1, 2, 3, 4]:
            result = emp.apply_fourier_repeat(n).get_spatial_image()
            assert result.max() > result.min() + 10, f"FT×{n} output is flat"

    def test_rotation_expands_canvas(self, sine_image):
        emp = EmphasizerProcessor(sine_image.image_id, sine_image.get_spatial_image())
        rotated = emp.apply_rotation(45)
        # Rotated 45° should have larger canvas
        h, w = rotated.shape
        assert h > 64 or w > 64
