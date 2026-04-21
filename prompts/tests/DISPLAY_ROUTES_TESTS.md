# Display Route 操作驗收腳本

## 1. 測試目標
驗證 `src/routes/(app)/display` 已完成從舊版 `colorfield-main/public/display.html` 的功能搬遷至 `/display`，且互動行為一致。

## 2. 前置條件
- Node.js 可正常執行（建議 20+）。
- 同一個區網可用來做手機 QR 驗證。
- 測試機可授權相機使用。
- 若要驗證 Socket 流程，需同時開啟 mobile 端進行 MBTI 提交。

## 3. 啟動步驟
1. 在專案根目錄執行 `bun run dev:socket`（啟動 Socket/API 伺服器，預設 `:3000`）。
2. 另開一個終端執行 `bun run dev`（啟動 SvelteKit dev server，預設 `:5173`）。
3. 開啟瀏覽器進入 `http://localhost:5173/display`。
4. 開啟 DevTools Console，確認沒有紅色錯誤。

## 4. 驗收案例

（略 — 已在原檔案中）
