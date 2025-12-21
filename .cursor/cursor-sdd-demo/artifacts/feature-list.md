# 機能一覧（cursor-sdd-demo）

**目的**: プロダクトのスコープ（MVP/Phase）と、UI/API/バッチの一覧を"合意の一次ソース"として固定する。
**作成/更新タイミング**: `/requirements` の直後（要件ドラフトが出たらまず作る）。詳細は `.cursor/templates/artifacts/artifacts_rules.md`。

---

## 画面機能

| 機能 ID | 画面名 | 説明 | 優先度 | Phase | 記載者 |
| ------- | ------ | ---- | ------ | ----- | ------ |
| UI-001  | ログイン | 管理者認証を行うログイン画面 | High | MVP | |
| UI-002  | ダッシュボード | アクティブなアンケート数、回答数などのサマリーを表示 | High | MVP | |
| UI-003  | アンケート一覧 | 作成済みアンケートの一覧表示・検索・フィルタリング | High | MVP | |
| UI-004  | アンケート作成/編集 | アンケートの新規作成・編集フォーム | High | MVP | |
| UI-005  | 質問項目編集 | アンケート内の質問項目を追加・編集・並び替え | High | MVP | |
| UI-006  | 配信設定 | アンケートの公開状態・配信期間の設定 | High | MVP | |
| UI-007  | 回答集計 | 回答結果のグラフ表示・サマリー | High | MVP | |
| UI-008  | 回答一覧 | 個別回答の一覧表示・詳細確認 | Medium | MVP | |

**記載ルール**
- Phase は `MVP`, `Phase2`, `Phase3`… のように段階を明示
- 説明は「ユーザー価値 + 主要な入出力」まで（HOW は書かない）

---

## API 機能

| 機能 ID | API 名 | エンドポイント | メソッド | 説明 | レベル | 実装方法 | 優先度 | Phase | 記載者 |
| ------- | ------ | -------------- | -------- | ---- | ------ | -------- | ------ | ----- | ------ |
| API-001 | ログイン | /api/auth/login | POST | 管理者認証を行う | B | Server API | High | MVP | |
| API-002 | ログアウト | /api/auth/logout | POST | セッションを終了する | C | Server API | High | MVP | |
| API-003 | アンケート一覧取得 | /api/surveys | GET | アンケート一覧を取得する | B | Server API | High | MVP | |
| API-004 | アンケート作成 | /api/surveys | POST | 新規アンケートを作成する | B | Server API | High | MVP | |
| API-005 | アンケート詳細取得 | /api/surveys/:id | GET | アンケート詳細を取得する | B | Server API | High | MVP | |
| API-006 | アンケート更新 | /api/surveys/:id | PUT | アンケートを更新する | B | Server API | High | MVP | |
| API-007 | アンケート削除 | /api/surveys/:id | DELETE | アンケートを削除する | C | Server API | High | MVP | |
| API-008 | 質問一覧取得 | /api/surveys/:id/questions | GET | アンケートの質問一覧を取得する | B | Server API | High | MVP | |
| API-009 | 質問追加 | /api/surveys/:id/questions | POST | 質問を追加する | B | Server API | High | MVP | |
| API-010 | 質問更新 | /api/surveys/:id/questions/:qid | PUT | 質問を更新する | B | Server API | High | MVP | |
| API-011 | 質問削除 | /api/surveys/:id/questions/:qid | DELETE | 質問を削除する | C | Server API | High | MVP | |
| API-012 | 質問並び替え | /api/surveys/:id/questions/reorder | PUT | 質問の順序を変更する | B | Server API | Medium | MVP | |
| API-013 | 回答集計取得 | /api/surveys/:id/responses/summary | GET | 回答の集計データを取得する | A | Server API | High | MVP | |
| API-014 | 回答一覧取得 | /api/surveys/:id/responses | GET | 個別回答一覧を取得する | B | Server API | Medium | MVP | |
| API-015 | CSVエクスポート | /api/surveys/:id/responses/export | GET | 回答データをCSV形式で出力する | A | Server API | Medium | MVP | |
| API-016 | ダッシュボード取得 | /api/dashboard | GET | ダッシュボード用サマリーを取得する | B | Server API | High | MVP | |

**レベル定義（例）**:
- **A**: 複雑なビジネスロジック/外部連携/非同期など
- **B**: 複数テーブル結合/集計/加工あり
- **C**: 単テーブルCRUD相当

---

## バッチ機能

| 機能 ID | バッチ名 | 実行タイミング | 説明 | 優先度 | Phase | 記載者 |
| ------- | -------- | -------------- | ---- | ------ | ----- | ------ |
| BT-001  | 配信期間チェック | 毎日0:00 | 配信期間を過ぎたアンケートを自動で非公開にする | Low | Phase2 | |
| BT-002  | セッションクリーンアップ | 毎日3:00 | 期限切れセッションを削除する | Low | Phase2 | |

---

## 変更履歴

| 日付 | バージョン | 変更者 | 変更内容 |
| ---- | ---------- | ------ | -------- |
| 2024-12-21 | v1.0 | | 初版作成 |
