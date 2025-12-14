# 要件ドキュメント

## はじめに
本ドキュメントは、在庫管理システム（以下、Inventory Management System）の要件を定義する。目的は、商品・拠点ごとの在庫を正確に把握し、入出庫/移動/調整/棚卸の業務を一貫したルールで記録できるようにすることである。要件は「何をするか（WHAT）」に限定し、実装方法（HOW）は含めない。

## 要件

### 要件 1: マスタ管理（商品・拠点・保管場所）
**目的:** 管理者として、商品と保管場所（拠点/倉庫/ロケーション）のマスタを管理したい。それにより在庫記録の一貫性を確保できる。

#### 受け入れ基準
1. When 管理者が商品マスタを新規登録, the Inventory Management System shall 商品コードの一意性を検証してから登録を確定する
2. If 商品コードが既に存在する, the Inventory Management System shall 登録を拒否し重複理由を表示する
3. When 管理者が拠点/倉庫/ロケーションを登録または更新, the Inventory Management System shall 参照整合性（親子関係・所属関係）を検証する
4. If 商品またはロケーションが他の記録から参照されている状態で削除が要求された, the Inventory Management System shall 削除を拒否するか無効化（使用不可）として扱えるようにする
5. The Inventory Management System shall すべての在庫トランザクションで商品とロケーションの参照が必須である

### 要件 2: 在庫トランザクション（入庫・出庫・移動・調整）
**目的:** 倉庫担当者として、在庫の変動をトランザクションとして記録したい。それにより在庫残高と履歴を追跡できる。

#### 受け入れ基準
1. When 倉庫担当者が入庫を登録, the Inventory Management System shall 対象商品・ロケーション・数量・日時・理由（任意または必須）を記録する
2. When 倉庫担当者が出庫を登録, the Inventory Management System shall 対象商品・ロケーション・数量・日時・理由を記録する
3. When 倉庫担当者がロケーション間移動を登録, the Inventory Management System shall 同一トランザクションとして移動元の減算と移動先の加算を記録する
4. If 数量が0以下または不正な形式で入力された, the Inventory Management System shall 登録を拒否し入力エラーを表示する
5. When 倉庫担当者が調整（増減）を登録, the Inventory Management System shall 調整理由の入力を必須とする

### 要件 3: 在庫残高の算出と参照
**目的:** 現場担当者として、現在庫（オンハンド）を素早く確認したい。それにより欠品や過剰在庫を抑制できる。

#### 受け入れ基準
1. When ユーザーが在庫照会（商品×ロケーション）を要求, the Inventory Management System shall 最新の確定トランザクションに基づく残高を表示する
2. While 参照対象が同一（商品・ロケーション・期間など）である, the Inventory Management System shall 同じ条件で同じ結果（決定的な計算結果）を返す
3. When ユーザーが検索条件（商品、拠点、ロケーション、在庫有無など）を指定, the Inventory Management System shall 条件に一致する在庫一覧を返す
4. If 在庫が存在しない（残高0）場合, the Inventory Management System shall 0として表示し「未登録」と区別できるようにする
5. The Inventory Management System shall 在庫残高の根拠として関連トランザクションを参照できるようにする

### 要件 4: 引当（予約）と出庫可能数
**目的:** 出荷担当者として、注文に対して在庫を引き当てたい。それにより二重出庫や取り置き漏れを防げる。

#### 受け入れ基準
1. When ユーザーが引当を作成, the Inventory Management System shall 引当数量と対象（商品・ロケーション・任意の参照番号）を記録する
2. If 引当数量が利用可能数量を超える, the Inventory Management System shall 引当作成を拒否する
3. When 引当が存在する状態で在庫照会が要求された, the Inventory Management System shall オンハンド数量と引当数量と出庫可能数量（オンハンド−引当）を表示する
4. When ユーザーが引当を解除, the Inventory Management System shall 出庫可能数量に反映する
5. The Inventory Management System shall 引当の作成/変更/解除の履歴を監査可能な形で保持する

### 要件 5: 棚卸（実地在庫）
**目的:** 棚卸担当者として、実地数量を登録して差異を確定したい。それにより帳簿在庫を現物に合わせられる。

#### 受け入れ基準
1. When 棚卸担当者が棚卸を開始, the Inventory Management System shall 対象範囲（拠点/ロケーション/商品など）と開始日時を記録する
2. While 棚卸が未確定である, the Inventory Management System shall 棚卸入力（実地数量）を追加/更新できる
3. When 棚卸担当者が棚卸を確定, the Inventory Management System shall 帳簿数量と実地数量の差異を計算し差異調整を記録する
4. If 棚卸対象に未入力項目が残っている状態で確定が要求された, the Inventory Management System shall 未入力の扱い（0扱い/確定不可など）を明示し、選択に基づいて処理する
5. The Inventory Management System shall 棚卸の結果（差異、確定者、確定日時）を参照できるようにする

### 要件 6: 監査ログ（操作履歴）
**目的:** 管理者として、誰がいつ何を変えたか追跡したい。それにより不正や誤操作の原因究明ができる。

#### 受け入れ基準
1. The Inventory Management System shall マスタ操作（作成/更新/無効化/削除）を監査ログとして記録する
2. The Inventory Management System shall 在庫トランザクション（入庫/出庫/移動/調整/棚卸確定）を監査ログとして記録する
3. When 管理者が監査ログを検索, the Inventory Management System shall 期間・ユーザー・操作種別・対象で絞り込みできる
4. If 権限のないユーザーが監査ログ参照を要求した, the Inventory Management System shall アクセスを拒否する
5. The Inventory Management System shall 監査ログは改ざん検知または改ざん困難な形で保持する

### 要件 7: 権限とアクセス制御
**目的:** 管理者として、役割ごとに操作権限を制御したい。それにより誤操作と情報漏えいを抑制できる。

#### 受け入れ基準
1. The Inventory Management System shall ユーザーに役割（ロール）を割り当てられる
2. When ユーザーがマスタ管理を実行, the Inventory Management System shall 必要な権限がある場合のみ許可する
3. When ユーザーが在庫トランザクション登録を実行, the Inventory Management System shall 必要な権限がある場合のみ許可する
4. If 権限が不足している, the Inventory Management System shall 操作を拒否し理由を表示する
5. Where シングルサインオン機能が含まれる, the Inventory Management System shall 外部認証によるログインを許可する

### 要件 8: 例外処理・整合性・運用要件（非機能含む）
**目的:** 運用担当者として、データの整合性と継続運用を担保したい。それにより業務停止やデータ不整合を最小化できる。

#### 受け入れ基準
1. If 同一対象（同一商品・ロケーション）に対して同時に更新が発生した, the Inventory Management System shall 競合を検知し一貫した結果（片方の拒否または順序保証）を提供する
2. If 出庫または移動元減算により残高が負になる, the Inventory Management System shall 許可/禁止を設定でき、禁止設定時は登録を拒否する
3. When ユーザーが誤った入力や参照できない対象を指定, the Inventory Management System shall 失敗理由を特定可能なエラーとして返す
4. The Inventory Management System shall 重要データ（マスタ、在庫トランザクション、棚卸、監査ログ）をバックアップと復元の対象とする
5. The Inventory Management System shall 監査ログと在庫トランザクションを根拠に、ある時点の在庫状態を再現可能である
