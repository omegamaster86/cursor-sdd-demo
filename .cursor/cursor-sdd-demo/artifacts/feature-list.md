# 機能一覧（cursor-sdd-demo）

**目的**: プロダクトのスコープ（MVP/Phase）と、UI/API/バッチの一覧を"合意の一次ソース"として固定する。
**作成/更新タイミング**: `/requirements` の直後（要件ドラフトが出たらまず作る）。詳細は `.cursor/templates/artifacts/artifacts_rules.md`。

---

## 1. 画面機能

| 機能 ID | 画面名 | 説明 | 優先度 | Phase | 記載者 |
| ------- | ------ | ---- | ------ | ----- | ------ |
| UI-001  | 商品マスタ一覧 | 商品情報を一覧表示。検索・絞り込み・編集・削除を提供。 | High | MVP | |
| UI-002  | 商品マスタ登録/編集 | 商品コード、商品名、カテゴリ、単位を登録・編集。 | High | MVP | |
| UI-003  | 入庫登録 | 商品選択、数量入力、入庫日、備考を入力し入庫を記録。 | High | MVP | |
| UI-004  | 入庫履歴一覧 | 入庫履歴を日時、商品、数量、担当者とともに表示。 | Medium | MVP | |
| UI-005  | 出庫登録 | 商品選択、数量入力、出庫日、出庫先、備考を入力し出庫を記録。 | High | MVP | |
| UI-006  | 出庫履歴一覧 | 出庫履歴を日時、商品、数量、出庫先、担当者とともに表示。 | Medium | MVP | |
| UI-007  | 在庫照会 | 商品ごとの現在在庫数を一覧表示。検索・絞り込み・並び替え・CSV出力を提供。 | High | MVP | |
| UI-008  | 在庫移動登録 | 商品、移動元、移動先、数量、移動日を入力し在庫移動を記録。 | Medium | MVP | |
| UI-009  | 在庫移動履歴一覧 | 在庫移動履歴を一覧表示。 | Low | MVP | |
| UI-010  | ログイン | ユーザーIDとパスワードによるログイン画面。 | High | MVP | |
| UI-011  | ダッシュボード | 総在庫数、在庫金額、在庫切れ商品数、カテゴリ別在庫数グラフ、在庫アラートを表示。 | Medium | MVP | |
| UI-012  | レポート生成 | 期間を指定して入出庫レポートを生成。PDF出力を提供。 | Low | Phase2 | |

**記載ルール**
- Phase は `MVP`, `Phase2`, `Phase3`… のように段階を明示
- 説明は「ユーザー価値 + 主要な入出力」まで（HOW は書かない）

---

## 2. API 機能

| 機能 ID | API 名 | エンドポイント | メソッド | 説明 | レベル | 実装方法 | 優先度 | Phase | 記載者 |
| ------- | ------ | -------------- | -------- | ---- | ------ | -------- | ------ | ----- | ------ |
| API-001 | 商品一覧取得 | /api/products | GET | 商品マスタを一覧取得。検索・絞り込みパラメータをサポート。 | C | Server API | High | MVP | |
| API-002 | 商品詳細取得 | /api/products/:id | GET | 指定した商品の詳細情報を取得。 | C | Server API | High | MVP | |
| API-003 | 商品登録 | /api/products | POST | 新規商品を登録。 | C | Server API | High | MVP | |
| API-004 | 商品更新 | /api/products/:id | PUT | 既存商品を更新。 | C | Server API | High | MVP | |
| API-005 | 商品削除 | /api/products/:id | DELETE | 指定した商品を削除。 | C | Server API | Medium | MVP | |
| API-006 | 入庫登録 | /api/receipts | POST | 入庫を記録し在庫残高を増加。 | B | Server API | High | MVP | |
| API-007 | 入庫履歴取得 | /api/receipts | GET | 入庫履歴を一覧取得。 | B | Server API | Medium | MVP | |
| API-008 | 出庫登録 | /api/shipments | POST | 出庫を記録し在庫残高を減少。在庫不足チェックを実施。 | B | Server API | High | MVP | |
| API-009 | 出庫履歴取得 | /api/shipments | GET | 出庫履歴を一覧取得。 | B | Server API | Medium | MVP | |
| API-010 | 在庫一覧取得 | /api/inventory | GET | 商品ごとの現在在庫数を一覧取得。検索・絞り込み・並び替えをサポート。 | B | Server API | High | MVP | |
| API-011 | 在庫履歴取得 | /api/inventory/:productId/history | GET | 指定した商品の入出庫履歴を取得。 | B | Server API | Medium | MVP | |
| API-012 | 在庫移動登録 | /api/transfers | POST | 在庫移動を記録。移動元の在庫を減少し移動先の在庫を増加。 | B | Server API | Medium | MVP | |
| API-013 | 在庫移動履歴取得 | /api/transfers | GET | 在庫移動履歴を一覧取得。 | B | Server API | Low | MVP | |
| API-014 | ログイン | /api/auth/login | POST | ユーザー認証を実施しセッションを確立。 | B | Server API | High | MVP | |
| API-015 | ログアウト | /api/auth/logout | POST | セッションを破棄しログアウト。 | C | Server API | High | MVP | |
| API-016 | ダッシュボード情報取得 | /api/dashboard | GET | 総在庫数、在庫金額、在庫切れ商品数、カテゴリ別在庫数、在庫アラートを取得。 | B | Server API | Medium | MVP | |
| API-017 | レポート生成 | /api/reports | POST | 期間を指定して入出庫レポートを生成。 | B | Server API | Low | Phase2 | |
| API-018 | CSV出力 | /api/inventory/export | GET | 在庫一覧をCSV形式で出力。 | C | Server API | Medium | MVP | |

**レベル定義（例）**:
- **A**: 複雑なビジネスロジック/外部連携/非同期など
- **B**: 複数テーブル結合/集計/加工あり
- **C**: 単テーブルCRUD相当

---

## 3. バッチ機能

| 機能 ID | バッチ名 | 実行タイミング | 説明 | 優先度 | Phase | 記載者 |
| ------- | -------- | -------------- | ---- | ------ | ----- | ------ |
| BT-001  | 在庫集計 | 日次（深夜） | 入出庫履歴から在庫残高を再集計し整合性を確保。 | Medium | MVP | |
| BT-002  | 在庫アラート通知 | 日次（朝） | 在庫切れや過剰在庫をチェックし管理者に通知。 | Low | Phase2 | |
| BT-003  | 操作ログアーカイブ | 月次 | 古い操作ログをアーカイブし、パフォーマンスを維持。 | Low | Phase2 | |

---

## 変更履歴

| 日付 | バージョン | 変更者 | 変更内容 |
| ---- | ---------- | ------ | -------- |
| 2025-12-15 | v1.0 |  | 初版作成 |
