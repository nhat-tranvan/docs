#!/usr/bin/env python3
"""Rasterize an SVG to PNG with a configurable canvas color (for theme preview)."""
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
    p.add_argument("--svg", required=True)
    p.add_argument("--out", required=True)
    p.add_argument("--bg", default="#0a0a0a", help="Canvas color (e.g. #0a0a0a, #ffffff)")
    p.add_argument("--text", default="#e5e7eb",
                   help="currentColor cascade root — text/edge color (e.g. #e5e7eb dark mode, #111827 light mode)")
    p.add_argument("--width", type=int, default=2400)
    args = p.parse_args()

    import re
    svg_text = Path(args.svg).read_text()
    # graphviz emits width="Npt"/height="Npt" — resvg-py rejects unitful sizes.
    # Strip pt (1pt = 1.333px close enough for preview rendering) before parsing.
    svg_text = re.sub(r'(width|height)="(\d+(?:\.\d+)?)pt"', r'\1="\2"', svg_text)
    # currentColor in the SVG inherits from the root <svg color="..."> if set,
    # so inject color attr on the <svg> open tag to drive the cascade.
    if 'color=' not in svg_text.split('>', 1)[0]:
        svg_text = svg_text.replace('<svg', f'<svg color="{args.text}"', 1)

    png_bytes = bytes(resvg_py.svg_to_bytes(svg_string=svg_text, width=args.width))
    fg = Image.open(io.BytesIO(png_bytes)).convert("RGBA")
    bg = Image.new("RGBA", fg.size, args.bg)
    bg.alpha_composite(fg)
    bg.convert("RGB").save(args.out, "PNG", optimize=True)
    print(f"OK: {args.out}  ({fg.size[0]}x{fg.size[1]}, bg={args.bg}, fg={args.text})")


if __name__ == "__main__":
    main()
