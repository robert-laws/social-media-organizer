# Circuit breakers — set BEFORE any unattended run
per_run_usd:  1.50
daily_usd:    5.00
max_attempts: 4      # the -n retry cap, per platform

# render caps (appended from budget.add.md)
image_candidates:           2     # best-of-2 generations per platform
image_max_generations:      3     # hard cap incl. one replacement on a failed/nsfw job
higgsfield_credit_ceiling:  200   # stop the morning render pass if a batch would exceed this
# check the Higgsfield credit BALANCE before a batch; stop at the ceiling, don't spin
