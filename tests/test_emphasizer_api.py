"""
Tests for /api/v1/emphasizer/apply endpoint.
"""
import pytest


def upload(client, png_bytes):
    resp = client.post(
        "/api/v1/images/upload",
        files={"file": ("img.png", png_bytes, "image/png")},
    )
    return resp.json()["image_id"]


BASE_PARAMS = {
    "domain": "spatial",
    "shift_dy": 10, "shift_dx": 10,
    "u0": 0.1, "v0": 0.1,
    "stretch_sy": 1.5, "stretch_sx": 1.5,
    "mirror_axis": "horizontal",
    "rotation_degrees": 45.0,
    "diff_axis": "x",
    "integ_axis": "x",
    "window_type": "gaussian",
    "window_sigma": 0.3,
    "window_alpha": 0.54,
    "fourier_times": 0,
    "ft_component": "magnitude",
    "brightness": 1.0,
    "contrast": 1.0,
}

ALL_ACTIONS = [
    "shift", "multiply_complex_exp", "stretch", "mirror",
    "make_even", "make_odd", "rotate", "differentiate",
    "integrate", "window",
]


class TestEmphasizer:
    @pytest.mark.parametrize("action", ALL_ACTIONS)
    def test_all_actions_return_four_panels(self, client, sample_png_bytes, action):
        image_id = upload(client, sample_png_bytes)
        resp = client.post("/api/v1/emphasizer/apply", json={
            "image_id": image_id,
            "action": action,
            **BASE_PARAMS,
        })
        assert resp.status_code == 200
        data = resp.json()
        for key in ["panel_tl_b64", "panel_tr_b64", "panel_bl_b64", "panel_br_b64"]:
            assert key in data
            assert len(data[key]) > 100

    @pytest.mark.parametrize("action", ALL_ACTIONS)
    def test_frequency_domain_mode(self, client, sample_png_bytes, action):
        image_id = upload(client, sample_png_bytes)
        resp = client.post("/api/v1/emphasizer/apply", json={
            "image_id": image_id,
            "action": action,
            **{**BASE_PARAMS, "domain": "frequency"},
        })
        assert resp.status_code == 200

    def test_fourier_repeat_produces_output(self, client, sample_png_bytes):
        image_id = upload(client, sample_png_bytes)
        for n in [0, 1, 2, 4]:
            resp = client.post("/api/v1/emphasizer/apply", json={
                "image_id": image_id,
                "action": "shift",
                **{**BASE_PARAMS, "fourier_times": n},
            })
            assert resp.status_code == 200

    @pytest.mark.parametrize("component", ["magnitude", "phase", "real", "imaginary"])
    def test_all_ft_display_components(self, client, sample_png_bytes, component):
        image_id = upload(client, sample_png_bytes)
        resp = client.post("/api/v1/emphasizer/apply", json={
            "image_id": image_id,
            "action": "shift",
            **{**BASE_PARAMS, "ft_component": component},
        })
        assert resp.status_code == 200

    def test_unknown_image_returns_404(self, client):
        resp = client.post("/api/v1/emphasizer/apply", json={
            "image_id": "00000000-0000-0000-0000-000000000000",
            "action": "shift",
            **BASE_PARAMS,
        })
        assert resp.status_code == 404

    def test_response_labels_match_domain(self, client, sample_png_bytes):
        image_id = upload(client, sample_png_bytes)

        spatial = client.post("/api/v1/emphasizer/apply", json={
            "image_id": image_id, "action": "shift",
            **{**BASE_PARAMS, "domain": "spatial"},
        }).json()
        assert "Spatial" in spatial["panel_tl_label"]
        assert spatial["domain"] == "spatial"

        freq = client.post("/api/v1/emphasizer/apply", json={
            "image_id": image_id, "action": "shift",
            **{**BASE_PARAMS, "domain": "frequency"},
        }).json()
        assert "FT" in freq["panel_tl_label"]
        assert freq["domain"] == "frequency"
