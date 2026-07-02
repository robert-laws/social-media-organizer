#!/usr/bin/env python3
"""Deterministic media-brief validator — the gate for megaphone-media briefs.

Reads a briefs JSON on stdin, keyed by platform:
  {"linkedin": {"tool":"midjourney","type":"image","format":"1.91:1",
                "prompt":"...","alt_text":"..."}}
Prints PASS/FAIL reasons per platform. Exit 0 only if every brief passes.

Checks FORMAT only — message-match, voice, and safety are the reviewer's job, the same
way validate.py handles counts and leaves judgment to megaphone-reviewer.
"""
import json, sys

ASPECTS = {
    "x":         {"16:9", "1:1", "9:16"},
    "instagram": {"1:1", "4:5", "9:16"},
    "facebook":  {"1.91:1", "1:1", "9:16"},
    "linkedin":  {"1.91:1", "1:1", "9:16"},
}
TYPES = {"image", "video", "audio"}
MAX_PROMPT = 1500
MAX_ALT = 1000
MAX_OIT_ITEMS = 2    # on_image_text: short label(s) only, never paragraphs
MAX_OIT_CHARS = 30   # per entry; short strings render far more reliably

def check(platform, b):
    if platform not in ASPECTS:
        return ["unknown platform"]
    if not isinstance(b, dict):
        return ["brief is not an object"]
    reasons = []
    if not str(b.get("tool", "")).strip():
        reasons.append("no tool named")
    typ = b.get("type", "")
    if typ not in TYPES:
        reasons.append(f"type must be one of {sorted(TYPES)}")
    prompt = str(b.get("prompt", ""))
    if not prompt.strip():
        reasons.append("empty prompt")
    elif len(prompt) > MAX_PROMPT:
        reasons.append(f"prompt {len(prompt)} > {MAX_PROMPT}")
    if typ in {"image", "video"}:
        fmt = b.get("format", "")
        if fmt not in ASPECTS[platform]:
            reasons.append(f"format '{fmt}' not valid for {platform} "
                           f"(allowed: {sorted(ASPECTS[platform])})")
        alt = str(b.get("alt_text", ""))
        if not alt.strip():
            reasons.append("missing alt_text (accessibility)")
        elif len(alt) > MAX_ALT:
            reasons.append(f"alt_text {len(alt)} > {MAX_ALT}")
        oit = b.get("on_image_text", [])
        if oit:
            if not isinstance(oit, list) or \
               not all(isinstance(s, str) for s in oit):
                reasons.append("on_image_text must be a list of strings")
            else:
                if len(oit) > MAX_OIT_ITEMS:
                    reasons.append(f"on_image_text {len(oit)} entries > {MAX_OIT_ITEMS}")
                for s in oit:
                    if len(s) > MAX_OIT_CHARS:
                        reasons.append(f"on_image_text entry {len(s)} chars > {MAX_OIT_CHARS}: {s[:34]!r}")
                    elif s.strip() and s.lower() not in prompt.lower():
                        reasons.append(f"on_image_text {s!r} not present in prompt "
                                       "(the words to render must appear verbatim)")
    if typ == "audio" and not b.get("duration_sec"):
        reasons.append("audio brief needs duration_sec")
    return reasons

def main():
    try:
        briefs = json.load(sys.stdin)
    except json.JSONDecodeError as e:
        print(json.dumps({"_error": f"bad JSON: {e}"}, indent=2)); sys.exit(2)
    out, ok = {}, True
    for platform, b in briefs.items():
        reasons = check(platform, b)
        out[platform] = reasons or ["PASS"]
        ok = ok and not reasons
    print(json.dumps(out, indent=2))
    sys.exit(0 if ok else 1)

if __name__ == "__main__":
    main()
