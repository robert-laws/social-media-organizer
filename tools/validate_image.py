#!/usr/bin/env python3
"""Deterministic image guard — the validate.py of the render stage.

Reads a JSON on stdin keyed by platform:
  {"linkedin": {"path": "drafts/seed-001/linkedin.a.png", "ratio": "16:9"}}
Checks: file exists, is non-zero, dimensions are readable, and the actual
width:height matches the requested ratio within tolerance.
Prints PASS/FAIL per entry. Exit 0 only if every entry passes.

No third-party deps — reads PNG and JPEG dimensions from headers directly,
so it runs anywhere (including a fresh clone) without `pip install`.
"""
import json, os, sys

TOL = 0.06  # 6% relative tolerance on the aspect ratio

def png_size(d):
    if d[:8] != b"\x89PNG\r\n\x1a\n":
        return None
    return int.from_bytes(d[16:20], "big"), int.from_bytes(d[20:24], "big")

def jpeg_size(d):
    if d[:2] != b"\xff\xd8":
        return None
    i, n = 2, len(d)
    SOF = {0xC0,0xC1,0xC2,0xC3,0xC5,0xC6,0xC7,0xC9,0xCA,0xCB,0xCD,0xCE,0xCF}
    while i < n - 9:
        if d[i] != 0xFF:
            i += 1; continue
        m = d[i+1]
        if m in SOF:
            return int.from_bytes(d[i+7:i+9], "big"), int.from_bytes(d[i+5:i+7], "big")
        if m in (0xD8, 0xD9) or 0xD0 <= m <= 0xD7:
            i += 2
        else:
            i += 2 + int.from_bytes(d[i+2:i+4], "big")
    return None

def dims(path):
    with open(path, "rb") as f:
        head = f.read(2 * 1024 * 1024)  # enough for the header
    return png_size(head) or jpeg_size(head)

def ratio_value(s):
    a, b = s.split(":")
    return float(a) / float(b)

def check(entry):
    reasons = []
    path = entry.get("path", "")
    if not path or not os.path.exists(path):
        return [f"file not found: {path!r}"]
    if os.path.getsize(path) == 0:
        return ["file is empty (generation likely failed silently)"]
    wh = None
    try:
        wh = dims(path)
    except Exception as e:
        return [f"could not read image: {e}"]
    if not wh:
        return ["could not read dimensions (only PNG/JPEG supported here)"]
    w, h = wh
    if h == 0:
        return ["zero height"]
    want = entry.get("ratio", "")
    if not want:
        reasons.append("no expected ratio given")
    else:
        target, actual = ratio_value(want), w / h
        if abs(actual - target) / target > TOL:
            reasons.append(f"ratio {w}x{h} ({actual:.3f}) != {want} ({target:.3f})")
    return reasons

def main():
    try:
        items = json.load(sys.stdin)
    except json.JSONDecodeError as e:
        print(json.dumps({"_error": f"bad JSON: {e}"}, indent=2)); sys.exit(2)
    out, ok = {}, True
    for platform, entry in items.items():
        reasons = check(entry)
        out[platform] = reasons or ["PASS"]
        ok = ok and not reasons
    print(json.dumps(out, indent=2))
    sys.exit(0 if ok else 1)

if __name__ == "__main__":
    main()
