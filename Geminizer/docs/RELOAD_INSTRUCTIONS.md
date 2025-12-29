# 拡張機能の再読み込み手順 (Extension Reload Instructions)

## 修正内容 (What Was Fixed)

### 1. 新しいプロンプトの追加 (New Prompts Added)
- ✅ 文系新卒1年目向け詳細解説
- ✅ DeepResearch業界分析
- ✅ 詳細記事録作成

### 2. NanoBananaプロンプトの修正 (NanoBanana Prompt Fixed)
- ✅ 画像生成を明示的に指示するようにプロンプトを変更
- ✅ コードではなく画像が生成されるように改善

### 3. アイコン表示の修正 (Icon Display Fixed)
- ✅ popup.htmlのアイコンパスを修正 (`../icons/logo48.png`)

### 4. ファイル構造の整理 (File Structure Reorganized)
- ✅ JavaScriptファイルを `src/` ディレクトリに移動
- ✅ UIファイルを `ui/` ディレクトリに移動
- ✅ ドキュメントを `docs/` ディレクトリに移動

## 拡張機能の再読み込み方法 (How to Reload the Extension)

ファイル構造を変更したため、Chrome拡張機能を再読み込みする必要があります。

### ステップ 1: 拡張機能ページを開く
1. Chromeで `chrome://extensions/` を開く
2. または、右上のメニュー → 「拡張機能」→「拡張機能を管理」

### ステップ 2: 開発者モードを有効にする
- 右上の「開発者モード」トグルをONにする

### ステップ 3: 拡張機能を再読み込み
- Geminizerの拡張機能カードにある **更新ボタン（↻）** をクリック
- または、拡張機能を一度削除して再度読み込む:
  1. 「削除」をクリック
  2. 「パッケージ化されていない拡張機能を読み込む」をクリック
  3. Geminizerのフォルダを選択

### ステップ 4: YouTubeページを再読み込み
- すでに開いているYouTubeタブがある場合は、**必ず再読み込み（F5）** してください
- 新しいタブでYouTubeを開いて確認してください

## 確認事項 (What to Test)

### 1. YouTubeの要約ボタン
- [ ] YouTube動画ページ右上に「要約」ボタンが表示される
- [ ] ボタンをクリックして要約が実行できる
- [ ] YouTubeのサムネイル（検索結果、おすすめ動画）にも「要約」ボタンが表示される

### 2. 新しいプロンプト
- [ ] ポップアップで3つの新しいプロンプトが選択できる
- [ ] オプションページでも3つの新しいプロンプトが表示される

### 3. アイコン表示
- [ ] ポップアップでロゴが正しく表示される
- [ ] 拡張機能のアイコンが正しく表示される

### 4. NanoBanana機能
- [ ] NanoBananaプロンプトを使用すると画像が生成される
- [ ] コードやテキストではなく、実際の図解画像が表示される

## トラブルシューティング (Troubleshooting)

### YouTubeボタンが表示されない場合
1. 拡張機能を再読み込みしたか確認
2. YouTubeページを完全に再読み込み（Ctrl+Shift+R / Cmd+Shift+R）
3. ブラウザコンソール（F12）でエラーをチェック
4. 拡張機能のエラーログを確認（chrome://extensions/ → 詳細 → エラー）

### 新しいプロンプトが表示されない場合
1. 拡張機能を再読み込み
2. ブラウザを完全に再起動
3. 拡張機能のストレージをクリア（オプションページでプロンプトをリセット）

### アイコンが表示されない場合
1. `icons/` フォルダに以下のファイルが存在するか確認:
   - logo16.png
   - logo48.png
   - logo128.png
2. 拡張機能を再読み込み
3. ブラウザのキャッシュをクリア

## ファイル構造 (File Structure)

```
Geminizer/
├── manifest.json
├── icons/
│   ├── logo16.png
│   ├── logo48.png
│   └── logo128.png
├── src/
│   ├── background.js
│   ├── youtube_button_injector.js
│   ├── gemini_enhancer.js
│   ├── ai_injector.js
│   ├── content_extractor.js
│   ├── full_page_capture.js
│   └── default-prompts.js
├── ui/
│   ├── popup.html
│   ├── popup.js
│   ├── popup.css
│   ├── options.html
│   ├── options.js
│   └── options.css
└── docs/
    ├── PROJECT_STRUCTURE.md
    ├── QUICK_START.md
    └── RELOAD_INSTRUCTIONS.md
```

## サポート (Support)

問題が解決しない場合は、以下を確認してください:
1. Chrome バージョン (chrome://version/)
2. 拡張機能のバージョン (1.0.0)
3. エラーメッセージやコンソールログ

---

**重要**: ファイル構造を変更した場合は、必ず拡張機能を再読み込みしてください。
