# Mobile UI Scaffold (no code)

This document is a non-code scaffold describing the folder and component layout for migrating `static/mobile.html` into SvelteKit components. It intentionally contains no implementation code—only filenames, responsibilities and brief notes.

Project locations
- `routes/mobile/+page.svelte` — page entry that composes mobile components and provides routing.
- `src/lib/components/mobile/` — folder for mobile-specific components (keeps them separate from `display/`).

Planned component files (descriptions only)
- `MBTIMobilePage.svelte` — top-level page wrapper. Composes the MBTI card, dim rows, and submit button; wires socket events via service adapter.
- `MBTICard.svelte` — visual card showing gradient, large letters, name lines and number; exposes props for `sel` and color variables.
- `DimButton.svelte` — single toggle button for one MBTI dimension (E/I, N/S, T/F, J/P); emits selection events.
- `DimRow.svelte` — small layout wrapper to host two `DimButton` instances per row.
- `SubmitButton.svelte` — action button with disabled/active states and localized labels.
- `HoloCardPreview.svelte` — encapsulates the canvas-based share-image generator; accepts `mbti`, `color`, `nickname`, `phrase` and exposes the generated image URL.
- `SaveImage.svelte` — lightweight UI to show the generated image and provide save/share affordances.

Shared resources
- `src/lib/styles/mobile.css` — mobile-scoped shared styles (glass, card, buttons, typography). Start with a small subset and expand.
- `src/lib/config/settings.ts` — move `MBTI_COLORS`, `MBTI_NAMES`, `LETTER_COLORS` here; referenced by components and services.
- `src/lib/services/socket.ts` — existing socket service used by `MBTIMobilePage.svelte` to emit `submit_mbti` and listen for `lucky_color`.
- `src/lib/utils/color.ts` — utility functions for `hexToRgb`, `mix`, `lighten` (kept as utilities, no code added here now).

Routing / integration notes
- Keep `static/mobile.html` untouched as a fallback until the migration is validated.
- The new `routes/mobile` page should import components from `src/lib/components/mobile/` and use the socket service rather than embedding `/socket.io/socket.io.js`.

Acceptance checklist (to verify later)
- Visual parity for selection flow and card gradients.
- `submit_mbti` uses `src/lib/services/socket.ts`.
- Generated share image is produced by `HoloCardPreview.svelte` and exposed as an image URL.
- Styles are isolated to `mobile.css` and do not break desktop `display` components.

Notes
- This file is a plan-only artifact: create component files and route scaffolds from this outline when ready.
