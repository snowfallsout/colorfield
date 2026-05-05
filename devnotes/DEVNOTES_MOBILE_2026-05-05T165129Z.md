# DEVNOTES MOBILE 2026-05-05T165129Z

## Task 1: Constrain the mobile result card

### Plan
- Reduce the visual footprint of the generated holo card on the mobile result screen.
- Keep the change local to the mobile preview component.
- Use a viewport-based height cap so the card cannot exceed the visible screen.

### Todo
- Update the holo preview image style to add a height cap.
- Keep the current canvas output unchanged.
- Validate the touched mobile files with `npm run check`.

### Result
- No source files have changed yet in this snapshot.
- The current result screen still renders the generated holo card at full available width.

### Impact
- The upcoming style adjustment should prevent the card from pushing the result view beyond the viewport on mobile.
- The change should stay confined to `src/lib/components/mobile/`.
