# DEVNOTES MOBILE 2026-05-05T095331Z

## Task 1: Stabilize mobile submit timing

### Plan
- Keep the current mobile helper split intact.
- Fix the submit flow so the delayed socket emit uses the MBTI captured at click time.
- Leave all non-mobile files untouched.

### Todo
- Snapshot the selected MBTI before scheduling the socket emit.
- Validate the touched mobile page after the change.

### Result
- `MBTIMobilePage.svelte` now stores the current MBTI in a local variable before the 350ms timeout.
- The delayed `submit_mbti` emit can no longer drift if the user changes a selection during the loading delay.

### Validation
- `get_errors` on `MBTIMobilePage.svelte` returned no errors after the fix.

### Impact
- The mobile submit flow is now stable even if the user changes a dimension while the loading feedback is visible.
- The rest of the mobile Svelte 5 refactor remains unchanged.