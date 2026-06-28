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

## In-image text (conditional — use judgment, never by default)
Text-to-image models garble anything long, so words in the image are a risk, not a freebie.
- DEFAULT to NO text. A clean visual that carries the idea without words is the safe path,
  and the caption already holds the message.
- Add in-image text ONLY when a short, legible label genuinely strengthens the asset — e.g.
  a thumbnail-legible focal phrase on X, or a brand/campaign tag where one fits. Decide per
  post. Do not add text to every brief; restraint is the signal you used judgment.
- Keep it SHORT: one line, ideally <=4 words / <=25 characters. Shorter strings render more
  reliably. Long sentences, fake UI text, and paragraphs are out.
- When you include text, list the EXACT words in `on_image_text` so the render reviewer can
  check spelling and legibility against the actual rendered image.
- Never render fabricated quotes, statistics, real logos, or a real person's name as text.
- In-image text is UNVERIFIED until the render passes megaphone-reviewer IMAGE mode (which
  rejects garbled or misspelled text). Treat any brief with `on_image_text` as render-gated:
  the words are a proposal, not a guarantee, until a render proves they come out clean.

## Output (PERSISTENCE)
Emit a brief as JSON keyed by platform so it pipes straight into tools/validate_media.py:

{"linkedin": {
   "tool": "midjourney",          // the generation tool you'd run this in
   "type": "image",               // image | video | audio
   "format": "1.91:1",            // aspect ratio (image/video); omit for audio
   "duration_sec": null,          // required only for audio
   "prompt": "...",               // the actual generation prompt
   "alt_text": "...",             // accessibility caption (required for image/video)
   "on_image_text": []            // exact words to render IN the image; [] = none (default)
}}

Write the brief to drafts/<seed>/<platform>.media.md. Do NOT self-grade — validate_media.py
and the megaphone-reviewer agent decide. Set the media status in state/content-state.json.
