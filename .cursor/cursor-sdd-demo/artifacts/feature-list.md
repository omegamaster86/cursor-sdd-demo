# 機能一覧（cursor-sdd-demo）

**目的**: プロダクトのスコープ（MVP/Phase）と、UI/API/バッチの一覧を"合意の一次ソース"として固定する。
**作成/更新タイミング**: `/requirements` の直後（要件ドラフトが出たらまず作る）。

---

## 画面機能

| 機能 ID | 画面名 | 説明 | 優先度 | Phase | 記載者 |
| ------- | ------ | ---- | ------ | ----- | ------ |
| UI-001  | 問題一覧 | 登録済み問題を一覧表示。検索・フィルタ・ページネーションを提供。 | High | MVP | |
| UI-002  | 問題作成 | 新規問題を作成するフォーム画面。カテゴリ・難易度を選択可能。 | High | MVP | |
| UI-003  | 問題編集 | 既存問題を編集するフォーム画面。カテゴリ・難易度を変更可能。 | High | MVP | |
| UI-004  | ユーザー一覧 | 登録済みユーザー（学習者）を一覧表示。検索・ページネーションを提供。 | High | MVP | |
| UI-005  | ユーザー登録 | 新規ユーザーを登録するフォーム画面。 | High | MVP | |
| UI-006  | ユーザー編集 | 既存ユーザーを編集するフォーム画面。 | High | MVP | |
| UI-007  | カテゴリ一覧 | 問題カテゴリを一覧表示。作成・編集・削除を提供。 | High | MVP | |
| UI-008  | カテゴリ作成・編集 | カテゴリを作成・編集するフォーム（モーダル or インライン）。 | High | MVP | |

---

## API 機能

| 機能 ID | API 名 | エンドポイント | メソッド | 説明 | レベル | 実装方法 | 優先度 | Phase | 記載者 |
| ------- | ------ | -------------- | -------- | ---- | ------ | -------- | ------ | ----- | ------ |
| API-001 | 問題一覧取得 | /api/questions | GET | 問題一覧を取得する。検索・フィルタ・ページネーション対応。 | B | Server API | High | MVP | |
| API-002 | 問題詳細取得 | /api/questions/:id | GET | 指定IDの問題詳細を取得する。 | C | Server API | High | MVP | |
| API-003 | 問題作成 | /api/questions | POST | 新規問題を作成する。カテゴリ・難易度を含む。 | C | Server API | High | MVP | |
| API-004 | 問題更新 | /api/questions/:id | PUT | 指定IDの問題を更新する。 | C | Server API | High | MVP | |
| API-005 | 問題削除 | /api/questions/:id | DELETE | 指定IDの問題を削除する。 | C | Server API | High | MVP | |
| API-006 | ユーザー一覧取得 | /api/users | GET | ユーザー一覧を取得する。ページネーション対応。 | C | Server API | High | MVP | |
| API-007 | ユーザー詳細取得 | /api/users/:id | GET | 指定IDのユーザー詳細を取得する。 | C | Server API | High | MVP | |
| API-008 | ユーザー登録 | /api/users | POST | 新規ユーザーを登録する。 | C | Server API | High | MVP | |
| API-009 | ユーザー更新 | /api/users/:id | PUT | 指定IDのユーザーを更新する。 | C | Server API | High | MVP | |
| API-010 | ユーザー削除 | /api/users/:id | DELETE | 指定IDのユーザーを削除する。 | C | Server API | High | MVP | |
| API-011 | カテゴリ一覧取得 | /api/categories | GET | カテゴリ一覧を取得する。 | C | Server API | High | MVP | |
| API-012 | カテゴリ作成 | /api/categories | POST | 新規カテゴリを作成する。 | C | Server API | High | MVP | |
| API-013 | カテゴリ更新 | /api/categories/:id | PUT | 指定IDのカテゴリを更新する。 | C | Server API | High | MVP | |
| API-014 | カテゴリ削除 | /api/categories/:id | DELETE | 指定IDのカテゴリを削除する。紐づく問題があれば拒否。 | C | Server API | High | MVP | |

---

## バッチ機能

| 機能 ID | バッチ名 | 実行タイミング | 説明 | 優先度 | Phase | 記載者 |
| ------- | -------- | -------------- | ---- | ------ | ----- | ------ |
| （なし） | - | - | MVP段階ではバッチ機能なし | - | - | |

---

## 変更履歴

| 日付 | バージョン | 変更者 | 変更内容 |
| ---- | ---------- | ------ | -------- |
| 2024/12/23 | v1.0 | - | 初版作成 |
| 2024/12/23 | v1.1 | - | カテゴリ管理・検索フィルタ機能を追加 |
