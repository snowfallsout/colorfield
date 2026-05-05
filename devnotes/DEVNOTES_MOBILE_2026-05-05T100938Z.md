# DEVNOTES MOBILE 2026-05-05T100938Z

## Task 1: Split the mobile canvas helper

### Plan
- Move the holo-card canvas generator out of `mobile.logic.ts` and into a dedicated local mobile helper.
- Keep selection state, copy, and color derivation inside `mobile.logic.ts`.
- Keep the page component pointed at the local mobile helper stack only.

### Todo
- Create `mobile.holo.ts` for the canvas renderer.
- Update the mobile page to import the generator from the new helper.
- Validate the touched mobile files with `npm run check`.

### Result
- `mobile.holo.ts` now owns the share-image canvas generator and its local drawing helper.
- `mobile.logic.ts` now owns only selection, color, and copy helpers.
- `MBTIMobilePage.svelte` now imports the generator from `mobile.holo.ts`.

### Validation
- `npm run check` completed successfully with 0 errors and 0 warnings after the helper split.

### Impact
- The mobile architecture is cleaner: state, selection logic, and canvas rendering are now separated into smaller local modules.
- The refactor remains confined to `src/lib/components/mobile/` and does not touch other routes or services.
