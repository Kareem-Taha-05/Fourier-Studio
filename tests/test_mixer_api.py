"""
Tests for /api/v1/mixer/mix endpoint.
"""
import pytest


def upload(client, png_bytes):
    resp = client.post(
        "/api/v1/images/upload",
        files={"file": ("img.png", png_bytes, "image/png")},
    )
    return resp.json()["image_id"]


class TestMix:
    def test_basic_mix_returns_b64(self, client, sample_png_bytes, checkerboard_png_bytes):
        id1 = upload(client, sample_png_bytes)
        id2 = upload(client, checkerboard_png_bytes)

        resp = client.post("/api/v1/mixer/mix", json={
            "image_ids":   [id1, id2],
            "weights":     [1.0, 1.0],
            "image_roles": ["magnitude", "phase"],
            "mix_mode":    "magnitude_phase",
            "resize_policy": "smallest",
            "fixed_height": 512, "fixed_width": 512,
            "keep_aspect": False,
            "region_fraction": None,
            "region_type": "inner",
            "simulate_delay": False,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "result_b64" in data
        assert len(data["result_b64"]) > 100

    def test_mix_single_image(self, client, sample_png_bytes):
        id1 = upload(client, sample_png_bytes)
        resp = client.post("/api/v1/mixer/mix", json={
            "image_ids":   [id1],
            "weights":     [1.0],
            "image_roles": ["magnitude"],
            "mix_mode":    "magnitude_phase",
            "resize_policy": "fixed",
            "fixed_height": 64, "fixed_width": 64,
            "keep_aspect": False,
            "region_fraction": None,
            "region_type": "inner",
            "simulate_delay": False,
        })
        assert resp.status_code == 200

    def test_weights_affect_output(self, client, sample_png_bytes, checkerboard_png_bytes):
        """Changing weights should produce different outputs."""
        id1 = upload(client, sample_png_bytes)
        id2 = upload(client, checkerboard_png_bytes)

        base = {
            "image_ids":   [id1, id2],
            "image_roles": ["magnitude", "magnitude"],
            "mix_mode":    "magnitude_phase",
            "resize_policy": "smallest",
            "fixed_height": 64, "fixed_width": 64,
            "keep_aspect": False,
            "region_fraction": None,
            "region_type": "inner",
            "simulate_delay": False,
        }

        r1 = client.post("/api/v1/mixer/mix", json={**base, "weights": [1.0, 0.0]})
        r2 = client.post("/api/v1/mixer/mix", json={**base, "weights": [0.0, 1.0]})

        assert r1.status_code == 200
        assert r2.status_code == 200
        assert r1.json()["result_b64"] != r2.json()["result_b64"]

    def test_real_imaginary_mode(self, client, sample_png_bytes, checkerboard_png_bytes):
        id1 = upload(client, sample_png_bytes)
        id2 = upload(client, checkerboard_png_bytes)

        resp = client.post("/api/v1/mixer/mix", json={
            "image_ids":   [id1, id2],
            "weights":     [1.0, 1.0],
            "image_roles": ["real", "imaginary"],
            "mix_mode":    "real_imaginary",
            "resize_policy": "smallest",
            "fixed_height": 64, "fixed_width": 64,
            "keep_aspect": False,
            "region_fraction": None,
            "region_type": "inner",
            "simulate_delay": False,
        })
        assert resp.status_code == 200

    def test_region_inner(self, client, sample_png_bytes, checkerboard_png_bytes):
        id1 = upload(client, sample_png_bytes)
        id2 = upload(client, checkerboard_png_bytes)

        resp = client.post("/api/v1/mixer/mix", json={
            "image_ids":   [id1, id2],
            "weights":     [1.0, 1.0],
            "image_roles": ["magnitude", "phase"],
            "mix_mode":    "magnitude_phase",
            "resize_policy": "smallest",
            "fixed_height": 64, "fixed_width": 64,
            "keep_aspect": False,
            "region_fraction": 0.5,
            "region_type": "inner",
            "simulate_delay": False,
        })
        assert resp.status_code == 200

    def test_mismatched_lengths_returns_422(self, client, sample_png_bytes):
        id1 = upload(client, sample_png_bytes)
        resp = client.post("/api/v1/mixer/mix", json={
            "image_ids":   [id1],
            "weights":     [1.0, 0.5],   # length mismatch
            "image_roles": ["magnitude"],
            "mix_mode":    "magnitude_phase",
            "resize_policy": "smallest",
            "fixed_height": 64, "fixed_width": 64,
            "keep_aspect": False,
            "region_fraction": None,
            "region_type": "inner",
            "simulate_delay": False,
        })
        assert resp.status_code == 422

    def test_unknown_image_returns_404(self, client):
        resp = client.post("/api/v1/mixer/mix", json={
            "image_ids":   ["00000000-0000-0000-0000-000000000000"],
            "weights":     [1.0],
            "image_roles": ["magnitude"],
            "mix_mode":    "magnitude_phase",
            "resize_policy": "smallest",
            "fixed_height": 64, "fixed_width": 64,
            "keep_aspect": False,
            "region_fraction": None,
            "region_type": "inner",
            "simulate_delay": False,
        })
        assert resp.status_code == 404
