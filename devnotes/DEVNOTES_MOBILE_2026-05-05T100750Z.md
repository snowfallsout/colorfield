# DEVNOTES MOBILE 2026-05-05T100750Z

## Task 1: Split mobile canvas helper

### Plan
- Move the holo-card canvas generator out of `mobile.logic.ts` into its own mobile-local helper file.
- Keep the selection, copy, and color derivation logic in `mobile.logic.ts`.
- Update the mobile page to import the generator from the new helper.

### Todo
- Create a dedicated canvas helper for the generated share image.
- Keep the existing visual output and copy intact.
- Run `npm run check` after the split.

### Result
- No source files have changed yet in this snapshot.
- The current mobile generator is still in `mobile.logic.ts` and only one mobile page uses it.

### Impact
- The mobile helper layer will be easier to maintain because state/copy logic and canvas rendering will no longer live in the same file.
- The refactor remains strictly inside `src/lib/components/mobile/`.
