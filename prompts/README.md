<!--
  prompts/README.md
  說明：存放 prompt 範本、測試與版本管理指南。
  作者：GitHub Copilot (代理)
  日期：2026-04-20
-->
# Prompts 資料夾說明

此資料夾為專案中所有與 LLM / prompt 相關資產的集中位置，包含：

- Prompt 範本（可供人與自動化使用）
- Prompt 變體（不同溫度/風格或安全等級）
- Prompt 測試（regression test cases）

建議結構：

- `system/`：system message 與角色設定。
- `tasks/`：依任務分類的 prompt（summarize、translate、classify 等）。
- `tests/`：每個 prompt 的 input → expected 測試樣例。
- `v1/`, `v2/`：重要版本的快照（保留歷史，不覆寫）。
- `prompt_template.md`：本資料夾之通用範本。

使用規範：

- 所有 prompt 的檔頭請包含 `Title`, `Version`, `Owner`, `Last_review`。
- 任何修改應透過 PR，並將重大變更記錄在 Changelog 中。
- 機敏資料（API keys、私有 prompt）不可加入版本庫，應使用 CI/Secrets 管理。

自動化與測試：

- 建議建立 `prompts/tests/`，並用簡單腳本驗證 prompt regression。
- 對於會被程式引用的 prompt，提供 JSON/YAML 機器可讀版本。

如需範例，請參考 `prompt_template.md`。
