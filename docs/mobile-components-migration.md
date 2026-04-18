# Mobile Components Migration Plan

Purpose
- Migrate `static/mobile.html` into a SvelteKit-first implementation under a dedicated `mobile` component set, and split out unrelated or "weird" functionality into focused modules.

Scope
- New files: route `routes/mobile/+page.svelte` and components in `src/lib/components/mobile/`.
- Move/abstract styles into `src/lib/styles/` or component-scoped styles.
- Integrate socket and constants with `src/lib/services/socket.ts` and `src/lib/config/settings.ts`.

Principles
- Non-destructive: do not edit `static/mobile.html`; add new files and import existing services.
- Single responsibility: each component should do one thing (UI, canvas image generation, socket comms, data/constants).
- Reuse existing services/stores where possible.

Component candidates to create
- `MBTICard.svelte` — visual card, gradient control and preview letters.
- `DimButton.svelte` — one dimension toggle button (E/I, N/S, T/F, J/P).
- `MBTIMobilePage.svelte` — page-level composition (imports MBTICard + dim rows + submit button).
- `HoloCardPreview.svelte` — canvas-based share image generator (encapsulates `showHoloCard()` logic).
- `SaveImage.svelte` — small helper for showing/saving generated image.

Functionality to split out
- Color/constants: move `MBTI_COLORS`, `MBTI_NAMES`, `LETTER_COLORS` to `src/lib/config/settings.ts` or `src/lib/stores/mbti.ts`.
- Socket IO: use `src/lib/services/socket.ts` for `submit_mbti` and `lucky_color` handling.
- Canvas rendering: encapsulate into `HoloCardPreview.svelte` or a utility in `src/lib/core/` so it can be unit-tested.

Migration steps
1. Scaffold route `routes/mobile/+page.svelte` and `src/lib/components/mobile/` folder.
2. Create `MBTICard.svelte` with template + reactive props (`sel`, `updateCard` logic ported). Keep styling inline initially.
3. Create `DimButton.svelte` and refactor rows to use it.
4. Create a socket adapter that calls `submit_mbti` via `src/lib/services/socket.ts` from the page component.
5. Implement `HoloCardPreview.svelte` using the canvas drawing code from `static/mobile.html` (refactor to accept `mbti`, `color`, `nickname`, `phrase`).
6. Extract shared CSS tokens or utility classes to `src/lib/styles/mobile.css` or `tokens.css` as appropriate.
7. Test interactive flow locally (`npm run dev`) and wire up `lucky_color` event handling.
8. Clean up: remove duplicated code, add TypeScript types, and run `npm run check`.

Acceptance criteria
- `routes/mobile` renders and behaves like the static page (MBTI selection, submit, receive result).
- Socket messages use existing `socket.ts` service.
- Canvas image generation produces visually equivalent output and is encapsulated.
- Type checks and builds pass.

Estimate
- Scaffold + basic components: 0.5–1h
- Port JS → Svelte + socket integration: 1–2h
- Canvas refactor + QA: 1h

Notes
- Keep `static/mobile.html` untouched for fallback until after migration verification.
- Prefer `src/lib/components/mobile/` for mobile-specific components to avoid polluting `display`.
