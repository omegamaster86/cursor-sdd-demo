# テーブル定義書（cursor-sdd-demo）

**目的**: DBの"契約"を明文化し、実装・レビュー・移行でブレないようにする。
**作成/更新タイミング**: `/design` の中盤〜終盤（ERDのエンティティが固まったら）。詳細は `.cursor/templates/artifacts/artifacts_rules.md`。

---

## 1. テーブル一覧

| テーブル物理名 | テーブル論理名 | 概要 | 種別 |
| -------------- | -------------- | ---- | ---- |
| m_users | ユーザー | システム利用者情報 | マスタ |
| t_sessions | セッション | ログインセッション情報 | トランザクション |
| m_categories | カテゴリ | 商品カテゴリ | マスタ |
| m_products | 商品 | 商品マスタ情報 | マスタ |
| m_locations | ロケーション | 倉庫・保管場所情報 | マスタ |
| t_receipts | 入庫 | 入庫トランザクション | トランザクション |
| t_shipments | 出庫 | 出庫トランザクション | トランザクション |
| t_transfers | 在庫移動 | 在庫移動トランザクション | トランザクション |
| t_inventory_balance | 在庫残高 | 商品・ロケーション別在庫残高 | トランザクション |
| t_audit_logs | 操作ログ | 全操作の監査ログ | トランザクション |

---

## 2. 共通カラム定義

> ここはプロジェクト標準を定義して、各テーブルの繰り返しを減らす。

**マスタテーブル共通カラム**

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK | | 自動採番 |
| created_at | 作成日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| updated_at | 更新日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| lock_no | ロック番号 | bigint | NOT NULL | 0 | 楽観ロック用 |
| is_active | 有効フラグ | boolean | NOT NULL | true | 論理削除用 |

**トランザクションテーブル共通カラム**

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK | | 自動採番 |
| created_at | 作成日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| lock_no | ロック番号 | bigint | NOT NULL | 0 | 楽観ロック用（在庫残高のみ） |

---

## 3. テーブル詳細定義

### 3.1 ユーザー（m_users）

**概要**: システム利用者の情報を管理。ログイン認証とアクセス制御に使用。

#### 3.1.1 テーブル定義

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK | | |
| login_id | ログインID | varchar(100) | NOT NULL, UK | | |
| password_hash | パスワードハッシュ | varchar(255) | NOT NULL | | bcryptでハッシュ化 |
| display_name | 表示名 | varchar(100) | NOT NULL | | |
| role | ロール | varchar(20) | NOT NULL | 'viewer' | admin/operator/viewer |
| is_active | 有効フラグ | boolean | NOT NULL | true | |
| created_at | 作成日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| updated_at | 更新日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| lock_no | ロック番号 | bigint | NOT NULL | 0 | |

**インデックス**

| インデックス名 | カラム | 種別 | 備考 |
| ------------ | ------ | ---- | ---- |
| idx_users_login_id | login_id | UNIQUE | ログイン時の高速検索 |
| idx_users_is_active | is_active | BTREE | 有効ユーザーの絞り込み |

**外部キー制約**

なし

#### 3.1.2 データ編集仕様

| カラム名 | [操作 1：作成] | [操作 2：更新] | [操作 3：無効化] |
| ------- | ------------- | ------------- | --------------- |
| login_id | 必須入力 | 変更不可 | - |
| password_hash | 必須入力 | 変更可（パスワード変更時） | - |
| display_name | 必須入力 | 変更可 | - |
| role | デフォルト'viewer' | 変更可（管理者のみ） | - |
| is_active | デフォルトtrue | 変更可（管理者のみ） | falseに設定 |

---

### 3.2 セッション（t_sessions）

**概要**: ログインセッション情報を管理。

#### 3.2.1 テーブル定義

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK | | |
| user_id | ユーザーID | bigint | NOT NULL, FK | | m_users.id |
| token | トークン | varchar(255) | NOT NULL, UK | | セッショントークン |
| expires_at | 有効期限 | timestamptz | NOT NULL | | |
| created_at | 作成日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |

**インデックス**

| インデックス名 | カラム | 種別 | 備考 |
| ------------ | ------ | ---- | ---- |
| idx_sessions_token | token | UNIQUE | セッション検証時の高速検索 |
| idx_sessions_user_id | user_id | BTREE | ユーザー別セッション取得 |
| idx_sessions_expires_at | expires_at | BTREE | 期限切れセッションのクリーンアップ |

**外部キー制約**

| FK 名 | 参照元カラム | 参照先テーブル | 参照先カラム | ON DELETE | ON UPDATE |
| ----- | ---------- | -------------- | ------------ | -------- | -------- |
| fk_sessions_user | user_id | m_users | id | CASCADE | CASCADE |

---

### 3.3 カテゴリ（m_categories）

**概要**: 商品カテゴリを管理。

#### 3.3.1 テーブル定義

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK | | |
| code | カテゴリコード | varchar(50) | NOT NULL, UK | | |
| name | カテゴリ名 | varchar(100) | NOT NULL | | |
| description | 説明 | text | NULL | | |
| is_active | 有効フラグ | boolean | NOT NULL | true | |
| created_at | 作成日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| updated_at | 更新日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| lock_no | ロック番号 | bigint | NOT NULL | 0 | |

**インデックス**

| インデックス名 | カラム | 種別 | 備考 |
| ------------ | ------ | ---- | ---- |
| idx_categories_code | code | UNIQUE | カテゴリコードでの検索 |
| idx_categories_is_active | is_active | BTREE | 有効カテゴリの絞り込み |

---

### 3.4 商品（m_products）

**概要**: 商品マスタ情報を管理。

#### 3.4.1 テーブル定義

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK | | |
| product_code | 商品コード | varchar(50) | NOT NULL, UK | | |
| name | 商品名 | varchar(200) | NOT NULL | | |
| category_id | カテゴリID | bigint | NOT NULL, FK | | m_categories.id |
| unit | 単位 | varchar(20) | NOT NULL | | pcs/box/kg/etc |
| unit_price | 単価 | decimal(15,2) | NULL | | |
| is_active | 有効フラグ | boolean | NOT NULL | true | |
| created_at | 作成日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| updated_at | 更新日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| lock_no | ロック番号 | bigint | NOT NULL | 0 | |

**インデックス**

| インデックス名 | カラム | 種別 | 備考 |
| ------------ | ------ | ---- | ---- |
| idx_products_code | product_code | UNIQUE | 商品コードでの検索 |
| idx_products_category | category_id | BTREE | カテゴリ別商品取得 |
| idx_products_name | name | BTREE | 商品名での検索 |
| idx_products_is_active | is_active | BTREE | 有効商品の絞り込み |

**外部キー制約**

| FK 名 | 参照元カラム | 参照先テーブル | 参照先カラム | ON DELETE | ON UPDATE |
| ----- | ---------- | -------------- | ------------ | -------- | -------- |
| fk_products_category | category_id | m_categories | id | RESTRICT | CASCADE |

---

### 3.5 ロケーション（m_locations）

**概要**: 倉庫・保管場所情報を管理。

#### 3.5.1 テーブル定義

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK | | |
| location_code | ロケーションコード | varchar(50) | NOT NULL, UK | | |
| name | ロケーション名 | varchar(100) | NOT NULL | | |
| address | 住所 | varchar(255) | NULL | | |
| location_type | ロケーション種別 | varchar(20) | NOT NULL | | warehouse/store/etc |
| is_active | 有効フラグ | boolean | NOT NULL | true | |
| created_at | 作成日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| updated_at | 更新日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| lock_no | ロック番号 | bigint | NOT NULL | 0 | |

**インデックス**

| インデックス名 | カラム | 種別 | 備考 |
| ------------ | ------ | ---- | ---- |
| idx_locations_code | location_code | UNIQUE | ロケーションコードでの検索 |
| idx_locations_is_active | is_active | BTREE | 有効ロケーションの絞り込み |

---

### 3.6 入庫（t_receipts）

**概要**: 入庫トランザクションを記録。

#### 3.6.1 テーブル定義

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK | | |
| product_id | 商品ID | bigint | NOT NULL, FK | | m_products.id |
| user_id | ユーザーID | bigint | NOT NULL, FK | | m_users.id |
| quantity | 数量 | integer | NOT NULL | | 正の整数のみ |
| receipt_date | 入庫日 | date | NOT NULL | | |
| remarks | 備考 | text | NULL | | |
| created_at | 作成日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| lock_no | ロック番号 | bigint | NOT NULL | 0 | 更新不可（追記のみ） |

**インデックス**

| インデックス名 | カラム | 種別 | 備考 |
| ------------ | ------ | ---- | ---- |
| idx_receipts_product | product_id | BTREE | 商品別入庫履歴取得 |
| idx_receipts_date | receipt_date | BTREE | 日付範囲での検索 |
| idx_receipts_created | created_at | BTREE | 作成日時での並び替え |

**外部キー制約**

| FK 名 | 参照元カラム | 参照先テーブル | 参照先カラム | ON DELETE | ON UPDATE |
| ----- | ---------- | -------------- | ------------ | -------- | -------- |
| fk_receipts_product | product_id | m_products | id | RESTRICT | CASCADE |
| fk_receipts_user | user_id | m_users | id | RESTRICT | CASCADE |

---

### 3.7 出庫（t_shipments）

**概要**: 出庫トランザクションを記録。

#### 3.7.1 テーブル定義

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK | | |
| product_id | 商品ID | bigint | NOT NULL, FK | | m_products.id |
| user_id | ユーザーID | bigint | NOT NULL, FK | | m_users.id |
| quantity | 数量 | integer | NOT NULL | | 正の整数のみ |
| shipment_date | 出庫日 | date | NOT NULL | | |
| destination | 出庫先 | varchar(255) | NULL | | |
| remarks | 備考 | text | NULL | | |
| created_at | 作成日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| lock_no | ロック番号 | bigint | NOT NULL | 0 | 更新不可（追記のみ） |

**インデックス**

| インデックス名 | カラム | 種別 | 備考 |
| ------------ | ------ | ---- | ---- |
| idx_shipments_product | product_id | BTREE | 商品別出庫履歴取得 |
| idx_shipments_date | shipment_date | BTREE | 日付範囲での検索 |
| idx_shipments_created | created_at | BTREE | 作成日時での並び替え |

**外部キー制約**

| FK 名 | 参照元カラム | 参照先テーブル | 参照先カラム | ON DELETE | ON UPDATE |
| ----- | ---------- | -------------- | ------------ | -------- | -------- |
| fk_shipments_product | product_id | m_products | id | RESTRICT | CASCADE |
| fk_shipments_user | user_id | m_users | id | RESTRICT | CASCADE |

---

### 3.8 在庫移動（t_transfers）

**概要**: 在庫移動トランザクションを記録。

#### 3.8.1 テーブル定義

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK | | |
| product_id | 商品ID | bigint | NOT NULL, FK | | m_products.id |
| from_location_id | 移動元ロケーションID | bigint | NOT NULL, FK | | m_locations.id |
| to_location_id | 移動先ロケーションID | bigint | NOT NULL, FK | | m_locations.id |
| user_id | ユーザーID | bigint | NOT NULL, FK | | m_users.id |
| quantity | 数量 | integer | NOT NULL | | 正の整数のみ |
| transfer_date | 移動日 | date | NOT NULL | | |
| remarks | 備考 | text | NULL | | |
| created_at | 作成日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| lock_no | ロック番号 | bigint | NOT NULL | 0 | 更新不可（追記のみ） |

**インデックス**

| インデックス名 | カラム | 種別 | 備考 |
| ------------ | ------ | ---- | ---- |
| idx_transfers_product | product_id | BTREE | 商品別移動履歴取得 |
| idx_transfers_from_location | from_location_id | BTREE | 移動元別履歴取得 |
| idx_transfers_to_location | to_location_id | BTREE | 移動先別履歴取得 |
| idx_transfers_date | transfer_date | BTREE | 日付範囲での検索 |

**外部キー制約**

| FK 名 | 参照元カラム | 参照先テーブル | 参照先カラム | ON DELETE | ON UPDATE |
| ----- | ---------- | -------------- | ------------ | -------- | -------- |
| fk_transfers_product | product_id | m_products | id | RESTRICT | CASCADE |
| fk_transfers_from_location | from_location_id | m_locations | id | RESTRICT | CASCADE |
| fk_transfers_to_location | to_location_id | m_locations | id | RESTRICT | CASCADE |
| fk_transfers_user | user_id | m_users | id | RESTRICT | CASCADE |

---

### 3.9 在庫残高（t_inventory_balance）

**概要**: 商品・ロケーション別の在庫残高を管理。

#### 3.9.1 テーブル定義

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK | | |
| product_id | 商品ID | bigint | NOT NULL, FK | | m_products.id |
| location_id | ロケーションID | bigint | NOT NULL, FK | | m_locations.id |
| quantity | 数量 | integer | NOT NULL | 0 | 0以上の整数 |
| updated_at | 更新日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| lock_no | ロック番号 | bigint | NOT NULL | 0 | 楽観ロック用 |

**インデックス**

| インデックス名 | カラム | 種別 | 備考 |
| ------------ | ------ | ---- | ---- |
| idx_inventory_product_location | (product_id, location_id) | UNIQUE | 商品・ロケーション別在庫取得 |
| idx_inventory_product | product_id | BTREE | 商品別在庫集計 |
| idx_inventory_location | location_id | BTREE | ロケーション別在庫集計 |

**外部キー制約**

| FK 名 | 参照元カラム | 参照先テーブル | 参照先カラム | ON DELETE | ON UPDATE |
| ----- | ---------- | -------------- | ------------ | -------- | -------- |
| fk_inventory_product | product_id | m_products | id | CASCADE | CASCADE |
| fk_inventory_location | location_id | m_locations | id | CASCADE | CASCADE |

---

### 3.10 操作ログ（t_audit_logs）

**概要**: すべての操作の監査ログを記録。

#### 3.10.1 テーブル定義

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK | | |
| user_id | ユーザーID | bigint | NULL, FK | | m_users.id（削除時はNULL） |
| action | アクション | varchar(50) | NOT NULL | | login/logout/create/update/delete |
| table_name | テーブル名 | varchar(100) | NULL | | 操作対象テーブル |
| record_id | レコードID | bigint | NULL | | 操作対象レコードID |
| changes | 変更内容 | jsonb | NULL | | 変更前後の値 |
| created_at | 作成日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |

**インデックス**

| インデックス名 | カラム | 種別 | 備考 |
| ------------ | ------ | ---- | ---- |
| idx_audit_user | user_id | BTREE | ユーザー別ログ取得 |
| idx_audit_action | action | BTREE | アクション別ログ取得 |
| idx_audit_table | table_name | BTREE | テーブル別ログ取得 |
| idx_audit_created | created_at | BTREE | 日時範囲での検索 |

**外部キー制約**

| FK 名 | 参照元カラム | 参照先テーブル | 参照先カラム | ON DELETE | ON UPDATE |
| ----- | ---------- | -------------- | ------------ | -------- | -------- |
| fk_audit_user | user_id | m_users | id | SET NULL | CASCADE |

---

## 変更履歴

| 日付 | バージョン | 変更者 | 変更内容 |
| ---- | ---------- | ------ | -------- |
| 2025-12-15 | v1.0 |  | 初版作成 |
