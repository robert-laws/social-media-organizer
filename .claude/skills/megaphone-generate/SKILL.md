---
name: megaphone-generate
trigger: invoked per (seed × platform) during the generate phase
---

## Inputs
- seed: idea text and/or an image path. If an image is supplied, DESCRIBE it first as
  chain-of-thought before writing — analyze before you act.
- platform: one of x | instagram | facebook | linkedin
- voice-profile.md, if present (the voice oracle to match)
- reviewer feedback from the previous attempt, if status == "revising"

## Per-platform intent (tailoring is the whole point)
- x:        one sharp hook, <=280 chars, <=2 hashtags, thread-ready.
- instagram:visual-led caption, emoji-light, 5-15 hashtags in a block, explicit CTA.
            Reference the image if one is supplied.
- facebook: conversational, ~300-500 chars, end on a question to invite comments,
            0-2 hashtags.
- linkedin: insight-first, hook before the ~210-char fold, value in the body, soft CTA,
            <=3 hashtags, NO clickbait or hype verbs.

## Output
Produce 3 distinct variants for the platform. Do NOT self-grade — the reviewer + the
validator decide. Emit the variants as JSON keyed by platform so the reviewer can run
tools/validate.py on them directly, e.g. {"linkedin": "...variant..."}.
