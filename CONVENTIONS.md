# InkLumina Conventions

This document defines the minimal writing and structure conventions for InkLumina.

## 1. Core Principles

- Keep code small, typed, modular, and easy to move.
- Prefer TypeScript.
- Avoid `any` unless there is no practical alternative.
- Make behavior explicit and local.
- Prefer functions over classes unless a class clearly improves clarity.
- Keep UI and logic separate.

## 禁止行為 (Strict Prohibitions)

1. **禁止在 .svelte 寫邏輯**：任何超過 3 行的 function，必須移至 `services/` 或 `states/`。
2. **禁止局部樣式膨脹**：若 CSS 超過 30 行，必須檢查是否能透過全域 `styles/` 或拆分組件解決。
3. **禁止重複 UI**：任何出現 2 次以上的 UI 結構（如你的 Panel Card），必須建立 `components/`。
4. **禁止直接 fetch**：所有 API 調用必須透過 `services/`，組件只能 call service。

## 2. Svelte Component Rules

- `.svelte` files are UI components first.
- Components should mainly:
  - render UI
  - receive props
  - emit events
  - handle only small view-level interactions
- Do not place major business logic in `.svelte` files.
- Do not put session, socket, camera, or persistence workflows directly in components.
- If logic grows, move it into `services/`.

## 2.1 Component Granularity Rules

- Similar widgets may be grouped into one component family when they share the same label / surface / value flow and do not conflict in behavior.
- Prefer one family component with variants over many tiny files when the difference is only input type, layout, or minor interaction.
- Split components only when DOM structure, validation, or interaction semantics become incompatible.
- Do not fragment a widget family into multiple files unless the split clearly reduces complexity.

## 3. Services Rules

- `src/lib/services/` contains functional logic.
- Services should be modular and focused.
- Each service should ideally do one clear job.
- Keep services framework-agnostic where possible.
- Services should not render UI.
- Services may talk to APIs, sockets, filesystem, or browser APIs when needed.

## 4. States Rules

- `src/lib/states/` contains Svelte 5 rune-based state.
- Use `$state`, `$derived`, and `$effect` where appropriate.
- State files own reactive data and mutation helpers.
- Keep state updates explicit.
- Components should consume state, not duplicate it.

## 5. Config Rules

- `src/lib/config/` is for system-level setup.
- Use config for environment-related or architecture-level values.
- Do not store feature tuning values in `config/`.
- Keep server/public config separated when needed.

## 6. Settings Rules

- `src/lib/settings/` is for functional runtime settings.
- Put tuning values here:
  - camera dimensions
  - particle rates
  - refresh intervals
  - thresholds
  - feature-level runtime parameters
- Settings should be easy to adjust without changing logic.

## 7. Shared Rules

- `src/lib/shared/` contains cross-client/server contracts.
- Keep shared constants and event contracts here.
- Shared code must remain environment-safe.
- Put route, service, and UI-specific types in `src/lib/types/`.

## 8. Server Rules

- `src/lib/server/` is server-only.
- Do not import server-only modules from client components.
- Keep persistence, auth, and server socket wiring here.

## 9. Route Rules

- `src/routes/` should stay thin.
- Route files should mainly compose components and initialize page-level flows.
- Move heavy logic into services or state modules.

## 10. TypeScript Rules

- Use clear types and small data structures.
- Prefer named types for public objects.
- Keep function signatures explicit.
- Avoid overusing `any`, `unknown`, or `as` casts.
- Prefer simple, readable code over clever abstractions.

## 11. Migration Readiness

- Keep modules framework-neutral when possible.
- Avoid mixing UI logic and domain logic.
- Keep config, settings, services, and state clearly separated.
- This makes future migration to React / Next.js easier.

## 12. Daily Working Rule

When unsure, choose the smallest change that keeps structure clear.

- If it is UI, keep it in a component.
- If it is logic, move it into a service.
- If it is reactive state, keep it in states.
- If it is tuning, keep it in settings.
- If it is architecture, keep it in config.

---