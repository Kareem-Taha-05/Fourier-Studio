"""
Tests for /api/v1/images/* endpoints.
"""
import pytest


class TestUpload:
    def test_upload_returns_image_id(self, client, sample_png_bytes):
        resp = client.post(
            "/api/v1/images/upload",
            files={"file": ("img.png", sample_png_bytes, "image/png")},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "image_id" in data
        assert "spatial_b64" in data
        assert data["width"] == 64
        assert data["height"] == 64

    def test_upload_unsupported_format(self, client):
        resp = client.post(
            "/api/v1/images/upload",
            files={"file": ("doc.pdf", b"%PDF", "application/pdf")},
        )
        assert resp.status_code == 415

    def test_upload_multiple_images_get_unique_ids(self, client, sample_png_bytes):
        ids = set()
        for _ in range(3):
            resp = client.post(
                "/api/v1/images/upload",
                files={"file": ("img.png", sample_png_bytes, "image/png")},
            )
            ids.add(resp.json()["image_id"])
        assert len(ids) == 3


class TestFTComponent:
    @pytest.mark.parametrize("component", ["magnitude", "phase", "real", "imaginary"])
    def test_all_components_return_b64(self, client, uploaded_image_id, component):
        resp = client.post(
            "/api/v1/images/ft-component",
            json={"image_id": uploaded_image_id, "component": component},
        )
        assert resp.status_code == 200
        assert len(resp.json()["data_b64"]) > 0

    def test_unknown_image_returns_404(self, client):
        resp = client.post(
            "/api/v1/images/ft-component",
            json={"image_id": "00000000-0000-0000-0000-000000000000", "component": "magnitude"},
        )
        assert resp.status_code == 404

    def test_brightness_contrast_accepted(self, client, uploaded_image_id):
        resp = client.post(
            "/api/v1/images/ft-component",
            json={"image_id": uploaded_image_id, "component": "magnitude",
                  "brightness": 2.0, "contrast": 0.5},
        )
        assert resp.status_code == 200


class TestResize:
    def test_resize_smallest(self, client, sample_png_bytes, checkerboard_png_bytes):
        ids = []
        for png in [sample_png_bytes, checkerboard_png_bytes]:
            resp = client.post(
                "/api/v1/images/upload",
                files={"file": ("img.png", png, "image/png")},
            )
            ids.append(resp.json()["image_id"])

        resp = client.post(
            "/api/v1/images/resize",
            json={"image_ids": ids, "policy": "smallest",
                  "fixed_height": 512, "fixed_width": 512, "keep_aspect": False},
        )
        assert resp.status_code == 200
        assert "unified_shape" in resp.json()
        assert "results" in resp.json()


class TestDelete:
    def test_delete_existing_image(self, client, uploaded_image_id):
        resp = client.delete(f"/api/v1/images/{uploaded_image_id}")
        assert resp.status_code == 200
        assert resp.json()["deleted"] == uploaded_image_id

    def test_delete_nonexistent_returns_404(self, client):
        resp = client.delete("/api/v1/images/00000000-0000-0000-0000-000000000000")
        assert resp.status_code == 404
