# 機能一覧（cursor-sdd-demo）

**目的**: プロダクトのスコープ（MVP/Phase）と、UI/API/バッチの一覧を"合意の一次ソース"として固定する。
**作成/更新タイミング**: `/requirements` の直後（要件ドラフトが出たらまず作る）。詳細は `.cursor/templates/artifacts/artifacts_rules.md`。

---

## 1. 画面機能

| 機能 ID | 画面名 | 説明 | 優先度 | Phase | 記載者 |
| ------- | ------ | ---- | ------ | ----- | ------ |
| UI-001  | 在庫一覧 | SKU × ロケーション単位で在庫を一覧表示。検索/絞り込み/CSV出力を提供。 | High | MVP | |
| UI-002  | 商品マスタ管理 | 商品（SKU）の登録・編集・削除を行う。 | High | MVP | |
| UI-003  | ロケーションマスタ管理 | 倉庫・エリア・棚番の登録・編集・削除を行う。 | High | MVP | |
| UI-004  | 入庫登録 | 入庫伝票の作成と確定を行う。 | High | MVP | |
| UI-005  | 出庫登録 | 出庫伝票の作成と確定を行う。 | High | MVP | |
| UI-006  | 入出庫履歴 | 過去の入出庫履歴を検索・参照する。 | Medium | MVP | |
| UI-007  | 棚卸し管理 | 棚卸しの開始、実在庫入力、差異確認、確定を行う。 | Medium | Phase2 | |

**記載ルール**
- Phase は `MVP`, `Phase2`, `Phase3`… のように段階を明示
- 説明は「ユーザー価値 + 主要な入出力」まで（HOW は書かない）

---

## 2. API 機能

| 機能 ID | API 名 | エンドポイント | メソッド | 説明 | レベル | 実装方法 | 優先度 | Phase | 記載者 |
| ------- | ------ | -------------- | -------- | ---- | ------ | -------- | ------ | ----- | ------ |
| API-001 | 在庫一覧取得 | /api/v1/stocks | GET | 在庫残を一覧取得する。検索条件対応。 | B | Server API | High | MVP | |
| API-002 | 在庫CSVエクスポート | /api/v1/stocks/export | GET | 在庫一覧をCSV形式で出力する。 | C | Server API | Medium | MVP | |
| API-003 | 商品一覧取得 | /api/v1/products | GET | 商品マスタを一覧取得する。 | C | Server API | High | MVP | |
| API-004 | 商品登録 | /api/v1/products | POST | 商品を新規登録する。 | C | Server API | High | MVP | |
| API-005 | 商品更新 | /api/v1/products/{id} | PUT | 商品情報を更新する。 | C | Server API | High | MVP | |
| API-006 | ロケーション一覧取得 | /api/v1/locations | GET | ロケーションマスタを一覧取得する。 | C | Server API | High | MVP | |
| API-007 | ロケーション登録 | /api/v1/locations | POST | ロケーションを新規登録する。 | C | Server API | High | MVP | |
| API-008 | 入庫伝票作成 | /api/v1/receipts | POST | 入庫伝票を作成する。 | B | Server API | High | MVP | |
| API-009 | 入庫確定 | /api/v1/receipts/{id}/confirm | POST | 入庫を確定し在庫を増加させる。 | A | Server API | High | MVP | |
| API-010 | 出庫伝票作成 | /api/v1/shipments | POST | 出庫伝票を作成する。 | B | Server API | High | MVP | |
| API-011 | 出庫確定 | /api/v1/shipments/{id}/confirm | POST | 出庫を確定し在庫を減少させる。 | A | Server API | High | MVP | |
| API-012 | 入出庫履歴取得 | /api/v1/transactions | GET | 入出庫履歴を検索・取得する。 | B | Server API | Medium | MVP | |
| API-013 | 棚卸し開始 | /api/v1/inventories | POST | 棚卸しを開始し帳簿在庫を固定する。 | A | Server API | Medium | Phase2 | |
| API-014 | 棚卸し実績入力 | /api/v1/inventories/{id}/counts | POST | 実在庫数量を入力する。 | B | Server API | Medium | Phase2 | |
| API-015 | 棚卸し確定 | /api/v1/inventories/{id}/confirm | POST | 棚卸しを確定し在庫調整を反映する。 | A | Server API | Medium | Phase2 | |

**レベル定義（例）**:
- **A**: 複雑なビジネスロジック/外部連携/非同期など
- **B**: 複数テーブル結合/集計/加工あり
- **C**: 単テーブルCRUD相当

---

## 3. バッチ機能

| 機能 ID | バッチ名 | 実行タイミング | 説明 | 優先度 | Phase | 記載者 |
| ------- | -------- | -------------- | ---- | ------ | ----- | ------ |
| BT-001  | 安全在庫アラート | 毎日 9:00 | 安全在庫を下回る商品を検出し通知する。 | Low | Phase2 | |

---

## 変更履歴

| 日付 | バージョン | 変更者 | 変更内容 |
| ---- | ---------- | ------ | -------- |
| 2025-12-14 | v1.0 | | 初版作成 |
