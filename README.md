# eureka - 共読・共学・共語の学習コミュニティプラットフォーム

## 概要

eurekaは「共読・共学・共語」をキーワードとした、次世代の学習支援プラットフォームです。学習者同士が疑問を共有し、多角的な視点から知識を深め合う場を提供します。

## 核となる3つの要素

### 1. 共読（ともに読む）
同じテーマについて、各自が異なる情報源（書籍、論文、記事、動画など）から学んだ内容を持ち寄ります。

### 2. 共学（ともに学ぶ）
年齢や専門性に関係なく、純粋に「疑問を投げかける人」と「それに答えたい人」が水平な関係で学び合います。

### 3. 共語（ともに語る）
学習プロセス自体を共有し、発見の喜びや理解の瞬間を分かち合います。

## 技術スタック

### フロントエンド
- React 18
- Vite
- TailwindCSS
- React Router
- Axios
- Lucide React (アイコン)

### バックエンド
- Node.js
- Express
- SQLite (開発用、本番環境ではPostgreSQL等を推奨)
- JWT (認証)
- bcryptjs (パスワードハッシュ化)

## プロジェクト構造

```
eureka/
├── client/                 # フロントエンドアプリケーション
│   ├── src/
│   │   ├── components/    # 再利用可能なコンポーネント
│   │   ├── pages/         # ページコンポーネント
│   │   ├── contexts/      # React Context (状態管理)
│   │   ├── utils/         # ユーティリティ関数
│   │   ├── App.jsx        # メインアプリケーション
│   │   └── main.jsx       # エントリーポイント
│   ├── public/
│   └── package.json
│
└── server/                 # バックエンドAPI
    ├── routes/            # APIルート
    ├── middleware/        # ミドルウェア
    ├── database.js        # データベース設定
    ├── index.js           # サーバーエントリーポイント
    └── package.json

```

## セットアップ方法

### 1. バックエンドのセットアップ

```bash
# サーバーディレクトリに移動
cd server

# 依存関係のインストール
npm install

# 環境変数の設定（.envファイルを編集）
# PORT=5000
# JWT_SECRET=your_secret_key

# サーバー起動
npm run dev
```

サーバーは http://localhost:5000 で起動します。

### 2. フロントエンドのセットアップ

```bash
# クライアントディレクトリに移動
cd client

# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev
```

フロントエンドは http://localhost:3000 で起動します。

## 主な機能

### 実装済み機能（v1.0）
- ✅ ユーザー認証（登録・ログイン）
- ✅ 質問投稿・閲覧機能
- ✅ 回答投稿機能
- ✅ 回答への投票機能
- ✅ ベストアンサー選択機能
- ✅ テーマ作成・閲覧機能
- ✅ テーマ詳細ページ（統計情報表示）
- ✅ テーマ別質問表示
- ✅ カテゴリー別フィルタリング
- ✅ 検索機能
- ✅ **コメント・ディスカッション機能（共語）**
- ✅ **ユーザープロフィールページ**
- ✅ コメントの編集・削除機能
- ✅ 情報源の共有機能

### 今後の実装予定
- ⏳ 学習進捗トラッキング
- ⏳ 通知システム
- ⏳ AI集合知システム（複数回答の統合と教材生成）
- ⏳ 学習教材生成機能（プレミアム）
- ⏳ リアルタイムチャット
- ⏳ リアクション機能（いいね、共感など）
- ⏳ プレミアム機能（動画・インフォグラフィック生成）
- ⏳ ポイント・バッジシステム
- ⏳ モバイルアプリ

## データベーススキーマ

### users
- ユーザー情報（ID, ユーザー名, メール, パスワード, プロフィール情報）

### themes
- 学習テーマ（ID, タイトル, 説明, カテゴリー）

### questions
- 質問（ID, テーマID, ユーザーID, タイトル, 内容, ステータス）

### answers
- 回答（ID, 質問ID, ユーザーID, 内容, 情報源, 選択フラグ, 投票数）

### learning_materials
- 学習教材（ID, 質問ID, タイトル, 内容, タイプ）

### comments
- コメント（ID, 親タイプ, 親ID, ユーザーID, 内容）

### user_progress
- ユーザー進捗（ID, ユーザーID, テーマID, 統計情報）

## API エンドポイント

### 認証
- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/login` - ログイン

### 質問
- `GET /api/questions` - 質問一覧取得
- `GET /api/questions/:id` - 質問詳細取得
- `POST /api/questions` - 質問投稿（要認証）
- `PUT /api/questions/:id` - 質問更新（要認証）

### 回答
- `POST /api/answers` - 回答投稿（要認証）
- `POST /api/answers/:id/select` - 回答選択（要認証）
- `POST /api/answers/:id/upvote` - 回答への投票（要認証）
- `PUT /api/answers/:id` - 回答更新（要認証）

### テーマ
- `GET /api/themes` - テーマ一覧取得
- `GET /api/themes/:id` - テーマ詳細取得
- `POST /api/themes` - テーマ作成（要認証）

### ユーザー
- `GET /api/users/:id` - ユーザープロフィール取得
- `GET /api/users/me/profile` - 現在のユーザー情報取得（要認証）

### コメント
- `GET /api/comments?parent_type=question&parent_id=xxx` - コメント一覧取得
- `POST /api/comments` - コメント投稿（要認証）
- `PUT /api/comments/:id` - コメント更新（要認証）
- `DELETE /api/comments/:id` - コメント削除（要認証）

### ヘルスチェック
- `GET /api/health` - APIの稼働状態確認

## 開発ガイドライン

### コーディング規約
- ES6+ の構文を使用
- 関数コンポーネントとHooksを優先
- TailwindCSSを使用したスタイリング
- 意味のある変数名・関数名を使用

### コミットメッセージ
- `feat:` 新機能
- `fix:` バグ修正
- `docs:` ドキュメント更新
- `style:` コードスタイルの変更
- `refactor:` リファクタリング
- `test:` テストの追加・修正

## ライセンス

MIT License

## お問い合わせ

プロジェクトに関する質問や提案がありましたら、Issueを作成してください。

---

**eureka** - 共に学び、共に成長する
