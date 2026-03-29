"""
Example: Apply every FT property transform to an image and save all results.

Usage:
    python examples/apply_transform.py image.png output_dir/
"""
import sys
import base64
import requests
from pathlib import Path

BASE_URL = "http://localhost:8000/api/v1"

ACTIONS = [
    "shift", "multiply_complex_exp", "stretch", "mirror",
    "make_even", "make_odd", "rotate", "differentiate",
    "integrate", "window",
]


def upload(path: str) -> str:
    with open(path, "rb") as f:
        resp = requests.post(
            f"{BASE_URL}/images/upload",
            files={"file": (Path(path).name, f, "image/png")},
        )
    resp.raise_for_status()
    return resp.json()["image_id"]


def apply_action(image_id: str, action: str) -> dict:
    resp = requests.post(
        f"{BASE_URL}/emphasizer/apply",
        json={
            "image_id":         image_id,
            "action":           action,
            "domain":           "spatial",
            "shift_dy":         50, "shift_dx": 50,
            "u0":               0.2, "v0": 0.2,
            "stretch_sy":       1.5, "stretch_sx": 1.5,
            "mirror_axis":      "horizontal",
            "rotation_degrees": 30.0,
            "diff_axis":        "x",
            "integ_axis":       "x",
            "window_type":      "gaussian",
            "window_sigma":     0.3,
            "window_alpha":     0.54,
            "fourier_times":    0,
            "ft_component":     "magnitude",
            "brightness":       1.0,
            "contrast":         1.0,
        },
    )
    resp.raise_for_status()
    return resp.json()


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python apply_transform.py <image.png> <output_dir>")
        sys.exit(1)

    img_path, out_dir = sys.argv[1], sys.argv[2]
    Path(out_dir).mkdir(parents=True, exist_ok=True)

    print(f"Uploading {img_path}...")
    image_id = upload(img_path)

    for action in ACTIONS:
        print(f"  Applying: {action}...")
        result = apply_action(image_id, action)

        # Save transformed spatial image
        spatial_bytes = base64.b64decode(result["panel_bl_b64"])
        out_path = Path(out_dir) / f"{action}_spatial.png"
        out_path.write_bytes(spatial_bytes)

        # Save FT of transformed
        ft_bytes = base64.b64decode(result["panel_br_b64"])
        ft_path = Path(out_dir) / f"{action}_ft.png"
        ft_path.write_bytes(ft_bytes)

    print(f"\nAll results saved to {out_dir}/ ✓")
