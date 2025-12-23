# テーブル定義書（demo）

**目的**: DBの"契約"を明文化し、実装・レビュー・移行でブレないようにする。
**作成/更新タイミング**: `/design` の中盤〜終盤（ERDのエンティティが固まったら）。

---

## テーブル一覧

| テーブル物理名 | テーブル論理名 | 概要 | 種別 |
| -------------- | -------------- | ---- | ---- |
| categories | カテゴリ | 問題のカテゴリマスタ | マスタ |
| questions | 問題 | 問題マスタ | マスタ |
| question_options | 問題選択肢 | 問題の選択肢 | トランザクション |
| users | ユーザー | 学習者情報 | マスタ |
| answers | 回答履歴 | ユーザーの回答記録 | トランザクション |

---

## 共通カラム定義

> ここはプロジェクト標準を定義して、各テーブルの繰り返しを減らす。

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK, AUTO_INCREMENT | | |
| created_at | 作成日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| updated_at | 更新日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |

---

## テーブル詳細定義

### カテゴリ（categories）

**概要**: 問題を分類するためのカテゴリマスタ

#### テーブル定義

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK, AUTO_INCREMENT | | |
| name | カテゴリ名 | varchar(100) | NOT NULL, UNIQUE | | |
| description | 説明 | text | NULL | | カテゴリの説明文 |
| created_at | 作成日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| updated_at | 更新日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |

**インデックス**

| インデックス名 | カラム | 種別 | 備考 |
| ------------ | ------ | ---- | ---- |
| idx_categories_name | name | UNIQUE | カテゴリ名検索用 |

---

### 問題（questions）

**概要**: 学習者に出題する問題マスタ

#### テーブル定義

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK, AUTO_INCREMENT | | |
| category_id | カテゴリID | bigint | FK, NOT NULL | | categories.id |
| title | タイトル | varchar(200) | NOT NULL | | 問題のタイトル |
| content | 本文 | text | NOT NULL | | 問題の本文 |
| difficulty | 難易度 | varchar(20) | NOT NULL | 'medium' | easy/medium/hard |
| created_at | 作成日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| updated_at | 更新日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |

**インデックス**

| インデックス名 | カラム | 種別 | 備考 |
| ------------ | ------ | ---- | ---- |
| idx_questions_category | category_id | INDEX | カテゴリ別検索用 |
| idx_questions_difficulty | difficulty | INDEX | 難易度別検索用 |
| idx_questions_title | title | INDEX | タイトル検索用 |

**外部キー制約**

| FK 名 | 参照元カラム | 参照先テーブル | 参照先カラム | ON DELETE | ON UPDATE |
| ----- | ---------- | -------------- | ------------ | -------- | -------- |
| fk_questions_category | category_id | categories | id | RESTRICT | CASCADE |

---

### 問題選択肢（question_options）

**概要**: 問題の選択肢（複数選択問題用）

#### テーブル定義

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK, AUTO_INCREMENT | | |
| question_id | 問題ID | bigint | FK, NOT NULL | | questions.id |
| content | 選択肢内容 | text | NOT NULL | | |
| is_correct | 正解フラグ | boolean | NOT NULL | false | |
| display_order | 表示順 | int | NOT NULL | 0 | |

**インデックス**

| インデックス名 | カラム | 種別 | 備考 |
| ------------ | ------ | ---- | ---- |
| idx_options_question | question_id | INDEX | 問題別選択肢取得用 |

**外部キー制約**

| FK 名 | 参照元カラム | 参照先テーブル | 参照先カラム | ON DELETE | ON UPDATE |
| ----- | ---------- | -------------- | ------------ | -------- | -------- |
| fk_options_question | question_id | questions | id | CASCADE | CASCADE |

---

### ユーザー（users）

**概要**: 問題を解く学習者の情報

#### テーブル定義

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK, AUTO_INCREMENT | | |
| name | 名前 | varchar(100) | NOT NULL | | |
| email | メールアドレス | varchar(255) | NOT NULL, UNIQUE | | |
| created_at | 作成日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| updated_at | 更新日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |

**インデックス**

| インデックス名 | カラム | 種別 | 備考 |
| ------------ | ------ | ---- | ---- |
| idx_users_email | email | UNIQUE | メールアドレス検索用 |
| idx_users_name | name | INDEX | 名前検索用 |

---

### 回答履歴（answers）

**概要**: ユーザーの回答履歴（将来の学習進捗機能用）

#### テーブル定義

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK, AUTO_INCREMENT | | |
| user_id | ユーザーID | bigint | FK, NOT NULL | | users.id |
| question_id | 問題ID | bigint | FK, NOT NULL | | questions.id |
| selected_option_id | 選択した選択肢ID | bigint | FK, NULL | | question_options.id |
| is_correct | 正解フラグ | boolean | NOT NULL | | |
| answered_at | 回答日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |

**インデックス**

| インデックス名 | カラム | 種別 | 備考 |
| ------------ | ------ | ---- | ---- |
| idx_answers_user | user_id | INDEX | ユーザー別回答取得用 |
| idx_answers_question | question_id | INDEX | 問題別回答取得用 |
| idx_answers_user_question | user_id, question_id | INDEX | ユーザー×問題の回答取得用 |

**外部キー制約**

| FK 名 | 参照元カラム | 参照先テーブル | 参照先カラム | ON DELETE | ON UPDATE |
| ----- | ---------- | -------------- | ------------ | -------- | -------- |
| fk_answers_user | user_id | users | id | CASCADE | CASCADE |
| fk_answers_question | question_id | questions | id | CASCADE | CASCADE |
| fk_answers_option | selected_option_id | question_options | id | SET NULL | CASCADE |

---

## 変更履歴

| 日付 | バージョン | 変更者 | 変更内容 |
| ---- | ---------- | ------ | -------- |
| 2024-12-23 | v1.0 | - | 初版作成 |
