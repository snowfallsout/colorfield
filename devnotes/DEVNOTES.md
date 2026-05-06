<!--
Main DEVNOTES
Policy: For every large or repo-wide change, create a dated snapshot file
under `devnotes/DEVNOTES_{timestamp}.md` and reference it here.
-->

# DEVNOTES — Current

Last snapshot: [DEVNOTES_2026-05-06T163951Z.md](DEVNOTES_2026-05-06T163951Z.md)

Policy (short):

- Before performing large updates (typecheck across repo, remove legacy files, change shared components), create a snapshot file named `DEVNOTES_{ISO_TIMESTAMP}.md` in this folder.
- Add a one-paragraph summary to the snapshot describing the state and the intention of the upcoming changes.
- Update this `DEVNOTES.md` to link the snapshot and list a short action item.
- "Large" updates include: running `npm run check` and fixing many files, removing legacy files, or changing public/shared components/routes.

Snapshot created to preserve current state before proceeding with repo-wide changes.

---

Recent activity (delta):

- 2026-05-06: Added [DEVNOTES_2026-05-06T163951Z.md](DEVNOTES_2026-05-06T163951Z.md) recording the consolidation pass that keeps `state/` limited to `.svelte.ts` files and merges single-consumer display helpers into services.

- 2026-04-24: Created snapshot DEVNOTES_2026-04-24T120000Z.md capturing function-area migration progress and outstanding work.
- 2026-05-02: Added [DEVNOTES_2026-05-02T120000Z.md](DEVNOTES_2026-05-02T120000Z.md) defining a stricter Svelte 5 migration baseline for `src/`, including A/B/C classification using `static/display.html`, `static/mobile.html`, and `static/server.js` as protected reference sources.
- 2026-05-02: Added [DEVNOTES_2026-05-02T130000Z.md](DEVNOTES_2026-05-02T130000Z.md) recording the mobile-flow Svelte 5 repair round: callback props, local `$state`, presentational card cleanup, and dead CSS removal.
- 2026-05-02: Added [DEVNOTES_2026-05-02T140000Z.md](DEVNOTES_2026-05-02T140000Z.md) documenting the shared socket/session contract extraction for mobile, display, and server adapters.
- 2026-05-02: Added [DEVNOTES_2026-05-02T150000Z.md](DEVNOTES_2026-05-02T150000Z.md) defining the flattening plan for `src/lib/function/**`, with phase 1 extracting session public APIs into `services` and reducing `function/` to internal implementation.
- 2026-05-02: Added [DEVNOTES_2026-05-02T160000Z.md](DEVNOTES_2026-05-02T160000Z.md) recording round 1 of the display-domain migration: new `src/lib/display/*` owners, service thin-reexports, and runtime/session imports starting to follow the new domain owner.
- 2026-05-02: Added [DEVNOTES_2026-05-02T170000Z.md](DEVNOTES_2026-05-02T170000Z.md) recording the updated service-centric scheme: `services/display/*` as the display owner layer, and `shared/constants/*` as the shared constant source of truth.
- 2026-05-02: Added [DEVNOTES_2026-05-02T180000Z.md](DEVNOTES_2026-05-02T180000Z.md) recording the display state owner migration from `utils/state.ts` into `state/display.svelte.ts`, while keeping `utils/state.ts` as a compatibility shell.
- 2026-05-02: Added [DEVNOTES_2026-05-02T190000Z.md](DEVNOTES_2026-05-02T190000Z.md) recording the first safe deletion round inside `function/`: the now-unreferenced `function/session/*` slice.
- 2026-05-02: Added [DEVNOTES_2026-05-02T191000Z.md](DEVNOTES_2026-05-02T191000Z.md) recording the deletion of the unused `function/runtime/index.ts` barrel after runtime entry ownership moved to `services/display/runtime.ts`.
- 2026-05-02: Added [DEVNOTES_2026-05-02T200000Z.md](DEVNOTES_2026-05-02T200000Z.md) recording the runtime type-owner migration from `function/runtime/types.ts` into `services/display/types.ts`.
- 2026-05-02: Added [DEVNOTES_2026-05-02T201000Z.md](DEVNOTES_2026-05-02T201000Z.md) recording the legacy display bridge migration from `function/runtime/legacy.ts` into `services/display/legacy.ts`.
- 2026-05-02: Added [DEVNOTES_2026-05-02T202000Z.md](DEVNOTES_2026-05-02T202000Z.md) recording the display realtime/socket binding migration from `function/runtime/realtime.ts` into `services/display/realtime.ts`.
- 2026-05-02: Added [DEVNOTES_2026-05-02T203000Z.md](DEVNOTES_2026-05-02T203000Z.md) recording the display bootstrap migration from `function/runtime/dom.ts` into `services/display/runtime.ts`.
- 2026-05-02: Added [DEVNOTES_2026-05-02T204000Z.md](DEVNOTES_2026-05-02T204000Z.md) recording the display camera owner migration from `function/runtime/camera.ts` into `services/display/camera.ts`.
- 2026-05-02: Added [DEVNOTES_2026-05-02T205000Z.md](DEVNOTES_2026-05-02T205000Z.md) recording the migration of camera-adjacent helpers from `function/runtime/*` into `services/display/*`.
- 2026-05-02: Added [DEVNOTES_2026-05-02T210000Z.md](DEVNOTES_2026-05-02T210000Z.md) recording the deletion of the unreferenced `camAndMedia.js` file and the refresh of `_CORE_FILES_.md`.
- 2026-05-02: Added [DEVNOTES_2026-05-02T211000Z.md](DEVNOTES_2026-05-02T211000Z.md) recording the deletion of the unreferenced `particleFull.js` monolith after static files became the sole protected reference baseline.
- 2026-05-02: Added [DEVNOTES_2026-05-02T212000Z.md](DEVNOTES_2026-05-02T212000Z.md) recording the rename/move of the remaining runtime kernel from `function/runtime` into `services/display/kernel`, along with the final retirement of `function/` as an active code path.
- 2026-05-02: Added [DEVNOTES_2026-05-02T213000Z.md](DEVNOTES_2026-05-02T213000Z.md) recording the flattening of `services/display/kernel/*` back into `services/display/*` to avoid an unnecessary extra subdirectory layer.
- 2026-05-02: Added [DEVNOTES_2026-05-02T214000Z.md](DEVNOTES_2026-05-02T214000Z.md) recording the flattening of single-consumer display helpers, the removal of `services/core/*`, and the deletion of the unused `services/api.ts` shell.
- 2026-05-02: Added [DEVNOTES_2026-05-02T215000Z.md](DEVNOTES_2026-05-02T215000Z.md) recording the aggregation of dev/prod server-side socket wiring into `server/socket.shared.ts`, plus the clarified role note for the top-level `services/mediapipe.ts` client service.
- 2026-05-02: Added [DEVNOTES_2026-05-02T220000Z.md](DEVNOTES_2026-05-02T220000Z.md) recording the shared-constant deduplication for display/mobile utilities, including legend-row generation from shared MBTI data and the removal of duplicate smile/MBTI constant definitions from `utils/*`.
- 2026-05-05: Added [DEVNOTES_2026-05-05T000500Z.md](DEVNOTES_2026-05-05T000500Z.md) recording the Vite dev-server fix: the config-time socket plugin path now uses relative imports instead of `$lib/*` aliases.
- 2026-05-05: Added [DEVNOTES_2026-05-05T003000Z.md](DEVNOTES_2026-05-05T003000Z.md) recording the display camera/water toggle repair: remove the legacy auto-start camera owner from Canvas, add camera loading UI, and make the water toggle control canvas background fill independently from camera state.
- 2026-05-05: Added [DEVNOTES_2026-05-05T111500Z.md](DEVNOTES_2026-05-05T111500Z.md) recording the display visual parity repair: fullscreen camera loading mask with a minimum wait floor, plus canvas-side water/camera compositing restored to match `static/display.html`.
- 2026-05-05: Added [DEVNOTES_2026-05-05T123500Z.md](DEVNOTES_2026-05-05T123500Z.md) recording the session/QR repair round: per-session JSON files, qrcodejs-aligned join QR generation, and the direct-click Windows launcher for release users.
- 2026-05-05: Added [DEVNOTES_2026-05-05T133000Z.md](DEVNOTES_2026-05-05T133000Z.md) recording the camera delay and launch update: MediaPipe preloading, parallel model initialization, shorter loading dwell, water-button gating, and a macOS `.command` launcher.
- 2026-05-05: Added [DEVNOTES_2026-05-05T170104Z.md](DEVNOTES_2026-05-05T170104Z.md) recording the repo-wide branding cleanup: active socket contracts and helpers now use `InkLumina`, the session key now uses `inklumina_pc_ip`, and the remaining user-facing source string now reads `inklumina.live`.
- 2026-05-05: Added [DEVNOTES_2026-05-05T171249Z.md](DEVNOTES_2026-05-05T171249Z.md) recording the mobile helper relocation: the mobile logic/canvas helpers now live under `src/lib/services/mobile/`, the Svelte state owner now lives under `src/lib/state/`, and the page/component imports were updated accordingly.
- 2026-05-05: Added [DEVNOTES_2026-05-05T171702Z.md](DEVNOTES_2026-05-05T171702Z.md) recording the internal naming cleanup: socket contracts and helpers now use generic names, the session storage key is generic, and the QR script tag no longer carries a brand-prefixed data attribute.
- 2026-05-06: Added [DEVNOTES_TREE_2026-05-06T141431Z.md](DEVNOTES_TREE_2026-05-06T141431Z.md) defining the `src/lib/utils/` keep / move / retire classification plan.
- 2026-05-06: Added [DEVNOTES_TREE_2026-05-06T151040Z.md](DEVNOTES_TREE_2026-05-06T151040Z.md) recording the move of the pure session join-url helper into the display service domain.

Next planned actions:

- Remove broken namespace imports and fake module declarations before further feature work.
- Re-scope display state ownership so DOM lifecycle is no longer centered inside `.svelte.ts` state modules.
- Pull socket/session payload typing into a shared contract layer used by mobile, display, and server adapters.
- Continue reducing display runtime reliance on `@ts-nocheck` once the shared contract layer is in place.
- Continue phase-1 flattening by moving `function/session` public logic into `services` and shrinking `function/` to internal runtime code.
- Continue phase-1 display-domain migration by moving runtime owner code from `function/runtime/*` into `display/*`, then re-scope `utils/state.ts` into `state/display.svelte.ts`.
- Continue the service-centric refactor by finishing the shell cleanup around `utils/state.ts`, `utils/session.ts`, `services/displayRuntime.ts`, and `services/displaySession.ts`.
- Continue the service-centric refactor by moving display-only helper types and smile hashing logic next to `state/*` owners, then re-evaluating the stale `app.d.ts` declaration.
- Continue pruning legacy `function/*` shells by checking `function/runtime/index.ts` and adjacent runtime barrels for zero-reference deletion candidates.
- Continue pruning `function/runtime/*` from the outside in, starting with public barrels and type ownership before touching active runtime kernels.
- Continue shrinking `function/runtime/*` by moving bridge concerns and global legacy helpers behind `services/display/*` without changing runtime behavior.
- Continue shrinking `function/runtime/*` by pulling realtime/bootstrap owners upward into `services/display/*`, leaving only true runtime kernels behind.
- Continue shrinking `function/runtime/*` by isolating bootstrap and camera owners, leaving only particle/draw/gesture/media kernels in `function/runtime/*`.
- Continue shrinking `function/runtime/*` by deciding whether `camera.ts` and `mediapipe.ts` are still service owners or true kernels.
- Continue shrinking `function/runtime/*` by pulling `mediapipe.ts` and camera UI helpers upward if they are not true kernels.
- Continue shrinking `function/*` by separating true runtime kernels from legacy reference JS and protected historical files.
- Continue clarifying the remaining historical surface in `function/`, especially whether `particleFull.js` should stay as archived reference or be removed.
- Continue clarifying whether `function/runtime/` should keep its current name or be renamed to a more explicit kernel-oriented path.
- Continue clarifying whether `services/display/kernel/*` should stay as a flat kernel layer or be split into smaller render/particle/gesture subdomains.
- Continue simplifying `services/display/*` so helper files only remain separate when they serve more than one concrete owner.
- Continue clarifying the role split between top-level client services (`services/socket.ts`, `services/mediapipe.ts`) and route-specific display services under `services/display/*`.
- Continue consolidating server-side behavior so dev/prod adapters share one owner for socket and session flow where practical.
- Continue reducing duplicated literal data so `shared/constants/*` stays the sole owner of cross-domain MBTI and vision constants.
- Classify `src/lib/utils/*` into keep / move / retire buckets before any further cleanup or deletion.
- Keep the display session helper consolidated into the canonical display service owner when it has only one consumer.
- Keep `utils/pool.ts` and `utils/sprites.ts` until the display particle engine is rehomed off the legacy utility path.
- Keep active source branding aligned with `InkLumina` while leaving protected static reference files untouched unless explicitly authorized.
- Keep mobile helper ownership aligned with `services/mobile` and `state/` so import paths stay consistent after file moves.
- Keep internal identifiers generic unless the name itself must be user-visible plain text.

<!-- End of current DEVNOTES index -->

