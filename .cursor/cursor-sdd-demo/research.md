# 調査 & 設計決定

---
**目的**: 技術設計に情報を提供する発見結果、アーキテクチャ調査、および根拠を記録する。

**使い方**:
- 発見フェーズ中に調査活動と結果を記録。
- `design.md`には詳細すぎる設計決定のトレードオフを文書化。
- 将来の監査や再利用のための参照と証拠を提供。
---

## 概要
- **機能**: `cursor-sdd-demo`
- **発見スコープ**: 新機能（グリーンフィールド）
- **主な発見事項**:
  - Next.js 16 App Routerのベストプラクティスを適用（Server Components優先、効率的なデータ取得）
  - PostgreSQLによる在庫管理の正規化されたスキーマ設計（3NF、適切なインデックス戦略）
  - NextAuth.jsによる認証・セッション管理（Server ComponentsとClient Componentsの両方をサポート）

## 調査ログ

### Next.js 16 App Routerのベストプラクティス
- **コンテキスト**: 在庫管理システムのフロントエンド設計において、Next.js 16の最新機能を活用する必要がある
- **参照したソース**: 
  - Next.js 16公式ドキュメント
  - dharmsy.com - Next.js 16 Best Practices
  - buttercups.tech - Next.js App Router Guide
- **発見事項**:
  - React Server Components (RSC) をデフォルトで使用し、クライアントサイドJavaScriptを削減
  - インタラクティブな要素（フォーム、モーダル）のみClient Componentsを使用
  - App Routerのフォルダ構造で機能別に整理（タイプ別ではなく）
  - Route Handlersを`/app/api/`ディレクトリに配置し、エッジ互換性とストリーミングを活用
  - `"use cache"`ディレクティブでキャッシング戦略を最適化
- **影響**: 
  - コンポーネント設計はServer Components優先とし、`'use client'`は最小限に
  - ルーティング構造は`/app/inventory`, `/app/receipts`, `/app/shipments`などの機能別に整理
  - APIエンドポイントはRoute Handlersで実装

### PostgreSQL在庫管理スキーマ設計
- **コンテキスト**: 在庫管理システムのデータモデル設計において、データ整合性とパフォーマンスを両立する必要がある
- **参照したソース**:
  - PostgreSQL公式ドキュメント
  - reintech.io - PostgreSQL Schema Design Best Practices
  - zigpoll.com - Database Optimization for Inventory Management
- **発見事項**:
  - 第3正規形(3NF)を目指し、データ冗長性を削減
  - 一貫した命名規則（小文字+アンダースコア、例: `m_products`, `t_receipts`）
  - 適切なデータ型選択（INTEGER、DECIMAL、VARCHAR(n)）
  - 複合インデックスの活用（例: `(product_id, created_at)`で在庫履歴を高速検索）
  - 楽観的ロック（バージョンカウンター）で在庫の過剰販売を防止
  - マテリアライズドビューで集計レポートを高速化
- **影響**:
  - マスタテーブル（m_products, m_users, m_locations）とトランザクションテーブル（t_receipts, t_shipments, t_transfers）を分離
  - 在庫残高テーブル（t_inventory_balance）で現在在庫を管理し、履歴テーブルで監査証跡を保持
  - lock_noカラムで楽観的ロックを実装

### React 19とNextAuth.jsによる認証・セッション管理
- **コンテキスト**: ユーザー認証とアクセス制御を実装する必要がある
- **参照したソース**:
  - NextAuth.js公式ドキュメント
  - next-auth.js.org - Configuration for Next.js
  - dev.to - Next.js 15 Authentication
- **発見事項**:
  - NextAuth.jsはNext.jsに最適化された認証ライブラリ
  - Server Componentsでは`getServerSession`を使用してセッションを取得
  - Client Componentsでは`useSession`フックと`SessionProvider`を使用
  - Server Actionsで認証ロジックを処理可能
  - カスタムプロバイダー（Credentials Provider）でユーザーID/パスワード認証を実装
- **影響**:
  - NextAuth.jsを採用し、`/api/auth/[...nextauth]/route.ts`で設定
  - Server Componentsでセッションチェックを実施し、未認証時はログインページへリダイレクト
  - ミドルウェアでルート保護を実装
  - ユーザーロール（admin, operator, viewer）に基づくアクセス制御

## アーキテクチャパターン評価

| オプション | 説明 | 強み | リスク / 制限 | 備考 |
|----------|------|------|--------------|------|
| レイヤードアーキテクチャ | プレゼンテーション層、ビジネスロジック層、データアクセス層の3層構造 | シンプルで理解しやすい、Next.jsの構造に適合 | 層間の依存が強くなる可能性 | 推奨：MVPに適した構造 |
| ヘキサゴナル | コアドメイン周りのポート & アダプター抽象化 | 明確な境界、テスト可能なコア | アダプターレイヤーの構築が必要、初期開発コスト高 | 却下：MVPには過剰 |
| Server Actions中心 | Next.jsのServer Actionsでビジネスロジックを実装 | サーバー側で完結、型安全、シンプル | 複雑なロジックの管理が難しい | 部分採用：フォーム送信に活用 |

## 設計決定

### 決定: データベースとしてPostgreSQLを採用
- **コンテキスト**: 在庫管理システムのデータ永続化層を選定する必要がある
- **検討した代替案**:
  1. PostgreSQL — リレーショナルDB、ACID保証、豊富な機能
  2. MySQL — リレーショナルDB、広く使用されている
  3. MongoDB — ドキュメントDB、スキーマレス
- **選択したアプローチ**: PostgreSQL
- **根拠**: 
  - トランザクション整合性が重要（在庫の入出庫は厳密な整合性が必要）
  - 複雑なクエリと集計をサポート
  - JSON型でフレキシブルなデータも扱える
  - 成熟したエコシステムとツール
- **トレードオフ**: 
  - メリット: データ整合性、複雑なクエリ、スケーラビリティ
  - 妥協点: NoSQLと比較して柔軟性は低い（ただし在庫管理には不要）
- **フォローアップ**: 実装時にインデックス戦略を検証し、パフォーマンステストを実施

### 決定: Next.js App RouterとServer Componentsを中心としたアーキテクチャ
- **コンテキスト**: フロントエンドのアーキテクチャパターンを決定する必要がある
- **検討した代替案**:
  1. Server Components中心 — サーバーサイドレンダリング優先
  2. Client Components中心 — クライアントサイドレンダリング優先（従来のSPA）
  3. ハイブリッド — 適材適所で使い分け
- **選択したアプローチ**: Server Components中心のハイブリッド
- **根拠**:
  - Next.js 16のベストプラクティスに準拠
  - 初期ロード時間の短縮とSEO向上
  - クライアントサイドJavaScriptの削減
  - インタラクティブな部分のみClient Componentsを使用
- **トレードオフ**:
  - メリット: パフォーマンス、SEO、保守性
  - 妥協点: Server/Client境界の設計が必要
- **フォローアップ**: コンポーネント設計時に境界を明確に定義

### 決定: NextAuth.jsによる認証実装
- **コンテキスト**: ユーザー認証とセッション管理の実装方法を決定する必要がある
- **検討した代替案**:
  1. NextAuth.js — Next.js専用の認証ライブラリ
  2. 自前実装 — JWT + Cookieで独自実装
  3. Auth0 — サードパーティ認証サービス
- **選択したアプローチ**: NextAuth.js
- **根拠**:
  - Next.jsとの統合が容易
  - Server ComponentsとClient Componentsの両方をサポート
  - セッション管理が組み込まれている
  - 拡張性が高い（将来的にOAuthプロバイダーも追加可能）
- **トレードオフ**:
  - メリット: 開発速度、保守性、セキュリティ
  - 妥協点: ライブラリへの依存
- **フォローアップ**: カスタムCredentials Providerの実装とセキュリティテスト

### 決定: 楽観的ロックによる在庫競合制御
- **コンテキスト**: 同時アクセス時の在庫数の整合性を保つ必要がある
- **検討した代替案**:
  1. 楽観的ロック — バージョン番号で競合検出
  2. 悲観的ロック — トランザクション中に行ロック
  3. ロックなし — 最後の更新が勝つ
- **選択したアプローチ**: 楽観的ロック（lock_noカラム）
- **根拠**:
  - 在庫管理では競合は比較的少ない
  - 読み取りパフォーマンスを優先
  - デッドロックのリスクを回避
- **トレードオフ**:
  - メリット: パフォーマンス、デッドロック回避
  - 妥協点: 競合時にリトライが必要
- **フォローアップ**: 競合発生時のエラーハンドリングとユーザーフィードバック

## リスク & 軽減策
- **リスク1: 在庫数の不整合** — 楽観的ロックとトランザクション管理で軽減。定期的な在庫集計バッチで整合性チェック
- **リスク2: パフォーマンスボトルネック** — 適切なインデックス設計とマテリアライズドビューで軽減。必要に応じてキャッシング戦略を追加
- **リスク3: セキュリティ脆弱性** — NextAuth.jsのベストプラクティスに従い、ミドルウェアでルート保護。すべての操作ログを記録
- **リスク4: データ移行の複雑さ** — 初期はシンプルなスキーマから開始。段階的に機能を追加し、マイグレーション戦略を明確化

## 参考文献
- [Next.js 16 Documentation](https://nextjs.org/docs) — 公式ドキュメント
- [NextAuth.js Documentation](https://next-auth.js.org/) — 認証ライブラリの公式ガイド
- [PostgreSQL Documentation](https://www.postgresql.org/docs/) — データベース設計リファレンス
- [React 19 Documentation](https://react.dev/) — React 19の新機能とベストプラクティス

---

## 変更履歴

| 日付 | バージョン | 変更者 | 変更内容 |
| ---- | ---------- | ------ | -------- |
| 2025-12-15 | v1.0 |  | 初版作成 |
