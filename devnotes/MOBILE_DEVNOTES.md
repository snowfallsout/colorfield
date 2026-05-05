# MOBILE_DEVNOTES

Purpose
This document records the working plan for the mobile MBTI rewrite that starts from `static/mobile.html` and is migrated into the Svelte 5 mobile component stack.

Scope
- Allowed: files under `src/lib/components/mobile/` and `devnotes/`.
- Not allowed: any other route, component, service, state module, or static asset.
- Preserve the existing route entry and public component names unless the user explicitly expands scope.

Current scan summary
- `src/routes/mobile/+page.svelte` already mounts `MBTIMobilePage`.
- `src/lib/services/mobile/mobile.logic.ts` now owns the mobile selection helpers, card color math, and copy helpers.
- `src/lib/services/mobile/mobile.holo.ts` now owns the dedicated holo-card canvas renderer.
- `src/lib/state/mobile.state.svelte.ts` now owns the Svelte 5 mobile flow state and actions.
- `MBTIMobilePage`, `MBTICard`, `DimButton`, `DimRow`, `SubmitButton`, and `HoloCardPreview` are wired to the local mobile helpers and continue to compile.
- `HoloCardPreview.svelte` now constrains the generated image to `max-height: 95vh` so the result view stays within the viewport on mobile.
- `src/lib/utils/holoCanvas.ts` remains as the older external helper, but the mobile route now uses the local generator inside the mobile folder.

Planned phases
1. Scan
   - Map mobile state variables, business logic, and DOM operations from `static/mobile.html`.
   - Keep the scan local to the mobile flow.
2. Transform
   - Move selection, color, and image-generation logic into typed TypeScript helpers.
   - Keep interfaces explicit and avoid `any`.
3. Adapt
   - Wrap the logic in Svelte 5 runes.
   - Keep presentational components dumb and page orchestration in the page component.
4. Validate
   - Use the smallest possible check after each code change.
   - Stop if a change would require touching files outside the mobile folder.

Workflow rule for this task
- Every code change in this task must be paired with a new `devnotes/DEVNOTES_MOBILE_{timestamp}.md` snapshot.

Decision log
- The first mobile Svelte 5 extraction step is complete.
- The submit payload is now captured at click time so delayed emits cannot pick up later selection edits.
- The canvas generator has been split into a dedicated `src/lib/services/mobile/mobile.holo.ts` helper.
- The mobile result card image is capped at `max-height: 95vh` to avoid viewport overflow.
- The next implementation step should continue inside the mobile folder unless the user explicitly expands scope.
