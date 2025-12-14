# 成果物（artifacts）生成ルール（AI 実行手順）

## 目的
requirements / design / tasks の各フェーズで、設計の一次ソースとなる成果物（機能一覧・ERD・テーブル定義書）を **テンプレートから安全に初期作成** できるようにする。

## 対象成果物（.cursor/<feature>/artifacts/ 配下）
- `feature-list.md`
- `data-model.md`
- `table-definition.md`

## 記載ルール（必須）
### data-model.md（ERD）
- Mermaid の `erDiagram` には、**登場する各テーブル/エンティティについてカラム定義ブロックを記載する**。
  - 形式例: `M_USER { bigint id PK ... }`
  - **PK/UK/FK（分かる範囲）を明示**する（少なくとも `id PK`、主要なユニークキー、参照カラムの `FK`）。
- `%%` から始まる行は Mermaid のコメントとして扱ってよい（図の読みやすさ向上目的）。
- `data-model.md` と `table-definition.md` の内容が矛盾しないようにする（命名・キー・参照関係）。

## 生成の基本ポリシー（必須）
- **安全な init がデフォルト**: 既存ファイルは **絶対に上書きしない**
- 上書きが許されるのは、ユーザーが明示的に「上書きして」と指示した場合のみ
- 生成した後は、以降 **差分更新が基本**（全面書き換えしない）

## フェーズ別の生成対象（推奨）
- **requirements 直後**: `.cursor/<feature>/artifacts/feature-list.md` を（無ければ）作成
- **design 前半〜中盤**: `.cursor/<feature>/artifacts/data-model.md` を（無ければ）作成
- **design 中盤〜終盤（tasks 前）**: `.cursor/<feature>/artifacts/table-definition.md` を（無ければ）作成
- **tasks**: 3成果物（存在する場合）を読み取り、タスクがスコープ逸脱しないようにする
  - ただし、欠けている成果物がある場合は **テンプレから初期作成してもよい**（initのみ、上書き禁止）

## テンプレートの場所
テンプレは `.cursor/templates/artifacts/` に置く。
- `.cursor/templates/artifacts/create-feature-list.md`
- `.cursor/templates/artifacts/create-data-model.md`
- `.cursor/templates/artifacts/create-table-definition.md`

## プレースホルダー置換（必須）
テンプレ内の以下を置換して出力する。
- `{{PROJECT_NAME}}`
  - 優先: リポジトリルートの `package.json` の `name`
  - 代替: ルートフォルダ名
- `{{DATE}}`: `YYYY-MM-DD`（UTC）
- `{{TIMESTAMP}}`: `YYYY-MM-DDTHH:mm:ssZ`（UTC）
- `{{AUTHOR}}`: 未指定なら空文字（ユーザー指定があれば反映）

互換性:
- テンプレ内に `{{SYSTEM_NAME}}` が残っていたら `{{PROJECT_NAME}}` と同値として扱う（同様に置換）。

## 実行アルゴリズム（AI 向け・手順そのまま）
1. **機能ディレクトリ判定**: `feature = $1` とし、出力先を `.cursor/$1/artifacts/` とする（無ければ作成）。
2. **テンプレ読み込み**: 上記3テンプレを読み込む。
3. **置換値決定**:
   - `package.json` があれば `name` を読む（文字列かつ非空）
   - `{{DATE}}`/`{{TIMESTAMP}}` は UTC の現在時刻で生成
   - `{{AUTHOR}}` は未指定なら空
4. **安全に作成**:
   - 出力先（`.cursor/$1/artifacts/`）に同名ファイルが **存在する場合はスキップ**
   - 存在しない場合のみ、置換済みの内容を書き込んで作成
5. **結果サマリー**:
   - 作成/スキップを一覧化して、コマンド出力サマリーに含める

## 例（運用メモ）
- 通常は `/requirements` / `/design` / `/tasks` の実行に含めて初期作成する（既存は上書きしない）
