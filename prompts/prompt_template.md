<!--
  prompts/prompt_template.md
  Prompt 範本（用於建立新 prompt 的標準欄位）
  請以此格式保存每個 prompt，並在變更時更新 `version` 與 `last_review`。
-->
# Prompt Template

- Title:
- Version: v0.1
- Status: draft / reviewed / approved
- Owner: @owner
- Last_review: 2026-04-20
- Model constraints: (e.g. gpt-5-mini, temperature=0.2, max_tokens=800)
- Intended use: 一句話說明用途與場景

## System message

（在此放 system 指令，明確角色與限制）

## User message template

（包含變數或輸入格式說明，例如：{{input_text}}）

## Few-shot examples

- Example 1
  - Input:
  - Expected output:

## Input schema (選用)

- type: object
- properties:
  - text: string

## Output constraints

- Format: JSON / Plain text / Markdown
- Required fields: `summary`, `score`

## Tests

- test_case_1: input → expected

## Notes / Pitfalls

- 安全與過濾注意事項
