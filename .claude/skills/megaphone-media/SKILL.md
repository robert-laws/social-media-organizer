---
name: megaphone-media
trigger: invoked per platform AFTER the post text has PASSED review
---

## The rule that keeps this clean
Derive the visual from the FINAL approved post text — never a draft, never in parallel with
text generation. If the text was rejected and rewritten, the brief follows the rewrite.
And: output a BRIEF only. Do NOT generate the image/video/audio. The loop describes; a human
(or a separately-budgeted step) generates outside the loop.

## Inputs
- the APPROVED post text for this platform (from drafts/<seed>/<platform>.md)
- platform
- voice-profile.md, if present — match the brand's visual tone, not generic stock style

## Per-platform format intent
- x:         16:9 still or short clip; one bold focal idea, legible at thumbnail size
- instagram: 1:1 or 4:5 portrait; the heaviest visual investment; carousel-capable
- facebook:  1.91:1 or 1:1; warmer, more human / scene-based
- linkedin:  1.91:1 or 1:1; clean and professional; favor text-overlay or diagram over
             stock-glossy imagery

## Output (PERSISTENCE)
Emit a brief as JSON keyed by platform so it pipes straight into tools/validate_media.py:

{"linkedin": {
   "tool": "midjourney",          // the generation tool you'd run this in
   "type": "image",               // image | video | audio
   "format": "1.91:1",            // aspect ratio (image/video); omit for audio
   "duration_sec": null,          // required only for audio
   "prompt": "...",               // the actual generation prompt
   "alt_text": "..."              // accessibility caption (required for image/video)
}}

Write the brief to drafts/<seed>/<platform>.media.md. Do NOT self-grade — validate_media.py
and the megaphone-reviewer agent decide. Set the media status in state/content-state.json.
