# テーブル定義書（cursor-sdd-demo）

**目的**: DBの"契約"を明文化し、実装・レビュー・移行でブレないようにする。
**作成/更新タイミング**: `/design` の中盤〜終盤（ERDのエンティティが固まったら）。詳細は `.cursor/templates/artifacts/artifacts_rules.md`。

---

## 1. テーブル一覧

| テーブル物理名 | テーブル論理名 | 概要 | 種別 |
| -------------- | -------------- | ---- | ---- |
| m_product | 商品マスタ | 商品（SKU）情報 | マスタ |
| m_location | ロケーションマスタ | 倉庫・エリア・棚番情報 | マスタ |
| t_stock_balance | 在庫残 | SKU×ロケーション単位の在庫数量 | トランザクション |
| t_receipt | 入庫伝票 | 入庫伝票ヘッダ | トランザクション |
| t_receipt_detail | 入庫伝票明細 | 入庫伝票の明細行 | トランザクション |
| t_shipment | 出庫伝票 | 出庫伝票ヘッダ | トランザクション |
| t_shipment_detail | 出庫伝票明細 | 出庫伝票の明細行 | トランザクション |
| t_transaction_history | 取引履歴 | 入出庫・調整の履歴 | 履歴 |
| t_inventory | 棚卸し | 棚卸しヘッダ | トランザクション |
| t_inventory_count | 棚卸しカウント | 棚卸しの明細行 | トランザクション |

---

## 2. 共通カラム定義

> ここはプロジェクト標準を定義して、各テーブルの繰り返しを減らす。

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK | GENERATED ALWAYS AS IDENTITY | |
| created_at | 作成日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| updated_at | 更新日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |

---

## 3. テーブル詳細定義

### 3.1 商品マスタ（m_product）

**概要**: 商品（SKU）の基本情報を管理するマスタテーブル

#### 3.1.1 テーブル定義

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK | GENERATED ALWAYS AS IDENTITY | |
| sku_code | SKUコード | varchar(50) | NOT NULL, UNIQUE | | 商品識別コード |
| name | 商品名 | varchar(200) | NOT NULL | | |
| unit | 単位 | varchar(20) | NOT NULL | 'pcs' | pcs/box/kg等 |
| category | カテゴリ | varchar(100) | | | |
| safety_stock | 安全在庫数 | integer | | 0 | 安全在庫警告用 |
| is_active | 有効フラグ | boolean | NOT NULL | true | 論理削除用 |
| created_at | 作成日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| updated_at | 更新日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |

**インデックス**

| インデックス名 | カラム | 種別 | 備考 |
| ------------ | ------ | ---- | ---- |
| idx_m_product_sku_code | sku_code | UNIQUE | SKUコード検索用 |
| idx_m_product_name | name | BTREE | 商品名検索用 |
| idx_m_product_is_active | is_active | BTREE | 有効商品絞り込み用 |

---

### 3.2 ロケーションマスタ（m_location）

**概要**: 倉庫内のロケーション（保管場所）情報を管理するマスタテーブル

#### 3.2.1 テーブル定義

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK | GENERATED ALWAYS AS IDENTITY | |
| location_code | ロケーションコード | varchar(50) | NOT NULL, UNIQUE | | ロケーション識別コード |
| warehouse | 倉庫 | varchar(100) | NOT NULL | | 倉庫名 |
| area | エリア | varchar(50) | | | エリア名 |
| shelf | 棚番 | varchar(50) | | | 棚番号 |
| is_active | 有効フラグ | boolean | NOT NULL | true | 論理削除用 |
| created_at | 作成日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| updated_at | 更新日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |

**インデックス**

| インデックス名 | カラム | 種別 | 備考 |
| ------------ | ------ | ---- | ---- |
| idx_m_location_code | location_code | UNIQUE | ロケーションコード検索用 |
| idx_m_location_warehouse | warehouse | BTREE | 倉庫絞り込み用 |

---

### 3.3 在庫残（t_stock_balance）

**概要**: 商品×ロケーション単位の現在在庫数量を管理

#### 3.3.1 テーブル定義

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK | GENERATED ALWAYS AS IDENTITY | |
| product_id | 商品ID | bigint | NOT NULL, FK | | m_product.id |
| location_id | ロケーションID | bigint | NOT NULL, FK | | m_location.id |
| quantity | 在庫数量 | integer | NOT NULL | 0 | |
| created_at | 作成日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| updated_at | 更新日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |

**インデックス**

| インデックス名 | カラム | 種別 | 備考 |
| ------------ | ------ | ---- | ---- |
| uk_stock_balance_product_location | product_id, location_id | UNIQUE | 商品×ロケーションで一意 |
| idx_stock_balance_product | product_id | BTREE | 商品別検索用 |
| idx_stock_balance_location | location_id | BTREE | ロケーション別検索用 |

**外部キー制約**

| FK 名 | 参照元カラム | 参照先テーブル | 参照先カラム | ON DELETE | ON UPDATE |
| ----- | ---------- | -------------- | ------------ | -------- | -------- |
| fk_stock_balance_product | product_id | m_product | id | RESTRICT | CASCADE |
| fk_stock_balance_location | location_id | m_location | id | RESTRICT | CASCADE |

---

### 3.4 入庫伝票（t_receipt）

**概要**: 入庫伝票のヘッダ情報

#### 3.4.1 テーブル定義

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK | GENERATED ALWAYS AS IDENTITY | |
| receipt_no | 入庫番号 | varchar(50) | NOT NULL, UNIQUE | | 入庫伝票番号 |
| status | ステータス | varchar(20) | NOT NULL | 'draft' | draft/confirmed |
| receipt_date | 入庫日 | timestamptz | NOT NULL | | |
| remarks | 備考 | text | | | |
| confirmed_at | 確定日時 | timestamptz | | | |
| created_at | 作成日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| updated_at | 更新日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |

**インデックス**

| インデックス名 | カラム | 種別 | 備考 |
| ------------ | ------ | ---- | ---- |
| idx_receipt_no | receipt_no | UNIQUE | 入庫番号検索用 |
| idx_receipt_date | receipt_date | BTREE | 日付検索用 |
| idx_receipt_status | status | BTREE | ステータス絞り込み用 |

---

### 3.5 入庫伝票明細（t_receipt_detail）

**概要**: 入庫伝票の明細行

#### 3.5.1 テーブル定義

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK | GENERATED ALWAYS AS IDENTITY | |
| receipt_id | 入庫伝票ID | bigint | NOT NULL, FK | | t_receipt.id |
| product_id | 商品ID | bigint | NOT NULL, FK | | m_product.id |
| location_id | ロケーションID | bigint | NOT NULL, FK | | m_location.id |
| quantity | 数量 | integer | NOT NULL | | |
| created_at | 作成日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| updated_at | 更新日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |

**外部キー制約**

| FK 名 | 参照元カラム | 参照先テーブル | 参照先カラム | ON DELETE | ON UPDATE |
| ----- | ---------- | -------------- | ------------ | -------- | -------- |
| fk_receipt_detail_receipt | receipt_id | t_receipt | id | CASCADE | CASCADE |
| fk_receipt_detail_product | product_id | m_product | id | RESTRICT | CASCADE |
| fk_receipt_detail_location | location_id | m_location | id | RESTRICT | CASCADE |

---

### 3.6 出庫伝票（t_shipment）

**概要**: 出庫伝票のヘッダ情報

#### 3.6.1 テーブル定義

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK | GENERATED ALWAYS AS IDENTITY | |
| shipment_no | 出庫番号 | varchar(50) | NOT NULL, UNIQUE | | 出庫伝票番号 |
| status | ステータス | varchar(20) | NOT NULL | 'draft' | draft/confirmed |
| shipment_date | 出庫日 | timestamptz | NOT NULL | | |
| remarks | 備考 | text | | | |
| confirmed_at | 確定日時 | timestamptz | | | |
| created_at | 作成日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| updated_at | 更新日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |

**インデックス**

| インデックス名 | カラム | 種別 | 備考 |
| ------------ | ------ | ---- | ---- |
| idx_shipment_no | shipment_no | UNIQUE | 出庫番号検索用 |
| idx_shipment_date | shipment_date | BTREE | 日付検索用 |
| idx_shipment_status | status | BTREE | ステータス絞り込み用 |

---

### 3.7 出庫伝票明細（t_shipment_detail）

**概要**: 出庫伝票の明細行

#### 3.7.1 テーブル定義

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK | GENERATED ALWAYS AS IDENTITY | |
| shipment_id | 出庫伝票ID | bigint | NOT NULL, FK | | t_shipment.id |
| product_id | 商品ID | bigint | NOT NULL, FK | | m_product.id |
| location_id | ロケーションID | bigint | NOT NULL, FK | | m_location.id |
| quantity | 数量 | integer | NOT NULL | | |
| created_at | 作成日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| updated_at | 更新日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |

**外部キー制約**

| FK 名 | 参照元カラム | 参照先テーブル | 参照先カラム | ON DELETE | ON UPDATE |
| ----- | ---------- | -------------- | ------------ | -------- | -------- |
| fk_shipment_detail_shipment | shipment_id | t_shipment | id | CASCADE | CASCADE |
| fk_shipment_detail_product | product_id | m_product | id | RESTRICT | CASCADE |
| fk_shipment_detail_location | location_id | m_location | id | RESTRICT | CASCADE |

---

### 3.8 取引履歴（t_transaction_history）

**概要**: 入出庫・在庫調整の履歴を記録（追記のみ、監査用）

#### 3.8.1 テーブル定義

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK | GENERATED ALWAYS AS IDENTITY | |
| product_id | 商品ID | bigint | NOT NULL, FK | | m_product.id |
| location_id | ロケーションID | bigint | NOT NULL, FK | | m_location.id |
| transaction_type | 取引種別 | varchar(20) | NOT NULL | | receipt/shipment/adjustment |
| quantity | 数量 | integer | NOT NULL | | 入庫:+, 出庫:- |
| reference_id | 参照ID | bigint | | | 伝票ID |
| reference_type | 参照種別 | varchar(20) | | | receipt/shipment/inventory |
| remarks | 備考 | text | | | |
| transaction_date | 取引日時 | timestamptz | NOT NULL | | |
| created_at | 作成日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |

**インデックス**

| インデックス名 | カラム | 種別 | 備考 |
| ------------ | ------ | ---- | ---- |
| idx_transaction_product | product_id | BTREE | 商品別履歴検索用 |
| idx_transaction_location | location_id | BTREE | ロケーション別履歴検索用 |
| idx_transaction_date | transaction_date | BTREE | 日付範囲検索用 |
| idx_transaction_type | transaction_type | BTREE | 取引種別絞り込み用 |

**外部キー制約**

| FK 名 | 参照元カラム | 参照先テーブル | 参照先カラム | ON DELETE | ON UPDATE |
| ----- | ---------- | -------------- | ------------ | -------- | -------- |
| fk_transaction_history_product | product_id | m_product | id | RESTRICT | CASCADE |
| fk_transaction_history_location | location_id | m_location | id | RESTRICT | CASCADE |

---

### 3.9 棚卸し（t_inventory）

**概要**: 棚卸しのヘッダ情報

#### 3.9.1 テーブル定義

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK | GENERATED ALWAYS AS IDENTITY | |
| inventory_no | 棚卸番号 | varchar(50) | NOT NULL, UNIQUE | | 棚卸番号 |
| status | ステータス | varchar(20) | NOT NULL | 'in_progress' | in_progress/confirmed |
| inventory_date | 棚卸日 | timestamptz | NOT NULL | | |
| remarks | 備考 | text | | | |
| confirmed_at | 確定日時 | timestamptz | | | |
| created_at | 作成日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| updated_at | 更新日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |

---

### 3.10 棚卸しカウント（t_inventory_count）

**概要**: 棚卸しの明細行（帳簿在庫と実在庫の記録）

#### 3.10.1 テーブル定義

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK | GENERATED ALWAYS AS IDENTITY | |
| inventory_id | 棚卸ID | bigint | NOT NULL, FK | | t_inventory.id |
| product_id | 商品ID | bigint | NOT NULL, FK | | m_product.id |
| location_id | ロケーションID | bigint | NOT NULL, FK | | m_location.id |
| book_quantity | 帳簿在庫 | integer | NOT NULL | | 棚卸開始時の在庫 |
| actual_quantity | 実在庫 | integer | | | カウント入力値 |
| difference | 差異 | integer | | | actual - book |
| difference_reason | 差異理由 | text | | | |
| created_at | 作成日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| updated_at | 更新日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |

**外部キー制約**

| FK 名 | 参照元カラム | 参照先テーブル | 参照先カラム | ON DELETE | ON UPDATE |
| ----- | ---------- | -------------- | ------------ | -------- | -------- |
| fk_inventory_count_inventory | inventory_id | t_inventory | id | CASCADE | CASCADE |
| fk_inventory_count_product | product_id | m_product | id | RESTRICT | CASCADE |
| fk_inventory_count_location | location_id | m_location | id | RESTRICT | CASCADE |

---

## 変更履歴

| 日付 | バージョン | 変更者 | 変更内容 |
| ---- | ---------- | ------ | -------- |
| 2025-12-14 | v1.0 | | 初版作成 |
