# 調査 & 設計決定テンプレート

---
**目的**: 技術設計に情報を提供する発見結果、アーキテクチャ調査、および根拠を記録する。
---

## 概要
- **機能**: cursor-sdd-demo（問題演習用管理画面）
- **発見スコープ**: シンプルな追加（CRUD管理画面）
- **主な発見事項**:
  - Next.js 16.1.1 + React 19.2.3 + Tailwind CSS 4 の既存スタックで十分
  - 追加パッケージ不要（既存構成で要件を満たせる）
  - Server Components + Server Actions パターンを活用

## 調査ログ

### 既存技術スタックの確認
- **コンテキスト**: package.json から現在の依存関係を把握
- **参照したソース**: `/package.json`
- **発見事項**:
  - Next.js 16.1.1（App Router）
  - React 19.2.3
  - Tailwind CSS 4
  - Biome 2.2.0（リンター/フォーマッター）
  - TypeScript 5系
- **影響**: 新規パッケージの追加不要。フォーム処理も Server Actions で対応可能。

### データ永続化の検討
- **コンテキスト**: 問題・ユーザー・カテゴリのCRUD操作に必要なDB選定
- **発見事項**:
  - MVP段階ではローカルファイルDB（SQLite）またはPostgreSQLを想定
  - Prisma ORMの導入を推奨（型安全性、マイグレーション管理）
- **影響**: `prisma` パッケージの追加を推奨

## アーキテクチャパターン評価

| オプション | 説明 | 強み | リスク / 制限 | 備考 |
|----------|------|------|--------------|------|
| Server Components + Server Actions | Next.js App Router標準パターン | シンプル、型安全、SSR最適化 | 複雑なリアルタイム処理には不向き | 採用 |
| tRPC | 型安全なAPI層 | E2E型安全性 | 学習コスト、設定オーバーヘッド | 不採用（過剰） |
| REST API + React Query | 従来型API + キャッシュ | 汎用性高 | ボイラープレート多い | 不採用 |

## 設計決定

### 決定: Server Actions によるデータ操作
- **コンテキスト**: CRUD操作のAPI設計
- **検討した代替案**:
  1. Route Handlers（API Routes）— REST APIパターン
  2. Server Actions — フォーム送信を直接サーバー処理
- **選択したアプローチ**: Server Actions
- **根拠**: 
  - Next.js 14+ の推奨パターン
  - フォームバリデーションとの統合が容易
  - 型安全性が高い
  - ボイラープレートが少ない
- **トレードオフ**: API再利用性は低下（外部クライアントからの呼び出し不可）
- **フォローアップ**: 将来的にモバイルアプリ等が必要になったら Route Handlers を追加

### 決定: Prisma ORM の採用
- **コンテキスト**: データベースアクセス層の選定
- **検討した代替案**:
  1. Prisma ORM — 型安全、マイグレーション管理
  2. Drizzle ORM — 軽量、SQL志向
  3. 直接SQLクエリ — 最小限の抽象化
- **選択したアプローチ**: Prisma ORM
- **根拠**:
  - TypeScript統合が優秀
  - スキーマ駆動開発との相性良好
  - マイグレーション管理が容易
- **トレードオフ**: バンドルサイズ増加、初期セットアップが必要

## リスク & 軽減策
- パフォーマンス（大量データ） — ページネーション必須、インデックス設計
- データ整合性（カテゴリ削除時） — 外部キー制約で保護

## 参考文献
- [Next.js App Router Docs](https://nextjs.org/docs) — Server Components, Server Actions
- [Prisma Docs](https://www.prisma.io/docs) — スキーマ定義、クエリ
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs) — スタイリング

---

## 変更履歴

| 日付 | バージョン | 変更者 | 変更内容 |
| ---- | ---------- | ------ | -------- |
| 2024-12-23 | v1.0 | - | 初版作成 |
