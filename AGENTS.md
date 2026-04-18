# AGENTS.md — Repository guidance for AI coding agents

Purpose
- Provide concise, actionable instructions for AI agents working on this Svelte project.

Quick commands
- Dev server: `npm run dev`
- Build: `npm run build`
- Preview production build: `npm run preview`
- Typecheck: `npm run check`

What to know about this codebase
- SvelteKit + TypeScript + Vite project (see `package.json`).
- Frontend components live under `src/lib/components`.
- The display-area components relevant to the current task live at:
  - `src/lib/components/display/Header.svelte` — app title and lightweight header UI.
  - `src/lib/components/display/HandBadge.svelte` — small presentational status badge.
  - `src/lib/components/display/Legend.svelte` — visual legend showing MBTI counts.

Agent conventions (concise)
- Preserve original files by default: when refactoring or changing behavior, prefer creating new component files or new routes instead of editing existing source files. (This repo's developer prefers non-destructive changes.)
- Ask the user before modifying public/shared components or routes.
- Link, don't duplicate: if documentation exists (README.md), link to it rather than embedding large excerpts.
- Keep edits minimal and focused; follow existing style and formatting.

When changing UI components
- Run `npm run check` to ensure TypeScript/Svelte checks pass after changes.
- If adding behaviour that needs runtime verification, run `npm run dev` locally and test in the browser.
- For style-only changes, prefer small scoped CSS updates inside the component.

Files added/modified by agents
- Create `AGENTS.md` here rather than adding `.github/copilot-instructions.md` unless requested.

Where to look for more context
- Project README: `README.md` (root)
- Package scripts: `package.json` (root)

If you want follow-ups
- Ask me to create a stricter `.github/copilot-instructions.md` or a task-specific skill (e.g., `create-skill ui-refactor`) to encode rules for particular folders.

---
Generated to assist AI coding agents; review before applying large changes.
