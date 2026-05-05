# InkLumina

InkLumina 是一個以 SvelteKit 建置的現場互動裝置：大螢幕 display 會即時呈現 MBTI 粒子畫布，mobile 端則提供加入與卡片生成流程。

## 開發

```sh
npm install
npm run dev
```

## 本機 production 啟動

下載 GitHub release 或直接取得專案後，安裝依賴即可用一條指令在 localhost 啟動 production 版本：

```sh
npm install
npm run release:localhost
```

這個腳本會在缺少 build 產物時自動先執行 `npm run build`，之後以 `127.0.0.1:4173` 啟動 InkLumina。

Windows 使用者如果不想手動輸入 npm 指令，可以直接雙擊根目錄的 `Start-InkLumina.bat`。它會檢查 Node.js、安裝依賴、啟動 localhost 服務，並自動開啟 display 頁面。

macOS 使用者可以直接雙擊根目錄的 `Start-InkLumina.command`。它會自動檢查 Node.js、安裝依賴、建置 production assets、啟動 localhost 服務，並打開 display 頁面。

## 其他常用指令

```sh
npm run build
npm run preview
npm run check
```

## Prompts

本專案的 LLM prompt 範本、測試與範例集中於 `prompts/` 資料夾；請參閱 `prompts/README.md` 以取得貢獻規範與協作說明。
