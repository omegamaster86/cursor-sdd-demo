# 機能一覧（cursor-sdd-demo）

**目的**: プロダクトのスコープ（MVP/Phase）と、UI/API/バッチの一覧を"合意の一次ソース"として固定する。
**作成/更新タイミング**: `/requirements` の直後（要件ドラフトが出たらまず作る）。詳細は `.cursor/templates/artifacts/artifacts_rules.md`。

---

## 画面機能

| 機能 ID | 画面名 | 説明 | 優先度 | Phase | 記載者 |
| ------- | ------ | ---- | ------ | ----- | ------ |
| UI-001 | ログイン画面 | 管理者の認証を行う。メールアドレスとパスワードによるログイン。 | High | MVP | |
| UI-002 | ダッシュボード | アンケート一覧と主要統計を表示。クイックアクションを提供。 | High | MVP | |
| UI-003 | アンケート一覧 | 作成済みアンケートの一覧表示。ステータス・作成日時でフィルタ/ソート可能。 | High | MVP | |
| UI-004 | アンケート作成/編集 | アンケートの基本情報と質問を設計。ドラッグ&ドロップで並び替え。 | High | MVP | |
| UI-005 | 質問エディタ | 各種質問形式（単一選択、複数選択、自由記述、評価スケール）を設計。 | High | MVP | |
| UI-006 | 配信設定 | 公開URL生成、配信期間設定、ステータス管理。 | High | MVP | |
| UI-007 | 回答一覧 | 収集した回答を一覧表示。CSVエクスポート機能。 | High | MVP | |
| UI-008 | 回答詳細 | 個別回答の全内容を表示。 | Medium | MVP | |
| UI-009 | 集計・分析 | グラフによる可視化、統計値表示、PDFレポート出力。 | Medium | Phase2 | |
| UI-010 | ユーザー管理 | 管理者ユーザーの追加・編集・削除、ロール設定。 | Low | Phase2 | |

**記載ルール**
- Phase は `MVP`, `Phase2`, `Phase3`… のように段階を明示
- 説明は「ユーザー価値 + 主要な入出力」まで（HOW は書かない）

---

## API 機能

| 機能 ID | API 名 | エンドポイント | メソッド | 説明 | レベル | 実装方法 | 優先度 | Phase | 記載者 |
| ------- | ------ | -------------- | -------- | ---- | ------ | -------- | ------ | ----- | ------ |
| API-001 | ログイン | /api/auth/login | POST | ユーザー認証を行い、セッションを発行する。 | B | Server API | High | MVP | |
| API-002 | ログアウト | /api/auth/logout | POST | セッションを破棄する。 | C | Server API | High | MVP | |
| API-003 | アンケート一覧取得 | /api/surveys | GET | アンケート一覧を取得する。ページネーション対応。 | B | Server API | High | MVP | |
| API-004 | アンケート作成 | /api/surveys | POST | 新規アンケートを作成する。 | B | Server API | High | MVP | |
| API-005 | アンケート詳細取得 | /api/surveys/:id | GET | アンケートの詳細情報を取得する。 | B | Server API | High | MVP | |
| API-006 | アンケート更新 | /api/surveys/:id | PUT | アンケートを更新する。 | B | Server API | High | MVP | |
| API-007 | アンケート削除 | /api/surveys/:id | DELETE | アンケートを削除する。 | C | Server API | High | MVP | |
| API-008 | 質問追加 | /api/surveys/:id/questions | POST | アンケートに質問を追加する。 | B | Server API | High | MVP | |
| API-009 | 質問更新 | /api/surveys/:id/questions/:qid | PUT | 質問を更新する。 | B | Server API | High | MVP | |
| API-010 | 質問削除 | /api/surveys/:id/questions/:qid | DELETE | 質問を削除する。 | C | Server API | High | MVP | |
| API-011 | 質問並び替え | /api/surveys/:id/questions/reorder | PUT | 質問の並び順を変更する。 | B | Server API | High | MVP | |
| API-012 | 配信設定更新 | /api/surveys/:id/publish | PUT | 配信ステータス・期間を更新する。 | B | Server API | High | MVP | |
| API-013 | 回答一覧取得 | /api/surveys/:id/responses | GET | アンケートの回答一覧を取得する。 | B | Server API | High | MVP | |
| API-014 | 回答詳細取得 | /api/surveys/:id/responses/:rid | GET | 個別回答の詳細を取得する。 | B | Server API | Medium | MVP | |
| API-015 | 回答エクスポート | /api/surveys/:id/responses/export | GET | 回答をCSV形式でエクスポートする。 | B | Server API | Medium | MVP | |
| API-016 | 集計データ取得 | /api/surveys/:id/analytics | GET | 回答の集計・分析データを取得する。 | A | Server API | Medium | Phase2 | |
| API-017 | レポート生成 | /api/surveys/:id/report | GET | PDF形式のレポートを生成する。 | A | Server API | Low | Phase2 | |
| API-018 | ユーザー一覧取得 | /api/users | GET | 管理ユーザー一覧を取得する。 | C | Server API | Low | Phase2 | |
| API-019 | ユーザー作成 | /api/users | POST | 管理ユーザーを作成する。 | B | Server API | Low | Phase2 | |

**レベル定義（例）**:
- **A**: 複雑なビジネスロジック/外部連携/非同期など
- **B**: 複数テーブル結合/集計/加工あり
- **C**: 単テーブルCRUD相当

---

## バッチ機能

| 機能 ID | バッチ名 | 実行タイミング | 説明 | 優先度 | Phase | 記載者 |
| ------- | -------- | -------------- | ---- | ------ | ----- | ------ |
| BT-001 | 配信期間チェック | 毎時 | 配信期間に基づきアンケートのステータスを自動更新。 | Medium | Phase2 | |
| BT-002 | 回答集計バッチ | 日次 | 大量回答の集計を事前計算しキャッシュ。 | Low | Phase2 | |

---

## 変更履歴

| 日付 | バージョン | 変更者 | 変更内容 |
| ---- | ---------- | ------ | -------- |
| 2025-12-20 | v1.0 | | 初版作成 |
