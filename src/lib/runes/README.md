# Stores (src/lib/stores)

This directory exposes small, focused Svelte stores used across the app.

Overview:

- `mbti.ts` — MBTI counts and `spawn` helper (enqueue visual spawn events).
- `media.ts` — camera / crowd / interaction normalized stores and helpers.
- `particles.ts` — spawn queue (FIFO) and helpers for the display layer.
- `session.ts` — lightweight session name + history and placeholder helpers.
- `ui.ts` — small UI stores (`toast`, `handBadgeText`, `waitingVisible`).

Usage notes for agents and humans:

- Each file contains a structured TSDoc header describing exports and example usage.
- Coordinate conventions: media stores use normalized coords in `[0,1]` with `y` top→bottom.
- Spawn flow: call `pushSpawn` (or `spawn` wrapper in `mbti.ts`) to enqueue events; the display
  canvas consumes via `popSpawn`.
- Keep network/API logic out of these stores; prefer `services/` or route handlers for network calls.

Example (enqueue a spawn):

```ts
import { spawn } from '$lib/stores/mbti';
spawn('ENFP', '#0f0', 'visitor', { ENFP: 1 }, 1);
```

If you want, I can also add automated extraction scripts to build a concise JSON manifest
of these module headers for downstream tooling (agents/docs).
