# 要件定義書 (Requirements Definition)

## 1. システム構成
**アーキテクチャ**: Chrome Extension (Manifest V3)
**開発言語**: HTML, CSS, JavaScript (Vanilla or simple framework)

## 2. 機能要件詳細

### 2.1. ポップアップ (Popup UI)
- **機能**: 拡張機能アイコンクリック時に表示。
- **構成要素**:
    - **プロンプト選択プルダウン**: 保存されたプロンプトテンプレートの一覧を表示。
    - **実行ボタン**: 選択したプロンプトで処理を開始。
    - **設定ボタン**: オプションページへ遷移。
    - **対象AI選択**: Gemini, ChatGPTなどを切り替え（初期はGemini固定でも可）。

### 2.2. バックグラウンド処理 (Background Service Worker)
- **機能**:
    - 現在のアクティブなタブのURLを取得。
    - 新しいタブの作成（AIサービスのURLを開く）。
    - ページ遷移の監視（必要に応じて）。

### 2.3. コンテンツスクリプト (Content Script)
- **機能**:
    - **ページ情報取得**: 現在のページの本文、メタデータ、字幕（YouTubeの場合）を取得する。
    - **AIページ操作**: Gemini等のページが開かれた後、プロンプト入力欄にテキストを挿入し、送信ボタンを押す（DOM操作）。
    - **リンク変換**: AIの回答に含まれるタイムスタンプを検出し、元のYouTube動画へのリンクに変換する（DOM監視）。

### 2.4. オプションページ (Options Page)
- **機能**: プロンプトテンプレートの管理。
- **構成要素**:
    - **プロンプトリスト**: 登録済みプロンプトの一覧。
    - **編集フォーム**:
        - タイトル
        - プロンプト本文（変数 `{{url}}`, `{{content}}` 等を使用可能）
        - 対象AIサービス（Gemini, ChatGPT, etc.）
    - **追加・削除・保存機能**: `chrome.storage.sync` を使用して設定を保存。

## 3. データ構造

### 3.1. プロンプトテンプレート (PromptTemplate)
```json
{
  "id": "uuid-v4",
  "title": "YouTube要約",
  "content": "以下の動画を要約してください。\nURL: {{url}}\n...",
  "targetAi": "gemini", // "gemini", "chatgpt", "claude"
  "usePageContent": false // trueならページ本文を取得して埋め込む
}
```

## 4. 外部インターフェース

### 4.1. AIサービス連携
- **Gemini**: `https://gemini.google.com/app`
- **ChatGPT**: `https://chat.openai.com/`
- **Claude**: `https://claude.ai/`

### 4.2. 変数展開
- `{{url}}`: 現在のタブのURL。
- `{{title}}`: ページのタイトル。
- `{{content}}`: ページ本文または抽出したテキスト。

## 5. UI/UX デザイン方針
- **シンプル**: 迷わず操作できること。
- **レスポンシブ**: ポップアップ内でも見やすく。
- **視認性**: ダークモード対応（Chromeの設定に準拠）。

## 6. セキュリティ・権限
- `activeTab`: 現在のタブへのアクセス。
- `storage`: 設定の保存。
- `scripting`: スクリプトの注入。
- `host_permissions`: 必要に応じてAIサービスのドメイン（`https://gemini.google.com/*` 等）。
