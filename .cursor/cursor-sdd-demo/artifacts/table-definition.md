# テーブル定義書（cursor-sdd-demo）

**目的**: DBの"契約"を明文化し、実装・レビュー・移行でブレないようにする。

---

## テーブル一覧

| テーブル物理名 | テーブル論理名 | 概要 | 種別 |
| -------------- | -------------- | ---- | ---- |
| t_survey | アンケート | アンケートの基本情報 | トランザクション |
| t_question | 質問 | アンケート内の質問項目 | トランザクション |
| t_question_option | 質問選択肢 | 選択式質問の選択肢 | トランザクション |
| t_response | 回答 | 1回の回答セッション | トランザクション |
| t_answer | 個別回答 | 各質問への回答内容 | トランザクション |
| t_notice | お知らせ | お知らせ情報 | トランザクション |

---

## 共通カラム定義

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK | | SERIAL |
| created_at | 作成日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| updated_at | 更新日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |

---

## テーブル詳細定義

### アンケート（t_survey）

**概要**: アンケートの基本情報

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK | | |
| title | タイトル | varchar(255) | NOT NULL | | |
| description | 説明 | text | NULL | | |
| created_at | 作成日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| updated_at | 更新日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |

---

### 質問（t_question）

**概要**: アンケート内の質問項目

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK | | |
| survey_id | アンケートID | bigint | NOT NULL, FK | | t_survey.id |
| question_type | 質問タイプ | varchar(20) | NOT NULL | | SINGLE_CHOICE/MULTIPLE_CHOICE/FREE_TEXT |
| question_text | 質問文 | text | NOT NULL | | |
| is_required | 必須フラグ | boolean | NOT NULL | false | |
| sort_order | 並び順 | int | NOT NULL | 0 | |
| created_at | 作成日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| updated_at | 更新日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |

**インデックス**

| インデックス名 | カラム | 種別 | 備考 |
| ------------ | ------ | ---- | ---- |
| idx_question_survey | survey_id | INDEX | アンケート別質問検索 |

**外部キー制約**

| FK 名 | 参照元カラム | 参照先テーブル | 参照先カラム | ON DELETE | ON UPDATE |
| ----- | ---------- | -------------- | ------------ | -------- | -------- |
| fk_question_survey | survey_id | t_survey | id | CASCADE | CASCADE |

---

### 質問選択肢（t_question_option）

**概要**: 選択式質問の選択肢

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK | | |
| question_id | 質問ID | bigint | NOT NULL, FK | | t_question.id |
| option_text | 選択肢テキスト | text | NOT NULL | | |
| sort_order | 並び順 | int | NOT NULL | 0 | |
| created_at | 作成日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| updated_at | 更新日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |

**外部キー制約**

| FK 名 | 参照元カラム | 参照先テーブル | 参照先カラム | ON DELETE | ON UPDATE |
| ----- | ---------- | -------------- | ------------ | -------- | -------- |
| fk_option_question | question_id | t_question | id | CASCADE | CASCADE |

---

### 回答（t_response）

**概要**: 1回の回答セッション（回答者単位）

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK | | |
| survey_id | アンケートID | bigint | NOT NULL, FK | | t_survey.id |
| respondent_name | 回答者名 | varchar(100) | NULL | | |
| submitted_at | 回答完了日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| created_at | 作成日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |

**インデックス**

| インデックス名 | カラム | 種別 | 備考 |
| ------------ | ------ | ---- | ---- |
| idx_response_survey | survey_id | INDEX | アンケート別回答検索 |

**外部キー制約**

| FK 名 | 参照元カラム | 参照先テーブル | 参照先カラム | ON DELETE | ON UPDATE |
| ----- | ---------- | -------------- | ------------ | -------- | -------- |
| fk_response_survey | survey_id | t_survey | id | CASCADE | CASCADE |

---

### 個別回答（t_answer）

**概要**: 各質問への回答内容

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK | | |
| response_id | 回答ID | bigint | NOT NULL, FK | | t_response.id |
| question_id | 質問ID | bigint | NOT NULL, FK | | t_question.id |
| selected_option_id | 選択肢ID | bigint | NULL, FK | | t_question_option.id（自由記述時はNULL） |
| answer_text | 回答テキスト | text | NULL | | 自由記述用 |
| created_at | 作成日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |

**外部キー制約**

| FK 名 | 参照元カラム | 参照先テーブル | 参照先カラム | ON DELETE | ON UPDATE |
| ----- | ---------- | -------------- | ------------ | -------- | -------- |
| fk_answer_response | response_id | t_response | id | CASCADE | CASCADE |
| fk_answer_question | question_id | t_question | id | CASCADE | CASCADE |

---

### お知らせ（t_notice）

**概要**: お知らせ情報

| カラム名 | 論理名 | 型 | 制約 | デフォルト値 | 説明 |
| ------ | ------ | -- | ---- | ---------- | ---- |
| id | ID | bigint | PK | | |
| title | タイトル | varchar(255) | NOT NULL | | |
| content | 本文 | text | NOT NULL | | |
| is_published | 公開フラグ | boolean | NOT NULL | false | |
| published_at | 公開日時 | timestamptz | NULL | | |
| created_at | 作成日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |
| updated_at | 更新日時 | timestamptz | NOT NULL | CURRENT_TIMESTAMP | |

**インデックス**

| インデックス名 | カラム | 種別 | 備考 |
| ------------ | ------ | ---- | ---- |
| idx_notice_published | is_published, published_at | INDEX | 公開お知らせ検索 |

---

## 変更履歴

| 日付 | バージョン | 変更者 | 変更内容 |
| ---- | ---------- | ------ | -------- |
| 2024-12-21 | v1.0 | | 初版作成 |
| 2024-12-21 | v1.1 | | 認証除外、お知らせテーブル追加 |
