# Geminizer プロジェクト構造

## ディレクトリ構成

```
Geminizer/
├── manifest.json          # Chrome拡張機能のマニフェストファイル
├── README.md              # プロジェクト概要
├── CHANGELOG.md           # 変更履歴
├── PRIVACY_POLICY.md      # プライバシーポリシー
├── PUBLISHING_GUIDE.md    # 公開ガイド
├── STORE_LISTING.md       # ストア掲載情報
├── .gitignore             # Git除外ファイル
│
├── src/                   # ソースコード
│   ├── background.js      # バックグラウンドサービスワーカー
│   ├── ai_injector.js     # Geminiへのプロンプト注入スクリプト
│   ├── content_extractor.js  # ページコンテンツ抽出スクリプト
│   ├── full_page_capture.js  # フルページキャプチャ機能
│   ├── gemini_enhancer.js    # Gemini UI改善機能
│   ├── youtube_button_injector.js  # YouTubeボタン注入スクリプト
│   ├── constants.js       # 定数定義
│   ├── storage-utils.js   # ストレージユーティリティ
│   └── validation-utils.js  # バリデーションユーティリティ
│
├── ui/                    # ユーザーインターフェース
│   ├── popup.html         # ポップアップHTML
│   ├── popup.css          # ポップアップスタイル
│   ├── popup.js           # ポップアップロジック
│   ├── options.html       # 設定ページHTML
│   ├── options.css        # 設定ページスタイル
│   ├── options.js         # 設定ページロジック
│   └── help.html          # ヘルプページ
│
├── icons/                 # アイコン画像
│   ├── logo16.png         # 16x16 アイコン
│   ├── logo48.png         # 48x48 アイコン
│   └── logo128.png        # 128x128 アイコン
│
└── docs/                  # ドキュメント
    ├── PROJECT_STRUCTURE.md       # プロジェクト構造 (このファイル)
    ├── architecture.md            # アーキテクチャ設計
    ├── development_guidelines.md  # 開発ガイドライン
    ├── requirements.md            # 要件一覧
    ├── requirements_definition.md # 要件定義
    ├── requirements_doc.md        # 要件ドキュメント
    ├── requirements_specification.md  # 要件仕様
    ├── Require.md                 # 要件メモ
    ├── youtube_summary_prompt.md  # YouTube要約プロンプト
    ├── 技術判断_Gemini_UI改善機能統合.md  # 技術判断資料
    ├── 検証手順_Canvas自動アクティブ化.md  # 検証手順
    └── 機能比較_Geminizer_vs_Enhancer4Google.md  # 機能比較

```

## 主要コンポーネントの役割

### src/ ディレクトリ

#### background.js
- Chrome拡張機能のバックグラウンドサービスワーカー
- プロンプト実行の orchestration
- タブ管理、メッセージングハブ
- ストレージ管理のヘルパー機能

#### ai_injector.js
- Geminiページでプロンプトを自動注入
- モデル切り替え機能
- ツール（DeepResearch, Canvas, NanoBanana）のアクティベーション
- タイムスタンプリンク変換機能

#### content_extractor.js
- ウェブページからコンテンツを抽出
- YouTube字幕の取得
- ページメタデータの取得

#### full_page_capture.js
- ページ全体のスクリーンショットをキャプチャ
- スクロール機能と画像結合

#### gemini_enhancer.js
- Gemini UIの改善機能
- Enterキーでの送信
- ツールショートカット
- レイアウト幅調整

#### youtube_button_injector.js
- YouTubeページに要約ボタンを追加
- 動画情報の抽出
- キーボードショートカット対応

#### constants.js
- アプリケーション全体で使用する定数の定義
- バージョン、URL、タイムアウト値などの一元管理
- マジックナンバーの排除

#### storage-utils.js
- chrome.storageの操作ユーティリティ
- クォータエラーの自動処理
- 安全なストレージ操作のヘルパー関数

#### validation-utils.js
- プロンプト、URL、ショートカットキーなどのバリデーション
- エラーメッセージの生成
- 入力データのサニタイズ

### ui/ ディレクトリ

#### popup.html/css/js
- 拡張機能アイコンクリック時のポップアップUI
- プロンプト選択
- 実行モード選択（URL/Text/Capture）
- ステータス表示

#### options.html/css/js
- 拡張機能の設定ページ
- プロンプトの管理（追加/編集/削除）
- ショートカットキー設定
- Gemini UI改善機能の設定

#### help.html
- 使い方のヘルプページ
- 機能説明とチュートリアル

### docs/ ディレクトリ

開発関連のドキュメントが格納されています。
- アーキテクチャ設計
- 開発ガイドライン
- 要件定義
- 技術的な判断資料
- 検証手順

## データフロー

1. **ユーザー操作** → popup.html で操作
2. **メッセージ送信** → popup.js から background.js へ
3. **コンテンツ抽出** → background.js が content_extractor.js を注入
4. **プロンプト構築** → background.js でプロンプトを作成
5. **Gemini起動** → 新しいタブでGeminiを開く
6. **プロンプト注入** → ai_injector.js がプロンプトを入力

## ストレージ

Chrome Storage Sync API を使用：
- `prompts`: プロンプトテンプレートの配列
- `shortcuts`: プロンプトごとのショートカットキーマップ
- `lastUsedPrompt`: 最後に使用したプロンプトのインデックス
- `lastUsedMode`: 最後に使用したモード (url/text/capture)
- `geminiUIEnhancements`: Gemini UI改善機能の設定

## 開発とビルド

### 開発環境のセットアップ

1. リポジトリをクローン
2. Chrome拡張機能の開発者モードを有効化
3. `chrome://extensions/` で「パッケージ化されていない拡張機能を読み込む」
4. プロジェクトのルートディレクトリを選択

### ファイル変更後の更新

- background.js や manifest.json 変更時：拡張機能を再読み込み
- content_scripts 変更時：対象ページをリロード
- UI ファイル変更時：ポップアップを閉じて再度開く

## バージョン管理

- バージョン形式：MAJOR.MINOR.PATCH
- PATCH：バグ修正
- MINOR：新機能追加
- MAJOR：破壊的変更

現在のバージョン：1.0.0
