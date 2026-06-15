#!/usr/bin/env python3
"""Composite an SVG logo onto a PNG (top-left)."""
# /// script
# requires-python = ">=3.10"
# dependencies = ["resvg-py>=0.1.5", "Pillow>=10.0.0"]
# ///

import argparse
import io
from pathlib import Path

import resvg_py
from PIL import Image


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--image", required=True)
    p.add_argument("--logo", required=True)
    p.add_argument("--out", required=True)
    p.add_argument("--width-pct", type=float, default=14.0,
                   help="Logo width as % of canvas width (default 14)")
    p.add_argument("--margin-pct", type=float, default=4.0,
                   help="Top-left margin as % of canvas width (default 4)")
    args = p.parse_args()

    base = Image.open(args.image).convert("RGBA")
    W, H = base.size

    logo_w = int(W * args.width_pct / 100)
    margin = int(W * args.margin_pct / 100)

    svg_text = Path(args.logo).read_text()
    logo_png_bytes = bytes(resvg_py.svg_to_bytes(svg_string=svg_text, width=logo_w))
    logo = Image.open(io.BytesIO(logo_png_bytes)).convert("RGBA")

    base.alpha_composite(logo, dest=(margin, margin))
    base.convert("RGB").save(args.out, "PNG", optimize=True)
    print(f"OK: {args.out}  (canvas {W}x{H}, logo {logo.size[0]}x{logo.size[1]} at +{margin},+{margin})")


if __name__ == "__main__":
    main()
