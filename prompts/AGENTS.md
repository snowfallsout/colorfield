<!--
  agents/AGENTS.md
  Agent 說明檔，列出可用子 agent、用途與執行方式。
-->
# AGENTS

此檔列出專案中可用的 sub-agents、其目的與基本運作方式。

## Explore

- Purpose: 快速讀取與回答專案內部檔案問題（read-only）。
- Usage: 由自動化工具或開發者在需要時啟動。
- Configs: `agents/configs/explore.yaml`（若存在）

## How to add an agent

1. 新增 `agents/configs/<name>.yaml`（machine-readable），包含 `name`, `purpose`, `owner`, `run_command`。
2. 更新本 `AGENTS.md` 檔，提供 human-friendly 說明。
