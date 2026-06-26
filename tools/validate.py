#!/usr/bin/env python3
"""Deterministic platform validator. The 'compiler' for Megaphone.

Reads a drafts JSON on stdin: {"x": "...", "linkedin": "..."} (any subset of platforms).
Prints PASS/FAIL reasons per platform as JSON.
Exit code 0 only if every requested platform passes — this is what /goal checks.

Why this exists: asking the model "is this under 280 chars?" is exactly the kind of
self-judgment that fails. Counts and limits are decided here, in code, never by the LLM.
"""
import json, re, sys

RULES = {
    "x": {
        "max_chars": 280,
        "max_hashtags": 2,
        "needs_hook_first_line": True,
    },
    "instagram": {
        "max_chars": 2200,
        "min_hashtags": 5, "max_hashtags": 15,
        "needs_cta": True,
    },
    "facebook": {
        "max_chars": 500,            # engagement sweet spot, not a hard cap
        "max_hashtags": 2,
        "needs_cta": True,
    },
    "linkedin": {
        "max_chars": 3000,
        "hook_before_chars": 210,    # the "...see more" fold
        "max_hashtags": 3,
        "banned": [r"\bgame[- ]?changer\b", r"\bunlock\b", r"\bdelve\b",
                   r"\bin today's fast[- ]paced\b", r"🚀"],  # anti-slop
    },
}

def count_hashtags(t): return len(re.findall(r"(?<!\w)#\w+", t))

def has_cta(t):
    return bool(re.search(r"(comment|share|follow|link in bio|read more|"
                          r"what do you think|tell me|join|sign up|dm)", t, re.I))

def check(platform, text):
    r, reasons = RULES[platform], []
    n = len(text)
    if "max_chars" in r and n > r["max_chars"]:
        reasons.append(f"length {n} > {r['max_chars']}")
    h = count_hashtags(text)
    if "max_hashtags" in r and h > r["max_hashtags"]:
        reasons.append(f"hashtags {h} > {r['max_hashtags']}")
    if "min_hashtags" in r and h < r["min_hashtags"]:
        reasons.append(f"hashtags {h} < {r['min_hashtags']}")
    if r.get("needs_cta") and not has_cta(text):
        reasons.append("no clear call-to-action")
    if r.get("needs_hook_first_line"):
        first = text.split("\n", 1)[0]
        if len(first) > 120:
            reasons.append("first line too long to be a hook")
    if "hook_before_chars" in r:
        fold = text[: r["hook_before_chars"]]
        if "\n" not in text and len(text) > r["hook_before_chars"] and \
           not re.search(r"[.?!]", fold):
            reasons.append("no hook before the LinkedIn fold (~210 chars)")
    for pat in r.get("banned", []):
        if re.search(pat, text, re.I):
            reasons.append(f"banned/slop phrase: /{pat}/")
    return reasons

def main():
    try:
        drafts = json.load(sys.stdin)
    except json.JSONDecodeError as e:
        print(json.dumps({"_error": f"bad JSON in: {e}"}, indent=2))
        sys.exit(2)
    out, ok = {}, True
    for platform, text in drafts.items():
        if platform not in RULES:
            out[platform] = ["unknown platform"]; ok = False; continue
        reasons = check(platform, text)
        out[platform] = reasons or ["PASS"]
        ok = ok and not reasons
    print(json.dumps(out, indent=2))
    sys.exit(0 if ok else 1)

if __name__ == "__main__":
    main()
