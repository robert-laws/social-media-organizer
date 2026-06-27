# kickoff.md — Megaphone run sequence

Copy-paste prompts to take Megaphone from scaffold → running loop, text + media + images.
Run them in order, in a Claude Code session whose working folder is this repo.
Phase A (scaffold, deploy boundary, CLAUDE.md `## The Site`) is already done.

The split to keep in mind: the OVERNIGHT Routine is text + briefs only (cheap, no credits,
no OAuth). The MORNING pass is attended and does the image generation (Higgsfield MCP).

---

## Step 6 — Prove one platform (no evaluator yet)

```
Using the megaphone-generate skill, generate one LinkedIn draft for seed-001.
Print it. Do not grade it yourself.
```

---

## Step 7 — Turn on the evaluator with /goal (the critical step)

Bad-draft test first — prove it can REJECT:

```
Run the megaphone-reviewer agent on this draft for X:
{"x": "<paste ~400 characters so it's over the 280 limit>"}
First run tools/validate.py and paste the JSON. Then give your verdict.
```

Then the real stop condition:

```
/goal tools/validate.py exits 0 for linkedin AND megaphone-reviewer returns PASS.
After each turn, run validate.py and paste its JSON so the check can verify.
```

---

## Step 7.5 — Install brand voice (before fanning out)

Add voice-profile.md to the session, then:

```
Save voice-profile.md to the repo root and commit it. Confirm megaphone-reviewer and
megaphone-generate read it from there.
```
If the reviewer ever judges voice without saying it READ the profile, it skipped the read.

---

## Step 8 — Fan out the post text (one platform at a time)

```
Using megaphone-generate, produce 3 variants of a <PLATFORM> post for seed-001.
Run megaphone-reviewer on each (validate.py + reads voice-profile.md). Keep the best PASS.
Write it to drafts/seed-001/<PLATFORM>.md (ready_for_review). Update state. Do not publish.
```
Platforms remaining: x · instagram · facebook   (linkedin done)

---

## Step 8.5 — Media brief per platform (AFTER the text passes)

```
Using megaphone-media, write a media brief for the approved <PLATFORM> post.
Run megaphone-reviewer on the brief (validate_media.py + message/voice/safety).
Keep it if it PASSES. Write drafts/seed-001/<PLATFORM>.media.md, update state.
Do NOT generate the image — brief only.
```

---

## Step 9 — Overnight sweep as a Routine (cloud; text + briefs ONLY)

Commit first (Routines run from a fresh clone):

```
git add -A && git commit -m "megaphone: <what changed>"
```

Daily Routine (sidebar → Routines):

```
Run megaphone-triage on ideas/queue.md. For each todo seed × platform:
1) megaphone-generate (3 variants) → megaphone-reviewer (validate.py, reads voice-profile.md)
   → best PASS → drafts/<seed>/<platform>.md (ready_for_review).
2) THEN megaphone-media on the approved text → megaphone-reviewer (validate_media.py)
   → keep if PASS → drafts/<seed>/<platform>.media.md.
Anything that can't PASS within state/budget.md caps goes to inbox/. Update state.
Open a PR with the results. Do NOT generate images, merge, or publish.
```

✅ Each morning: a PR on a `claude/` branch with approved posts + validated briefs.

---

## Step 10 — Morning render pass (ATTENDED; Higgsfield MCP)

Connect the Higgsfield MCP connector in the session first. Then, per platform that has a
PASSED brief:

```
Using megaphone-render, generate images for the approved <PLATFORM> post for seed-001.
Check the Higgsfield credit balance against state/budget.md first. Generate best-of-2 at
the brief's aspect (mapping 1.91:1 -> 16:9). Hand both candidates to megaphone-reviewer in
IMAGE mode (it runs validate_image.py and opens each image). Save the winner as
drafts/seed-001/<PLATFORM>.png and update state. If neither passes, move the brief to inbox/.
Do NOT publish.
```

✅ A reviewed image sits beside each post. You attach and publish manually — the gate is you.

---

## State schema (per platform)

```json
"linkedin": {
  "status": "ready_for_review", "draft": "drafts/seed-001/linkedin.md", "attempts": 1,
  "media": {
    "status": "ready_for_review", "brief": "drafts/seed-001/linkedin.media.md",
    "render": { "status": "ready_for_review", "file": "drafts/seed-001/linkedin.png",
                "publish_ratio": "1.91:1" }
  }
}
```

---

## Standing guards (in place — don't remove)

- state/budget.md — text caps (per_run/daily $, max_attempts) AND render caps
  (image_candidates, image_max_generations, higgsfield_credit_ceiling).
- Nothing auto-publishes: posts, briefs, and images reach `ready_for_review` or `inbox/`.
- The generator never grades itself; judgment is always megaphone-reviewer.
- Image GENERATION is attended-only (Higgsfield MCP). The Routine never generates images.
- Read a sample daily; watch truthfulness, the voice-read, and on-image text closest.
