#!/usr/bin/env python3
"""Deterministic center-crop to a publish aspect ratio.

Closes the render-vs-publish gap: megaphone-render generates at a model-native
ratio (e.g. 16:9) when the platform wants one the model can't produce (1.91:1).
This tool performs the crop in code and verifies its own output, so the crop is
never eyeballed or forgotten.

Usage:
  python3 tools/crop.py <src.png> <ratio> <dst.png>
  e.g. python3 tools/crop.py drafts/seed-001/facebook.png 1.91:1 drafts/seed-001/facebook.publish.png

PNG only (the render stage saves PNG). Uses Pillow if installed, else macOS
`sips`. Exits non-zero unless the output exists and matches the ratio, so it
gates like the validators do.
"""
import subprocess, sys

TOL = 0.02  # 2% relative tolerance on the output ratio


def dims(path):
    with open(path, "rb") as f:
        d = f.read(64)
    if d[:8] != b"\x89PNG\r\n\x1a\n":
        raise SystemExit(f"not a PNG (only PNG supported): {path}")
    return int.from_bytes(d[16:20], "big"), int.from_bytes(d[20:24], "big")


def target_box(w, h, r):
    # Largest centered box with ratio r that fits inside w x h.
    if w / h > r:
        return round(h * r), h
    return w, round(w / r)


def main():
    if len(sys.argv) != 4:
        raise SystemExit(__doc__)
    src, ratio_s, dst = sys.argv[1:4]
    a, b = ratio_s.split(":")
    r = float(a) / float(b)
    w, h = dims(src)
    nw, nh = target_box(w, h, r)
    try:
        from PIL import Image
        left, top = (w - nw) // 2, (h - nh) // 2
        Image.open(src).crop((left, top, left + nw, top + nh)).save(dst)
        via = "pillow"
    except ImportError:
        if sys.platform != "darwin":
            raise SystemExit("Pillow not installed and sips is macOS-only")
        # sips -c crops centered to <height> <width>
        subprocess.run(["sips", "-c", str(nh), str(nw), src, "--out", dst],
                       check=True, capture_output=True)
        via = "sips"
    ow, oh = dims(dst)
    actual = ow / oh
    if abs(actual - r) / r > TOL:
        raise SystemExit(f"crop verify FAILED: {ow}x{oh} ({actual:.3f}) != {ratio_s} ({r:.3f})")
    print(f'{{"src": "{src}", "dst": "{dst}", "via": "{via}", '
          f'"out": "{ow}x{oh}", "ratio": "{ratio_s}", "verified": true}}')


if __name__ == "__main__":
    main()
