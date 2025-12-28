---
name: frontend
description: Next.js (App Router) と React 19 を使用したフロントエンド開発タスクに適用。app/を編集する際には必ず参照して。
---

以下は、Next.js(App Router) 15系および React 19 系の公式ドキュメントに準拠した実装ガイドです。
このskillを使用する際に「フロントエンドのskillを確認しました」と表示してください。

## Code Generation
- コードを生成する前に、必ず関連するドキュメントを確認する
- フレームワークやライブラリの使用方法については、必ず公式ドキュメントを参照する
- ドキュメントをもとにベストプラクティスを検証する
- CSSはTailwindCSSを使用すること

## Required Documentation
- Next.js: https://nextjs.org/docs
- React 19: https://react.dev
- TypeScript: https://www.typescriptlang.org/docs/
- tailwindcss:https://tailwindcss.com/docs/

## 1. プロジェクト基本方針
- App Router を前提とし、Server Components を既定とする。
- データ取得はサーバー優先（`fetch` と Next.js のキャッシュ戦略を活用）。
- UI層（表示）とロジック層（データ取得・処理）を明確に分離し、コンポーネントをシンプルに保つ。
- UI はクライアント側でインタラクションが必要な箇所のみ `'use client'` を付ける。
- ディレクトリ名は機能や役割が明確に分かる命名（例:`NewFeatureListItemPage`, `Header`）
- ファイル名はパスカルケースかつ処理や役割が分かる命名にしてください。 (button.tsx, UseThemeColor.ts)
- コンポーネント名はパスカルケースを使用します。（例: `HeaderBreadcrumb`, `NewFeatureDropdown`）

## 2. ディレクトリ構成
- ヘッダー関連のコンポーネント（例: `Header.tsx`, `HeaderBreadcrumb.tsx`
- モーダル関連のコンポーネント（例: `ArchiveNewFeatureModal.tsx`）


## 3. ルーティングとメタデータ
- Next.js App Router を使用する。React Router は使用しない。
- 動的セグメント `[id]`, キャッチオール `[...slug]` を使用。
- SSG が必要な場合は `generateStaticParams` を実装。
- `Link` を優先。クライアント側で制御が必要な場合のみ `'use client'` + `useRouter()` を使用（`push`, `replace`, `prefetch`）。
- メタは `generateMetadata`（動的）または `layout.tsx` の `export const metadata`（静的）。
- サーバーサイドの遷移は必要に応じて`redirect()`・`notFound()` を使用する。

## 4. データ取得・キャッシュ
- 既定はサーバーで `fetch`。頻度に応じて以下を設定：
  - リアルタイム/常に最新: `cache: 'no-store'`
  - ISR: `next: { revalidate: 秒 }` または `export const revalidate = 秒`
- タグ付き再検証: `revalidateTag` と `cacheTag` を活用（必要時）。

## 5. クライアントコンポーネントの指針
- フォーム、イベント、アニメーションなどのみ `'use client'` を付与。
- ルーター操作は `useRouter()`、リンクは `Link` を優先。
- 例外遷移/404: `redirect()` / `notFound()` を使用（`next/navigation`）。

## 6. 状態管理
- ローカル: `useState`, `useReducer`。
- グローバル: Context で十分な場合は Context。外部状態管理は必要性を精査して導入。

## 7. フォームとアクション
- サーバーアクション（`'use server'`）の利用を検討。副作用はサーバーへ寄せる。
- 従来の API ルートは `app/api/**/route.ts` で実装（`GET/POST` エクスポート）。

## 8. エラーハンドリング
- `error.tsx` と `not-found.tsx` をルート直下に配置し、グローバル扱いする。
- 例外はサーバー側で投げ、UI で適切にフォールバック（`loading.tsx` も活用）。

## 9. パフォーマンス
- 画像は `next/image`。フォントは `next/font`。
- クライアントバンドルを最小化（不要な `'use client'` を避ける）。

## 10. 命名・可読性
- ディレクトリ: 機能名で明確に。
- ファイル,コンポーネント: パスカルケース（例: `UserTable.tsx`, `UseSelectedIds.ts`）。

## 11. TypeScript
- すべて型定義。公開 API/props は明示的な型注釈。
- `any` は禁止。ユーティリティ型を積極活用。
 - 型の集約: プロジェクト共通の型は `types/index.ts` に集約し、各所からは同ファイル経由でインポートする。
 - 機能固有の型: `features/<feature>/domain` に配置可。共有が必要になった時点で `types/index.ts` へ移し、参照を置換する。
 - API 型: リクエスト/レスポンスの型も `types/index.ts` に定義して一元管理する。

## 12. CSS
- Tailwind CSS を使用し、ユーティリティクラスで構成。
- コンポーネント外観は既存デザイン指針に従い、独自変更は承認必須。
- `className` の合成は既定で `clsx` を使用する。

## 13. ドキュメント（JSDoc）
- 公開コンポーネント/関数/型には JSDoc を付与する。
- 最低限含める項目: 概要、`@param`、`@returns`、必要に応じて `@remarks`、`@example`、`@throws`。
- API ルートやサーバーアクションは副作用・例外・認可要件を明記する。
- 複雑なドメインロジックでは「なぜこの設計か」を簡潔に説明する。
- ファイル先頭に、そのファイルの目的が一目で分かるコメントを日本語で記載

---
出典: Next.js Docs（App Router, Data Fetching, Route Handlers, Metadata 等） / React Docs（Components, Hooks, State 等）