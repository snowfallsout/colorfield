# AGENTS.md

InkLumina is a SvelteKit + TypeScript project. Keep changes small, modular, and consistent.

## Agent Workflow

在執行任何修改前，你必須進行以下思考循環（Mental Sandbox）：

1. **職責定位**：我要改的功能屬於 [UI / 狀態 / 業務邏輯 / 配置]？
2. **路徑檢索**：
   - 如果是 UI -> 前往 `src/lib/components/`
   - 如果是邏輯 -> 前往 `src/lib/services/`
   - 如果是狀態 -> 前往 `src/lib/states/`
3. **單點修改原則**：如果目標文件太長 (>150行)，我應優先提議「拆分組件」而非「繼續寫入」。

## 意圖識別 (Intent Alignment)

- 如果用戶說「加個按鈕」，你的意圖不是加個 <button>，而是「在組件層增加事件觸發，在服務層增加業務處理」。

## Rules

- `routes/` = thin entrypoints
- `components/` = UI only
- `services/` = logic, orchestration, side effects
- `states/` = Svelte 5 rune state
- `config/` = system-level setup
- `settings/` = runtime tuning
- `shared/` = env-safe contracts and constants
- `types/` = app-local domain, route, and UI types
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
- Run `npm run check` after structural changes.
- Ask before large cross-cutting changes.
- Page (Entrypoint): 建議控制在 100 - 150 行 以內。
  Page 應該只負責「組裝」與「初始化」，不該有具體的 HTML 標籤（除了 Layout 用的 div）。
- Component (Atom/Molecule): 建議控制在 80 - 120 行 以內。
  如果 CSS 佔據了 50 行，那麼 HTML+JS 就不該超過 50 行。
- Service / State (Pure Logic): 建議控制在 200 - 300 行 以內。
  邏輯文件可以長一點，但如果超過 300 行，說明你該拆分「子服務」（Sub-services）。

## References

- `README.md`
- `CONVENTIONS.md`
- `ARCHITECTURE.md`
