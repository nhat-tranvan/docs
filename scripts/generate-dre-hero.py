#!/usr/bin/env python3
"""Generate the DRE blog hero/thumbnail via Gemini Nano Banana Pro.

Usage:
  uv run scripts/generate-dre-hero.py --out images/blog-thumbnails/introducing-dre-hero.png
  uv run scripts/generate-dre-hero.py --out <path> --model flash   # faster, lower quality
  uv run scripts/generate-dre-hero.py --out <path> --seed 7        # reproducible
"""
# /// script
# requires-python = ">=3.10"
# dependencies = ["google-genai>=1.14.0", "python-dotenv>=1.0.0"]
# ///

import argparse
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types

REPO_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(REPO_ROOT / ".env")

MODELS = {
    "flash": "gemini-3.1-flash-image-preview",
    "pro": "gemini-3-pro-image-preview",
}

PROMPT = """A Dark Technical Blueprint / Schematic illustration for a SaaS landing page blog hero. 16:9 aspect ratio.

CRITICAL STYLE RULES (ALWAYS DARK MODE):
- BACKGROUND: pure deep black (#050505). NEVER white or light. NO gradients.
- FLAT VECTOR ONLY: no 3D, no glows, no neon, no shading.
- COLOR PALETTE: dark gray (#3A3A50) for dashed structural lines and small captions. THREE accent colors used sparingly — Cyan/Blue (#5BA9FF) for the Pulse pillar, Amber/Gold (#D4A843) for the Incident pillar, Green (#4CAF7A) for the Memory loop. White (#F5F5F5) for the main headline only.
- SHAPE CONSTRUCTION:
  * Pillar cards: large rounded rectangles drawn with a solid 1.5px accent stroke, filled with a very dark tint of the same accent (~6% opacity over black). Surrounded by an OFFSET DASHED gray outline path with small accent dots at the corners.
  * Connection arrow: a single dashed gray horizontal line with a small filled arrowhead in gray.
  * Memory loop: a curved DASHED green arc passing under both pillars, returning from Incident back to Pulse, with a green arrowhead at the Pulse end.

SCENE COMPOSITION (STRICT — DO NOT ADD ANYTHING ELSE):

TOP LEFT: leave this corner completely empty — a logo will be placed there in post. Reserve approximately the top-left 16% width × 10% height as fully empty negative space (pure deep black, no marks, no labels, no shapes).

LEFT (vertically centered, 40% of canvas height): bold sans-serif headline.
  Line 1: "Introducing." (in white)
  Line 2: "Deep Response Engine." (in cyan #5BA9FF)
  One subtitle line below in muted gray monospace: "from signal to resolution — one loop, no handoff."

CENTER-RIGHT: TWO LARGE PILLAR CARDS, side by side, with generous spacing between them.

  PILLAR 1 (LEFT, CYAN #5BA9FF):
    - Top: small pill labeled "PULSE" in cyan, with "PILLAR · 01" in muted gray beside it
    - Title in white sans-serif: "Signal Intelligence"
    - One centered icon: a CLEAN MINIMAL FUNNEL — three horizontal cyan lines forming an inverted trapezoid, plus three small dots above the wide top representing input events. NO text inside the icon.
    - One small cyan monospace label below the icon: "13K → 40"
    - One tiny gray monospace caption at the bottom: "10+ sources · 7 suppression layers"

  PILLAR 2 (RIGHT, AMBER #D4A843):
    - Top: small pill labeled "INCIDENT" in amber, with "PILLAR · 02" in muted gray beside it
    - Title in white sans-serif: "AI Investigation"
    - One centered icon: a CLEAN MINIMAL HYPOTHESIS TREE — one short horizontal amber line splitting into three short branches; the rightmost branch ends in a small circle containing a tiny checkmark, the other two end in plain dots. NO text labels on the branches.
    - One small amber monospace label below the icon: "RCA · REMEDIATE"
    - One tiny gray monospace caption at the bottom: "parallel hypothesis testing"

  ARROW BETWEEN PILLARS: a thin dashed gray horizontal line with a small arrowhead pointing right, vertically centered between the pillars. A short label "ESCALATE" sits ABOVE the arrow line (not on it). The label and arrow MUST be in clear empty space — they MUST NOT overlap any text inside either pillar.

BOTTOM CENTER (UNDER BOTH PILLARS): a wide DASHED GREEN ARC starting from the bottom-right of Pillar 2, curving down and back up to the bottom-left of Pillar 1, with a green arrowhead at the Pillar 1 end. A single small green pill labeled "MEMORY · LOOP" sits centered on the arc.

BOTTOM EDGE: one thin dashed gray separator line spanning the canvas, and below it a single ROW of FOUR stat tokens, evenly spaced. Each token: a large number in its accent color on top, with a tiny uppercase gray monospace caption below.
  1. "13K → 40"     (cyan)    /    "EVENTS · CLUSTERS"
  2. "10+"          (amber)   /    "SOURCES UNIFIED"
  3. "<10min"       (purple #9B7DFF)  /    "RESOLUTION TIME"
  4. "0"            (green)   /    "RULES TO TUNE"

CRITICAL RULES TO PREVENT OVERLAP (THESE ARE MANDATORY):
- Every text element MUST have generous empty margin around it. NO label overlaps any arrow, line, or other text.
- The "ESCALATE" arrow does NOT cross or overlap any pillar body or pillar text.
- The "RCA · REMEDIATE" label sits cleanly inside Pillar 2 with full whitespace above and below. The bottom caption "parallel hypothesis testing" is BELOW it with another full empty line between them.
- Never duplicate any text. Never render any stat or label twice.
- The two pillars are exactly the same size and exactly the same vertical position.
- Aspect ratio is 16:9 wide. Composition is balanced left-to-right.

Overall feel: a NORAD terminal blueprint — sparse, architectural, engineering-schematic. Extremely minimal. Like a developer's whiteboard photo at midnight."""


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", required=True, help="Output path (relative to repo root or absolute)")
    parser.add_argument("--model", choices=["flash", "pro"], default="pro",
                        help="flash=Nano Banana 2 (fast), pro=Nano Banana Pro (quality, default)")
    parser.add_argument("--aspect", default="16:9", help="Aspect ratio (default 16:9)")
    parser.add_argument("--size", default="2K", choices=["1K", "2K", "4K"], help="Image size")
    args = parser.parse_args()

    api_key = os.environ.get("GEMINI_KEY") or os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_KEY not found in .env or environment", file=sys.stderr)
        sys.exit(1)

    out_path = Path(args.out)
    if not out_path.is_absolute():
        out_path = REPO_ROOT / out_path
    out_path.parent.mkdir(parents=True, exist_ok=True)

    model_id = MODELS[args.model]
    print(f"Generating with {args.model.upper()} ({model_id}) — aspect {args.aspect}, size {args.size}", file=sys.stderr)

    client = genai.Client(api_key=api_key)

    config_kwargs = {
        "response_modalities": ["TEXT", "IMAGE"],
        "image_config": types.ImageConfig(aspect_ratio=args.aspect, image_size=args.size),
    }

    response = client.models.generate_content(
        model=model_id,
        contents=PROMPT,
        config=types.GenerateContentConfig(**config_kwargs),
    )

    for part in response.candidates[0].content.parts:
        if part.inline_data is not None:
            out_path.write_bytes(part.inline_data.data)
            kb = len(part.inline_data.data) / 1024
            print(f"OK: saved {out_path} ({kb:.0f}KB)", file=sys.stderr)
            print(f"MEDIA: {out_path}")
            return

    for part in response.candidates[0].content.parts:
        if part.text:
            print(part.text, file=sys.stderr)
    print("Error: no image returned", file=sys.stderr)
    sys.exit(1)


if __name__ == "__main__":
    main()
