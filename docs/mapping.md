# Gemini: canonical ↔ repo 對照表

建立日期：2026-04-19

說明：此表將你給出的 canonical map（左欄）逐行對應到本專案實際檔案路徑（右欄）。特別註記：canonical 的 `Stage.svelte` 對應到本 repo 的 `src/lib/components/display/Canvas.svelte`。

| Canonical 路徑 | Repo 路徑 | 備註 |
|---|---|---|
| `src/app.html` | `src/app.html` | 引入外部 SDK（MediaPipe / Socket.io）位置，相符 |
| `src/lib/core/interactionGrid.ts` | `src/lib/core/interactionGrid.ts` | 完全對應 |
| `src/lib/core/particleEngine.ts` | `src/lib/core/particleEngine.ts` | 完全對應 |
| `src/lib/core/spriteCache.ts` | `src/lib/core/spriteCache.ts` | 完全對應 |
| `src/lib/services/mediapipe.ts` | `src/lib/services/mediapipe.ts` | 完全對應 |
| `src/lib/services/socket.ts` | `src/lib/services/socket.ts` | 完全對應 |
| `src/lib/stores/media.ts` | `src/lib/stores/media.ts` | 完全對應 |
| `src/lib/stores/mbti.ts` | `src/lib/stores/mbti.ts` | 完全對應 |
| `src/lib/stores/particles.ts` | `src/lib/stores/particles.ts` | 完全對應 |
| `src/lib/components/engine/Stage.svelte` | `src/lib/components/display/Canvas.svelte` | **映射說明**：canonical 的 `Stage` 對應 repo 的 `Canvas`（功能為核心畫布與 RAF 控制） |
| `src/lib/components/ui/Legend.svelte` | `src/lib/components/display/Legend.svelte` | 完全對應 |
| `src/lib/config/settings.ts` | (無) -> 建議 `src/lib/config/settings.ts` | repo 目前無集中設定檔，建議新增以統一參數 |
| `src/routes/+page.svelte` | `src/routes/+page.svelte` | 完全對應 |
| `static/assets/` | `static/` 或 `src/lib/assets/` | repo 有 `static/` 多個 HTML 入口，且 `src/lib/assets/` 目錄存在；確認模型權重放置策略 |

## 建議與下一步

- 若要標準化命名，可將 `Canvas.svelte` 的角色註記於 `MAP_TREE.md` 或新增 `src/lib/config/settings.ts` 中的元件映射常數。
- 我可以：
  1. 非破壞性新增 `src/lib/config/settings.ts` 範本（含顏色/物理參數指派），或
  2. 產生一份 CSV 對照表供自動化處理。

如果要我執行其中一項，請回覆序號（例如 `1` 或 `2`）。
