# MAP Tree v3 — 專案檔案樹說明（v3）

此檔為 `MAP_TREE.md` 的更新版，納入最近對 `src/lib/config/settings.ts` 的新增與型別拆分（`src/lib/types/index.d.ts`）。

## 快覽

- 專案類型：SvelteKit + TypeScript + Vite
- 主要程式碼位置：`src/`
- 前端 UI 元件集中在：`src/lib/components/`

## 重要補充（v3 變更重點）

- 新增：`src/lib/config/settings.ts` — 中央化的視覺與物理參數範本（含顏色、物理、Mediapipe 與 socket 設定）。
- 型別拆分：型別已移至 `src/lib/types/index.d.ts`，方便其他模組直接從 `src/lib/types` 引用。
- Canvas 角色：canonical 的 `Stage.svelte` 對應到 repo 的 `src/lib/components/display/Canvas.svelte`。

## 檔案樹（重要節點）

```
AGENTS.md
package.json
README.md
svelte.config.js
tsconfig.json
vite.config.ts
mapTree-v3.md
Gemini-Map-Tree-v2.md

src/
  app.d.ts
  app.html
  hooks.server.ts
  lib/
    index.ts
    assets/
    components/
      display/
        Canvas.svelte
        Legend.svelte
        Header.svelte
        HandBadge.svelte
        Toast.svelte
      mobile/
    core/
      interactionGrid.ts
      particleEngine.ts
      spriteCache.ts
    services/
      mediapipe.ts
      socket.ts
    stores/
      media.ts
      mbti.ts
      particles.ts
      session.ts
      ui.ts
    config/
      settings.ts
    types/
      index.d.ts
    styles/
    utils/

  routes/
    +layout.svelte
    +page.svelte
    display/
      +page.svelte
      +server.ts

static/
  display.html
  entryMotion.html
  mobile.html
```

## 建議（維護與簡化）

- 保留 `settings.ts` 作為 single-source-of-truth，後續把主要常數從 `core/` 或 `stores/` 移入此檔以減少散落的參數。
- 如需命名一致性，可在團隊約定中記錄 `Stage <-> Canvas` 映射，或考慮將 `Canvas.svelte` 改名為 `Stage.svelte`（此為破壞性改動，需確認）。

---

若需我把此檔加入 repo README 或在 `AGENTS.md` 加一行索引，我可以非破壞性地加入簡短連結。
