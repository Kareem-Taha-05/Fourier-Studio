"""
Example: Demonstrate frequency region mixing.
Mix the low frequencies of image 1 with the high frequencies of image 2.

Usage:
    python examples/frequency_region_demo.py image1.png image2.png
"""
import sys
import base64
import requests
from pathlib import Path

BASE_URL = "http://localhost:8000/api/v1"


def upload(path):
    with open(path, "rb") as f:
        resp = requests.post(f"{BASE_URL}/images/upload",
                             files={"file": (Path(path).name, f, "image/png")})
    resp.raise_for_status()
    return resp.json()["image_id"]


def mix_region(id1, id2, region_type, fraction, out_name):
    resp = requests.post(f"{BASE_URL}/mixer/mix", json={
        "image_ids":       [id1, id2],
        "weights":         [1.0, 1.0],
        "image_roles":     ["magnitude", "magnitude"],
        "mix_mode":        "magnitude_phase",
        "resize_policy":   "smallest",
        "fixed_height":    512, "fixed_width": 512,
        "keep_aspect":     False,
        "region_fraction": fraction,
        "region_type":     region_type,
        "simulate_delay":  False,
    })
    resp.raise_for_status()
    b64 = resp.json()["result_b64"]
    Path(out_name).write_bytes(base64.b64decode(b64))
    print(f"  Saved: {out_name}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python frequency_region_demo.py <img1> <img2>")
        sys.exit(1)

    id1 = upload(sys.argv[1])
    id2 = upload(sys.argv[2])

    print("Generating region-mixed outputs...")
    mix_region(id1, id2, "inner", 0.3, "low_freq_mix.png")
    mix_region(id1, id2, "outer", 0.3, "high_freq_mix.png")
    mix_region(id1, id2, "inner", 0.6, "mid_freq_mix.png")

    print("\nDone ✓  — Compare the three outputs to see the frequency band effect.")
