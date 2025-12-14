# 成果物（機能一覧・ERD・テーブル定義書）運用ルール

## 対象成果物（.cursor/<feature>/artifacts/ 配下）
- `.cursor/<feature>/artifacts/feature-list.md`
- `.cursor/<feature>/artifacts/data-model.md`
- `.cursor/<feature>/artifacts/table-definition.md`

## プレースホルダー（テンプレ共通）
テンプレ（`.cursor/templates/artifacts/*.md`）は以下のプレースホルダーを使う。

- `{{PROJECT_NAME}}`: プロジェクト名（既定: `package.json.name`、無い場合はルートフォルダ名）
- `{{DATE}}`: `YYYY-MM-DD`（UTC）
- `{{TIMESTAMP}}`: `YYYY-MM-DDTHH:mm:ssZ`（UTC）
- `{{AUTHOR}}`: 記載者（任意。未指定なら空）

## 作成/更新タイミング（推奨）
- **requirements 直後**: `.cursor/<feature>/artifacts/feature-list.md`
  - MVP/Phase と UI/API/Batch を先に固定（design の前提を明確化）
- **design 前半〜中盤**: `.cursor/<feature>/artifacts/data-model.md`
  - MVPの主要エンティティとFKを Mermaid + FK表で固定
  - Mermaid の `erDiagram` には **カラム定義ブロック（PK/UK/FK）** を含める（登場するテーブルは原則ブロックも書く）
- **design 中盤〜終盤（tasks前）**: `.cursor/<feature>/artifacts/table-definition.md`
  - 制約/インデックス/編集仕様まで“契約化”
- **tasks**: 3成果物（存在する場合）を読み取り、タスクがスコープ逸脱しないようにする

## 生成方法（推奨）
AI コマンド（`/requirements` / `/design` / `/tasks`）が `.cursor/rules/artifacts-generation.md` に従って **安全に初期作成**（既存は上書きしない）する。

## 更新ポリシー
- **差分更新が基本**（全面書き換えしない）
- **MVP優先**で埋め、Phase2以降は追記で拡張
- spec（`.cursor/<feature>/requirements.md` / `design.md`）と乖離したら、どちらを正にするか決めて同期（放置しない）

## テンプレート
- `.cursor/templates/artifacts/create-feature-list.md`
- `.cursor/templates/artifacts/create-data-model.md`
- `.cursor/templates/artifacts/create-table-definition.md`

## AI 自動作成ルール
- `.cursor/rules/artifacts-generation.md`

## 共通スニペット（任意）
- `.cursor/templates/artifacts/change-history-section.md`（変更履歴の統一フォーマット）

---

## 変更履歴

| 日付 | バージョン | 変更者 | 変更内容 |
| ---- | ---------- | ------ | -------- |
| {{DATE}} | v1.0 | {{AUTHOR}} | 初版作成 |
