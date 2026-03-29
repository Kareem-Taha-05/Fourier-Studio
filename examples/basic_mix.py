"""
Example: Perform a magnitude/phase mix of two images via the REST API.

Usage:
    # Make sure the backend is running first:
    # uvicorn app.main:app --port 8000

    python examples/basic_mix.py image1.png image2.png output.png
"""
import sys
import base64
import requests
from pathlib import Path

BASE_URL = "http://localhost:8000/api/v1"


def upload(path: str) -> str:
    """Upload an image and return its image_id."""
    with open(path, "rb") as f:
        resp = requests.post(
            f"{BASE_URL}/images/upload",
            files={"file": (Path(path).name, f, "image/png")},
        )
    resp.raise_for_status()
    data = resp.json()
    print(f"  Uploaded {path}: {data['width']}×{data['height']} → {data['image_id'][:8]}...")
    return data["image_id"]


def mix(id1: str, id2: str) -> str:
    """Mix magnitude of image 1 with phase of image 2. Return base64 PNG."""
    resp = requests.post(
        f"{BASE_URL}/mixer/mix",
        json={
            "image_ids":       [id1, id2],
            "weights":         [1.0, 1.0],
            "image_roles":     ["magnitude", "phase"],
            "mix_mode":        "magnitude_phase",
            "resize_policy":   "smallest",
            "fixed_height":    512,
            "fixed_width":     512,
            "keep_aspect":     False,
            "region_fraction": None,
            "region_type":     "inner",
            "simulate_delay":  False,
        },
    )
    resp.raise_for_status()
    return resp.json()["result_b64"]


def save(b64: str, output_path: str) -> None:
    """Decode base64 PNG and save to disk."""
    data = base64.b64decode(b64)
    with open(output_path, "wb") as f:
        f.write(data)


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python basic_mix.py <image1> <image2> <output>")
        sys.exit(1)

    img1_path, img2_path, out_path = sys.argv[1], sys.argv[2], sys.argv[3]

    print("Uploading images...")
    id1 = upload(img1_path)
    id2 = upload(img2_path)

    print("Mixing (MAG of img1 + PHASE of img2)...")
    result_b64 = mix(id1, id2)

    print(f"Saving result to {out_path}...")
    save(result_b64, out_path)

    print("Done ✓")
