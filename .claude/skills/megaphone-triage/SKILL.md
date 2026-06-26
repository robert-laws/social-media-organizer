---
name: megaphone-triage
trigger: invoked each run by automation (Routine, scheduled task, or /loop)
---

## Read (DISCOVERY inputs)
- ideas/queue.md            — new seeds: idea text and/or an image path
- state/content-state.json  — what's already generated or approved
- voice-profile.md          — brand voice, if present (from the mkt-brand-voice skill)

## Judge (this sets the ceiling on the whole loop)
For each seed decide:
- Is it worth posting at all? Skip noise — surfacing a weak idea wastes every later step.
- Which platforms suit it? Not every idea belongs on LinkedIn, and vice versa.
- Is it already done for those platforms? Then skip it.

## Output (PERSISTENCE)
For each (seed × platform) still needing work, ensure a row exists in
state/content-state.json with status "todo". Do not regenerate finished work.
Write the file back to disk; commit it so a cloud Routine can read it next run.
