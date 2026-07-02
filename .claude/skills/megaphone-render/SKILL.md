---
name: megaphone-render
trigger: ATTENDED morning pass only — NEVER in an unattended Routine
---

## Why this is attended-only
This skill calls the Higgsfield MCP, which needs interactive OAuth and spends credits per
generation. Both reasons keep it out of the cloud Routine. The overnight Routine stops at
validated briefs; this skill turns those briefs into images while you're at the keyboard.

## Preconditions (check before generating)
- The Higgsfield MCP connector is connected in this session.
- The post text AND its media brief have already PASSED review.
- state/budget.md has a credit ceiling. Check the Higgsfield credit balance first; if a
  batch would exceed the ceiling, STOP and tell me — do not generate.

## Per platform, from the approved brief (drafts/<seed>/<platform>.media.md)
1. Read the brief: tool, type, format, prompt, alt_text.
2. Map the publish aspect to a Higgsfield-native ratio and record BOTH:
   - 1.91:1  -> generate at 16:9  (crop to 1.91:1 after)
   - 1:1, 4:5, 9:16, 16:9, 3:4 -> pass through unchanged
   Store publish_ratio and gen_ratio.
3. Call the Higgsfield generate_image tool TWICE (best-of-2) with the brief's prompt and
   gen_ratio. When the post implies text ON the image, prefer a text-capable model
   (Nano Banana Pro or GPT Image 2).
4. Generation is async: poll the status tool until each job is completed. On a `failed` or
   `nsfw` status, replace that one candidate ONCE with a softer prompt. Never exceed
   image_max_generations in state/budget.md, and never exceed the credit ceiling.
5. Download both results next to the post: drafts/<seed>/<platform>.a.<ext> and .b.<ext>.

## Verification — hand off to the gate and the judge (do NOT self-approve)
6. Invoke the megaphone-reviewer agent in IMAGE mode on both candidates. It runs
   tools/validate_image.py (existence, non-zero, ratio) and then OPENS each image to judge
   message match, garbled/incorrect on-image text, on-brand styling, and safety.
7. Keep the reviewer's winning PASS. Save it as drafts/<seed>/<platform>.png. If
   publish_ratio differs from gen_ratio, crop deterministically — never by hand:
     python3 tools/crop.py drafts/<seed>/<platform>.png <publish_ratio> \
             drafts/<seed>/<platform>.publish.png
   (center crop; the tool verifies its own output ratio and fails loudly).
   Then VIEW the crop to confirm the composition survived the trim.
8. Persist the handoff:
   - state/content-state.json: media.render = { status: ready_for_review, file,
     publish_ratio, publish_file } — publish_file is the cropped file when one exists,
     else the render itself.
   - drafts/<seed>/PUBLISH.md: add/refresh this platform's section — final post text,
     the publish image file, the alt_text from the brief, and platform-specific posting
     notes. This manifest is what the human ships from; alt text must not stay buried
     in the brief.

## Stop conditions (the credit-blowout guards)
- If NEITHER candidate passes within the cap, move the brief to inbox/ for hand work.
  Do not keep generating.
- Never publish. The winner sits as ready_for_review; you attach and post it yourself.
