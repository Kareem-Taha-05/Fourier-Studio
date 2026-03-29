"""
Shared pytest fixtures for FREQWAVE backend tests.
"""
import io
import sys
import os

import numpy as np
import pytest
from fastapi.testclient import TestClient
from PIL import Image

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.main import app
from app.services.image_service import image_registry


@pytest.fixture
def client():
    """FastAPI test client."""
    with TestClient(app) as c:
        yield c


@pytest.fixture
def sample_png_bytes():
    """64×64 grayscale PNG with distinct content (sine-wave pattern)."""
    arr = np.zeros((64, 64), dtype=np.uint8)
    for i in range(64):
        arr[i, :] = int(128 + 100 * np.sin(i / 5.0))
    buf = io.BytesIO()
    Image.fromarray(arr).save(buf, format="PNG")
    return buf.getvalue()


@pytest.fixture
def checkerboard_png_bytes():
    """64×64 checkerboard pattern — high-frequency content."""
    arr = np.zeros((64, 64), dtype=np.uint8)
    arr[::2, ::2] = 255
    arr[1::2, 1::2] = 255
    buf = io.BytesIO()
    Image.fromarray(arr).save(buf, format="PNG")
    return buf.getvalue()


@pytest.fixture
def uploaded_image_id(client, sample_png_bytes):
    """Upload a sample image and return its image_id."""
    resp = client.post(
        "/api/v1/images/upload",
        files={"file": ("test.png", sample_png_bytes, "image/png")},
    )
    assert resp.status_code == 200
    return resp.json()["image_id"]


@pytest.fixture(autouse=True)
def clear_registry():
    """Wipe the image registry before each test to prevent state leakage."""
    image_registry._images.clear()
    yield
    image_registry._images.clear()
