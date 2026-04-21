Approved for handoff on 2026-04-14.
Implementation handoff should create the approved root MAP_TREE_DEV notes document from this plan, without expanding scope beyond the documented sections.

## Plan: MAP_TREE_DEV Architecture

為目前的 Colorfield 專案建立一套可交接給 Agent 的多文件 MAP_TREE_DEV 規劃，目標是把 `routes` 收斂成薄入口，把可重用 UI 移到 `src/lib/components/*`，把不可見邏輯移到 `src/lib/features/*`，並保留 `src/lib/shared/*` 作為跨 display/mobile 的共享契約。依據目前專案狀態，`display` 已部分遷入 `src/lib/display/*`，因此規劃必須採用「先建立新樹、再用 shim/rewire 切換、最後再收斂舊路徑」的方式，避免再次出現雙重來源或大面積破壞。

**Requested deliverable**
- Root target file: `d:\02-station\_github\colorfield\sv-app\MAP_TREE_DEV_NOTES.md`
- Format: single markdown document that combines all of the following in one place:
  1. File-level migration mapping tables for display and mobile
  2. Agent-facing guardrails: forbidden files, cutover rules, shim policy, and change sequencing rules
  3. Separate execution subplans for display and mobile, but embedded as sections in the same root document
- Constraint for execution agent: create the root file only after copying the verified structure from this plan; do not invent additional scope outside the sections listed above
