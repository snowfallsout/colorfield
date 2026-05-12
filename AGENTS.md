# AGENTS.md

InkLumina is a SvelteKit + TypeScript project. Keep changes small, modular, and consistent.

## Rules

- `routes/` = thin entrypoints
- `components/` = UI only
- `services/` = logic, orchestration, side effects
- `states/` = Svelte 5 rune state
- `config/` = system-level setup
- `settings/` = runtime tuning
- `shared/` = contracts, constants, types
- `server/` = server-only code

## Style

- Prefer TypeScript.
- Avoid `any` when practical.
- Keep `.svelte` files UI-focused.
- Prefer small functions and clear boundaries.

## Editing

- Make minimal, focused changes.
- Avoid unnecessary refactors.
- Do not mix server-only logic into client code.
- Ask before large cross-cutting changes.

## References

- `README.md`
- `CONVENTIONS.md`
- `ARCHITECTURE.md`